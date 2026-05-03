#!/usr/bin/env bash
# scripts/release.sh — Maintainer release helper
# Usage: bash scripts/release.sh <version>
# Example: bash scripts/release.sh 0.1.0-beta.1
#
# What this script does:
#   1. Validates the version argument and Git working-tree state
#   2. Updates package.json (and package-lock.json if present) with the new version
#   3. Commits the version bump as "chore: release v<version>"
#   4. Creates an annotated Git tag "v<version>"
#   5. Pushes the commit and tag to origin main
#   6. GitHub Actions release.yml workflow fires automatically on the tag push

set -euo pipefail

# ── Argument validation ──────────────────────────────────────────────────────

if [[ $# -ne 1 ]]; then
  echo "Usage: bash scripts/release.sh <version>" >&2
  echo "Example: bash scripts/release.sh 0.1.0-beta.1" >&2
  exit 1
fi

VERSION="$1"

# Basic SemVer validation: X.Y.Z with optional pre-release (-label) and no leading 'v'
if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9][a-zA-Z0-9.]*)?$ ]]; then
  echo "Error: version must be a valid SemVer string without a leading 'v' (e.g. 0.1.0 or 0.1.0-beta.1)" >&2
  exit 1
fi

# Reject if version starts with 'v'
if [[ "$VERSION" == v* ]]; then
  echo "Error: do not include a leading 'v' in the version argument (e.g. use 0.1.0 not v0.1.0)" >&2
  exit 1
fi

TAG="v${VERSION}"

# ── Git pre-flight checks ────────────────────────────────────────────────────

if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "Error: not a Git repository" >&2
  exit 1
fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "Error: must be on branch 'main' to create a release (current: $CURRENT_BRANCH)" >&2
  exit 1
fi

if ! git diff --quiet HEAD || [[ -n "$(git ls-files --others --exclude-standard)" ]]; then
  echo "Error: working tree has uncommitted changes or untracked files — commit or stash before releasing" >&2
  exit 1
fi

# Check if tag already exists
if git rev-parse "$TAG" > /dev/null 2>&1; then
  echo "Error: tag $TAG already exists" >&2
  exit 1
fi

# ── Version bump ─────────────────────────────────────────────────────────────

echo "Updating package.json version to $VERSION ..."
# Use Node.js if available; otherwise use sed as a fallback
if command -v node > /dev/null 2>&1; then
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.version = process.argv[1];
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  " "$VERSION"
else
  sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json
fi
echo "✓ Updated package.json version to $VERSION"

# Update package-lock.json if it exists and npm is available
if [[ -f "package-lock.json" ]] && command -v npm > /dev/null 2>&1; then
  npm version "$VERSION" --no-git-tag-version --allow-same-version > /dev/null
  echo "✓ Updated package-lock.json"
fi

# ── Git commit & tag ─────────────────────────────────────────────────────────

git add package.json
if [[ -f "package-lock.json" ]]; then
  git add package-lock.json
fi

git commit -m "chore: release $TAG"
echo "✓ Created commit: chore: release $TAG"

git tag -a "$TAG" -m "Release $TAG"
echo "✓ Created tag: $TAG"

# ── Push ─────────────────────────────────────────────────────────────────────

git push origin main
echo "✓ Pushed commit to main"

git push origin "$TAG"
echo "✓ Pushed tag $TAG"

echo ""
echo "Release $TAG initiated. Monitor progress at:"
echo "  https://github.com/panthalnet/arike/actions"
echo "  https://github.com/panthalnet/arike/releases"
