#!/bin/bash

set -e

echo "🧹 Cleaning Friday project..."

echo "Cleaning API..."
cd api
rm -rf __pycache__ *.pyc *.pyo .pytest_cache .coverage htmlcov dist build *.egg-info
find . -type d -name __pycache__ -exec rm -r {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
cd ..

echo "Cleaning app..."
cd app
rm -rf node_modules dist dist-ssr .vite .next .nuxt .cache
cd ..

echo "✅ Clean complete!"

