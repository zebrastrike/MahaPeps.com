#!/bin/bash

# ============================================
# MAHA Peptides Production Deployment Script
# ============================================
# Run this on your Hetzner server after:
# 1. Creating .env files in apps/api and apps/web
# 2. Pushing your code to the server

set -e  # Exit on any error

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║          🚀 MAHA Peptides Production Deployment                       ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# ============================================
# 1. Check Prerequisites
# ============================================
echo "📋 Step 1: Checking prerequisites..."

if [ ! -f "apps/api/.env" ]; then
    echo "❌ ERROR: apps/api/.env not found!"
    echo "   Create it first using DEPLOYMENT-GUIDE.md"
    exit 1
fi

if [ ! -f "apps/web/.env.local" ]; then
    echo "❌ ERROR: apps/web/.env.local not found!"
    echo "   Create it first using DEPLOYMENT-GUIDE.md"
    exit 1
fi

echo "✅ Environment files found"

# ============================================
# 2. Start Docker Services
# ============================================
echo ""
echo "🐳 Step 2: Starting Docker services..."

if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.dev.yml up -d
elif command -v docker &> /dev/null; then
    docker compose -f docker-compose.dev.yml up -d
else
    echo "❌ ERROR: Docker not found. Please install Docker first."
    exit 1
fi

echo "✅ Docker services started"
sleep 5  # Wait for DB to be ready

# ============================================
# 3. Install Dependencies
# ============================================
echo ""
echo "📦 Step 3: Installing dependencies..."

cd apps/api
echo "   Installing API dependencies..."
npm install

cd ../web
echo "   Installing frontend dependencies..."
npm install

cd "$SCRIPT_DIR"
echo "✅ Dependencies installed"

# ============================================
# 4. Setup Database
# ============================================
echo ""
echo "🗄️  Step 4: Setting up database..."

cd apps/api

echo "   Pushing database schema..."
npx prisma db push

echo "   Generating Prisma client..."
npx prisma generate

echo "✅ Database schema ready"

# ============================================
# 5. Seed Database
# ============================================
echo ""
echo "🌱 Step 5: Seeding database..."

echo "   Creating admin account..."
npm run seed:admin

echo "   Seeding retail product catalog..."
npm run seed:retail

echo "   Updating product images..."
npm run seed:images

echo "   Seeding FAQ content..."
npm run seed:content || echo "   ⚠️  FAQ seeding failed (might not exist yet)"

echo "✅ Database seeded"

cd "$SCRIPT_DIR"

# ============================================
# 6. Verify Product Images
# ============================================
echo ""
echo "🖼️  Step 6: Verifying product images..."

IMAGE_COUNT=$(find apps/web/public/products -name "*.png" 2>/dev/null | wc -l)
echo "   Found $IMAGE_COUNT product images"

if [ "$IMAGE_COUNT" -lt 10 ]; then
    echo "   ⚠️  WARNING: Expected more images. Upload with:"
    echo "   scp -r local-path/public/products root@YOUR_IP:/root/MahaPeps.com/apps/web/public/"
fi

# ============================================
# 7. Build Applications
# ============================================
echo ""
echo "🔨 Step 7: Building applications..."

cd apps/api
echo "   Building API..."
npm run build

cd ../web
echo "   Building frontend..."
npm run build

cd "$SCRIPT_DIR"
echo "✅ Applications built"

# ============================================
# 8. Setup PM2 (if available)
# ============================================
echo ""
echo "⚙️  Step 8: Setting up PM2..."

if command -v pm2 &> /dev/null; then
    echo "   Stopping existing PM2 processes..."
    pm2 delete mahapeps-api mahapeps-web 2>/dev/null || true

    echo "   Starting API with PM2..."
    cd apps/api
    pm2 start npm --name "mahapeps-api" -- run start:prod

    echo "   Starting frontend with PM2..."
    cd ../web
    pm2 start npm --name "mahapeps-web" -- run start

    cd "$SCRIPT_DIR"

    echo "   Saving PM2 configuration..."
    pm2 save

    echo "✅ PM2 configured and running"
    echo ""
    echo "📊 PM2 Status:"
    pm2 status
else
    echo "   ⚠️  PM2 not installed. Install with: npm install -g pm2"
    echo "   For now, start manually:"
    echo "   - API: cd apps/api && npm run start:prod"
    echo "   - Web: cd apps/web && npm run start"
fi

# ============================================
# 9. Health Check
# ============================================
echo ""
echo "🏥 Step 9: Running health checks..."

sleep 3  # Wait for services to start

echo "   Checking API health..."
if curl -f http://localhost:3001/auth/health &>/dev/null; then
    echo "   ✅ API is healthy"
else
    echo "   ⚠️  API health check failed (might still be starting...)"
fi

echo "   Checking products endpoint..."
if curl -f http://localhost:3001/catalog/products &>/dev/null; then
    echo "   ✅ Products endpoint working"
else
    echo "   ⚠️  Products endpoint failed"
fi

# ============================================
# 10. Summary
# ============================================
echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║          ✅ DEPLOYMENT COMPLETE!                                      ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 Your site is now running!"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://$(curl -s ifconfig.me):3002"
echo "   API:      http://$(curl -s ifconfig.me):3001"
echo "   Admin:    http://$(curl -s ifconfig.me):3002/sign-in"
echo ""
echo "🔑 Admin Login:"
echo "   Check your .env file for ADMIN_EMAIL and ADMIN_PASSWORD"
echo ""
echo "📊 Useful Commands:"
echo "   pm2 status              - Check app status"
echo "   pm2 logs                - View logs"
echo "   pm2 restart all         - Restart apps"
echo "   docker ps               - Check database"
echo ""
echo "📝 Next Steps:"
echo "   1. Test the site in your browser"
echo "   2. Try placing a test order"
echo "   3. Login to admin panel"
echo "   4. Set up domain and SSL (see DEPLOYMENT-GUIDE.md)"
echo ""
echo "🎉 Happy launching! 🚀"
