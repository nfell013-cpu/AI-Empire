import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({
        trendPulseSubscribed: false,
        trendPulseAnalyses: 0,
        trendPulseFreeUsed: false,
        trendPulseSubExpiresAt: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        trendPulseSubscribed: true,
        trendPulseAnalyses: true,
        trendPulseFreeUsed: true,
        trendPulseSubExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        trendPulseSubscribed: false,
        trendPulseAnalyses: 0,
        trendPulseFreeUsed: false,
        trendPulseSubExpiresAt: null,
      });
    }

    if (user.trendPulseSubscribed && user.trendPulseSubExpiresAt) {
      if (new Date(user.trendPulseSubExpiresAt) < new Date()) {
        await prisma.user.update({
          where: { email: session.user.email },
          data: { trendPulseSubscribed: false },
        });
        return NextResponse.json({
          ...user,
          trendPulseSubscribed: false,
        });
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("TrendPulse stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
