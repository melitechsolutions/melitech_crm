# Melitech CRM - Complete Setup Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Windows Setup](#windows-setup)
3. [Linux Setup](#linux-setup)
4. [Docker Setup](#docker-setup)
5. [Authentication Fixes](#authentication-fixes)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Windows
```batch
SETUP-WINDOWS.bat
START-DEV-WINDOWS.bat
```

### Linux
```bash
./setup-linux.sh
./start-dev-linux.sh
```

### Docker (Windows)
```batch
SETUP-DOCKER-WINDOWS.bat
```

### Docker (Linux)
```bash
./setup-docker-linux.sh
```

---

## Windows Setup

### Prerequisites
- **Node.js 22+** - Download from https://nodejs.org/
- **npm** or **pnpm** (npm comes with Node.js)
- **Git** (optional, for version control)
- **MySQL/MariaDB** (for local database)

### Step-by-Step Installation

#### 1. Extract the Project
- Extract the `melitech-crm-windows.zip` file to your desired location
- Open Windows Terminal or Command Prompt
- Navigate to the extracted directory

#### 2. Run Setup Script
```batch
SETUP-WINDOWS.bat
```

This script will:
- Check Node.js installation
- Detect pnpm or npm
- Install all dependencies
- Create `.env` file
- Set up database
- Build the application

#### 3. Configure Environment Variables
Edit the `.env` file with your settings:
```
DATABASE_URL=mysql://user:password@localhost:3306/melitech_crm
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```

#### 4. Start Development Server
```batch
START-DEV-WINDOWS.bat
```

Or manually:
```batch
npm run dev
REM or
pnpm run dev
```

#### 5. Access the Application
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

### Windows Commands Reference

| Command | Description |
|---------|-------------|
| `SETUP-WINDOWS.bat` | Initial setup and installation |
| `START-DEV-WINDOWS.bat` | Start development server |
| `SETUP-DOCKER-WINDOWS.bat` | Setup Docker environment |
| `npm run build` | Build for production |
| `npm run start` | Start production server |

---

## Linux Setup

### Prerequisites
- **Node.js 22+** - Install using package manager or from https://nodejs.org/
- **npm** or **pnpm** (npm comes with Node.js)
- **Git** (optional)
- **MySQL/MariaDB** (for local database)

### Step-by-Step Installation

#### 1. Extract the Project
```bash
unzip melitech-crm-linux.zip
cd melitech-crm
```

#### 2. Run Setup Script
```bash
chmod +x setup-linux.sh
./setup-linux.sh
```

This script will:
- Check Node.js installation
- Detect pnpm or npm
- Install all dependencies
- Create `.env` file
- Set up database
- Build the application

#### 3. Configure Environment Variables
Edit the `.env` file:
```bash
nano .env
```

Or use your preferred editor to update:
```
DATABASE_URL=mysql://user:password@localhost:3306/melitech_crm
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```

#### 4. Start Development Server
```bash
./start-dev-linux.sh
```

Or manually:
```bash
npm run dev
# or
pnpm run dev
```

#### 5. Access the Application
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

### Linux Commands Reference

| Command | Description |
|---------|-------------|
| `./setup-linux.sh` | Initial setup and installation |
| `./start-dev-linux.sh` | Start development server |
| `./setup-docker-linux.sh` | Setup Docker environment |
| `npm run build` | Build for production |
| `npm run start` | Start production server |

---

## Docker Setup

### Prerequisites
- **Docker Desktop** (Windows) - https://www.docker.com/products/docker-desktop
- **Docker** (Linux) - https://docs.docker.com/engine/install/
- **Docker Compose**

### Windows Docker Setup

#### 1. Install Docker Desktop
- Download from https://www.docker.com/products/docker-desktop
- Install and start Docker Desktop
- Ensure Docker daemon is running

#### 2. Run Docker Setup Script
```batch
SETUP-DOCKER-WINDOWS.bat
```

This script will:
- Check Docker installation
- Build Docker images
- Start containers
- Configure services

#### 3. Access the Application
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Database**: localhost:3306

#### 4. Docker Commands
```batch
REM View logs
docker-compose logs -f

REM Stop services
docker-compose down

REM Restart services
docker-compose restart

REM View running containers
docker-compose ps
```

### Linux Docker Setup

#### 1. Install Docker
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group (optional)
sudo usermod -aG docker $USER
```

#### 2. Run Docker Setup Script
```bash
chmod +x setup-docker-linux.sh
./setup-docker-linux.sh
```

#### 3. Access the Application
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Database**: localhost:3306

#### 4. Docker Commands
```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View running containers
docker-compose ps
```

---

## Authentication Fixes

### Issues Fixed

#### 1. Cookie/Secure Mismatch in Docker
**Problem**: Cookies weren't being set in Docker HTTP environment
**Solution**: Updated cookie configuration with proper HTTP/HTTPS handling

**File**: `server/_core/cookies.ts`
- Docker HTTP: `sameSite: "lax"`, `secure: false`
- Production HTTPS: `sameSite: "none"`, `secure: true`

#### 2. Missing Session Cookie
**Problem**: No fallback when cookies failed
**Solution**: Added localStorage fallback mechanism

**File**: `server/routers/auth.ts`
- Returns JWT token in response
- Supports localStorage storage

#### 3. No Redirect After Login
**Problem**: Users weren't redirected to appropriate dashboards
**Solution**: Implemented role-based routing

**File**: `client/src/pages/Login.tsx`
- Stores token and user data in localStorage
- Routes based on user role

#### 4. No Persistent Login State
**Problem**: Page refresh lost authentication
**Solution**: Enhanced auth hook with localStorage persistence

**File**: `client/src/_core/hooks/useAuthWithPersistence.ts`
- Loads persisted user on mount
- Automatic fallback mechanism

#### 5. No Role-Based Routing
**Problem**: All users went to generic dashboard
**Solution**: Created role-specific dashboards

**Files**:
- `client/src/components/RoleBasedDashboard.tsx` - Routes by role
- `client/src/pages/dashboards/SuperAdminDashboard.tsx`
- `client/src/pages/dashboards/AdminDashboard.tsx`
- `client/src/pages/dashboards/HRDashboard.tsx`
- `client/src/pages/dashboards/AccountantDashboard.tsx`
- `client/src/pages/dashboards/StaffDashboard.tsx`

#### 6. Client Portal Not Connected to Backend
**Problem**: Used mock data instead of real data
**Solution**: Integrated with backend API

**File**: `client/src/pages/ClientPortal.tsx`
- Fetches real client data
- Displays projects, invoices, documents
- Proper authentication verification

### Testing Authentication

#### Login Flow
1. Navigate to http://localhost:5173
2. Enter valid credentials
3. Verify redirect to appropriate dashboard
4. Refresh page - login state should persist
5. Check browser localStorage for `auth-user` and `auth-token`

#### Role-Based Routing
- **Super Admin** → `/dashboard/super-admin`
- **Admin** → `/dashboard/admin`
- **HR** → `/dashboard/hr`
- **Accountant** → `/dashboard/accountant`
- **Staff** → `/dashboard/staff`
- **Client** → `/client-portal`

#### Cookie/localStorage Fallback
1. Open browser DevTools (F12)
2. Go to Application → Storage → Cookies
3. Check for session cookie (HTTPS only)
4. Go to Application → Storage → Local Storage
5. Verify `auth-user` and `auth-token` are stored

---

## Troubleshooting

### Windows Issues

#### Issue: "Node.js is not installed"
**Solution**:
1. Download Node.js from https://nodejs.org/
2. Install with default settings
3. Restart Windows Terminal
4. Run setup script again

#### Issue: "npm: command not found"
**Solution**:
1. Reinstall Node.js
2. Add Node.js to PATH manually:
   - Right-click "This PC" → Properties
   - Advanced system settings → Environment Variables
   - Add Node.js installation path to PATH

#### Issue: "Port 3000 or 5173 already in use"
**Solution**:
```batch
REM Find process using port 3000
netstat -ano | findstr :3000

REM Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### Issue: Database connection failed
**Solution**:
1. Verify MySQL/MariaDB is running
2. Check DATABASE_URL in .env
3. Ensure database user has correct permissions
4. Test connection: `mysql -u user -p -h localhost`

### Linux Issues

#### Issue: "Node.js is not installed"
**Solution**:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install nodejs npm

# Or use NodeSource repository for latest version
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Issue: "Permission denied" when running scripts
**Solution**:
```bash
chmod +x setup-linux.sh start-dev-linux.sh setup-docker-linux.sh
```

#### Issue: "Port 3000 or 5173 already in use"
**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### Issue: Database connection failed
**Solution**:
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql

# Test connection
mysql -u user -p -h localhost
```

### Docker Issues

#### Issue: "Docker daemon is not running"
**Solution**:
- **Windows**: Start Docker Desktop
- **Linux**: `sudo systemctl start docker`

#### Issue: "Cannot connect to Docker daemon"
**Solution**:
```bash
# Linux only
sudo systemctl start docker
sudo usermod -aG docker $USER
# Log out and log back in
```

#### Issue: "Port already in use"
**Solution**:
```bash
# Stop all containers
docker-compose down

# Or specify different ports in docker-compose.yml
```

### Authentication Issues

#### Issue: "Login redirects but page shows loading"
**Solution**:
1. Check browser console for errors (F12)
2. Check backend logs
3. Verify .env configuration
4. Clear browser cache and localStorage

#### Issue: "Page refresh loses login state"
**Solution**:
1. Check browser's localStorage (F12 → Application → Local Storage)
2. Verify `auth-user` and `auth-token` are stored
3. Check if browser allows localStorage
4. Disable browser extensions that might clear storage

#### Issue: "User redirected to wrong dashboard"
**Solution**:
1. Check user role in database
2. Verify role matches dashboard route
3. Check browser console for role value
4. Clear cache and login again

#### Issue: "Cookie not being set in Docker"
**Solution**:
1. Verify cookies.ts has correct configuration
2. Check that sameSite="lax" and secure=false for HTTP
3. Verify backend is returning token in response
4. Check browser console for cookie warnings

---

## Environment Variables

### Required Variables
```
DATABASE_URL=mysql://user:password@localhost:3306/melitech_crm
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```

### Optional Variables
```
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173
SESSION_TIMEOUT=3600
```

---

## Production Deployment

### Before Deploying

1. **Update Environment Variables**
   ```
   NODE_ENV=production
   JWT_SECRET=<strong-random-secret>
   FRONTEND_URL=https://yourdomain.com
   BACKEND_URL=https://api.yourdomain.com
   ```

2. **Build Application**
   ```bash
   npm run build
   # or
   pnpm run build
   ```

3. **Security Checklist**
   - [ ] Change JWT_SECRET to strong random value
   - [ ] Enable HTTPS
   - [ ] Set sameSite="none" and secure=true in cookies
   - [ ] Configure CORS properly
   - [ ] Set up database backups
   - [ ] Enable database encryption
   - [ ] Set up monitoring and logging
   - [ ] Configure rate limiting

### Docker Production Deployment

```bash
# Build production image
docker-compose -f docker-compose.prod.yml build

# Start production containers
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## Support & Documentation

- **README.md** - Project overview
- **IMPLEMENTATION_GUIDE.md** - Detailed implementation steps
- **BACKEND_API_ROUTES.md** - API documentation
- **FIXES_SUMMARY.md** - Technical details of fixes

---

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Last Updated**: December 14, 2025
**Version**: 1.0
**Status**: Ready for Production

