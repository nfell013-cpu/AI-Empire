# Stripe Setup — AI Empire (45 Apps)

## Quick Setup

### 1. Run the Product Setup Script

```bash
# Dry run (preview only)
node scripts/setup-stripe-products.js --dry-run

# Test mode
STRIPE_SECRET_KEY=sk_test_xxx node scripts/setup-stripe-products.js

# Live mode
STRIPE_SECRET_KEY=sk_live_xxx node scripts/setup-stripe-products.js --live
```

This creates **53 Stripe products**:
- 5 Token Packs (one-time payments: $4.99 – $249.99)
- 45 Individual App Subscriptions ($9.99/mo each)
- 3 Tiered Plans (Basic $29.99/mo, Pro $69.99/mo, Ultimate $99.99/mo)

Output saved to `stripe-products.json` and `config/stripe-products-output.json`.

### 2. Configure Webhook

See **[STRIPE_WEBHOOK_SETUP.md](./STRIPE_WEBHOOK_SETUP.md)** for detailed instructions.

### 3. Set Environment Variables

```env
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Architecture

### Pricing Model

| Type | Products | Price | Billing |
|------|----------|-------|---------|
| Token Packs | 5 | $4.99 – $249.99 | One-time |
| Individual Apps | 45 | $9.99/mo each | Subscription |
| Basic Plan | 1 | $29.99/mo (10 apps) | Subscription |
| Pro Plan | 1 | $69.99/mo (25 apps) | Subscription |
| Ultimate Plan | 1 | $99.99/mo (45 apps) | Subscription |
| Free Tier | — | $0 (1 free scan + ad tokens) | — |

### Subscription Storage

All subscriptions stored in `User.subscriptions` JSON field:

```json
{
  "codeaudit": { "active": true, "subId": "sub_xxx", "expiresAt": "2026-04-17T..." },
  "pixelcraft": { "active": true, "subId": "sub_yyy", "expiresAt": "2026-04-17T..." },
  "_plan": { "planId": "plan_pro", "appsIncluded": 25, "active": true, "subId": "sub_zzz", "expiresAt": "2026-04-17T..." }
}
```

### API Routes

| Route | Purpose |
|-------|---------|
| `POST /api/stripe/checkout` | Create checkout sessions (apps, plans) |
| `POST /api/tokens/purchase` | Create token pack checkout sessions |
| `POST /api/stripe/webhook` | Handle all Stripe webhook events |
| `GET /api/tokens/balance` | Get user token balance |
| `GET /api/tokens/purchase` | List available token packages |

### Configuration Files

| File | Purpose |
|------|---------|
| `config/products.json` | Source of truth for all tools, tiers, token packs, plans |
| `stripe-products.json` | Generated Stripe product/price IDs |
| `scripts/setup-stripe-products.js` | Script to create Stripe products |

## Test Cards

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 3220` | 3D Secure authentication |
| `4000 0000 0000 9995` | Declined |
