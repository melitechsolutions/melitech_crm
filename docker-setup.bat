@echo off
REM Melitech CRM - Docker Setup Script for Windows
REM This script automates the Docker setup process

setlocal enabledelayedexpansion
set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR=%SCRIPT_DIR%"

echo.
echo ========================================
echo Melitech CRM - Docker Setup
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [OK] Docker is installed
docker --version

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed
    echo Please install Docker Desktop which includes Docker Compose
    pause
    exit /b 1
)

echo [OK] Docker Compose is installed
docker-compose --version

echo.
echo ========================================
echo Step 1: Checking Project Files
echo ========================================
echo.

if not exist "%PROJECT_DIR%docker-compose.yml" (
    echo [ERROR] docker-compose.yml not found in %PROJECT_DIR%
    pause
    exit /b 1
)
echo [OK] docker-compose.yml found

if not exist "%PROJECT_DIR%Dockerfile" (
    echo [ERROR] Dockerfile not found in %PROJECT_DIR%
    pause
    exit /b 1
)
echo [OK] Dockerfile found

if not exist "%PROJECT_DIR%.env" (
    echo [WARNING] .env file not found, creating from template
    REM Create basic .env file
    (
        echo # Application Identification
        echo VITE_APP_ID=melitech_crm
        echo VITE_APP_TITLE=Melitech Solutions
        echo VITE_APP_LOGO=/logo.png
        echo.
        echo # Database Connection
        echo DATABASE_URL=mysql://root:tjwzT9pW;NGYq1QxSq0B@db:3306/melitech_crm
        echo.
        echo # Security
        echo JWT_SECRET=w1IHeWVTQvm2DNaSTLJD8HFdpfeN3iYk_ZQMXjNmsvo
        echo.
        echo # OAuth Configuration
        echo VITE_OAUTH_PORTAL_URL=http://localhost:3000
        echo OAUTH_SERVER_URL=http://localhost:3000
        echo AUTH_MODE=local
        echo.
        echo # Owner Information
        echo OWNER_EMAIL=admin@melitechsolutions.co.ke
        echo OWNER_NAME=Melitech Admin
    ) > "%PROJECT_DIR%.env"
    echo [OK] .env file created
)

if not exist "%PROJECT_DIR%.env.local" (
    echo [INFO] Creating .env.local for local development
    (
        echo # Local Development Configuration
        echo DATABASE_URL=mysql://root:tjwzT9pW;NGYq1QxSq0B@localhost:3307/melitech_crm
        echo JWT_SECRET=w1IHeWVTQvm2DNaSTLJD8HFdpfeN3iYk_ZQMXjNmsvo
        echo VITE_APP_ID=melitech_crm
        echo VITE_APP_TITLE=Melitech Solutions
        echo VITE_OAUTH_PORTAL_URL=http://localhost:3000
        echo OAUTH_SERVER_URL=http://localhost:3000
        echo AUTH_MODE=local
        echo OWNER_EMAIL=admin@melitechsolutions.co.ke
        echo OWNER_NAME=Melitech Admin
    ) > "%PROJECT_DIR%.env.local"
    echo [OK] .env.local created
) else (
    echo [OK] .env.local already exists
)

echo.
echo ========================================
echo Step 2: Checking Port Availability
echo ========================================
echo.

netstat -ano | findstr ":3000" >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Port 3000 appears to be in use
    echo Please ensure no other service is using port 3000
)

netstat -ano | findstr ":3307" >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Port 3307 appears to be in use
    echo Please ensure no other service is using port 3307
)

echo [OK] Port check complete

echo.
echo ========================================
echo Step 3: Building Docker Images
echo ========================================
echo.

cd /d "%PROJECT_DIR%"
docker-compose build --no-cache

if errorlevel 1 (
    echo [ERROR] Docker build failed
    pause
    exit /b 1
)

echo [OK] Docker images built successfully

echo.
echo ========================================
echo Step 4: Starting Services
echo ========================================
echo.

docker-compose up -d

if errorlevel 1 (
    echo [ERROR] Failed to start Docker services
    echo Run 'docker-compose logs' to see detailed error messages
    pause
    exit /b 1
)

echo [OK] Docker services started

echo.
echo ========================================
echo Step 5: Waiting for Services to Initialize
echo ========================================
echo.

echo [INFO] Waiting for database to be ready...
timeout /t 10 /nobreak

echo [INFO] Waiting for application to start...
timeout /t 20 /nobreak

echo.
echo ========================================
echo Checking Service Status
echo ========================================
echo.

docker-compose ps

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo [OK] Melitech CRM is starting up
echo.
echo Access the application at:
echo   Frontend: http://localhost:3000
echo   Database: localhost:3307
echo.
echo Database Credentials:
echo   Username: melitech_user
echo   Password: twMH*4dFIQRoT35D@@Xg
echo   Database: melitech_crm
echo.
echo Useful Commands:
echo   View logs:     docker-compose logs -f app
echo   Stop services: docker-compose down
echo   Restart:       docker-compose restart
echo.
echo Note: It may take 30-60 seconds for all services to be fully ready
echo Please wait and then access http://localhost:3000
echo.
pause
