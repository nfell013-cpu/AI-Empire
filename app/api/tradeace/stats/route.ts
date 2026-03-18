export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({
        tradeAceSubscribed: false,
        tradeAceStreak: 0,
        tradeAceTotalQuizzes: 0,
        tradeAceCorrectAnswers: 0,
        tradeAceSubExpiresAt: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        tradeAceSubscribed: true,
        tradeAceStreak: true,
        tradeAceTotalQuizzes: true,
        tradeAceCorrectAnswers: true,
        tradeAceSubExpiresAt: true,
        tradeAceLastQuizDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        tradeAceSubscribed: false,
        tradeAceStreak: 0,
        tradeAceTotalQuizzes: 0,
        tradeAceCorrectAnswers: 0,
        tradeAceSubExpiresAt: null,
      });
    }

    // Check subscription expiry
    let isSubscribed = user.tradeAceSubscribed;
    if (isSubscribed && user.tradeAceSubExpiresAt) {
      if (new Date(user.tradeAceSubExpiresAt) < new Date()) {
        isSubscribed = false;
        await prisma.user.update({
          where: { email: session.user.email },
          data: { tradeAceSubscribed: false },
        });
      }
    }

    // Check streak - reset if more than 1 day since last quiz
    let streak = user.tradeAceStreak;
    if (user.tradeAceLastQuizDate) {
      const lastQuiz = new Date(user.tradeAceLastQuizDate);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - lastQuiz.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 1) {
        streak = 0;
        await prisma.user.update({
          where: { email: session.user.email },
          data: { tradeAceStreak: 0 },
        });
      }
    }

    return NextResponse.json({
      tradeAceSubscribed: isSubscribed,
      tradeAceStreak: streak,
      tradeAceTotalQuizzes: user.tradeAceTotalQuizzes,
      tradeAceCorrectAnswers: user.tradeAceCorrectAnswers,
      tradeAceSubExpiresAt: user.tradeAceSubExpiresAt,
    });
  } catch (error) {
    console.error("Error fetching TradeAce stats:", error);
    return NextResponse.json({
      tradeAceSubscribed: false,
      tradeAceStreak: 0,
      tradeAceTotalQuizzes: 0,
      tradeAceCorrectAnswers: 0,
      tradeAceSubExpiresAt: null,
    });
  }
}
