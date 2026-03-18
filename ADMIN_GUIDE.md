# AI Empire - Admin Guide

---

## Accessing Admin Dashboard

### Login Credentials
- **Email:** `admin@aiempire.com`
- **Password:** `98JhvWGkvXcmnHcrl_Ebfw`

### Admin URL
- Navigate to `/admin` after logging in
- Or access directly at `https://your-domain.com/admin`

---

## Admin Capabilities

As admin, you have:

### 1. Full Access to All Tools
- All 45 AI tools are unlocked without subscription
- No token limits
- Admin bypass is automatic based on role

### 2. Managing Users
- View all registered users
- View user subscription status
- View token balances
- Access through admin dashboard

### 3. Approving Ads

#### View Pending Ads
- Navigate to Admin Dashboard → Pending Ads
- Or use API: `GET /api/admin/ads/pending`

#### Approve an Ad
- Click "Approve" on the ad card
- API: `POST /api/admin/ads/approve` with `{ adId: "..." }`
- Ad status changes from PENDING → ACTIVE
- Ad begins serving to users

#### Reject an Ad
- Click "Reject" and provide a reason
- API: `POST /api/admin/ads/reject` with `{ adId: "...", reason: "..." }`
- Ad status changes from PENDING → REJECTED

### 4. Viewing Analytics
- Total users count
- Active subscriptions
- Revenue metrics
- Ad performance (impressions, clicks)
- Token economy stats
- Access at `/dashboard/analytics`

### 5. Managing Tokens
- View token transaction history
- Admin starts with 100,000 tokens
- Monitor token purchases and earnings
- Track token usage across tools

---

## Admin API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/ads/pending` | GET | Get pending ads |
| `/api/admin/ads/approve` | POST | Approve an ad |
| `/api/admin/ads/reject` | POST | Reject an ad |

---

## Security Notes

- Admin role is checked server-side on every request
- Change the default password after first login
- Only one admin user is seeded by default
- To create additional admins, update user role in database:
  ```sql
  UPDATE "User" SET role = 'admin' WHERE email = 'new-admin@example.com';
  ```
