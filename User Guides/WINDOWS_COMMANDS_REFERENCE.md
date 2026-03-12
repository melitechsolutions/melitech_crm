# Windows-Compatible Commands Reference

## Overview
This document provides all necessary Windows-compatible commands for setting up and running the Melitech CRM application after extracting the updated zip file.

---

## Prerequisites

Before running any commands, ensure you have the following installed on Windows:

1. **Node.js** (v22.13.0 or later) - Download from https://nodejs.org/
2. **pnpm** (v10.4.1 or later) - Install via: `npm install -g pnpm`
3. **Git** (optional but recommended) - Download from https://git-scm.com/

---

## Initial Setup

### 1. Extract the Zip File
```cmd
# Using Windows Explorer: Right-click the zip file → Extract All
# Or using PowerShell:
Expand-Archive -Path melitechcrm-updated.zip -DestinationPath .
```

### 2. Navigate to Project Directory
```cmd
cd melitechcrm
```

### 3. Install Dependencies
```cmd
pnpm install
```

**Expected Output:**
```
+ @types/react 19.1.16
+ @types/react-dom 19.1.9
+ @vitejs/plugin-react 5.0.4
...
Done in X.Xs using pnpm v10.4.1
```

---

## Development Commands

### Start Development Server
```cmd
pnpm dev
```

**Expected Output:**
```
> melitech_crm@1.0.0 dev
> NODE_ENV=development tsx watch server/_core/index.ts

[OAuth] Initialized with baseURL: http://localhost:3000
Server running on http://localhost:3000/
```

**Access the application:** Open your browser and navigate to `http://localhost:3000`

### Build for Production
```cmd
pnpm build
```

**Expected Output:**
```
> melitech_crm@1.0.0 build
> vite build && esbuild server/_core/index.ts ...

✓ built in X.XXs
⚡ Done in XXms
```

### Start Production Server
```cmd
pnpm start
```

**Expected Output:**
```
> melitech_crm@1.0.0 start
> NODE_ENV=production node dist/index.js

[OAuth] Initialized with baseURL: http://localhost:3000
Server running on http://localhost:3000/
```

---

## Database Commands

### Initialize Database
```cmd
pnpm db:push
```

This command will:
- Generate database migrations
- Apply pending migrations to your database

### Seed Database (Optional)
```cmd
pnpm db:seed
```

This populates the database with sample data for testing.

---

## Code Quality Commands

### Type Checking
```cmd
pnpm check
```

Runs TypeScript compiler to check for type errors without emitting files.

### Format Code
```cmd
pnpm format
```

Automatically formats all code files using Prettier.

### Run Tests
```cmd
pnpm test
```

Runs the test suite using Vitest.

---

## Environment Configuration

### Create Environment File
Create a `.env` file in the project root:

```cmd
# Using PowerShell
New-Item -Path .env -ItemType File

# Using Command Prompt (cmd)
type nul > .env
```

### Environment Variables Template

Add the following to your `.env` file:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/melitech_crm

# OAuth
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback

# API
API_URL=http://localhost:3000/api

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your_website_id

# App Configuration
VITE_APP_TITLE=Melitech Solutions
VITE_APP_LOGO=/logo.png
```

---

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, the server will automatically use port 3001.

**To manually specify a port (Windows):**
```cmd
# Using Command Prompt
set PORT=3002 && pnpm start

# Using PowerShell
$env:PORT=3002; pnpm start
```

### Clear Cache and Reinstall
```cmd
# Remove node_modules and reinstall
rmdir node_modules /s /q
pnpm install
```

### Clean Build
```cmd
# Remove dist folder and rebuild
rmdir dist /s /q
pnpm build
```

### Check Node and pnpm Versions
```cmd
node --version
pnpm --version
```

---

## Project Structure

```
melitechcrm/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   │   └── dashboards/  # Dashboard components (UPDATED)
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utility functions
│   │   └── App.tsx        # Main app component (UPDATED)
│   └── index.html         # HTML entry point
├── server/                # Express backend
│   ├── _core/            # Core server logic
│   ├── routers/          # API route handlers
│   └── db.ts             # Database configuration
├── shared/               # Shared types and utilities
├── package.json          # Project dependencies
├── pnpm-lock.yaml        # Dependency lock file
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── drizzle.config.ts     # Database configuration
```

---

## Key Changes in This Update

### Fixed Issues
1. ✅ **Removed react-router-dom dependency** - Replaced with wouter (the project's routing library)
   - Fixed: `FloatingSettingsSidebar.tsx`
   - Fixed: `CollapsibleSettingsSidebar.tsx`

2. ✅ **Moved dashboard components** - Organized all dashboards in one directory
   - Moved: `Dashboard.tsx` → `pages/dashboards/Dashboard.tsx`
   - Moved: `DashboardHome.tsx` → `pages/dashboards/DashboardHome.tsx`
   - Updated: `App.tsx` import paths

### Files Modified
| File | Change |
|------|--------|
| `client/src/components/MaterialTailwind/FloatingSettingsSidebar.tsx` | Fixed react-router-dom import |
| `client/src/components/MaterialTailwind/CollapsibleSettingsSidebar.tsx` | Fixed react-router-dom import |
| `client/src/pages/dashboards/Dashboard.tsx` | Moved from pages directory |
| `client/src/pages/dashboards/DashboardHome.tsx` | Moved from pages directory |
| `client/src/App.tsx` | Updated import paths |

---

## Running on Windows Server

### Using Windows Task Scheduler

1. **Create a batch file** (`run-app.bat`):
```batch
@echo off
cd /d C:\path\to\melitechcrm
pnpm start
pause
```

2. **Create a scheduled task:**
   - Open Task Scheduler
   - Create Basic Task
   - Set trigger to "At startup"
   - Set action to run `run-app.bat`

### Using Windows Service (Advanced)

For production deployments, consider using:
- **NSSM** (Non-Sucking Service Manager): https://nssm.cc/
- **PM2 Windows Service**: `pnpm install -g pm2` then `pm2 install pm2-windows-startup`

---

## Docker Support (Optional)

If you prefer to run the application in Docker:

```cmd
# Build Docker image
docker build -t melitech-crm .

# Run Docker container
docker run -p 3000:3000 melitech-crm
```

Ensure Docker Desktop is installed on Windows.

---

## Support and Documentation

- **Project Repository:** Check the `.git` folder or project documentation
- **Issue Tracking:** Report issues in the project's issue tracker
- **Documentation:** See `README.md` in the project root

---

## Quick Reference Cheat Sheet

| Task | Command |
|------|---------|
| Install dependencies | `pnpm install` |
| Start dev server | `pnpm dev` |
| Build for production | `pnpm build` |
| Start production server | `pnpm start` |
| Format code | `pnpm format` |
| Type check | `pnpm check` |
| Run tests | `pnpm test` |
| Initialize database | `pnpm db:push` |
| Seed database | `pnpm db:seed` |
| Clear node_modules | `rmdir node_modules /s /q` |
| Clean build | `rmdir dist /s /q && pnpm build` |

---

## Notes

- All commands use **pnpm** as the package manager (not npm or yarn)
- The application uses **TypeScript** for type safety
- **Wouter** is used for client-side routing (not React Router)
- **Drizzle ORM** is used for database operations
- **tRPC** is used for type-safe API communication

---

**Last Updated:** December 17, 2025  
**Version:** 1.0.0  
**Status:** ✅ Ready for Windows Deployment
