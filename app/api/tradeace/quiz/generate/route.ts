export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { getFileUrl } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check subscription
    let isSubscribed = user.tradeAceSubscribed;
    if (isSubscribed && user.tradeAceSubExpiresAt) {
      if (new Date(user.tradeAceSubExpiresAt) < new Date()) {
        isSubscribed = false;
        await prisma.user.update({
          where: { id: user.id },
          data: { tradeAceSubscribed: false },
        });
      }
    }

    if (!isSubscribed && user.role !== "admin") {
      return NextResponse.json({ error: "Subscription required" }, { status: 402 });
    }

    const body = await request.json();
    const { manualId, trade } = body;

    if (!trade) {
      return NextResponse.json({ error: "Trade is required" }, { status: 400 });
    }

    const apiKey = process.env.ABACUSAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API not configured" }, { status: 500 });
    }

    // Build context based on manual or general trade knowledge
    let manualContext = "";
    if (manualId) {
      const manual = await prisma.tradeAceManual.findUnique({
        where: { id: manualId },
      });

      if (manual?.cloudStoragePath) {
        // For now, we'll use general knowledge as PDF parsing requires additional setup
        // The manual reference is stored for future enhancement
        manualContext = `The user has uploaded a manual titled "${manual.title || manual.fileName}" for ${manual.trade} certification. Generate questions that would be relevant to this type of technical manual.`;
      }
    }

    const tradeDescriptions: Record<string, string> = {
      electrician: "Electrician certification exams covering the National Electrical Code (NEC), electrical theory, wiring methods, grounding, overcurrent protection, motor controls, and workplace safety",
      plumber: "Plumber certification exams covering plumbing codes, drainage systems, water supply systems, fixture installation, gas piping, backflow prevention, and safety regulations",
      hvac: "HVAC certification exams covering refrigeration cycles, heating systems, air conditioning, ventilation, EPA regulations, electrical controls, and system troubleshooting",
    };

    const systemPrompt = `You are an expert vocational exam question writer for blue-collar trade certifications. Generate 10 realistic, scenario-based multiple-choice practice questions for ${tradeDescriptions[trade] || trade + " certification exams"}.

${manualContext}

Each question should:
1. Present a realistic on-the-job scenario that a professional might encounter
2. Test practical knowledge and code compliance
3. Have exactly 4 answer options (A, B, C, D)
4. Have only one correct answer
5. Include a brief explanation of why the correct answer is right

Return a JSON array with exactly 10 questions in this format:
[
  {
    "id": 1,
    "scenario": "Brief scenario description setting up the situation",
    "question": "The actual question being asked",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation of why this answer is correct"
  }
]

Make questions progressively harder - start with fundamental concepts and build to more complex scenarios. Include questions about:
- Safety procedures and regulations
- Code compliance and standards
- Troubleshooting common problems
- Proper installation techniques
- Material selection and specifications`;

    const llmResponse = await fetch("https://routellm.abacus.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate 10 practice exam questions for ${trade} certification.` },
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!llmResponse.ok) {
      const errText = await llmResponse.text();
      console.error("LLM API error:", errText);
      return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
    }

    const llmData = await llmResponse.json();
    const content = llmData.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let questions;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found");
      }
    } catch (parseErr) {
      console.error("Failed to parse questions:", content);
      // Return fallback questions
      questions = generateFallbackQuestions(trade);
    }

    // Ensure we have exactly 10 questions
    if (!Array.isArray(questions) || questions.length < 10) {
      questions = generateFallbackQuestions(trade);
    }

    // Create quiz record
    await prisma.tradeAceQuiz.create({
      data: {
        userId: user.id,
        manualId: manualId || null,
        trade,
        questions: JSON.stringify(questions),
      },
    });

    return NextResponse.json({ questions: questions.slice(0, 10) });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
  }
}

function generateFallbackQuestions(trade: string) {
  const baseQuestions: Record<string, Array<{id: number; scenario: string; question: string; options: string[]; correctIndex: number; explanation: string}>> = {
    electrician: [
      { id: 1, scenario: "You're installing a new 20-amp branch circuit in a residential kitchen.", question: "According to the NEC, what is the minimum wire gauge required for this circuit?", options: ["14 AWG", "12 AWG", "10 AWG", "8 AWG"], correctIndex: 1, explanation: "12 AWG wire is required for 20-amp circuits per NEC Table 310.16." },
      { id: 2, scenario: "A homeowner complains about frequently tripping breakers in their bathroom.", question: "What type of protection is required for bathroom receptacles?", options: ["Standard circuit breaker", "AFCI protection", "GFCI protection", "Surge protection"], correctIndex: 2, explanation: "GFCI protection is required for all bathroom receptacles per NEC 210.8(A)." },
      { id: 3, scenario: "You're running NM cable through wooden studs.", question: "What is the minimum distance from the edge of the stud that holes must be drilled?", options: ["1/2 inch", "1 inch", "1-1/4 inches", "2 inches"], correctIndex: 2, explanation: "Holes must be at least 1-1/4 inches from the nearest edge per NEC 300.4(A)(1)." },
      { id: 4, scenario: "You need to ground a 200-amp residential service.", question: "What is the minimum size copper grounding electrode conductor required?", options: ["#8 AWG", "#6 AWG", "#4 AWG", "#2 AWG"], correctIndex: 2, explanation: "A 200-amp service requires a minimum #4 AWG copper GEC per NEC Table 250.66." },
      { id: 5, scenario: "You're installing outdoor lighting on a deck.", question: "What is the minimum height for receptacles above the deck surface?", options: ["6 inches", "12 inches", "15 inches", "18 inches"], correctIndex: 2, explanation: "Receptacles must be at least 15 inches above the grade or deck surface." },
      { id: 6, scenario: "A junction box in an attic has multiple cables entering.", question: "How do you calculate the required box fill?", options: ["Count only conductors", "Include grounds and clamps in count", "Use cubic inch capacity only", "No calculation needed for attics"], correctIndex: 1, explanation: "Box fill calculations must include all conductors, grounds, clamps, and devices per NEC 314.16." },
      { id: 7, scenario: "You're installing a ceiling fan with a light kit.", question: "What is the minimum required ceiling box rating?", options: ["15 lbs", "35 lbs", "50 lbs", "70 lbs"], correctIndex: 2, explanation: "Ceiling fan boxes must be rated for at least 50 lbs or specifically listed for ceiling fan support." },
      { id: 8, scenario: "The voltage between hot and neutral reads 110V, but between hot and ground reads 0V.", question: "What does this indicate?", options: ["Normal reading", "Open neutral", "Open ground", "Reversed polarity"], correctIndex: 2, explanation: "Zero voltage to ground with normal hot-neutral voltage indicates an open ground condition." },
      { id: 9, scenario: "You're installing a smoke detector circuit.", question: "What type of circuit protection is required for smoke detectors?", options: ["Dedicated AFCI circuit", "Dedicated GFCI circuit", "Non-switchable circuit", "Battery backup only"], correctIndex: 2, explanation: "Smoke detectors must be on a non-switchable circuit that cannot be turned off accidentally." },
      { id: 10, scenario: "You need to bond a metal water pipe to the electrical system.", question: "Within what distance of entering the building must this bond be made?", options: ["3 feet", "5 feet", "10 feet", "No distance requirement"], correctIndex: 1, explanation: "The bonding connection must be made within 5 feet of where the pipe enters the building per NEC 250.52(A)(1)." },
    ],
    plumber: [
      { id: 1, scenario: "You're installing a new kitchen sink drain.", question: "What is the minimum trap size for a kitchen sink?", options: ["1-1/4 inch", "1-1/2 inch", "2 inch", "3 inch"], correctIndex: 1, explanation: "Kitchen sinks require a minimum 1-1/2 inch trap per plumbing code." },
      { id: 2, scenario: "A customer complains of slow draining in multiple fixtures.", question: "What is the most likely cause?", options: ["Individual trap blockages", "Main vent stack obstruction", "Low water pressure", "Undersized supply lines"], correctIndex: 1, explanation: "Multiple slow drains typically indicate a main vent stack obstruction affecting the drainage system." },
      { id: 3, scenario: "You're installing a water heater in a garage.", question: "What is the minimum height for the ignition source above the floor?", options: ["12 inches", "18 inches", "24 inches", "36 inches"], correctIndex: 1, explanation: "Gas water heater ignition sources must be at least 18 inches above the garage floor per code." },
      { id: 4, scenario: "A toilet is rocking on the floor.", question: "What is the first thing you should check?", options: ["Wax ring condition", "Flange height and level", "Water supply line", "Tank bolts"], correctIndex: 1, explanation: "A rocking toilet is usually caused by an improperly set or damaged flange." },
      { id: 5, scenario: "You need to install a backflow preventer.", question: "Which type is required for a lawn irrigation system?", options: ["Atmospheric vacuum breaker", "Pressure vacuum breaker", "Reduced pressure zone device", "Double check valve"], correctIndex: 2, explanation: "RPZ devices are required for high-hazard applications like irrigation systems." },
      { id: 6, scenario: "You're connecting a dishwasher drain.", question: "What prevents contamination of the water supply?", options: ["P-trap", "Air gap or high loop", "Check valve", "Expansion tank"], correctIndex: 1, explanation: "An air gap or high loop prevents backflow from the sink into the dishwasher." },
      { id: 7, scenario: "The water pressure at a fixture is too high.", question: "What device should be installed?", options: ["Check valve", "Expansion tank", "Pressure reducing valve", "Backflow preventer"], correctIndex: 2, explanation: "A pressure reducing valve limits incoming water pressure to safe levels." },
      { id: 8, scenario: "You're installing a gas line for a range.", question: "What type of connector is required?", options: ["Rigid black iron only", "Flexible approved gas connector", "Copper tubing", "PVC pipe"], correctIndex: 1, explanation: "Flexible gas connectors allow for appliance movement and are code-approved for ranges." },
      { id: 9, scenario: "A customer hears banging pipes when water is shut off quickly.", question: "What causes this condition?", options: ["Air in lines", "Water hammer", "Thermal expansion", "High velocity"], correctIndex: 1, explanation: "Water hammer is caused by the sudden stop of water flow creating pressure waves." },
      { id: 10, scenario: "You need to vent a bathroom group.", question: "What is the maximum distance from the trap to the vent?", options: ["3 feet", "5 feet", "6 feet", "8 feet"], correctIndex: 2, explanation: "The trap-to-vent distance for a 1-1/2 inch drain is typically 6 feet maximum." },
    ],
    hvac: [
      { id: 1, scenario: "An air conditioning system is running but not cooling.", question: "What is the first thing you should check?", options: ["Compressor operation", "Refrigerant charge", "Air filter condition", "Thermostat settings"], correctIndex: 3, explanation: "Always verify thermostat settings first before moving to more complex diagnostics." },
      { id: 2, scenario: "You measure high head pressure and normal suction pressure.", question: "What is the most likely cause?", options: ["Low refrigerant", "Dirty condenser coil", "Faulty compressor", "Restricted metering device"], correctIndex: 1, explanation: "A dirty condenser coil restricts heat rejection, causing high head pressure." },
      { id: 3, scenario: "A system is short cycling frequently.", question: "Which of these is NOT a common cause?", options: ["Oversized equipment", "Low refrigerant", "Dirty filter", "New thermostat batteries"], correctIndex: 3, explanation: "New thermostat batteries would not cause short cycling; the other options are common causes." },
      { id: 4, scenario: "You're recovering refrigerant from a system.", question: "What EPA certification level is required?", options: ["Type I", "Type II", "Type III", "Universal"], correctIndex: 1, explanation: "Type II certification is required for servicing high-pressure equipment like air conditioners." },
      { id: 5, scenario: "The evaporator coil is freezing up.", question: "What should you check first?", options: ["Refrigerant charge", "Airflow across the coil", "Outdoor temperature", "Compressor amperage"], correctIndex: 1, explanation: "Restricted airflow is the most common cause of evaporator freeze-up and should be checked first." },
      { id: 6, scenario: "A gas furnace has a yellow flame.", question: "What does this indicate?", options: ["Normal operation", "Excess air", "Incomplete combustion", "High efficiency"], correctIndex: 2, explanation: "A yellow flame indicates incomplete combustion, which can produce carbon monoxide." },
      { id: 7, scenario: "You need to braze copper refrigerant lines.", question: "What must you do to prevent oxidation inside the tubing?", options: ["Use acid flux", "Flow nitrogen through the lines", "Heat slowly", "Use silver solder only"], correctIndex: 1, explanation: "Flowing nitrogen during brazing prevents internal oxidation that can damage the system." },
      { id: 8, scenario: "The supply air temperature is 20°F lower than return air.", question: "For a properly operating cooling system, is this normal?", options: ["Yes, this is normal", "No, delta T should be 10-12°F", "No, delta T should be 25-30°F", "Depends on humidity"], correctIndex: 0, explanation: "A 18-22°F temperature differential is normal for a properly operating cooling system." },
      { id: 9, scenario: "You're commissioning a new heat pump system.", question: "What must be verified for the defrost cycle?", options: ["Only thermostat control", "Reversing valve operation", "Outdoor fan speed only", "Indoor coil temperature"], correctIndex: 1, explanation: "The reversing valve must be verified to ensure proper defrost cycle operation." },
      { id: 10, scenario: "A customer complains of high humidity despite cooling.", question: "What is the most likely issue?", options: ["Oversized equipment", "Undersized equipment", "Low refrigerant", "Dirty filter"], correctIndex: 0, explanation: "Oversized equipment short cycles and doesn't run long enough to properly dehumidify." },
    ],
  };

  return baseQuestions[trade] || baseQuestions.electrician;
}
