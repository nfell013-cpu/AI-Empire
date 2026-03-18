import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        globeGuideSubscribed: true,
        globeGuideFreeUsed: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.globeGuideSubscribed && user.globeGuideFreeUsed) {
    if (user.role === "admin") { /* admin has full access */ } else
      return NextResponse.json({ error: "Subscription required" }, { status: 402 });
    }

    const { destination, duration, budget, interests } = await req.json();

    if (!destination || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const systemPrompt = `You are GlobeGuide, an expert AI travel planner. Create detailed, personalized travel itineraries with local insights and hidden gems.

Respond ONLY with valid JSON in this exact format:
{
  "destination": "City, Country",
  "duration": number,
  "overview": "Brief 2-3 sentence overview of the trip",
  "bestTimeToVisit": "Month range or season",
  "estimatedBudget": { "low": number, "high": number },
  "mustTryFood": ["dish 1", "dish 2", "dish 3"],
  "hiddenGems": ["hidden gem 1", "hidden gem 2", "hidden gem 3"],
  "dailyPlans": [
    {
      "day": 1,
      "title": "Day title/theme",
      "activities": [
        {
          "time": "09:00 AM",
          "activity": "Activity name",
          "location": "Specific location",
          "tips": "Insider tip",
          "cost": "$XX or Free"
        }
      ]
    }
  ],
  "packingTips": ["tip 1", "tip 2"],
  "localPhrases": [{ "phrase": "local phrase", "meaning": "English meaning" }]
}`;

    const userPrompt = `Create a ${duration}-day travel itinerary for ${destination}.

Budget level: ${budget}
Interests: ${interests.length > 0 ? interests.join(", ") : "General sightseeing"}

Include 4-5 activities per day with specific times, locations, costs, and insider tips. Focus on authentic local experiences and hidden gems that most tourists miss.`;

    const response = await fetch("https://routellm.abacus.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error("LLM API error");
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";

    let itinerary;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      itinerary = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      throw new Error("Failed to parse itinerary");
    }

    // Save to database
    await prisma.globeGuideTrip.create({
      data: {
        userId: user.id,
        destination,
        duration,
        budget,
        interests: JSON.stringify(interests),
        itinerary: JSON.stringify(itinerary),
      },
    });

    // Update user stats
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        globeGuideItineraries: { increment: 1 },
        globeGuideFreeUsed: true,
      },
    });

    return NextResponse.json({ itinerary });
  } catch (error) {
    console.error("GlobeGuide generate error:", error);
    return NextResponse.json({ error: "Failed to generate itinerary" }, { status: 500 });
  }
}
