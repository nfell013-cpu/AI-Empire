export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user and check subscription
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check subscription
    let isSubscribed = user.flipScoreSubscribed;
    if (isSubscribed && user.flipScoreSubExpiresAt) {
      if (new Date(user.flipScoreSubExpiresAt) < new Date()) {
        isSubscribed = false;
        await prisma.user.update({
          where: { id: user.id },
          data: { flipScoreSubscribed: false },
        });
      }
    }

    if (!isSubscribed && user.role !== "admin") {
      return NextResponse.json({ error: "Subscription required" }, { status: 402 });
    }

    const body = await request.json();
    const { imageBase64, fileName, contentType } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "Image required" }, { status: 400 });
    }

    // Call GPT-4o Vision API
    const apiKey = process.env.ABACUSAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API not configured" }, { status: 500 });
    }

    const systemPrompt = `You are an expert thrift reseller and eBay market analyst. Analyze the uploaded image of a thrift store item and provide a detailed resale assessment.

Return a JSON object with this exact structure:
{
  "itemName": "Specific name/model of the item",
  "category": "Category (e.g., Clothing, Electronics, Home Decor, Books, etc.)",
  "brand": "Brand name if identifiable, or null",
  "condition": "Condition assessment (Excellent, Good, Fair, Poor)",
  "estimatedValue": {
    "low": <number - conservative estimate in USD>,
    "mid": <number - average expected sale price in USD>,
    "high": <number - best-case scenario price in USD>
  },
  "demandLevel": "high" | "medium" | "low",
  "sellTimeEstimate": "Expected time to sell (e.g., '1-3 days', '1-2 weeks', '1+ months')",
  "tips": ["Tip 1 for selling this item", "Tip 2", "Tip 3"],
  "comparables": [
    { "title": "Similar listing title", "price": <number>, "sold": true/false },
    { "title": "Another similar item", "price": <number>, "sold": true/false },
    { "title": "Third comparable", "price": <number>, "sold": true/false }
  ]
}

Base your estimates on current eBay market data and resale trends. Be realistic and practical in your assessments. If you cannot identify the item clearly, make your best educated guess based on what you can see.`;

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
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this thrift item and provide eBay resale estimates." },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64,
                },
              },
            ],
          },
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });

    if (!llmResponse.ok) {
      const errText = await llmResponse.text();
      console.error("LLM API error:", errText);
      return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
    }

    const llmData = await llmResponse.json();
    const content = llmData.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let analysisResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseErr) {
      console.error("Failed to parse LLM response:", content);
      // Return a default structure if parsing fails
      analysisResult = {
        itemName: "Unknown Item",
        category: "General",
        brand: null,
        condition: "Good",
        estimatedValue: { low: 5, mid: 15, high: 30 },
        demandLevel: "medium",
        sellTimeEstimate: "1-2 weeks",
        tips: ["Take clear photos", "Write detailed description", "Price competitively"],
        comparables: [],
      };
    }

    // Save the scan to database
    await prisma.thriftScan.create({
      data: {
        userId: user.id,
        fileName: fileName || "image.jpg",
        itemName: analysisResult.itemName,
        category: analysisResult.category,
        condition: analysisResult.condition,
        estimatedValue: analysisResult.estimatedValue?.mid || 0,
        analysisResult: JSON.stringify(analysisResult),
      },
    });

    // Increment scan count
    await prisma.user.update({
      where: { id: user.id },
      data: { flipScoreScans: { increment: 1 } },
    });

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("FlipScore analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
