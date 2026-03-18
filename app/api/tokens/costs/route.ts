export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import productsConfig from '@/config/products.json';

export async function GET() {
  const tokenCosts = productsConfig.tokenCosts as Record<string, number>;
  const tools = (productsConfig.tools as Array<{ slug: string; tier: string; name: string; category: string }>).map(t => ({
    slug: t.slug,
    name: t.name,
    tier: t.tier,
    category: t.category,
    cost: tokenCosts[t.tier] || 25,
  }));

  return NextResponse.json({ tokenCosts, tools });
}
