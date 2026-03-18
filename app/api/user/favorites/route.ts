// Enhancement #11: Favorite/Bookmark Tools
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
      select: { favoriteTools: true },
    });

    return NextResponse.json({ favorites: user?.favoriteTools ?? [] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any).id;
    const { toolSlug, action } = await request.json();

    if (!toolSlug) return NextResponse.json({ error: 'Tool slug required' }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { favoriteTools: true },
    });

    let favorites = user?.favoriteTools ?? [];

    if (action === 'add') {
      if (!favorites.includes(toolSlug)) favorites = [...favorites, toolSlug];
    } else if (action === 'remove') {
      favorites = favorites.filter((f: string) => f !== toolSlug);
    } else {
      // Toggle
      if (favorites.includes(toolSlug)) {
        favorites = favorites.filter((f: string) => f !== toolSlug);
      } else {
        favorites = [...favorites, toolSlug];
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { favoriteTools: favorites },
    });

    return NextResponse.json({ favorites });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
