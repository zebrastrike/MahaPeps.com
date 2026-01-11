# 🚀 START HERE - Run MahaPeps Locally

## Open 3 Terminals and Run These Commands:

### Terminal 1: Start Docker Services
```powershell
# Start PostgreSQL + Redis (keeps running)
docker compose -f docker-compose.dev.yml up
```
**Leave this running** - You'll see database logs

---

### Terminal 2: Start Backend API
```powershell
# Navigate to backend
cd apps/api

# First time only - install and setup
npm install
npx prisma generate
npx prisma migrate dev

# Start backend server
npm run start:dev
```
**Leave this running** - Wait for: `Application is running on: http://localhost:3001`

---

### Terminal 3: Start Frontend
```powershell
# Navigate to frontend
cd apps/web

# First time only - install
npm install

# Start frontend server
npm run dev
```
**Leave this running** - Wait for: `Local: http://localhost:3000`

---

## ✅ Open Browser: http://localhost:3000

---

## 🛑 To Stop Everything:

1. Press `Ctrl+C` in Terminal 2 (backend)
2. Press `Ctrl+C` in Terminal 3 (frontend)
3. Press `Ctrl+C` in Terminal 1 (docker) then run:
```powershell
docker compose -f docker-compose.dev.yml down
```

---

## ⚠️ FIRST TIME SETUP:

Before starting, create these files:

**1. Create `apps/api/.env`:**
```powershell
cd apps/api
copy .env.example .env
```

Edit `apps/api/.env` with these minimum values:
```env
DATABASE_URL="postgresql://mahapeps:mahapeps_dev_password@localhost:5432/mahapeps_dev?schema=public"
REDIS_HOST="localhost"
REDIS_PORT="6379"
JWT_SECRET="dev-secret-change-in-production-min-32-chars"
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
PORT="3001"
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

**2. Create `apps/web/.env.local`:**
```powershell
cd apps/web
copy .env.example .env.local
```

Edit `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"
SERVER_API_BASE_URL="http://localhost:3001"
```

---

## 🎯 Quick Test:

After everything is running, test the backend:
```powershell
curl http://localhost:3001/auth/health
```
Should return: `"auth-ok"`

Then open http://localhost:3000 in your browser!

---

## 🐛 Common Issues:

**"Docker command not found"**
- Make sure Docker Desktop is installed and running
- Check system tray for Docker icon

**"Port already in use"**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000
# Kill it (replace <PID> with the number from above)
taskkill /PID <PID> /F
```

**"Cannot connect to database"**
```powershell
# Restart Docker services
docker compose -f docker-compose.dev.yml restart
```

**"Prisma Client not found"**
```powershell
cd apps/api
npx prisma generate
```

---

## 📚 More Help:

- Full setup guide: See [LOCAL_SETUP.md](LOCAL_SETUP.md)
- Quick commands: See [QUICK_START.md](QUICK_START.md)
- Deployment guide: See [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md)
