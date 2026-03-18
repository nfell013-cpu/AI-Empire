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
        trendPulseSubscribed: true,
        trendPulseFreeUsed: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.trendPulseSubscribed && user.trendPulseFreeUsed) {
      return NextResponse.json({ error: "Subscription required" }, { status: 402 });
    }

    const { assetName, assetType, timeframe } = await req.json();

    if (!assetName || !assetType) {
      return NextResponse.json({ error: "Asset name and type required" }, { status: 400 });
    }

    const systemPrompt = `You are TrendPulse, an expert AI market analyst. Provide comprehensive market trend analysis with price predictions.

Respond ONLY with valid JSON in this exact format:
{
  "assetName": "Full asset name",
  "assetType": "Stock/Crypto/Commodity",
  "currentPrice": "$XXX.XX",
  "sentiment": "Bullish/Bearish/Neutral",
  "confidenceScore": number (0-100),
  "priceTargets": {
    "shortTerm": { "low": number, "high": number, "timeframe": "1-4 weeks" },
    "mediumTerm": { "low": number, "high": number, "timeframe": "1-6 months" },
    "longTerm": { "low": number, "high": number, "timeframe": "6-12 months" }
  },
  "keyFactors": [
    { "factor": "Factor name", "impact": "Positive/Negative/Neutral", "description": "Brief description" }
  ],
  "riskLevel": "Low/Medium/High",
  "technicalIndicators": [
    { "name": "RSI", "signal": "Buy/Sell/Hold", "value": "XX" },
    { "name": "MACD", "signal": "Bullish/Bearish", "value": "XX" },
    { "name": "Moving Avg", "signal": "Above/Below", "value": "XX" },
    { "name": "Volume", "signal": "High/Normal/Low", "value": "XX" }
  ],
  "recommendation": "Clear actionable recommendation",
  "summary": "2-3 sentence market analysis summary"
}

Provide realistic analysis based on general market knowledge. Include 3-4 key factors.`;

    const userPrompt = `Analyze the market trends for: ${assetName}

Asset type: ${assetType}
Preferred timeframe: ${timeframe}

Provide comprehensive analysis including sentiment, price targets, key factors affecting the asset, technical indicators, risk assessment, and a clear recommendation.`;

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
        temperature: 0.6,
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
    await prisma.trendPulseReport.create({
      data: {
        userId: user.id,
        assetType,
        assetName,
        timeframe,
        sentiment: analysis.sentiment,
        confidenceScore: analysis.confidenceScore,
        priceTargets: JSON.stringify(analysis.priceTargets),
        keyFactors: JSON.stringify(analysis.keyFactors),
        riskLevel: analysis.riskLevel,
        analysisResult: JSON.stringify(analysis),
      },
    });

    // Update user stats
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        trendPulseAnalyses: { increment: 1 },
        trendPulseFreeUsed: true,
      },
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("TrendPulse analyze error:", error);
    return NextResponse.json({ error: "Failed to analyze trends" }, { status: 500 });
  }
}
