# Melitech CRM - Windows Deployment Troubleshooting Guide

**Version**: 1.0  
**Last Updated**: December 2025  
**Author**: Manus AI  
**Platform**: Windows 10/11

This guide helps you troubleshoot common issues when deploying Melitech CRM on Windows.

---

## Quick Troubleshooting Flowchart

**Is the application running?**
- Yes → Go to "Application Issues"
- No → Go to "Docker Issues"

**Can you access http://localhost:3000?**
- Yes → Go to "Application Issues"
- No → Go to "Network Issues"

**Is the database running?**
- Yes → Go to "Database Issues"
- No → Go to "Docker Issues"

---

## Docker Issues

### Issue 1: "docker: command not found" or "docker is not recognized"

**Symptoms**: When you run `docker --version`, you get an error saying docker is not found.

**Causes**:
- Docker is not installed
- Docker is not in your system PATH
- PowerShell/Command Prompt needs to be restarted

**Solutions**:

**Solution 1: Install Docker Desktop**

1. Download Docker Desktop from https://www.docker.com/products/docker-desktop
2. Run the installer
3. Follow the installation wizard
4. Restart your computer
5. Open a new PowerShell or Command Prompt window
6. Try `docker --version` again

**Solution 2: Add Docker to PATH (if already installed)**

1. Open PowerShell as Administrator
2. Run:
```powershell
$env:Path = "C:\Program Files\Docker\Docker\resources\bin;" + $env:Path
```

3. Try `docker --version` again

**Solution 3: Restart PowerShell/Command Prompt**

Sometimes just restarting the terminal window helps:

1. Close PowerShell or Command Prompt
2. Open a new window
3. Try `docker --version` again

---

### Issue 2: "Cannot connect to Docker daemon"

**Symptoms**: You get an error like "Cannot connect to Docker daemon. Is the docker daemon running?"

**Causes**:
- Docker Desktop is not running
- Docker service is stopped
- Docker Desktop crashed

**Solutions**:

**Solution 1: Start Docker Desktop**

1. Click the Windows Start menu
2. Search for "Docker Desktop"
3. Click to open it
4. Wait for Docker to start (you'll see the Docker icon in the system tray)
5. Try your command again

**Solution 2: Check Docker Service**

In PowerShell (Admin):

```powershell
# Check Docker service status
Get-Service Docker

# If stopped, start it
Start-Service Docker
```

In Command Prompt (Admin):

```cmd
REM Check Docker service status
sc query Docker

REM If stopped, start it
net start Docker
```

**Solution 3: Restart Docker Desktop**

1. Right-click the Docker icon in system tray
2. Click "Quit Docker Desktop"
3. Wait 10 seconds
4. Open Docker Desktop again
5. Wait for it to fully start
6. Try your command again

---

### Issue 3: "Docker Desktop requires Windows Subsystem for Linux 2"

**Symptoms**: Docker Desktop won't start and shows an error about WSL 2.

**Causes**:
- WSL 2 is not installed
- WSL 2 kernel is not updated

**Solutions**:

**Solution 1: Install WSL 2**

In PowerShell (Admin):

```powershell
# Enable WSL
wsl --install

# Restart your computer
Restart-Computer
```

**Solution 2: Update WSL 2 Kernel**

In PowerShell (Admin):

```powershell
# Download and install WSL 2 kernel
wsl --update

# Restart your computer
Restart-Computer
```

**Solution 3: Use Hyper-V Instead**

If WSL 2 doesn't work, use Hyper-V:

1. Open Docker Desktop
2. Go to Settings → Resources
3. Uncheck "Use the WSL 2 based engine"
4. Check "Use Hyper-V"
5. Click "Apply & Restart"

---

### Issue 4: "Out of memory" or "No space left on device"

**Symptoms**: Docker containers keep crashing or you get out of memory errors.

**Causes**:
- Docker allocated insufficient resources
- Disk space is full
- Too many Docker images/containers

**Solutions**:

**Solution 1: Increase Docker Resources**

1. Open Docker Desktop
2. Click the Docker icon in system tray
3. Select "Settings"
4. Go to "Resources"
5. Increase "Memory" slider (set to at least 4GB)
6. Increase "CPU" slider (set to at least 2 cores)
7. Click "Apply & Restart"

**Solution 2: Free Up Disk Space**

In PowerShell:

```powershell
# Check disk space
Get-Volume

# Delete Docker unused resources
docker system prune -a

# Check again
Get-Volume
```

In Command Prompt:

```cmd
REM Check disk space
wmic logicaldisk get name,size,freespace

REM Delete Docker unused resources
docker system prune -a
```

**Solution 3: Clean Up Docker Images**

```powershell
# PowerShell
docker image prune -a

# Command Prompt
docker image prune -a
```

---

## Port Issues

### Issue 5: "Port 3000 is already in use"

**Symptoms**: You get an error like "Bind for 0.0.0.0:3000 failed: port is already allocated"

**Causes**:
- Another application is using port 3000
- A previous Docker container is still running

**Solutions**:

**Solution 1: Find and Stop the Conflicting Application**

In PowerShell:

```powershell
# Find what's using port 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess

# Get the process name
Get-Process -Id <PID>

# Kill the process (replace <PID> with the actual process ID)
Stop-Process -Id <PID> -Force
```

In Command Prompt:

```cmd
REM Find what's using port 3000
netstat -ano | findstr :3000

REM Kill the process (replace <PID> with the actual process ID)
taskkill /PID <PID> /F
```

**Solution 2: Change the Port**

Edit `docker-compose.yml`:

1. Open `docker-compose.yml` in Notepad
2. Find the line: `ports: ["3000:3000"]`
3. Change to: `ports: ["3001:3000"]`
4. Save the file
5. Restart Docker: `docker-compose restart`
6. Access at `http://localhost:3001`

**Solution 3: Stop Previous Docker Containers**

```powershell
# PowerShell
docker-compose down

# Command Prompt
docker-compose down
```

---

### Issue 6: "Port 3306 is already in use"

**Symptoms**: Database container won't start because port 3306 is in use.

**Causes**:
- MySQL is already running on your computer
- A previous Docker container is still using the port

**Solutions**:

**Solution 1: Stop MySQL Service**

In PowerShell (Admin):

```powershell
# Check if MySQL service is running
Get-Service MySQL*

# Stop the service
Stop-Service MySQL*
```

In Command Prompt (Admin):

```cmd
REM Stop MySQL service
net stop MySQL*
```

**Solution 2: Change the Port in docker-compose.yml**

1. Open `docker-compose.yml` in Notepad
2. Find the database service ports section
3. Change: `ports: ["3306:3306"]` to `ports: ["3307:3306"]`
4. Update DATABASE_URL in .env: Change `localhost:3306` to `localhost:3307`
5. Save both files
6. Restart: `docker-compose restart`

---

## Database Issues

### Issue 7: "Cannot connect to database"

**Symptoms**: Application starts but shows database connection error.

**Causes**:
- Database container is not running
- Database credentials are wrong
- Database is not ready yet

**Solutions**:

**Solution 1: Check if Database is Running**

```powershell
# PowerShell
docker-compose ps

# Command Prompt
docker-compose ps
```

Look for the `db` service. If it's not showing "Up", start it:

```powershell
# PowerShell
docker-compose up -d db

# Command Prompt
docker-compose up -d db
```

Wait 30 seconds for database to start.

**Solution 2: Verify Database Credentials**

1. Open `.env` file in Notepad
2. Check the `DATABASE_URL` line
3. Verify the format: `mysql://username:password@db:3306/melitech`
4. Make sure there are no typos
5. Save and restart: `docker-compose restart`

**Solution 3: Check Database Logs**

```powershell
# PowerShell
docker-compose logs db

# Command Prompt
docker-compose logs db
```

Look for error messages. Common issues:
- "InnoDB: Cannot allocate memory" → Increase Docker memory
- "Port already in use" → See "Port 3306 is already in use" above

**Solution 4: Rebuild Database**

```powershell
# PowerShell
docker-compose down -v
docker-compose up -d db
Start-Sleep -Seconds 30
docker-compose up -d

# Command Prompt
docker-compose down -v
docker-compose up -d db
timeout /t 30
docker-compose up -d
```

---

### Issue 8: "Database initialization failed"

**Symptoms**: Application starts but shows "Database initialization failed" error.

**Causes**:
- Database migrations didn't run
- Database user doesn't have permissions
- Database schema is corrupted

**Solutions**:

**Solution 1: Run Migrations Manually**

```powershell
# PowerShell
docker-compose exec app pnpm db:push

# Command Prompt
docker-compose exec app pnpm db:push
```

**Solution 2: Check Database Permissions**

```powershell
# PowerShell
docker-compose exec db mysql -u root -p$env:MYSQL_ROOT_PASSWORD -e "SHOW GRANTS FOR 'melitech_user'@'%';"

# Command Prompt
docker-compose exec db mysql -u root -p%MYSQL_ROOT_PASSWORD% -e "SHOW GRANTS FOR 'melitech_user'@'%';"
```

**Solution 3: Rebuild Everything**

```powershell
# PowerShell
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Command Prompt
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

---

## Application Issues

### Issue 9: "Cannot access application at localhost:3000"

**Symptoms**: You can't open the application in your browser.

**Causes**:
- Application is not running
- Firewall is blocking access
- Application crashed

**Solutions**:

**Solution 1: Check if Application is Running**

```powershell
# PowerShell
docker-compose ps

# Command Prompt
docker-compose ps
```

If the app container is not "Up", check logs:

```powershell
# PowerShell
docker-compose logs app

# Command Prompt
docker-compose logs app
```

**Solution 2: Allow Through Firewall**

In PowerShell (Admin):

```powershell
# Add firewall rule for port 3000
New-NetFirewallRule -DisplayName "Allow Docker 3000" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000
```

In Command Prompt (Admin):

```cmd
REM Add firewall rule for port 3000
netsh advfirewall firewall add rule name="Allow Docker 3000" dir=in action=allow protocol=tcp localport=3000
```

**Solution 3: Restart Application**

```powershell
# PowerShell
docker-compose restart app

# Command Prompt
docker-compose restart app
```

**Solution 4: Check Browser**

Try these URLs:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://your-computer-name:3000`

If none work, check if Docker is running: `docker ps`

---

### Issue 10: "Application is slow or unresponsive"

**Symptoms**: The application loads slowly or doesn't respond.

**Causes**:
- Insufficient resources
- Database queries are slow
- Network issues

**Solutions**:

**Solution 1: Check Resource Usage**

```powershell
# PowerShell
docker stats

# Command Prompt
docker stats
```

Press `Ctrl+C` to stop. Look for high CPU or memory usage.

**Solution 2: Increase Docker Resources**

1. Open Docker Desktop
2. Settings → Resources
3. Increase Memory and CPU
4. Click "Apply & Restart"

**Solution 3: Optimize Database**

```powershell
# PowerShell
docker-compose exec db mysql -u root -p$env:MYSQL_ROOT_PASSWORD melitech -e "OPTIMIZE TABLE users, clients, invoices;"

# Command Prompt
docker-compose exec db mysql -u root -p%MYSQL_ROOT_PASSWORD% melitech -e "OPTIMIZE TABLE users, clients, invoices;"
```

---

## Network Issues

### Issue 11: "Cannot reach external services"

**Symptoms**: Email not sending, API calls failing, external services not accessible.

**Causes**:
- Internet connection is down
- Firewall is blocking outbound traffic
- DNS is not working

**Solutions**:

**Solution 1: Check Internet Connection**

In PowerShell:

```powershell
# Test internet connection
Test-Connection 8.8.8.8 -Count 1

# Test DNS
Resolve-DnsName google.com
```

In Command Prompt:

```cmd
REM Test internet connection
ping 8.8.8.8

REM Test DNS
nslookup google.com
```

**Solution 2: Check Firewall**

In PowerShell (Admin):

```powershell
# Get firewall status
Get-NetFirewallProfile

# Disable firewall temporarily (for testing only)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled $false
```

**Solution 3: Check Docker Network**

```powershell
# PowerShell
docker network ls
docker network inspect melitech_crm_default

# Command Prompt
docker network ls
docker network inspect melitech_crm_default
```

---

## File and Permission Issues

### Issue 12: "Permission denied" errors

**Symptoms**: You get permission denied errors when running commands.

**Causes**:
- Running without administrator privileges
- File permissions are incorrect

**Solutions**:

**Solution 1: Run as Administrator**

1. Right-click PowerShell or Command Prompt
2. Select "Run as administrator"
3. Try your command again

**Solution 2: Change File Permissions**

In PowerShell:

```powershell
# Give full permissions to current user
$acl = Get-Acl ".env"
$permission = New-Object System.Security.AccessControl.FileSystemAccessRule("$env:USERNAME","FullControl","Allow")
$acl.SetAccessRule($permission)
Set-Acl ".env" $acl
```

---

### Issue 13: "File not found" errors

**Symptoms**: Docker can't find `.env` file or other configuration files.

**Causes**:
- File is in the wrong location
- File name is incorrect (case-sensitive in Docker)
- File was deleted

**Solutions**:

**Solution 1: Verify File Location**

```powershell
# PowerShell
Get-ChildItem -Path ".env"

# Command Prompt
dir .env
```

**Solution 2: Create Missing File**

```powershell
# PowerShell
New-Item -Path ".env" -ItemType File

# Command Prompt
type nul > .env
```

**Solution 3: Check File Name Case**

Docker is case-sensitive. Make sure:
- `.env` (not `.ENV` or `.Env`)
- `docker-compose.yml` (not `docker-compose.yaml`)
- `Dockerfile` (not `dockerfile`)

---

## Backup and Recovery Issues

### Issue 14: "Cannot backup database"

**Symptoms**: Backup command fails or produces empty file.

**Causes**:
- Database is not running
- Insufficient permissions
- Disk space is full

**Solutions**:

**Solution 1: Verify Database is Running**

```powershell
# PowerShell
docker-compose ps

# Command Prompt
docker-compose ps
```

**Solution 2: Create Backup with Correct Syntax**

In PowerShell:

```powershell
# Create backup
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
docker-compose exec -T db mysqldump -u root -p$env:MYSQL_ROOT_PASSWORD melitech | Out-File "backup_$timestamp.sql"

# Verify backup
Get-Item "backup_*.sql"
```

In Command Prompt:

```cmd
REM Create backup
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
docker-compose exec -T db mysqldump -u root -p%MYSQL_ROOT_PASSWORD% melitech > backup_%mydate%_%mytime%.sql

REM Verify backup
dir backup_*.sql
```

---

## Getting Help

### Collect Diagnostic Information

When asking for help, provide:

1. **Docker version**: `docker --version`
2. **Docker Compose version**: `docker-compose --version`
3. **Application logs**: `docker-compose logs app`
4. **Database logs**: `docker-compose logs db`
5. **System info**: `systeminfo` (in Command Prompt)
6. **Error message**: The exact error you're seeing

### Useful Diagnostic Commands

```powershell
# PowerShell - Get all information
Write-Host "=== System Info ===" 
systeminfo

Write-Host "`n=== Docker Info ===" 
docker --version
docker-compose --version
docker ps -a
docker images

Write-Host "`n=== Application Logs ===" 
docker-compose logs app

Write-Host "`n=== Database Logs ===" 
docker-compose logs db

Write-Host "`n=== Docker Stats ===" 
docker stats --no-stream
```

```cmd
REM Command Prompt - Get all information
echo === System Info ===
systeminfo

echo.
echo === Docker Info ===
docker --version
docker-compose --version
docker ps -a
docker images

echo.
echo === Application Logs ===
docker-compose logs app

echo.
echo === Database Logs ===
docker-compose logs db

echo.
echo === Docker Stats ===
docker stats --no-stream
```

---

## Quick Reference: Common Fixes

| Issue | Quick Fix |
|---|---|
| Docker not found | Install Docker Desktop or restart PowerShell |
| Cannot connect to daemon | Start Docker Desktop |
| Port already in use | Change port in docker-compose.yml or kill process |
| Out of memory | Increase Docker memory in Settings |
| Database connection failed | Check .env DATABASE_URL and restart db |
| Application won't start | Check logs: `docker-compose logs app` |
| Slow performance | Increase Docker resources |
| Cannot access localhost:3000 | Check firewall and verify app is running |
| Permission denied | Run PowerShell as Administrator |
| File not found | Verify file location and name |

---

## When to Seek Help

Contact your system administrator or support team if:

1. You've tried all solutions above and still have issues
2. You're getting error messages you don't understand
3. The application works but behaves unexpectedly
4. You need help with production deployment
5. You need to recover from a failed deployment

Provide the diagnostic information from "Collect Diagnostic Information" section above.

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Author**: Manus AI  
**Platform**: Windows 10/11
