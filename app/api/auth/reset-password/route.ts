// Enhancement #2: Password Reset
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Request password reset
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email required.' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpires: expires },
    });

    // In production, send email. For now log.
    console.log(`[PASSWORD RESET] Token for ${email}: ${token}`);
    console.log(`[PASSWORD RESET] Reset URL: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}&email=${email}`);

    return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// Perform password reset
export async function PUT(request: NextRequest) {
  try {
    const { email, token, newPassword } = await request.json();
    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: 'All fields required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.resetToken !== token) {
      return NextResponse.json({ error: 'Invalid or expired reset token.' }, { status: 400 });
    }

    if (user.resetTokenExpires && new Date() > user.resetTokenExpires) {
      return NextResponse.json({ error: 'Reset token expired.' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { email },
      data: { password: hashed, resetToken: null, resetTokenExpires: null },
    });

    return NextResponse.json({ message: 'Password reset successfully!' });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
