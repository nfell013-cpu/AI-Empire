# AI Empire — Ad Pricing Guide

## Overview

AI Empire uses an **AI-guided dynamic pricing system** for advertisers. Pricing is calculated in real-time based on three factors: **ad duration**, **ad type**, and **target app placement**.

Users earn **free tokens** by watching these ads, creating a win-win token economy.

---

## Advertiser Pricing Formula

### Core Formula

```
Total Cost = (Base Price + Duration Cost) × Placement Multiplier × Type Multiplier
```

### Constants

| Component | Value | Description |
|-----------|-------|-------------|
| **Base Price** | $25.00 | Flat fee per ad submission |
| **Per-Second Rate** | $0.50/sec | Cost per second of ad duration |

### Duration Cost

```
Duration Cost = Ad Duration (seconds) × $0.50
```

| Duration | Duration Cost | Base + Duration |
|----------|---------------|-----------------|
| 15 sec | $7.50 | $32.50 |
| 30 sec | $15.00 | $40.00 |
| 60 sec | $30.00 | $55.00 |
| 120 sec | $60.00 | $85.00 |

### Ad Type Multipliers

| Ad Type | Multiplier | Rationale |
|---------|------------|-----------|
| **VIDEO** | 1.5× | Highest engagement, premium format |
| **IMAGE** | 1.0× | Standard format, baseline pricing |
| **TEXT** | 0.7× | Lowest engagement, discounted |

### Placement Multipliers

| Targeting | Multiplier | Description |
|-----------|------------|-------------|
| **Single App** | 1.0× | Target one specific AI tool |
| **Multi-App** | 1.0 – 1.5× | Scales with number of apps selected |
| **All Apps** | 3.0× | Maximum reach across all 15+ tools |

Multi-app multiplier formula:
```
Multiplier = 1.0 + (numApps / totalApps) × 0.5
```

---

## Example Pricing

### Starter — 15s Image Ad, 1 App
```
($25 + $7.50) × 1.0 × 1.0 = $32.50
```

### Growth — 30s Video Ad, 3 Apps
```
($25 + $15) × 1.1 × 1.5 = $66.00
```

### Pro — 30s Video Ad, All Apps
```
($25 + $15) × 3.0 × 1.5 = $180.00
```

### Enterprise — 60s Video Ad, All Apps
```
($25 + $30) × 3.0 × 1.5 = $247.50
```

### Suggested Tiers (Pre-Calculated)

| Tier | Duration | Type | Targeting | Est. Cost |
|------|----------|------|-----------|-----------|
| **Starter** | 15s | IMAGE | 1 app | ~$32.50 |
| **Growth** | 30s | VIDEO | 3 apps | ~$66.00 |
| **Pro** | 30s | VIDEO | All apps | ~$180.00 |
| **Enterprise** | 60s | VIDEO | All apps | ~$247.50 |

---

## How Users Earn Tokens from Watching Ads

### Token Reward Tiers

Users must watch **at least 90%** of an ad's duration to earn tokens.

| Ad Duration | Tokens Earned | Tier Label |
|-------------|---------------|------------|
| 1–15 seconds | **3 tokens** | Quick View |
| 16–30 seconds | **5 tokens** | Standard |
| 31–60 seconds | **10 tokens** | Extended |
| 61–120 seconds | **20 tokens** | Premium |
| 121+ seconds | **30 tokens** | Mega |

### Reward Verification

```typescript
// User must watch ≥90% of ad duration
function verifyFullWatch(watchDuration, adDuration) {
  return (watchDuration / adDuration) >= 0.9;
}
```

### Example: User Watches a 30-Second Video Ad
1. Ad serves via `/api/ads/serve` → impression tracked
2. User watches for 28 seconds (93% of 30s) → **qualifies**
3. `/api/ads/view` verifies full watch → credits **5 tokens**
4. `AdView` record created, `clicks` incremented
5. User's token balance updated atomically via `addTokens()`

### Token Value Context

| Action | Token Cost |
|--------|-----------|
| Use a Basic-tier tool | 10 tokens |
| Use a Standard-tier tool | 25 tokens |
| Use a Premium-tier tool | 50 tokens |
| Use an Enterprise-tier tool | 100 tokens |
| Watch a 30s ad | +5 tokens |
| Watch a 60s ad | +10 tokens |

A user watching **5 standard ads** (30s each) earns **25 tokens** — enough for one Standard-tier tool use.

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ads/pricing` | POST | Get real-time price estimate with AI recommendations |
| `/api/ads/upload` | POST | Submit ad + create Stripe checkout |
| `/api/ads/serve` | GET | Serve random active ad to user |
| `/api/ads/view` | POST | Record ad view + credit tokens |
| `/api/ads/advertiser` | GET | Advertiser dashboard data |
| `/api/admin/ads/pending` | GET | Admin: list pending ads |
| `/api/admin/ads/approve` | POST | Admin: approve ad → ACTIVE |
| `/api/admin/ads/reject` | POST | Admin: reject ad with reason |

---

## Ad Lifecycle

```
Advertiser submits ad → PENDING
  ↓
Stripe payment processed → Payment recorded
  ↓
Admin notified (SMS + Email)
  ↓
Admin reviews → APPROVED (ACTIVE) or REJECTED
  ↓
Active ads served to users → Impressions tracked
  ↓
Users watch ads → Tokens earned → Clicks tracked
```

---

## Source Files

| File | Purpose |
|------|---------|
| `lib/ad-pricing.ts` | Pricing calculation engine |
| `lib/ad-rewards.ts` | Token reward formula + verification |
| `lib/tokens.ts` | Token balance management |
| `lib/notifications.ts` | Admin SMS/email alerts |
| `config/products.json` | Product + pricing configuration |
