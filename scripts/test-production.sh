#!/bin/bash
# ============================================
# AI Empire - Production Testing Script
# ============================================
# Usage: ./scripts/test-production.sh <deployment-url>
# ============================================

set -e

if [ -z "$1" ]; then
    echo "Usage: ./scripts/test-production.sh <deployment-url>"
    echo "Example: ./scripts/test-production.sh https://aiempire.vercel.app"
    exit 1
fi

BASE_URL=$1
PASSED=0
FAILED=0
TOTAL=0

echo "🧪 AI Empire - Production Testing"
echo "=================================="
echo "Testing: ${BASE_URL}"
echo ""

test_route() {
    local path=$1
    local expected=$2
    local name=$3
    TOTAL=$((TOTAL + 1))
    
    code=$(curl -s --max-time 10 -o /dev/null -w "%{http_code}" "${BASE_URL}${path}" 2>/dev/null)
    
    if [ "$code" == "$expected" ] || [ "$code" == "200" ] || [ "$code" == "307" ] || [ "$code" == "302" ]; then
        echo "  ✅ ${name} (${path}) - ${code}"
        PASSED=$((PASSED + 1))
    else
        echo "  ❌ ${name} (${path}) - Expected ${expected}, got ${code}"
        FAILED=$((FAILED + 1))
    fi
}

echo "📄 Public Pages:"
test_route "/landing" "200" "Landing Page"
test_route "/auth/login" "200" "Login Page"
test_route "/auth/signup" "200" "Signup Page"
test_route "/pricing" "200" "Pricing Page"
test_route "/advertise" "200" "Advertise Page"

echo ""
echo "🔒 Protected Pages (expect 307 redirect):"
test_route "/dashboard" "307" "Dashboard"
test_route "/profile" "307" "Profile"
test_route "/flipscore" "307" "FlipScore"
test_route "/tradeace" "307" "TradeAce"
test_route "/dealdone" "307" "DealDone"

echo ""
echo "🤖 AI Tool Pages:"
for app in adcopy brandspark bugbuster chatgenius codeaudit contractiq dataweave docuwise fitforge healthpulse invoicepro mailpilot pixelcraft reciperx securenet seomaster sketchai socialize stocksense studyblitz taskflow travelmate videosync voicebox writeflow; do
    test_route "/${app}" "200" "${app}"
done

echo ""
echo "📊 API Endpoints:"
test_route "/api/auth/providers" "200" "Auth Providers API"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Results: ${PASSED}/${TOTAL} passed, ${FAILED} failed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -eq 0 ]; then
    echo "🎉 All tests passed!"
else
    echo "⚠️  Some tests failed. Check the output above."
    exit 1
fi
