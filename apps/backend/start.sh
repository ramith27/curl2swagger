#!/bin/sh
set -e

# Function to wait for database
wait_for_db() {
  echo "Waiting for database to be ready..."
  until pg_isready -h postgres -p 5432 -U postgres 2>/dev/null; do
    echo "Database is not ready yet - waiting..."
    sleep 2
  done
  echo "Database is ready!"
}

# Wait for database connection
wait_for_db

# Generate Prisma client
echo "Generating Prisma client..."
pnpm exec prisma generate

# Run database migrations
echo "Running database migrations..."
pnpm exec prisma migrate deploy

# Start the application
echo "Starting application..."
exec node dist/main.js
