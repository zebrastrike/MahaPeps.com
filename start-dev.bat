@echo off
REM MahaPeps Local Development Startup Script for Windows

echo.
echo ========================================
echo  MahaPeps Local Development Setup
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Start Docker services
echo [1/7] Starting PostgreSQL and Redis...
docker-compose -f docker-compose.dev.yml up -d

REM Wait for services
echo [2/7] Waiting for database to be ready...
timeout /t 5 /nobreak >nul

echo [3/7] Checking environment files...
if not exist "apps\api\.env" (
    echo [WARNING] apps\api\.env not found. Creating from .env.example...
    copy apps\api\.env.example apps\api\.env
    echo [INFO] Please edit apps\api\.env and set your environment variables
)

if not exist "apps\web\.env.local" (
    echo [WARNING] apps\web\.env.local not found. Creating from .env.example...
    copy apps\web\.env.example apps\web\.env.local
    echo [INFO] Please edit apps\web\.env.local and set your environment variables
)

echo [4/7] Installing dependencies...
if not exist "apps\api\node_modules" (
    echo [INFO] Installing API dependencies...
    cd apps\api
    call npm install
    cd ..\..
)

if not exist "apps\web\node_modules" (
    echo [INFO] Installing Web dependencies...
    cd apps\web
    call npm install
    cd ..\..
)

echo [5/7] Generating Prisma Client...
cd apps\api
call npx prisma generate >nul 2>&1

echo [6/7] Running database migrations...
call npx prisma migrate deploy

cd ..\..

echo [7/7] Setup complete!
echo.
echo ========================================
echo  Ready to Start Development!
echo ========================================
echo.
echo Next steps:
echo   1. Open 2 terminal windows
echo   2. In terminal 1: cd apps\api ^&^& npm run start:dev
echo   3. In terminal 2: cd apps\web ^&^& npm run dev
echo.
echo URLs:
echo   - Frontend: http://localhost:3000
echo   - Backend:  http://localhost:3001
echo   - DB Admin: npx prisma studio (in apps\api)
echo.
echo To stop Docker: docker-compose -f docker-compose.dev.yml down
echo.
pause
