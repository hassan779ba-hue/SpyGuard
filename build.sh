#!/bin/bash

# SpyGuard EAS Build Script
# Run: bash build.sh

set -e

echo "=========================================="
echo "SpyGuard Android APK Build Script"
echo "=========================================="

# Check if EXPO_TOKEN is set
if [ -z "$EXPO_TOKEN" ]; then
  echo ""
  echo "Error: EXPO_TOKEN environment variable is not set."
  echo ""
  echo "To get your token:"
  echo "1. Go to: https://expo.dev/settings/access-tokens"
  echo "2. Create a new token with 'Read and Write' access"
  echo "3. Run: export EXPO_TOKEN=your_token_here"
  echo ""
  exit 1
fi

# Install dependencies
echo ""
echo "Step 1: Installing dependencies..."
npm install

# Run expo doctor
echo ""
echo "Step 2: Running health check..."
npx expo-doctor || true

# Run EAS build
echo ""
echo "Step 3: Starting EAS build for Android APK..."
echo ""
npx eas-cli build --platform android --profile preview --non-interactive

echo ""
echo "=========================================="
echo "Build started! Check the link above for progress."
echo "=========================================="
