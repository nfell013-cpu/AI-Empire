/**
 * AI Token Reward Formula
 * Calculates tokens earned per ad view based on ad duration
 */

export interface RewardTier {
  minDuration: number;
  maxDuration: number;
  tokens: number;
  label: string;
}

export const REWARD_TIERS: RewardTier[] = [
  { minDuration: 1, maxDuration: 15, tokens: 3, label: 'Quick View' },
  { minDuration: 16, maxDuration: 30, tokens: 5, label: 'Standard' },
  { minDuration: 31, maxDuration: 60, tokens: 10, label: 'Extended' },
  { minDuration: 61, maxDuration: 120, tokens: 20, label: 'Premium' },
  { minDuration: 121, maxDuration: Infinity, tokens: 30, label: 'Mega' },
];

/**
 * Calculate tokens per view based on ad duration
 */
export function calculateTokensPerView(durationSeconds: number): number {
  const tier = REWARD_TIERS.find(
    (t) => durationSeconds >= t.minDuration && durationSeconds <= t.maxDuration
  );
  return tier?.tokens ?? 3;
}

/**
 * Get the reward tier label for a duration
 */
export function getRewardTierLabel(durationSeconds: number): string {
  const tier = REWARD_TIERS.find(
    (t) => durationSeconds >= t.minDuration && durationSeconds <= t.maxDuration
  );
  return tier?.label ?? 'Quick View';
}

/**
 * Verify if user watched enough of the ad to earn tokens
 * Must watch at least 90% of the ad duration
 */
export function verifyFullWatch(watchDuration: number, adDuration: number): boolean {
  if (adDuration <= 0) return false;
  const watchPercentage = watchDuration / adDuration;
  return watchPercentage >= 0.9;
}

/**
 * Get all reward tiers for display
 */
export function getRewardTiers(): RewardTier[] {
  return REWARD_TIERS.map((t) => ({
    ...t,
    maxDuration: t.maxDuration === Infinity ? 999 : t.maxDuration,
  }));
}
