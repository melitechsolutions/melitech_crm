# Melitech CRM - Local Authentication Setup Guide

**Version**: 1.0  
**Last Updated**: December 9, 2025  
**Status**: ✅ Production Ready

---

## Overview

This guide covers setting up Melitech CRM with **local authentication** (standalone mode) using Docker. In this mode, the application uses its own database for user authentication instead of relying on external OAuth providers.

---

## Key Differences: Two Docker Compose Configurations

### Configuration 1: `docker-compose(skipvite).yml` - Simplified
- **Best for**: Development and testing
- **Services**: MySQL + Node.js App only
- **Container Names**: `melitech_crm_db`, `melitech_crm_app`
- **Port Mapping**: DB on 3307, App on 3000
- **Size**: Minimal, fast startup

### Configuration 2: `docker-compose.yml` - Full Stack (RECOMMENDED)
- **Best for**: Production and full-featured development
- **Services**: MySQL + Node.js App + Redis
- **Container Names**: `melitech_crm_db`, `melitech_crm_app`
- **Port Mapping**: DB on 3307, App on 3000, Redis on 6379
- **Features**: Networking, health checks, Redis caching
- **Size**: Full-featured

---

## Quick Start with Local Authentication

### Step 1: Prepare Environment

```bash
# Navigate to project directory
cd /path/to/melitech_crm

# Create .env file with local auth settings
cat > .env << 'EOF'
# Node Environment
NODE_ENV=production

# Database Credentials
MYSQL_ROOT_PASSWORD=FgPrIBA1CYe5wyqD8ogi
MYSQL_DATABASE=melitech_crm
MYSQL_USER=melitech_user
MYSQL_PASSWORD=twMH*4dFIQRoT35D@@Xg

# JWT Secret (Change this in production!)
JWT_SECRET=ro5A_c25AwsQHy30Dqg6VAbqQHmeezt1Xfx-e37ApnE

# Local Authentication Mode
AUTH_MODE=local
VITE_APP_ID=standalone
OAUTH_SERVER_URL=http://localhost:3000
VITE_OAUTH_PORTAL_URL=http://localhost:3000

# Owner Configuration
OWNER_OPEN_ID=admin
OWNER_NAME=Administrator

# Application Settings
VITE_APP_TITLE=Melitech Solutions CRM
VITE_APP_LOGO=https://example.com/logo.png

# Port Configuration
DB_PORT=3307
APP_PORT=3000
EOF
```

### Step 2: Start Docker Services

```bash
# Using the full-featured docker-compose.yml (RECOMMENDED)
docker-compose up -d

# Or use the simplified version
docker-compose -f docker-compose(skipvite).yml up -d

# Wait for services to start (30-60 seconds)
sleep 30

# Check status
docker-compose ps
```

### Step 3: Verify Database Initialization

```bash
# Check application logs
docker-compose logs app

# Expected output:
# [Startup] 🚀 Starting Melitech CRM...
# [Startup] ⏳ Waiting for database to be ready...
# [Startup] ✅ Database is ready!
# [Startup] 🗄️  Running database migrations...
# [Database] ✅ Migrations completed successfully
# [Startup] 🎯 Starting application...
# Server running on http://localhost:3000/
```

### Step 4: Access Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the Melitech CRM login page.

### Step 5: Create Your First Account

1. Click **"Sign in to Continue"**
2. Click **"Don't have an account? Sign up"**
3. Fill in the form:
   - **Name**: Your Full Name
   - **Email**: your-email@example.com
   - **Password**: Your secure password (min 6 characters)
4. Click **"Create Account"**
5. You'll be logged in to the dashboard ✅

---

## Local Authentication Features

### User Registration
- Self-service account creation
- Email-based accounts
- Password hashing with bcrypt
- Role-based access control

### User Roles
- **admin** - Full system access
- **user** - Standard user access
- **staff** - Staff member access
- **accountant** - Accounting module access
- **client** - Client portal access
- **super_admin** - System administrator

### Session Management
- JWT-based sessions
- Secure HTTP-only cookies
- Automatic session expiration
- Remember me functionality

---

## Database Configuration

### Connection Details

| Property | Value |
|----------|-------|
| Host | localhost |
| Port | 3307 |
| Username | melitech_user |
| Password | twMH*4dFIQRoT35D@@Xg |
| Database | melitech_crm |
| Root Password | FgPrIBA1CYe5wyqD8ogi |

### Connection String

```
mysql://melitech_user:twMH*4dFIQRoT35D@@Xg@localhost:3307/melitech_crm
```

### Access Database

```bash
# Using Docker
docker exec -it melitech_crm_db mysql -u melitech_user -ptwMH*4dFIQRoT35D@@Xg melitech_crm

# Using local MySQL client (if installed)
mysql -h localhost -P 3307 -u melitech_user -ptwMH*4dFIQRoT35D@@Xg melitech_crm

# Using database access script
./scripts/db-access.sh shell
```

---

## Comparison: docker-compose Files

### docker-compose(skipvite).yml (Simplified)

```yaml
services:
  db:
    image: mysql:8.0
    container_name: melitech_crm_db
    ports: ["3307:3306"]
    
  app:
    build: .
    container_name: melitech_crm_app
    ports: ["3000:3000"]
    depends_on: [db]
```

**Pros**:
- ✅ Minimal, fast to start
- ✅ Easy to understand
- ✅ Good for development

**Cons**:
- ❌ No Redis caching
- ❌ No networking isolation
- ❌ No health checks

### docker-compose.yml (Full Stack - RECOMMENDED)

```yaml
services:
  db:
    image: mysql:8.0
    container_name: melitech_crm_db
    ports: ["3307:3306"]
    networks: [melitech-network]
    
  app:
    build: .
    container_name: melitech_crm_app
    ports: ["3000:3000"]
    depends_on: [db]
    networks: [melitech-network]
    healthcheck: ...
    
  redis:
    image: redis:7-alpine
    container_name: melitech_crm_redis
    ports: ["6379:6379"]
    networks: [melitech-network]

networks:
  melitech-network:
    driver: bridge
```

**Pros**:
- ✅ Redis caching for performance
- ✅ Network isolation
- ✅ Health checks
- ✅ Production-ready
- ✅ Better resource management

**Cons**:
- ❌ Slightly more complex
- ❌ Requires more resources

---

## Startup Flow

### Phase 1: Docker Initialization (10-20 seconds)
```
1. Docker starts MySQL container
2. MySQL initializes database
3. init.sql runs (character encoding setup)
4. MySQL health check passes
```

### Phase 2: Application Startup (30-40 seconds)
```
1. Docker builds application image
2. Dependencies install
3. Application starts
4. Waits for database readiness
5. Runs init-db.ts (Drizzle migrations)
6. Creates all database tables (users, clients, invoices, etc.)
7. Express server starts
8. Application ready at http://localhost:3000
```

**Total Time**: 2-3 minutes from `docker-compose up -d` to ready

---

## Common Tasks

### Create Admin User

```bash
# Connect to database
./scripts/db-access.sh shell

# Run SQL to promote user to admin
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Reset User Password

```bash
# Connect to database
./scripts/db-access.sh shell

# Update password (requires hash)
# Use the application's password reset feature instead
```

### View All Users

```bash
./scripts/db-access.sh query "SELECT id, email, name, role, createdAt FROM users;"
```

### Backup Database

```bash
./scripts/db-access.sh backup
```

### Restore Database

```bash
./scripts/db-access.sh restore backups/melitech_crm_20231209_120000.sql
```

---

## Troubleshooting

### Issue: "Failed query: select ... from `users`"

**Cause**: Database tables not created

**Solution**:
```bash
# Check logs
docker-compose logs app

# Rebuild and restart
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
sleep 30
docker-compose logs app
```

### Issue: "Cannot connect to database"

**Cause**: Database container not running or not ready

**Solution**:
```bash
# Check database status
docker-compose ps

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
sleep 10
docker-compose logs app
```

### Issue: "Port 3307 already in use"

**Cause**: Another service using the port

**Solution**:
```bash
# Edit .env file and change DB_PORT
DB_PORT=3308

# Restart services
docker-compose down
docker-compose up -d
```

### Issue: "Application won't start"

**Cause**: Various startup issues

**Solution**:
```bash
# View detailed logs
docker-compose logs -f app

# Check database initialization
docker-compose logs app | grep "Database\|Migrations"

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

---

## Security Best Practices

### 1. Change Default Credentials

**Before Production**, update `.env`:
```env
MYSQL_ROOT_PASSWORD=your-strong-root-password
MYSQL_PASSWORD=your-strong-app-password
JWT_SECRET=your-strong-jwt-secret
```

### 2. Use Strong Passwords

- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Avoid common words

### 3. Enable HTTPS

In production, use SSL/TLS certificates:
```bash
# Use reverse proxy (nginx, Apache)
# or Let's Encrypt with certbot
```

### 4. Restrict Database Access

```bash
# Only expose database to app container
# Don't expose port 3307 in production
# Use network isolation
```

### 5. Regular Backups

```bash
# Automated daily backups
0 2 * * * cd /path/to/melitech_crm && ./scripts/db-access.sh backup
```

### 6. Monitor Logs

```bash
# Check logs regularly
docker-compose logs app | grep -i error
```

---

## Environment Variables Reference

### Required

```env
MYSQL_ROOT_PASSWORD=your-root-password
MYSQL_USER=melitech_user
MYSQL_PASSWORD=your-app-password
DATABASE_URL=mysql://melitech_user:password@db:3306/melitech_crm
JWT_SECRET=your-jwt-secret
```

### Optional

```env
NODE_ENV=production
AUTH_MODE=local
VITE_APP_ID=standalone
VITE_APP_TITLE=Melitech Solutions CRM
VITE_APP_LOGO=https://example.com/logo.png
DB_PORT=3307
APP_PORT=3000
```

---

## Docker Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app

# Restart services
docker-compose restart

# Remove everything (WARNING: deletes data)
docker-compose down -v

# Check status
docker-compose ps

# Execute command in container
docker-compose exec app node dist/index.js

# View container resource usage
docker stats melitech_crm_app
```

---

## File Structure

```
melitech_crm/
├── docker-compose.yml              # Full-stack (RECOMMENDED)
├── docker-compose(skipvite).yml    # Simplified
├── Dockerfile                      # Container build
├── init-db.ts                      # Database initialization
├── .env                            # Environment variables
├── scripts/
│   ├── db-access.sh               # Database utility
│   └── init.sql                   # Database setup
├── drizzle/
│   ├── schema.ts                  # Database schema
│   └── migrations/                # Drizzle migrations
├── server/
│   ├── db.ts                      # Database helpers
│   ├── routers.ts                 # API routes
│   └── _core/
│       └── index.ts               # Server entry point
└── client/
    ├── src/
    │   ├── App.tsx                # React app
    │   └── pages/                 # Page components
    └── index.html                 # HTML entry point
```

---

## Next Steps

1. ✅ Choose docker-compose configuration (recommended: full-stack)
2. ✅ Create `.env` file with your credentials
3. ✅ Run `docker-compose up -d`
4. ✅ Wait 2-3 minutes for startup
5. ✅ Access http://localhost:3000
6. ✅ Create your first account
7. ✅ Start using the CRM

---

## Support

For issues or questions:

1. Check logs: `docker-compose logs app`
2. Review DATABASE_ACCESS_GUIDE.md
3. Check CODE_UPDATES_MEMORY.md for technical details
4. Consult troubleshooting section above

---

**Status**: ✅ Ready for Production  
**Last Reviewed**: December 9, 2025  
**Next Review**: December 16, 2025
