import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const LLM_API_URL = "https://routellm.abacus.ai/v1/chat/completions";
const LLM_API_KEY = process.env.ABACUSAI_API_KEY || "";

// Template to placeholder image mapping (meme templates)
const TEMPLATE_IMAGES: Record<string, string> = {
  drake: "https://imgflip.com/s/meme/Drake-Hotline-Bling.jpg",
  distracted: "https://imgflip.com/s/meme/Distracted-Boyfriend.jpg",
  change_mind: "https://imgflip.com/s/meme/Change-My-Mind.jpg",
  two_buttons: "https://imgflip.com/s/meme/Two-Buttons.jpg",
  expanding_brain: "https://imgflip.com/s/meme/Expanding-Brain.jpg",
  disaster_girl: "https://imgflip.com/s/meme/Disaster-Girl.jpg",
  custom: "https://imgflip.com/s/meme/One-Does-Not-Simply.jpg",
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, role: true, 
        memeMintSubscribed: true, 
        memeMintFreeUsed: true,
        memeMintCreations: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check access
    if (!user.memeMintSubscribed && user.memeMintFreeUsed) {
    if (user.role === "admin") { /* admin has full access */ } else
      return NextResponse.json({ error: "Subscription required" }, { status: 402 });
    }

    const body = await req.json();
    const { style, template, prompt } = body;

    // Generate meme content using LLM
    const systemPrompt = `You are a viral meme creator AI. Your job is to generate funny, relatable meme captions.

Based on the user's idea, create meme text that is:
- Witty and clever
- Relatable to a wide audience
- Follows the ${style} style
- Suitable for the ${template === 'custom' ? 'any appropriate' : template} meme template

Respond in JSON format:
{
  "topText": "Top text for the meme (or first panel)",
  "bottomText": "Bottom text for the meme (or second panel)",
  "viralScore": 75,
  "alternatives": ["Alternative caption 1", "Alternative caption 2"]
}

The viralScore should be 0-100 based on how likely this meme is to go viral.
Only output valid JSON, nothing else.`;

    const llmResponse = await fetch(LLM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create a ${style} meme about: ${prompt}` },
        ],
        temperature: 0.9,
      }),
    });

    if (!llmResponse.ok) {
      throw new Error("LLM API error");
    }

    const llmData = await llmResponse.json();
    const content = llmData.choices?.[0]?.message?.content || "{}";
    
    let memeContent;
    try {
      memeContent = JSON.parse(content.replace(/```json\n?|```/g, "").trim());
    } catch {
      memeContent = {
        topText: "When you ask AI to make a meme",
        bottomText: "And it actually delivers",
        viralScore: 65,
        alternatives: ["AI memes hit different", "The future is now"],
      };
    }

    // Get template image
    const imageUrl = TEMPLATE_IMAGES[template] || TEMPLATE_IMAGES.custom;

    // Save to database
    await prisma.memeMintCreation.create({
      data: {
        userId: user.id,
        template,
        topText: memeContent.topText,
        bottomText: memeContent.bottomText,
        prompt,
        style,
        generatedUrl: imageUrl,
        viralScore: memeContent.viralScore,
        suggestions: JSON.stringify(memeContent.alternatives),
      },
    });

    // Update user stats
    await prisma.user.update({
      where: { id: user.id },
      data: {
        memeMintCreations: { increment: 1 },
        memeMintFreeUsed: true,
      },
    });

    return NextResponse.json({
      imageUrl,
      topText: memeContent.topText,
      bottomText: memeContent.bottomText,
      template,
      viralScore: memeContent.viralScore,
      alternatives: memeContent.alternatives || [],
    });
  } catch (error) {
    console.error("MemeMint generate error:", error);
    return NextResponse.json({ error: "Failed to generate meme" }, { status: 500 });
  }
}
