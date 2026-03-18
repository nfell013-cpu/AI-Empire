import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string; role?: string } | undefined;
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalUsers, totalTokenTransactions, tokenPurchases, adPayments, adViews] = await Promise.all([
    prisma.user.count(),
    prisma.tokenTransaction.aggregate({ _sum: { amount: true }, where: { type: "purchase" } }),
    prisma.tokenTransaction.count({ where: { type: "purchase" } }),
    prisma.adPayment.aggregate({ _sum: { amount: true }, where: { status: "completed" } }),
    prisma.adView.count(),
  ]);

  // Recent signups (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSignups = await prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } });

  // Daily signups for chart
  const dailySignups = await prisma.$queryRawUnsafe<Array<{ day: string; count: bigint }>>(
    `SELECT DATE("createdAt") as day, COUNT(*) as count FROM "User" WHERE "createdAt" >= $1 GROUP BY DATE("createdAt") ORDER BY day`,
    thirtyDaysAgo
  );

  // Top tools by usage
  const topTools = await prisma.tokenTransaction.groupBy({
    by: ["toolSlug"],
    where: { type: "usage", toolSlug: { not: null } },
    _count: true,
    _sum: { amount: true },
    orderBy: { _count: { toolSlug: "desc" } },
    take: 15,
  });

  return NextResponse.json({
    overview: {
      totalUsers,
      recentSignups,
      tokensPurchased: tokenPurchases,
      tokenRevenue: totalTokenTransactions._sum.amount ?? 0,
      adRevenue: adPayments._sum.amount ?? 0,
      totalAdViews: adViews,
    },
    dailySignups: dailySignups.map((d) => ({ day: String(d.day), count: Number(d.count) })),
    topTools: topTools.map((t) => ({
      tool: t.toolSlug,
      uses: t._count,
      tokensSpent: Math.abs(t._sum.amount ?? 0),
    })),
  });
}
