#!/bin/bash
# AI Empire - Backup Verification Script
# Usage: bash scripts/verify-backup.sh [path-to-zip]

BACKUP_FILE="${1:-/home/ubuntu/ai_empire_master_backup.zip}"

echo "========================================"
echo "  AI Empire Backup Verification"
echo "========================================"
echo ""

# Check if backup exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ ERROR: Backup file not found: $BACKUP_FILE"
    exit 1
fi
echo "✅ Backup file exists: $BACKUP_FILE"

# File size
SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
echo "📦 Backup size: $SIZE"

# File count
COUNT=$(zipinfo -1 "$BACKUP_FILE" 2>/dev/null | wc -l)
echo "📁 Total entries: $COUNT"

# Generate checksum
CHECKSUM=$(sha256sum "$BACKUP_FILE" | awk '{print $1}')
echo "🔑 SHA-256: $CHECKSUM"
echo ""

# Check required files
echo "--- Required Files Check ---"
REQUIRED_FILES=(
    "package.json"
    "package-lock.json"
    "tsconfig.json"
    "next.config.js"
    ".env.example"
    "middleware.ts"
    "tailwind.config.ts"
    "prisma/schema.prisma"
    "config/products.json"
    "stripe-products.json"
    "ADMIN_CREDENTIALS.txt"
    "README.md"
    "DEPLOYMENT_GUIDE.md"
)

ALL_GOOD=true
for FILE in "${REQUIRED_FILES[@]}"; do
    if zipinfo -1 "$BACKUP_FILE" 2>/dev/null | grep -q "$FILE"; then
        echo "  ✅ $FILE"
    else
        echo "  ❌ MISSING: $FILE"
        ALL_GOOD=false
    fi
done
echo ""

# Check no secrets
echo "--- Security Check ---"
if zipinfo -1 "$BACKUP_FILE" 2>/dev/null | grep -qE '^\.env$|/\.env$'; then
    echo "  ❌ WARNING: .env file found in backup (contains secrets!)"
    ALL_GOOD=false
else
    echo "  ✅ No .env secrets file in backup"
fi

if zipinfo -1 "$BACKUP_FILE" 2>/dev/null | grep -q 'node_modules/'; then
    echo "  ❌ WARNING: node_modules found in backup"
    ALL_GOOD=false
else
    echo "  ✅ No node_modules in backup"
fi

if zipinfo -1 "$BACKUP_FILE" 2>/dev/null | grep -q '\.next/'; then
    echo "  ❌ WARNING: .next build output found in backup"
    ALL_GOOD=false
else
    echo "  ✅ No .next build output in backup"
fi
echo ""

# Check app directories
echo "--- App Directories Check ---"
APP_COUNT=$(zipinfo -1 "$BACKUP_FILE" 2>/dev/null | grep '^app/' | grep -c '/$')
COMP_COUNT=$(zipinfo -1 "$BACKUP_FILE" 2>/dev/null | grep '^components/' | grep -c '/$')
echo "  📂 App directories: $APP_COUNT"
echo "  📂 Component directories: $COMP_COUNT"
echo ""

# Summary
echo "========================================"
if [ "$ALL_GOOD" = true ]; then
    echo "  ✅ BACKUP VERIFICATION PASSED"
else
    echo "  ⚠️  BACKUP HAS WARNINGS - Review above"
fi
echo "========================================"
echo ""
echo "Backup: $BACKUP_FILE"
echo "Size: $SIZE | Files: $COUNT | SHA-256: ${CHECKSUM:0:16}..."
echo "Date: $(date '+%Y-%m-%d %H:%M:%S %Z')"
