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
        pawPairPurchased: false,
        pawPairQuizzes: 0,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        pawPairPurchased: true,
        pawPairQuizzes: true,
      },
    });

    return NextResponse.json({
      pawPairPurchased: user?.pawPairPurchased || false,
      pawPairQuizzes: user?.pawPairQuizzes || 0,
    });
  } catch (error) {
    console.error('Error fetching PawPair stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
