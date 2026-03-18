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
        dataVaultSubscribed: true,
        dataVaultFreeUsed: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.dataVaultSubscribed && user.dataVaultFreeUsed) {
      return NextResponse.json({ error: "Subscription required" }, { status: 402 });
    }

    const { csvContent, fileName } = await req.json();

    if (!csvContent) {
      return NextResponse.json({ error: "CSV content required" }, { status: 400 });
    }

    const systemPrompt = `You are DataVault, an expert AI personal finance analyst. Analyze transaction data and provide actionable financial insights.

Respond ONLY with valid JSON in this exact format:
{
  "totalIncome": number,
  "totalExpenses": number,
  "netSavings": number,
  "savingsRate": number (percentage),
  "spendingByCategory": [
    { "category": "Category Name", "amount": number, "percentage": number }
  ],
  "topExpenseCategories": ["category 1", "category 2", "category 3"],
  "monthlyTrend": "Brief description of spending trend",
  "financialHealth": "Excellent/Good/Fair/Needs Improvement",
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3",
    "Specific actionable recommendation 4"
  ],
  "budgetSuggestions": [
    { "category": "Category", "suggested": number, "current": number }
  ],
  "alerts": ["Financial alert or concern if any"]
}

Categories should be: Housing, Food, Transportation, Entertainment, Shopping, Utilities, Healthcare, Education, Other`;

    const userPrompt = `Analyze this bank statement/transaction data and provide comprehensive financial insights:

${csvContent.substring(0, 15000)}

Provide detailed analysis with specific dollar amounts and percentages. Identify spending patterns and give actionable advice.`;

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
        temperature: 0.5,
        max_tokens: 3000,
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
    await prisma.dataVaultReport.create({
      data: {
        userId: user.id,
        fileName,
        totalIncome: analysis.totalIncome,
        totalExpenses: analysis.totalExpenses,
        savingsRate: analysis.savingsRate,
        spendingByCategory: JSON.stringify(analysis.spendingByCategory),
        recommendations: JSON.stringify(analysis.recommendations),
        analysisResult: JSON.stringify(analysis),
      },
    });

    // Update user stats
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        dataVaultReports: { increment: 1 },
        dataVaultFreeUsed: true,
      },
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("DataVault analyze error:", error);
    return NextResponse.json({ error: "Failed to analyze finances" }, { status: 500 });
  }
}
