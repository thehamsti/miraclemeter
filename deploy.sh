#!/bin/bash

# MiracleMeter Deployment Script (Improved for Expo SDK 54)
# Usage: ./deploy.sh [patch|minor|major|--retry]
#
# Features:
# - Uses Expo Fingerprint to detect native code changes
# - Pushes OTA updates when only JS changes (instant deploy)
# - Full build + TestFlight submission when native code changes
# - Build numbers managed automatically by EAS (remote source)
# - Only user-facing version needs manual bumping
# - Use --retry to retry a failed build without version bump

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

FINGERPRINT_FILE=".last-fingerprint"
RETRY_MODE=false

# Check for --retry flag
if [ "$1" = "--retry" ]; then
    RETRY_MODE=true
    BUMP_TYPE=""
else
    BUMP_TYPE=${1:-patch}
    if [[ ! "$BUMP_TYPE" =~ ^(patch|minor|major)$ ]]; then
        echo -e "${RED}Error: Invalid bump type '$BUMP_TYPE'${NC}"
        echo "Usage: ./deploy.sh [patch|minor|major|--retry]"
        exit 1
    fi
fi

# Get current version from app.config.ts
CURRENT_VERSION=$(grep -o 'version: "[^"]*"' app.config.ts | grep -o '[0-9]*\.[0-9]*\.[0-9]*')

if [ -z "$CURRENT_VERSION" ]; then
    echo -e "${RED}Error: Could not find current version in app.config.ts${NC}"
    exit 1
fi

echo -e "${BLUE}MiracleMeter Deploy Script${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$RETRY_MODE" = true ]; then
    NEW_VERSION="$CURRENT_VERSION"
    echo -e "${YELLOW}Retry mode:${NC} Retrying failed build"
    echo -e "${GREEN}Version:${NC} ${CURRENT_VERSION}"
else
    # Parse and calculate new version
    IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

    case $BUMP_TYPE in
        major) NEW_VERSION="$((MAJOR + 1)).0.0" ;;
        minor) NEW_VERSION="$MAJOR.$((MINOR + 1)).0" ;;
        patch) NEW_VERSION="$MAJOR.$MINOR.$((PATCH + 1))" ;;
    esac

    echo -e "${YELLOW}Current version:${NC} ${CURRENT_VERSION}"
    echo -e "${GREEN}New version:${NC}     ${NEW_VERSION}"
fi
echo ""

# Check for native code changes using Expo Fingerprint
echo -e "${YELLOW}Checking for native code changes...${NC}"
CURRENT_FINGERPRINT=$(npx @expo/fingerprint . 2>/dev/null | bun -e "const d = await Bun.stdin.json(); console.log(d.hash)" 2>/dev/null || echo "unknown")
LAST_FINGERPRINT=$(cat "$FINGERPRINT_FILE" 2>/dev/null || echo "")

if [ "$CURRENT_FINGERPRINT" = "$LAST_FINGERPRINT" ] && [ -n "$LAST_FINGERPRINT" ]; then
    DEPLOY_TYPE="ota"
    echo -e "${GREEN}No native changes detected${NC} - OTA update available"
else
    DEPLOY_TYPE="build"
    echo -e "${YELLOW}Native changes detected${NC} - Full build required"
fi

echo ""
echo -e "Deploy type: ${BLUE}${DEPLOY_TYPE}${NC}"
echo ""

# Confirm with user
read -p "Proceed with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Deployment cancelled${NC}"
    exit 1
fi

# Skip version bump and git operations in retry mode
if [ "$RETRY_MODE" = false ]; then
    # Update version in app.config.ts only (EAS handles build numbers)
    echo -e "${YELLOW}Updating version in app.config.ts...${NC}"
    sed -i '' "s/version: \"$CURRENT_VERSION\"/version: \"$NEW_VERSION\"/" app.config.ts

    # Update version in package.json
    echo -e "${YELLOW}Updating version in package.json...${NC}"
    sed -i '' "s/\"version\": \"[0-9]*\.[0-9]*\.[0-9]*\"/\"version\": \"$NEW_VERSION\"/" package.json

    # Update version in Info.plist (native iOS)
    echo -e "${YELLOW}Updating version in Info.plist...${NC}"
    sed -i '' "s/<string>$CURRENT_VERSION<\/string>/<string>$NEW_VERSION<\/string>/" ios/miraclemeter/Info.plist

    # Update runtimeVersion in app.config.ts (must match version for bare workflow)
    echo -e "${YELLOW}Updating runtimeVersion in app.config.ts...${NC}"
    sed -i '' "s/runtimeVersion: \"$CURRENT_VERSION\"/runtimeVersion: \"$NEW_VERSION\"/" app.config.ts

    # Commit version change
    echo -e "${YELLOW}Committing version bump...${NC}"
    git add app.config.ts package.json ios/miraclemeter/Info.plist
    git commit -m "chore: bump version to $NEW_VERSION"

    # Create git tag
    echo -e "${YELLOW}Creating git tag v$NEW_VERSION...${NC}"
    git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

    # Push changes and tags
    echo -e "${YELLOW}Pushing to remote...${NC}"
    git push && git push --tags
else
    echo -e "${YELLOW}Skipping version bump (retry mode)${NC}"
fi

# Deploy based on fingerprint detection
if [ "$DEPLOY_TYPE" = "ota" ]; then
    echo -e "${YELLOW}Pushing OTA update...${NC}"
    eas update --branch production --message "v$NEW_VERSION"
    echo ""
    echo -e "${GREEN}OTA update published!${NC}"
    echo -e "Users will receive v${NEW_VERSION} on next app launch."
else
    echo -e "${YELLOW}Building and submitting to TestFlight...${NC}"
    eas build --platform ios --profile production --auto-submit

    # Save fingerprint after successful build
    echo "$CURRENT_FINGERPRINT" > "$FINGERPRINT_FILE"
    git add "$FINGERPRINT_FILE"
    git commit -m "chore: update fingerprint after build" || true
    git push || true

    echo ""
    echo -e "${GREEN}Build submitted to TestFlight!${NC}"
    echo -e "Version ${NEW_VERSION} is processing."
fi

echo ""
echo -e "${GREEN}Deployment complete!${NC}"
