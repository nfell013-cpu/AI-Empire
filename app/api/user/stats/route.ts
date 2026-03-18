export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ scanCount: 0, freeScanUsed: false });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email ?? "" },
      select: { scanCount: true, freeScanUsed: true },
    });

    return NextResponse.json({
      scanCount: user?.scanCount ?? 0,
      freeScanUsed: user?.freeScanUsed ?? false,
    });
  } catch (err) {
    console.error("Stats error:", err);
    return NextResponse.json({ scanCount: 0, freeScanUsed: false });
  }
}
