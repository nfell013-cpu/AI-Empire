// Enhancement #3: Two-Factor Authentication
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

// Enable/disable 2FA
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any).id;

    const { action } = await request.json();

    if (action === 'enable') {
      // Generate a TOTP-compatible secret (base32)
      const secret = crypto.randomBytes(20).toString('hex').slice(0, 16).toUpperCase();
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorSecret: secret, twoFactorEnabled: true },
      });
      return NextResponse.json({
        message: '2FA enabled successfully',
        secret,
        setupNote: 'Use this secret with any TOTP authenticator app (Google Authenticator, Authy, etc.)',
      });
    } else if (action === 'disable') {
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: false, twoFactorSecret: null },
      });
      return NextResponse.json({ message: '2FA disabled successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('2FA error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get 2FA status
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    });

    return NextResponse.json({ twoFactorEnabled: user?.twoFactorEnabled ?? false });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
