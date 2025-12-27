# Nginx Configuration

Nginx acts as a reverse proxy for both the API and frontend application.

## Configuration Files

- `nginx.conf` - Development configuration (used with docker-compose)
- `nginx.prod.conf` - Production configuration (for static file serving)

## Development Configuration

`nginx.conf`:

- Routes `/api/*` to the backend API
- Routes all other requests to the frontend dev server
- Supports WebSocket for Vite HMR
- Gzip compression enabled

## Production Configuration

`nginx.prod.conf`:

- Routes `/api/*` to the backend API
- Serves static frontend files from `/usr/share/nginx/html`
- Includes caching headers for static assets
- Security headers enabled
- Gzip compression enabled

## Usage

### With Docker

```bash
docker-compose up
```

Access the application at `http://localhost`

### Local Development

For local development, start services directly (no nginx needed):

- API: `cd api && ./start.sh` (runs on port 8000)
- App: `cd app && npm run dev` (runs on port 5173)

## Routing

- **Frontend**: `http://localhost/` → Served by app dev server or static files
- **API**: `http://localhost/api/*` → Proxied to `api:8000`
- **Health Check**: `http://localhost/health` → API health endpoint

## SSL/HTTPS

For production with SSL, update `nginx.prod.conf` to include SSL configuration:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of config
}
```
