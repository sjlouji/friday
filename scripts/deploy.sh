#!/bin/bash

set -e

ENVIRONMENT=${1:-staging}
PROJECT_NAME="friday"

echo "🚀 Deploying Friday to $ENVIRONMENT environment..."

case $ENVIRONMENT in
  staging)
    echo "Info Building for staging..."
    cd app && npm run build
    echo "Success Build complete"
    echo "Info Deploy to staging server..."
    # Add your staging deployment commands here
    # Example: rsync -avz dist/ user@staging-server:/var/www/friday/
    ;;
  prod|production)
    echo "Info Building for production..."
    cd app && npm run build
    echo "Success Build complete"
    echo "Info Deploy to production server..."
    # Add your production deployment commands here
    # Example: rsync -avz dist/ user@prod-server:/var/www/friday/
    ;;
  *)
    echo "Error: Unknown environment: $ENVIRONMENT"
    echo "Usage: ./scripts/deploy.sh [staging|prod]"
    exit 1
    ;;
esac

echo "Success Deployment to $ENVIRONMENT complete!"

