import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({
        dataVaultSubscribed: false,
        dataVaultReports: 0,
        dataVaultFreeUsed: false,
        dataVaultSubExpiresAt: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        dataVaultSubscribed: true,
        dataVaultReports: true,
        dataVaultFreeUsed: true,
        dataVaultSubExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        dataVaultSubscribed: false,
        dataVaultReports: 0,
        dataVaultFreeUsed: false,
        dataVaultSubExpiresAt: null,
      });
    }

    if (user.dataVaultSubscribed && user.dataVaultSubExpiresAt) {
      if (new Date(user.dataVaultSubExpiresAt) < new Date()) {
        await prisma.user.update({
          where: { email: session.user.email },
          data: { dataVaultSubscribed: false },
        });
        return NextResponse.json({
          ...user,
          dataVaultSubscribed: false,
        });
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("DataVault stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
