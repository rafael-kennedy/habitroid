#!/bin/bash
# ──────────────────────────────────────────────────────────────
# Setup Google Play Service Account JSON
# This script helps move the downloaded JSON key to the project
# root and prepares the base64 string for GitHub Secrets.
# ──────────────────────────────────────────────────────────────

set -euo pipefail

TARGET_FILE="google-play-service-account.json"

# Try to find the file in Downloads if not provided
DOWNLOADS_DIR="$HOME/Downloads"
LATEST_JSON=$(ls -t "$DOWNLOADS_DIR"/*.json 2>/dev/null | head -n 1 || true)

echo "🔍 Looking for service account JSON key..."

if [ -f "$TARGET_FILE" ]; then
    echo "✅ $TARGET_FILE already exists in project root."
else
    if [ -n "$LATEST_JSON" ]; then
        echo "Found potential key: $LATEST_JSON"
        read -p "Use this file? (y/n): " confirm
        if [[ $confirm == [yY] ]]; then
            cp "$LATEST_JSON" "$TARGET_FILE"
            echo "✅ Copied to $TARGET_FILE"
        else
            echo "❌ Please manually copy your JSON key to $TARGET_FILE"
            exit 1
        fi
    else
        echo "❌ Could not find any .json files in $DOWNLOADS_DIR"
        echo "   Please manually copy your JSON key to $TARGET_FILE"
        exit 1
    fi
fi

echo ""
echo "📋 Prepared for GitHub Secrets (PLAY_STORE_SERVICE_ACCOUNT):"
echo "──────────────────────────────────────────────────────────────"
if [[ "$OSTYPE" == "darwin"* ]]; then
    base64 -i "$TARGET_FILE" | pbcopy
    echo "✅ Base64 string COPIED TO CLIPBOARD."
else
    base64 -w 0 "$TARGET_FILE"
    echo ""
    echo "☝️  Copy the above string."
fi
echo "──────────────────────────────────────────────────────────────"
echo "Paste this into GitHub → Settings → Secrets → New secret (PLAY_STORE_SERVICE_ACCOUNT)"
