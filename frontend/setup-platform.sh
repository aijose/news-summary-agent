#!/bin/bash

# Cross-platform setup script for News Summary Agent Frontend
# Handles platform-specific dependency installation

set -e

echo "🔧 Setting up News Summary Agent Frontend..."

# Detect platform
if [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PLATFORM="Linux"
else
    PLATFORM="Unknown"
fi

echo "📍 Detected platform: $PLATFORM"

# Check Node.js version
NODE_VERSION=$(node --version)
REQUIRED_VERSION="v18.19.1"

echo "📦 Node.js version: $NODE_VERSION"

if [ "$NODE_VERSION" != "$REQUIRED_VERSION" ]; then
    echo "⚠️  Warning: Recommended Node.js version is $REQUIRED_VERSION"
    echo "   You can install it with: nvm install $REQUIRED_VERSION && nvm use"
fi

# Clean and reinstall dependencies for current platform
echo "🧹 Cleaning previous installation..."
rm -rf node_modules package-lock.json dist

echo "📥 Installing dependencies for $PLATFORM..."
npm install

echo "✅ Checking TypeScript..."
npm run type-check

echo "🎉 Setup complete! You can now run:"
echo "   npm run dev"
