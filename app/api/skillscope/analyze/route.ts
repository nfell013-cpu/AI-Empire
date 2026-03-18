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
        id: true, role: true,
        skillScopeSubscribed: true,
        skillScopeFreeUsed: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.skillScopeSubscribed && user.skillScopeFreeUsed) {
    if (user.role === "admin") { /* admin has full access */ } else
      return NextResponse.json({ error: "Subscription required" }, { status: 402 });
    }

    const { resumeBase64, fileName, jobDescription } = await req.json();

    if (!resumeBase64) {
      return NextResponse.json({ error: "Resume required" }, { status: 400 });
    }

    const systemPrompt = `You are SkillScope, an expert AI resume analyst and career advisor. Analyze resumes thoroughly and provide actionable feedback.

Respond ONLY with valid JSON in this exact format:
{
  "resumeScore": number (0-100),
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "improvements": ["specific improvement 1", "specific improvement 2", "specific improvement 3", "specific improvement 4"],
  "keywordMatch": number (0-100, percentage of relevant keywords found),
  "experienceLevel": "Entry/Junior/Mid/Senior/Executive",
  "topSkills": ["skill 1", "skill 2", "skill 3", "skill 4", "skill 5"],
  "missingSkills": ["missing skill 1", "missing skill 2", "missing skill 3"],
  "overallFeedback": "2-3 sentence personalized feedback",
  "jobFitScore": number (0-100, how well resume matches job if provided, or general employability)
}`;

    const userPrompt = `Analyze this resume thoroughly:\n\n${jobDescription ? `Target Job Description:\n${jobDescription}\n\n` : ""}Please provide a comprehensive analysis including scoring, strengths, weaknesses, and specific improvement recommendations.`;

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
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "file",
                file: {
                  filename: fileName,
                  file_data: `data:application/pdf;base64,${resumeBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.5,
        max_tokens: 2000,
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
    await prisma.skillScopeReport.create({
      data: {
        userId: user.id,
        fileName,
        jobDescription,
        resumeScore: analysis.resumeScore,
        strengths: JSON.stringify(analysis.strengths),
        weaknesses: JSON.stringify(analysis.weaknesses),
        improvements: JSON.stringify(analysis.improvements),
        analysisResult: JSON.stringify(analysis),
      },
    });

    // Update user stats
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        skillScopeAnalyses: { increment: 1 },
        skillScopeFreeUsed: true,
      },
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("SkillScope analyze error:", error);
    return NextResponse.json({ error: "Failed to analyze resume" }, { status: 500 });
  }
}
