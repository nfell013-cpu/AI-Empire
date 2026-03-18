#!/usr/bin/env node

/**
 * AI Empire — Stripe Product Setup Script (v2)
 * ==============================================
 * Creates ALL Stripe products & prices for the 45-app platform:
 *   1. Token Packs       (one-time payments)
 *   2. Individual Apps    (45 × $9.99/mo subscriptions)
 *   3. Tiered Plans       (Basic / Pro / Ultimate bundles)
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_live_xxx node scripts/setup-stripe-products.js --live
 *   STRIPE_SECRET_KEY=sk_test_xxx node scripts/setup-stripe-products.js
 *   node scripts/setup-stripe-products.js --dry-run
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// 1. Load configuration
// ---------------------------------------------------------------------------
const configPath = path.join(__dirname, "..", "config", "products.json");
if (!fs.existsSync(configPath)) {
  console.error("❌  config/products.json not found.");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
const { tools, tokenPackages, tieredPlans, individualAppPrice } = config;

// ---------------------------------------------------------------------------
// 2. Validate environment
// ---------------------------------------------------------------------------
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const DRY_RUN = process.argv.includes("--dry-run");
const LIVE_FLAG = process.argv.includes("--live");

if (!STRIPE_SECRET_KEY && !DRY_RUN) {
  console.error("❌  STRIPE_SECRET_KEY env var required. Use --dry-run to preview.");
  process.exit(1);
}

if (STRIPE_SECRET_KEY && STRIPE_SECRET_KEY.startsWith("sk_live_") && !LIVE_FLAG) {
  console.error("⚠️  LIVE key detected. Pass --live to confirm.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 3. Initialise Stripe
// ---------------------------------------------------------------------------
let stripe;
if (!DRY_RUN) {
  try {
    stripe = require("stripe")(STRIPE_SECRET_KEY);
  } catch {
    console.error("❌  stripe package not found. Run: npm install stripe");
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// 4. Helper: create product + price
// ---------------------------------------------------------------------------
async function createProduct({ name, description, metadata, priceCents, recurring }) {
  if (DRY_RUN) {
    return { productId: "prod_DRYRUN", priceId: "price_DRYRUN" };
  }

  const product = await stripe.products.create({
    name,
    description,
    metadata: { ...metadata, aiEmpire: "true" },
  });

  const priceParams = {
    product: product.id,
    unit_amount: priceCents,
    currency: "usd",
    metadata,
  };
  if (recurring) {
    priceParams.recurring = { interval: recurring };
  }

  const price = await stripe.prices.create(priceParams);
  return { productId: product.id, priceId: price.id };
}

// ---------------------------------------------------------------------------
// 5. Main
// ---------------------------------------------------------------------------
async function main() {
  const mode = DRY_RUN ? "DRY-RUN" : STRIPE_SECRET_KEY.startsWith("sk_live_") ? "🔴 LIVE" : "🟡 TEST";

  console.log("");
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║      AI Empire — Stripe Product Setup (v2)           ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`  Mode: ${mode}`);
  console.log(`  Tools: ${tools.length} | Token Packs: ${tokenPackages.length} | Tiered Plans: ${tieredPlans.length}`);
  console.log("");

  const output = {
    createdAt: new Date().toISOString(),
    mode,
    tokenPacks: [],
    individualApps: [],
    tieredPlans: [],
  };

  let created = 0;
  let errors = 0;

  // ── Token Packs ──────────────────────────────────────────────────────
  console.log("━━━ TOKEN PACKS (one-time) ━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  for (const pkg of tokenPackages) {
    const label = `${pkg.name} — $${(pkg.priceInCents / 100).toFixed(2)}`;
    process.stdout.write(`  ${label.padEnd(40)}`);
    try {
      const { productId, priceId } = await createProduct({
        name: `AI Empire — ${pkg.name} Token Pack`,
        description: `${pkg.tokens.toLocaleString()} AI Empire tokens (one-time purchase)`,
        metadata: { type: "token_purchase", packageId: pkg.id, tokenAmount: String(pkg.tokens) },
        priceCents: pkg.priceInCents,
        recurring: null,
      });
      console.log(`✓  ${productId} / ${priceId}`);
      output.tokenPacks.push({ ...pkg, stripeProductId: productId, stripePriceId: priceId });
      created++;
    } catch (err) {
      console.log(`✗  ${err.message}`);
      errors++;
    }
  }

  // ── Individual App Subscriptions ─────────────────────────────────────
  console.log("");
  console.log("━━━ INDIVIDUAL APP SUBSCRIPTIONS ($9.99/mo each) ━━━━━");
  for (const tool of tools) {
    const label = `${tool.name} (${tool.slug})`;
    process.stdout.write(`  [${String(tool.id).padStart(2, "0")}] ${label.padEnd(36)}`);
    try {
      const { productId, priceId } = await createProduct({
        name: `AI Empire — ${tool.name}`,
        description: tool.description,
        metadata: {
          type: "app_subscription",
          productType: tool.productType,
          toolSlug: tool.slug,
          tier: tool.tier,
          category: tool.category || "",
        },
        priceCents: individualAppPrice.priceInCents,
        recurring: individualAppPrice.interval,
      });
      console.log(`✓  ${productId} / ${priceId}`);
      output.individualApps.push({
        id: tool.id,
        name: tool.name,
        slug: tool.slug,
        tier: tool.tier,
        pricePerMonth: individualAppPrice.priceInCents / 100,
        stripeProductId: productId,
        stripePriceId: priceId,
      });
      created++;
    } catch (err) {
      console.log(`✗  ${err.message}`);
      errors++;
    }
  }

  // ── Tiered Plans ─────────────────────────────────────────────────────
  console.log("");
  console.log("━━━ TIERED PLANS (monthly subscriptions) ━━━━━━━━━━━━━");
  for (const plan of tieredPlans) {
    const label = `${plan.name} (${plan.appsIncluded} apps) — $${(plan.priceInCents / 100).toFixed(2)}/mo`;
    process.stdout.write(`  ${label.padEnd(50)}`);
    try {
      const { productId, priceId } = await createProduct({
        name: `AI Empire — ${plan.name} Plan`,
        description: plan.description,
        metadata: {
          type: "tiered_plan",
          planId: plan.id,
          appsIncluded: String(plan.appsIncluded),
        },
        priceCents: plan.priceInCents,
        recurring: plan.interval,
      });
      console.log(`✓  ${productId} / ${priceId}`);
      output.tieredPlans.push({ ...plan, stripeProductId: productId, stripePriceId: priceId });
      created++;
    } catch (err) {
      console.log(`✗  ${err.message}`);
      errors++;
    }
  }

  // ── Summary & Output ─────────────────────────────────────────────────
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  ✅ Created: ${created}    ❌ Errors: ${errors}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Write output
  const outputPath = path.join(__dirname, "..", "stripe-products.json");
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n  📄 Saved to: stripe-products.json`);

  // Also write to config for backward compat
  const configOutputPath = path.join(__dirname, "..", "config", "stripe-products-output.json");
  fs.writeFileSync(configOutputPath, JSON.stringify(output, null, 2));
  console.log(`  📄 Saved to: config/stripe-products-output.json`);

  console.log("");
  if (errors > 0) {
    console.log("  ⚠️  Some products failed. Re-run the script to retry.");
    process.exit(1);
  }
  console.log("  🎉 All done! Your Stripe products are ready.");
  console.log("");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
