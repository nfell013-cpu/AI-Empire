import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import productsConfig from "@/config/products.json";

const allTools = productsConfig.tools as Array<{ slug: string; name: string; category: string; description: string }>;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get user's recent tool usage to determine preferences
  const recentUsage = await prisma.tokenTransaction.findMany({
    where: { userId: session.user.id, type: "usage", toolSlug: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { toolSlug: true },
  });

  const usedSlugs = new Set(recentUsage.map((t) => t.toolSlug).filter(Boolean));

  // Find categories the user likes
  const categoryCounts: Record<string, number> = {};
  for (const t of recentUsage) {
    const tool = allTools.find((at) => at.slug === t.toolSlug);
    if (tool) {
      categoryCounts[tool.category] = (categoryCounts[tool.category] || 0) + 1;
    }
  }

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  // Recommend tools from preferred categories that haven't been used
  let recommended = allTools.filter(
    (t) => topCategories.includes(t.category) && !usedSlugs.has(t.slug)
  );

  // If not enough, add popular tools the user hasn't tried
  if (recommended.length < 5) {
    const unused = allTools.filter((t) => !usedSlugs.has(t.slug) && !recommended.includes(t));
    recommended = [...recommended, ...unused.slice(0, 5 - recommended.length)];
  }

  return NextResponse.json({
    recommended: recommended.slice(0, 6),
    basedOn: topCategories,
    totalUsed: usedSlugs.size,
  });
}
