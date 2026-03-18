// Enhancement #14 & #15: Usage History / Token Usage Breakdown
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any).id;

    // Get token transactions
    const transactions = await prisma.tokenTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Aggregate by type
    const byType = transactions.reduce((acc: Record<string, number>, t) => {
      acc[t.type] = (acc[t.type] ?? 0) + Math.abs(t.amount);
      return acc;
    }, {});

    // Aggregate by tool
    const byTool = transactions.filter(t => t.toolSlug).reduce((acc: Record<string, number>, t) => {
      acc[t.toolSlug!] = (acc[t.toolSlug!] ?? 0) + Math.abs(t.amount);
      return acc;
    }, {});

    // Daily usage (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTx = transactions.filter(t => new Date(t.createdAt) >= thirtyDaysAgo);
    const dailyUsage = recentTx.reduce((acc: Record<string, { earned: number; spent: number }>, t) => {
      const day = new Date(t.createdAt).toISOString().split('T')[0];
      if (!acc[day]) acc[day] = { earned: 0, spent: 0 };
      if (t.amount > 0) acc[day].earned += t.amount;
      else acc[day].spent += Math.abs(t.amount);
      return acc;
    }, {});

    // Get user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tokens: true, scanCount: true, createdAt: true },
    });

    return NextResponse.json({
      currentBalance: user?.tokens ?? 0,
      totalScans: user?.scanCount ?? 0,
      memberSince: user?.createdAt,
      transactions,
      breakdownByType: byType,
      breakdownByTool: byTool,
      dailyUsage,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
