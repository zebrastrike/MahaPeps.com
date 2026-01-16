# 🚀 Production Deployment Guide - MAHA Peptides

## 📍 Where Do Environment Variables Go?

### API Server (.env) - **MOST IMPORTANT**
The API server needs the majority of environment variables:
- Database connection
- JWT secrets
- Email/SMTP settings
- Payment processor keys
- Admin credentials
- File storage keys

**Location on Hetzner:** `/root/MahaPeps.com/apps/api/.env`

### Frontend (.env.local) - **MINIMAL**
The frontend only needs:
- API URL (to know where to send requests)
- Public payment info (Zelle/CashApp for display)

**Location on Hetzner:** `/root/MahaPeps.com/apps/web/.env.local`

### Database Server - **NO .env NEEDED**
The database runs in Docker and gets its config from `docker-compose.yml`

---

## 🔑 Complete Environment Variables Setup

### 1. API Server Environment Variables

Create `/root/MahaPeps.com/apps/api/.env` on your Hetzner server:

```bash
# ============================================
# DATABASE (Get from Hetzner Docker setup)
# ============================================
# If using local Docker PostgreSQL:
DATABASE_URL="postgresql://mahapeps:mahapeps_dev_password@localhost:5432/mahapeps_dev"

# If using managed database from Hetzner:
# DATABASE_URL="postgresql://username:password@db-host.hetzner.cloud:5432/mahapeps_prod"

# Redis (optional, for caching/sessions)
REDIS_URL="redis://localhost:6379/0"

# ============================================
# SECURITY & AUTH
# ============================================
# Generate these with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="GENERATE_A_RANDOM_64_CHAR_HEX_STRING_HERE"
ENCRYPTION_KEY="GENERATE_ANOTHER_64_CHAR_HEX_STRING_HERE"

# ============================================
# ADMIN ACCOUNT (Your credentials)
# ============================================
ADMIN_EMAIL="scott@mahapeps.com"
ADMIN_PASSWORD="Maddie1169!"  # Change this to something stronger!

# ============================================
# EMAIL / SMTP
# ============================================
# Option 1: Use Gmail (easy for testing)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"  # Get from Google Account > Security > App Passwords
SMTP_FROM="noreply@mahapeps.com"

# Option 2: Use SendGrid (recommended for production)
# SMTP_HOST="smtp.sendgrid.net"
# SMTP_PORT="587"
# SMTP_USER="apikey"
# SMTP_PASS="SG.your-sendgrid-api-key-here"
# SMTP_FROM="noreply@mahapeps.com"

# Option 3: Use Mailgun
# MAILGUN_API_KEY="your-mailgun-api-key"
# MAILGUN_DOMAIN="mg.mahapeps.com"
# MAILGUN_FROM_EMAIL="noreply@mahapeps.com"

# ============================================
# PAYMENT INFORMATION
# ============================================
ZELLE_ID="payments@mahapeptides.com"
CASHAPP_TAG="$MahaPeptides"

# Shippo (for shipping labels - can skip initially)
# SHIPPO_API_KEY="shippo_test_..."
# SHIPPO_RETURN_ADDRESS_ID="your-address-id"

# Stripe (if using for payments - can skip initially)
# STRIPE_SECRET_KEY="sk_live_..."
# STRIPE_PUBLISHABLE_KEY="pk_live_..."

# ============================================
# URLS (Update with your actual domain)
# ============================================
# For now, use your Hetzner IP:
API_BASE_URL="http://YOUR_HETZNER_IP:3001"
FRONTEND_URL="http://YOUR_HETZNER_IP:3002"

# Later when you have domain:
# API_BASE_URL="https://api.mahapeps.com"
# FRONTEND_URL="https://mahapeps.com"

# ============================================
# CORS (Add your domain when ready)
# ============================================
CORS_ORIGIN="http://YOUR_HETZNER_IP:3002"
# CORS_ORIGIN="https://mahapeps.com"

# ============================================
# FILE STORAGE (Optional - Cloudflare R2)
# ============================================
# R2_ENDPOINT="https://account-id.r2.cloudflarestorage.com"
# R2_ACCESS_KEY_ID="your-r2-access-key"
# R2_SECRET_ACCESS_KEY="your-r2-secret-key"
# R2_KYC_BUCKET="mahapeps-kyc-private"
# R2_COA_BUCKET="mahapeps-coa-private"
```

### 2. Frontend Environment Variables

Create `/root/MahaPeps.com/apps/web/.env.local` on your Hetzner server:

```bash
# Point to your API server
NEXT_PUBLIC_API_BASE_URL="http://YOUR_HETZNER_IP:3001"

# Payment info (displayed on payment pages)
NEXT_PUBLIC_ZELLE_ID="payments@mahapeptides.com"
NEXT_PUBLIC_CASHAPP_TAG="$MahaPeptides"
```

---

## 🔧 How to Get Each Value

### Database URL
```bash
# If using Docker on Hetzner (from docker-compose.dev.yml):
DATABASE_URL="postgresql://mahapeps:mahapeps_dev_password@localhost:5432/mahapeps_dev"

# The format is:
# postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

### JWT Secret & Encryption Key
```bash
# SSH into your Hetzner server and run:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output - use it for JWT_SECRET

# Run again for ENCRYPTION_KEY:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### SMTP for Gmail (Easy Option)
1. Go to Google Account Settings
2. Security → 2-Step Verification
3. App Passwords → Generate password
4. Use that 16-character password as `SMTP_PASS`

### Your Hetzner IP
```bash
# On Hetzner Cloud Console, find your server IP
# Or SSH in and run:
curl -4 ifconfig.me
```

---

## 📦 Step-by-Step Deployment to Hetzner

### Step 1: Connect to Your Hetzner Server
```bash
ssh root@YOUR_HETZNER_IP
```

### Step 2: Navigate to Your Project
```bash
cd /root/MahaPeps.com
```

### Step 3: Pull Latest Code (if using git)
```bash
git pull origin main
```

### Step 4: Create Environment Files

#### API .env file:
```bash
cd apps/api
nano .env
# Paste the API environment variables from above
# Press Ctrl+X, then Y, then Enter to save
```

#### Frontend .env.local file:
```bash
cd ../web
nano .env.local
# Paste the frontend environment variables from above
# Press Ctrl+X, then Y, then Enter to save
```

### Step 5: Start Docker Database
```bash
cd /root/MahaPeps.com
docker-compose -f docker-compose.dev.yml up -d
```

### Step 6: Install Dependencies
```bash
cd apps/api
npm install

cd ../web
npm install
```

### Step 7: Push Database Schema & Seed Data
```bash
cd /root/MahaPeps.com/apps/api

# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed admin account
npm run seed:admin

# Seed retail products catalog
npm run seed:retail

# Update product images in DB
npm run seed:images

# Seed FAQ content
npm run seed:content
```

### Step 8: Upload Product Images to Server

**Option A: From your local machine, upload images to server:**
```bash
# On your LOCAL machine (Windows):
scp -r "C:/Users/keyse_pt9dxr4/MAHAPEPS/MahaPeps.com/apps/web/public/products" root@YOUR_HETZNER_IP:/root/MahaPeps.com/apps/web/public/
```

**Option B: Already on server? Copy from your repo:**
```bash
# If images are in your git repo, they're already there after git pull
# Just verify:
ls -la /root/MahaPeps.com/apps/web/public/products/
```

### Step 9: Start the API Server
```bash
cd /root/MahaPeps.com/apps/api

# For development (with auto-reload):
npm run start:dev

# OR for production:
npm run build
npm run start:prod
```

### Step 10: Start the Frontend Server
```bash
# Open a new SSH terminal or use screen/tmux
cd /root/MahaPeps.com/apps/web

# For development:
npm run dev

# OR for production:
npm run build
npm run start
```

---

## 🔄 Using PM2 for Production (Recommended)

Instead of running servers manually, use PM2 to keep them running:

### Install PM2
```bash
npm install -g pm2
```

### Start API with PM2
```bash
cd /root/MahaPeps.com/apps/api
pm2 start npm --name "mahapeps-api" -- run start:prod
```

### Start Frontend with PM2
```bash
cd /root/MahaPeps.com/apps/web
pm2 start npm --name "mahapeps-web" -- run start
```

### Save PM2 Configuration
```bash
pm2 save
pm2 startup
```

### Useful PM2 Commands
```bash
pm2 status          # See running apps
pm2 logs            # View logs
pm2 restart all     # Restart all apps
pm2 stop all        # Stop all apps
pm2 delete all      # Remove all apps
```

---

## ✅ Verification Checklist

After deployment, verify everything works:

### 1. Check API is Running
```bash
curl http://YOUR_HETZNER_IP:3001/auth/health
# Should return: {"status":"ok"}
```

### 2. Check Products Endpoint
```bash
curl http://YOUR_HETZNER_IP:3001/catalog/products
# Should return JSON array of products
```

### 3. Check Frontend is Accessible
Open browser: `http://YOUR_HETZNER_IP:3002`
- Home page loads ✓
- Products page loads ✓
- Can view product details ✓

### 4. Test Admin Login
Go to: `http://YOUR_HETZNER_IP:3002/sign-in`
- Login with ADMIN_EMAIL and ADMIN_PASSWORD
- Should redirect to `/admin`
- Can view orders ✓

### 5. Run E2E Tests (Optional)
```bash
cd /root/MahaPeps.com/apps/api
node e2e-test.js
# All 15 tests should pass
```

---

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check if PostgreSQL is running:
docker ps

# Check database logs:
docker logs mahapeps-postgres-dev

# Test connection:
cd /root/MahaPeps.com/apps/api
npx prisma db pull
```

### API Won't Start
```bash
# Check for errors:
cd /root/MahaPeps.com/apps/api
npm run start:dev

# Check if port 3001 is already in use:
lsof -i :3001
# Kill the process if needed:
kill -9 PID
```

### Frontend Won't Start
```bash
# Check for errors:
cd /root/MahaPeps.com/apps/web
npm run dev

# Check if port 3002 is already in use:
lsof -i :3002
```

### Images Not Showing
```bash
# Verify images exist:
ls -la /root/MahaPeps.com/apps/web/public/products/

# Check Next.js is serving static files:
curl http://YOUR_HETZNER_IP:3002/products/semaglutide.png

# Permissions issue? Fix with:
chmod -R 755 /root/MahaPeps.com/apps/web/public/products/
```

---

## 🌐 Next Steps: Domain & SSL

Once everything works on IP, set up your domain:

### 1. Point Domain to Hetzner
In your domain registrar (Namecheap, GoDaddy, etc.):
```
A Record: api.mahapeps.com → YOUR_HETZNER_IP
A Record: mahapeps.com → YOUR_HETZNER_IP
A Record: www.mahapeps.com → YOUR_HETZNER_IP
```

### 2. Install Nginx
```bash
apt update
apt install nginx
```

### 3. Install Certbot for SSL
```bash
apt install certbot python3-certbot-nginx
```

### 4. Get SSL Certificates
```bash
certbot --nginx -d mahapeps.com -d www.mahapeps.com -d api.mahapeps.com
```

### 5. Update Environment Variables
Update `.env` files to use HTTPS URLs instead of HTTP/IP

---

## 📞 Need Help?

If you get stuck, check:
1. Server logs: `pm2 logs`
2. Database logs: `docker logs mahapeps-postgres-dev`
3. Application errors in terminal output

Common issues are usually:
- Wrong DATABASE_URL format
- Missing environment variables
- Port already in use
- File permissions

---

**Ready to deploy? Follow steps 1-10 above! 🚀**
