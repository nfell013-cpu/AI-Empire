#!/bin/bash
# ============================================
# AI Empire - Switch to Live Stripe Keys
# ============================================
# This script helps switch from test to live
# Stripe keys in your environment.
# ============================================

echo "💳 AI Empire - Switch to Live Stripe"
echo "======================================"
echo ""
echo "⚠️  WARNING: This will switch to LIVE payment processing!"
echo "   Real credit cards will be charged."
echo ""
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "📋 Steps to switch to Live Stripe:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Get your live keys from https://dashboard.stripe.com/apikeys"
echo ""
echo "2. Update these environment variables:"
echo "   STRIPE_SECRET_KEY=sk_live_..."
echo "   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_..."
echo ""
echo "3. Create live webhook endpoint:"
echo "   - Go to https://dashboard.stripe.com/webhooks"
echo "   - Add new endpoint with your production URL"
echo "   - Subscribe to: checkout.session.completed, invoice.payment_succeeded, customer.subscription.deleted"
echo "   - Update: STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""
echo "4. Create live products:"
echo "   node scripts/setup-stripe-products.js --live"
echo ""
echo "5. Redeploy your application"
echo ""
echo "6. Test with a real card (small amount)"
echo ""
echo "✅ Checklist:"
echo "  [ ] Live secret key set"
echo "  [ ] Live publishable key set"
echo "  [ ] Live webhook secret set"
echo "  [ ] Live products created (53 products)"
echo "  [ ] Application redeployed"
echo "  [ ] Test payment successful"
