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
        guardianAISubscribed: true,
        guardianAIFreeUsed: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.guardianAISubscribed && user.guardianAIFreeUsed) {
    if (user.role === "admin") { /* admin has full access */ } else
      return NextResponse.json({ error: "Subscription required" }, { status: 402 });
    }

    const { searchQuery, scanType } = await req.json();

    if (!searchQuery) {
      return NextResponse.json({ error: "Search query required" }, { status: 400 });
    }

    const systemPrompt = `You are GuardianAI, an expert AI reputation analyst. Analyze online reputation and provide comprehensive insights.

Respond ONLY with valid JSON in this exact format:
{
  "overallScore": number (0-100, reputation score),
  "sentimentBreakdown": {
    "positive": number (percentage),
    "neutral": number (percentage),
    "negative": number (percentage)
  },
  "reputationStatus": "Excellent/Good/Fair/At Risk/Critical",
  "keyFindings": ["finding 1", "finding 2", "finding 3"],
  "mentions": [
    {
      "source": "Source name (e.g., Twitter, LinkedIn, News)",
      "sentiment": "Positive/Neutral/Negative",
      "summary": "Brief summary of mention",
      "date": "Recent/Last Week/Last Month",
      "impact": "High/Medium/Low"
    }
  ],
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "riskAreas": ["risk area 1", "risk area 2"],
  "opportunities": ["opportunity 1", "opportunity 2"]
}

Provide realistic, actionable analysis. Include 4-6 mentions from various sources.`;

    const userPrompt = `Analyze the online reputation for: "${searchQuery}"

Scan type: ${scanType} (${scanType === "personal" ? "individual person" : scanType === "brand" ? "brand/company" : "business"})

Provide a comprehensive reputation analysis including sentiment breakdown, key findings, recent mentions, risks, opportunities, and actionable recommendations to improve or maintain reputation.`;

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
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      throw new Error("LLM API error");
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";

    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      throw new Error("Failed to parse analysis");
    }

    // Save to database
    await prisma.guardianAIScan.create({
      data: {
        userId: user.id,
        searchQuery,
        scanType,
        overallScore: analysis.overallScore,
        positiveCount: analysis.sentimentBreakdown.positive,
        negativeCount: analysis.sentimentBreakdown.negative,
        neutralCount: analysis.sentimentBreakdown.neutral,
        mentions: JSON.stringify(analysis.mentions),
        recommendations: JSON.stringify(analysis.recommendations),
        analysisResult: JSON.stringify(analysis),
      },
    });

    // Update user stats
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        guardianAIScans: { increment: 1 },
        guardianAIFreeUsed: true,
      },
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("GuardianAI scan error:", error);
    return NextResponse.json({ error: "Failed to scan reputation" }, { status: 500 });
  }
}
