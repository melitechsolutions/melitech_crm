#!/bin/bash

################################################################################
# Melitech CRM - Linux Docker Setup Script
################################################################################
# This script sets up and runs the Melitech CRM using Docker on Linux
# Requirements: Docker, Docker Compose
################################################################################

set -e

cd "$(dirname "$0")"

echo ""
echo "============================================================================"
echo "Melitech CRM - Docker Setup (Linux)"
echo "============================================================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed"
    echo "Please install Docker from https://docs.docker.com/engine/install/"
    exit 1
fi

echo "[OK] Docker found:"
docker --version

# Check if Docker daemon is running
if ! docker ps &> /dev/null; then
    echo "[ERROR] Docker daemon is not running"
    echo "Please start Docker: sudo systemctl start docker"
    exit 1
fi

echo "[OK] Docker daemon is running"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "[ERROR] Docker Compose is not installed"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

echo "[OK] Docker Compose found:"
docker-compose --version

echo ""
echo "============================================================================"
echo "Step 1: Building Docker Images"
echo "============================================================================"
echo ""

echo "Building Docker images..."
docker-compose build

if [ $? -ne 0 ]; then
    echo "[ERROR] Docker build failed"
    exit 1
fi

echo "[OK] Docker images built successfully"

echo ""
echo "============================================================================"
echo "Step 2: Starting Docker Containers"
echo "============================================================================"
echo ""

echo "Starting containers..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to start containers"
    exit 1
fi

echo "[OK] Containers started successfully"

echo ""
echo "============================================================================"
echo "Docker Setup Complete!"
echo "============================================================================"
echo ""
echo "Services are now running:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3000"
echo "  Database: localhost:3306"
echo ""
echo "Useful Docker commands:"
echo "  View logs:     docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart:       docker-compose restart"
echo ""
