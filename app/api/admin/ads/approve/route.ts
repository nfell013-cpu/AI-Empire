import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { adId } = await request.json();
    if (!adId) {
      return NextResponse.json({ error: 'adId required' }, { status: 400 });
    }

    const ad = await prisma.ad.update({
      where: { id: adId },
      data: {
        status: 'ACTIVE',
        approvedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, ad });
  } catch (error) {
    console.error('Ad approve error:', error);
    return NextResponse.json({ error: 'Failed to approve ad' }, { status: 500 });
  }
}
