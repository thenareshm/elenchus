#!/bin/bash

# Brand leftover guard script
# Checks for any remaining "Sensebook" or "sensebook" references outside ignored paths

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Checking for brand leftovers..."

# Define ignored paths
IGNORED_PATHS=(
  "node_modules"
  ".next"
  ".git"
  "*.png"
  "*.jpg"
  "*.jpeg"
  "*.ico"
  "*.mp3"
  "*.wav"
  "package-lock.json"
  "tsconfig.tsbuildinfo"
)

# Build ignore pattern for grep
IGNORE_PATTERN=""
for path in "${IGNORED_PATHS[@]}"; do
  if [[ -z "$IGNORE_PATTERN" ]]; then
    IGNORE_PATTERN="--exclude-dir=$path"
  else
    IGNORE_PATTERN="$IGNORE_PATTERN --exclude-dir=$path"
  fi
done

# Check for "Sensebook" (title case)
echo "Checking for 'Sensebook' references..."
SENSEBOOK_MATCHES=$(grep -r $IGNORE_PATTERN --exclude="*.png" --exclude="*.jpg" --exclude="*.jpeg" --exclude="*.ico" --exclude="*.mp3" --exclude="*.wav" --exclude="package-lock.json" --exclude="tsconfig.tsbuildinfo" --exclude="check-brand-leftovers.sh" --exclude=".env.local" "Sensebook" . 2>/dev/null || true)

# Check for "sensebook" (lowercase)
echo "Checking for 'sensebook' references..."
SENSEBOOK_LOWER_MATCHES=$(grep -r $IGNORE_PATTERN --exclude="*.png" --exclude="*.jpg" --exclude="*.jpeg" --exclude="*.ico" --exclude="*.mp3" --exclude="*.wav" --exclude="package-lock.json" --exclude="tsconfig.tsbuildinfo" --exclude="check-brand-leftovers.sh" --exclude=".env.local" "sensebook" . 2>/dev/null || true)

# Count matches
SENSEBOOK_COUNT=$(echo "$SENSEBOOK_MATCHES" | grep -c "Sensebook" 2>/dev/null || echo "0")
SENSEBOOK_LOWER_COUNT=$(echo "$SENSEBOOK_LOWER_MATCHES" | grep -c "sensebook" 2>/dev/null || echo "0")

# Ensure counts are numeric
SENSEBOOK_COUNT=${SENSEBOOK_COUNT:-0}
SENSEBOOK_LOWER_COUNT=${SENSEBOOK_LOWER_COUNT:-0}

TOTAL_COUNT=$((SENSEBOOK_COUNT + SENSEBOOK_LOWER_COUNT))

if [ "$TOTAL_COUNT" -gt 0 ]; then
  echo -e "${RED}❌ Found $TOTAL_COUNT leftover brand references:${NC}"
  echo ""
  if [ "$SENSEBOOK_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}Title case 'Sensebook' found:${NC}"
    echo "$SENSEBOOK_MATCHES"
    echo ""
  fi
  if [ "$SENSEBOOK_LOWER_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}Lowercase 'sensebook' found:${NC}"
    echo "$SENSEBOOK_LOWER_MATCHES"
    echo ""
  fi
  echo -e "${RED}Please update these references to use Elenchus/elenchus or the centralized APP config.${NC}"
  exit 1
else
  echo -e "${GREEN}✅ No brand leftovers found! All references have been updated to Elenchus/elenchus.${NC}"
  exit 0
fi
