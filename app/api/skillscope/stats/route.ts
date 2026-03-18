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
        skillScopeSubscribed: false,
        skillScopeAnalyses: 0,
        skillScopeFreeUsed: false,
        skillScopeSubExpiresAt: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        skillScopeSubscribed: true,
        skillScopeAnalyses: true,
        skillScopeFreeUsed: true,
        skillScopeSubExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        skillScopeSubscribed: false,
        skillScopeAnalyses: 0,
        skillScopeFreeUsed: false,
        skillScopeSubExpiresAt: null,
      });
    }

    if (user.skillScopeSubscribed && user.skillScopeSubExpiresAt) {
      if (new Date(user.skillScopeSubExpiresAt) < new Date()) {
        await prisma.user.update({
          where: { email: session.user.email },
          data: { skillScopeSubscribed: false },
        });
        return NextResponse.json({
          ...user,
          skillScopeSubscribed: false,
        });
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("SkillScope stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
