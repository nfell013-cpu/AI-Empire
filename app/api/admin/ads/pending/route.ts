import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const pendingAds = await prisma.ad.findMany({
      where: { status: 'PENDING' },
      include: {
        advertiser: {
          select: { email: true, companyName: true, phone: true },
        },
        adPayments: {
          select: { amount: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ ads: pendingAds });
  } catch (error) {
    console.error('Pending ads fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch pending ads' }, { status: 500 });
  }
}
