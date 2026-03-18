#!/bin/bash
# ============================================
# AI Empire - Stripe Webhook Setup Guide
# ============================================
# This script guides you through setting up
# Stripe webhooks for your deployment.
# ============================================

echo "🔗 AI Empire - Stripe Webhook Setup"
echo "====================================="
echo ""

if [ -z "$1" ]; then
    echo "Usage: ./scripts/setup-stripe-webhooks.sh <your-deployment-url>"
    echo "Example: ./scripts/setup-stripe-webhooks.sh https://aiempire.vercel.app"
    exit 1
fi

DEPLOY_URL=$1
WEBHOOK_URL="${DEPLOY_URL}/api/stripe/webhook"

echo "📋 Webhook Configuration"
echo "========================"
echo ""
echo "Webhook Endpoint URL:"
echo "  ${WEBHOOK_URL}"
echo ""
echo "Required Events to Subscribe:"
echo "  ✅ checkout.session.completed"
echo "  ✅ invoice.payment_succeeded"
echo "  ✅ customer.subscription.deleted"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Steps to Configure in Stripe Dashboard:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Go to https://dashboard.stripe.com/webhooks"
echo "2. Click '+ Add endpoint'"
echo "3. Enter endpoint URL: ${WEBHOOK_URL}"
echo "4. Click 'Select events'"
echo "5. Search and add these events:"
echo "   - checkout.session.completed"
echo "   - invoice.payment_succeeded"
echo "   - customer.subscription.deleted"
echo "6. Click 'Add endpoint'"
echo "7. Copy the 'Signing secret' (starts with whsec_)"
echo "8. Add it to your .env or Vercel environment:"
echo "   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing Webhook:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Using Stripe CLI (local testing):"
echo "  stripe listen --forward-to localhost:3000/api/stripe/webhook"
echo ""
echo "Using Stripe Dashboard:"
echo "  Go to Webhooks > Your endpoint > Send test webhook"
echo ""
echo "✅ Done! Webhook setup guide complete."
