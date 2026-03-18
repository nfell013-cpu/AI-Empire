// Enhancement #1: Email Verification
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified.' });
    }

    if (user.verificationCode !== code) {
      return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 });
    }

    if (user.verificationExpires && new Date() > user.verificationExpires) {
      return NextResponse.json({ error: 'Verification code expired. Please request a new one.' }, { status: 400 });
    }

    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationExpires: null,
      },
    });

    return NextResponse.json({ message: 'Email verified successfully!' });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// Resend verification code
export async function PUT(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email required.' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    if (user.emailVerified) return NextResponse.json({ message: 'Already verified.' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    await prisma.user.update({
      where: { email },
      data: { verificationCode: code, verificationExpires: expires },
    });

    // In production, send email with code. For now log it.
    console.log(`[EMAIL VERIFICATION] Code for ${email}: ${code}`);

    return NextResponse.json({ message: 'Verification code sent to your email.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
