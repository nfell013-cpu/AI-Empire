import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { addTokens } from "@/lib/tokens";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { loginStreak: true, lastLoginDate: true, longestStreak: true },
  });

  return NextResponse.json({
    currentStreak: user?.loginStreak ?? 0,
    longestStreak: user?.longestStreak ?? 0,
    lastLogin: user?.lastLoginDate,
  });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { loginStreak: true, lastLoginDate: true, longestStreak: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
  if (lastLogin) lastLogin.setHours(0, 0, 0, 0);

  const diffDays = lastLogin ? Math.floor((today.getTime() - lastLogin.getTime()) / 86400000) : -1;

  let newStreak = user.loginStreak ?? 0;
  let bonusTokens = 0;

  if (diffDays === 0) {
    // Already logged in today
    return NextResponse.json({ streak: newStreak, bonus: 0, alreadyClaimed: true });
  } else if (diffDays === 1) {
    // Consecutive day
    newStreak += 1;
  } else {
    // Streak broken or first login
    newStreak = 1;
  }

  // Streak bonuses: 3-day=5, 7-day=15, 14-day=30, 30-day=100
  if (newStreak >= 30 && newStreak % 30 === 0) bonusTokens = 100;
  else if (newStreak >= 14 && newStreak % 14 === 0) bonusTokens = 30;
  else if (newStreak >= 7 && newStreak % 7 === 0) bonusTokens = 15;
  else if (newStreak >= 3 && newStreak % 3 === 0) bonusTokens = 5;

  const longestStreak = Math.max(user.longestStreak ?? 0, newStreak);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { loginStreak: newStreak, lastLoginDate: today, longestStreak },
  });

  if (bonusTokens > 0) {
    await addTokens(session.user.id, bonusTokens, "bonus", `${newStreak}-day streak bonus! 🔥`);
  }

  return NextResponse.json({ streak: newStreak, longestStreak, bonus: bonusTokens, alreadyClaimed: false });
}
