import { prisma } from './db';
import productsConfig from '@/config/products.json';

const tokenCosts = productsConfig.tokenCosts as Record<string, number>;
const tools = productsConfig.tools as Array<{ slug: string; tier: string; name: string }>;

/**
 * Get the token cost for a given tool slug
 */
export function getTokenCost(toolSlug: string): number {
  const tool = tools.find(t => t.slug === toolSlug);
  if (!tool) {
    // For tools not in the 45-tool config, default to standard tier cost
    return tokenCosts.standard || 25;
  }
  return tokenCosts[tool.tier] || 25;
}

/**
 * Get tool info including tier and cost
 */
export function getToolInfo(toolSlug: string) {
  const tool = tools.find(t => t.slug === toolSlug);
  const cost = getTokenCost(toolSlug);
  return { tool, cost };
}

/**
 * Check if user has enough tokens for a tool
 */
export async function checkTokenBalance(userId: string, toolSlug: string): Promise<{
  hasEnough: boolean;
  currentBalance: number;
  cost: number;
  toolName: string;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokens: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const cost = getTokenCost(toolSlug);
  const tool = tools.find(t => t.slug === toolSlug);

  return {
    hasEnough: user.tokens >= cost,
    currentBalance: user.tokens,
    cost,
    toolName: tool?.name || toolSlug,
  };
}

/**
 * Deduct tokens from a user's balance and log the transaction
 * Returns the new balance, or throws if insufficient tokens
 */
export async function deductTokens(
  userId: string,
  toolSlug: string,
  description?: string
): Promise<{ newBalance: number; cost: number }> {
  const cost = getTokenCost(toolSlug);
  const tool = tools.find(t => t.slug === toolSlug);
  const toolName = tool?.name || toolSlug;

  // Use a transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { tokens: true },
    });

    if (!user) throw new Error('User not found');
    if (user.tokens < cost) {
      throw new Error(`Insufficient tokens. Need ${cost}, have ${user.tokens}`);
    }

    const newBalance = user.tokens - cost;

    // Update user balance
    await tx.user.update({
      where: { id: userId },
      data: { tokens: newBalance },
    });

    // Log the transaction
    await tx.tokenTransaction.create({
      data: {
        userId,
        amount: -cost,
        balance: newBalance,
        type: 'usage',
        description: description || `Used ${toolName}`,
        toolSlug,
      },
    });

    return { newBalance, cost };
  });

  return result;
}

/**
 * Add tokens to a user's balance (for purchases, bonuses, refunds)
 */
export async function addTokens(
  userId: string,
  amount: number,
  type: 'purchase' | 'bonus' | 'refund',
  description: string,
  stripeSessionId?: string
): Promise<{ newBalance: number }> {
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { tokens: true },
    });

    if (!user) throw new Error('User not found');

    const newBalance = user.tokens + amount;

    await tx.user.update({
      where: { id: userId },
      data: { tokens: newBalance },
    });

    await tx.tokenTransaction.create({
      data: {
        userId,
        amount,
        balance: newBalance,
        type,
        description,
        stripeSessionId,
      },
    });

    return { newBalance };
  });

  return result;
}

/**
 * Get token transaction history for a user
 */
export async function getTokenHistory(
  userId: string,
  limit = 50,
  offset = 0
) {
  const [transactions, total] = await Promise.all([
    prisma.tokenTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.tokenTransaction.count({ where: { userId } }),
  ]);

  return { transactions, total };
}
