export const dynamic = 'force-dynamic';

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
            adViews: {
              select: { createdAt: true, tokensEarned: true, watchedFullAd: true },
            },
          },
        },
        adPayments: {
          orderBy: { createdAt: 'desc' },
          select: { id: true, amount: true, status: true, createdAt: true },
        },
      },
    });

    if (!advertiser) {
      return NextResponse.json({ error: 'Advertiser not found' }, { status: 404 });
    }

    // Calculate stats
    const ads = advertiser.ads;
    const totalAds = ads.length;
    const activeAds = ads.filter((a) => a.status === 'ACTIVE').length;
    const totalImpressions = ads.reduce((sum, a) => sum + a.impressions, 0);
    const totalClicks = ads.reduce((sum, a) => sum + a.clicks, 0);
    const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

    const totalSpent = advertiser.adPayments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    // Ad performance table
    const adPerformance = ads.map((ad) => ({
      id: ad.id,
      title: ad.title,
      status: ad.status,
      adType: ad.adType,
      impressions: ad.impressions,
      clicks: ad.clicks,
      ctr: ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00',
      cost: (ad.cost / 100).toFixed(2),
      views: ad._count.adViews,
      createdAt: ad.createdAt,
    }));

    // Impressions over time (last 30 days) - from ad views
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyMetrics: Record<string, { date: string; impressions: number; clicks: number }> = {};

    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      dailyMetrics[key] = { date: key, impressions: 0, clicks: 0 };
    }

    ads.forEach((ad) => {
      ad.adViews.forEach((view) => {
        const key = view.createdAt.toISOString().split('T')[0];
        if (dailyMetrics[key]) {
          dailyMetrics[key].impressions += 1;
          if (view.watchedFullAd) dailyMetrics[key].clicks += 1;
        }
      });
    });

    const dailyTimeSeries = Object.values(dailyMetrics).map((d) => ({
      date: d.date.slice(5),
      impressions: d.impressions,
      clicks: d.clicks,
    }));

    // Performance by ad type
    const byType: Record<string, { impressions: number; clicks: number; count: number }> = {};
    ads.forEach((ad) => {
      if (!byType[ad.adType]) byType[ad.adType] = { impressions: 0, clicks: 0, count: 0 };
      byType[ad.adType].impressions += ad.impressions;
      byType[ad.adType].clicks += ad.clicks;
      byType[ad.adType].count += 1;
    });
    const performanceByType = Object.entries(byType).map(([type, data]) => ({
      type,
      ...data,
    }));

    // Top performers
    const topByImpressions = [...adPerformance]
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 3);
    const topByCTR = [...adPerformance]
      .sort((a, b) => parseFloat(b.ctr) - parseFloat(a.ctr))
      .slice(0, 3);

    return NextResponse.json({
      overview: {
        totalAds,
        activeAds,
        totalSpentCents: totalSpent,
        totalSpent: (totalSpent / 100).toFixed(2),
        totalImpressions,
        totalClicks,
        avgCTR,
      },
      adPerformance,
      dailyTimeSeries,
      performanceByType,
      topByImpressions,
      topByCTR,
      payments: advertiser.adPayments,
    });
  } catch (error) {
    console.error('Advertiser analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
