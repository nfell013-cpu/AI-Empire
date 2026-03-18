# AI Empire — 30 AI-Powered SaaS Tools

AI Empire is a Next.js 14 application hosting 30 AI-powered micro-SaaS tools behind a unified dashboard with Stripe & Coinbase Commerce payments.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **Payments:** Stripe (subscriptions + ad purchases) + Coinbase Commerce (crypto)
- **Token Economy:** Ad-based free tokens + paid token packages
- **Auth:** NextAuth.js
- **Styling:** Tailwind CSS + shadcn/ui
- **Storage:** AWS S3

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in DATABASE_URL, NEXTAUTH_SECRET, STRIPE keys, etc.

# 3. Set up database
npx prisma generate
npx prisma db push

# 4. Run dev server
npm run dev
```

---

## Stripe Product Setup

AI Empire includes an automated script that creates Stripe products & monthly prices for all 30 tools.

### Prerequisites

- Node.js 18+
- `stripe` npm package (already in project dependencies)
- A Stripe account with API keys

### Running the Setup Script

```bash
# Dry-run (preview without creating anything)
node scripts/setup-stripe-products.js --dry-run

# Test mode
STRIPE_SECRET_KEY=sk_test_XXXXX node scripts/setup-stripe-products.js

# Live mode (requires --live flag for safety)
STRIPE_SECRET_KEY=sk_live_XXXXX node scripts/setup-stripe-products.js --live
```

### What the Script Does

1. Reads tool definitions from `config/products.json`
2. Creates a **Stripe Product** for each of the 30 tools
3. Creates a **monthly recurring Price** based on the tool's tier
4. Writes results to `config/stripe-products-output.json`
5. Prints Price IDs for your `.env` or webhook config

### Pricing Tiers

| Tier       | Price/mo | Tools |
|------------|----------|-------|
| Basic      | $4.99    | MailPilot, RecipeRx, StudyBlitz, InvoicePro, MindMap |
| Standard   | $9.99    | DocuWise, BrandSpark, FitForge, LexiLearn, AdCopy, Socialize, SEOMaster, WriteFlow, TaskFlow, TravelMate |
| Premium    | $14.99   | CodeAudit, PixelCraft, VoiceBox, DataWeave, BugBuster, SketchAI, VideoSync, APIGen, HealthPulse |
| Enterprise | $24.99   | ChatGenius, PitchDeck, StockSense, ContractIQ, SecureNet, RealtorIQ |

---

## Project Structure

```
ai_empire/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth routes
│   │   ├── stripe/         # Stripe checkout & webhook
│   │   ├── crypto/         # Coinbase Commerce checkout & webhook
│   │   ├── signup/         # User registration
│   │   ├── upload/         # File upload
│   │   └── user/           # User stats
│   ├── dashboard/          # Dashboard page
│   ├── landing/            # Landing / marketing page
│   ├── pricing/            # Pricing page
│   └── profile/            # User profile
├── components/             # React components
│   ├── sidebar.tsx         # Sidebar with all 30 tools
│   ├── dashboard-metrics.tsx
│   └── ui/                 # shadcn/ui primitives
├── config/
│   └── products.json       # All 30 tools, tiers & pricing
├── lib/                    # Shared libraries
│   ├── stripe.ts           # Stripe client
│   ├── db.ts               # Prisma client
│   └── coinbase.ts         # Coinbase Commerce helpers
├── prisma/
│   └── schema.prisma       # Database schema
├── scripts/
│   └── setup-stripe-products.js  # Automated Stripe setup
├── DEPLOYMENT_GUIDE.md
├── STRIPE_SETUP.md
└── README.md
```

---

## All 30 AI Tools

| #  | Tool         | Category         | Description                                      |
|----|--------------|------------------|--------------------------------------------------|
| 1  | CodeAudit    | Developer Tools  | AI code review & security vulnerability scanner  |
| 2  | PixelCraft   | Creative         | AI image generation & editing studio             |
| 3  | DocuWise     | Productivity     | Intelligent document summarizer                  |
| 4  | ChatGenius   | Business         | Custom AI chatbot builder                        |
| 5  | VoiceBox     | Creative         | Text-to-speech & voice cloning                   |
| 6  | BrandSpark   | Marketing        | Brand name & logo concept generator              |
| 7  | DataWeave    | Data & Analytics | Spreadsheet & CSV AI analyst                     |
| 8  | MailPilot    | Productivity     | AI email composer & optimizer                    |
| 9  | FitForge     | Health & Fitness | Workout & meal plan generator                    |
| 10 | LexiLearn    | Education        | AI language tutor with conversations             |
| 11 | AdCopy       | Marketing        | Ad copy & social content generator               |
| 12 | BugBuster    | Developer Tools  | AI debugging assistant                           |
| 13 | PitchDeck    | Business         | Startup pitch deck builder                       |
| 14 | RecipeRx     | Lifestyle        | Recipe generator from photos & dietary needs     |
| 15 | StockSense   | Finance          | Stock & crypto market analyzer                   |
| 16 | SketchAI     | Design           | Sketch-to-design converter for UI/UX             |
| 17 | ContractIQ   | Legal            | Contract generator & clause analyzer             |
| 18 | StudyBlitz   | Education        | Flashcard & quiz generator                       |
| 19 | Socialize    | Marketing        | Social media scheduler & analytics               |
| 20 | SEOMaster    | Marketing        | SEO audit & keyword optimizer                    |
| 21 | WriteFlow    | Content          | Long-form content & blog generator               |
| 22 | VideoSync    | Creative         | Video transcription & subtitle generator         |
| 23 | TaskFlow     | Productivity     | AI project management & task prioritization      |
| 24 | SecureNet    | Security         | Cybersecurity threat scanner                     |
| 25 | APIGen       | Developer Tools  | REST API generator from natural language         |
| 26 | TravelMate   | Travel           | Flight & hotel deal finder                       |
| 27 | InvoicePro   | Finance          | Invoice generator & expense tracker              |
| 28 | MindMap      | Productivity     | AI brainstorming & mind map visualization        |
| 29 | RealtorIQ    | Real Estate      | Real estate valuation & investment analyzer      |
| 30 | HealthPulse  | Health & Fitness | Symptom checker & wellness AI                    |

---

## Environment Variables

See `DEPLOYMENT_GUIDE.md` for the full list. Key variables:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
COINBASE_COMMERCE_API_KEY=...
```

---

## License

Proprietary. All rights reserved.


---

## Ad-Based Token System

AI Empire includes a complete ad-supported token economy where users can earn free tokens by watching ads, and advertisers can promote their products across 15 AI tools.

### Key Features
- **Users**: Watch ads to earn free tokens (3-30 tokens based on ad length)
- **Advertisers**: Upload video/image/text ads with AI-guided pricing
- **Admins**: Review and approve/reject ads before they go live
- **Notifications**: SMS + email alerts on new ad submissions

### Pages
- `/earn-tokens` — Watch ads and earn free tokens
- `/advertise` — Advertiser portal for ad creation
- `/admin/ads` — Admin panel for ad review

### Documentation
See [docs/AD_SYSTEM.md](docs/AD_SYSTEM.md) for complete documentation including API reference, pricing formula, and setup guide.



---

## Backup & Recovery

A master backup ZIP is available at `/home/ubuntu/ai_empire_master_backup.zip`.

### Quick Restore
```bash
unzip ai_empire_master_backup.zip -d ai_empire_restored
cd ai_empire_restored
npm install
cp .env.example .env   # Edit with your credentials
npx prisma generate && npx prisma db push
npm run build && npm start
```

### Backup Files
- `BACKUP_MANIFEST.md` — What's included/excluded in the backup
- `RESTORE_INSTRUCTIONS.md` — Detailed step-by-step restore guide
- `BACKUP_SUMMARY.txt` — Quick reference backup info
- `scripts/verify-backup.sh` — Backup verification script

### Best Practices
- Keep the backup ZIP in a secure, separate location (cloud storage, external drive)
- Never commit `.env` files to version control or include in backups
- After restoring, always run `npx prisma generate` before building
- Test the restored installation with Stripe test cards before going live
- Create new backups after significant changes
