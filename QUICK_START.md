# ⚡ Quick Start Commands

## 🚀 First Time Setup (Windows)

```bash
# 1. Run the setup script
start-dev.bat

# 2. Open TWO new terminal windows:

# Terminal 1 - Start Backend
cd apps/api
npm run start:dev

# Terminal 2 - Start Frontend
cd apps/web
npm run dev

# 3. Create admin account (in a third terminal)
curl -X POST http://localhost:3001/auth/register -H "Content-Type: application/json" -d "{\"email\":\"admin@test.com\",\"password\":\"admin123\",\"name\":\"Admin\",\"role\":\"ADMIN\"}"
```

## 🔄 Daily Development

```bash
# Start Docker (run once per day)
docker-compose -f docker-compose.dev.yml up -d

# Terminal 1 - Backend
cd apps/api
npm run start:dev

# Terminal 2 - Frontend
cd apps/web
npm run dev

# Open browser
# http://localhost:3000 (frontend)
# http://localhost:3001/auth/health (API test)
```

## 🛠️ Common Tasks

### View Database
```bash
cd apps/api
npx prisma studio
# Opens http://localhost:5555
```

### Reset Database
```bash
cd apps/api
npx prisma migrate reset
# WARNING: Deletes all data!
```

### Create New Migration
```bash
cd apps/api
npx prisma migrate dev --name add_new_feature
```

### View API Logs
Backend terminal shows real-time logs automatically

### View Frontend Logs
Frontend terminal shows real-time logs automatically

### Check Docker Services
```bash
docker ps
# Should show mahapeps-postgres-dev and mahapeps-redis-dev
```

### Restart Docker Services
```bash
docker-compose -f docker-compose.dev.yml restart
```

### Stop Everything
```bash
# Stop Docker services
docker-compose -f docker-compose.dev.yml down

# Stop backend: Ctrl+C in Terminal 1
# Stop frontend: Ctrl+C in Terminal 2
```

## 🐛 Quick Fixes

### Port Already in Use
```bash
# Kill process on port 3000 (frontend)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 3001 (backend)
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker ps | findstr postgres

# Restart PostgreSQL
docker restart mahapeps-postgres-dev
```

### Redis Connection Failed
```bash
# Check if Redis is running
docker ps | findstr redis

# Restart Redis
docker restart mahapeps-redis-dev
```

### Prisma Client Errors
```bash
cd apps/api
npx prisma generate
```

### Clean Install
```bash
# Remove all dependencies
rmdir /s /q node_modules
rmdir /s /q apps\api\node_modules
rmdir /s /q apps\web\node_modules

# Reinstall
npm install
cd apps/api && npm install && cd ..\..
cd apps/web && npm install && cd ..\..
```

## 📝 Login Credentials (Dev)

After creating admin account:
- **URL:** http://localhost:3000/login
- **Email:** admin@test.com
- **Password:** admin123

## 🌐 URLs Reference

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | http://localhost:3000 | Next.js app |
| Backend API | http://localhost:3001 | NestJS API |
| API Health | http://localhost:3001/auth/health | Should return "auth-ok" |
| Prisma Studio | http://localhost:5555 | Run `npx prisma studio` first |
| PostgreSQL | localhost:5432 | User: mahapeps, DB: mahapeps_dev |
| Redis | localhost:6379 | No password in dev |

## 📦 Project Structure

```
MahaPeps.com/
├── apps/
│   ├── api/              ← Backend NestJS API
│   │   ├── src/
│   │   ├── prisma/
│   │   └── .env          ← Configure this!
│   └── web/              ← Frontend Next.js
│       ├── src/
│       └── .env.local    ← Configure this!
├── docker-compose.dev.yml
├── start-dev.bat         ← Run this first!
└── LOCAL_SETUP.md        ← Full documentation
```

## ✅ Verification Checklist

After starting everything, verify:

- [ ] Docker containers running: `docker ps`
- [ ] Backend API responding: `curl http://localhost:3001/auth/health`
- [ ] Frontend loading: Open http://localhost:3000
- [ ] Database accessible: `npx prisma studio` in apps/api
- [ ] Admin account created
- [ ] Can login at http://localhost:3000/login

## 🎯 Next Steps After Setup

1. **Browse Products** - http://localhost:3000/products
2. **Admin Dashboard** - http://localhost:3000/admin (login as admin first)
3. **Create Test Products** - Use Prisma Studio or admin panel
4. **Test Order Flow** - Add to cart → checkout → payment
5. **Read Full Documentation** - See LOCAL_SETUP.md

## 💡 Pro Tips

- Keep Docker Desktop running while developing
- Use Prisma Studio to inspect/edit database directly
- Backend auto-reloads on code changes (no restart needed)
- Frontend auto-reloads on code changes (hot reload)
- Check terminal logs for errors
- Use `docker logs mahapeps-postgres-dev` to debug DB issues
- Use `docker logs mahapeps-redis-dev` to debug Redis issues

## 🆘 Need Help?

1. Check LOCAL_SETUP.md for detailed setup
2. Check DEPLOYMENT_READY.md for API endpoints
3. Check terminal logs for error messages
4. Verify .env files have correct values
5. Try `docker-compose down -v` then restart (WARNING: deletes DB data)
