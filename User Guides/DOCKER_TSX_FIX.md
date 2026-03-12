# Docker "Cannot find module 'tsx'" - Fix Guide

## Problem
When running Docker containers, you may see the error:
```
Error: Cannot find module 'tsx'
Require stack:
- internal/preload
```

This happens during database initialization when the container tries to run migrations.

## Root Cause
The `tsx` package (TypeScript executor) is listed in `devDependencies` but Docker was installing only production dependencies using `--prod` flag. This caused `tsx` to not be available at runtime.

## Solution

### What Was Fixed
The Dockerfile has been updated to:

1. **Install all dependencies** (not just production dependencies)
   - Changed from: `pnpm install --frozen-lockfile --prod`
   - Changed to: `pnpm install --frozen-lockfile`
   - This ensures `tsx` is available in the container

2. **Use npx to run tsx**
   - Changed from: `node -r tsx init-db.ts`
   - Changed to: `npx tsx init-db.ts`
   - This ensures tsx is found even if not in PATH

### Files Modified
- `Dockerfile` - Lines 39-41 and 73

## How to Use the Fixed Version

### Windows Docker Setup
```batch
SETUP-DOCKER-WINDOWS.bat
```

### Linux Docker Setup
```bash
./setup-docker-linux.sh
```

## Testing the Fix

### Check if containers start correctly
```bash
# Windows
docker-compose logs app

# Linux
docker-compose logs app
```

### Expected output
```
[Startup] 🚀 Starting Melitech CRM...
[Startup] ⏳ Waiting for database to be ready...
[Startup] ✅ Database is ready!
[Startup] 🗄️  Running database migrations...
[Startup] ✅ Database initialization complete
[Startup] 🎯 Starting application...
```

### If you still see the error

1. **Clean up Docker**
   ```bash
   docker-compose down
   docker system prune -a
   ```

2. **Rebuild from scratch**
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

3. **Check logs**
   ```bash
   docker-compose logs -f app
   ```

## Why This Happens

- `tsx` is a dev dependency used for TypeScript execution
- Database initialization scripts are written in TypeScript
- Even in production, we need `tsx` to run these migrations
- The `--prod` flag excluded dev dependencies, breaking the startup

## Prevention

For future projects:
1. Either move `tsx` to regular dependencies if needed at runtime
2. Or pre-compile TypeScript files to JavaScript
3. Or include dev dependencies in Docker (as we do now)

## Performance Note

Including dev dependencies increases Docker image size by ~50-100MB, but this is acceptable for:
- Database initialization
- Development environments
- Staging environments

For minimal production images, consider pre-compiling database scripts to JavaScript.

## Additional Resources

- [tsx Documentation](https://tsx.is/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [pnpm Install Flags](https://pnpm.io/cli/install)

