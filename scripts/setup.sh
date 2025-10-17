#!/bin/bash

echo "🚀 Setting up pipel-react..."
echo ""

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Please install pnpm first:"
    echo "   npm install -g pnpm"
    exit 1
fi

echo "✅ pnpm found"
echo ""

# 安装依赖
echo "📦 Installing dependencies..."
pnpm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Available commands:"
echo "  pnpm dev      - Run examples"
echo "  pnpm test     - Run tests"
echo "  pnpm build    - Build library"
echo ""
