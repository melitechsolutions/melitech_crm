#!/bin/bash

################################################################################
# Melitech CRM - Linux Development Server Startup
################################################################################

cd "$(dirname "$0")"

echo ""
echo "============================================================================"
echo "Melitech CRM - Development Server"
echo "============================================================================"
echo ""

# Check if pnpm is installed, if not use npm
if command -v pnpm &> /dev/null; then
    PKG_MANAGER="pnpm"
else
    PKG_MANAGER="npm"
fi

echo "[INFO] Using package manager: $PKG_MANAGER"
echo ""
echo "Starting development server..."
echo "Frontend will be available at: http://localhost:5173"
echo "Backend will be available at: http://localhost:3000"
echo ""

if [ "$PKG_MANAGER" = "pnpm" ]; then
    pnpm run dev
else
    npm run dev
fi
