import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { verifyFullWatch } from '@/lib/ad-rewards';
import { addTokens } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const { adId, watchDuration } = body;

    if (!adId || watchDuration === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: adId, watchDuration' },
        { status: 400 }
      );
    }

    // Get ad details
    const ad = await prisma.ad.findUnique({ where: { id: adId } });
    if (!ad || ad.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Ad not found or inactive' }, { status: 404 });
    }

    // Verify full watch
    const watchedFullAd = verifyFullWatch(watchDuration, ad.duration);
    let tokensEarned = 0;

    if (watchedFullAd) {
      tokensEarned = ad.tokensPerView;
      // Credit tokens
      await addTokens(userId, tokensEarned, 'bonus', `Watched ad: ${ad.title}`);
    }

    // Track click
    await prisma.ad.update({
      where: { id: adId },
      data: { clicks: { increment: 1 } },
    });

    // Create AdView record
    await prisma.adView.create({
      data: {
        adId,
        userId,
        tokensEarned,
        watchedFullAd,
        watchDuration: Math.round(watchDuration),
      },
    });

    return NextResponse.json({
      success: true,
      watchedFullAd,
      tokensEarned,
      message: watchedFullAd
        ? `You earned ${tokensEarned} tokens!`
        : 'You need to watch the full ad to earn tokens.',
    });
  } catch (error) {
    console.error('Ad view error:', error);
    return NextResponse.json({ error: 'Failed to record ad view' }, { status: 500 });
  }
}
