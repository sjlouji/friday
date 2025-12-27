#!/bin/bash

set -e

echo "🧪 Testing nginx configuration..."

# Test development config
echo "Testing development config..."
docker run --rm \
  -v "$(pwd)/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro" \
  nginx:alpine \
  nginx -t

# Test production config
echo "Testing production config..."
docker run --rm \
  -v "$(pwd)/nginx/nginx.prod.conf:/etc/nginx/conf.d/default.conf:ro" \
  nginx:alpine \
  nginx -t

echo "✅ All nginx configurations are valid!"

