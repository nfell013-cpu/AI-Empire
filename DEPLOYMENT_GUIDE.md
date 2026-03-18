# AI Empire — Complete Deployment Guide

> **Last updated:** March 2026  
> A Next.js 14 SaaS platform with 15 AI tools, Stripe & Coinbase Commerce payments, NextAuth authentication, and PostgreSQL via Prisma.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [All URLs & Endpoints Reference](#all-urls--endpoints-reference)
3. [Environment Variables Checklist](#environment-variables-checklist)
4. [Database Setup](#database-setup)
5. [Deployment Instructions](#deployment-instructions)
   - [Vercel (Recommended)](#option-a--vercel-recommended)
   - [Railway](#option-b--railway)
   - [Custom VPS / Docker](#option-c--custom-vps--docker)
6. [Stripe Configuration](#stripe-configuration)
7. [Coinbase Commerce Configuration](#coinbase-commerce-configuration)
8. [Post-Deployment Checklist](#post-deployment-checklist)
9. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Next.js App                        │
│  ┌─────────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  15 AI Tool  │  │ NextAuth │  │  Prisma ORM   │  │
│  │   Pages      │  │  (JWT)   │  │               │  │
│  └──────┬───────┘  └────┬─────┘  └───────┬───────┘  │
│         │               │                │           │
│  ┌──────▼───────────────▼────────────────▼───────┐  │
│  │              API Routes (/api/*)               │  │
│  └──────┬───────────────┬────────────────┬───────┘  │
└─────────┼───────────────┼────────────────┼──────────┘
          │               │                │
    ┌─────▼─────┐  ┌──────▼──────┐  ┌─────▼──────┐
    │  Stripe   │  │  Coinbase   │  │ PostgreSQL │
    │  Payments │  │  Commerce   │  │  Database  │
    └───────────┘  └─────────────┘  └────────────┘
```

---

## All URLs & Endpoints Reference

### Stripe Checkout Endpoints (Internal API Routes)

These are the API routes your app exposes. They create Stripe Checkout Sessions:

| API Route | Method | Payment Mode | Product | Price |
|---|---|---|---|---|
| `/api/stripe/checkout` | POST | `payment` (one-time) | Legalese Contract Scan | $9.99 |
| `/api/flipscore/subscribe` | POST | `subscription` | FlipScore Pro | $19.99/mo |
| `/api/tradeace/subscribe` | POST | `subscription` | TradeAce Pro | $29.99/mo |
| `/api/dealdone/subscribe` | POST | `subscription` | DealDone Pro | $39.00/mo |
| `/api/leafcheck/subscribe` | POST | `subscription` | LeafCheck Pro | $12.00/mo |
| `/api/pawpair/purchase` | POST | `payment` (one-time) | PawPair Lifetime | $14.00 |
| `/api/visionlens/subscribe` | POST | `subscription` | VisionLens Pro | $10.00/mo |
| `/api/coachlogic/subscribe` | POST | `subscription` | CoachLogic Pro | $15.00/mo |
| `/api/globeguide/subscribe` | POST | `subscription` | GlobeGuide Pro | $18.00/mo |
| `/api/skillscope/subscribe` | POST | `subscription` | SkillScope Pro | $16.00/mo |
| `/api/datavault/subscribe` | POST | `subscription` | DataVault Pro | $22.00/mo |
| `/api/guardianai/subscribe` | POST | `subscription` | GuardianAI Pro | $25.00/mo |
| `/api/trendpulse/subscribe` | POST | `subscription` | TrendPulse Pro | $29.00/mo |
| `/api/soundforge/subscribe` | POST | `subscription` | SoundForge Pro | $20.00/mo |
| `/api/mememint/subscribe` | POST | `subscription` | MemeMint Pro | $8.00/mo |

### Stripe Webhook Endpoint

| Endpoint | Method | Must be publicly accessible |
|---|---|---|
| `/api/stripe/webhook` | POST | ✅ YES — Register this in Stripe Dashboard |

### Stripe Success & Cancel Redirect URLs

After checkout, Stripe redirects users back to these pages on your domain:

| Tool | Success URL | Cancel URL |
|---|---|---|
| Legalese | `{DOMAIN}/legalese?session_id={CHECKOUT_SESSION_ID}&success=true` | `{DOMAIN}/legalese?canceled=true` |
| FlipScore | `{DOMAIN}/flipscore?success=true&session_id={CHECKOUT_SESSION_ID}` | `{DOMAIN}/flipscore?canceled=true` |
| TradeAce | `{DOMAIN}/tradeace?success=true&session_id={CHECKOUT_SESSION_ID}` | `{DOMAIN}/tradeace?canceled=true` |
| DealDone | `{DOMAIN}/dealdone?success=true` | `{DOMAIN}/dealdone?canceled=true` |
| LeafCheck | `{DOMAIN}/leafcheck?success=true` | `{DOMAIN}/leafcheck?canceled=true` |
| PawPair | `{DOMAIN}/pawpair?success=true` | `{DOMAIN}/pawpair?canceled=true` |
| VisionLens | `{DOMAIN}/visionlens?success=true` | `{DOMAIN}/visionlens?canceled=true` |
| CoachLogic | `{DOMAIN}/coachlogic?success=true` | `{DOMAIN}/coachlogic?canceled=true` |
| GlobeGuide | `{DOMAIN}/globeguide?success=true` | `{DOMAIN}/globeguide?canceled=true` |
| SkillScope | `{DOMAIN}/skillscope?success=true` | `{DOMAIN}/skillscope?canceled=true` |
| DataVault | `{DOMAIN}/datavault?success=true` | `{DOMAIN}/datavault?canceled=true` |
| GuardianAI | `{DOMAIN}/guardianai?success=true` | `{DOMAIN}/guardianai?canceled=true` |
| TrendPulse | `{DOMAIN}/trendpulse?success=true` | `{DOMAIN}/trendpulse?canceled=true` |
| SoundForge | `{DOMAIN}/soundforge?success=true` | `{DOMAIN}/soundforge?canceled=true` |
| MemeMint | `{DOMAIN}/mememint?success=true` | `{DOMAIN}/mememint?canceled=true` |

> **Note:** The `{DOMAIN}` is automatically resolved from the request's `origin` header at runtime. No hardcoded domain needed.

### Coinbase Commerce Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/crypto/checkout` | POST | Creates a Coinbase Commerce charge (supports all 15 products) |
| `/api/crypto/webhook` | POST | ✅ Receives Coinbase webhook events — Register in Coinbase Dashboard |

**Coinbase Redirect URLs:** Dynamically constructed as `{DOMAIN}/{toolPath}?crypto_success=true` and `{DOMAIN}/{toolPath}?crypto_canceled=true`.

### Other API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth authentication (login, session, CSRF) |
| `/api/signup` | POST | User registration |
| `/api/user/profile` | GET/PATCH | User profile management |
| `/api/user/stats` | GET | User statistics |
| `/api/upload/presigned` | POST | AWS S3 presigned upload URLs |
| `/api/{tool}/analyze` or `/api/{tool}/generate` or `/api/{tool}/scan` | POST | AI tool execution (per tool) |
| `/api/{tool}/stats` | GET | Per-tool usage statistics |

### Protected Pages (Require Auth via Middleware)

All tool pages, `/dashboard/*`, and `/profile/*` require authentication. The middleware redirects unauthenticated users to `/auth/login`.

---

## Environment Variables Checklist

Create a `.env` file (or configure in your hosting platform) with these variables:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string. Format: `postgresql://USER:PASS@HOST:PORT/DBNAME` |
| `NEXTAUTH_SECRET` | ✅ | Random string for JWT signing. Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | Your production URL (e.g., `https://yourdomain.com`). Required by NextAuth. |
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret key (`sk_live_...` or `sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe publishable key (`pk_live_...` or `pk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe webhook signing secret (`whsec_...`). Get from Stripe Dashboard → Webhooks. |
| `COINBASE_COMMERCE_API_KEY` | ⚠️ Optional | Coinbase Commerce API key. Only needed if accepting crypto payments. |
| `COINBASE_WEBHOOK_SECRET` | ⚠️ Optional | Coinbase webhook shared secret for signature verification. |
| `AWS_REGION` | ⚠️ Optional | AWS region for S3 (e.g., `us-west-2`). Needed for file uploads. |
| `AWS_BUCKET_NAME` | ⚠️ Optional | S3 bucket name for file storage. |
| `AWS_ACCESS_KEY_ID` | ⚠️ Optional | AWS IAM access key (or use `AWS_PROFILE`). |
| `AWS_SECRET_ACCESS_KEY` | ⚠️ Optional | AWS IAM secret key. |
| `ABACUSAI_API_KEY` | ⚠️ Optional | Abacus.AI API key for AI tool functionality. |

### Example `.env.production`

```bash
# Database
DATABASE_URL="postgresql://user:password@your-db-host:5432/ai_empire?sslmode=require"

# Auth
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="https://yourdomain.com"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Coinbase Commerce (optional)
COINBASE_COMMERCE_API_KEY="your-coinbase-api-key"
COINBASE_WEBHOOK_SECRET="your-coinbase-webhook-secret"

# AWS S3 (optional - for file uploads)
AWS_REGION="us-west-2"
AWS_BUCKET_NAME="your-bucket"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."

# AI
ABACUSAI_API_KEY="your-abacus-api-key"
```

---

## Database Setup

### Option A: Managed PostgreSQL (Recommended)

Use a managed PostgreSQL provider:
- **Neon** (free tier) — https://neon.tech
- **Supabase** — https://supabase.com
- **Railway** — https://railway.app
- **PlanetScale** (MySQL via Prisma adapter)
- **AWS RDS** / **Google Cloud SQL**

1. Create a new PostgreSQL database
2. Copy the connection string
3. Set `DATABASE_URL` in your environment

### Option B: Self-Hosted PostgreSQL

```bash
# Install PostgreSQL
sudo apt update && sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE ai_empire;
CREATE USER ai_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ai_empire TO ai_user;
\q
```

### Run Prisma Migrations

After setting `DATABASE_URL`:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# (Optional) Seed the database
npx tsx scripts/seed.ts
```

---

## Deployment Instructions

### Option A — Vercel (Recommended)

Vercel is the native hosting platform for Next.js.

#### Step 1: Prepare Repository

```bash
# Initialize git if not already
cd /path/to/ai_empire
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
gh repo create ai-empire --private --push
# Or manually create a repo and push
git remote add origin https://github.com/YOUR_USERNAME/ai-empire.git
git push -u origin main
```

#### Step 2: Deploy to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `ai-empire` repository
4. **Framework Preset**: Next.js (auto-detected)
5. **Root Directory**: Leave as `/` (the project root)
6. **Build Command**: `npx prisma generate && next build`
7. **Install Command**: `npm install`

#### Step 3: Configure Environment Variables

In Vercel Dashboard → Project → **Settings** → **Environment Variables**, add all variables from the checklist above.

> ⚠️ **Important**: `NEXTAUTH_URL` must be set to your Vercel deployment URL (e.g., `https://ai-empire.vercel.app` or your custom domain).

#### Step 4: Add Custom Domain (Optional)

1. Vercel Dashboard → **Domains**
2. Add your domain (e.g., `aiempire.com`)
3. Update DNS records as instructed by Vercel
4. Update `NEXTAUTH_URL` to match your custom domain

#### Step 5: Configure Webhooks

After deployment, configure:
- **Stripe Webhook**: `https://yourdomain.com/api/stripe/webhook`
- **Coinbase Webhook**: `https://yourdomain.com/api/crypto/webhook`

(See [Stripe Configuration](#stripe-configuration) section below.)

---

### Option B — Railway

#### Step 1: Create Project

1. Go to https://railway.app and sign in
2. Click **"New Project"** → **"Deploy from GitHub Repo"**
3. Select your repository

#### Step 2: Add PostgreSQL

1. Click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway automatically provides `DATABASE_URL`

#### Step 3: Configure Variables

In the Railway service settings → **Variables**, add all environment variables. Railway auto-provides `DATABASE_URL` from the linked PostgreSQL.

#### Step 4: Build Settings

- **Build Command**: `npx prisma generate && npx prisma db push && npm run build`
- **Start Command**: `npm start`

#### Step 5: Deploy & Get Domain

Railway provides a `.railway.app` domain automatically. Set `NEXTAUTH_URL` to this domain.

---

### Option C — Custom VPS / Docker

#### Prerequisites

- Ubuntu 22.04+ VPS (2GB+ RAM recommended)
- Node.js 18+ installed
- PostgreSQL running (local or remote)
- Nginx for reverse proxy
- SSL certificate (Let's Encrypt)

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### Step 2: Deploy Application

```bash
# Clone your repo
cd /var/www
git clone https://github.com/YOUR_USERNAME/ai-empire.git
cd ai-empire

# Install dependencies
npm install

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "ai-empire" -- start
pm2 save
pm2 startup
```

#### Step 3: Nginx Configuration

```nginx
# /etc/nginx/sites-available/ai-empire
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ai-empire /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 4: SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### Step 5: Environment File

Create `/var/www/ai-empire/.env` with all production variables.

---

## Stripe Configuration

> **See also:** [STRIPE_SETUP.md](./STRIPE_SETUP.md) for a detailed step-by-step Stripe guide.

### Quick Setup

1. **Get API Keys**: Stripe Dashboard → Developers → API Keys
   - Copy `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy `Secret key` → `STRIPE_SECRET_KEY`

2. **Register Webhook**:
   - Stripe Dashboard → Developers → Webhooks → **"Add endpoint"**
   - **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
   - **Events to listen for**:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `customer.subscription.deleted`
   - Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

---

## Coinbase Commerce Configuration

1. Sign up at https://commerce.coinbase.com
2. Go to **Settings** → **API Keys** → Create new API key
3. Set `COINBASE_COMMERCE_API_KEY` in your environment
4. Go to **Settings** → **Webhook subscriptions** → Add endpoint:
   - **URL**: `https://yourdomain.com/api/crypto/webhook`
   - Copy the **Shared secret** → `COINBASE_WEBHOOK_SECRET`
5. Events handled automatically: `charge:confirmed`, `charge:resolved`, `charge:failed`, `charge:expired`

---

## Post-Deployment Checklist

- [ ] **Database**: `npx prisma db push` completed successfully
- [ ] **Environment Variables**: All required vars set in hosting platform
- [ ] **NEXTAUTH_URL**: Set to your production domain (with `https://`)
- [ ] **Stripe Webhook**: Registered at `https://yourdomain.com/api/stripe/webhook`
  - [ ] Events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`
  - [ ] `STRIPE_WEBHOOK_SECRET` set from the webhook signing secret
- [ ] **Coinbase Webhook** (if using crypto): Registered at `https://yourdomain.com/api/crypto/webhook`
- [ ] **SSL**: Site loads over HTTPS
- [ ] **Test Signup**: Create a new account at `/auth/signup`
- [ ] **Test Login**: Log in and verify dashboard loads
- [ ] **Test Payment**: Make a test purchase (use Stripe test mode first)
- [ ] **Test Webhook**: Verify webhook delivery in Stripe Dashboard → Webhooks → Recent events
- [ ] **Custom Domain**: DNS configured and propagated
- [ ] **AI Tools**: Verify at least one AI tool works end-to-end (e.g., Legalese scan)
- [ ] **S3 Uploads** (if used): Test file upload functionality

---

## Troubleshooting

### "NEXTAUTH_URL" errors

**Symptom:** Auth redirects go to `localhost:3000` instead of your domain.

**Fix:** Ensure `NEXTAUTH_URL` is set to your full production URL including protocol:
```
NEXTAUTH_URL=https://yourdomain.com
```

### Stripe webhook returning 400/500

**Symptom:** Payments complete but subscriptions don't activate.

**Fix:**
1. Check `STRIPE_WEBHOOK_SECRET` is correctly set (starts with `whsec_`)
2. Verify the webhook endpoint URL has no trailing slash
3. In Stripe Dashboard → Webhooks, check "Recent events" for error details
4. Ensure the webhook route is **not** behind authentication middleware (it isn't by default — the middleware only protects tool pages)

### Prisma / Database connection errors

**Symptom:** `PrismaClientInitializationError` or `Can't reach database server`

**Fix:**
1. Verify `DATABASE_URL` is correct and reachable from your deployment
2. For Vercel/Railway, ensure the database allows external connections (allowlist IPs or use `?sslmode=require`)
3. Run `npx prisma generate` as part of your build command

### Build fails on Vercel

**Symptom:** Build error related to Prisma client.

**Fix:** Use this build command:
```
npx prisma generate && next build
```

### Stripe checkout redirects to localhost

**Symptom:** After clicking "Subscribe", user is redirected to `localhost:3000`.

**Fix:** This shouldn't happen in production because the code uses `request.headers.get("origin")`. If it does:
1. Check that your domain is properly configured
2. Ensure your reverse proxy forwards the `Host` and `Origin` headers

### "Module not found" errors

**Symptom:** Build fails with missing module errors.

**Fix:**
```bash
rm -rf node_modules .next
npm install
npx prisma generate
npm run build
```

### Coinbase payments not activating subscriptions

**Symptom:** Crypto payment completes on Coinbase but subscription isn't activated.

**Fix:**
1. Verify `COINBASE_WEBHOOK_SECRET` is set
2. Check that `https://yourdomain.com/api/crypto/webhook` is registered in Coinbase Commerce settings
3. Coinbase webhook events may take a few minutes for blockchain confirmations

### CORS or Origin issues

**Symptom:** API calls fail with CORS errors.

**Fix:** Next.js API routes handle CORS automatically when served from the same domain. If using a separate frontend:
- Add CORS headers to your API routes
- Or configure `next.config.js` with rewrites

---

## AI Integration Suggestions

The project uses Abacus.AI for its AI features. To enhance or add AI capabilities:

1. **Abacus.AI API**: Already integrated via `ABACUSAI_API_KEY`. Powers all 15 AI tool backends.
2. **OpenAI / Anthropic**: Could be added as alternative AI providers for specific tools.
3. **Custom Models**: Train and deploy custom models through Abacus.AI for specialized use cases.
4. **Vector Search**: Add document retrieval capabilities using Abacus.AI's document retrievers.

---

*For detailed Stripe setup instructions, see [STRIPE_SETUP.md](./STRIPE_SETUP.md).*
