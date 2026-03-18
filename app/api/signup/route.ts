import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { generateReferralCode, processReferral } from "@/lib/referral";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, referralCode } = body ?? {};

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);

    // Generate verification code for email verification (Enhancement #1)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    // Generate unique referral code (Enhancement #13)
    let userReferralCode = generateReferralCode();
    let codeExists = await prisma.user.findUnique({ where: { referralCode: userReferralCode } });
    while (codeExists) {
      userReferralCode = generateReferralCode();
      codeExists = await prisma.user.findUnique({ where: { referralCode: userReferralCode } });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        verificationCode,
        verificationExpires,
        referralCode: userReferralCode,
        referredBy: referralCode || null,
      },
    });

    // Process referral bonus if referred
    if (referralCode) {
      await processReferral(user.id, referralCode);
    }

    // Log verification code (in production, send email)
    console.log(`[EMAIL VERIFICATION] Code for ${email}: ${verificationCode}`);

    // Create welcome notification (Enhancement #12)
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to AI Empire! 🚀',
        message: 'Your account has been created. Start exploring 45 AI tools with your 100 free tokens!',
        type: 'success',
        link: '/dashboard',
      },
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
