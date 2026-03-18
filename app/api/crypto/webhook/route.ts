export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/coinbase";

/**
 * Generic Coinbase Commerce webhook handler for all 30 AI tools.
 * Uses the subscriptions JSON field on the User model.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-cc-webhook-signature") || "";
  const webhookSecret = process.env.COINBASE_WEBHOOK_SECRET || "";

  if (webhookSecret && !verifyWebhookSignature(body, signature, webhookSecret)) {
    console.error("Invalid Coinbase webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.event?.type;
  const chargeData = event.event?.data;

  if (!chargeData) {
    return NextResponse.json({ received: true });
  }

  const chargeId = chargeData.id;
  const userId = chargeData.metadata?.userId;
  const productType = chargeData.metadata?.productType;

  try {
    if (eventType === "charge:confirmed" || eventType === "charge:resolved") {
      const cryptoPayment = await prisma.cryptoPayment.findUnique({ where: { chargeId } });

      if (!cryptoPayment || cryptoPayment.status === "completed") {
        return NextResponse.json({ received: true });
      }

      await prisma.cryptoPayment.update({
        where: { chargeId },
        data: {
          status: "completed",
          completedAt: new Date(),
          cryptoCurrency: chargeData.payments?.[0]?.network || "CRYPTO",
        },
      });

      if (userId && productType) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        const user = await prisma.user.findUnique({ where: { id: userId } });
        const current = (user as Record<string, unknown>)?.subscriptions as Record<string, unknown> ?? {};

        const updated = {
          ...current,
          [productType]: {
            active: true,
            subscriptionId: `crypto_${chargeId}`,
            subscribedAt: new Date().toISOString(),
            expiresAt: expiresAt.toISOString(),
          },
        };

        await prisma.user.update({
          where: { id: userId },
          data: { subscriptions: updated },
        });

        console.log(`✅ Crypto subscription activated: ${productType} for user ${userId}`);
      }
    }

    if (eventType === "charge:failed" || eventType === "charge:expired") {
      await prisma.cryptoPayment.update({
        where: { chargeId },
        data: { status: eventType === "charge:failed" ? "failed" : "expired" },
      });
      console.log(`Crypto payment ${eventType} for charge ${chargeId}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Crypto webhook processing error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
