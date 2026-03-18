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
        leafCheckSubscribed: false,
        leafCheckScans: 0,
        leafCheckFreeUsed: false,
        leafCheckSubExpiresAt: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        leafCheckSubscribed: true,
        leafCheckScans: true,
        leafCheckFreeUsed: true,
        leafCheckSubExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        leafCheckSubscribed: false,
        leafCheckScans: 0,
        leafCheckFreeUsed: false,
        leafCheckSubExpiresAt: null,
      });
    }

    if (user.leafCheckSubscribed && user.leafCheckSubExpiresAt && new Date(user.leafCheckSubExpiresAt) < new Date()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { leafCheckSubscribed: false },
      });
      return NextResponse.json({
        leafCheckSubscribed: false,
        leafCheckScans: user.leafCheckScans,
        leafCheckFreeUsed: user.leafCheckFreeUsed,
        leafCheckSubExpiresAt: null,
      });
    }

    return NextResponse.json({
      leafCheckSubscribed: user.leafCheckSubscribed,
      leafCheckScans: user.leafCheckScans,
      leafCheckFreeUsed: user.leafCheckFreeUsed,
      leafCheckSubExpiresAt: user.leafCheckSubExpiresAt,
    });
  } catch (error) {
    console.error('Error fetching LeafCheck stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
