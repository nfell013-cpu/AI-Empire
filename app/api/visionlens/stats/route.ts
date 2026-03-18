import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({
        visionLensSubscribed: false,
        visionLensScans: 0,
        visionLensFreeUsed: false,
        visionLensSubExpiresAt: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        visionLensSubscribed: true,
        visionLensScans: true,
        visionLensFreeUsed: true,
        visionLensSubExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        visionLensSubscribed: false,
        visionLensScans: 0,
        visionLensFreeUsed: false,
        visionLensSubExpiresAt: null,
      });
    }

    if (user.visionLensSubscribed && user.visionLensSubExpiresAt && new Date(user.visionLensSubExpiresAt) < new Date()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { visionLensSubscribed: false },
      });
      return NextResponse.json({
        visionLensSubscribed: false,
        visionLensScans: user.visionLensScans,
        visionLensFreeUsed: user.visionLensFreeUsed,
        visionLensSubExpiresAt: null,
      });
    }

    return NextResponse.json({
      visionLensSubscribed: user.visionLensSubscribed,
      visionLensScans: user.visionLensScans,
      visionLensFreeUsed: user.visionLensFreeUsed,
      visionLensSubExpiresAt: user.visionLensSubExpiresAt,
    });
  } catch (error) {
    console.error('Error fetching VisionLens stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
