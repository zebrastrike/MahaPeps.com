# 🚀 Quick Start - Deploy to Hetzner

## 📍 Understanding Environment Variables

### Where do .env files go?

```
┌─────────────────────────────────────────┐
│  YOUR HETZNER SERVER                    │
│                                         │
│  /root/MahaPeps.com/                    │
│  ├── apps/                              │
│  │   ├── api/                           │
│  │   │   └── .env  ← MOST IMPORTANT!   │
│  │   │              (Database, JWT,     │
│  │   │               Email, etc.)       │
│  │   │                                  │
│  │   └── web/                           │
│  │       └── .env.local  ← Minimal     │
│  │                        (Just API URL)│
│  │                                      │
│  └── docker-compose.dev.yml             │
│      └── Database config here           │
└─────────────────────────────────────────┘
```

**Simple Answer:**
- **API Server** (`apps/api/.env`) = 95% of config
- **Frontend** (`apps/web/.env.local`) = Just tells it where the API is
- **Database** = No .env needed, configured in docker-compose.yml

---

## 🎯 Two Ways to Deploy

### Option A: Automated (Recommended) ⚡

**Step 1:** SSH into your Hetzner server
```bash
ssh root@YOUR_HETZNER_IP
cd /root/MahaPeps.com
```

**Step 2:** Run the setup wizard (creates .env files for you)
```bash
./setup-env-files.sh
```
It will ask you for:
- Admin email/password
- Database password
- Email provider (Gmail is easiest)

**Step 3:** Run deployment script (does everything else)
```bash
./deploy-to-production.sh
```

**That's it!** Everything will be set up automatically.

---

### Option B: Manual (If you prefer control) 🔧

See [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) for detailed step-by-step instructions.

---

## 🔑 What Values Do You Need?

### From Your Hetzner Dashboard:
- ✅ Server IP address (you already have this)
- ✅ That's it! Everything else can be generated or uses defaults

### Generate Yourself:
```bash
# SSH into server and run:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output for JWT_SECRET

# Run again:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output for ENCRYPTION_KEY
```

### For Email (Choose One):

**Option 1: Gmail (Easiest for testing)**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password
5. Use that as your SMTP_PASS

**Option 2: SendGrid (Best for production)**
1. Sign up at sendgrid.com
2. Create API key
3. Use that as your SMTP_PASS

**Option 3: Skip for now**
- Emails will be logged to console instead
- Can add later

---

## 📋 Minimum Required Environment Variables

### apps/api/.env (Minimum to work):
```bash
DATABASE_URL="postgresql://mahapeps:mahapeps_dev_password@localhost:5432/mahapeps_dev"
JWT_SECRET="your-64-char-random-string"
ADMIN_EMAIL="scott@mahapeps.com"
ADMIN_PASSWORD="Maddie1169!"
API_BASE_URL="http://YOUR_IP:3001"
FRONTEND_URL="http://YOUR_IP:3002"
CORS_ORIGIN="http://YOUR_IP:3002"

# Email optional for now:
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### apps/web/.env.local:
```bash
NEXT_PUBLIC_API_BASE_URL="http://YOUR_IP:3001"
```

---

## ✅ After Deployment - Test Everything

### 1. Check if it's running:
```bash
# On your server:
pm2 status
```

### 2. Visit in browser:
```
http://YOUR_IP:3002
```

### 3. Test admin login:
```
http://YOUR_IP:3002/sign-in
```
Login with your ADMIN_EMAIL and ADMIN_PASSWORD

### 4. View products:
```
http://YOUR_IP:3002/products
```

Should see 28 products!

---

## 🆘 Quick Troubleshooting

### "Can't connect to database"
```bash
# Check if Docker is running:
docker ps

# Should see: mahapeps-postgres-dev

# Not running? Start it:
docker-compose -f docker-compose.dev.yml up -d
```

### "API won't start"
```bash
# Check the logs:
pm2 logs mahapeps-api

# Restart it:
pm2 restart mahapeps-api
```

### "Products not showing"
```bash
# Check if database is seeded:
cd /root/MahaPeps.com/apps/api
npx prisma studio
# Opens database viewer

# Or re-seed:
npm run seed:retail
```

### "Images not showing"
```bash
# Upload from your computer:
scp -r "C:/Users/keyse_pt9dxr4/MAHAPEPS/MahaPeps.com/apps/web/public/products" root@YOUR_IP:/root/MahaPeps.com/apps/web/public/
```

---

## 📚 Documentation Files

- **START-HERE.md** (this file) - Quick start
- **DEPLOYMENT-GUIDE.md** - Detailed deployment guide
- **SECURITY.md** - Security checklist
- **PRODUCTION-READY.md** - Launch readiness report
- **E2E-TESTS.md** - How to run tests

---

## 🎉 You're Ready!

The automated scripts will handle:
- ✅ Creating .env files with correct values
- ✅ Starting Docker database
- ✅ Installing dependencies
- ✅ Pushing database schema
- ✅ Seeding products (28 products)
- ✅ Seeding admin account
- ✅ Updating product images
- ✅ Building applications
- ✅ Starting with PM2
- ✅ Health checks

All you need to do:
1. SSH into server
2. Run `./setup-env-files.sh`
3. Run `./deploy-to-production.sh`
4. Visit your IP in browser!

---

**Questions? Check DEPLOYMENT-GUIDE.md for detailed explanations! 🚀**
