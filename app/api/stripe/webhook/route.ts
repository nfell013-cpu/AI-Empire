export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { notifyNewAdSubmission } from "@/lib/notifications";
import { addTokens } from "@/lib/tokens";

/**
 * Generic Stripe Webhook Handler
 * Handles: token purchases, individual app subscriptions (45 apps),
 * tiered plans, ad purchases, and legacy one-time payments.
 *
 * App subscriptions are stored in the User.subscriptions JSON field:
 *   { "codeaudit": { "active": true, "subId": "sub_xxx", "expiresAt": "..." }, ... }
 *
 * Tiered plans are stored in User.subscriptions under a "_plan" key:
 *   { "_plan": { "planId": "plan_pro", "subId": "sub_xxx", "appsIncluded": 25, "active": true, "expiresAt": "..." } }
 */

// Helper: safely parse the subscriptions JSON field
function parseSubscriptions(raw: any): Record<string, any> {
  if (!raw) return {};
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw as Record<string, any>;
}

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
    // ── checkout.session.completed ────────────────────────────────────
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const sessionId = session.id;
      const userId = session.metadata?.userId;
      const productType = session.metadata?.productType;
      const type = session.metadata?.type; // new generic type field

      // ── Ad purchases ───────────────────────────────────────────────
      if (productType === "ad_purchase") {
        const adId = session.metadata?.adId;
        const advertiserId = session.metadata?.advertiserId;
        if (adId && advertiserId) {
          await prisma.adPayment.updateMany({
            where: { stripeSessionId: sessionId },
            data: { status: "completed", stripePaymentId: session.payment_intent as string },
          });
          const ad = await prisma.ad.findUnique({
            where: { id: adId },
            include: { advertiser: true },
          });
          if (ad) {
            await notifyNewAdSubmission(ad.title, ad.advertiser.email, (ad.cost / 100).toFixed(2));
          }
          console.log(`Ad payment completed for ad ${adId}`);
        }
        return NextResponse.json({ received: true });
      }

      // ── Token purchases ────────────────────────────────────────────
      if (type === "token_purchase" || productType === "token_purchase") {
        const tokenAmount = parseInt(session.metadata?.tokenAmount || "0", 10);
        const packageId = session.metadata?.packageId;
        if (userId && tokenAmount > 0) {
          await addTokens(userId, tokenAmount, "purchase", `Purchased ${tokenAmount.toLocaleString()} tokens (${packageId})`, sessionId);
          // Update purchase record
          try {
            await prisma.tokenPurchase.updateMany({
              where: { stripeSessionId: sessionId },
              data: { status: "completed" },
            });
          } catch { /* purchase record may not exist */ }
          console.log(`Token purchase: ${tokenAmount} tokens for user ${userId}`);
        }
        return NextResponse.json({ received: true });
      }

      if (!userId) {
        console.error("No userId in session metadata");
        return NextResponse.json({ received: true });
      }

      const subscriptionId = session.subscription as string;
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      // ── App subscription (generic for all 45 apps) ─────────────────
      if (type === "app_subscription" || (productType && productType.endsWith("_subscription"))) {
        const toolSlug = session.metadata?.toolSlug || productType?.replace("_subscription", "");
        if (toolSlug) {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (user) {
            const subs = parseSubscriptions(user.subscriptions);
            subs[toolSlug] = {
              active: true,
              subId: subscriptionId,
              expiresAt: expiresAt.toISOString(),
              activatedAt: new Date().toISOString(),
            };
            await prisma.user.update({
              where: { id: userId },
              data: { subscriptions: subs },
            });
            console.log(`App subscription activated: ${toolSlug} for user ${userId}`);
          }
        }

        // Also handle legacy per-field subscriptions for backward compat
        await handleLegacySubscription(userId, productType, subscriptionId, expiresAt, sessionId);

        return NextResponse.json({ received: true });
      }

      // ── Tiered plan subscription ───────────────────────────────────
      if (type === "tiered_plan") {
        const planId = session.metadata?.planId;
        const appsIncluded = parseInt(session.metadata?.appsIncluded || "0", 10);
        if (planId) {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (user) {
            const subs = parseSubscriptions(user.subscriptions);
            subs["_plan"] = {
              planId,
              appsIncluded,
              active: true,
              subId: subscriptionId,
              expiresAt: expiresAt.toISOString(),
              activatedAt: new Date().toISOString(),
            };
            await prisma.user.update({
              where: { id: userId },
              data: { subscriptions: subs },
            });
            console.log(`Tiered plan activated: ${planId} (${appsIncluded} apps) for user ${userId}`);
          }
        }
        return NextResponse.json({ received: true });
      }

      // ── Legacy: Legalese one-time payment ──────────────────────────
      await prisma.payment.updateMany({
        where: { stripeSessionId: sessionId },
        data: { status: "completed" },
      });
      await prisma.user.update({
        where: { id: userId },
        data: { freeScanUsed: false },
      });
    }

    // ── invoice.payment_succeeded (subscription renewal) ─────────────
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription as string;

      if (subscriptionId) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        // Find user with this subscription in their subscriptions JSON
        const allUsers = await prisma.user.findMany({
          where: { subscriptions: { not: null } },
          select: { id: true, subscriptions: true },
        });

        for (const u of allUsers) {
          const subs = parseSubscriptions(u.subscriptions);
          let updated = false;

          // Check app subscriptions
          for (const [key, val] of Object.entries(subs)) {
            if (val && typeof val === "object" && val.subId === subscriptionId) {
              subs[key] = { ...val, active: true, expiresAt: expiresAt.toISOString() };
              updated = true;
              console.log(`Subscription renewed: ${key} for user ${u.id}`);
              break;
            }
          }

          if (updated) {
            await prisma.user.update({
              where: { id: u.id },
              data: { subscriptions: subs },
            });
            break;
          }
        }

        // Also handle legacy per-field renewals
        await handleLegacyRenewal(subscriptionId, expiresAt);
      }
    }

    // ── customer.subscription.deleted (cancellation) ─────────────────
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const subscriptionId = subscription.id;

      const allUsers = await prisma.user.findMany({
        where: { subscriptions: { not: null } },
        select: { id: true, subscriptions: true },
      });

      for (const u of allUsers) {
        const subs = parseSubscriptions(u.subscriptions);
        let updated = false;

        for (const [key, val] of Object.entries(subs)) {
          if (val && typeof val === "object" && val.subId === subscriptionId) {
            subs[key] = { ...val, active: false, cancelledAt: new Date().toISOString() };
            updated = true;
            console.log(`Subscription cancelled: ${key} for user ${u.id}`);
            break;
          }
        }

        if (updated) {
          await prisma.user.update({
            where: { id: u.id },
            data: { subscriptions: subs },
          });
          break;
        }
      }

      // Also handle legacy per-field cancellations
      await handleLegacyCancellation(subscriptionId);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

// ── Legacy per-field helpers (backward compatibility) ────────────────────
const LEGACY_SUB_CONFIGS = [
  { field: "flipScoreSubId", subscribed: "flipScoreSubscribed", expires: "flipScoreSubExpiresAt", name: "FlipScore", productType: "flipscore_subscription" },
  { field: "tradeAceSubId", subscribed: "tradeAceSubscribed", expires: "tradeAceSubExpiresAt", name: "TradeAce", productType: "tradeace_subscription" },
  { field: "dealDoneSubId", subscribed: "dealDoneSubscribed", expires: "dealDoneSubExpiresAt", name: "DealDone", productType: "dealdone_subscription" },
  { field: "leafCheckSubId", subscribed: "leafCheckSubscribed", expires: "leafCheckSubExpiresAt", name: "LeafCheck", productType: "leafcheck_subscription" },
  { field: "visionLensSubId", subscribed: "visionLensSubscribed", expires: "visionLensSubExpiresAt", name: "VisionLens", productType: "visionlens_subscription" },
  { field: "coachLogicSubId", subscribed: "coachLogicSubscribed", expires: "coachLogicSubExpiresAt", name: "CoachLogic", productType: "coachlogic_subscription" },
  { field: "globeGuideSubId", subscribed: "globeGuideSubscribed", expires: "globeGuideSubExpiresAt", name: "GlobeGuide", productType: "globeguide_subscription" },
  { field: "skillScopeSubId", subscribed: "skillScopeSubscribed", expires: "skillScopeSubExpiresAt", name: "SkillScope", productType: "skillscope_subscription" },
  { field: "dataVaultSubId", subscribed: "dataVaultSubscribed", expires: "dataVaultSubExpiresAt", name: "DataVault", productType: "datavault_subscription" },
  { field: "guardianAISubId", subscribed: "guardianAISubscribed", expires: "guardianAISubExpiresAt", name: "GuardianAI", productType: "guardianai_subscription" },
  { field: "trendPulseSubId", subscribed: "trendPulseSubscribed", expires: "trendPulseSubExpiresAt", name: "TrendPulse", productType: "trendpulse_subscription" },
  { field: "soundForgeSubId", subscribed: "soundForgeSubscribed", expires: "soundForgeSubExpiresAt", name: "SoundForge", productType: "soundforge_subscription" },
  { field: "memeMintSubId", subscribed: "memeMintSubscribed", expires: "memeMintSubExpiresAt", name: "MemeMint", productType: "mememint_subscription" },
];

async function handleLegacySubscription(userId: string, productType: string | undefined, subscriptionId: string, expiresAt: Date, sessionId: string) {
  if (!productType) return;
  const config = LEGACY_SUB_CONFIGS.find((c) => c.productType === productType);
  if (!config) {
    // Handle pawpair one-time purchase
    if (productType === "pawpair_purchase") {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { pawPairPurchased: true, pawPairPaymentId: sessionId } as any,
        });
      } catch {}
    }
    return;
  }
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { [config.subscribed]: true, [config.field]: subscriptionId, [config.expires]: expiresAt } as any,
    });
  } catch {}
}

async function handleLegacyRenewal(subscriptionId: string, expiresAt: Date) {
  for (const config of LEGACY_SUB_CONFIGS) {
    try {
      const user = await prisma.user.findFirst({ where: { [config.field]: subscriptionId } as any });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { [config.subscribed]: true, [config.expires]: expiresAt } as any,
        });
        break;
      }
    } catch {}
  }
}

async function handleLegacyCancellation(subscriptionId: string) {
  for (const config of LEGACY_SUB_CONFIGS) {
    try {
      const user = await prisma.user.findFirst({ where: { [config.field]: subscriptionId } as any });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { [config.subscribed]: false, [config.field]: null, [config.expires]: null } as any,
        });
        break;
      }
    } catch {}
  }
}
