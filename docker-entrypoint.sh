#!/bin/bash
set -e

echo "🚀 Starting FinishLine backend..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

echo "📊 Database URL is configured"

# Run migrations
echo "🔄 Running Prisma migrations..."
cd /app/src/backend

# Run migrations with error handling (if migrations fail )
if npx prisma migrate deploy; then
  echo "✅ Migrations completed successfully"
else
  echo "❌ ERROR: Migrations failed"
  exit 1
fi

# Return to app directory
cd /app

echo "🎉 Migrations complete, starting application..."

# Execute the CMD passed to docker run
exec "$@"
