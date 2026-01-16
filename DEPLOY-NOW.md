# 🚀 Deploy to Hetzner - Simple Guide

## ✅ What's Ready

I've created **production-ready .env files** with all your **REAL** values:

### Files Created:
1. **[apps/api/.env.production](apps/api/.env.production)** - API server config (90% of settings)
2. **[apps/web/.env.production](apps/web/.env.production)** - Frontend config (minimal)
3. **[deploy-to-hetzner.sh](deploy-to-hetzner.sh)** - Automated deployment script

### Real Values Included:
✅ **Admin Account**
- Email: `scott@mahapeps.com`
- Password: `Maddie1169!`

✅ **Email (Mailgun) - WORKING**
- API Key: `7872b65e5aa11ef85f779e027dcdf9aa-42b8ce75-5ff82429`
- Domain: `mg.mahapeps.com`

✅ **Payment Info**
- Zelle: `payments@mahapeps.com`
- CashApp: `$MahaPeps`

✅ **Shippo (Shipping)**
- Test API Key: `shippo_test_ed88ffd4b385895423c9a5580071e28e69abb458`

✅ **Security**
- JWT Secret: Generated secure 64-char key
- Encryption Key: Generated secure 64-char key

✅ **Database**
- PostgreSQL connection ready for Docker

---

## 🎯 Three Ways to Deploy

### Option 1: Automated Script (Easiest) ⚡

**From WSL/Git Bash on Windows:**

```bash
./deploy-to-hetzner.sh
```

The script will:
1. Ask for your Hetzner server IP
2. Test SSH connection
3. Upload all files
4. Deploy .env files with real values
5. Upload product images
6. Set up database
7. Seed products
8. Start servers with PM2

**That's it! Everything automated.**

---

### Option 2: Manual SSH Deployment 🔧

If you prefer to do it manually:

#### Step 1: Connect to Hetzner
```bash
ssh root@YOUR_HETZNER_IP
```

#### Step 2: Clone or Update Code
```bash
# If first time:
cd /root
git clone https://github.com/zebrastrike/MahaPeps.com.git
cd MahaPeps.com

# If updating:
cd /root/MahaPeps.com
git pull origin main
```

#### Step 3: Copy .env Files

**From your LOCAL machine:**
```bash
# Copy API .env
scp apps/api/.env.production root@YOUR_IP:/root/MahaPeps.com/apps/api/.env

# Copy Web .env
scp apps/web/.env.production root@YOUR_IP:/root/MahaPeps.com/apps/web/.env.local

# Copy product images
scp -r apps/web/public/products root@YOUR_IP:/root/MahaPeps.com/apps/web/public/
```

#### Step 4: Update IP Addresses

**On Hetzner server:**
```bash
cd /root/MahaPeps.com/apps/api

# Replace YOUR_HETZNER_IP with actual IP in .env file:
nano .env
# Find and replace: YOUR_HETZNER_IP → your actual IP
# Ctrl+X, Y, Enter to save

cd ../web
nano .env.local
# Same - replace YOUR_HETZNER_IP
```

#### Step 5: Run Deployment
```bash
cd /root/MahaPeps.com
./deploy-to-production.sh
```

---

### Option 3: Quick Test (Development Mode) 🧪

Just want to test before full production deployment?

**On Hetzner:**
```bash
cd /root/MahaPeps.com

# Start database
docker-compose -f docker-compose.dev.yml up -d

# Start API
cd apps/api
npm install
npx prisma generate
npx prisma db push
npm run seed:admin
npm run seed:retail
npm run seed:images
npm run dev  # Runs on port 3001

# In another terminal, start web:
cd apps/web
npm install
npm run dev  # Runs on port 3002
```

Visit: `http://YOUR_IP:3002`

---

## 🔧 Before You Start

### What You Need:

1. **Hetzner Server IP Address**
   - Find in Hetzner Cloud Console
   - Example: `95.217.xxx.xxx`

2. **SSH Access**
   - Make sure you can: `ssh root@YOUR_IP`
   - If not, add your SSH key:
     ```bash
     ssh-copy-id root@YOUR_IP
     ```

3. **This Repository**
   - Already on your computer ✅

---

## 📝 Update IP Addresses

The .env files have `YOUR_HETZNER_IP` as a placeholder.

### Option A: Let the script do it
Run `./deploy-to-hetzner.sh` - it will ask for your IP and update automatically

### Option B: Manual find/replace

**In apps/api/.env.production:**
```bash
# Find:
FRONTEND_URL="http://YOUR_HETZNER_IP:3002"
API_BASE_URL="http://YOUR_HETZNER_IP:3001"
CORS_ORIGIN="http://YOUR_HETZNER_IP:3002"

# Replace YOUR_HETZNER_IP with your actual IP:
FRONTEND_URL="http://95.217.xxx.xxx:3002"
API_BASE_URL="http://95.217.xxx.xxx:3001"
CORS_ORIGIN="http://95.217.xxx.xxx:3002"
```

**In apps/web/.env.production:**
```bash
# Find:
NEXT_PUBLIC_API_BASE_URL="http://YOUR_HETZNER_IP:3001"

# Replace with:
NEXT_PUBLIC_API_BASE_URL="http://95.217.xxx.xxx:3001"
```

---

## ✅ After Deployment - Verify

1. **Check Site is Live:**
   - Frontend: `http://YOUR_IP:3002`
   - Should see MAHA Peptides homepage

2. **Test Products Page:**
   - Go to: `http://YOUR_IP:3002/products`
   - Should see 28 products with images

3. **Test Admin Login:**
   - Go to: `http://YOUR_IP:3002/sign-in`
   - Email: `scott@mahapeps.com`
   - Password: `Maddie1169!`
   - Should redirect to admin dashboard

4. **Check API:**
   ```bash
   curl http://YOUR_IP:3001/auth/health
   # Should return: {"status":"ok"}
   ```

5. **SSH and Check PM2:**
   ```bash
   ssh root@YOUR_IP
   pm2 status
   # Should show: mahapeps-api and mahapeps-web running
   ```

---

## 🐛 Troubleshooting

### "Cannot connect to server"
```bash
# Check if server is running:
ping YOUR_IP

# Check SSH access:
ssh root@YOUR_IP

# Add SSH key if needed:
ssh-copy-id root@YOUR_IP
```

### "API not responding"
```bash
ssh root@YOUR_IP
pm2 logs mahapeps-api
# Check for errors
```

### "Database connection failed"
```bash
ssh root@YOUR_IP
docker ps
# Should see: mahapeps-postgres-dev

# If not running:
docker-compose -f docker-compose.dev.yml up -d
```

### "Products not showing"
```bash
# Re-seed database:
ssh root@YOUR_IP
cd /root/MahaPeps.com/apps/api
npm run seed:retail
npm run seed:images
```

### "Images not loading"
```bash
# Upload images again:
scp -r apps/web/public/products root@YOUR_IP:/root/MahaPeps.com/apps/web/public/
```

---

## 🎯 Quick Commands Reference

### Deploy Everything:
```bash
./deploy-to-hetzner.sh
```

### SSH into Server:
```bash
ssh root@YOUR_HETZNER_IP
```

### Check Status:
```bash
ssh root@YOUR_IP "pm2 status"
```

### View Logs:
```bash
ssh root@YOUR_IP "pm2 logs"
```

### Restart Services:
```bash
ssh root@YOUR_IP "pm2 restart all"
```

### Update Code:
```bash
ssh root@YOUR_IP "cd /root/MahaPeps.com && git pull && pm2 restart all"
```

---

## 📞 Your Credentials Summary

All stored in the `.env.production` files:

**Admin Login:**
- Email: scott@mahapeps.com
- Password: Maddie1169!

**Database:**
- postgresql://mahapeps:mahapeps_prod_password@localhost:5432/mahapeps_prod

**Email (Mailgun):**
- API Key: 7872b65e5aa11ef85f779e027dcdf9aa-42b8ce75-5ff82429
- Domain: mg.mahapeps.com

**Payment Display:**
- Zelle: payments@mahapeps.com
- CashApp: $MahaPeps

**Shippo Shipping:**
- Test Key: shippo_test_ed88ffd4b385895423c9a5580071e28e69abb458

---

## 🚀 Ready to Go!

Everything is configured with real values. Just need to:

1. Run `./deploy-to-hetzner.sh`
2. Enter your Hetzner IP when prompted
3. Wait for deployment to complete
4. Visit `http://YOUR_IP:3002`

**That's it! Your site will be live!** 🎉
