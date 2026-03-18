// Enhancement #10: Recent Tools Used
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { recentTools: true },
    });

    return NextResponse.json({ recentTools: (user?.recentTools as any[]) ?? [] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any).id;
    const { toolSlug } = await request.json();

    if (!toolSlug) return NextResponse.json({ error: 'Tool slug required' }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { recentTools: true },
    });

    let recent = ((user?.recentTools as any[]) ?? []).filter((r: any) => r.slug !== toolSlug);
    recent.unshift({ slug: toolSlug, usedAt: new Date().toISOString() });
    recent = recent.slice(0, 10); // keep last 10

    await prisma.user.update({
      where: { id: userId },
      data: { recentTools: recent },
    });

    return NextResponse.json({ recentTools: recent });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
