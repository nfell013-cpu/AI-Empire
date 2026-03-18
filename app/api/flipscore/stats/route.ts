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
        flipScoreSubscribed: false,
        flipScoreScans: 0,
        flipScoreSubExpiresAt: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        flipScoreSubscribed: true,
        flipScoreScans: true,
        flipScoreSubExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        flipScoreSubscribed: false,
        flipScoreScans: 0,
        flipScoreSubExpiresAt: null,
      });
    }

    // Check if subscription has expired
    let isSubscribed = user.flipScoreSubscribed;
    if (isSubscribed && user.flipScoreSubExpiresAt) {
      if (new Date(user.flipScoreSubExpiresAt) < new Date()) {
        isSubscribed = false;
        // Update user subscription status
        await prisma.user.update({
          where: { email: session.user.email },
          data: { flipScoreSubscribed: false },
        });
      }
    }

    return NextResponse.json({
      flipScoreSubscribed: isSubscribed,
      flipScoreScans: user.flipScoreScans,
      flipScoreSubExpiresAt: user.flipScoreSubExpiresAt,
    });
  } catch (error) {
    console.error("Error fetching FlipScore stats:", error);
    return NextResponse.json({
      flipScoreSubscribed: false,
      flipScoreScans: 0,
      flipScoreSubExpiresAt: null,
    });
  }
}
