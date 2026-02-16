#!/bin/bash
# ──────────────────────────────────────────────────────────────
# Manually build a signed release bundle (AAB) for Habitroid
# Usage: ./scripts/manual-bundle.sh
# ──────────────────────────────────────────────────────────────

set -euo pipefail

# Ensure we're in the project root
cd "$(dirname "$0")/.."

KEYSTORE_PATH="$(pwd)/android/app/upload-keystore.jks"
ALIAS="upload"

if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "❌ Keystore found at: $KEYSTORE_PATH"
    echo "   Run ./scripts/generate-keystore.sh first."
    exit 1
fi

echo "🔑 Building Signed Release Bundle"
echo "   Keystore: $KEYSTORE_PATH"
echo "   Alias:    $ALIAS"
echo ""
read -s -p "Enter Keystore Password: " PASSWORD
echo ""
echo ""
# Auto-bump version code to avoid upload errors
echo "🆙 Auto-bumping version code..."
./scripts/bump-version.sh patch
echo ""

# Ensure correct Java version is used
export JAVA_HOME="/Users/rafaelkennedy/Library/Java/JavaVirtualMachines/corretto-17.0.13/Contents/Home"

echo "🚀 Building... (this may take a minute)"
cd android
./gradlew bundleRelease \
    -Pandroid.injected.signing.store.file="$KEYSTORE_PATH" \
    -Pandroid.injected.signing.store.password="$PASSWORD" \
    -Pandroid.injected.signing.key.alias="$ALIAS" \
    -Pandroid.injected.signing.key.password="$PASSWORD"

echo ""
echo "✅ Signed bundle created at:"
echo "   android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "👉 Upload this file to the Google Play Console."
