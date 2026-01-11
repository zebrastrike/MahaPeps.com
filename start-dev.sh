#!/bin/bash

# MahaPeps Local Development Startup Script

echo "🚀 Starting MahaPeps Local Development Environment..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Start Docker services
echo "📦 Starting PostgreSQL and Redis..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for database to be ready..."
until docker exec mahapeps-postgres-dev pg_isready -U mahapeps > /dev/null 2>&1; do
    sleep 1
done

echo "⏳ Waiting for Redis to be ready..."
until docker exec mahapeps-redis-dev redis-cli ping > /dev/null 2>&1; do
    sleep 1
done

echo "✅ Database services are ready!"
echo ""

# Check if .env files exist
if [ ! -f "apps/api/.env" ]; then
    echo "⚠️  apps/api/.env not found. Creating from .env.example..."
    cp apps/api/.env.example apps/api/.env
    echo "📝 Please edit apps/api/.env and set your environment variables"
fi

if [ ! -f "apps/web/.env.local" ]; then
    echo "⚠️  apps/web/.env.local not found. Creating from .env.example..."
    cp apps/web/.env.example apps/web/.env.local
    echo "📝 Please edit apps/web/.env.local and set your environment variables"
fi

# Check if node_modules exist
if [ ! -d "apps/api/node_modules" ]; then
    echo "📦 Installing API dependencies..."
    cd apps/api && npm install && cd ../..
fi

if [ ! -d "apps/web/node_modules" ]; then
    echo "📦 Installing Web dependencies..."
    cd apps/web && npm install && cd ../..
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
cd apps/api
npx prisma generate > /dev/null 2>&1

# Check if database needs migration
echo "🔧 Running database migrations..."
npx prisma migrate deploy

cd ../..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Open 2 terminal windows"
echo "   2. In terminal 1: cd apps/api && npm run start:dev"
echo "   3. In terminal 2: cd apps/web && npm run dev"
echo ""
echo "🌐 URLs:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend:  http://localhost:3001"
echo "   - DB Admin: npx prisma studio (in apps/api)"
echo ""
echo "🛑 To stop: docker-compose -f docker-compose.dev.yml down"
echo ""
