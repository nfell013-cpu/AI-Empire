#!/bin/bash
# ============================================
# AI Empire - Database Backup Script
# ============================================
# Usage: ./scripts/backup-database.sh
# Requires: pg_dump installed
# ============================================

set -e

echo "💾 AI Empire - Database Backup"
echo "=============================="

# Load .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | grep DIRECT_URL | xargs)
fi

if [ -z "$DIRECT_URL" ]; then
    echo "❌ DIRECT_URL not found in .env"
    echo "   Set DIRECT_URL=postgresql://... in your .env file"
    exit 1
fi

# Create backup directory
BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

# Generate filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/ai_empire_backup_${TIMESTAMP}.sql"

echo "📦 Creating backup: ${BACKUP_FILE}"

# Run pg_dump
if command -v pg_dump &> /dev/null; then
    pg_dump "$DIRECT_URL" --no-owner --no-acl > "$BACKUP_FILE"
    
    # Compress
    gzip "$BACKUP_FILE"
    FINAL_FILE="${BACKUP_FILE}.gz"
    
    SIZE=$(du -h "$FINAL_FILE" | cut -f1)
    echo ""
    echo "✅ Backup complete!"
    echo "   File: ${FINAL_FILE}"
    echo "   Size: ${SIZE}"
else
    echo "❌ pg_dump not found. Install PostgreSQL client:"
    echo "   sudo apt-get install postgresql-client"
    echo ""
    echo "Alternative: Use Supabase Dashboard"
    echo "   1. Go to https://supabase.com/dashboard"
    echo "   2. Select your project"
    echo "   3. Settings > Database > Backups"
    echo "   4. Download latest backup"
    exit 1
fi

echo ""
echo "To restore:"
echo "  gunzip ${FINAL_FILE}"
echo "  psql \$DIRECT_URL < ${BACKUP_FILE}"
