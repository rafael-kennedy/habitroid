#!/bin/bash
# ──────────────────────────────────────────────────────────────
# Generate an Android upload keystore for Habitroid
# Run this ONCE, then keep the .jks file safe and backed up.
# ──────────────────────────────────────────────────────────────

set -euo pipefail

KEYSTORE_DIR="$(cd "$(dirname "$0")/.." && pwd)/android/app"
KEYSTORE_PATH="$KEYSTORE_DIR/upload-keystore.jks"
ALIAS="upload"

if [ -f "$KEYSTORE_PATH" ]; then
    echo "⚠️  Keystore already exists at: $KEYSTORE_PATH"
    echo "   Delete it first if you want to regenerate."
    exit 1
fi

echo "🔑 Generating Android upload keystore..."
echo ""
echo "You'll be prompted for:"
echo "  1. A keystore password (remember this!)"
echo "  2. Your name and org info (can be left blank)"
echo ""

keytool -genkeypair \
    -v \
    -keystore "$KEYSTORE_PATH" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -alias "$ALIAS" \
    -storetype JKS

echo ""
echo "✅ Keystore generated at: $KEYSTORE_PATH"
echo ""
echo "📋 Next steps:"
echo "   1. BACK UP this keystore file somewhere safe (you CANNOT recover it)"
echo "   2. Add it to GitHub Secrets as KEYSTORE_BASE64:"
echo "      base64 -i $KEYSTORE_PATH | pbcopy"
echo "      Then paste into: GitHub → Settings → Secrets → New secret"
echo ""
echo "   3. Also add these secrets:"
echo "      KEYSTORE_PASSWORD  → the password you just entered"
echo "      KEY_ALIAS          → $ALIAS"
echo "      KEY_PASSWORD       → the password you just entered"
echo ""
echo "   ⚠️  NEVER commit the .jks file to git (it's in .gitignore)"
