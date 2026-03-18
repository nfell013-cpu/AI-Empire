import { NextRequest, NextResponse } from 'next/server';
import { calculateAdPrice, getSuggestedTiers } from '@/lib/ad-pricing';
import { calculateTokensPerView, getRewardTierLabel } from '@/lib/ad-rewards';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { duration, targetApps, adType } = body;

    if (!duration || !targetApps || !adType) {
      return NextResponse.json(
        { error: 'Missing required fields: duration, targetApps, adType' },
        { status: 400 }
      );
    }

    if (!['VIDEO', 'IMAGE', 'TEXT'].includes(adType)) {
      return NextResponse.json(
        { error: 'adType must be VIDEO, IMAGE, or TEXT' },
        { status: 400 }
      );
    }

    const pricing = calculateAdPrice({ duration, targetApps, adType });
    const tokensPerView = calculateTokensPerView(duration);
    const rewardTier = getRewardTierLabel(duration);
    const suggestedTiers = getSuggestedTiers();

    return NextResponse.json({
      pricing,
      tokensPerView,
      rewardTier,
      suggestedTiers,
    });
  } catch (error) {
    console.error('Pricing calculation error:', error);
    return NextResponse.json({ error: 'Failed to calculate pricing' }, { status: 500 });
  }
}
