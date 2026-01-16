#!/bin/bash

# ============================================
# Environment Files Setup Script
# ============================================
# This script helps you create .env files with the correct values

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║          🔧 Environment Files Setup Wizard                            ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# ============================================
# Generate Random Secrets
# ============================================
echo "🔐 Generating secure random secrets..."

if command -v node &> /dev/null; then
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    echo "✅ Secrets generated"
else
    JWT_SECRET="PLEASE_CHANGE_THIS_TO_64_CHAR_HEX_STRING"
    ENCRYPTION_KEY="PLEASE_CHANGE_THIS_TO_64_CHAR_HEX_STRING"
    echo "⚠️  Node.js not found. Using placeholders."
fi

# ============================================
# Get Server IP
# ============================================
echo ""
echo "🌐 Detecting server IP..."

if command -v curl &> /dev/null; then
    SERVER_IP=$(curl -s ifconfig.me)
    echo "✅ Detected IP: $SERVER_IP"
else
    SERVER_IP="YOUR_SERVER_IP"
    echo "⚠️  Could not detect IP. Using placeholder."
fi

# ============================================
# Prompt for User Input
# ============================================
echo ""
echo "📝 Please provide the following information:"
echo ""

read -p "Admin Email (default: scott@mahapeps.com): " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-scott@mahapeps.com}

read -sp "Admin Password (default: Maddie1169!): " ADMIN_PASSWORD
echo ""
ADMIN_PASSWORD=${ADMIN_PASSWORD:-Maddie1169!}

read -p "Database Password (default: mahapeps_dev_password): " DB_PASSWORD
DB_PASSWORD=${DB_PASSWORD:-mahapeps_dev_password}

read -p "SMTP Email Provider (gmail/sendgrid/skip): " SMTP_PROVIDER
SMTP_PROVIDER=${SMTP_PROVIDER:-skip}

if [ "$SMTP_PROVIDER" = "gmail" ]; then
    read -p "Gmail Address: " SMTP_USER
    read -sp "Gmail App Password (from Google Account > Security): " SMTP_PASS
    echo ""
    SMTP_HOST="smtp.gmail.com"
    SMTP_PORT="587"
elif [ "$SMTP_PROVIDER" = "sendgrid" ]; then
    read -p "SendGrid API Key: " SMTP_PASS
    SMTP_HOST="smtp.sendgrid.net"
    SMTP_PORT="587"
    SMTP_USER="apikey"
else
    SMTP_HOST="smtp.example.com"
    SMTP_PORT="587"
    SMTP_USER="your-email@example.com"
    SMTP_PASS="your-smtp-password"
fi

# ============================================
# Create API .env File
# ============================================
echo ""
echo "📄 Creating apps/api/.env..."

cat > apps/api/.env << EOF
# ============================================
# Database
# ============================================
DATABASE_URL="postgresql://mahapeps:${DB_PASSWORD}@localhost:5432/mahapeps_dev"

# Redis (optional)
REDIS_URL="redis://localhost:6379/0"

# ============================================
# Security & Auth
# ============================================
JWT_SECRET="${JWT_SECRET}"
ENCRYPTION_KEY="${ENCRYPTION_KEY}"

# ============================================
# Admin Account
# ============================================
ADMIN_EMAIL="${ADMIN_EMAIL}"
ADMIN_PASSWORD="${ADMIN_PASSWORD}"

# ============================================
# Email / SMTP
# ============================================
SMTP_HOST="${SMTP_HOST}"
SMTP_PORT="${SMTP_PORT}"
SMTP_USER="${SMTP_USER}"
SMTP_PASS="${SMTP_PASS}"
SMTP_FROM="noreply@mahapeps.com"

# ============================================
# Payment Information
# ============================================
ZELLE_ID="payments@mahapeptides.com"
CASHAPP_TAG="\$MahaPeptides"

# ============================================
# URLs
# ============================================
API_BASE_URL="http://${SERVER_IP}:3001"
FRONTEND_URL="http://${SERVER_IP}:3002"
CORS_ORIGIN="http://${SERVER_IP}:3002"

# ============================================
# Optional Services (uncomment when ready)
# ============================================
# SHIPPO_API_KEY="your-shippo-api-key"
# STRIPE_SECRET_KEY="sk_live_..."
# STRIPE_PUBLISHABLE_KEY="pk_live_..."
# R2_ENDPOINT="https://account-id.r2.cloudflarestorage.com"
# R2_ACCESS_KEY_ID="your-r2-access-key"
# R2_SECRET_ACCESS_KEY="your-r2-secret-key"
EOF

echo "✅ Created apps/api/.env"

# ============================================
# Create Web .env.local File
# ============================================
echo "📄 Creating apps/web/.env.local..."

cat > apps/web/.env.local << EOF
# ============================================
# API Connection
# ============================================
NEXT_PUBLIC_API_BASE_URL="http://${SERVER_IP}:3001"

# ============================================
# Payment Information (Public)
# ============================================
NEXT_PUBLIC_ZELLE_ID="payments@mahapeptides.com"
NEXT_PUBLIC_CASHAPP_TAG="\$MahaPeptides"
EOF

echo "✅ Created apps/web/.env.local"

# ============================================
# Update docker-compose if needed
# ============================================
if [ "$DB_PASSWORD" != "mahapeps_dev_password" ]; then
    echo ""
    echo "⚠️  NOTE: You changed the database password."
    echo "   Make sure to update docker-compose.dev.yml:"
    echo "   POSTGRES_PASSWORD: ${DB_PASSWORD}"
fi

# ============================================
# Summary
# ============================================
echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║          ✅ ENVIRONMENT FILES CREATED!                                ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📁 Created files:"
echo "   ✅ apps/api/.env"
echo "   ✅ apps/web/.env.local"
echo ""
echo "🔐 Your secrets:"
echo "   JWT_SECRET: ${JWT_SECRET:0:16}..."
echo "   ENCRYPTION_KEY: ${ENCRYPTION_KEY:0:16}..."
echo ""
echo "📊 Configuration:"
echo "   Server IP: $SERVER_IP"
echo "   Admin Email: $ADMIN_EMAIL"
echo "   Database: postgresql://mahapeps:***@localhost:5432/mahapeps_dev"
echo "   SMTP: $SMTP_HOST"
echo ""
echo "⚠️  SECURITY WARNING:"
echo "   - These files contain sensitive information"
echo "   - They are gitignored and won't be committed"
echo "   - Keep them secure on your server"
echo ""
echo "🚀 Next Steps:"
echo "   1. Review the .env files to make sure everything is correct"
echo "   2. Run: ./deploy-to-production.sh"
echo ""
echo "Need to change something?"
echo "   Edit: nano apps/api/.env"
echo "   Edit: nano apps/web/.env.local"
echo ""
