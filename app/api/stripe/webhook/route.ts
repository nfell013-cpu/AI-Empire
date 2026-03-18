export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

/**
 * Generic Stripe webhook handler for all 30 AI Empire tools.
 *
 * Instead of hard-coding each tool, we use the `productType` metadata
 * stored in every checkout session to update the user's `subscriptions`
 * JSON field in the database.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    // ── checkout.session.completed ──────────────────────────────────
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const productType = session.metadata?.productType;
      const subscriptionId = session.subscription as string | undefined;

      if (!userId || !productType) {
        console.error("Missing userId or productType in session metadata");
        return NextResponse.json({ received: true });
      }

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      // Fetch current subscriptions JSON
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const current = (user as Record<string, unknown>)?.subscriptions as Record<string, unknown> ?? {};

      const updated = {
        ...current,
        [productType]: {
          active: true,
          subscriptionId: subscriptionId ?? session.id,
          subscribedAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
        },
      };

      await prisma.user.update({
        where: { id: userId },
        data: { subscriptions: updated },
      });

      console.log(`✅ Subscription activated: ${productType} for user ${userId}`);
    }

    // ── invoice.payment_succeeded (renewal) ────────────────────────
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription as string;

      if (subscriptionId) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        // Find user with this subscription ID in their subscriptions JSON
        const users = await prisma.user.findMany({
          where: {
            subscriptions: { path: "$", not: "null" },
          },
        });

        for (const user of users) {
          const subs = (user as Record<string, unknown>).subscriptions as Record<string, Record<string, unknown>> ?? {};
          for (const [productType, sub] of Object.entries(subs)) {
            if (sub?.subscriptionId === subscriptionId) {
              subs[productType] = {
                ...sub,
                active: true,
                expiresAt: expiresAt.toISOString(),
              };
              await prisma.user.update({
                where: { id: user.id },
                data: { subscriptions: subs },
              });
              console.log(`🔄 Subscription renewed: ${productType} for user ${user.id}`);
              break;
            }
          }
        }
      }
    }

    // ── customer.subscription.deleted ──────────────────────────────
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const subscriptionId = subscription.id;

      const users = await prisma.user.findMany({
        where: {
          subscriptions: { path: "$", not: "null" },
        },
      });

      for (const user of users) {
        const subs = (user as Record<string, unknown>).subscriptions as Record<string, Record<string, unknown>> ?? {};
        for (const [productType, sub] of Object.entries(subs)) {
          if (sub?.subscriptionId === subscriptionId) {
            subs[productType] = {
              ...sub,
              active: false,
              cancelledAt: new Date().toISOString(),
            };
            await prisma.user.update({
              where: { id: user.id },
              data: { subscriptions: subs },
            });
            console.log(`❌ Subscription cancelled: ${productType} for user ${user.id}`);
            break;
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
