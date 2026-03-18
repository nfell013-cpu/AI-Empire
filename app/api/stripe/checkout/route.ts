export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

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

    const origin = request.headers.get("origin") ?? "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Legalese Contract Scan",
              description: "AI-powered contract analysis – detect auto-renewals, hidden fees & risky clauses",
            },
            unit_amount: 999, // $9.99 in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/legalese?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/legalese?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        productType: "legalese_scan",
      },
    });

    // Record pending payment
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
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
