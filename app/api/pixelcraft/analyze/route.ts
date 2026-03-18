export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email ?? "" },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { input } = await request.json();
    
    if (!input || !input.trim()) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    // Check token balance
    if (user.tokens < 1) {
      return NextResponse.json({ error: "Insufficient tokens. Watch an ad or purchase tokens to continue." }, { status: 402 });
    }

    // Deduct token
    await prisma.user.update({
      where: { id: user.id },
      data: { tokens: { decrement: 1 } },
    });

    // Log transaction
    await prisma.tokenTransaction.create({
      data: {
        userId: user.id,
        amount: -1,
        balance: user.tokens - 1,
        type: "usage",
        description: "PixelCraft analysis",
        toolSlug: "pixelcraft",
      },
    });

    // Call AI
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are PixelCraft, an AI image generation assistant. Based on the user's description, create a detailed image prompt optimized for AI generation. Return JSON with: prompt (enhanced prompt), style (art style), dimensions (recommended), colorPalette[], composition (description), mood, technicalNotes.`
          },
          {
            role: "user",
            content: input,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      // Refund token on API failure
      await prisma.user.update({
        where: { id: user.id },
        data: { tokens: { increment: 1 } },
      });
      return NextResponse.json({ error: "AI service error" }, { status: 500 });
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content ?? "";
    
    // Try to parse as JSON
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : content;
    } catch {
      result = content;
    }

    return NextResponse.json({ result, tokensUsed: 1 });
  } catch (error: any) {
    console.error("PixelCraft API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
