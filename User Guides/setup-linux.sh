#!/bin/bash

################################################################################
# Melitech CRM - Linux Setup Script
################################################################################
# This script sets up the Melitech CRM application on Linux
# Requirements: Node.js 22+, npm or pnpm, Git
################################################################################

set -e

cd "$(dirname "$0")"

echo ""
echo "============================================================================"
echo "Melitech CRM - Linux Setup"
echo "============================================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed"
    echo "Please install Node.js 22+ from https://nodejs.org/"
    exit 1
fi

echo "[OK] Node.js found:"
node --version

# Check if pnpm is installed, if not use npm
if command -v pnpm &> /dev/null; then
    PKG_MANAGER="pnpm"
    echo "[OK] pnpm found:"
    pnpm --version
else
    PKG_MANAGER="npm"
    echo "[INFO] pnpm not found, will use npm"
fi

echo ""
echo "============================================================================"
echo "Step 1: Installing Dependencies"
echo "============================================================================"
echo ""

if [ "$PKG_MANAGER" = "pnpm" ]; then
    echo "Running: pnpm install"
    pnpm install
else
    echo "Running: npm install"
    npm install
fi

if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install dependencies"
    exit 1
fi

echo "[OK] Dependencies installed successfully"

echo ""
echo "============================================================================"
echo "Step 2: Setting up Environment Variables"
echo "============================================================================"
echo ""

if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "[OK] .env file created"
    else
        echo "[WARNING] .env.example not found, creating basic .env"
        cat > .env << 'EOF'
DATABASE_URL=mysql://user:password@localhost:3306/melitech_crm
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
EOF
    fi
else
    echo "[OK] .env file already exists"
fi

echo ""
echo "============================================================================"
echo "Step 3: Database Setup"
echo "============================================================================"
echo ""

echo "[INFO] Please ensure your database is running"
echo "[INFO] Update .env with your database connection string"
echo ""

if [ "$PKG_MANAGER" = "pnpm" ]; then
    echo "Running: pnpm run db:push"
    pnpm run db:push || echo "[WARNING] Database setup may have failed"
else
    echo "Running: npm run db:push"
    npm run db:push || echo "[WARNING] Database setup may have failed"
fi

echo ""
echo "============================================================================"
echo "Step 4: Building the Application"
echo "============================================================================"
echo ""

if [ "$PKG_MANAGER" = "pnpm" ]; then
    echo "Running: pnpm run build"
    pnpm run build
else
    echo "Running: npm run build"
    npm run build
fi

if [ $? -ne 0 ]; then
    echo "[ERROR] Build failed"
    exit 1
fi

echo "[OK] Build completed successfully"

echo ""
echo "============================================================================"
echo "Setup Complete!"
echo "============================================================================"
echo ""
echo "To start the development server, run:"
echo "  Linux: ./start-dev-linux.sh  (or npm run dev / pnpm run dev)"
echo ""
echo "To start the production server, run:"
echo "  Linux: npm run start  (or pnpm run start)"
echo ""
echo "Default URLs:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3000"
echo ""
echo "For Docker setup, see setup-docker-linux.sh"
echo "For more information, see README.md"
echo ""
