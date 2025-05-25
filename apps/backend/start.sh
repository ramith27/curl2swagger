#!/bin/sh
set -e

# Function to wait for database
wait_for_db() {
  echo "Waiting for database to be ready..."
  until pnpm exec prisma db push --skip-generate 2>/dev/null; do
    echo "Database is not ready yet - waiting..."
    sleep 2
  done
  echo "Database is ready!"
}

# Wait for database connection
wait_for_db

# Run database migrations
echo "Running database migrations..."
pnpm exec prisma migrate deploy

# Start the application
echo "Starting application..."
exec node dist/main.js
