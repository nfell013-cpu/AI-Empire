export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email ?? "" },
      include: {
        scans: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, fileName: true, status: true, createdAt: true, isFree: true },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      scanCount: user.scanCount,
      freeScanUsed: user.freeScanUsed,
      createdAt: user.createdAt.toISOString(),
      recentScans: user.scans.map((s: { id: string; fileName: string; status: string; createdAt: Date; isFree: boolean }) => ({
        id: s.id,
        fileName: s.fileName,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
        isFree: s.isFree,
      })),
    });
  } catch (err) {
    console.error("Profile error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
