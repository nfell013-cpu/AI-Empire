#!/bin/bash
# ============================================
# AI Empire - Vercel Deployment Script
# ============================================
# Usage: ./scripts/deploy-to-vercel.sh [--prod]
# Prerequisites: npm i -g vercel
# ============================================

set -e

echo "🚀 AI Empire - Vercel Deployment"
echo "================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
    echo "✅ Vercel CLI installed"
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Copy .env.example and configure it first."
    exit 1
fi

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Build test
echo "🔨 Running build test..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Fix errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# Deploy
if [ "$1" == "--prod" ]; then
    echo "🌍 Deploying to PRODUCTION..."
    vercel --prod
else
    echo "🧪 Deploying to PREVIEW..."
    echo "   (Use --prod flag for production deployment)"
    vercel
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Set environment variables in Vercel dashboard"
echo "  2. Configure Stripe webhooks with your deployment URL"
echo "  3. Run: ./scripts/test-production.sh <your-url>"
