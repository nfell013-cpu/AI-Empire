import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const targetApp = request.nextUrl.searchParams.get('app');

    // Find active ads, optionally filtered by target app
    const whereClause: Record<string, unknown> = { status: 'ACTIVE' };
    if (targetApp) {
      whereClause.targetApps = { has: targetApp };
    }

    const ads = await prisma.ad.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        adType: true,
        adUrl: true,
        duration: true,
        tokensPerView: true,
      },
    });

    // Also check for 'all' target apps
    if (targetApp) {
      const allAppsAds = await prisma.ad.findMany({
        where: { status: 'ACTIVE', targetApps: { has: 'all' } },
        select: {
          id: true,
          title: true,
          description: true,
          adType: true,
          adUrl: true,
          duration: true,
          tokensPerView: true,
        },
      });
      // Merge, deduplicate
      const allIds = new Set(ads.map(a => a.id));
      for (const ad of allAppsAds) {
        if (!allIds.has(ad.id)) ads.push(ad);
      }
    }

    if (ads.length === 0) {
      return NextResponse.json({ ad: null, message: 'No ads available' });
    }

    // Pick random ad
    const randomAd = ads[Math.floor(Math.random() * ads.length)];

    // Track impression
    await prisma.ad.update({
      where: { id: randomAd.id },
      data: { impressions: { increment: 1 } },
    });

    return NextResponse.json({ ad: randomAd });
  } catch (error) {
    console.error('Ad serve error:', error);
    return NextResponse.json({ error: 'Failed to serve ad' }, { status: 500 });
  }
}
