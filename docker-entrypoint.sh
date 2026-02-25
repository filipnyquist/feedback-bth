#!/bin/bash
set -e

echo "Starting Feedback BTH application..."

# Start nginx in the background
echo "Starting nginx..."
nginx

# Start the backend server
echo "Starting backend server..."
cd /app/backend
exec bun run src/index.ts
