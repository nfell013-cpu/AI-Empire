# Vercel Deployment Guide

Step-by-step instructions to deploy AI Empire on Vercel.

---

## Prerequisites

- [ ] GitHub repository with the AI Empire code pushed
- [ ] Supabase database set up (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- [ ] Stripe account configured (see [STRIPE_SETUP.md](./STRIPE_SETUP.md))
- [ ] All environment variables ready (see [ENV_VARIABLES_CHECKLIST.md](./ENV_VARIABLES_CHECKLIST.md))
- [ ] Vercel account at [https://vercel.com](https://vercel.com)

---

## Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit - AI Empire"
git remote add origin https://github.com/YOUR_USERNAME/ai-empire.git
git push -u origin main
```

## Step 2: Import Project in Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `ai-empire` repository
4. Vercel auto-detects it as a **Next.js** project

## Step 3: Configure Build Settings

Vercel should auto-detect these, but verify:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Build Command** | `npx prisma generate && next build` |
| **Output Directory** | `.next` |
| **Install Command** | `npm install` |
| **Node.js Version** | 18.x or 20.x |

### Custom Build Command

Set the build command to include Prisma generation:

```
npx prisma generate && next build
```

Or add it to `package.json`:

```json
{
  "scripts": {
    "vercel-build": "npx prisma generate && next build"
  }
}
```

## Step 4: Set Environment Variables

In Vercel project settings → **Environment Variables**, add all required variables:

### Critical Variables

```
DATABASE_URL=postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres
NEXTAUTH_SECRET=<your-secret>
NEXTAUTH_URL=https://your-domain.vercel.app
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### All Variables

Refer to [ENV_VARIABLES_CHECKLIST.md](./ENV_VARIABLES_CHECKLIST.md) for the complete list.

> **Important**: Set `NEXTAUTH_URL` to your production domain (e.g., `https://aiempire.com` or `https://ai-empire.vercel.app`)

## Step 5: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (~2-5 minutes)
3. Vercel provides a preview URL: `https://ai-empire-xxx.vercel.app`

## Step 6: Run Database Migration

After the first deploy, push the Prisma schema to your Supabase database:

```bash
# Locally with your production DATABASE_URL
DATABASE_URL="your-supabase-direct-url" npx prisma db push

# Seed the admin user
DATABASE_URL="your-supabase-direct-url" npx prisma db seed
```

Alternatively, use Vercel CLI:

```bash
npx vercel env pull .env.local
npx prisma db push
npx prisma db seed
```

## Step 7: Configure Custom Domain (Optional)

1. Go to **Project Settings → Domains**
2. Add your domain (e.g., `aiempire.com`)
3. Configure DNS records as instructed by Vercel:
   - **A Record**: `76.76.21.21`
   - **CNAME**: `cname.vercel-dns.com`
4. Update `NEXTAUTH_URL` to your custom domain
5. Redeploy for the change to take effect

## Step 8: Configure Stripe Webhooks for Production

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Set the endpoint URL:
   ```
   https://your-domain.vercel.app/api/stripe/webhook
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
5. Copy the **Signing Secret** (`whsec_...`) and update `STRIPE_WEBHOOK_SECRET` in Vercel
6. Redeploy

For detailed Stripe webhook setup, see [STRIPE_WEBHOOK_SETUP.md](./STRIPE_WEBHOOK_SETUP.md).

## Step 9: Configure Coinbase Commerce Webhook (If Using Crypto)

1. Go to [Coinbase Commerce Settings](https://commerce.coinbase.com/dashboard/settings)
2. Under **Webhook subscriptions**, add:
   ```
   https://your-domain.vercel.app/api/crypto/webhook
   ```
3. Copy the shared secret and set `COINBASE_WEBHOOK_SECRET` in Vercel

---

## Post-Deployment Verification

- [ ] Visit your deployed URL — homepage loads correctly
- [ ] Sign up a new user — registration works
- [ ] Log in — authentication works
- [ ] Navigate to `/dashboard` — dashboard renders
- [ ] Test a Stripe checkout (use test keys first)
- [ ] Verify webhook events are received in Stripe dashboard
- [ ] Check `/admin/ads` (as admin) — ad management works
- [ ] Test token earning flow — watch ad, earn tokens
- [ ] Check Vercel logs for any runtime errors

---

## Vercel-Specific Configuration

### Function Timeout

For AI-heavy routes, increase the timeout in `vercel.json`:

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Cron Jobs (Optional)

For scheduled tasks (e.g., subscription expiry checks):

```json
{
  "crons": [
    {
      "path": "/api/cron/check-subscriptions",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Vercel Edge Config

For feature flags or real-time config changes without redeployment.

---

## Redeployment

Vercel automatically redeploys on every push to your `main` branch. To manually redeploy:

```bash
# Using Vercel CLI
npx vercel --prod

# Or trigger from the Vercel dashboard
```

---

## Troubleshooting

### Build fails with Prisma error
- Ensure `npx prisma generate` is in the build command
- Check that `DATABASE_URL` is set in environment variables

### 500 errors on API routes
- Check Vercel Function Logs (Project → Deployments → Functions)
- Verify all environment variables are set correctly
- Ensure database is accessible from Vercel's network

### NextAuth errors
- Verify `NEXTAUTH_URL` matches your deployed URL exactly (including `https://`)
- Ensure `NEXTAUTH_SECRET` is set

### Stripe webhook failures
- Verify the webhook endpoint URL is correct
- Ensure `STRIPE_WEBHOOK_SECRET` matches the signing secret from Stripe
- Check that the endpoint is receiving raw body (Next.js API routes handle this)

### Cold start latency
- Vercel Serverless Functions have cold starts (~1-3s)
- Consider Vercel Edge Functions for latency-critical routes
- Use connection pooling for database (Supabase pgBouncer)
