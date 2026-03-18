import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { createCryptoCharge } from "@/lib/coinbase";
import productsConfig from "@/config/products.json";

export const dynamic = "force-dynamic";

// Build lookup from productType → pricing info
const PRODUCTS_MAP = new Map(
  productsConfig.tools.map((t) => [
    t.productType,
    {
      name: `${t.name} (Crypto)`,
      description: t.description,
      slug: t.slug,
      amount: (productsConfig.tiers as Record<string, { price: number }>)[t.tier].price,
    },
  ])
);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productType, returnPath } = body;

    const product = PRODUCTS_MAP.get(productType);
    if (!product) {
      return NextResponse.json({ error: "Invalid product type" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const redirectPath = returnPath || `/${product.slug}`;

    const charge = await createCryptoCharge({
      name: product.name,
      description: product.description,
      amount: product.amount,
      currency: "USD",
      userId: user.id,
      productType,
      redirectUrl: `${origin}${redirectPath}?crypto_success=true`,
      cancelUrl: `${origin}${redirectPath}?crypto_canceled=true`,
    });

    if (!charge) {
      return NextResponse.json({ error: "Failed to create crypto payment" }, { status: 500 });
    }

    await prisma.cryptoPayment.create({
      data: {
        userId: user.id,
        chargeId: charge.id,
        productType,
        amount: product.amount,
        currency: "USD",
        status: "pending",
      },
    });

    return NextResponse.json({ url: charge.hosted_url, chargeId: charge.id });
  } catch (error) {
    console.error("Crypto checkout error:", error);
    return NextResponse.json({ error: "Failed to create crypto checkout" }, { status: 500 });
  }
}
