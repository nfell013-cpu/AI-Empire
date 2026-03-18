export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [
      // Revenue data
      totalTokenRevenue,
      monthTokenRevenue,
      weekTokenRevenue,
      todayTokenRevenue,
      totalAdRevenue,
      monthAdRevenue,
      // User stats
      totalUsers,
      activeUsersWeek,
      newUsersMonth,
      // Token economy
      totalTokensIssued,
      totalTokensSpent,
      avgTokensPerUser,
      // Ad system
      totalAds,
      pendingAds,
      approvedAds,
      rejectedAds,
      activeAds,
      // Recent data
      recentSignups,
      recentPurchases,
      recentAdSubmissions,
      // Tool usage
      toolUsageAll,
      // Daily active users (30 days)
      dailyTransactions,
      // User signups over time
      usersByMonth,
      // Revenue over time (90 days)
      revenueTransactions,
    ] = await Promise.all([
      // Token purchase revenue
      prisma.tokenPurchase.aggregate({
        where: { status: 'completed' },
        _sum: { priceInCents: true },
      }),
      prisma.tokenPurchase.aggregate({
        where: { status: 'completed', completedAt: { gte: monthAgo } },
        _sum: { priceInCents: true },
      }),
      prisma.tokenPurchase.aggregate({
        where: { status: 'completed', completedAt: { gte: weekAgo } },
        _sum: { priceInCents: true },
      }),
      prisma.tokenPurchase.aggregate({
        where: { status: 'completed', completedAt: { gte: todayStart } },
        _sum: { priceInCents: true },
      }),
      // Ad revenue
      prisma.adPayment.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true },
      }),
      prisma.adPayment.aggregate({
        where: { status: 'completed', createdAt: { gte: monthAgo } },
        _sum: { amount: true },
      }),
      // Users
      prisma.user.count(),
      prisma.user.count({
        where: { tokenTransactions: { some: { createdAt: { gte: weekAgo } } } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: monthAgo } },
      }),
      // Token economy
      prisma.tokenTransaction.aggregate({
        where: { amount: { gt: 0 } },
        _sum: { amount: true },
      }),
      prisma.tokenTransaction.aggregate({
        where: { amount: { lt: 0 } },
        _sum: { amount: true },
      }),
      prisma.user.aggregate({
        _avg: { tokens: true },
      }),
      // Ads
      prisma.ad.count(),
      prisma.ad.count({ where: { status: 'PENDING' } }),
      prisma.ad.count({ where: { status: { in: ['APPROVED', 'ACTIVE'] } } }),
      prisma.ad.count({ where: { status: 'REJECTED' } }),
      prisma.ad.count({ where: { status: 'ACTIVE' } }),
      // Recent activity
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, email: true, firstName: true, createdAt: true },
      }),
      prisma.tokenPurchase.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, userId: true, packageId: true, tokenAmount: true, priceInCents: true, status: true, createdAt: true },
      }),
      prisma.ad.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { advertiser: { select: { email: true, companyName: true } } },
      }),
      // Tool usage (all)
      prisma.tokenTransaction.groupBy({
        by: ['toolSlug'],
        where: { type: 'usage', toolSlug: { not: null } },
        _count: true,
        _sum: { amount: true },
      }),
      // Daily transactions for DAU proxy (last 30 days)
      prisma.tokenTransaction.findMany({
        where: { createdAt: { gte: monthAgo } },
        select: { userId: true, createdAt: true },
      }),
      // Users signups (group by month - get all users)
      prisma.user.findMany({
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Revenue transactions (90 days)
      prisma.tokenPurchase.findMany({
        where: { status: 'completed', createdAt: { gte: ninetyDaysAgo } },
        select: { priceInCents: true, createdAt: true },
      }),
    ]);

    // Calculate daily active users
    const dauMap: Record<string, Set<string>> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(monthAgo.getTime() + i * 24 * 60 * 60 * 1000);
      dauMap[d.toISOString().split('T')[0]] = new Set();
    }
    dailyTransactions.forEach((tx) => {
      const key = tx.createdAt.toISOString().split('T')[0];
      if (dauMap[key]) dauMap[key].add(tx.userId);
    });
    const dailyActiveUsers = Object.entries(dauMap).map(([date, users]) => ({
      date: date.slice(5),
      users: users.size,
    }));

    // User signups over time (by month)
    const signupMap: Record<string, number> = {};
    usersByMonth.forEach((u) => {
      const key = u.createdAt.toISOString().slice(0, 7); // YYYY-MM
      signupMap[key] = (signupMap[key] || 0) + 1;
    });
    const signupsOverTime = Object.entries(signupMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, count]) => ({ month, signups: count }));

    // Revenue over time (90 days, by week)
    const revenueByWeek: Record<string, number> = {};
    for (let i = 0; i < 13; i++) {
      const d = new Date(ninetyDaysAgo.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      revenueByWeek[d.toISOString().split('T')[0]] = 0;
    }
    revenueTransactions.forEach((tx) => {
      // Find the closest week start
      const txDate = tx.createdAt.getTime();
      let closestKey = Object.keys(revenueByWeek)[0];
      for (const key of Object.keys(revenueByWeek)) {
        if (new Date(key).getTime() <= txDate) closestKey = key;
      }
      revenueByWeek[closestKey] = (revenueByWeek[closestKey] || 0) + (tx.priceInCents || 0);
    });
    const revenueOverTime = Object.entries(revenueByWeek).map(([date, cents]) => ({
      date: date.slice(5),
      revenue: Number((cents / 100).toFixed(2)),
    }));

    // Tool popularity
    const toolPopularity = toolUsageAll
      .map((t) => ({
        tool: t.toolSlug || 'unknown',
        usage: t._count,
        revenue: Math.abs(t._sum.amount || 0),
      }))
      .sort((a, b) => b.usage - a.usage);

    // Revenue breakdown
    const tokenRevTotal = (totalTokenRevenue._sum.priceInCents || 0) / 100;
    const adRevTotal = (totalAdRevenue._sum.amount || 0) / 100;

    // Token velocity (avg tokens spent per day, last 30 days)
    const totalSpent30 = dailyTransactions.filter((tx) => {
      // We don't have amount here, approximate
      return true;
    }).length;

    return NextResponse.json({
      revenue: {
        total: tokenRevTotal + adRevTotal,
        thisMonth: ((monthTokenRevenue._sum.priceInCents || 0) + (monthAdRevenue._sum.amount || 0)) / 100,
        thisWeek: (weekTokenRevenue._sum.priceInCents || 0) / 100,
        today: (todayTokenRevenue._sum.priceInCents || 0) / 100,
        tokenSales: tokenRevTotal,
        adRevenue: adRevTotal,
      },
      revenueOverTime,
      revenueBySource: [
        { name: 'Token Packages', value: tokenRevTotal || 0 },
        { name: 'Ad Revenue', value: adRevTotal || 0 },
      ],
      users: {
        total: totalUsers,
        activeThisWeek: activeUsersWeek,
        newThisMonth: newUsersMonth,
        churnRate: totalUsers > 0 ? (((totalUsers - activeUsersWeek) / totalUsers) * 100).toFixed(1) : '0',
      },
      dailyActiveUsers,
      signupsOverTime,
      tokenEconomy: {
        totalIssued: totalTokensIssued._sum.amount || 0,
        totalConsumed: Math.abs(totalTokensSpent._sum.amount || 0),
        avgPerUser: Math.round(avgTokensPerUser._avg.tokens || 0),
        velocityPerDay: Math.round(Math.abs(totalTokensSpent._sum.amount || 0) / 30),
      },
      adSystem: {
        total: totalAds,
        pending: pendingAds,
        approved: approvedAds,
        rejected: rejectedAds,
        active: activeAds,
        totalAdRevenue: adRevTotal,
      },
      toolPopularity,
      recentActivity: {
        signups: recentSignups,
        purchases: recentPurchases,
        adSubmissions: recentAdSubmissions.map((a) => ({
          id: a.id,
          title: a.title,
          status: a.status,
          advertiser: a.advertiser.companyName || a.advertiser.email,
          createdAt: a.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
