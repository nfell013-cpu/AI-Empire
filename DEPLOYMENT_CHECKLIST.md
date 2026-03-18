# Pre-Deployment Checklist

Use this checklist before deploying AI Empire to production.

---

## 1. Code & Build

- [ ] All code committed and pushed to GitHub
- [ ] `npm run build` completes without errors locally
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No hardcoded localhost URLs in production code
- [ ] `.env` file is **NOT** committed (check `.gitignore`)

## 2. Database

- [ ] Supabase project created ([SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- [ ] `DATABASE_URL` connection string obtained
- [ ] `DIRECT_URL` (non-pooled) obtained for migrations
- [ ] `npx prisma db push` completed successfully against production DB
- [ ] `npx prisma db seed` run to create admin user
- [ ] Admin user verified: `admin@aiempire.com` with role `admin`
- [ ] All tables created and visible in Supabase Table Editor

## 3. Environment Variables

- [ ] All required variables set in Vercel (see [ENV_VARIABLES_CHECKLIST.md](./ENV_VARIABLES_CHECKLIST.md))
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] `NEXTAUTH_SECRET` is a strong random string
- [ ] `DATABASE_URL` uses connection pooling (port 6543, `?pgbouncer=true`)
- [ ] Stripe keys are **live** keys (not test keys) for production
- [ ] `STRIPE_WEBHOOK_SECRET` matches the production webhook endpoint

## 4. Stripe Configuration

- [ ] Stripe products created via `scripts/setup-stripe-products.js`
- [ ] `stripe-products.json` generated with all Product/Price IDs
- [ ] Stripe webhook endpoint configured: `https://YOUR_DOMAIN/api/stripe/webhook`
- [ ] Webhook events selected:
  - [ ] `checkout.session.completed`
  - [ ] `invoice.payment_succeeded`
  - [ ] `customer.subscription.deleted`
- [ ] Webhook signing secret saved as `STRIPE_WEBHOOK_SECRET`
- [ ] Test payment processed successfully

## 5. Coinbase Commerce (If Using Crypto)

- [ ] `COINBASE_COMMERCE_API_KEY` set
- [ ] `COINBASE_WEBHOOK_SECRET` set
- [ ] Webhook endpoint configured: `https://YOUR_DOMAIN/api/crypto/webhook`

## 6. AWS S3 (File Uploads)

- [ ] S3 bucket created with appropriate permissions
- [ ] `AWS_REGION`, `AWS_BUCKET_NAME`, `AWS_FOLDER_PREFIX` set
- [ ] AWS credentials configured (keys or IAM role)
- [ ] CORS configured on the S3 bucket for your domain
- [ ] Test file upload works

## 7. AI Services

- [ ] `ABACUSAI_API_KEY` is valid and has credits
- [ ] `OPENAI_API_KEY` set (if applicable)
- [ ] AI tools tested (at least one tool end-to-end)

## 8. Notifications (Optional)

- [ ] `RESEND_API_KEY` set for email notifications
- [ ] `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` set for SMS
- [ ] Test notification sent successfully

## 9. Security

- [ ] All secrets use strong, unique values
- [ ] No API keys or secrets in client-side code
- [ ] `NEXTAUTH_SECRET` is unique to this deployment
- [ ] HTTPS enforced (Vercel handles this automatically)
- [ ] Admin routes protected with role checks
- [ ] Rate limiting considered for public APIs

## 10. Vercel Deployment

- [ ] Project imported in Vercel from GitHub
- [ ] Build command: `npx prisma generate && next build`
- [ ] All environment variables added
- [ ] Custom domain configured (if applicable)
- [ ] DNS records propagated
- [ ] `NEXTAUTH_URL` updated to final domain
- [ ] Deployment successful (green status)

## 11. Post-Deployment Verification

- [ ] Homepage loads at production URL
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard displays correctly
- [ ] At least one AI tool works end-to-end
- [ ] Stripe checkout creates a session
- [ ] Stripe webhook receives events (check Stripe dashboard)
- [ ] Token purchase flow works
- [ ] Ad serving and watching flow works
- [ ] Admin panel accessible at `/admin/ads`
- [ ] No errors in Vercel Function Logs
- [ ] No console errors in browser DevTools

---

## Quick Deploy Commands

```bash
# 1. Ensure clean build
npm run build

# 2. Push to GitHub
git push origin main

# 3. Push schema to production DB
DATABASE_URL="your-production-direct-url" npx prisma db push

# 4. Seed admin user
DATABASE_URL="your-production-direct-url" npx prisma db seed

# 5. Deploy to Vercel
npx vercel --prod
```

---

## Emergency Rollback

If something goes wrong after deployment:

1. **Vercel**: Go to Deployments → click the previous successful deployment → "Promote to Production"
2. **Database**: If schema changes caused issues, revert with a backup or roll forward
3. **Stripe**: Webhooks will queue events for up to 3 days; no data is lost
