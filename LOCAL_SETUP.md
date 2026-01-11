# 🚀 MahaPeps Local Development Setup

## Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install API dependencies
cd apps/api
npm install
cd ../..

# Install Web dependencies
cd apps/web
npm install
cd ../..
```

## Step 2: Start Docker Services (PostgreSQL + Redis)

### Option A: Using Docker Compose (Recommended)

Create `docker-compose.dev.yml` in the root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: mahapeps-postgres-dev
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: mahapeps
      POSTGRES_PASSWORD: mahapeps_dev_password
      POSTGRES_DB: mahapeps_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: mahapeps-redis-dev
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

Start services:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

Check if running:
```bash
docker ps
# Should show mahapeps-postgres-dev and mahapeps-redis-dev running
```

### Option B: Install PostgreSQL and Redis Manually

**PostgreSQL:**
- Windows: Download from https://www.postgresql.org/download/windows/
- Mac: `brew install postgresql@15 && brew services start postgresql`
- Linux: `sudo apt-get install postgresql-15`

**Redis:**
- Windows: Download from https://github.com/microsoftarchive/redis/releases
- Mac: `brew install redis && brew services start redis`
- Linux: `sudo apt-get install redis-server`

## Step 3: Configure Environment Variables

### Backend API Environment (.env)

Create `apps/api/.env`:

```bash
# Copy the example file first
cd apps/api
cp .env.example .env
```

Edit `apps/api/.env` with these values:

```bash
# Database (matches Docker Compose)
DATABASE_URL="postgresql://mahapeps:mahapeps_dev_password@localhost:5432/mahapeps_dev?schema=public"

# Redis (matches Docker Compose)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# Security (generate new ones for production!)
JWT_SECRET="dev-secret-change-in-production-min-32-chars"
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# API Configuration
PORT="3001"
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# Shippo (OPTIONAL - for shipping features)
# Leave blank to use fallback rates
SHIPPO_API_KEY=""
SHIPPO_RETURN_ADDRESS_ID=""

# Mailgun (OPTIONAL - emails will log to console in dev)
# Leave blank for development - emails will be logged instead
MAILGUN_API_KEY=""
MAILGUN_DOMAIN=""
MAILGUN_FROM_EMAIL="dev@localhost"
MAILGUN_FROM_NAME="MAHA Peptides Dev"

# Payment Methods (for display only in dev)
ZELLE_ID="payments@mahapeps.com"
CASHAPP_TAG="$MahaPeps"

# File Storage (OPTIONAL - for file uploads)
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME=""
R2_PUBLIC_URL=""
```

### Frontend Web Environment (.env.local)

Create `apps/web/.env.local`:

```bash
cd apps/web
cp .env.example .env.local
```

Edit `apps/web/.env.local`:

```bash
# API Connection
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"
SERVER_API_BASE_URL="http://localhost:3001"

# Payment Display
NEXT_PUBLIC_ZELLE_ID="payments@mahapeps.com"
NEXT_PUBLIC_CASHAPP_TAG="$MahaPeps"
```

## Step 4: Setup Database

```bash
cd apps/api

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database with sample data
npx prisma db seed
```

Verify database is working:
```bash
npx prisma studio
# This opens a GUI at http://localhost:5555 to browse your database
```

## Step 5: Start Backend API

```bash
cd apps/api

# Development mode with hot reload
npm run start:dev

# You should see:
# [Nest] LOG [NestFactory] Starting Nest application...
# [Nest] LOG [InstanceLoader] AppModule dependencies initialized
# [Nest] LOG Application is running on: http://localhost:3001
```

Test the API is running:
```bash
# In a new terminal
curl http://localhost:3001/auth/health
# Should return: "auth-ok"
```

## Step 6: Start Frontend Web App

```bash
# In a new terminal window
cd apps/web

# Development mode with hot reload
npm run dev

# You should see:
# ▲ Next.js 14.x.x
# - Local:        http://localhost:3000
# - Network:      http://192.168.x.x:3000
```

## Step 7: Verify Everything Works

Open your browser to:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001/auth/health
- **Prisma Studio:** http://localhost:5555 (if running)

## Step 8: Create Admin Account

```bash
# In a new terminal
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123",
    "name": "Admin User",
    "role": "ADMIN"
  }'
```

You can now login at http://localhost:3000/login with:
- Email: `admin@test.com`
- Password: `admin123`

## 🎯 Development Workflow

### Running Everything

You need **3 terminal windows**:

**Terminal 1 - Docker Services:**
```bash
docker-compose -f docker-compose.dev.yml up
```

**Terminal 2 - Backend API:**
```bash
cd apps/api
npm run start:dev
```

**Terminal 3 - Frontend Web:**
```bash
cd apps/web
npm run dev
```

### Useful Commands

**Reset Database:**
```bash
cd apps/api
npx prisma migrate reset
# Warning: This deletes all data!
```

**View Database:**
```bash
cd apps/api
npx prisma studio
```

**View Logs:**
```bash
# Backend logs
cd apps/api
npm run start:dev

# Frontend logs
cd apps/web
npm run dev
```

**Stop Docker Services:**
```bash
docker-compose -f docker-compose.dev.yml down
```

**Stop and Remove All Data:**
```bash
docker-compose -f docker-compose.dev.yml down -v
```

## 🐛 Troubleshooting

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
docker ps | grep postgres
# or
psql -U mahapeps -h localhost -d mahapeps_dev
```

### "Cannot connect to Redis"
```bash
# Check if Redis is running
docker ps | grep redis
# or
redis-cli ping
# Should return: PONG
```

### "Port 3000 already in use"
```bash
# Find and kill the process
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### "Port 3001 already in use"
```bash
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3001 | xargs kill -9
```

### "Prisma Client not generated"
```bash
cd apps/api
npx prisma generate
```

### TypeScript Errors
```bash
# Rebuild everything
npm run build

# Or just the API
cd apps/api
npm run build
```

### Clear Cache and Reinstall
```bash
# Remove all node_modules
rm -rf node_modules apps/*/node_modules

# Remove package locks
rm -rf package-lock.json apps/*/package-lock.json

# Reinstall
npm install
cd apps/api && npm install
cd ../web && npm install
```

## 📋 Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] Docker installed (or PostgreSQL + Redis separately)
- [ ] Started Docker services: `docker-compose -f docker-compose.dev.yml up -d`
- [ ] Created `apps/api/.env` from example
- [ ] Created `apps/web/.env.local` from example
- [ ] Ran `npm install` in root, api, and web folders
- [ ] Ran `npx prisma generate` in apps/api
- [ ] Ran `npx prisma migrate dev` in apps/api
- [ ] Started backend: `cd apps/api && npm run start:dev`
- [ ] Started frontend: `cd apps/web && npm run dev`
- [ ] Created admin account via curl
- [ ] Verified http://localhost:3000 works
- [ ] Verified http://localhost:3001/auth/health works

## 🎉 You're Ready!

Your local development environment is now running:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database Admin: http://localhost:5555 (Prisma Studio)

Happy coding! 🚀
