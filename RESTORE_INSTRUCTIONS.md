# AI Empire - Restore Instructions

## Prerequisites

- **Node.js** 18.x or later
- **npm** 9.x or later
- **PostgreSQL** database (local or hosted, e.g., Supabase, Railway)
- **Stripe** account with API keys
- **Git** (optional, for version control)

---

## Step 1: Extract the Backup

```bash
# Create a directory and extract
mkdir -p ~/ai_empire_restored
unzip ai_empire_master_backup.zip -d ~/ai_empire_restored
cd ~/ai_empire_restored
```

Verify extraction:
```bash
ls -la
# Should see: app/ components/ lib/ prisma/ package.json etc.
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This will install all packages from `package-lock.json` (~400MB in node_modules).

---

## Step 3: Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```bash
# Required - Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Required - Auth
NEXTAUTH_SECRET="your-secret-key"    # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"  # Your app URL

# Required - Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Optional - Coinbase Commerce
COINBASE_COMMERCE_API_KEY="your-key"
COINBASE_COMMERCE_WEBHOOK_SECRET="your-secret"

# Optional - AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket"

# Optional - Notifications
TWILIO_ACCOUNT_SID="your-sid"
TWILIO_AUTH_TOKEN="your-token"
TWILIO_PHONE_NUMBER="+1234567890"
RESEND_API_KEY="your-key"
```

---

## Step 4: Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

Verify database:
```bash
npx prisma studio
# Opens browser UI to inspect database tables
```

---

## Step 5: Seed Admin User

The admin user can be created by:

1. **Sign up** at `/signup` with the credentials in `ADMIN_CREDENTIALS.txt`
2. **Or** run the seed script:

```bash
node scripts/seed-admin.js
```

3. **Or** manually via Prisma Studio - set user `role` to `"admin"`

---

## Step 6: Set Up Stripe Products

If starting with a fresh Stripe account:

```bash
node scripts/setup-stripe-products.js
```

This creates all 53 Stripe products (45 app subscriptions, 5 token packs, 3 tiered plans).

If reusing existing Stripe products, the `stripe-products.json` file in the backup contains all product/price IDs.

---

## Step 7: Build and Run

### Development Mode
```bash
npm run dev
# App runs at http://localhost:3000
```

### Production Mode
```bash
npm run build
npm start
# App runs at http://localhost:3000
```

---

## Step 8: Test the Installation

1. **Homepage**: Visit `http://localhost:3000` - should see landing page
2. **Sign Up**: Create an account at `/signup`
3. **Login**: Sign in at `/login`
4. **Dashboard**: Verify dashboard loads with all 45 tools
5. **Token Balance**: Check token balance displays correctly
6. **Earn Tokens**: Test ad-watching token earning
7. **Stripe Checkout**: Test a subscription purchase (use test cards)
8. **Admin Panel**: Login as admin, verify `/admin/ads` works

### Test Cards (Stripe Test Mode)
| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Decline |
| 4000 0000 0000 3220 | 3D Secure |

---

## Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules
npm install
npx prisma generate
```

### Database connection errors
- Verify `DATABASE_URL` in `.env` is correct
- Ensure PostgreSQL is running and accessible
- Check firewall rules for remote databases

### Prisma errors
```bash
npx prisma generate
npx prisma db push --force-reset  # WARNING: resets all data
```

### Stripe webhook errors
- Verify `STRIPE_WEBHOOK_SECRET` matches your webhook endpoint
- For local development, use Stripe CLI:
  ```bash
  stripe listen --forward-to localhost:3000/api/stripe/webhook
  ```

### Build fails
```bash
# Clear caches
rm -rf .next
npm run build
```

### Port already in use
```bash
lsof -i :3000
kill -9 <PID>
```

---

## File Structure Reference

```
ai_empire/
├── app/              # Next.js pages and API routes (45 AI tools)
├── components/       # React components
├── config/           # Product configuration
├── docs/             # Additional documentation
├── hooks/            # Custom React hooks
├── lib/              # Utility libraries
├── prisma/           # Database schema
├── public/           # Static assets
├── scripts/          # Setup and utility scripts
├── .env.example      # Environment template
├── package.json      # Dependencies
└── *.md / *.pdf      # Documentation files
```
