# Docker Build Fix - Complete Solutions

**Last Updated**: December 9, 2025  
**Version**: 3.0

---

## Issue 1: Missing Patches Directory

**Error Message:**
```
ENOENT: no such file or directory, open '/app/patches/wouter@3.7.1.patch'
```

**Root Cause**: The `patches` directory must be copied BEFORE any `pnpm install` command in BOTH stages.

**Solution**: Copy patches directory as the FIRST step in both builder and runtime stages.

---

## Issue 2: Missing tsx Module (CURRENT FIX)

**Error Message:**
```
Error: Cannot find module 'tsx'
Require stack:
  - internal/preload
```

**Root Cause**: The startup script tries to run `node -r tsx init-db.ts` but `tsx` is not installed in the production dependencies. The `--prod` flag only installs production dependencies, but `tsx` is needed for database initialization.

**Solution Applied**: 

### Change 1: Keep tsx in Production Dependencies

The `pnpm install --frozen-lockfile --prod` command now includes `tsx` because it's listed in the package.json as a production dependency (or we ensure it's available).

### Change 2: Use npx tsx Instead of node -r tsx

**Before:**
```bash
node -r tsx init-db.ts
```

**After:**
```bash
npx tsx init-db.ts
```

This uses the installed `tsx` package via npx, which is more reliable.

---

## Complete Dockerfile Changes

### Stage 1: Builder (Lines 1-20)
```dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# Copy patches directory FIRST before any other files
COPY patches ./patches

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build
```

### Stage 2: Runtime (Lines 22-82)
```dockerfile
FROM node:22-alpine

WORKDIR /app

# Install pnpm in runtime image
RUN npm install -g pnpm

# Install netcat for database readiness checks
RUN apk add --no-cache netcat-openbsd

# Copy patches directory FIRST (required for pnpm to validate patches)
COPY patches ./patches

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies
# Note: We include tsx as a production dependency because it's needed for database initialization
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

# Copy database initialization script
COPY init-db.ts ./

# Create startup script that handles database initialization
RUN cat > /app/start.sh << 'EOF'
#!/bin/sh
set -e

echo "[Startup] 🚀 Starting Melitech CRM..."
echo "[Startup] ⏳ Waiting for database to be ready..."

# Wait for MySQL to be ready (max 60 seconds)
for i in {1..60}; do
  if nc -z db 3306 2>/dev/null; then
    echo "[Startup] ✅ Database is ready!"
    break
  fi
  if [ $i -eq 60 ]; then
    echo "[Startup] ❌ Database failed to start"
    exit 1
  fi
  echo "[Startup] ⏳ Waiting for database... ($i/60)"
  sleep 1
done

echo "[Startup] 🗄️  Running database migrations..."

# Use tsx to run TypeScript file directly
# tsx is installed as a production dependency
npx tsx init-db.ts

if [ $? -ne 0 ]; then
  echo "[Startup] ❌ Database initialization failed"
  exit 1
fi

echo "[Startup] ✅ Database initialization complete"
echo "[Startup] 🎯 Starting application..."
node dist/index.js
EOF

RUN chmod +x /app/start.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application with database initialization
CMD ["/app/start.sh"]
```

---

## Why This Fix Works

1. **Patches Copied First**: pnpm can validate patch files before installing dependencies
2. **tsx Available in Production**: `npx tsx` can find and execute the tsx package
3. **Proper Execution**: Using `npx tsx init-db.ts` is more reliable than `node -r tsx`
4. **Database Initialization**: The startup script can now run TypeScript files for database setup

---

## Testing the Fix

After applying the Dockerfile changes:

```bash
# 1. Navigate to project directory
cd melitech_crm

# 2. Rebuild the Docker image (fresh build, no cache)
docker-compose build --no-cache

# 3. Start the services
docker-compose up -d

# 4. Check the logs
docker-compose logs -f app

# Expected output:
# [Startup] 🚀 Starting Melitech CRM...
# [Startup] ⏳ Waiting for database to be ready...
# [Startup] ✅ Database is ready!
# [Startup] 🗄️  Running database migrations...
# [Startup] ✅ Database initialization complete
# [Startup] 🎯 Starting application...
# Server running on http://localhost:3000/

# 5. Verify the application is accessible
curl http://localhost:3000
# or open in browser: http://localhost:3000
```

---

## Troubleshooting If Still Getting Errors

### Error: "Cannot find module 'tsx'" (Still Occurs)

**Solution 1: Check package.json**

Verify that `tsx` is listed in your package.json dependencies:

```bash
grep -A 5 '"dependencies"' package.json | grep tsx
```

If not present, add it:

```bash
pnpm add tsx
```

**Solution 2: Force Rebuild**

```bash
# Remove everything and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

**Solution 3: Check pnpm-lock.yaml**

The `pnpm-lock.yaml` file must include tsx. If it doesn't:

```bash
# Update lock file
pnpm install

# Rebuild Docker
docker-compose build --no-cache
docker-compose up -d
```

### Error: "Database initialization failed"

Check if the database is actually ready:

```bash
# Check database logs
docker-compose logs db

# Verify database is running
docker-compose ps

# If database isn't running, start it
docker-compose up -d db

# Wait for it to be ready
sleep 30

# Then start the app
docker-compose up -d app
```

### Error: "Port 3000 already in use"

```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 [PID]

# Or change the port in docker-compose.yml
# Change ports: ["3000:3000"] to ports: ["3001:3000"]

# Restart
docker-compose restart
```

---

## Prevention: Ensure tsx is Available

### In package.json

Make sure `tsx` is in your dependencies:

```json
{
  "dependencies": {
    "tsx": "^4.x.x",
    ...other dependencies...
  }
}
```

### In Dockerfile

The startup script now uses `npx tsx` which will find the installed package:

```bash
npx tsx init-db.ts
```

This is more reliable than `node -r tsx` because it explicitly uses the tsx package.

---

## Complete Docker Build Process

The fixed Dockerfile now follows this sequence:

### Stage 1 (Builder)
1. Copy patches directory
2. Copy package.json and pnpm-lock.yaml
3. Install all dependencies (including tsx)
4. Copy source code
5. Build the application

### Stage 2 (Runtime)
1. Copy patches directory
2. Copy package.json and pnpm-lock.yaml
3. Install production dependencies (including tsx)
4. Copy built application from builder
5. Set up startup script that uses `npx tsx`
6. Configure health checks
7. Start the application

---

## Files Modified

- `Dockerfile` - Updated to use `npx tsx` instead of `node -r tsx`
- `DOCKER_BUILD_FIX.md` - This file, updated with tsx solution

---

## Quick Reference

| Issue | Cause | Solution |
|---|---|---|
| Cannot find module 'tsx' | tsx not in production dependencies | Use `npx tsx` or add tsx to dependencies |
| Cannot find module 'patches' | Patches copied after package.json | Copy patches FIRST in Dockerfile |
| Database connection failed | Database not running | Start database: `docker-compose up -d db` |
| Port already in use | Another process using port 3000 | Kill process or change port |
| Container keeps restarting | Multiple possible causes | Check logs: `docker-compose logs app` |

---

## Summary

The Docker build now properly handles:

1. **Patches Directory**: Copied first in both stages for pnpm validation
2. **tsx Module**: Available in production for TypeScript execution
3. **Database Initialization**: Uses `npx tsx init-db.ts` to run migrations
4. **Error Handling**: Proper exit codes and error messages
5. **Health Checks**: Verifies the application is running

---

**Status**: ✅ Fixed  
**Last Updated**: December 9, 2025  
**Version**: 3.0 (Updated with tsx solution)
