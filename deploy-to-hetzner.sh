#!/bin/bash

# ============================================
# Deploy MAHA Peptides to Hetzner Server
# ============================================
# This script helps you deploy everything to your Hetzner server
# Run from your LOCAL machine (Windows/WSL)

set -e  # Exit on any error

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║          🚀 MAHA Peptides Hetzner Deployment Helper                  ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# ============================================
# Get Server Information
# ============================================
echo "📝 Server Information"
echo ""

read -p "Enter your Hetzner server IP address: " SERVER_IP
read -p "SSH user (default: root): " SSH_USER
SSH_USER=${SSH_USER:-root}

read -p "SSH port (default: 22): " SSH_PORT
SSH_PORT=${SSH_PORT:-22}

echo ""
echo "Will deploy to: $SSH_USER@$SERVER_IP:$SSH_PORT"
read -p "Is this correct? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# ============================================
# Update .env files with server IP
# ============================================
echo ""
echo "🔧 Updating .env files with server IP..."

# Update API .env.production
sed -i "s/YOUR_HETZNER_IP/$SERVER_IP/g" apps/api/.env.production

# Update Web .env.production
sed -i "s/YOUR_HETZNER_IP/$SERVER_IP/g" apps/web/.env.production

echo "✅ Environment files updated"

# ============================================
# Test SSH Connection
# ============================================
echo ""
echo "🔐 Testing SSH connection..."

if ssh -p $SSH_PORT -o ConnectTimeout=5 $SSH_USER@$SERVER_IP "echo 'Connection successful'" 2>/dev/null; then
    echo "✅ SSH connection successful"
else
    echo "❌ ERROR: Cannot connect to server via SSH"
    echo ""
    echo "Make sure:"
    echo "  1. Your Hetzner server is running"
    echo "  2. SSH is enabled"
    echo "  3. Your SSH key is added to the server"
    echo "  4. The IP address is correct"
    echo ""
    echo "To add your SSH key to the server:"
    echo "  ssh-copy-id -p $SSH_PORT $SSH_USER@$SERVER_IP"
    exit 1
fi

# ============================================
# Push Code to Server
# ============================================
echo ""
echo "📤 Option 1: Push via Git"
echo "   - Commit your changes"
echo "   - Push to GitHub"
echo "   - SSH into server and pull"
echo ""
echo "📤 Option 2: Direct SCP Upload (slower but works without git)"
echo ""

read -p "Choose method (1=git, 2=scp): " DEPLOY_METHOD

if [ "$DEPLOY_METHOD" = "1" ]; then
    echo ""
    echo "📝 Git Deployment Instructions:"
    echo ""
    echo "1. On your LOCAL machine:"
    echo "   git add ."
    echo "   git commit -m 'Production deployment'"
    echo "   git push origin main"
    echo ""
    echo "2. On your HETZNER server:"
    echo "   ssh $SSH_USER@$SERVER_IP"
    echo "   cd /root/MahaPeps.com"
    echo "   git pull origin main"
    echo ""
    read -p "Press Enter when you've completed these steps..."

elif [ "$DEPLOY_METHOD" = "2" ]; then
    echo ""
    echo "📤 Uploading code via SCP..."

    # Create temp directory for upload
    TEMP_DIR="/tmp/mahapeps-deploy"

    # SCP the entire project
    echo "   Uploading files (this may take a few minutes)..."
    rsync -avz --progress \
        --exclude 'node_modules' \
        --exclude '.next' \
        --exclude 'dist' \
        --exclude '.git' \
        --exclude 'postgres_data' \
        --exclude 'redis_data' \
        -e "ssh -p $SSH_PORT" \
        . $SSH_USER@$SERVER_IP:/root/MahaPeps.com/

    echo "✅ Code uploaded"
else
    echo "❌ Invalid choice"
    exit 1
fi

# ============================================
# Deploy .env files
# ============================================
echo ""
echo "🔐 Deploying environment files..."

# Copy API .env
scp -P $SSH_PORT apps/api/.env.production $SSH_USER@$SERVER_IP:/root/MahaPeps.com/apps/api/.env
echo "✅ API .env deployed"

# Copy Web .env
scp -P $SSH_PORT apps/web/.env.production $SSH_USER@$SERVER_IP:/root/MahaPeps.com/apps/web/.env.local
echo "✅ Web .env deployed"

# ============================================
# Upload Product Images
# ============================================
echo ""
echo "🖼️  Uploading product images..."

if [ -d "apps/web/public/products" ]; then
    IMAGE_COUNT=$(find apps/web/public/products -name "*.png" | wc -l)
    echo "   Found $IMAGE_COUNT product images"

    if [ "$IMAGE_COUNT" -gt 0 ]; then
        scp -P $SSH_PORT -r apps/web/public/products $SSH_USER@$SERVER_IP:/root/MahaPeps.com/apps/web/public/
        echo "✅ Product images uploaded"
    else
        echo "⚠️  No product images found"
    fi
else
    echo "⚠️  Products folder not found"
fi

# ============================================
# Run Deployment on Server
# ============================================
echo ""
echo "🚀 Running deployment on server..."
echo ""

# Create deployment script on server
ssh -p $SSH_PORT $SSH_USER@$SERVER_IP 'bash -s' << 'ENDSSH'
#!/bin/bash
set -e

cd /root/MahaPeps.com

echo "═══════════════════════════════════════════════"
echo "  Running Deployment on Hetzner Server"
echo "═══════════════════════════════════════════════"
echo ""

# Start Docker
echo "🐳 Starting Docker services..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.dev.yml up -d
else
    docker compose -f docker-compose.dev.yml up -d
fi
sleep 5

# Install API dependencies
echo ""
echo "📦 Installing API dependencies..."
cd apps/api
npm install

# Setup database
echo ""
echo "🗄️  Setting up database..."
npx prisma generate
npx prisma db push --skip-generate

# Seed database
echo ""
echo "🌱 Seeding database..."
npm run seed:admin
npm run seed:retail
npm run seed:images
npm run seed:batches
npm run seed:content || true

# Build API
echo ""
echo "🔨 Building API..."
npm run build

# Install Web dependencies
echo ""
echo "📦 Installing Web dependencies..."
cd ../web
npm install

# Build Web
echo ""
echo "🔨 Building Web..."
npm run build

# Setup PM2
echo ""
echo "⚙️  Setting up PM2..."
cd /root/MahaPeps.com

if ! command -v pm2 &> /dev/null; then
    echo "   Installing PM2..."
    npm install -g pm2
fi

# Stop existing processes
pm2 delete mahapeps-api mahapeps-web 2>/dev/null || true

# Start API
echo "   Starting API..."
cd apps/api
pm2 start npm --name "mahapeps-api" -- run start:prod

# Start Web
echo "   Starting Web..."
cd ../web
pm2 start npm --name "mahapeps-web" -- run start

# Save PM2 config
pm2 save
pm2 startup

echo ""
echo "═══════════════════════════════════════════════"
echo "  ✅ Deployment Complete!"
echo "═══════════════════════════════════════════════"

# Show status
pm2 status

ENDSSH

# ============================================
# Verify Deployment
# ============================================
echo ""
echo "🏥 Verifying deployment..."
sleep 5

echo "   Checking API health..."
if curl -f http://$SERVER_IP:3001/auth/health 2>/dev/null; then
    echo "   ✅ API is healthy"
else
    echo "   ⚠️  API not responding yet (may still be starting)"
fi

echo "   Checking frontend..."
if curl -f http://$SERVER_IP:3000 2>/dev/null | head -c 100 > /dev/null; then
    echo "   ✅ Frontend is running"
else
    echo "   ⚠️  Frontend not responding yet (may still be starting)"
fi

# ============================================
# Success!
# ============================================
echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║          ✅ DEPLOYMENT SUCCESSFUL!                                    ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Your site is now live at:"
echo ""
echo "   Frontend:  http://$SERVER_IP:3000"
echo "   API:       http://$SERVER_IP:3001"
echo "   Admin:     http://$SERVER_IP:3000/sign-in"
echo ""
echo "   (After Nginx/Cloudflare setup: https://mahapeps.com)"
echo ""
echo "🔑 Admin Login:"
echo "   Email:     scott@mahapeps.com"
echo "   Password:  <CHANGE_ME_ADMIN_PASSWORD>"
echo ""
echo "📊 Useful SSH Commands:"
echo "   ssh $SSH_USER@$SERVER_IP"
echo "   pm2 status"
echo "   pm2 logs"
echo "   pm2 restart all"
echo ""
echo "🎉 Happy launching! 🚀"
echo ""
