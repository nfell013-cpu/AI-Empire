# AI Empire - Production Checklist

---

## Pre-Deployment Checklist

- [ ] **Environment Variables** set in Vercel
  - [ ] DATABASE_URL (Supabase transaction pooler)
  - [ ] DIRECT_URL (Supabase session pooler)
  - [ ] NEXTAUTH_SECRET
  - [ ] NEXTAUTH_URL (set to production domain)
  - [ ] STRIPE_SECRET_KEY (live key)
  - [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (live key)
  - [ ] STRIPE_WEBHOOK_SECRET
  - [ ] ABACUSAI_API_KEY
- [ ] **Database** schema pushed (`npx prisma db push`)
- [ ] **Admin user** seeded (`npx prisma db seed`)
- [ ] **Build** passes locally (`npm run build`)
- [ ] **Stripe products** created (53 total)
- [ ] **Webhook endpoint** configured in Stripe

---

## Post-Deployment Verification

- [ ] Homepage/landing page loads
- [ ] Login page accessible (`/auth/login`)
- [ ] Signup page accessible (`/auth/signup`)
- [ ] Admin can log in (admin@aiempire.com)
- [ ] Dashboard loads after login
- [ ] At least 3 AI tools load correctly
- [ ] Pricing page shows all plans
- [ ] Stripe checkout initiates correctly
- [ ] Webhook endpoint responds (check Stripe logs)
- [ ] Database queries work (profile page loads data)

---

## Go-Live Checklist

- [ ] Custom domain configured
- [ ] SSL certificate active (auto with Vercel)
- [ ] NEXTAUTH_URL updated to production domain
- [ ] Stripe webhook URL updated to production domain
- [ ] Test payment completed successfully
- [ ] Admin dashboard fully functional
- [ ] All 45 apps accessible
- [ ] Token system working (earn + spend)
- [ ] Email notifications configured (Resend)
- [ ] Error monitoring set up (optional: Sentry)
- [ ] Analytics configured (optional: Vercel Analytics)

---

## Security Checklist

- [ ] Environment variables NOT committed to git
- [ ] `.env` in `.gitignore`
- [ ] Admin password is strong
- [ ] Stripe webhook signature verification active
- [ ] HTTPS enforced
- [ ] Database connection uses SSL
