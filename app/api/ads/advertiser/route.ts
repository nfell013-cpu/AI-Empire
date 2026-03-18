import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const advertiser = await prisma.advertiser.findUnique({
      where: { email },
      include: {
        ads: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { adViews: true } },
          },
        },
        adPayments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!advertiser) {
      return NextResponse.json({ error: 'Advertiser not found' }, { status: 404 });
    }

    const stats = {
      totalAds: advertiser.ads.length,
      activeAds: advertiser.ads.filter(a => a.status === 'ACTIVE').length,
      pendingAds: advertiser.ads.filter(a => a.status === 'PENDING').length,
      totalImpressions: advertiser.ads.reduce((sum, a) => sum + a.impressions, 0),
      totalClicks: advertiser.ads.reduce((sum, a) => sum + a.clicks, 0),
      totalSpent: advertiser.adPayments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0),
    };

    return NextResponse.json({ advertiser, stats });
  } catch (error) {
    console.error('Advertiser fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch advertiser' }, { status: 500 });
  }
}
