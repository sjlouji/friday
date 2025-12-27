#!/bin/bash

set -e

echo "🔧 Setting up Friday project..."

echo "📦 Installing API dependencies..."
cd api
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..

echo "📦 Installing app dependencies..."
cd app
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  make dev          # Start both API and app"
echo "  make dev-api      # Start API only"
echo "  make dev-app      # Start app only"

