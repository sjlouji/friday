#!/bin/bash

set -e

echo "🧪 Testing nginx configuration..."

docker run --rm \
  -v "$(pwd)/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro" \
  nginx:alpine \
  nginx -t

echo "✅ Nginx configuration is valid!"

