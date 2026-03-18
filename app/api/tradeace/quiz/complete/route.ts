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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { trade, score, totalQuestions, manualId } = body;

    // Calculate streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let newStreak = user.tradeAceStreak;
    
    if (user.tradeAceLastQuizDate) {
      const lastQuiz = new Date(user.tradeAceLastQuizDate);
      lastQuiz.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - lastQuiz.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        // Same day - keep current streak
        newStreak = user.tradeAceStreak;
      } else if (daysDiff === 1) {
        // Consecutive day - increment streak
        newStreak = user.tradeAceStreak + 1;
      } else {
        // Streak broken - start new
        newStreak = 1;
      }
    } else {
      // First quiz ever
      newStreak = 1;
    }

    // Update user stats
    await prisma.user.update({
      where: { id: user.id },
      data: {
        tradeAceStreak: newStreak,
        tradeAceLastQuizDate: new Date(),
        tradeAceTotalQuizzes: { increment: 1 },
        tradeAceCorrectAnswers: { increment: score },
      },
    });

    // Update the most recent quiz with score
    const latestQuiz = await prisma.tradeAceQuiz.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (latestQuiz) {
      await prisma.tradeAceQuiz.update({
        where: { id: latestQuiz.id },
        data: {
          score,
          completedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      streak: newStreak,
      totalQuizzes: user.tradeAceTotalQuizzes + 1,
      correctAnswers: user.tradeAceCorrectAnswers + score,
    });
  } catch (error) {
    console.error("Quiz completion error:", error);
    return NextResponse.json({ error: "Failed to save results" }, { status: 500 });
  }
}
