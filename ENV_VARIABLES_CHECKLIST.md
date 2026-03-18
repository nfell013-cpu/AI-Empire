# Environment Variables Checklist

Complete list of all environment variables required for AI Empire.

---

## 🔴 Required — App Will Not Function Without These

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string (Supabase pooler recommended) | `postgresql://postgres.xxx:pass@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js session encryption. Generate with `openssl rand -base64 32` | `aEyUF15DxW2uWSL9u5fchKx7YFMZ0R0H` |
| `NEXTAUTH_URL` | Full URL of your deployed application | `https://aiempire.com` or `https://ai-empire.vercel.app` |

## 🟠 Required for Payments (Stripe)

| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key (use `sk_test_` for dev, `sk_live_` for prod) | `sk_live_51T3t...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (client-side) | `pk_live_51T3t...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |

## 🟡 Required for Crypto Payments (Coinbase Commerce)

| Variable | Description | Example |
|----------|-------------|---------|
| `COINBASE_COMMERCE_API_KEY` | Coinbase Commerce API key | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `COINBASE_WEBHOOK_SECRET` | Coinbase webhook shared secret | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |

## 🟢 Required for File Storage (AWS S3)

| Variable | Description | Example |
|----------|-------------|---------|
| `AWS_REGION` | AWS region for S3 bucket | `us-west-2` |
| `AWS_BUCKET_NAME` | S3 bucket name | `ai-empire-uploads` |
| `AWS_FOLDER_PREFIX` | Folder prefix within the bucket | `uploads/` |
| `AWS_ACCESS_KEY_ID` | AWS access key (or use `AWS_PROFILE`) | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key (or use `AWS_PROFILE`) | `wJalr...` |

> **Note**: If deploying on infrastructure with IAM roles (e.g., EC2, ECS), you may not need explicit AWS keys.

## 🔵 Required for AI Features

| Variable | Description | Example |
|----------|-------------|---------|
| `ABACUSAI_API_KEY` | Abacus.AI API key for AI tool functionality | `5637da42...` |
| `OPENAI_API_KEY` | OpenAI API key (if using OpenAI models) | `sk-...` |

## ⚪ Optional — Enhanced Features

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend API key for email notifications | `re_...` |
| `TWILIO_ACCOUNT_SID` | Twilio account SID for SMS notifications | `AC...` |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | `your_auth_token` |
| `TWILIO_PHONE_NUMBER` | Twilio phone number for sending SMS | `+1234567890` |
| `DIRECT_URL` | Direct database URL for Prisma migrations (bypasses pooler) | `postgresql://...5432/postgres` |

---

## How to Set Variables

### Local Development

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

### Vercel

1. Go to **Project Settings → Environment Variables**
2. Add each variable
3. Select environments: **Production**, **Preview**, **Development**

### Vercel CLI

```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# ... etc
```

---

## Quick Validation

Run this locally to check which variables are set:

```bash
node -e "
const required = [
  'DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL',
  'STRIPE_SECRET_KEY', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET',
  'ABACUSAI_API_KEY'
];
const optional = [
  'COINBASE_COMMERCE_API_KEY', 'COINBASE_WEBHOOK_SECRET',
  'AWS_REGION', 'AWS_BUCKET_NAME', 'AWS_FOLDER_PREFIX',
  'OPENAI_API_KEY', 'RESEND_API_KEY',
  'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'
];
console.log('\n=== Required Variables ===');
required.forEach(v => console.log(process.env[v] ? '✅' : '❌', v));
console.log('\n=== Optional Variables ===');
optional.forEach(v => console.log(process.env[v] ? '✅' : '⬜', v));
"
```
