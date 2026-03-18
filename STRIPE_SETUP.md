# AI Empire — Stripe Setup Guide (v2: 30 Tools)

> **Updated for the 30-tool architecture.** Subscriptions are now managed via a generic `subscriptions` JSON field and the automated setup script.

---

## 1. Getting Your API Keys

1. Go to [Stripe Dashboard → Developers → API Keys](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** (`pk_test_...`) and **Secret key** (`sk_test_...`)
3. Add them to `.env`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

---

## 2. Create Products Automatically

Instead of manually creating products in the Stripe Dashboard, run the setup script:

```bash
# Preview (no API calls)
node scripts/setup-stripe-products.js --dry-run

# Create products in test mode
STRIPE_SECRET_KEY=sk_test_XXXXX node scripts/setup-stripe-products.js

# Create products in live mode
STRIPE_SECRET_KEY=sk_live_XXXXX node scripts/setup-stripe-products.js --live
```

The script reads `config/products.json` and creates:
- 30 Stripe Products with proper metadata (`productType`, `tier`, `category`)
- 30 monthly recurring Prices based on the tier

Output is saved to `config/stripe-products-output.json`.

---

## 3. Configuring Webhooks

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (`whsec_...`) and add to `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Local Development

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 4. How the Payment Flow Works

```
User clicks "Subscribe" on any tool
  → POST /api/stripe/checkout  { productType: "codeaudit_subscription" }
  → Stripe Checkout Session created with tier pricing
  → User completes payment on Stripe
  → Stripe fires checkout.session.completed webhook
  → POST /api/stripe/webhook
  → User.subscriptions JSON updated: { codeaudit_subscription: { active: true, ... } }
  → User redirected to tool page with access granted
```

---

## 5. Pricing Tiers

| Tier       | Price/mo | Count | Tools |
|------------|----------|-------|-------|
| Basic      | $4.99    | 5     | MailPilot, RecipeRx, StudyBlitz, InvoicePro, MindMap |
| Standard   | $9.99    | 10    | DocuWise, BrandSpark, FitForge, LexiLearn, AdCopy, Socialize, SEOMaster, WriteFlow, TaskFlow, TravelMate |
| Premium    | $14.99   | 9     | CodeAudit, PixelCraft, VoiceBox, DataWeave, BugBuster, SketchAI, VideoSync, APIGen, HealthPulse |
| Enterprise | $24.99   | 6     | ChatGenius, PitchDeck, StockSense, ContractIQ, SecureNet, RealtorIQ |

---

## 6. Testing

Use test card numbers:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0027 6000 3184`

Expiry: any future date. CVC: any 3 digits.

---

## 7. Going Live

1. Activate your Stripe account
2. Get **live** API keys
3. Create a **new webhook** for your production domain
4. Update `.env` with live keys
5. Re-run the setup script with your live key:
   ```bash
   STRIPE_SECRET_KEY=sk_live_XXXXX node scripts/setup-stripe-products.js --live
   ```
