#!/bin/bash
# Mission Control - Sprint 1 Test Suite
# Run: bash test.sh

PASS=0
FAIL=0
BASE="http://localhost:3001"

assert_contains() {
  local label="$1" url="$2" expected="$3"
  local body
  body=$(curl -s "$url")
  if echo "$body" | grep -q "$expected"; then
    echo "  ✅ $label"
    ((PASS++))
  else
    echo "  ❌ $label — missing: $expected"
    ((FAIL++))
  fi
}

assert_status() {
  local label="$1" url="$2" code="$3"
  local actual
  actual=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$actual" = "$code" ]; then
    echo "  ✅ $label (HTTP $code)"
    ((PASS++))
  else
    echo "  ❌ $label — expected HTTP $code, got $actual"
    ((FAIL++))
  fi
}

echo "🧪 Mission Control Test Suite"
echo "=============================="

echo ""
echo "1. Server Health"
assert_status "Server responds" "$BASE/" "200"
assert_status "Static CSS loads" "$BASE/_next/static/css/app/layout.css" "200"

echo ""
echo "2. Page Content"
assert_contains "Page title" "$BASE/" "Mission Control"
assert_contains "Header subtitle" "$BASE/" "Autonomous Company Command Center"
assert_contains "Timezone display" "$BASE/" "March 2026"
assert_contains "Gateway status" "$BASE/" "Gateway Connected"

echo ""
echo "3. Brain & Muscle Cockpit"
assert_contains "Brain label" "$BASE/" "Brain"
assert_contains "Muscle label" "$BASE/" "Muscle"
assert_contains "Brain model" "$BASE/" "openrouter/healer-alpha"
assert_contains "Muscle model" "$BASE/" "gemini-3-flash"
assert_contains "Brain status" "$BASE/" "Active"
assert_contains "Muscle status" "$BASE/" "Pending Auth"

echo ""
echo "4. Pillar Tracker (Objectives)"
assert_contains "Objective 1" "$BASE/" "AI/ML System Development"
assert_contains "Objective 2" "$BASE/" "Student Mentorship"
assert_contains "Objective 3" "$BASE/" "Industry"
assert_contains "Objective 4" "$BASE/" "Knowledge Systems"
assert_contains "Objective 5" "$BASE/" "AI Product"
assert_contains "Progress bars" "$BASE/" "width:"

echo ""
echo "5. Quick Actions"
assert_contains "Backup button" "$BASE/" "Run Backup"
assert_contains "Status button" "$BASE/" "System Status"
assert_contains "Restart button" "$BASE/" "Restart Gateway"
assert_contains "Cron button" "$BASE/" "Trigger Cron"

echo ""
echo "6. Log Viewer & Charts"
assert_contains "Chart section" "$BASE/" "Log Viewer"
assert_contains "Activity chart" "$BASE/" "Activity"
assert_contains "Cost chart" "$BASE/" "Cost by Provider"
assert_contains "Tool usage" "$BASE/" "Tool Usage"
assert_contains "Canvas elements" "$BASE/" "canvas"

echo ""
echo "7. Files on Disk"
for f in "src/app/page.js" "src/app/layout.js" "src/app/globals.css" \
         "src/components/BrainMuscleCockpit.js" "src/components/LogChart.js" \
         "src/components/PillarTracker.js" "src/components/QuickActions.js" \
         "package.json" "tailwind.config.js" "jsconfig.json"; do
  if [ -f "/home/sudhirk/.openclaw/workspace/mission-control/$f" ]; then
    echo "  ✅ $f"
    ((PASS++))
  else
    echo "  ❌ $f — missing"
    ((FAIL++))
  fi
done

echo ""
echo "=============================="
echo "Results: $PASS passed, $FAIL failed"
if [ "$FAIL" -eq 0 ]; then
  echo "🎉 All tests passed!"
  exit 0
else
  echo "⚠️  Some tests failed."
  exit 1
fi
