# Deployment Guide

This application can be deployed using Docker with a single container running both the frontend and backend.

## Architecture

- **Nginx** (port 80) - Reverse proxy and static file server
  - Routes `/api/*` to the backend
  - Serves frontend static files for all other routes
- **Backend** (port 3001) - Bun server (internal)
- **Frontend** - Built static files served by nginx

## Quick Start

### 1. Create `.env` file

Create a `.env` file in the project root with your configuration:

```bash
# Microsoft OAuth
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
TENANT_ID=your-tenant-id
REDIRECT_URI=http://your-domain.com/api/auth/callback

# JWT Secret (generate a random string)
JWT_SECRET=your-secret-key-here

# Superadmin email
SUPERUSER=admin@example.com

# Frontend URL
FRONTEND_ORIGIN=http://your-domain.com

# Database (automatically set in Docker)
DATABASE_URL=/app/data/feedback.db
```

### 2. Create data directory

```bash
mkdir -p data
```

### 3. Build and run with Docker Compose

```bash
docker-compose up -d
```

The application will be available at `http://localhost:80`

### 4. View logs

```bash
docker-compose logs -f
```

### 5. Stop the application

```bash
docker-compose down
```

## Manual Docker Build

If you prefer to build and run manually:

```bash
# Build the image
docker build -t feedback-bth .

# Run the container
docker run -d \
  -p 80:80 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/.env:/app/backend/.env:ro \
  --name feedback-bth \
  feedback-bth
```

## Production Deployment

### Environment Variables

Make sure to set production values in your `.env`:

- Use HTTPS URLs for `REDIRECT_URI` and `FRONTEND_ORIGIN`
- Generate a strong random `JWT_SECRET`
- Set the correct `SUPERUSER` email

### HTTPS/SSL

For production, you should:

1. Use a reverse proxy (like Caddy or another nginx instance) in front of this container
2. Configure SSL/TLS certificates
3. Update `REDIRECT_URI` and `FRONTEND_ORIGIN` to use `https://`

Example with Caddy:

```
your-domain.com {
    reverse_proxy localhost:80
}
```

### Database Backup

The database is stored in `./data/feedback.db`. Make sure to:

- Regularly backup this directory
- Include it in your backup strategy
- Consider using a volume backup solution

```bash
# Backup database
cp data/feedback.db data/feedback.db.backup-$(date +%Y%m%d)
```

### Monitoring

The container includes a health check that pings `/api/programs` every 30 seconds.

Check container health:

```bash
docker-compose ps
```

## Troubleshooting

### Check if services are running

```bash
# Inside the container
docker exec -it feedback-bth-feedback-bth-1 ps aux
```

### Check nginx logs

```bash
docker exec -it feedback-bth-feedback-bth-1 tail -f /var/log/nginx/access.log
docker exec -it feedback-bth-feedback-bth-1 tail -f /var/log/nginx/error.log
```

### Restart the container

```bash
docker-compose restart
```

### Rebuild after code changes

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Ports

- **80** - Main application port (nginx)
- **3001** - Backend (internal only, not exposed)

## Volumes

- `./data:/app/data` - Database storage
- `./.env:/app/backend/.env:ro` - Environment configuration (read-only)
