#!/bin/bash

set -e

ENVIRONMENT=${1:-staging}
PROJECT_NAME="friday"

echo "🚀 Deploying Friday to $ENVIRONMENT environment..."

case $ENVIRONMENT in
  staging)
    echo "📦 Building for staging..."
    cd app && npm run build
    echo "✅ Build complete"
    echo "📤 Deploy to staging server..."
    # Add your staging deployment commands here
    # Example: rsync -avz dist/ user@staging-server:/var/www/friday/
    ;;
  prod|production)
    echo "📦 Building for production..."
    cd app && npm run build
    echo "✅ Build complete"
    echo "📤 Deploy to production server..."
    # Add your production deployment commands here
    # Example: rsync -avz dist/ user@prod-server:/var/www/friday/
    ;;
  *)
    echo "❌ Unknown environment: $ENVIRONMENT"
    echo "Usage: ./scripts/deploy.sh [staging|prod]"
    exit 1
    ;;
esac

echo "✅ Deployment to $ENVIRONMENT complete!"

