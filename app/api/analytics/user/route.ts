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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, tokens: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = user.id;

    // Token overview
    const [
      totalPurchased,
      totalEarnedFromAds,
      totalSpent,
      tokenTransactions,
      recentTransactions,
      adViewStats,
    ] = await Promise.all([
      // Total tokens purchased
      prisma.tokenTransaction.aggregate({
        where: { userId, type: 'purchase', amount: { gt: 0 } },
        _sum: { amount: true },
      }),
      // Total earned from ads (bonus type from ad views)
      prisma.tokenTransaction.aggregate({
        where: { userId, type: 'bonus', amount: { gt: 0 } },
        _sum: { amount: true },
      }),
      // Total tokens spent
      prisma.tokenTransaction.aggregate({
        where: { userId, type: 'usage', amount: { lt: 0 } },
        _sum: { amount: true },
      }),
      // Token transactions for chart (last 30 days)
      prisma.tokenTransaction.findMany({
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        orderBy: { createdAt: 'asc' },
        select: { amount: true, balance: true, type: true, createdAt: true, toolSlug: true, description: true },
      }),
      // Recent 10 transactions
      prisma.tokenTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, amount: true, balance: true, type: true, description: true, toolSlug: true, createdAt: true },
      }),
      // Ad viewing stats
      prisma.adView.aggregate({
        where: { userId },
        _count: true,
        _sum: { tokensEarned: true },
      }),
    ]);

    // Tool usage breakdown
    const toolUsage = await prisma.tokenTransaction.groupBy({
      by: ['toolSlug'],
      where: { userId, type: 'usage', toolSlug: { not: null } },
      _count: true,
      _sum: { amount: true },
    });

    // Daily spending (last 30 days) - aggregate by date
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyData: Record<string, { spent: number; balance: number; date: string }> = {};

    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      dailyData[key] = { spent: 0, balance: 0, date: key };
    }

    let lastBalance = user.tokens;
    tokenTransactions.forEach((tx) => {
      const key = tx.createdAt.toISOString().split('T')[0];
      if (dailyData[key]) {
        if (tx.type === 'usage') {
          dailyData[key].spent += Math.abs(tx.amount);
        }
        dailyData[key].balance = tx.balance;
        lastBalance = tx.balance;
      }
    });

    // Fill forward balances
    let prevBalance = 0;
    const balanceOverTime = Object.values(dailyData).map((d) => {
      if (d.balance === 0) d.balance = prevBalance;
      prevBalance = d.balance;
      return { date: d.date.slice(5), balance: d.balance, spent: d.spent };
    });

    return NextResponse.json({
      tokenOverview: {
        currentBalance: user.tokens,
        totalPurchased: totalPurchased._sum.amount || 0,
        totalEarnedFromAds: totalEarnedFromAds._sum.amount || 0,
        totalSpent: Math.abs(totalSpent._sum.amount || 0),
      },
      balanceOverTime,
      toolUsage: toolUsage.map((t) => ({
        tool: t.toolSlug || 'unknown',
        count: t._count,
        tokensSpent: Math.abs(t._sum.amount || 0),
      })).sort((a, b) => b.count - a.count),
      adStats: {
        totalAdsWatched: adViewStats._count,
        totalTokensEarned: adViewStats._sum.tokensEarned || 0,
        avgTokensPerAd: adViewStats._count > 0
          ? Math.round((adViewStats._sum.tokensEarned || 0) / adViewStats._count)
          : 0,
      },
      recentTransactions,
    });
  } catch (error) {
    console.error('User analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
