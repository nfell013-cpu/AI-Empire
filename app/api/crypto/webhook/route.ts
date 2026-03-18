export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/coinbase";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-cc-webhook-signature") || "";
  const webhookSecret = process.env.COINBASE_WEBHOOK_SECRET || "";

  // Verify webhook signature if secret is configured
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
      // Payment confirmed!
      const cryptoPayment = await prisma.cryptoPayment.findUnique({
        where: { chargeId },
      });

      if (!cryptoPayment || cryptoPayment.status === "completed") {
        return NextResponse.json({ received: true });
      }

      // Update crypto payment status
      await prisma.cryptoPayment.update({
        where: { chargeId },
        data: { 
          status: "completed", 
          completedAt: new Date(),
          cryptoCurrency: chargeData.payments?.[0]?.network || "CRYPTO",
        },
      });

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      // Activate subscription based on product type
      switch (productType) {
        case "flipscore_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { flipScoreSubscribed: true, flipScoreSubId: `crypto_${chargeId}`, flipScoreSubExpiresAt: expiresAt },
          });
          break;
        case "tradeace_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { tradeAceSubscribed: true, tradeAceSubId: `crypto_${chargeId}`, tradeAceSubExpiresAt: expiresAt },
          });
          break;
        case "dealdone_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { dealDoneSubscribed: true, dealDoneSubId: `crypto_${chargeId}`, dealDoneSubExpiresAt: expiresAt },
          });
          break;
        case "leafcheck_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { leafCheckSubscribed: true, leafCheckSubId: `crypto_${chargeId}`, leafCheckSubExpiresAt: expiresAt },
          });
          break;
        case "pawpair_purchase":
          await prisma.user.update({
            where: { id: userId },
            data: { pawPairPurchased: true, pawPairPaymentId: `crypto_${chargeId}` },
          });
          break;
        case "visionlens_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { visionLensSubscribed: true, visionLensSubId: `crypto_${chargeId}`, visionLensSubExpiresAt: expiresAt },
          });
          break;
        case "coachlogic_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { coachLogicSubscribed: true, coachLogicSubId: `crypto_${chargeId}`, coachLogicSubExpiresAt: expiresAt },
          });
          break;
        case "globeguide_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { globeGuideSubscribed: true, globeGuideSubId: `crypto_${chargeId}`, globeGuideSubExpiresAt: expiresAt },
          });
          break;
        case "skillscope_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { skillScopeSubscribed: true, skillScopeSubId: `crypto_${chargeId}`, skillScopeSubExpiresAt: expiresAt },
          });
          break;
        case "datavault_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { dataVaultSubscribed: true, dataVaultSubId: `crypto_${chargeId}`, dataVaultSubExpiresAt: expiresAt },
          });
          break;
        case "guardianai_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { guardianAISubscribed: true, guardianAISubId: `crypto_${chargeId}`, guardianAISubExpiresAt: expiresAt },
          });
          break;
        case "trendpulse_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { trendPulseSubscribed: true, trendPulseSubId: `crypto_${chargeId}`, trendPulseSubExpiresAt: expiresAt },
          });
          break;
        case "soundforge_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { soundForgeSubscribed: true, soundForgeSubId: `crypto_${chargeId}`, soundForgeSubExpiresAt: expiresAt },
          });
          break;
        case "mememint_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { memeMintSubscribed: true, memeMintSubId: `crypto_${chargeId}`, memeMintSubExpiresAt: expiresAt },
          });
          break;
        case "legalese_scan":
          await prisma.user.update({
            where: { id: userId },
            data: { freeScanUsed: false },
          });
          break;
        default:
          console.log(`Unknown product type for crypto payment: ${productType}`);
      }
      console.log(`Crypto payment confirmed for ${productType} - user ${userId}`);
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
