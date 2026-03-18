# AI Empire - Vercel Deployment Guide

## Prerequisites
- Node.js 18+
- Vercel account (https://vercel.com)
- Stripe account with live keys
- Supabase project (already configured)

---

## Step 1: Install Vercel CLI

```bash
npm i -g vercel
vercel login
```

## Step 2: Deploy

### Option A: Using Script (Recommended)
```bash
./scripts/deploy-to-vercel.sh --prod
```

### Option B: Manual Deploy
```bash
vercel --prod
```

### Option C: Git Integration
1. Push code to GitHub
2. Connect repository in Vercel dashboard
3. Vercel auto-deploys on push

---

## Step 3: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres.vbocvzdndooordltfamh:...` | Supabase transaction pooler |
| `DIRECT_URL` | `postgresql://postgres.vbocvzdndooordltfamh:...` | Supabase session pooler |
| `NEXTAUTH_SECRET` | `5b19fb6a23ce...` | Auth encryption key |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Your deployment URL |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Stripe public key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe webhook signing secret |
| `ABACUSAI_API_KEY` | `5637da42...` | AI services API key |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Email notifications |
| `COINBASE_COMMERCE_API_KEY` | Crypto payments |
| `TWILIO_ACCOUNT_SID` | SMS notifications |
| `TWILIO_AUTH_TOKEN` | SMS auth |
| `TWILIO_PHONE_NUMBER` | SMS sender |

---

## Step 4: Configure Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `aiempire.com`)
3. Update DNS records as instructed by Vercel
4. SSL is automatically provisioned by Vercel

### Update NEXTAUTH_URL
After domain setup, update `NEXTAUTH_URL` to your custom domain:
```
NEXTAUTH_URL=https://yourdomain.com
```

---

## Step 5: Configure Stripe Webhooks

See `STRIPE_WEBHOOK_COMPLETE_GUIDE.md` for detailed instructions.

Quick version:
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Subscribe to events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`
4. Copy signing secret → set as `STRIPE_WEBHOOK_SECRET`

---

## Step 6: Verify Deployment

```bash
./scripts/test-production.sh https://your-domain.com
```

---

## SSL Setup
SSL/TLS is **automatically handled** by Vercel:
- Free SSL certificates via Let's Encrypt
- Auto-renewal
- HTTPS enforced by default

---

## Troubleshooting

### Build Fails
- Check environment variables are set
- Ensure `DATABASE_URL` is correct
- Run `npx prisma generate` in build command

### Database Connection Issues
- Use transaction pooler URL for `DATABASE_URL` (port 6543)
- Use session pooler URL for `DIRECT_URL` (port 5432)
- Check Supabase project is active

### Auth Not Working
- Verify `NEXTAUTH_URL` matches your deployment URL
- Verify `NEXTAUTH_SECRET` is set
- Check cookies domain settings

### Stripe Payments Failing
- Verify webhook secret is correct
- Check webhook endpoint is receiving events
- Test with Stripe CLI: `stripe listen --forward-to your-url/api/stripe/webhook`
