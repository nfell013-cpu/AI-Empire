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
        guardianAISubscribed: false,
        guardianAIScans: 0,
        guardianAIFreeUsed: false,
        guardianAISubExpiresAt: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        guardianAISubscribed: true,
        guardianAIScans: true,
        guardianAIFreeUsed: true,
        guardianAISubExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        guardianAISubscribed: false,
        guardianAIScans: 0,
        guardianAIFreeUsed: false,
        guardianAISubExpiresAt: null,
      });
    }

    if (user.guardianAISubscribed && user.guardianAISubExpiresAt) {
      if (new Date(user.guardianAISubExpiresAt) < new Date()) {
        await prisma.user.update({
          where: { email: session.user.email },
          data: { guardianAISubscribed: false },
        });
        return NextResponse.json({
          ...user,
          guardianAISubscribed: false,
        });
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GuardianAI stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
