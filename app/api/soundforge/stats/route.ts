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
        soundForgeSubscribed: false,
        soundForgeTracks: 0,
        soundForgeFreeUsed: false,
        soundForgeSubExpiresAt: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        soundForgeSubscribed: true,
        soundForgeTracks: true,
        soundForgeFreeUsed: true,
        soundForgeSubExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        soundForgeSubscribed: false,
        soundForgeTracks: 0,
        soundForgeFreeUsed: false,
        soundForgeSubExpiresAt: null,
      });
    }

    // Check subscription expiry
    if (user.soundForgeSubscribed && user.soundForgeSubExpiresAt) {
      if (new Date(user.soundForgeSubExpiresAt) < new Date()) {
        await prisma.user.update({
          where: { email: session.user.email },
          data: { soundForgeSubscribed: false },
        });
        return NextResponse.json({
          ...user,
          soundForgeSubscribed: false,
        });
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("SoundForge stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
