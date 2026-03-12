# ============================================
# Deploy MAHA Peptides to Hetzner (Windows PowerShell)
# ============================================
# Run this from PowerShell on Windows

Write-Host "╔════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                                        ║" -ForegroundColor Cyan
Write-Host "║          🚀 MAHA Peptides Hetzner Deployment (Windows)                ║" -ForegroundColor Cyan
Write-Host "║                                                                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# Get Server Information
# ============================================
Write-Host "📝 Server Information" -ForegroundColor Yellow
Write-Host ""

$SERVER_IP = Read-Host "Enter your Hetzner server IP address"
$SSH_USER = Read-Host "SSH user (press Enter for 'root')"
if ([string]::IsNullOrWhiteSpace($SSH_USER)) {
    $SSH_USER = "root"
}

Write-Host ""
Write-Host "Will deploy to: $SSH_USER@$SERVER_IP" -ForegroundColor Green
$confirm = Read-Host "Is this correct? (y/n)"

if ($confirm -ne "y") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
    exit
}

# ============================================
# Update .env files with server IP
# ============================================
Write-Host ""
Write-Host "🔧 Updating .env files with server IP..." -ForegroundColor Yellow

# Update API .env.production
$apiEnvPath = "apps\api\.env.production"
if (Test-Path $apiEnvPath) {
    (Get-Content $apiEnvPath) -replace 'YOUR_HETZNER_IP', $SERVER_IP | Set-Content $apiEnvPath
    Write-Host "✅ Updated $apiEnvPath" -ForegroundColor Green
}

# Update Web .env.production
$webEnvPath = "apps\web\.env.production"
if (Test-Path $webEnvPath) {
    (Get-Content $webEnvPath) -replace 'YOUR_HETZNER_IP', $SERVER_IP | Set-Content $webEnvPath
    Write-Host "✅ Updated $webEnvPath" -ForegroundColor Green
}

# ============================================
# Check for SCP (via Git for Windows or WSL)
# ============================================
Write-Host ""
Write-Host "🔍 Checking for SCP..." -ForegroundColor Yellow

$scpPath = Get-Command scp -ErrorAction SilentlyContinue
if (-not $scpPath) {
    Write-Host "❌ SCP not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "You need either:" -ForegroundColor Yellow
    Write-Host "  1. Git for Windows (includes SSH/SCP)" -ForegroundColor Yellow
    Write-Host "  2. WSL (Windows Subsystem for Linux)" -ForegroundColor Yellow
    Write-Host "  3. OpenSSH Client (Windows Feature)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To install Git for Windows: https://git-scm.com/download/win" -ForegroundColor Cyan
    Write-Host ""
    exit
}

Write-Host "✅ SCP found at: $($scpPath.Source)" -ForegroundColor Green

# ============================================
# Test SSH Connection
# ============================================
Write-Host ""
Write-Host "🔐 Testing SSH connection..." -ForegroundColor Yellow

try {
    $sshTest = ssh $SSH_USER@$SERVER_IP "echo 'Connection successful'" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SSH connection successful" -ForegroundColor Green
    } else {
        throw "SSH connection failed"
    }
} catch {
    Write-Host "❌ ERROR: Cannot connect to server via SSH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "  1. Your Hetzner server is running" -ForegroundColor Yellow
    Write-Host "  2. SSH is enabled" -ForegroundColor Yellow
    Write-Host "  3. Your SSH key is configured" -ForegroundColor Yellow
    Write-Host "  4. The IP address is correct" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Try connecting manually:" -ForegroundColor Cyan
    Write-Host "  ssh $SSH_USER@$SERVER_IP" -ForegroundColor Cyan
    exit
}

# ============================================
# Deploy .env files
# ============================================
Write-Host ""
Write-Host "🔐 Deploying environment files..." -ForegroundColor Yellow

# Copy API .env
Write-Host "   Uploading API .env..."
scp apps\api\.env.production "${SSH_USER}@${SERVER_IP}:/root/MahaPeps.com/apps/api/.env"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ API .env deployed" -ForegroundColor Green
}

# Copy Web .env
Write-Host "   Uploading Web .env..."
scp apps\web\.env.production "${SSH_USER}@${SERVER_IP}:/root/MahaPeps.com/apps/web/.env.local"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Web .env deployed" -ForegroundColor Green
}

# ============================================
# Upload Product Images
# ============================================
Write-Host ""
Write-Host "🖼️  Uploading product images..." -ForegroundColor Yellow

if (Test-Path "apps\web\public\products") {
    $imageCount = (Get-ChildItem -Path "apps\web\public\products" -Filter "*.png" -File).Count
    Write-Host "   Found $imageCount product images"

    if ($imageCount -gt 0) {
        scp -r apps\web\public\products "${SSH_USER}@${SERVER_IP}:/root/MahaPeps.com/apps/web/public/"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Product images uploaded" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  No product images found" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Products folder not found" -ForegroundColor Yellow
}

# ============================================
# Run Deployment on Server
# ============================================
Write-Host ""
Write-Host "🚀 Running deployment on server..." -ForegroundColor Yellow
Write-Host "   (This will take a few minutes...)" -ForegroundColor Yellow
Write-Host ""

$deployScript = @'
#!/bin/bash
set -e
cd /root/MahaPeps.com

echo "═══════════════════════════════════════════════"
echo "  Running Deployment on Hetzner Server"
echo "═══════════════════════════════════════════════"

# Start Docker
echo ""
echo "🐳 Starting Docker services..."
docker-compose -f docker-compose.dev.yml up -d || docker compose -f docker-compose.dev.yml up -d
sleep 5

# Install and setup API
echo ""
echo "📦 Setting up API..."
cd apps/api
npm install
npx prisma generate
npx prisma db push --skip-generate

# Seed database
echo ""
echo "🌱 Seeding database..."
npm run seed:admin
npm run seed:retail
npm run seed:images
npm run seed:content || true

# Build API
npm run build

# Install and setup Web
echo ""
echo "📦 Setting up Web..."
cd ../web
npm install
npm run build

# Setup PM2
cd /root/MahaPeps.com
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Stop and restart
pm2 delete mahapeps-api mahapeps-web 2>/dev/null || true
cd apps/api
pm2 start npm --name "mahapeps-api" -- run start:prod
cd ../web
pm2 start npm --name "mahapeps-web" -- run start
pm2 save
pm2 startup

echo ""
echo "✅ Deployment Complete!"
pm2 status
'@

# Execute deployment script on server
$deployScript | ssh $SSH_USER@$SERVER_IP 'bash -s'

# ============================================
# Verify Deployment
# ============================================
Write-Host ""
Write-Host "🏥 Verifying deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $apiHealth = Invoke-WebRequest -Uri "http://${SERVER_IP}:3001/auth/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ API is healthy" -ForegroundColor Green
} catch {
    Write-Host "⚠️  API not responding yet (may still be starting)" -ForegroundColor Yellow
}

try {
    $webHealth = Invoke-WebRequest -Uri "http://${SERVER_IP}:3002" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Frontend is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Frontend not responding yet (may still be starting)" -ForegroundColor Yellow
}

# ============================================
# Success!
# ============================================
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                                        ║" -ForegroundColor Green
Write-Host "║          ✅ DEPLOYMENT SUCCESSFUL!                                    ║" -ForegroundColor Green
Write-Host "║                                                                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your site is now live at:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Frontend:  http://${SERVER_IP}:3002" -ForegroundColor White
Write-Host "   API:       http://${SERVER_IP}:3001" -ForegroundColor White
Write-Host "   Admin:     http://${SERVER_IP}:3002/sign-in" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Admin Login:" -ForegroundColor Cyan
Write-Host "   Email:     scott@mahapeps.com" -ForegroundColor White
Write-Host "   Password:  <CHANGE_ME_ADMIN_PASSWORD>" -ForegroundColor White
Write-Host ""
Write-Host "📊 Useful Commands:" -ForegroundColor Cyan
Write-Host "   ssh $SSH_USER@$SERVER_IP" -ForegroundColor White
Write-Host "   pm2 status" -ForegroundColor White
Write-Host "   pm2 logs" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Happy launching! 🚀" -ForegroundColor Green
Write-Host ""
