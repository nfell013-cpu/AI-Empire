// Enhancement #13: Referral Program
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { generateReferralCode } from '@/lib/referral';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any).id;

    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true, referralTokensEarned: true, referredBy: true },
    });

    // Generate referral code if user doesn't have one
    if (!user?.referralCode) {
      let code = generateReferralCode();
      // Ensure uniqueness
      let exists = await prisma.user.findUnique({ where: { referralCode: code } });
      while (exists) {
        code = generateReferralCode();
        exists = await prisma.user.findUnique({ where: { referralCode: code } });
      }
      user = await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code },
        select: { referralCode: true, referralTokensEarned: true, referredBy: true },
      });
    }

    // Count referrals
    const referralCount = await prisma.user.count({ where: { referredBy: user!.referralCode! } });

    return NextResponse.json({
      referralCode: user!.referralCode,
      referralTokensEarned: user!.referralTokensEarned,
      referralCount,
      referralLink: `${process.env.NEXTAUTH_URL ?? 'https://aiempire-one.vercel.app'}/auth/signup?ref=${user!.referralCode}`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
