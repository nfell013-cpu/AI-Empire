import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const LLM_API_URL = "https://routellm.abacus.ai/v1/chat/completions";
const LLM_API_KEY = process.env.ABACUSAI_API_KEY || "";

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
        soundForgeSubscribed: true, 
        soundForgeFreeUsed: true,
        soundForgeTracks: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check access
    if (!user.soundForgeSubscribed && user.soundForgeFreeUsed) {
      return NextResponse.json({ error: "Subscription required" }, { status: 402 });
    }

    const body = await req.json();
    const { genre, mood, duration, prompt } = body;

    // Generate track details using LLM
    const systemPrompt = `You are a music composition AI assistant. Generate details for an AI-generated music track.

Based on the user's preferences, create a unique track concept with:
1. A creative title
2. A brief description of the sound and feel
3. An appropriate tempo (BPM)

Respond in JSON format:
{
  "title": "Creative track title",
  "description": "2-3 sentences describing the track",
  "tempo": 120
}

Only output valid JSON, nothing else.`;

    const userPrompt = `Create a ${genre} track with a ${mood} mood. Duration: ${duration} seconds.
${prompt ? `Additional context: ${prompt}` : ""}`;

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!llmResponse.ok) {
      throw new Error("LLM API error");
    }

    const llmData = await llmResponse.json();
    const content = llmData.choices?.[0]?.message?.content || "{}";
    
    let trackDetails;
    try {
      trackDetails = JSON.parse(content.replace(/```json\n?|```/g, "").trim());
    } catch {
      trackDetails = {
        title: `${mood.charAt(0).toUpperCase() + mood.slice(1)} ${genre.charAt(0).toUpperCase() + genre.slice(1)} Track`,
        description: `An AI-generated ${mood} ${genre} composition`,
        tempo: genre === "ambient" ? 70 : genre === "electronic" ? 128 : 100,
      };
    }

    // Generate a demo audio URL (in production, this would call an actual audio generation service)
    // Using a placeholder royalty-free audio URL for demonstration
    const demoAudioUrls: Record<string, string> = {
      ambient: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      electronic: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      hiphop: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      rock: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      jazz: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      classical: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
      lofi: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
      cinematic: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    };

    const audioUrl = demoAudioUrls[genre] || demoAudioUrls.ambient;

    // Save to database
    await prisma.soundForgeTrack.create({
      data: {
        userId: user.id,
        genre,
        mood,
        duration,
        tempo: trackDetails.tempo,
        prompt: prompt || null,
        audioUrl,
        status: "completed",
      },
    });

    // Update user stats
    await prisma.user.update({
      where: { id: user.id },
      data: {
        soundForgeTracks: { increment: 1 },
        soundForgeFreeUsed: true,
      },
    });

    return NextResponse.json({
      audioUrl,
      genre,
      mood,
      duration,
      tempo: trackDetails.tempo,
      title: trackDetails.title,
      description: trackDetails.description,
    });
  } catch (error) {
    console.error("SoundForge generate error:", error);
    return NextResponse.json({ error: "Failed to generate track" }, { status: 500 });
  }
}
