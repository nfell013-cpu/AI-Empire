export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import productsConfig from "@/config/products.json";

const tools = productsConfig.tools as Array<{
  slug: string;
  name: string;
  description: string;
  productType: string;
}>;

const tieredPlans = (productsConfig as any).tieredPlans as Array<{
  id: string;
  name: string;
  appsIncluded: number;
  priceInCents: number;
  interval: string;
  description: string;
}>;

const individualAppPrice = (productsConfig as any).individualAppPrice as {
  priceInCents: number;
  interval: string;
};

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

    const origin = request.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const body = await request.json();
    const { type, toolSlug, planId } = body;

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // ── Individual App Subscription ──────────────────────────────────────
    if (type === "app_subscription" && toolSlug) {
      const tool = tools.find((t) => t.slug === toolSlug);
      if (!tool) {
        return NextResponse.json({ error: "Unknown tool" }, { status: 400 });
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `AI Empire — ${tool.name}`,
                description: tool.description,
              },
              unit_amount: individualAppPrice.priceInCents,
              recurring: { interval: individualAppPrice.interval as "month" },
            },
            quantity: 1,
          },
        ],
        metadata: {
          type: "app_subscription",
          userId: user.id,
          productType: tool.productType,
          toolSlug: tool.slug,
        },
        success_url: `${origin}/${tool.slug}?subscription=success`,
        cancel_url: `${origin}/${tool.slug}?subscription=cancelled`,
      });

      return NextResponse.json({ url: checkoutSession.url });
    }

    // ── Tiered Plan Subscription ─────────────────────────────────────────
    if (type === "tiered_plan" && planId) {
      const plan = tieredPlans.find((p) => p.id === planId);
      if (!plan) {
        return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `AI Empire — ${plan.name} Plan`,
                description: plan.description,
              },
              unit_amount: plan.priceInCents,
              recurring: { interval: plan.interval as "month" },
            },
            quantity: 1,
          },
        ],
        metadata: {
          type: "tiered_plan",
          userId: user.id,
          planId: plan.id,
          appsIncluded: String(plan.appsIncluded),
        },
        success_url: `${origin}/dashboard?plan_purchase=success&plan=${plan.id}`,
        cancel_url: `${origin}/pricing?plan_purchase=cancelled`,
      });

      return NextResponse.json({ url: checkoutSession.url });
    }

    // ── Legacy: Legalese one-time scan (backward compat) ─────────────────
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Legalese Contract Scan",
              description:
                "AI-powered contract analysis – detect auto-renewals, hidden fees & risky clauses",
            },
            unit_amount: 999,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/legalese?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/legalese?canceled=true`,
      metadata: {
        userId: user.id,
        productType: "legalese_scan",
      },
    });

    await prisma.payment.create({
      data: {
        userId: user.id,
        stripeSessionId: checkoutSession.id,
        amount: 999,
        status: "pending",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
