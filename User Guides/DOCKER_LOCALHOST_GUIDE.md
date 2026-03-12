# Docker Localhost Installation Guide
## Melitech Solutions CRM

**Last Updated**: November 24, 2025  
**Status**: ✅ Production Ready

---

## Quick Start (5 Minutes)

### Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose (included with Docker Desktop)
- 4GB RAM minimum
- 10GB free disk space

### Installation Steps

#### 1. Clone or Extract Project
```bash
cd /path/to/melitech_crm
```

#### 2. Prepare Environment
```bash
# Copy environment template
cp .env.docker.example .env.docker

# Edit configuration (update OAuth credentials)
nano .env.docker
```

**Required OAuth Credentials** (from Manus):
```
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
JWT_SECRET=<generate-with-openssl>
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=Your Name
BUILT_IN_FORGE_API_KEY=your-api-key
```

#### 3. Build and Start
```bash
# Build Docker images (first time only, ~3-5 minutes)
docker-compose build

# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps
```

#### 4. Initialize Database
```bash
# Wait 10-15 seconds for MySQL to be ready, then run:
docker-compose exec app pnpm db:push
```

#### 5. Access Application
```
URL: http://localhost:3000
Login: Use your Manus OAuth credentials
```

---

## Detailed Setup Instructions

### Step 1: Install Docker

#### Windows/Mac
1. Download Docker Desktop from https://www.docker.com/products/docker-desktop
2. Install and launch Docker Desktop
3. Wait for Docker daemon to start (check system tray)

#### Linux (Ubuntu/Debian)
```bash
# Install Docker
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Add user to docker group (optional, to avoid sudo)
sudo usermod -aG docker $USER
newgrp docker
```

#### Verify Installation
```bash
docker --version
docker-compose --version
```

### Step 2: Prepare Project

```bash
# Navigate to project directory
cd /path/to/melitech_crm

# Copy environment template
cp .env.docker.example .env.docker
```

### Step 3: Configure Environment

Edit `.env.docker` with your settings:

```bash
nano .env.docker
```

**Essential Configuration**:

```env
# Database (can use defaults for localhost)
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=melitech_crm
MYSQL_USER=melitech
MYSQL_PASSWORD=melitech_password

# OAuth (REQUIRED - get from Manus)
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im

# Security (REQUIRED - generate new)
JWT_SECRET=<run: openssl rand -base64 32>

# Owner (REQUIRED)
OWNER_OPEN_ID=your-manus-open-id
OWNER_NAME=Your Name

# APIs (REQUIRED)
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-api-key

# Optional
VITE_APP_TITLE=Melitech Solutions CRM
VITE_APP_LOGO=https://your-domain.com/logo.png
```

### Step 4: Build Docker Images

```bash
# Build images (first time only)
docker-compose build

# This will:
# 1. Download base images (node:22-alpine, mysql:8.0-alpine, redis:7-alpine)
# 2. Build the application image
# 3. Prepare all services
# Time: 3-5 minutes on first run
```

### Step 5: Start Services

```bash
# Start all services in background
docker-compose up -d

# Verify services are running
docker-compose ps
```

**Expected Output**:
```
NAME                COMMAND                  SERVICE      STATUS
melitech-app        "node dist/index.js"     app          Up (healthy)
melitech-mysql      "docker-entrypoint.s…"   mysql        Up (healthy)
melitech-redis      "redis-server"           redis        Up (healthy)
```

### Step 6: Initialize Database

```bash
# Wait 10-15 seconds for MySQL to fully initialize

# Run database migrations
docker-compose exec app pnpm db:push

# This will:
# 1. Generate database schema
# 2. Run migrations
# 3. Create all tables
# Time: 30-60 seconds
```

### Step 7: Access Application

Open your browser and navigate to:
```
http://localhost:3000
```

**Login**:
- Use your Manus OAuth credentials
- First login creates your account

---

## Common Commands

### View Service Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f mysql
docker-compose logs -f redis

# Last 50 lines
docker-compose logs --tail=50 app
```

### Stop Services
```bash
# Stop (keeps data)
docker-compose stop

# Stop and remove containers (keeps data)
docker-compose down

# Stop and remove everything including data
docker-compose down -v
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart app
```

### Execute Commands
```bash
# Open shell in app container
docker-compose exec app sh

# Run npm command
docker-compose exec app pnpm list

# Run database command
docker-compose exec mysql mysql -u melitech -p melitech_crm -e "SELECT 1"
```

### View Database
```bash
# Connect to MySQL
docker-compose exec mysql mysql -u melitech -p melitech_crm

# List tables
SHOW TABLES;

# View specific table
SELECT * FROM users LIMIT 10;
```

### Backup Database
```bash
# Backup to SQL file
docker-compose exec mysql mysqldump \
  -u melitech -p melitech_crm \
  --single-transaction \
  > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker-compose exec -T mysql mysql \
  -u melitech -p melitech_crm < backup_20240101_120000.sql
```

---

## Troubleshooting

### Problem: "docker: command not found"
**Solution**: Docker is not installed or not in PATH
```bash
# Verify installation
which docker
docker --version

# If not found, reinstall Docker
```

### Problem: "Cannot connect to Docker daemon"
**Solution**: Docker daemon is not running
```bash
# Windows/Mac: Start Docker Desktop from Applications
# Linux: Start Docker service
sudo systemctl start docker
```

### Problem: "Port 3000 already in use"
**Solution**: Another service is using the port
```bash
# Option 1: Stop the other service
lsof -ti:3000 | xargs kill -9

# Option 2: Change port in docker-compose.yml
# Change "3000:3000" to "3001:3000"
```

### Problem: "MySQL connection failed"
**Solution**: MySQL is not ready yet
```bash
# Wait longer for MySQL to initialize
sleep 15

# Check MySQL status
docker-compose logs mysql

# Verify MySQL is healthy
docker-compose exec mysql mysqladmin ping -h localhost
```

### Problem: "Application won't start"
**Solution**: Check application logs
```bash
# View app logs
docker-compose logs app

# Common issues:
# - Missing environment variables
# - Database not ready
# - Port already in use
# - Out of memory
```

### Problem: "Out of disk space"
**Solution**: Clean up Docker resources
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Full cleanup
docker system prune -a
```

### Problem: "Database migration failed"
**Solution**: Reset database and retry
```bash
# Stop services
docker-compose down

# Remove database volume
docker volume rm melitech_crm_mysql_data

# Start services again
docker-compose up -d

# Wait and retry migration
sleep 15
docker-compose exec app pnpm db:push
```

---

## Performance Optimization

### Increase Docker Memory Allocation

#### Windows/Mac (Docker Desktop)
1. Open Docker Desktop Settings
2. Go to Resources
3. Increase Memory to 4GB or more
4. Click Apply & Restart

#### Linux
Docker uses system memory by default. Ensure 4GB+ available:
```bash
free -h
```

### Monitor Resource Usage
```bash
# View container resource usage
docker stats

# View specific container
docker stats melitech-app
```

### Expected Performance
- **Startup Time**: 60-90 seconds (first run), 10-20 seconds (subsequent)
- **Memory Usage**: 200-300MB idle
- **CPU Usage**: <5% idle
- **Response Time**: <100ms typical

---

## Development Workflow

### Making Code Changes

#### Backend Changes
```bash
# 1. Edit server code
nano server/routers.ts

# 2. Rebuild container
docker-compose build

# 3. Restart service
docker-compose restart app

# 4. Check logs
docker-compose logs -f app
```

#### Database Schema Changes
```bash
# 1. Edit schema
nano drizzle/schema.ts

# 2. Run migration
docker-compose exec app pnpm db:push

# 3. Verify changes
docker-compose exec mysql mysql -u melitech -p melitech_crm
```

#### Frontend Changes
```bash
# Frontend is rebuilt on each docker-compose up
# No manual rebuild needed for code changes
# Changes will be reflected on page refresh
```

### Testing
```bash
# Run tests in container
docker-compose exec app pnpm test

# Run specific test file
docker-compose exec app pnpm test -- path/to/test.ts
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] JWT_SECRET changed to strong value
- [ ] OAuth credentials verified
- [ ] Database backups configured
- [ ] SSL/TLS enabled (via reverse proxy)
- [ ] Health checks verified
- [ ] Logs configured
- [ ] Monitoring set up
- [ ] Backup procedures tested
- [ ] Disaster recovery plan documented

---

## Getting Help

### Check Logs
```bash
# Application logs
docker-compose logs app

# Database logs
docker-compose logs mysql

# All logs with timestamps
docker-compose logs --timestamps
```

### Verify Configuration
```bash
# Show current configuration
docker-compose config

# Show specific service config
docker-compose config | grep -A 20 "service: app"
```

### Test Connectivity
```bash
# Test MySQL
docker-compose exec app mysql -h mysql -u melitech -p melitech_crm -e "SELECT 1"

# Test Redis
docker-compose exec app redis-cli -h redis ping

# Test application
curl http://localhost:3000
```

### Contact Support
- **Email**: info@melitechsolutions.co.ke
- **Documentation**: See DOCKER_SETUP.md
- **Validation Report**: See DOCKER_VALIDATION_REPORT.md

---

## Next Steps

1. ✅ Install Docker
2. ✅ Configure environment
3. ✅ Build and start services
4. ✅ Initialize database
5. ✅ Access application
6. 📊 Create test data
7. 🔐 Configure backups
8. 📈 Set up monitoring
9. 🚀 Deploy to production

---

## Additional Resources

- **Docker Documentation**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **Node.js Docker**: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
- **MySQL Docker**: https://hub.docker.com/_/mysql
- **Redis Docker**: https://hub.docker.com/_/redis

---

**Status**: ✅ Ready for Localhost Installation

For questions or issues, refer to DOCKER_SETUP.md or DOCKER_VALIDATION_REPORT.md
