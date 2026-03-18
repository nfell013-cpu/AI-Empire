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
        globeGuideSubscribed: false,
        globeGuideItineraries: 0,
        globeGuideFreeUsed: false,
        globeGuideSubExpiresAt: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        globeGuideSubscribed: true,
        globeGuideItineraries: true,
        globeGuideFreeUsed: true,
        globeGuideSubExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        globeGuideSubscribed: false,
        globeGuideItineraries: 0,
        globeGuideFreeUsed: false,
        globeGuideSubExpiresAt: null,
      });
    }

    // Check subscription expiry
    if (user.globeGuideSubscribed && user.globeGuideSubExpiresAt) {
      if (new Date(user.globeGuideSubExpiresAt) < new Date()) {
        await prisma.user.update({
          where: { email: session.user.email },
          data: { globeGuideSubscribed: false },
        });
        return NextResponse.json({
          ...user,
          globeGuideSubscribed: false,
        });
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GlobeGuide stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
