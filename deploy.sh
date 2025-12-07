#!/bin/bash

# MiracleMeter Deployment Script
# Usage: ./deploy.sh [patch|minor|major]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default to patch if no argument provided
BUMP_TYPE=${1:-patch}

# Validate bump type
if [[ ! "$BUMP_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo -e "${RED}Error: Invalid bump type '$BUMP_TYPE'${NC}"
    echo "Usage: ./deploy.sh [patch|minor|major]"
    exit 1
fi

# Get current version from app.config.ts
CURRENT_VERSION=$(grep -o 'version: "[^"]*"' app.config.ts | grep -o '[0-9]*\.[0-9]*\.[0-9]*')

if [ -z "$CURRENT_VERSION" ]; then
    echo -e "${RED}Error: Could not find current version in app.config.ts${NC}"
    exit 1
fi

# Parse version components
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

# Calculate new version
case $BUMP_TYPE in
    major)
        NEW_VERSION="$((MAJOR + 1)).0.0"
        ;;
    minor)
        NEW_VERSION="$MAJOR.$((MINOR + 1)).0"
        ;;
    patch)
        NEW_VERSION="$MAJOR.$MINOR.$((PATCH + 1))"
        ;;
esac

echo -e "${YELLOW}Current version: ${CURRENT_VERSION}${NC}"
echo -e "${GREEN}New version: ${NEW_VERSION}${NC}"
echo ""

# Confirm with user
read -p "Proceed with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Deployment cancelled${NC}"
    exit 1
fi

# Update version in app.config.ts
echo -e "${YELLOW}Updating version in app.config.ts...${NC}"
sed -i '' "s/version: \"$CURRENT_VERSION\"/version: \"$NEW_VERSION\"/" app.config.ts

# Update version in package.json
echo -e "${YELLOW}Updating version in package.json...${NC}"
sed -i '' "s/\"version\": \"[0-9]*\.[0-9]*\.[0-9]*\"/\"version\": \"$NEW_VERSION\"/" package.json

# Update version in iOS Info.plist files
echo -e "${YELLOW}Updating version in iOS Info.plist files...${NC}"
# Update CFBundleShortVersionString in main app Info.plist
sed -i '' '/CFBundleShortVersionString/,/<string>/ s/<string>[0-9]*\.[0-9]*\.[0-9]*<\/string>/<string>'$NEW_VERSION'<\/string>/' ios/miraclemeter/Info.plist
# Update CFBundleShortVersionString in widget Info.plist
sed -i '' '/CFBundleShortVersionString/,/<string>/ s/<string>[0-9]*\.[0-9]*\.[0-9]*<\/string>/<string>'$NEW_VERSION'<\/string>/' ios/MiracleMeterWidget/Info.plist

# Verify the version updates were successful
echo -e "${YELLOW}Verifying version updates...${NC}"
APP_PLIST_VERSION=$(grep -A1 "CFBundleShortVersionString" ios/miraclemeter/Info.plist | grep -o '[0-9]*\.[0-9]*\.[0-9]*')
WIDGET_PLIST_VERSION=$(grep -A1 "CFBundleShortVersionString" ios/MiracleMeterWidget/Info.plist | grep -o '[0-9]*\.[0-9]*\.[0-9]*')

if [ "$APP_PLIST_VERSION" != "$NEW_VERSION" ]; then
    echo -e "${RED}Error: Failed to update version in ios/miraclemeter/Info.plist (found: $APP_PLIST_VERSION)${NC}"
    exit 1
fi

if [ "$WIDGET_PLIST_VERSION" != "$NEW_VERSION" ]; then
    echo -e "${RED}Error: Failed to update version in ios/MiracleMeterWidget/Info.plist (found: $WIDGET_PLIST_VERSION)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All version files updated successfully to $NEW_VERSION${NC}"

# Commit the version change
echo -e "${YELLOW}Committing version bump...${NC}"
git add app.config.ts package.json ios/miraclemeter/Info.plist ios/MiracleMeterWidget/Info.plist
git commit -m "chore: bump version to $NEW_VERSION"

# Create git tag
echo -e "${YELLOW}Creating git tag v$NEW_VERSION...${NC}"
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# Push changes and tags
echo -e "${YELLOW}Pushing to remote...${NC}"
git push && git push --tags

# Build and submit to TestFlight
echo -e "${YELLOW}Building and submitting to TestFlight...${NC}"
eas build --platform ios --profile production --auto-submit

echo ""
echo -e "${GREEN}Deployment complete!${NC}"
echo -e "Version ${NEW_VERSION} has been submitted to TestFlight."
