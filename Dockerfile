# Multi-stage build for production

# Stage 1: Build frontend
FROM oven/bun:1 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN bun install --frozen-lockfile
COPY frontend/ ./
RUN bun run build

# Stage 2: Production image
FROM oven/bun:1-slim

# Install nginx
RUN apt-get update && \
    apt-get install -y nginx && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend
COPY backend/package.json ./backend/
WORKDIR /app/backend
RUN bun install --frozen-lockfile --production
COPY backend/ ./

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create directory for database mount
RUN mkdir -p /app/data

# Expose port 80 for nginx
EXPOSE 8888

# Environment variables (can be overridden)
ENV NODE_ENV=production \
    DATABASE_URL=/app/data/feedback.db \
    FRONTEND_DIST=/app/frontend/dist \
    PORT=3001

# Start script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
