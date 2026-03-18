# AI Empire Ad-Based Token System

Complete documentation for the ad-based token economy integrated into AI Empire.

---

## Overview

The Ad-Based Token System allows:
- **Users** to earn free tokens by watching advertisements
- **Advertisers** to promote their products/services across 15 AI tools
- **Admins** to review and approve/reject ads before they go live

This system works alongside the existing paid token packages (Starter/Pro/Business/Enterprise).

---

## Architecture

```
Advertiser → Upload Ad + Pay (Stripe) → PENDING
                                            ↓
Admin gets SMS + Email notification → Reviews Ad → ACTIVE / REJECTED
                                            ↓
User watches ad → Tokens credited → Uses AI tools
```

---

## Database Models

### Advertiser
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| email | String | Business email (unique) |
| companyName | String | Company name |
| phone | String? | Phone number |
| stripeCustomerId | String? | Stripe customer ID |

### Ad
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| advertiserId | String | FK to Advertiser |
| title | String | Ad title |
| description | Text | Ad description |
| adType | String | VIDEO, IMAGE, or TEXT |
| adUrl | String? | URL to ad content |
| duration | Int | Length in seconds |
| targetApps | String[] | Array of app slugs or ['all'] |
| cost | Int | Cost in cents |
| status | String | PENDING, APPROVED, REJECTED, ACTIVE, PAUSED |
| impressions | Int | View count |
| clicks | Int | Click/completion count |
| tokensPerView | Int | Tokens earned per full view |
| adminNotes | Text? | Admin review notes |

### AdView
| Field | Type | Description |
|-------|------|-------------|
| adId | String | FK to Ad |
| userId | String | FK to User |
| tokensEarned | Int | Tokens credited |
| watchedFullAd | Boolean | Whether user watched 90%+ |
| watchDuration | Int | Actual seconds watched |

### AdPayment
| Field | Type | Description |
|-------|------|-------------|
| advertiserId | String | FK to Advertiser |
| adId | String | FK to Ad |
| amount | Int | Amount in cents |
| stripeSessionId | String | Stripe checkout session |
| status | String | pending, completed, failed |

---

## Token Reward Formula

Tokens earned are based on ad duration:

| Duration | Tokens | Tier Label |
|----------|--------|------------|
| 1-15s | 3 | Quick View |
| 16-30s | 5 | Standard |
| 31-60s | 10 | Extended |
| 61-120s | 20 | Premium |
| 120s+ | 30 | Mega |

Users must watch at least **90%** of the ad to earn tokens.

---

## Ad Pricing Formula

```
Total = (Base Price + Duration Cost) × Placement Multiplier × Type Multiplier
```

- **Base Price**: $25.00
- **Duration Cost**: $0.50/second
- **Placement Multipliers**:
  - Single app: 1.0×
  - Multiple apps: 1.0× to 1.5× (proportional)
  - All apps: 3.0×
- **Type Multipliers**:
  - VIDEO: 1.5×
  - IMAGE: 1.0×
  - TEXT: 0.7×

### Suggested Tiers
- **Starter**: 15s IMAGE, 1 app (~$28)
- **Growth**: 30s VIDEO, 3 apps (~$66)
- **Pro**: 30s VIDEO, all apps (~$180)
- **Enterprise**: 60s VIDEO, all apps (~$330)

---

## API Documentation

### Advertiser APIs

#### POST `/api/ads/pricing`
Calculate ad pricing.

**Request Body:**
```json
{
  "duration": 30,
  "targetApps": ["flipscore", "legalese"],
  "adType": "VIDEO"
}
```

**Response:** Pricing breakdown, token reward info, and AI recommendations.

#### POST `/api/ads/upload`
Create ad and generate Stripe checkout.

**Request Body:**
```json
{
  "email": "advertiser@company.com",
  "companyName": "Company Inc",
  "phone": "555-0123",
  "title": "Amazing Product",
  "description": "Try our amazing product today!",
  "adType": "VIDEO",
  "adUrl": "https://example.com/video.mp4",
  "duration": 30,
  "targetApps": ["all"]
}
```

**Response:** Ad ID, Stripe checkout URL, pricing details.

#### GET `/api/ads/advertiser?email=...`
Get advertiser's ads and stats. Query param: `email`.

### Ad Serving APIs

#### GET `/api/ads/serve?app=flipscore`
Fetch a random active ad. Optional `app` query param to filter by target app.

#### POST `/api/ads/view`
Record ad view and credit tokens (requires auth).

**Request Body:**
```json
{
  "adId": "ad_id_here",
  "watchDuration": 30
}
```

### Admin APIs (require admin role)

#### GET `/api/admin/ads/pending`
List all pending ads for review.

#### POST `/api/admin/ads/approve`
Approve an ad. Body: `{ "adId": "..." }`

#### POST `/api/admin/ads/reject`
Reject an ad. Body: `{ "adId": "...", "reason": "..." }`

---

## User Guide

### Earning Free Tokens
1. Click **"Watch Ad, Get Free Tokens"** in the sidebar
2. Or visit the **Earn Tokens** page (`/earn-tokens`)
3. Click **Play** to start watching the ad
4. Watch the full ad (progress bar shows completion)
5. Tokens are automatically credited to your account

### Using Tokens
Tokens are deducted when you use any of the 15 AI tools. Each tool has a different token cost based on its tier.

---

## Advertiser Guide

1. Visit `/advertise` to access the advertiser portal
2. Fill in company information (email, name, phone)
3. Create your ad:
   - Choose ad type (Video, Image, or Text)
   - Set duration (5-120 seconds)
   - Select target apps (specific tools or all)
4. Review AI-calculated pricing and recommendations
5. Click **Pay & Submit Ad** to proceed to Stripe checkout
6. After payment, your ad enters **PENDING** review
7. Admin reviews within 24 hours
8. Once approved, your ad goes **ACTIVE** and starts serving

---

## Admin Guide

1. Navigate to `/admin/ads`
2. View all pending ads with full details
3. Preview ad content (video/image)
4. Click **Approve** to activate the ad
5. Or enter a reason and click **Reject**
6. SMS and email notifications are sent when new ads are submitted

### Notifications
- **SMS**: Sent to 720-246-1534 on new ad submission
- **Email**: Sent to nfell013@gmail.com on new ad submission
- Configure Twilio (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) for SMS
- Configure Resend (RESEND_API_KEY) for email

---

## Environment Variables

Add these for full notification support:
```env
# Twilio (SMS notifications)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# Resend (Email notifications)
RESEND_API_KEY=your_key
```

---

## File Structure

```
lib/
  ad-pricing.ts          # AI pricing calculator
  ad-rewards.ts          # Token reward formula
  notifications.ts       # SMS + email notifications

app/api/ads/
  pricing/route.ts       # Calculate ad pricing
  upload/route.ts        # Create ad + Stripe checkout
  advertiser/route.ts    # Advertiser dashboard data
  serve/route.ts         # Serve random active ad
  view/route.ts          # Record ad view + credit tokens

app/api/admin/ads/
  pending/route.ts       # List pending ads
  approve/route.ts       # Approve ad
  reject/route.ts        # Reject ad

components/ads/
  watch-ad-modal.tsx     # Modal for watching ads
  earn-tokens-button.tsx # "Watch Ad, Get Free Tokens" button
  advertiser-upload-form.tsx  # Advertiser ad creation form
  admin-review-panel.tsx      # Admin review interface

app/
  earn-tokens/page.tsx   # User token earning page
  advertise/page.tsx     # Advertiser landing page
  admin/ads/page.tsx     # Admin ad review page
```
