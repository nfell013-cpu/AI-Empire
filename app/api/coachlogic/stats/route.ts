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
        coachLogicSubscribed: false,
        coachLogicPlans: 0,
        coachLogicFreePlanUsed: false,
        coachLogicSubExpiresAt: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        coachLogicSubscribed: true,
        coachLogicPlans: true,
        coachLogicFreePlanUsed: true,
        coachLogicSubExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        coachLogicSubscribed: false,
        coachLogicPlans: 0,
        coachLogicFreePlanUsed: false,
        coachLogicSubExpiresAt: null,
      });
    }

    if (user.coachLogicSubscribed && user.coachLogicSubExpiresAt && new Date(user.coachLogicSubExpiresAt) < new Date()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { coachLogicSubscribed: false },
      });
      return NextResponse.json({
        coachLogicSubscribed: false,
        coachLogicPlans: user.coachLogicPlans,
        coachLogicFreePlanUsed: user.coachLogicFreePlanUsed,
        coachLogicSubExpiresAt: null,
      });
    }

    return NextResponse.json({
      coachLogicSubscribed: user.coachLogicSubscribed,
      coachLogicPlans: user.coachLogicPlans,
      coachLogicFreePlanUsed: user.coachLogicFreePlanUsed,
      coachLogicSubExpiresAt: user.coachLogicSubExpiresAt,
    });
  } catch (error) {
    console.error('Error fetching CoachLogic stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
