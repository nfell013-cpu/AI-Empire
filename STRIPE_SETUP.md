# Stripe Setup Guide for AI Empire

> Complete step-by-step instructions for configuring Stripe payments in your AI Empire deployment.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Your API Keys](#getting-your-api-keys)
3. [Configuring Webhooks](#configuring-webhooks)
4. [All Webhook Events Explained](#all-webhook-events-explained)
5. [Testing in Test Mode](#testing-in-test-mode)
6. [Switching from Test to Live Mode](#switching-from-test-to-live-mode)
7. [Product & Pricing Reference](#product--pricing-reference)
8. [How the Payment Flow Works](#how-the-payment-flow-works)
9. [Troubleshooting Stripe Issues](#troubleshooting-stripe-issues)

---

## Prerequisites

- A Stripe account: https://dashboard.stripe.com/register
- Your AI Empire app deployed and accessible via a public URL (e.g., `https://yourdomain.com`)
- Access to your deployment's environment variables

---

## Getting Your API Keys

### Step 1: Navigate to API Keys

1. Log into https://dashboard.stripe.com
2. Click **"Developers"** in the top-right corner (or left sidebar)
3. Click **"API keys"**

### Step 2: Copy Keys

You'll see two keys:

| Key Type | Prefix | Environment Variable |
|---|---|---|
| **Publishable key** | `pk_test_...` or `pk_live_...` | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| **Secret key** | `sk_test_...` or `sk_live_...` | `STRIPE_SECRET_KEY` |

> ⚠️ **Never expose your Secret key** in client-side code or public repositories. The `NEXT_PUBLIC_` prefix variable is the publishable key and is safe to expose.

### Step 3: Set in Environment

Add both keys to your hosting platform's environment variables (Vercel, Railway, or `.env` file).

---

## Configuring Webhooks

Webhooks are **critical** — they tell your app when payments succeed, subscriptions renew, or subscriptions are cancelled.

### Step 1: Create Webhook Endpoint

1. Stripe Dashboard → **Developers** → **Webhooks**
2. Click **"+ Add endpoint"**
3. Enter your endpoint URL:

```
https://yourdomain.com/api/stripe/webhook
```

> Replace `yourdomain.com` with your actual domain.

### Step 2: Select Events to Listen For

Click **"Select events"** and add these three events:

| Event | Why It's Needed |
|---|---|
| `checkout.session.completed` | ✅ **Essential** — Fires when a customer completes a checkout. Activates subscriptions and one-time purchases for all 15 tools. |
| `invoice.payment_succeeded` | ✅ **Essential** — Fires when a recurring subscription payment succeeds. Extends subscription expiry by 1 month. |
| `customer.subscription.deleted` | ✅ **Essential** — Fires when a subscription is cancelled. Deactivates the user's access. |

### Step 3: Get the Webhook Signing Secret

After creating the endpoint:

1. Click on the newly created webhook endpoint
2. Under **"Signing secret"**, click **"Reveal"**
3. Copy the secret (starts with `whsec_...`)
4. Set it as `STRIPE_WEBHOOK_SECRET` in your environment variables

### Summary of Required Webhook Endpoints

| Webhook URL | Platform | Events |
|---|---|---|
| `https://yourdomain.com/api/stripe/webhook` | Stripe | `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted` |
| `https://yourdomain.com/api/crypto/webhook` | Coinbase Commerce | `charge:confirmed`, `charge:resolved`, `charge:failed`, `charge:expired` |

---

## All Webhook Events Explained

### `checkout.session.completed`

**What it does in AI Empire:**

This is the primary payment handler. When fired, the webhook reads `metadata.productType` from the session and activates the correct subscription or purchase:

| `productType` value | Action Taken |
|---|---|
| `flipscore_subscription` | Sets `flipScoreSubscribed = true`, stores subscription ID, sets 1-month expiry |
| `tradeace_subscription` | Sets `tradeAceSubscribed = true`, stores subscription ID, sets 1-month expiry |
| `dealdone_subscription` | Sets `dealDoneSubscribed = true`, stores subscription ID, sets 1-month expiry |
| `leafcheck_subscription` | Sets `leafCheckSubscribed = true`, stores subscription ID, sets 1-month expiry |
| `pawpair_purchase` | Sets `pawPairPurchased = true` (lifetime, no expiry) |
| `visionlens_subscription` | Sets `visionLensSubscribed = true`, stores subscription ID, sets 1-month expiry |
| `coachlogic_subscription` | Sets `coachLogicSubscribed = true`, stores subscription ID, sets 1-month expiry |
| `globeguide_subscription` | Sets `globeGuideSubscribed = true`, stores subscription ID, sets 1-month expiry |
| `skillscope_subscription` | Sets `skillScopeSubscribed = true`, stores subscription ID, sets 1-month expiry |
| `datavault_subscription` | Sets `dataVaultSubscribed = true`, stores subscription ID, sets 1-month expiry |
| `guardianai_subscription` | Sets `guardianAISubscribed = true`, stores subscription ID, sets 1-month expiry |
| `trendpulse_subscription` | Sets `trendPulseSubscribed = true`, stores subscription ID, sets 1-month expiry |
| `soundforge_subscription` | Sets `soundForgeSubscribed = true`, stores subscription ID, sets 1-month expiry |
| `mememint_subscription` | Sets `memeMintSubscribed = true`, stores subscription ID, sets 1-month expiry |
| *(default / legalese)* | Marks payment as `completed`, resets `freeScanUsed` to allow scanning |

### `invoice.payment_succeeded`

Handles **recurring subscription renewals**. Looks up the user by their stored `subscription ID` and extends the expiry date by 1 month.

### `customer.subscription.deleted`

Handles **cancellations**. Looks up the user by subscription ID and sets the corresponding `Subscribed` flag to `false`, clearing the subscription ID and expiry.

---

## Testing in Test Mode

### Step 1: Use Test API Keys

By default, Stripe starts in Test mode. Your keys will have the prefix `pk_test_` and `sk_test_`.

Set these in your environment:
```bash
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### Step 2: Create a Test Webhook

For local testing, use **Stripe CLI**:

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Linux: see https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI will output a webhook signing secret (starts with `whsec_`). Use this as `STRIPE_WEBHOOK_SECRET` for local testing.

### Step 3: Use Test Card Numbers

| Card Number | Scenario |
|---|---|
| `4242 4242 4242 4242` | ✅ Successful payment |
| `4000 0000 0000 3220` | 🔐 Requires 3D Secure authentication |
| `4000 0000 0000 9995` | ❌ Payment declined |
| `4000 0000 0000 0341` | ❌ Card declined (attach to customer fails) |

Use any future expiry date (e.g., `12/34`), any 3-digit CVC, and any ZIP code.

### Step 4: Verify in Stripe Dashboard

After a test payment:
1. Go to Stripe Dashboard → **Payments** — you should see the test payment
2. Go to **Developers** → **Webhooks** → click your endpoint → **"Recent events"** — verify the webhook was delivered and responded with 200
3. Check your app's database — the subscription should be activated

### Step 5: Test the Full Flow

1. Sign up for an account on your app
2. Navigate to any tool (e.g., `/flipscore`)
3. Click "Subscribe"
4. Complete checkout with test card `4242 4242 4242 4242`
5. Verify you're redirected back to the tool page with `?success=true`
6. Verify the subscription is active (tool features are unlocked)

---

## Switching from Test to Live Mode

### Step 1: Activate Your Stripe Account

1. Stripe Dashboard → **Settings** → Complete your business profile
2. Provide business details, bank account for payouts, tax information
3. Stripe will review and activate your account

### Step 2: Get Live API Keys

1. In the Stripe Dashboard, toggle the **"Test mode"** switch OFF (top-right area)
2. Go to **Developers** → **API keys**
3. Copy the live keys (prefix `pk_live_` and `sk_live_`)

### Step 3: Create a Live Webhook

1. While NOT in test mode, go to **Developers** → **Webhooks**
2. Create a **new** webhook endpoint (test and live webhooks are separate!)
3. URL: `https://yourdomain.com/api/stripe/webhook`
4. Select the same 3 events
5. Copy the new signing secret

### Step 4: Update Environment Variables

Replace your test keys with live keys in your hosting platform:

```bash
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."   # NEW live webhook secret
```

### Step 5: Redeploy

After updating environment variables, trigger a redeployment:
- **Vercel**: Automatically redeploys on env var changes (or manually in dashboard)
- **Railway**: Automatically redeploys
- **VPS**: `npm run build && pm2 restart ai-empire`

### Checklist for Going Live

- [ ] Stripe account activated and verified
- [ ] Live API keys (`sk_live_`, `pk_live_`) set in production environment
- [ ] Live webhook endpoint created (separate from test)
- [ ] Live webhook signing secret (`whsec_`) set as `STRIPE_WEBHOOK_SECRET`
- [ ] All 3 events selected on live webhook
- [ ] Test a real payment with a small amount ($0.50 minimum)
- [ ] Verify webhook delivery in live mode dashboard
- [ ] Verify subscription activation in your database

---

## Product & Pricing Reference

All prices are created dynamically via `price_data` in checkout sessions (no pre-created Stripe Products needed):

| Product | Type | Price | Stripe Mode | `productType` metadata |
|---|---|---|---|---|
| Legalese Contract Scan | One-time | $9.99 | `payment` | *(default)* |
| FlipScore Pro | Monthly | $19.99/mo | `subscription` | `flipscore_subscription` |
| TradeAce Pro | Monthly | $29.99/mo | `subscription` | `tradeace_subscription` |
| DealDone Pro | Monthly | $39.00/mo | `subscription` | `dealdone_subscription` |
| LeafCheck Pro | Monthly | $12.00/mo | `subscription` | `leafcheck_subscription` |
| PawPair Lifetime | One-time | $14.00 | `payment` | `pawpair_purchase` |
| VisionLens Pro | Monthly | $10.00/mo | `subscription` | `visionlens_subscription` |
| CoachLogic Pro | Monthly | $15.00/mo | `subscription` | `coachlogic_subscription` |
| GlobeGuide Pro | Monthly | $18.00/mo | `subscription` | `globeguide_subscription` |
| SkillScope Pro | Monthly | $16.00/mo | `subscription` | `skillscope_subscription` |
| DataVault Pro | Monthly | $22.00/mo | `subscription` | `datavault_subscription` |
| GuardianAI Pro | Monthly | $25.00/mo | `subscription` | `guardianai_subscription` |
| TrendPulse Pro | Monthly | $29.00/mo | `subscription` | `trendpulse_subscription` |
| SoundForge Pro | Monthly | $20.00/mo | `subscription` | `soundforge_subscription` |
| MemeMint Pro | Monthly | $8.00/mo | `subscription` | `mememint_subscription` |

> **Note:** Products and prices are **not** pre-created in the Stripe Dashboard. They're generated on-the-fly using `price_data` in each checkout session creation call. This means you don't need to set up any products in Stripe — the code handles everything.

---

## How the Payment Flow Works

```
User clicks "Subscribe"
        │
        ▼
Frontend calls POST /api/{tool}/subscribe
        │
        ▼
Backend creates Stripe Checkout Session
  - Sets success_url & cancel_url
  - Includes userId & productType in metadata
  - Creates/reuses Stripe Customer
        │
        ▼
User redirected to Stripe Checkout page
        │
        ├── User pays ──► Stripe sends webhook to /api/stripe/webhook
        │                         │
        │                         ▼
        │                 Event: checkout.session.completed
        │                         │
        │                         ▼
        │                 Read metadata.productType
        │                         │
        │                         ▼
        │                 Activate subscription in database
        │
        ▼
User redirected to success_url (e.g., /flipscore?success=true)
        │
        ▼
App checks subscription status → Tool is now unlocked ✅
```

---

## Troubleshooting Stripe Issues

### Webhook Endpoint Shows "Pending" or Errors

1. Go to Stripe Dashboard → Developers → Webhooks → click your endpoint
2. Check "Recent events" tab — look for failed deliveries
3. Common causes:
   - Wrong URL (typo, trailing slash)
   - App not deployed / server down
   - `STRIPE_WEBHOOK_SECRET` mismatch
4. You can **resend** failed events from the dashboard

### "No such customer" Error

This can happen if you switch between test and live mode. Test customers don't exist in live mode.

**Fix:** The app auto-creates customers, so this should self-resolve. If persistent, clear `stripeCustomerId` from the user's database record.

### Subscription Activated But Tool Still Locked

1. Check the database: is the subscription flag set to `true`?
2. Check if the page is reading from session cache — try signing out and back in
3. Verify the `productType` in metadata matches the expected value

### Webhook Signature Verification Failed

```
Webhook signature error: No signatures found matching the expected signature
```

**Fix:** Ensure `STRIPE_WEBHOOK_SECRET` matches the signing secret shown in the Stripe webhook endpoint details. Each webhook endpoint has its own unique secret.

### "api_key_expired" or Authentication Errors

Your API key may have been rolled. Go to Stripe Dashboard → Developers → API keys and check if the key is still active. Generate a new one if needed.

---

*For general deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).*
