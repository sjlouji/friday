# Deployment Guide

This guide covers deploying Friday to production environments using Docker and Docker Compose.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Docker Compose Configuration](#docker-compose-configuration)
- [Nginx Configuration](#nginx-configuration)
- [Deployment Steps](#deployment-steps)
- [Production Deployment](#production-deployment)
- [Health Checks](#health-checks)
- [Monitoring and Logs](#monitoring-and-logs)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Git
- Basic knowledge of Docker and containerization

## Environment Variables

### API Environment Variables

Create a `.env` file in the root directory or set environment variables:

```bash
# Beancount ledger file path (default: ledger.beancount)
BEANCOUNT_FILE=/path/to/your/ledger.beancount

# API settings (optional)
API_HOST=0.0.0.0
API_PORT=8000
```

### Frontend Environment Variables

The frontend uses environment variables at build time:

```bash
# API URL (default: /api for production)
VITE_API_URL=/api
```

For production, the API URL should be relative (`/api`) since Nginx handles routing.

## Docker Compose Configuration

The `docker-compose.yml` file defines three services:

### Services Overview

1. **nginx** - Reverse proxy and web server
2. **api** - FastAPI backend service
3. **app** - React frontend service

### Service Details

#### Nginx Service

```yaml
nginx:
  build:
    context: .
    dockerfile: nginx.Dockerfile
    args:
      CONFIG_FILE: nginx/nginx.conf # Use nginx.prod.conf for production
  ports:
    - "80:80" # HTTP port
    - "443:443" # HTTPS port (if SSL configured)
  depends_on:
    - api
    - app
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
  restart: unless-stopped
```

#### API Service

```yaml
api:
  build:
    context: ./api
    dockerfile: Dockerfile
  expose:
    - "8000"
  environment:
    - BEANCOUNT_FILE=${BEANCOUNT_FILE:-ledger.beancount}
  volumes:
    - ./api:/app
    - ./data:/data # Mount your data directory
  restart: unless-stopped
```

#### App Service

```yaml
app:
  build:
    context: ./app
    dockerfile: Dockerfile # Use Dockerfile.prod for production
  expose:
    - "5173"
  environment:
    - VITE_API_URL=/api
  volumes:
    - ./app:/app
    - /app/node_modules
  restart: unless-stopped
```

## Nginx Configuration

Nginx acts as a reverse proxy, routing requests between the frontend and backend.

### Development Configuration (`nginx/nginx.conf`)

- Proxies frontend dev server (Vite HMR support)
- Routes `/api/*` to backend
- Supports WebSocket for hot module replacement

### Production Configuration (`nginx/nginx.prod.conf`)

- Serves static files from built frontend
- Routes `/api/*` to backend
- Optimized caching for static assets
- Security headers enabled
- Gzip compression enabled

### Routing Rules

| Path      | Destination            | Description                |
| --------- | ---------------------- | -------------------------- |
| `/`       | Frontend (app service) | Serves React application   |
| `/api/*`  | Backend (api service)  | All API requests           |
| `/health` | Backend health check   | Health monitoring endpoint |
| `/ws`     | Frontend WebSocket     | Vite HMR (dev only)        |

### Key Nginx Features

- **Security Headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- **Gzip Compression**: Reduces response sizes
- **Static Asset Caching**: Long-term caching for assets
- **Client Body Size**: 50MB limit for file uploads
- **Proxy Timeouts**: Configured for long-running requests

## Deployment Steps

### 1. Clone Repository

```bash
git clone https://github.com/sjlouji/friday.git
cd friday
```

### 2. Configure Environment

Create `.env` file:

```bash
cp .env.example .env  # If example exists
# Edit .env with your settings
```

### 3. Build and Start Services

```bash
# Build all images
make docker-build

# Start all services
make docker-up

# Or use docker-compose directly
docker-compose up -d
```

### 4. Verify Deployment

```bash
# Check service status
docker-compose ps

# View logs
make docker-logs

# Test nginx configuration
make nginx-test
```

### 5. Access Application

- Frontend: `http://your-server-ip`
- API Docs: `http://your-server-ip/api/docs`
- Health Check: `http://your-server-ip/health`

## Production Deployment

### Production Build

For production, use production Dockerfiles and configurations:

1. **Update docker-compose.yml** to use production configs:

```yaml
nginx:
  build:
    args:
      CONFIG_FILE: nginx/nginx.prod.conf # Production config

app:
  build:
    dockerfile: Dockerfile.prod # Production Dockerfile
```

2. **Build production images**:

```bash
docker-compose -f docker-compose.yml build --no-cache
```

3. **Start services**:

```bash
docker-compose up -d
```

### SSL/HTTPS Configuration

For production, configure SSL certificates:

1. **Update nginx.prod.conf** to include SSL:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of config
}
```

2. **Mount SSL certificates** in docker-compose.yml:

```yaml
nginx:
  volumes:
    - ./ssl:/etc/nginx/ssl:ro
```

3. **Redirect HTTP to HTTPS**:

```nginx
server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

### Data Persistence

Ensure your Beancount files and data persist:

```yaml
api:
  volumes:
    - ./data:/data:rw # Persistent data directory
    - ./ledger.beancount:/app/ledger.beancount:ro # Your ledger file
```

### Resource Limits

Add resource limits for production:

```yaml
api:
  deploy:
    resources:
      limits:
        cpus: "1"
        memory: 1G
      reservations:
        cpus: "0.5"
        memory: 512M
```

## Health Checks

### API Health Check

The API provides a health endpoint:

```bash
curl http://localhost/health
```

### Container Health Checks

Add health checks to docker-compose.yml:

```yaml
api:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

## Monitoring and Logs

### View Logs

```bash
# All services
make docker-logs

# Specific service
docker-compose logs -f api
docker-compose logs -f app
docker-compose logs -f nginx
```

### Log Rotation

Configure log rotation in docker-compose.yml:

```yaml
services:
  api:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Monitoring

Consider integrating:

- **Prometheus** for metrics
- **Grafana** for dashboards
- **Sentry** for error tracking

## Troubleshooting

### Services Not Starting

1. Check logs: `docker-compose logs`
2. Verify ports aren't in use: `netstat -tulpn | grep :80`
3. Check Docker daemon: `docker ps`

### Nginx Configuration Errors

```bash
# Test configuration
make nginx-test

# Validate syntax
docker run --rm -v $(pwd)/nginx:/etc/nginx/conf.d:ro nginx:alpine nginx -t
```

### API Connection Issues

1. Verify API is running: `docker-compose ps api`
2. Check API logs: `docker-compose logs api`
3. Test API directly: `curl http://localhost:8000/api/health`

### Frontend Not Loading

1. Check app service: `docker-compose ps app`
2. Verify build: `docker-compose logs app`
3. Check Nginx routing: `docker-compose logs nginx`

### Permission Issues

If you encounter permission issues with mounted volumes:

```bash
# Fix ownership
sudo chown -R $USER:$USER ./data
```

## Deployment Scripts

Use the provided deployment scripts:

```bash
# Deploy to staging
make deploy-staging

# Deploy to production
make deploy-prod
```

These scripts build the project and deploy to the specified environment.

## Backup and Recovery

### Backup Strategy

1. **Regular backups** of Beancount ledger files
2. **Database backups** (if using external database)
3. **Configuration backups** (docker-compose.yml, .env files)

### Backup Commands

```bash
# Backup ledger file
cp ledger.beancount backups/ledger-$(date +%Y%m%d).beancount

# Backup entire data directory
tar -czf backup-$(date +%Y%m%d).tar.gz ./data
```

## Security Considerations

- Use HTTPS in production
- Keep Docker images updated
- Use secrets management for sensitive data
- Implement rate limiting
- Configure firewall rules
- Regular security audits
- Keep dependencies updated

## Scaling

For high-traffic deployments:

1. **Horizontal scaling**: Run multiple API instances
2. **Load balancing**: Configure Nginx upstream with multiple backends
3. **Database**: Consider external database for shared state
4. **Caching**: Implement Redis for session/cache management
