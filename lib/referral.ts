// Enhancement #13: Referral Program utilities
import { prisma } from './db';
import { addTokens } from './tokens';

const REFERRAL_BONUS = 50; // tokens for referrer
const REFERRED_BONUS = 25; // tokens for new user

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'REF-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function processReferral(newUserId: string, referralCode: string): Promise<boolean> {
  try {
    const referrer = await prisma.user.findUnique({ where: { referralCode } });
    if (!referrer) return false;

    // Credit referrer
    await addTokens(referrer.id, REFERRAL_BONUS, 'bonus', 'Referral bonus - new user signed up');
    await prisma.user.update({
      where: { id: referrer.id },
      data: { referralTokensEarned: { increment: REFERRAL_BONUS } },
    });

    // Credit new user
    await addTokens(newUserId, REFERRED_BONUS, 'bonus', 'Welcome bonus - referred by a friend');

    // Create notifications
    await prisma.notification.create({
      data: {
        userId: referrer.id,
        title: 'Referral Bonus!',
        message: `You earned ${REFERRAL_BONUS} tokens for referring a friend!`,
        type: 'success',
        link: '/dashboard',
      },
    });

    return true;
  } catch (error) {
    console.error('Referral processing error:', error);
    return false;
  }
}
