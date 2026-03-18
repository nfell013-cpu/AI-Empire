export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ manuals: [] });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ manuals: [] });
    }

    const manuals = await prisma.tradeAceManual.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileName: true,
        trade: true,
        title: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ manuals });
  } catch (error) {
    console.error("Error fetching manuals:", error);
    return NextResponse.json({ manuals: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { fileName, cloudStoragePath, trade, title } = body;

    if (!fileName || !trade) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const manual = await prisma.tradeAceManual.create({
      data: {
        userId: user.id,
        fileName,
        cloudStoragePath,
        trade,
        title,
      },
    });

    return NextResponse.json({ manual });
  } catch (error) {
    console.error("Error creating manual:", error);
    return NextResponse.json({ error: "Failed to save manual" }, { status: 500 });
  }
}
