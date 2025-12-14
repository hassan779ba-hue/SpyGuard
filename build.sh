#!/bin/bash

# SpyGuard EAS Build Script
# Run: bash build.sh

# Check if EXPO_TOKEN is set
if [ -z "$EXPO_TOKEN" ]; then
  echo "Error: EXPO_TOKEN environment variable is not set."
  echo "Get your token from: https://expo.dev/settings/access-tokens"
  echo "Then run: export EXPO_TOKEN=your_token_here"
  exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Run EAS build
echo "Starting EAS build for Android APK..."
npx eas-cli build --platform android --profile preview --non-interactive
