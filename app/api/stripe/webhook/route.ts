export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

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
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const sessionId = session.id;
      const userId = session.metadata?.userId;
      const productType = session.metadata?.productType;

      if (!userId) {
        console.error("No userId in session metadata");
        return NextResponse.json({ received: true });
      }

      const subscriptionId = session.subscription as string;
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      // Handle different subscription types
      switch (productType) {
        case "flipscore_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { flipScoreSubscribed: true, flipScoreSubId: subscriptionId, flipScoreSubExpiresAt: expiresAt },
          });
          console.log(`FlipScore subscription activated for user ${userId}`);
          break;

        case "tradeace_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { tradeAceSubscribed: true, tradeAceSubId: subscriptionId, tradeAceSubExpiresAt: expiresAt },
          });
          console.log(`TradeAce subscription activated for user ${userId}`);
          break;

        case "dealdone_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { dealDoneSubscribed: true, dealDoneSubId: subscriptionId, dealDoneSubExpiresAt: expiresAt },
          });
          console.log(`DealDone subscription activated for user ${userId}`);
          break;

        case "leafcheck_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { leafCheckSubscribed: true, leafCheckSubId: subscriptionId, leafCheckSubExpiresAt: expiresAt },
          });
          console.log(`LeafCheck subscription activated for user ${userId}`);
          break;

        case "pawpair_purchase":
          // One-time purchase
          await prisma.user.update({
            where: { id: userId },
            data: { pawPairPurchased: true, pawPairPaymentId: sessionId },
          });
          console.log(`PawPair purchased for user ${userId}`);
          break;

        case "visionlens_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { visionLensSubscribed: true, visionLensSubId: subscriptionId, visionLensSubExpiresAt: expiresAt },
          });
          console.log(`VisionLens subscription activated for user ${userId}`);
          break;

        case "coachlogic_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { coachLogicSubscribed: true, coachLogicSubId: subscriptionId, coachLogicSubExpiresAt: expiresAt },
          });
          console.log(`CoachLogic subscription activated for user ${userId}`);
          break;

        case "globeguide_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { globeGuideSubscribed: true, globeGuideSubId: subscriptionId, globeGuideSubExpiresAt: expiresAt },
          });
          console.log(`GlobeGuide subscription activated for user ${userId}`);
          break;

        case "skillscope_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { skillScopeSubscribed: true, skillScopeSubId: subscriptionId, skillScopeSubExpiresAt: expiresAt },
          });
          console.log(`SkillScope subscription activated for user ${userId}`);
          break;

        case "datavault_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { dataVaultSubscribed: true, dataVaultSubId: subscriptionId, dataVaultSubExpiresAt: expiresAt },
          });
          console.log(`DataVault subscription activated for user ${userId}`);
          break;

        case "guardianai_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { guardianAISubscribed: true, guardianAISubId: subscriptionId, guardianAISubExpiresAt: expiresAt },
          });
          console.log(`GuardianAI subscription activated for user ${userId}`);
          break;

        case "trendpulse_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { trendPulseSubscribed: true, trendPulseSubId: subscriptionId, trendPulseSubExpiresAt: expiresAt },
          });
          console.log(`TrendPulse subscription activated for user ${userId}`);
          break;

        case "soundforge_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { soundForgeSubscribed: true, soundForgeSubId: subscriptionId, soundForgeSubExpiresAt: expiresAt },
          });
          console.log(`SoundForge subscription activated for user ${userId}`);
          break;

        case "mememint_subscription":
          await prisma.user.update({
            where: { id: userId },
            data: { memeMintSubscribed: true, memeMintSubId: subscriptionId, memeMintSubExpiresAt: expiresAt },
          });
          console.log(`MemeMint subscription activated for user ${userId}`);
          break;

        default:
          // Handle Legalese one-time payment
          await prisma.payment.updateMany({
            where: { stripeSessionId: sessionId },
            data: { status: "completed" },
          });
          await prisma.user.update({
            where: { id: userId },
            data: { freeScanUsed: false },
          });
          break;
      }
    }

    // Handle subscription renewal
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription as string;
      
      if (subscriptionId) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        // Check all subscription types
        const subConfigs = [
          { field: 'flipScoreSubId', subscribed: 'flipScoreSubscribed', expires: 'flipScoreSubExpiresAt', name: 'FlipScore' },
          { field: 'tradeAceSubId', subscribed: 'tradeAceSubscribed', expires: 'tradeAceSubExpiresAt', name: 'TradeAce' },
          { field: 'dealDoneSubId', subscribed: 'dealDoneSubscribed', expires: 'dealDoneSubExpiresAt', name: 'DealDone' },
          { field: 'leafCheckSubId', subscribed: 'leafCheckSubscribed', expires: 'leafCheckSubExpiresAt', name: 'LeafCheck' },
          { field: 'visionLensSubId', subscribed: 'visionLensSubscribed', expires: 'visionLensSubExpiresAt', name: 'VisionLens' },
          { field: 'coachLogicSubId', subscribed: 'coachLogicSubscribed', expires: 'coachLogicSubExpiresAt', name: 'CoachLogic' },
          { field: 'globeGuideSubId', subscribed: 'globeGuideSubscribed', expires: 'globeGuideSubExpiresAt', name: 'GlobeGuide' },
          { field: 'skillScopeSubId', subscribed: 'skillScopeSubscribed', expires: 'skillScopeSubExpiresAt', name: 'SkillScope' },
          { field: 'dataVaultSubId', subscribed: 'dataVaultSubscribed', expires: 'dataVaultSubExpiresAt', name: 'DataVault' },
          { field: 'guardianAISubId', subscribed: 'guardianAISubscribed', expires: 'guardianAISubExpiresAt', name: 'GuardianAI' },
          { field: 'trendPulseSubId', subscribed: 'trendPulseSubscribed', expires: 'trendPulseSubExpiresAt', name: 'TrendPulse' },
          { field: 'soundForgeSubId', subscribed: 'soundForgeSubscribed', expires: 'soundForgeSubExpiresAt', name: 'SoundForge' },
          { field: 'memeMintSubId', subscribed: 'memeMintSubscribed', expires: 'memeMintSubExpiresAt', name: 'MemeMint' },
        ];

        for (const config of subConfigs) {
          const user = await prisma.user.findFirst({
            where: { [config.field]: subscriptionId },
          });

          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                [config.subscribed]: true,
                [config.expires]: expiresAt,
              },
            });
            console.log(`${config.name} subscription renewed for user ${user.id}`);
            break;
          }
        }
      }
    }

    // Handle subscription cancellation
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const subscriptionId = subscription.id;

      const subConfigs = [
        { field: 'flipScoreSubId', subscribed: 'flipScoreSubscribed', expires: 'flipScoreSubExpiresAt', name: 'FlipScore' },
        { field: 'tradeAceSubId', subscribed: 'tradeAceSubscribed', expires: 'tradeAceSubExpiresAt', name: 'TradeAce' },
        { field: 'dealDoneSubId', subscribed: 'dealDoneSubscribed', expires: 'dealDoneSubExpiresAt', name: 'DealDone' },
        { field: 'leafCheckSubId', subscribed: 'leafCheckSubscribed', expires: 'leafCheckSubExpiresAt', name: 'LeafCheck' },
        { field: 'visionLensSubId', subscribed: 'visionLensSubscribed', expires: 'visionLensSubExpiresAt', name: 'VisionLens' },
        { field: 'coachLogicSubId', subscribed: 'coachLogicSubscribed', expires: 'coachLogicSubExpiresAt', name: 'CoachLogic' },
        { field: 'globeGuideSubId', subscribed: 'globeGuideSubscribed', expires: 'globeGuideSubExpiresAt', name: 'GlobeGuide' },
        { field: 'skillScopeSubId', subscribed: 'skillScopeSubscribed', expires: 'skillScopeSubExpiresAt', name: 'SkillScope' },
        { field: 'dataVaultSubId', subscribed: 'dataVaultSubscribed', expires: 'dataVaultSubExpiresAt', name: 'DataVault' },
        { field: 'guardianAISubId', subscribed: 'guardianAISubscribed', expires: 'guardianAISubExpiresAt', name: 'GuardianAI' },
        { field: 'trendPulseSubId', subscribed: 'trendPulseSubscribed', expires: 'trendPulseSubExpiresAt', name: 'TrendPulse' },
        { field: 'soundForgeSubId', subscribed: 'soundForgeSubscribed', expires: 'soundForgeSubExpiresAt', name: 'SoundForge' },
        { field: 'memeMintSubId', subscribed: 'memeMintSubscribed', expires: 'memeMintSubExpiresAt', name: 'MemeMint' },
      ];

      for (const config of subConfigs) {
        const user = await prisma.user.findFirst({
          where: { [config.field]: subscriptionId },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              [config.subscribed]: false,
              [config.field]: null,
              [config.expires]: null,
            },
          });
          console.log(`${config.name} subscription cancelled for user ${user.id}`);
          break;
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
