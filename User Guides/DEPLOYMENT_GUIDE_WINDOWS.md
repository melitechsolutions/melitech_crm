# Melitech CRM - Windows Deployment Guide

**Version**: 1.0  
**Last Updated**: December 2025  
**Author**: Manus AI  
**Platform**: Windows 10/11 with PowerShell or Command Prompt

This guide walks you through deploying Melitech CRM on Windows servers or workstations using PowerShell and Command Prompt.

---

## Prerequisites

Before you start, ensure you have:

**Windows Version**: Windows 10 (Build 2004+) or Windows 11 (recommended)

**Administrator Access**: You need administrator privileges to install software and configure Docker

**Internet Connection**: Required for downloading Docker, Git, and dependencies

**Hardware**: At least 2GB RAM, 10GB disk space, dual-core processor

**Software to Install**:
- Docker Desktop for Windows
- Git for Windows
- PowerShell 7+ (optional but recommended)

---

## Step 1: Install Docker Desktop for Windows

### Step 1.1: Download Docker Desktop

1. Open your web browser
2. Navigate to https://www.docker.com/products/docker-desktop
3. Click "Download for Windows"
4. Choose the appropriate version:
   - **Docker Desktop for Windows (Intel Chip)** - for most users
   - **Docker Desktop for Windows (Apple Silicon)** - if using Mac (not Windows)

### Step 1.2: Install Docker Desktop

1. Open the downloaded `Docker Desktop Installer.exe` file
2. Follow the installation wizard
3. Accept the license agreement
4. Choose installation options:
   - Enable "Install required Windows components for WSL 2" (recommended)
   - Enable "Add Docker.exe to the PATH for easy CLI use"
5. Click "Install"
6. Restart your computer when prompted

### Step 1.3: Verify Docker Installation

Open PowerShell or Command Prompt and run:

```powershell
docker --version
```

You should see output like: `Docker version 24.0.0, build abc123`

If you get "command not found", restart your computer and try again.

---

## Step 2: Install Git for Windows

### Step 2.1: Download Git

1. Open your web browser
2. Navigate to https://git-scm.com/download/win
3. The download should start automatically
4. If not, click the download link for "64-bit Git for Windows Setup"

### Step 2.2: Install Git

1. Open the downloaded `Git-x.xx.x-64-bit.exe` file
2. Follow the installation wizard
3. Accept the license
4. Choose installation location (default is fine)
5. Select components:
   - Keep "Git Bash Here" checked
   - Keep "Git GUI Here" checked
6. Choose default editor (Notepad++ or Vim if you know it)
7. Configure line ending conversions: Select "Checkout as-is, commit as-is"
8. Choose terminal emulator: Select "Use Windows' default console window"
9. Click "Install"

### Step 2.3: Verify Git Installation

Open PowerShell or Command Prompt and run:

```powershell
git --version
```

You should see output like: `git version 2.42.0.windows.1`

---

## Step 3: Download Melitech CRM

### Step 3.1: Open PowerShell or Command Prompt

**Option A: Using PowerShell (Recommended)**

1. Press `Windows Key + X`
2. Select "Windows PowerShell (Admin)" or "Terminal (Admin)"

**Option B: Using Command Prompt**

1. Press `Windows Key + R`
2. Type `cmd` and press Enter
3. Right-click the window and select "Run as administrator"

### Step 3.2: Navigate to Your Desired Directory

Choose where you want to store the project. We recommend `C:\Projects`:

```powershell
# PowerShell
cd C:\
mkdir Projects
cd Projects
```

Or in Command Prompt:

```cmd
REM Command Prompt
cd C:\
mkdir Projects
cd Projects
```

### Step 3.3: Clone the Repository

Clone the Melitech CRM repository:

```powershell
# PowerShell
git clone https://github.com/melitechdev/melitech_crm.git
cd melitech_crm
```

Or in Command Prompt:

```cmd
REM Command Prompt
git clone https://github.com/melitechdev/melitech_crm.git
cd melitech_crm
```

Replace `yourusername` with your actual GitHub username.

### Step 3.4: Verify Files

List the files to confirm everything was downloaded:

```powershell
# PowerShell
Get-ChildItem

# Command Prompt
dir
```

You should see files like `Dockerfile`, `docker-compose.yml`, `package.json`, etc.

---

## Step 4: Create Configuration File

### Step 4.1: Create .env File

You need to create a `.env` file with your configuration. Use PowerShell to create it:

```powershell
# PowerShell - Create empty file
New-Item -Path ".env" -ItemType File -Force

# Then open in Notepad
notepad .env
```

Or in Command Prompt:

```cmd
REM Command Prompt - Create and open in Notepad
notepad .env
```

### Step 4.2: Add Configuration

Copy and paste the following into the Notepad window. Replace values with your actual configuration:

```
# Database Configuration
DATABASE_URL=mysql://melitech_user:your_secure_password@db:3306/melitech

# Application Configuration
NODE_ENV=production
JWT_SECRET=your_very_secure_random_string_here
VITE_APP_TITLE=Melitech Solutions CRM
VITE_APP_LOGO=https://your-domain.com/logo.png

# OAuth Configuration
VITE_APP_ID=your_oauth_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Built-in APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key_here
```

### Step 4.3: Save the File

1. Press `Ctrl+S` to save
2. Close Notepad
3. The `.env` file is now created in your project directory

### Step 4.4: Verify Configuration

Verify the file was created:

```powershell
# PowerShell
Get-Content .env

# Command Prompt
type .env
```

You should see all the configuration you entered.

---

## Step 5: Build Docker Image

### Step 5.1: Build the Image

This creates a Docker image (blueprint) for your application. This may take 5-10 minutes:

```powershell
# PowerShell
docker-compose build --no-cache

# Command Prompt
docker-compose build --no-cache
```

You'll see lots of output as Docker downloads and installs dependencies. This is normal. Wait for the process to complete.

### Step 5.2: Verify Build Success

When the build completes, you should see:

```
Successfully tagged melitech_crm:latest
```

If you see errors, check the troubleshooting section below.

---

## Step 6: Start Services

### Step 6.1: Start Docker Containers

Start your application:

```powershell
# PowerShell
docker-compose up -d

# Command Prompt
docker-compose up -d
```

The `-d` flag means "run in background". You should see output like:

```
Creating melitech_crm_db_1 ... done
Creating melitech_crm_app_1 ... done
```

### Step 6.2: Wait for Services to Start

Services need time to start. Wait 30-60 seconds, then check status:

```powershell
# PowerShell
docker-compose ps

# Command Prompt
docker-compose ps
```

You should see both services with "Up" status:

```
NAME                COMMAND                  SERVICE      STATUS
melitech_crm_db     "docker-entrypoint..."   db           Up (healthy)
melitech_crm_app    "/app/start.sh"          app          Up (healthy)
```

### Step 6.3: Check Logs

View logs to see if there are any errors:

```powershell
# PowerShell
docker-compose logs app

# Command Prompt
docker-compose logs app
```

Look for messages like `[Startup] ✅ Database initialization complete` and `Server running on http://localhost:3000/`

---

## Step 7: Access Your Application

### Step 7.1: Open in Browser

Open your web browser and navigate to:

```
http://localhost:3000
```

You should see the Melitech CRM login page with the title "Melitech Solutions CRM" and a "Sign in to Continue" button.

### Step 7.2: Test Login

1. Click "Sign in to Continue"
2. Log in with your credentials
3. You should see the dashboard

If you can't access the application, check the troubleshooting section below.

### Step 7.3: Test Core Features

Create a test client to verify everything works:

1. Click **Clients** in the menu
2. Click **"Add New Client"**
3. Fill in test information (name, email, phone)
4. Click **"Save Client"**

If this works, your database connection is working correctly.

---

## Step 8: Set Up Domain and HTTPS (Optional)

### Step 8.1: Point Domain to Your Server

If you have a domain name and a server (not localhost):

1. Log into your domain registrar (GoDaddy, Namecheap, etc.)
2. Find DNS settings
3. Add an A record pointing to your server's IP address
4. Wait 15-30 minutes for DNS to propagate

### Step 8.2: Install SSL Certificate

For local development, HTTPS is not required. For production, use Let's Encrypt (free).

On Windows Server, you can use IIS to manage SSL certificates, or use a reverse proxy like Nginx.

---

## Step 9: Backup Your Database

### Step 9.1: Create a Backup

Backup your database to a file:

```powershell
# PowerShell
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
docker-compose exec -T db mysqldump -u root -p$env:MYSQL_ROOT_PASSWORD melitech | Out-File "backup_$timestamp.sql"

# Command Prompt
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
docker-compose exec -T db mysqldump -u root -p%MYSQL_ROOT_PASSWORD% melitech > backup_%mydate%_%mytime%.sql
```

### Step 9.2: Store Backup Safely

Copy the backup file to a safe location:

```powershell
# PowerShell
Copy-Item "backup_*.sql" -Destination "D:\Backups\"

# Command Prompt
copy backup_*.sql D:\Backups\
```

Replace `D:\Backups\` with your desired backup location.

---

## Step 10: Monitor Your Application

### Step 10.1: View Logs

View application logs in real-time:

```powershell
# PowerShell
docker-compose logs -f app

# Command Prompt
docker-compose logs -f app
```

Press `Ctrl+C` to stop viewing logs.

### Step 10.2: Check Container Status

Check the status of your containers:

```powershell
# PowerShell
docker-compose ps

# Command Prompt
docker-compose ps
```

### Step 10.3: Monitor Resource Usage

Check CPU, memory, and disk usage:

```powershell
# PowerShell
docker stats

# Command Prompt
docker stats
```

Press `Ctrl+C` to stop monitoring.

### Step 10.4: Check Disk Space

Verify you have enough disk space:

```powershell
# PowerShell
Get-Volume

# Command Prompt
wmic logicaldisk get name,size,freespace
```

---

## Troubleshooting

### Problem: "docker: command not found"

**Cause**: Docker is not installed or not in PATH

**Solution**:
1. Install Docker Desktop from https://www.docker.com/products/docker-desktop
2. Restart your computer
3. Open a new PowerShell or Command Prompt window
4. Try again

### Problem: "Cannot connect to Docker daemon"

**Cause**: Docker Desktop is not running

**Solution**:
1. Open Docker Desktop application
2. Wait for it to start (you'll see the Docker icon in system tray)
3. Try your command again

### Problem: "Port 3000 is already in use"

**Cause**: Another application is using port 3000

**Solution**:

Find what's using port 3000:

```powershell
# PowerShell
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess

# Command Prompt
netstat -ano | findstr :3000
```

Then either:
- Stop the conflicting application
- Change the port in `docker-compose.yml` from `"3000:3000"` to `"3001:3000"`

### Problem: "Cannot find module 'tsx'"

**Cause**: Dependencies not installed correctly

**Solution**:

Rebuild the Docker image:

```powershell
# PowerShell
docker-compose build --no-cache

# Command Prompt
docker-compose build --no-cache
```

Then restart:

```powershell
# PowerShell
docker-compose down
docker-compose up -d

# Command Prompt
docker-compose down
docker-compose up -d
```

### Problem: "Cannot connect to database"

**Cause**: Database is not running or credentials are wrong

**Solution**:

Check if database container is running:

```powershell
# PowerShell
docker-compose ps

# Command Prompt
docker-compose ps
```

If database is not running, start it:

```powershell
# PowerShell
docker-compose up -d db

# Command Prompt
docker-compose up -d db
```

Wait 30 seconds for database to start, then start the app:

```powershell
# PowerShell
docker-compose up -d app

# Command Prompt
docker-compose up -d app
```

### Problem: "Cannot access application at localhost:3000"

**Cause**: Application is not running or firewall is blocking access

**Solution**:

Check if application is running:

```powershell
# PowerShell
docker-compose ps

# Command Prompt
docker-compose ps
```

If not running, check logs:

```powershell
# PowerShell
docker-compose logs app

# Command Prompt
docker-compose logs app
```

Check Windows Firewall:

```powershell
# PowerShell (Admin)
New-NetFirewallRule -DisplayName "Allow Docker 3000" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000

# Command Prompt (Admin)
netsh advfirewall firewall add rule name="Allow Docker 3000" dir=in action=allow protocol=tcp localport=3000
```

---

## Common Commands Reference

| Task | PowerShell | Command Prompt |
|---|---|---|
| Start services | `docker-compose up -d` | `docker-compose up -d` |
| Stop services | `docker-compose down` | `docker-compose down` |
| View logs | `docker-compose logs -f app` | `docker-compose logs -f app` |
| Check status | `docker-compose ps` | `docker-compose ps` |
| Rebuild image | `docker-compose build --no-cache` | `docker-compose build --no-cache` |
| View resource usage | `docker stats` | `docker stats` |
| Backup database | `docker-compose exec -T db mysqldump -u root -p$env:MYSQL_ROOT_PASSWORD melitech \| Out-File backup.sql` | `docker-compose exec -T db mysqldump -u root -p%MYSQL_ROOT_PASSWORD% melitech > backup.sql` |
| View environment | `docker-compose exec app env` | `docker-compose exec app env` |
| Restart services | `docker-compose restart` | `docker-compose restart` |
| Remove everything | `docker-compose down -v` | `docker-compose down -v` |

---

## Updating Your Application

### Step 1: Pull Latest Changes

```powershell
# PowerShell
git pull origin main

# Command Prompt
git pull origin main
```

### Step 2: Rebuild Docker Image

```powershell
# PowerShell
docker-compose build --no-cache

# Command Prompt
docker-compose build --no-cache
```

### Step 3: Restart Services

```powershell
# PowerShell
docker-compose down
docker-compose up -d

# Command Prompt
docker-compose down
docker-compose up -d
```

### Step 4: Verify Update

```powershell
# PowerShell
docker-compose logs app

# Command Prompt
docker-compose logs app
```

---

## Stopping Your Application

### Stop All Services

```powershell
# PowerShell
docker-compose down

# Command Prompt
docker-compose down
```

### Stop Specific Service

```powershell
# PowerShell
docker-compose stop app

# Command Prompt
docker-compose stop app
```

### Remove Everything (Including Data)

**Warning**: This will delete all data in your database!

```powershell
# PowerShell
docker-compose down -v

# Command Prompt
docker-compose down -v
```

---

## Getting Help

### Check Docker Logs

```powershell
# PowerShell
docker-compose logs --tail 50

# Command Prompt
docker-compose logs --tail 50
```

### Check Specific Service Logs

```powershell
# PowerShell
docker-compose logs app
docker-compose logs db

# Command Prompt
docker-compose logs app
docker-compose logs db
```

### Restart Services

```powershell
# PowerShell
docker-compose restart

# Command Prompt
docker-compose restart
```

---

## Windows-Specific Tips

### Tip 1: Using PowerShell vs Command Prompt

PowerShell is more powerful and recommended. If you're not comfortable with PowerShell, Command Prompt works fine for Docker commands.

### Tip 2: File Paths

Windows uses backslashes (`\`) for file paths. Docker uses forward slashes (`/`). Docker handles this automatically, so you don't need to worry about it.

### Tip 3: Line Endings

When you cloned the repository, Git should have automatically converted line endings. If you see "LF will be replaced by CRLF" warnings, this is normal and safe.

### Tip 4: Antivirus Software

Some antivirus software may interfere with Docker. If you experience issues, try temporarily disabling antivirus and see if the problem persists.

### Tip 5: Virtual Machine Performance

If running Docker in a virtual machine, ensure the VM has at least 2GB RAM allocated and 2 CPU cores.

---

## Summary

You've successfully deployed Melitech CRM on Windows! Here's what you accomplished:

1. Installed Docker Desktop and Git
2. Downloaded the Melitech CRM project
3. Created configuration file
4. Built Docker image
5. Started services
6. Verified everything works
7. Set up backups
8. Learned how to monitor and maintain

Your application is now running on `http://localhost:3000` and accessible to your team.

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Author**: Manus AI  
**Platform**: Windows 10/11
