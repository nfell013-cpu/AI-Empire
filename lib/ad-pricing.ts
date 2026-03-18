/**
 * AI-Guided Ad Pricing System
 * Calculates ad cost based on duration, target apps, and ad type
 */

const BASE_PRICE_CENTS = 2500; // $25 base
const PER_SECOND_RATE = 50; // $0.50 per second
const ALL_APPS_MULTIPLIER = 3.0;
const MULTI_APP_MULTIPLIER = 1.5;
const SINGLE_APP_MULTIPLIER = 1.0;

const AD_TYPE_MULTIPLIERS: Record<string, number> = {
  VIDEO: 1.5,
  IMAGE: 1.0,
  TEXT: 0.7,
};

export interface PricingInput {
  duration: number; // seconds
  targetApps: string[]; // app slugs or ['all']
  adType: 'VIDEO' | 'IMAGE' | 'TEXT';
}

export interface PricingBreakdown {
  basePriceCents: number;
  durationCostCents: number;
  placementMultiplier: number;
  typeMultiplier: number;
  totalCents: number;
  totalDollars: string;
  perImpressionEstimate: string;
  recommendations: string[];
}

const TOTAL_APPS = 15;

export function calculateAdPrice(input: PricingInput): PricingBreakdown {
  const { duration, targetApps, adType } = input;

  const durationCostCents = duration * PER_SECOND_RATE;
  const typeMultiplier = AD_TYPE_MULTIPLIERS[adType] || 1.0;

  let placementMultiplier = SINGLE_APP_MULTIPLIER;
  if (targetApps.includes('all') || targetApps.length >= TOTAL_APPS) {
    placementMultiplier = ALL_APPS_MULTIPLIER;
  } else if (targetApps.length > 1) {
    placementMultiplier = SINGLE_APP_MULTIPLIER + (targetApps.length / TOTAL_APPS) * (MULTI_APP_MULTIPLIER - SINGLE_APP_MULTIPLIER);
  }

  const totalCents = Math.round(
    (BASE_PRICE_CENTS + durationCostCents) * placementMultiplier * typeMultiplier
  );

  const recommendations = generateRecommendations(input, totalCents);

  return {
    basePriceCents: BASE_PRICE_CENTS,
    durationCostCents,
    placementMultiplier: Math.round(placementMultiplier * 100) / 100,
    typeMultiplier,
    totalCents,
    totalDollars: (totalCents / 100).toFixed(2),
    perImpressionEstimate: (totalCents / 100 / 1000).toFixed(4),
    recommendations,
  };
}

function generateRecommendations(input: PricingInput, totalCents: number): string[] {
  const recs: string[] = [];

  if (input.duration > 60) {
    recs.push('🎯 AI Tip: Ads under 60 seconds have 3x higher completion rates. Consider trimming your ad.');
  }
  if (input.duration <= 15) {
    recs.push('⚡ Short ads (15s) are the most cost-effective with highest engagement.');
  }
  if (input.adType === 'VIDEO') {
    recs.push('🎬 Video ads get 2x more engagement than image or text ads.');
  }
  if (input.adType === 'TEXT') {
    recs.push('💡 Consider upgrading to IMAGE or VIDEO for 40-100% more engagement.');
  }
  if (input.targetApps.includes('all')) {
    recs.push('🌐 All-app placement maximizes reach across 15 AI tools and 1000+ daily users.');
  }
  if (input.targetApps.length === 1 && !input.targetApps.includes('all')) {
    recs.push('📊 Target 3-5 apps for the best balance of reach and cost efficiency.');
  }

  // Suggest best value tiers
  if (totalCents > 15000) {
    recs.push('💰 Premium placement! Your ad will reach our highest-value users.');
  } else if (totalCents < 5000) {
    recs.push('🚀 Great starter price! Consider increasing duration for even more visibility.');
  }

  return recs;
}

export function getSuggestedTiers() {
  return [
    {
      name: 'Starter',
      duration: 15,
      adType: 'IMAGE' as const,
      targetApps: ['flipscore'],
      estimatedCost: calculateAdPrice({ duration: 15, adType: 'IMAGE', targetApps: ['flipscore'] }).totalDollars,
      description: 'Perfect for testing the waters. Single app, short ad.',
    },
    {
      name: 'Growth',
      duration: 30,
      adType: 'VIDEO' as const,
      targetApps: ['flipscore', 'legalese', 'tradeace'],
      estimatedCost: calculateAdPrice({ duration: 30, adType: 'VIDEO', targetApps: ['flipscore', 'legalese', 'tradeace'] }).totalDollars,
      description: 'Best value. Video ad across 3 popular tools.',
    },
    {
      name: 'Pro',
      duration: 30,
      adType: 'VIDEO' as const,
      targetApps: ['all'],
      estimatedCost: calculateAdPrice({ duration: 30, adType: 'VIDEO', targetApps: ['all'] }).totalDollars,
      description: 'Maximum reach. Video ad across all 15 AI tools.',
    },
    {
      name: 'Enterprise',
      duration: 60,
      adType: 'VIDEO' as const,
      targetApps: ['all'],
      estimatedCost: calculateAdPrice({ duration: 60, adType: 'VIDEO', targetApps: ['all'] }).totalDollars,
      description: 'Full brand experience. Long-form video, all tools.',
    },
  ];
}
