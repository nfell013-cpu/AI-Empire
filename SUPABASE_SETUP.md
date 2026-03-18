# Supabase Database Setup Guide

This guide walks you through setting up Supabase as the PostgreSQL database provider for AI Empire.

---

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up with GitHub or email
3. Click **"New Project"**

## Step 2: Create a New Project

1. Select your **Organization** (or create one)
2. **Project Name**: `ai-empire` (or your preferred name)
3. **Database Password**: Generate a strong password and **save it securely** — you'll need it for `DATABASE_URL`
4. **Region**: Choose the region closest to your users (e.g., `us-east-1` for US East)
5. **Pricing Plan**: Free tier works for development; Pro ($25/mo) recommended for production
6. Click **"Create new project"** and wait for provisioning (~2 minutes)

## Step 3: Get Your Connection String

1. In your Supabase dashboard, go to **Settings → Database**
2. Scroll to **Connection string** section
3. Select the **URI** tab
4. Copy the connection string — it looks like:

```
postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### Connection Pooling (Recommended for Production)

Supabase provides two connection modes:

| Mode | Port | Use Case |
|------|------|----------|
| **Transaction mode (pooler)** | `6543` | Best for serverless (Vercel) — use this |
| **Session mode** | `5432` | For long-lived connections |

For **Vercel deployment**, use the **Transaction mode** connection string:

```env
# .env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# For Prisma migrations (use direct connection)
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

## Step 4: Configure Prisma

The project uses Prisma ORM. Update the `prisma/schema.prisma` datasource if needed:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Add this for Supabase pooling
}
```

## Step 5: Run Database Migrations

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to Supabase database
npx prisma db push

# (Optional) Seed admin user
npx prisma db seed
```

### Verify Tables Were Created

In your Supabase dashboard:
1. Go to **Table Editor**
2. You should see all tables: `User`, `Session`, `Account`, `Scan`, `Payment`, `TokenTransaction`, `TokenPurchase`, `Ad`, `AdView`, `AdPayment`, `Advertiser`, `CryptoPayment`, and all tool-specific tables

## Step 6: Enable Row Level Security (Optional but Recommended)

Supabase enables RLS by default. Since AI Empire uses Prisma (server-side) to access the database, you have two options:

### Option A: Disable RLS for Prisma tables (Simpler)

In the Supabase SQL Editor, run:

```sql
-- Disable RLS for all AI Empire tables (Prisma handles auth)
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Scan" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "TokenTransaction" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "TokenPurchase" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Ad" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "AdView" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "AdPayment" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Advertiser" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "CryptoPayment" DISABLE ROW LEVEL SECURITY;
```

### Option B: Use service_role key (Recommended for production)

Use the `service_role` key in your `DATABASE_URL` which bypasses RLS.

## Step 7: Set Up Database Backups

Supabase Pro plan includes:
- **Daily backups** with 7-day retention
- **Point-in-time recovery** (PITR) for up to 7 days

For the Free tier, set up manual backups:

```bash
# Export database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

---

## Troubleshooting

### "Connection refused" errors
- Ensure you're using the correct port (`6543` for pooler, `5432` for direct)
- Check that your password doesn't contain special characters that need URL encoding

### "Prepared statement already exists" errors
- Add `?pgbouncer=true` to your `DATABASE_URL` when using transaction pooling

### Prisma migration issues
- Use `DIRECT_URL` (port 5432) for migrations, not the pooler connection
- Run `npx prisma db push` instead of `npx prisma migrate` for initial setup

### Connection timeout on Vercel
- Ensure `?connect_timeout=15` is appended to your `DATABASE_URL`
- Use connection pooling (port 6543)

---

## Quick Reference

| Item | Value |
|------|-------|
| Dashboard | `https://supabase.com/dashboard/project/[PROJECT_REF]` |
| Connection Pooler | Port `6543` |
| Direct Connection | Port `5432` |
| Free Tier Limits | 500 MB database, 2 GB bandwidth |
| Pro Plan | $25/mo — recommended for production |
