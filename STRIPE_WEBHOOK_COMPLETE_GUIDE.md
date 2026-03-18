# AI Empire - Stripe Webhook Complete Guide

---

## Webhook Endpoint URL

```
https://your-domain.com/api/stripe/webhook
```

Replace `your-domain.com` with your actual deployment URL.

---

## Required Events

Subscribe to these 3 events:

| Event | Purpose |
|-------|--------|
| `checkout.session.completed` | Handles successful payments (subscriptions, tokens, ads) |
| `invoice.payment_succeeded` | Handles subscription renewals |
| `customer.subscription.deleted` | Handles subscription cancellations |

---

## How to Add in Stripe Dashboard

### Step 1: Navigate to Webhooks
1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Developers** in the left sidebar
3. Click **Webhooks**

### Step 2: Create Endpoint
1. Click **+ Add endpoint**
2. Enter your endpoint URL: `https://your-domain.com/api/stripe/webhook`
3. Click **Select events**

### Step 3: Select Events
1. Search for `checkout.session.completed` → check it
2. Search for `invoice.payment_succeeded` → check it
3. Search for `customer.subscription.deleted` → check it
4. Click **Add events**

### Step 4: Add Endpoint
1. Review the configuration
2. Click **Add endpoint**

---

## How to Get Signing Secret

1. After creating the endpoint, click on it
2. Under **Signing secret**, click **Reveal**
3. Copy the secret (starts with `whsec_`)
4. Add to your environment:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_signing_secret_here
   ```
5. Redeploy if using Vercel (or restart server)

---

## Testing Webhooks

### Method 1: Stripe CLI (Local Development)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward events to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# In another terminal, trigger a test event
stripe trigger checkout.session.completed
```

### Method 2: Stripe Dashboard
1. Go to Webhooks → Your endpoint
2. Click **Send test webhook**
3. Select event type
4. Click **Send test webhook**
5. Check response in the event logs

### Method 3: Production Test
1. Use Stripe test card: `4242 4242 4242 4242`
2. Any future expiry, any CVC
3. Complete a purchase flow
4. Check webhook event logs in Stripe Dashboard

---

## Webhook Handler Details

The webhook handler at `/api/stripe/webhook` processes:

1. **Token Purchases** (`type: "token_purchase"`)
   - Credits tokens to user's balance
   - Records transaction

2. **App Subscriptions** (`type: "app_subscription"`)
   - Activates subscription in user's `subscriptions` JSON
   - Sets expiry date

3. **Tiered Plans** (`type: "tiered_plan"`)
   - Activates plan with included apps
   - Sets expiry date

4. **Ad Purchases** (`productType: "ad_purchase"`)
   - Confirms ad payment
   - Notifies admin

5. **Subscription Renewals**
   - Extends expiry dates automatically

6. **Subscription Cancellations**
   - Marks subscriptions as inactive

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 400 Bad Request | Check `STRIPE_WEBHOOK_SECRET` is correct |
| Signature verification failed | Webhook secret doesn't match endpoint |
| Events not received | Check endpoint URL is accessible publicly |
| Timeout errors | Webhook handler taking too long; check DB connection |
