import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const webhooks = await prisma.userWebhook.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ webhooks });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url, events } = await req.json();
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  const webhook = await prisma.userWebhook.create({
    data: {
      userId: session.user.id,
      url,
      events: events || ["tool.completed"],
      active: true,
    },
  });

  return NextResponse.json({ webhook });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.userWebhook.deleteMany({ where: { id, userId: session.user.id } });

  return NextResponse.json({ success: true });
}
