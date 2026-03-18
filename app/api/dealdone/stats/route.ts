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
        dealDoneSubscribed: false,
        dealDoneNegotiations: 0,
        dealDoneSubExpiresAt: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        dealDoneSubscribed: true,
        dealDoneNegotiations: true,
        dealDoneSubExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        dealDoneSubscribed: false,
        dealDoneNegotiations: 0,
        dealDoneSubExpiresAt: null,
      });
    }

    if (user.dealDoneSubscribed && user.dealDoneSubExpiresAt && new Date(user.dealDoneSubExpiresAt) < new Date()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { dealDoneSubscribed: false },
      });
      return NextResponse.json({
        dealDoneSubscribed: false,
        dealDoneNegotiations: user.dealDoneNegotiations,
        dealDoneSubExpiresAt: null,
      });
    }

    return NextResponse.json({
      dealDoneSubscribed: user.dealDoneSubscribed,
      dealDoneNegotiations: user.dealDoneNegotiations,
      dealDoneSubExpiresAt: user.dealDoneSubExpiresAt,
    });
  } catch (error) {
    console.error('Error fetching DealDone stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
