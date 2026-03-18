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
        memeMintSubscribed: false,
        memeMintCreations: 0,
        memeMintFreeUsed: false,
        memeMintSubExpiresAt: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        memeMintSubscribed: true,
        memeMintCreations: true,
        memeMintFreeUsed: true,
        memeMintSubExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        memeMintSubscribed: false,
        memeMintCreations: 0,
        memeMintFreeUsed: false,
        memeMintSubExpiresAt: null,
      });
    }

    // Check subscription expiry
    if (user.memeMintSubscribed && user.memeMintSubExpiresAt) {
      if (new Date(user.memeMintSubExpiresAt) < new Date()) {
        await prisma.user.update({
          where: { email: session.user.email },
          data: { memeMintSubscribed: false },
        });
        return NextResponse.json({
          ...user,
          memeMintSubscribed: false,
        });
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("MemeMint stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
