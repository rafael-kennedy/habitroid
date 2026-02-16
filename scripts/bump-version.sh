#!/bin/bash
# ──────────────────────────────────────────────────────────────
# Bump version for Habitroid Android releases
#
# Usage:
#   ./scripts/bump-version.sh patch    # 1.0.0 → 1.0.1
#   ./scripts/bump-version.sh minor    # 1.0.0 → 1.1.0
#   ./scripts/bump-version.sh major    # 1.0.0 → 2.0.0
# ──────────────────────────────────────────────────────────────

set -euo pipefail

BUMP_TYPE="${1:-patch}"
GRADLE_FILE="$(cd "$(dirname "$0")/.." && pwd)/android/app/build.gradle"
PACKAGE_JSON="$(cd "$(dirname "$0")/.." && pwd)/package.json"

if [ ! -f "$GRADLE_FILE" ]; then
    echo "❌ Gradle file not found: $GRADLE_FILE"
    echo "   Run 'npx cap add android' first."
    exit 1
fi

# Get current versionName from build.gradle
# Matches: versionName "1.0.0" (Groovy syntax, no equals sign usually)
CURRENT_VERSION=$(grep -oP 'versionName\s+"\K[^"]+' "$GRADLE_FILE" 2>/dev/null || echo "1.0.0")
# Matches: versionCode 1
CURRENT_CODE=$(grep -oP 'versionCode\s+\K[0-9]+' "$GRADLE_FILE" 2>/dev/null || echo "1")

# Parse semver
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

case "$BUMP_TYPE" in
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    patch)
        PATCH=$((PATCH + 1))
        ;;
    *)
        echo "❌ Invalid bump type: $BUMP_TYPE"
        echo "   Use: patch, minor, or major"
        exit 1
        ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
NEW_CODE=$((CURRENT_CODE + 1))

echo "📦 Bumping version:"
echo "   Version: $CURRENT_VERSION → $NEW_VERSION"
echo "   Code:    $CURRENT_CODE → $NEW_CODE"

# Update build.gradle (Groovy)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # -i '' for macOS sed
    # Match "versionCode <digits>" and replace completely
    sed -i '' -E "s/versionCode [0-9]+/versionCode $NEW_CODE/" "$GRADLE_FILE"
    # Match 'versionName "<anything>"' and replace
    sed -i '' -E "s/versionName \"[^\"]+\"/versionName \"$NEW_VERSION\"/" "$GRADLE_FILE"
else
    # Linux sed
    sed -i -E "s/versionCode [0-9]+/versionCode $NEW_CODE/" "$GRADLE_FILE"
    sed -i -E "s/versionName \"[^\"]+\"/versionName \"$NEW_VERSION\"/" "$GRADLE_FILE"
fi

# Update package.json version too
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" "$PACKAGE_JSON"
else
    sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" "$PACKAGE_JSON"
fi

echo ""
echo "✅ Version bumped to $NEW_VERSION (code $NEW_CODE)"
echo ""
echo "📋 Next steps:"
echo "   git add -A"
echo "   git commit -m \"chore: bump version to $NEW_VERSION\""
echo "   git tag v$NEW_VERSION"
echo "   git push origin main --tags    ← this triggers the CI/CD pipeline"
