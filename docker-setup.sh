#!/bin/bash

# Melitech CRM - Docker Setup Script for Mac/Linux
# This script automates the Docker setup process

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"

echo ""
echo "========================================"
echo "Melitech CRM - Docker Setup"
echo "========================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed"
    echo "Please install Docker from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "[OK] Docker is installed"
docker --version

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "[ERROR] Docker Compose is not installed"
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "[OK] Docker Compose is installed"
docker-compose --version

echo ""
echo "========================================"
echo "Step 1: Checking Project Files"
echo "========================================"
echo ""

if [ ! -f "$PROJECT_DIR/docker-compose.yml" ]; then
    echo "[ERROR] docker-compose.yml not found in $PROJECT_DIR"
    exit 1
fi
echo "[OK] docker-compose.yml found"

if [ ! -f "$PROJECT_DIR/Dockerfile" ]; then
    echo "[ERROR] Dockerfile not found in $PROJECT_DIR"
    exit 1
fi
echo "[OK] Dockerfile found"

if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo "[WARNING] .env file not found, creating from template"
    cat > "$PROJECT_DIR/.env" << 'EOF'
# Application Identification
VITE_APP_ID=melitech_crm
VITE_APP_TITLE=Melitech Solutions
VITE_APP_LOGO=/logo.png

# Database Connection
DATABASE_URL=mysql://root:FgPrIBA1CYe5wyqD8ogi@db:3306/melitech_crm

# Security
JWT_SECRET=ro5A_c25AwsQHy30Dqg6VAbqQHmeezt1Xfx-e37ApnE

# OAuth Configuration
VITE_OAUTH_PORTAL_URL=http://localhost:3000
OAUTH_SERVER_URL=http://localhost:3000
AUTH_MODE=local

# Owner Information
OWNER_EMAIL=admin@melitechsolutions.co.ke
OWNER_NAME=Melitech Admin
EOF
    echo "[OK] .env file created"
fi

if [ ! -f "$PROJECT_DIR/.env.local" ]; then
    echo "[INFO] Creating .env.local for local development"
    cat > "$PROJECT_DIR/.env.local" << 'EOF'
# Local Development Configuration
DATABASE_URL=mysql://root:FgPrIBA1CYe5wyqD8ogi@localhost:3307/melitech_crm
JWT_SECRET=ro5A_c25AwsQHy30Dqg6VAbqQHmeezt1Xfx-e37ApnE
VITE_APP_ID=melitech_crm
VITE_APP_TITLE=Melitech Solutions
VITE_OAUTH_PORTAL_URL=http://localhost:3000
OAUTH_SERVER_URL=http://localhost:3000
AUTH_MODE=local
OWNER_EMAIL=admin@melitechsolutions.co.ke
OWNER_NAME=Melitech Admin
EOF
    echo "[OK] .env.local created"
else
    echo "[OK] .env.local already exists"
fi

echo ""
echo "========================================"
echo "Step 2: Checking Port Availability"
echo "========================================"
echo ""

# Check port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "[WARNING] Port 3000 appears to be in use"
    echo "Please ensure no other service is using port 3000"
else
    echo "[OK] Port 3000 is available"
fi

# Check port 3307
if lsof -Pi :3307 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "[WARNING] Port 3307 appears to be in use"
    echo "Please ensure no other service is using port 3307"
else
    echo "[OK] Port 3307 is available"
fi

echo ""
echo "========================================"
echo "Step 3: Building Docker Images"
echo "========================================"
echo ""

cd "$PROJECT_DIR"
docker-compose build --no-cache

if [ $? -ne 0 ]; then
    echo "[ERROR] Docker build failed"
    exit 1
fi

echo "[OK] Docker images built successfully"

echo ""
echo "========================================"
echo "Step 4: Starting Services"
echo "========================================"
echo ""

docker-compose up -d

if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to start Docker services"
    echo "Run 'docker-compose logs' to see detailed error messages"
    exit 1
fi

echo "[OK] Docker services started"

echo ""
echo "========================================"
echo "Step 5: Waiting for Services to Initialize"
echo "========================================"
echo ""

echo "[INFO] Waiting for database to be ready..."
sleep 10

echo "[INFO] Waiting for application to start..."
sleep 20

echo ""
echo "========================================"
echo "Checking Service Status"
echo "========================================"
echo ""

docker-compose ps

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "[OK] Melitech CRM is starting up"
echo ""
echo "Access the application at:"
echo "  Frontend: http://localhost:3000"
echo "  Database: localhost:3307"
echo ""
echo "Database Credentials:"
echo "  Username: melitech_user"
echo "  Password: twMH*4dFIQRoT35D@@Xg"
echo "  Database: melitech_crm"
echo ""
echo "Useful Commands:"
echo "  View logs:     docker-compose logs -f app"
echo "  Stop services: docker-compose down"
echo "  Restart:       docker-compose restart"
echo ""
echo "Note: It may take 30-60 seconds for all services to be fully ready"
echo "Please wait and then access http://localhost:3000"
echo ""
