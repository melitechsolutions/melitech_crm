# Windows Deployment Guide - Melitech CRM

**Date:** December 17, 2025  
**Version:** 1.0.1  
**Status:** ✅ Ready for Windows Deployment

---

## Quick Start (3 Steps)

### Step 1: Extract the Zip File
```cmd
# Using Command Prompt or PowerShell
Expand-Archive -Path melitechcrm-updated.zip -DestinationPath .
cd melitechcrm
```

### Step 2: Install & Build
```cmd
# Using Command Prompt (cmd.exe)
pnpm install
pnpm build
```

### Step 3: Start the Server
```cmd
pnpm start
```

**Access:** http://localhost:3000

---

## PowerShell Execution Policy Issue

### The Problem
```
pnpm : File C:\Users\...\pnpm.ps1 cannot be loaded because running scripts is disabled
```

### The Solution (Choose One)

#### Option A: Use Command Prompt (Easiest)
Simply use `cmd.exe` instead of PowerShell:

```cmd
# Open Command Prompt (Win + R, type "cmd", press Enter)
cd C:\melitech_crm
pnpm install
pnpm build
pnpm start
```

**No admin rights needed. This is the recommended approach.**

#### Option B: Fix PowerShell (Requires Admin)
Open PowerShell as Administrator and run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Type `Y` and press Enter when prompted. Then you can use PowerShell normally.

#### Option C: Use Batch Files (No PowerShell Needed)
We've provided batch files for easy setup:

1. **SETUP_WINDOWS.bat** - Installs dependencies and builds
2. **START_DEV.bat** - Starts development server
3. **START_PRODUCTION.bat** - Starts production server

Just double-click any of these files to run them!

---

## Using Batch Files (Easiest for Windows)

### Setup (First Time Only)

1. Extract the zip file
2. Navigate to the project folder
3. Double-click **SETUP_WINDOWS.bat**
4. Wait for it to complete

### Start Development Server

Double-click **START_DEV.bat**

The server will start at http://localhost:3000

### Start Production Server

1. Make sure you've run SETUP_WINDOWS.bat first
2. Double-click **START_PRODUCTION.bat**

---

## Complete Command Reference

### Using Command Prompt (Recommended)

```cmd
# Navigate to project
cd C:\melitech_crm

# Install dependencies
pnpm install

# Build for production
pnpm build

# Start production server
pnpm start

# Start development server (with hot reload)
pnpm dev

# Format code
pnpm format

# Type checking
pnpm check

# Run tests
pnpm test

# Initialize database
pnpm db:push

# Seed database with sample data
pnpm db:seed
```

### Using PowerShell (After Fixing Execution Policy)

Same commands as Command Prompt:

```powershell
cd C:\melitech_crm
pnpm install
pnpm build
pnpm start
```

---

## Environment Setup

### Create .env File

1. Open Notepad
2. Add the following content:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/melitech_crm

# OAuth (if applicable)
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback

# App Configuration
VITE_APP_TITLE=Melitech Solutions
VITE_APP_LOGO=/logo.png
```

3. Save as `.env` in the project root (C:\melitech_crm\.env)

**Important:** Never commit .env to version control!

---

## Troubleshooting

### Issue 1: "pnpm: command not found"

**Solution:** Install pnpm globally

```cmd
npm install -g pnpm
```

Verify installation:
```cmd
pnpm --version
```

### Issue 2: "Port 3000 is already in use"

**Solution:** The application will automatically use port 3001 or 3002

To manually specify a port:
```cmd
set PORT=3002
pnpm start
```

Or in PowerShell:
```powershell
$env:PORT=3002
pnpm start
```

### Issue 3: "node_modules not found" after install

**Solution:** Run install again

```cmd
pnpm install
```

### Issue 4: Build fails with TypeScript errors

**Solution:** Run type check to see errors

```cmd
pnpm check
```

Then fix the errors and rebuild:
```cmd
pnpm build
```

### Issue 5: "dist/index.js not found"

**Solution:** You need to build first

```cmd
pnpm build
pnpm start
```

### Issue 6: Database connection error

**Solution:** Check your .env file

1. Verify DATABASE_URL is correct
2. Ensure MySQL is running
3. Run: `pnpm db:push`

---

## Development Workflow

### For Active Development

Use the development server with hot reload:

```cmd
pnpm dev
```

This will:
- Automatically reload on file changes
- Show TypeScript errors in browser
- Provide better debugging experience

### For Production Deployment

```cmd
# Build once
pnpm build

# Start server
pnpm start
```

The application will be optimized and minified.

---

## Project Structure

```
melitech_crm/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   └── dashboards/   # Dashboard components
│   │   ├── components/       # Reusable components
│   │   ├── App.tsx           # Main app
│   │   └── main.tsx          # Entry point
│   └── index.html
├── server/                    # Express backend
│   ├── _core/               # Core logic
│   ├── routers/             # API routes
│   └── db.ts                # Database
├── shared/                   # Shared types
├── package.json             # Dependencies
├── pnpm-lock.yaml           # Lock file
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config
├── drizzle.config.ts        # Database config
├── SETUP_WINDOWS.bat        # Setup script
├── START_DEV.bat            # Dev server script
└── START_PRODUCTION.bat     # Prod server script
```

---

## System Requirements

- **Windows:** Windows 10 or later
- **Node.js:** v22.13.0 or later
- **pnpm:** v10.4.1 or later (installed via npm)
- **RAM:** 2GB minimum
- **Disk Space:** 2.5GB (including node_modules)
- **Database:** MySQL 5.7+ (optional, for production)

---

## Installation Steps (Detailed)

### Step 1: Install Node.js
1. Download from https://nodejs.org/
2. Run the installer
3. Choose default options
4. Restart your computer

### Step 2: Install pnpm
Open Command Prompt and run:
```cmd
npm install -g pnpm
```

Verify:
```cmd
pnpm --version
```

### Step 3: Extract Project
1. Right-click melitechcrm-updated.zip
2. Select "Extract All..."
3. Choose destination (e.g., C:\)
4. Click Extract

### Step 4: Navigate to Project
```cmd
cd C:\melitech_crm
```

### Step 5: Install Dependencies
```cmd
pnpm install
```

### Step 6: Build Application
```cmd
pnpm build
```

### Step 7: Start Server
```cmd
pnpm start
```

### Step 8: Access Application
Open browser and go to: http://localhost:3000

---

## Batch Files Included

### SETUP_WINDOWS.bat
Automates the setup process:
- Checks for pnpm
- Installs dependencies
- Builds the application

**Usage:** Double-click the file

### START_DEV.bat
Starts the development server with hot reload

**Usage:** Double-click the file

### START_PRODUCTION.bat
Starts the production server

**Usage:** Double-click the file (after running SETUP_WINDOWS.bat)

---

## Port Configuration

### Default Ports
- **Development:** http://localhost:3000
- **Production:** http://localhost:3000
- **Fallback:** http://localhost:3001 or http://localhost:3002

### Change Port (Command Prompt)
```cmd
set PORT=3002
pnpm start
```

### Change Port (PowerShell)
```powershell
$env:PORT=3002
pnpm start
```

---

## Database Setup

### Initialize Database
```cmd
pnpm db:push
```

This will:
- Generate migrations
- Create tables
- Apply schema

### Seed Sample Data (Optional)
```cmd
pnpm db:seed
```

---

## Deployment Checklist

Before going live, verify:

- [ ] Node.js v22.13.0+ installed
- [ ] pnpm installed globally
- [ ] Project extracted successfully
- [ ] `pnpm install` completed
- [ ] `pnpm build` completed successfully
- [ ] `.env` file created with correct values
- [ ] Database initialized (`pnpm db:push`)
- [ ] `pnpm start` runs without errors
- [ ] Application loads at http://localhost:3000
- [ ] Login page displays correctly
- [ ] No console errors (F12)

---

## Getting Help

### Check Documentation
- **POWERSHELL_FIX_GUIDE.md** - PowerShell execution policy issues
- **WINDOWS_COMMANDS_REFERENCE.md** - All command reference
- **README_UPDATE.md** - General setup guide
- **CHANGES.md** - What's new in this version

### Common Issues
1. PowerShell execution policy → Use Command Prompt
2. pnpm not found → Install with `npm install -g pnpm`
3. Port already in use → Use different port or close other apps
4. Build fails → Run `pnpm check` to see errors

---

## Quick Reference

| Task | Command |
|------|---------|
| Install deps | `pnpm install` |
| Build | `pnpm build` |
| Start prod | `pnpm start` |
| Start dev | `pnpm dev` |
| Format code | `pnpm format` |
| Type check | `pnpm check` |
| Run tests | `pnpm test` |
| Init database | `pnpm db:push` |
| Seed database | `pnpm db:seed` |

---

## Status

✅ **WINDOWS COMPATIBLE**  
✅ **BATCH FILES PROVIDED**  
✅ **FULL DOCUMENTATION**  
✅ **READY FOR DEPLOYMENT**

---

**Last Updated:** December 17, 2025  
**Version:** 1.0.1  
**Tested On:** Windows 10/11, Node.js v22.13.0, pnpm v10.4.1
