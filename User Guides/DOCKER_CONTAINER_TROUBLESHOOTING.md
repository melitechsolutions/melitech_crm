# Docker Container Troubleshooting Guide

## Issue: Container is Restarting - "wait until the container is running"

**Error Message:**
```
Error response from daemon: Container [ID] is restarting, wait until the container is running
```

This error occurs when Docker is trying to restart a container that keeps failing. The container enters a restart loop because of an error that happens during startup.

---

## Quick Fix (Try This First)

### Step 1: Wait for Container to Stabilize

The simplest solution is to wait:

```bash
# Wait 30-60 seconds for the container to stabilize
sleep 60

# Then check the status
docker ps -a
```

If the container is still restarting, proceed to Step 2.

### Step 2: Check Container Logs

View the error messages to understand why the container is restarting:

```bash
# View the last 50 lines of logs
docker logs [CONTAINER_ID] --tail 50

# View logs in real-time
docker logs -f [CONTAINER_ID]

# View all logs with timestamps
docker logs --timestamps [CONTAINER_ID]
```

Replace `[CONTAINER_ID]` with the actual container ID or name.

### Step 3: Stop the Container

If the container is stuck in a restart loop:

```bash
# Stop the container
docker stop [CONTAINER_ID]

# Or force stop if it won't respond
docker kill [CONTAINER_ID]
```

### Step 4: Inspect the Container

Get more details about the container:

```bash
# View container details
docker inspect [CONTAINER_ID]

# View just the restart policy
docker inspect [CONTAINER_ID] | grep -A 5 "RestartPolicy"

# View the last exit code
docker inspect [CONTAINER_ID] | grep "ExitCode"
```

---

## Common Causes and Solutions

### Cause 1: Database Connection Failed

**Symptoms:**
- Logs show "Cannot connect to database"
- Logs show "ECONNREFUSED" or "Connection refused"

**Solution:**

```bash
# Check if database container is running
docker ps | grep db

# If database isn't running, start it
docker-compose up -d db

# Wait for database to be ready (30-60 seconds)
sleep 60

# Then start the app container
docker-compose up -d app

# Check logs
docker logs [APP_CONTAINER_ID]
```

### Cause 2: Port Already in Use

**Symptoms:**
- Logs show "EADDRINUSE" or "Port 3000 already in use"
- Logs show "bind: address already in use"

**Solution:**

```bash
# Find what's using port 3000
lsof -i :3000
# or on Windows:
netstat -ano | findstr :3000

# Kill the process using that port
kill -9 [PID]

# Or change the port in docker-compose.yml
# Change: ports: ["3000:3000"]
# To:     ports: ["3001:3000"]

# Then restart
docker-compose restart app
```

### Cause 3: Out of Memory

**Symptoms:**
- Logs show "OOMKilled" or "Out of memory"
- Container keeps restarting immediately

**Solution:**

```bash
# Check Docker memory usage
docker stats

# Increase Docker memory limit
# On Docker Desktop:
# 1. Open Docker Desktop settings
# 2. Go to Resources
# 3. Increase Memory slider
# 4. Click Apply & Restart

# Or restart with memory limit
docker run -m 2g [IMAGE_NAME]
```

### Cause 4: Missing Environment Variables

**Symptoms:**
- Logs show "undefined" or "missing environment variable"
- Logs show "Cannot read property of undefined"

**Solution:**

```bash
# Check if .env file exists
ls -la .env

# View environment variables in container
docker exec [CONTAINER_ID] env

# Add missing variables to .env file
echo "DATABASE_URL=mysql://user:pass@db:3306/melitech" >> .env
echo "JWT_SECRET=your-secret-key" >> .env

# Rebuild and restart
docker-compose down
docker-compose up -d
```

### Cause 5: File Permissions Issue

**Symptoms:**
- Logs show "EACCES" or "Permission denied"
- Logs show "Cannot read file"

**Solution:**

```bash
# Check file permissions
ls -la [FILE_PATH]

# Fix permissions
chmod 644 [FILE_PATH]
chmod 755 [DIRECTORY_PATH]

# Or fix all permissions
sudo chown -R $USER:$USER .

# Restart container
docker-compose restart
```

### Cause 6: Corrupted Docker Image

**Symptoms:**
- Container keeps restarting no matter what
- Logs are empty or unhelpful

**Solution:**

```bash
# Remove the container and image
docker-compose down --rmi all

# Rebuild the image
docker-compose build --no-cache

# Start fresh
docker-compose up -d

# Check logs
docker-compose logs -f
```

---

## Step-by-Step Troubleshooting Process

Follow this process to identify and fix the issue:

### Step 1: Gather Information

```bash
# Get container ID
docker ps -a | grep melitech

# Get detailed status
docker inspect [CONTAINER_ID] | grep -E "State|Status|ExitCode"

# Get recent logs
docker logs [CONTAINER_ID] --tail 100 > /tmp/container_logs.txt
cat /tmp/container_logs.txt
```

### Step 2: Identify the Error

Look for these keywords in the logs:

| Error Type | What to Look For |
|---|---|
| Database | "Cannot connect", "ECONNREFUSED", "Connection refused" |
| Port | "EADDRINUSE", "address already in use", "bind" |
| Memory | "OOMKilled", "Out of memory", "ENOMEM" |
| Environment | "undefined", "missing", "Cannot read property" |
| File | "EACCES", "Permission denied", "ENOENT" |
| Build | "Build failed", "npm ERR!", "Error: Cannot find module" |

### Step 3: Apply the Appropriate Fix

Based on the error type, apply the solution from the "Common Causes" section above.

### Step 4: Verify the Fix

```bash
# Check if container is running
docker ps | grep melitech

# Check the logs
docker logs [CONTAINER_ID] --tail 20

# Test the application
curl http://localhost:3000
# or open in browser: http://localhost:3000
```

---

## Advanced Troubleshooting

### Check Docker Daemon Status

```bash
# On Linux
sudo systemctl status docker

# On Mac
docker info

# On Windows
# Open Docker Desktop and check the status indicator
```

### View Docker Events

```bash
# Watch Docker events in real-time
docker events

# Filter for your container
docker events --filter "container=[CONTAINER_ID]"
```

### Check System Resources

```bash
# View CPU and memory usage
docker stats

# View disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

### Rebuild Everything from Scratch

If nothing else works:

```bash
# Stop all containers
docker-compose down

# Remove all volumes (WARNING: deletes data!)
docker-compose down -v

# Remove all images
docker rmi $(docker images -q)

# Clean up system
docker system prune -a --volumes

# Rebuild
docker-compose build --no-cache

# Start fresh
docker-compose up -d

# Check logs
docker-compose logs -f
```

---

## Prevention Tips

### Tip 1: Use Health Checks

Add health checks to your docker-compose.yml:

```yaml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Tip 2: Set Restart Policy

Control how Docker handles restarts:

```yaml
services:
  app:
    restart_policy:
      condition: on-failure
      delay: 5s
      max_attempts: 5
```

### Tip 3: Monitor Logs

Keep an eye on logs during development:

```bash
# Watch logs in real-time
docker-compose logs -f app

# Or in a separate terminal
docker logs -f [CONTAINER_ID]
```

### Tip 4: Use Environment Files

Keep environment variables in a .env file:

```bash
# Create .env file
cat > .env << EOF
DATABASE_URL=mysql://user:pass@db:3306/melitech
JWT_SECRET=your-secret-key
NODE_ENV=production
EOF

# Docker-compose automatically loads this
docker-compose up -d
```

### Tip 5: Regular Backups

Before making changes, backup your data:

```bash
# Backup database
docker-compose exec db mysqldump -u root -p melitech > backup.sql

# Backup volumes
docker run --rm -v melitech_db_data:/data -v $(pwd):/backup \
  ubuntu tar czf /backup/db_backup.tar.gz /data
```

---

## Getting Help

If you're still stuck, gather this information:

1. **Container ID**: `docker ps -a | grep melitech`
2. **Full logs**: `docker logs [CONTAINER_ID] > logs.txt`
3. **Docker version**: `docker --version`
4. **Docker-compose version**: `docker-compose --version`
5. **System info**: `docker info`
6. **Recent changes**: What did you change before the error started?

Share this information with your support team.

---

## Quick Reference Commands

```bash
# View all containers
docker ps -a

# View logs
docker logs [CONTAINER_ID]

# Stop container
docker stop [CONTAINER_ID]

# Start container
docker start [CONTAINER_ID]

# Restart container
docker restart [CONTAINER_ID]

# Remove container
docker rm [CONTAINER_ID]

# View container details
docker inspect [CONTAINER_ID]

# Execute command in container
docker exec [CONTAINER_ID] [COMMAND]

# View resource usage
docker stats

# Clean up unused resources
docker system prune

# Docker-compose commands
docker-compose up -d          # Start services
docker-compose down           # Stop services
docker-compose logs -f        # View logs
docker-compose restart        # Restart services
docker-compose ps             # View status
```

---

## Summary

When your container keeps restarting:

1. **Wait** 30-60 seconds for it to stabilize
2. **Check logs** to identify the error
3. **Stop the container** if needed
4. **Match the error** to a cause in this guide
5. **Apply the fix** for that cause
6. **Verify** the container is running
7. **Ask for help** if you're still stuck

Most restart issues are caused by database connection problems, port conflicts, or missing environment variables. Check those first!

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Author**: Manus AI
