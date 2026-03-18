# AI Empire - 5-Minute Deployment Guide

---

## Prerequisites
- Node.js 18+
- Vercel account

---

## Step 1: Install & Login (1 min)
```bash
npm i -g vercel
vercel login
```

## Step 2: Deploy (2 min)
```bash
cd ai_empire
npm install
npx prisma generate
vercel --prod
```

## Step 3: Set Environment Variables (1 min)
In Vercel Dashboard → Settings → Environment Variables, add:

```env
DATABASE_URL=postgresql://postgres.vbocvzdndooordltfamh:Romeo0138.fell@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres.vbocvzdndooordltfamh:Romeo0138.fell@aws-0-us-west-2.pooler.supabase.com:5432/postgres
NEXTAUTH_SECRET=5b19fb6a23cebb45ce7c5d39ba804fd96c80b5418723ebffb93c75cc2a38f1d4
NEXTAUTH_URL=https://your-domain.vercel.app
STRIPE_SECRET_KEY=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
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51T3tQVC3LZVzOgF2jOarhhpNZYLDETuQHbnWgoibXT7mNsMg4dRnYAHVuskD8RyfwCFteBuVvIg6YXnGl9pkpeDg004wwS2ojX
STRIPE_WEBHOOK_SECRET=whsec_configure_after_webhook_setup
ABACUSAI_API_KEY=5637da42005544468255b110fab2dc1f
```

## Step 4: Setup Stripe Webhook (1 min)
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
3. Events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`
4. Copy signing secret → update `STRIPE_WEBHOOK_SECRET` in Vercel

## Step 5: Verify (30 sec)
```bash
./scripts/test-production.sh https://your-domain.vercel.app
```

---

## Admin Login
- Email: `admin@aiempire.com`
- Password: `98JhvWGkvXcmnHcrl_Ebfw`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails | Check all env vars are set in Vercel |
| DB connection error | Verify DATABASE_URL and DIRECT_URL |
| Auth not working | Set NEXTAUTH_URL to your actual domain |
| Payments failing | Configure webhook secret correctly |
| 500 errors | Check Vercel function logs |
