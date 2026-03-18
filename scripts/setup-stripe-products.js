#!/usr/bin/env node

/**
 * AI Empire — Stripe Product Setup Script
 * ========================================
 * Automatically creates Stripe products and prices for all 30 AI tools.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_xxx node scripts/setup-stripe-products.js
 *
 * Options:
 *   --live          Use this flag as a confirmation when running with a live key
 *   --dry-run       Preview what would be created without making API calls
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// 1. Load configuration
// ---------------------------------------------------------------------------
const productsConfigPath = path.join(__dirname, "..", "config", "products.json");
if (!fs.existsSync(productsConfigPath)) {
  console.error("❌  config/products.json not found. Run this script from the project root.");
  process.exit(1);
}

const { tiers, tools } = JSON.parse(fs.readFileSync(productsConfigPath, "utf-8"));

// ---------------------------------------------------------------------------
// 2. Validate environment
// ---------------------------------------------------------------------------
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const DRY_RUN = process.argv.includes("--dry-run");
const LIVE_FLAG = process.argv.includes("--live");

if (!STRIPE_SECRET_KEY && !DRY_RUN) {
  console.error("❌  STRIPE_SECRET_KEY environment variable is required.");
  console.error("   Usage: STRIPE_SECRET_KEY=sk_test_xxx node scripts/setup-stripe-products.js");
  process.exit(1);
}

if (STRIPE_SECRET_KEY && STRIPE_SECRET_KEY.startsWith("sk_live_") && !LIVE_FLAG) {
  console.error("⚠️   You are using a LIVE Stripe key. Pass --live to confirm.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 3. Initialise Stripe (only when not dry-running)
// ---------------------------------------------------------------------------
let stripe;
if (!DRY_RUN) {
  try {
    stripe = require("stripe")(STRIPE_SECRET_KEY);
  } catch (err) {
    console.error("❌  Could not load the 'stripe' package. Run: npm install stripe");
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// 4. Pricing helper
// ---------------------------------------------------------------------------
function getPriceInCents(tier) {
  const tierConfig = tiers[tier];
  if (!tierConfig) {
    throw new Error(`Unknown tier: ${tier}`);
  }
  return Math.round(tierConfig.price * 100); // Convert dollars to cents
}

// ---------------------------------------------------------------------------
// 5. Main routine
// ---------------------------------------------------------------------------
async function main() {
  const mode = DRY_RUN ? "DRY-RUN" : STRIPE_SECRET_KEY.startsWith("sk_live_") ? "LIVE" : "TEST";

  console.log("");
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║          AI Empire — Stripe Product Setup        ║");
  console.log("╚══════════════════════════════════════════════════╝");
  console.log("");
  console.log(`  Mode:     ${mode}`);
  console.log(`  Tools:    ${tools.length}`);
  console.log(`  Tiers:    ${Object.keys(tiers).join(", ")}`);
  console.log("");
  console.log("─────────────────────────────────────────────────────");

  const results = [];
  let created = 0;
  let errors = 0;

  for (const tool of tools) {
    const tierLabel = tiers[tool.tier]?.label || tool.tier;
    const priceUsd = tiers[tool.tier]?.price || 0;
    const priceCents = getPriceInCents(tool.tier);

    process.stdout.write(`  [${String(tool.id).padStart(2, "0")}] ${tool.name.padEnd(14)} ${tierLabel.padEnd(12)} $${priceUsd.toFixed(2).padStart(5)}/mo  `);

    if (DRY_RUN) {
      console.log("✓ (dry-run)");
      results.push({
        id: tool.id,
        name: tool.name,
        slug: tool.slug,
        tier: tool.tier,
        priceUsd,
        stripeProductId: "prod_DRYRUN",
        stripePriceId: "price_DRYRUN",
      });
      created++;
      continue;
    }

    try {
      // Create Stripe product
      const product = await stripe.products.create({
        name: `AI Empire — ${tool.name}`,
        description: tool.description,
        metadata: {
          productType: tool.productType,
          toolSlug: tool.slug,
          tier: tool.tier,
          category: tool.category,
          aiEmpire: "true",
        },
      });

      // Create recurring monthly price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: priceCents,
        currency: "usd",
        recurring: { interval: "month" },
        metadata: {
          productType: tool.productType,
          tier: tool.tier,
        },
      });

      console.log(`✓  ${product.id} / ${price.id}`);

      results.push({
        id: tool.id,
        name: tool.name,
        slug: tool.slug,
        tier: tool.tier,
        priceUsd,
        stripeProductId: product.id,
        stripePriceId: price.id,
      });
      created++;
    } catch (err) {
      console.log(`✗  ERROR: ${err.message}`);
      errors++;
    }
  }

  console.log("");
  console.log("─────────────────────────────────────────────────────");
  console.log(`  ✅ Created: ${created}    ❌ Errors: ${errors}`);
  console.log("─────────────────────────────────────────────────────");

  // Pricing summary by tier
  console.log("");
  console.log("  Pricing Summary:");
  for (const [tierKey, tierInfo] of Object.entries(tiers)) {
    const count = tools.filter((t) => t.tier === tierKey).length;
    console.log(`    ${tierInfo.label.padEnd(12)} $${tierInfo.price.toFixed(2)}/mo  (${count} tools)`);
  }

  // Write output JSON
  const outputPath = path.join(__dirname, "..", "config", "stripe-products-output.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log("");
  console.log(`  📄 Output written to: config/stripe-products-output.json`);

  // Also output a quick env-style mapping
  console.log("");
  console.log("  Price ID → Product mapping (for .env or webhook handler):");
  console.log("  ─────────────────────────────────────────────────────────");
  for (const r of results) {
    console.log(`    ${r.slug.toUpperCase()}_PRICE_ID=${r.stripePriceId}`);
  }

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
