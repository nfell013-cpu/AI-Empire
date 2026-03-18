#!/bin/bash
# ============================================
# AI Empire - Local Development Quick Start
# ============================================
# Usage: ./scripts/local-dev.sh
# ============================================

set -e

echo "🛠️  AI Empire - Local Development"
echo "=================================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v)
echo "📦 Node.js: ${NODE_VERSION}"

# Check .env
if [ ! -f .env ]; then
    echo "⚠️  .env not found. Copying from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "   Created .env - Please configure it before continuing."
        exit 1
    else
        echo "❌ .env.example not found either. Create .env manually."
        exit 1
    fi
fi

echo "✅ .env found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo ""
echo "🗃️  Generating Prisma client..."
npx prisma generate

# Push schema
echo ""
echo "🗃️  Pushing database schema..."
npx prisma db push

# Seed admin
echo ""
echo "🌱 Seeding admin user..."
npx prisma db seed || true

# Start dev server
echo ""
echo "🚀 Starting development server..."
echo "   URL: http://localhost:3000"
echo "   Admin: admin@aiempire.com"
echo ""
npm run dev
