export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import productsConfig from "@/config/products.json";

// Build a lookup from productType → tool config
const PRODUCTS_MAP = new Map(
  productsConfig.tools.map((t) => [
    t.productType,
    {
      name: t.name,
      description: t.description,
      tier: t.tier,
      slug: t.slug,
      priceInCents: Math.round((productsConfig.tiers as Record<string, { price: number }>)[t.tier].price * 100),
    },
  ])
);

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { productType } = body;

    const product = PRODUCTS_MAP.get(productType);
    if (!product) {
      return NextResponse.json({ error: "Invalid product type" }, { status: 400 });
    }

    const origin = request.headers.get("origin") ?? "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `AI Empire — ${product.name}`,
              description: product.description,
            },
            unit_amount: product.priceInCents,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/${product.slug}?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/${product.slug}?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        productType,
        toolSlug: product.slug,
        tier: product.tier,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
