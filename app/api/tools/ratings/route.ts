import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const ratings = await prisma.toolRating.findMany({
    where: { toolSlug: slug },
    include: { user: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const avg = ratings.length > 0 ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;

  return NextResponse.json({ ratings, average: Math.round(avg * 10) / 10, count: ratings.length });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug, rating, review } = await req.json();
  if (!slug || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "slug and rating (1-5) required" }, { status: 400 });
  }

  const existing = await prisma.toolRating.findFirst({
    where: { userId: session.user.id, toolSlug: slug },
  });

  let result;
  if (existing) {
    result = await prisma.toolRating.update({
      where: { id: existing.id },
      data: { rating, review: review || null },
    });
  } else {
    result = await prisma.toolRating.create({
      data: { userId: session.user.id, toolSlug: slug, rating, review: review || null },
    });
  }

  return NextResponse.json({ success: true, rating: result });
}
