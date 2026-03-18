export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email ?? "" },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const usageCount = await prisma.tokenTransaction.count({
      where: {
        userId: user.id,
        description: { contains: "InvoicePro" },
      },
    });

    return NextResponse.json({
      usageCount,
      tokens: user.tokens,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
