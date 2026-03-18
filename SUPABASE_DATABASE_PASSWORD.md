# 🔐 Supabase Database Password Setup

## How to Get Your Database Password

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Log in to your account
3. Select your project: **reezehxqvdnzdzlaxnwy**

### Step 2: Navigate to Database Settings
1. Click **Settings** (gear icon) in the left sidebar
2. Click **Database** under the Configuration section
3. Scroll to the **Connection string** section

### Step 3: Get the Password
- Your database password was set when you created the project
- If you forgot it, click **Reset database password** to generate a new one
- ⚠️ **WARNING**: Resetting the password will disconnect any existing connections

### Step 4: Update Your .env File
Replace `[YOUR-PASSWORD]` in both database URLs:

```bash
# Pooled connection (for application - port 6543)
DATABASE_URL="postgresql://postgres.reezehxqvdnzdzlaxnwy:YOUR_ACTUAL_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct connection (for migrations - port 5432)  
DIRECT_URL="postgresql://postgres.reezehxqvdnzdzlaxnwy:YOUR_ACTUAL_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

### Step 5: Test the Connection
```bash
npx prisma db pull
# If successful, your connection is working!
```

---

## Connection String Explained

| Component | Value |
|-----------|-------|
| **User** | `postgres.reezehxqvdnzdzlaxnwy` |
| **Host** | `aws-0-us-east-1.pooler.supabase.com` |
| **Port (Pooled)** | `6543` (via pgBouncer) |
| **Port (Direct)** | `5432` (direct to Postgres) |
| **Database** | `postgres` |
| **Project Ref** | `reezehxqvdnzdzlaxnwy` |

### When to Use Each Connection

| URL | Use Case | Port |
|-----|----------|------|
| `DATABASE_URL` | App runtime, queries, API routes | 6543 |
| `DIRECT_URL` | Prisma migrations, `db push`, schema changes | 5432 |

---

## 🔒 Security Best Practices

1. **Never commit passwords to git** - The `.env` file is in `.gitignore`
2. **Use environment variables** - Set in Vercel/hosting dashboard, not in code
3. **Rotate periodically** - Change the password every 90 days
4. **Use strong passwords** - At least 16 characters with mixed case, numbers, symbols
5. **Restrict network access** - In Supabase Dashboard → Settings → Database → Network restrictions
6. **Enable Row Level Security (RLS)** - Even though we use Prisma, RLS adds defense-in-depth

---

## Troubleshooting

### "password authentication failed"
- Double-check the password has no extra spaces
- Ensure you're using the correct project ref
- Try resetting the password in Supabase Dashboard

### "connection refused"
- Check that port 6543 (pooled) or 5432 (direct) is correct
- Verify the host matches your Supabase region

### "too many connections"
- Use the pooled connection (port 6543) for the app
- Set `connection_limit=1` in the DATABASE_URL
- Ensure `pgbouncer=true` is in the query string

### "prepared statement already exists"
- This happens when pgBouncer is in transaction mode
- Add `?pgbouncer=true` to the DATABASE_URL (already configured)
