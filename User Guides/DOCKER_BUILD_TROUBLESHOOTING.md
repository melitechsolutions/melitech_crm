# Docker Build Troubleshooting Guide

## Issue: Build Fails with "Unterminated regular expression" Error

### Problem
```
Error processing file /app/client/src/components/MaterialTailwind/FloatingSettingsSidebar.tsx:
SyntaxError: Unterminated regular expression. (452:18)
```

Error shows line 451 without closing brace:
```
451 |                    {logoutMutation.isPending ? "Logging out..." : "Logout"
452 |                  </Button>
```

### Root Cause
Docker is building from an old/cached version of the source code. The file has been fixed, but Docker is using a stale copy.

---

## Solution 1: Clear Docker Cache and Rebuild (Recommended)

### Step 1: Stop and Remove Old Containers
```bash
# Stop all running containers
docker stop $(docker ps -aq)

# Remove all containers
docker rm $(docker ps -aq)

# Remove the old image
docker rmi melitech-crm:latest
```

### Step 2: Clear Docker Build Cache
```bash
# Clear Docker build cache
docker builder prune -a -f

# Or use buildx if available
docker buildx prune -a -f
```

### Step 3: Rebuild with No Cache
```bash
# Build with --no-cache flag to ignore cache
docker build --no-cache -t melitech-crm:latest .

# Or with buildx
docker buildx build --no-cache -t melitech-crm:latest .
```

### Step 4: Run Container
```bash
docker run -p 3000:3000 melitech-crm:latest
```

---

## Solution 2: Manual File Replacement

If clearing cache doesn't work, manually replace the file:

### Step 1: Verify Your Extracted Folder
```bash
# Check if the file has the closing brace
grep -A 1 "Logging out" melitech_crm/client/src/components/MaterialTailwind/FloatingSettingsSidebar.tsx

# Should show:
# {logoutMutation.isPending ? "Logging out..." : "Logout"}
```

### Step 2: If Missing Closing Brace, Replace File
```bash
# Download the fixed file: FloatingSettingsSidebar_FIXED.tsx
# Replace the broken file:
cp FloatingSettingsSidebar_FIXED.tsx melitech_crm/client/src/components/MaterialTailwind/FloatingSettingsSidebar.tsx
```

### Step 3: Rebuild
```bash
cd melitech_crm
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
docker build --no-cache -t melitech-crm:latest .
```

---

## Solution 3: Verify File Content

### Check Line 451 in Your Extracted Folder
```bash
# On Windows (PowerShell)
Get-Content melitech_crm/client/src/components/MaterialTailwind/FloatingSettingsSidebar.tsx -TotalCount 451 | Select-Object -Last 5

# On macOS/Linux
sed -n '447,455p' melitech_crm/client/src/components/MaterialTailwind/FloatingSettingsSidebar.tsx
```

**Expected Output**:
```
                  )}
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </div>
            </>
```

Notice the closing brace `}` after `"Logout"` on line 451.

---

## Solution 4: Complete Fresh Start

If all else fails, start completely fresh:

### Step 1: Delete Everything
```bash
# Remove old extracted folder
rm -rf melitech_crm

# Remove Docker containers and images
docker rm $(docker ps -aq)
docker rmi $(docker images -q)

# Clear all Docker cache
docker system prune -a -f
```

### Step 2: Extract Fresh Zip
```bash
# Extract the latest melitech_crm_updated.zip
unzip melitech_crm_updated.zip
cd melitech_crm
```

### Step 3: Verify Fix
```bash
# Verify line 451 has closing brace
sed -n '451p' client/src/components/MaterialTailwind/FloatingSettingsSidebar.tsx
# Should output: {logoutMutation.isPending ? "Logging out..." : "Logout"}
```

### Step 4: Install and Build
```bash
pnpm install
pnpm build
docker build --no-cache -t melitech-crm:latest .
docker run -p 3000:3000 melitech-crm:latest
```

---

## Verification Checklist

After attempting a solution, verify:

- [ ] Old containers removed
- [ ] Docker cache cleared
- [ ] Fresh extraction from latest zip
- [ ] Line 451 has closing brace `}`
- [ ] `pnpm build` completes without syntax errors
- [ ] Docker build completes successfully
- [ ] Container starts without errors
- [ ] Application accessible at http://localhost:3000

---

## The Correct Code

### Line 451 (CORRECT - with closing brace)
```tsx
{logoutMutation.isPending ? "Logging out..." : "Logout"}
```

### Line 451 (INCORRECT - without closing brace)
```tsx
{logoutMutation.isPending ? "Logging out..." : "Logout"
```

---

## Docker Build Command Reference

### Standard Build
```bash
docker build -t melitech-crm:latest .
```

### Build with No Cache
```bash
docker build --no-cache -t melitech-crm:latest .
```

### Build with Progress Output
```bash
docker build --progress=plain -t melitech-crm:latest .
```

### Build with Buildx (Multi-platform)
```bash
docker buildx build --no-cache -t melitech-crm:latest .
```

### Run Container
```bash
docker run -p 3000:3000 melitech-crm:latest
```

### Run with Environment Variables
```bash
docker run -p 3000:3000 \
  -e VITE_API_URL=http://localhost:3001 \
  melitech-crm:latest
```

---

## Common Docker Issues

### Issue: "Docker daemon is not running"
**Solution**: Start Docker Desktop or Docker service

### Issue: "Permission denied while trying to connect to Docker daemon"
**Solution**: 
```bash
# On Linux, add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Issue: "Port 3000 already in use"
**Solution**: Use different port
```bash
docker run -p 3001:3000 melitech-crm:latest
```

### Issue: "Out of disk space"
**Solution**: Clean up Docker
```bash
docker system prune -a -f
```

---

## Files Provided

- `FloatingSettingsSidebar_FIXED.tsx` - Correct version of the file with fix applied
- `melitech_crm_updated.zip` - Complete project with all fixes

---

## Support

If you continue to experience issues:

1. Verify you're using the latest zip file
2. Ensure line 451 has the closing brace
3. Clear all Docker cache and rebuild
4. Try a complete fresh start
5. Check Docker logs: `docker logs <container_id>`

---

**Last Updated**: December 22, 2025
**Status**: Troubleshooting Guide Complete
