# Database Diagnostic Guide

## Quick Start

### Option 1: One-Command Diagnosis (Recommended)
```bash
npm run db:diagnose
```
This runs both health check and database setup in sequence.

### Option 2: Separate Commands
```bash
# Step 1: Check health
npm run db:health

# Step 2: Setup/migrate database
npm run db:setup
```

### Option 3: Manual Commands
```bash
# Using Node directly
node database-health-check.js
node setup-database.js

# On Windows
node database-health-check.js
node setup-database.js
```

---

## What Each Script Does

### `npm run db:health` (database-health-check.js)

**Purpose:** Checks if database is connected and shows current state

**Output shows:**
- ✅/❌ Connection status (with error details if failed)
- Database version and name
- Total number of tables
- ✅/❌ Status of critical tables (invoices, orders, etc.)
- Count of records in each table
- List of applied migrations
- Invoices table structure (columns)

**Interpretation:**
| Output | Meaning |
|--------|---------|
| `✅ Connection successful` | Database is reachable and credentials are correct |
| `Total tables: 0` | Migrations haven't run yet (tables don't exist) |
| `❌ invoices` (under Critical Tables) | Critical table is missing |
| `No migrations table` | __drizzle_migrations__ table doesn't exist (run setup-database.js) |
| Connection timeout | Database isn't running or firewall is blocking |

### `npm run db:setup` (setup-database.js)

**Purpose:** Automatically creates tables and runs pending migrations

**What it does:**
1. Connects to database
2. Creates __drizzle_migrations__ table if it doesn't exist
3. Reads all .sql files from drizzle/migrations/
4. Compares with applied migrations
5. Runs any pending migrations
6. Records each migration as applied
7. Verifies critical tables exist

**Output shows:**
- ✅/❌ Connection status
- 📝 Migrations already applied
- ⏳ Migrations being run (with success/error status)
- 🔑 Verification that critical tables now exist

**Safe to run multiple times:** Already-applied migrations are skipped.

---

## Common Scenarios and Solutions

### Scenario 1: First Time Setup / Fresh Database

**Symptoms:**
```
Total tables: 0
❌ invoices
❌ orders
❌ employees
```

**Solution:**
```bash
npm run db:setup
npm run db:health  # Verify it worked
```

**Expected Result:**
```
Total tables: 30
✅ invoices (5000 records)
✅ orders (200 records)
✅ employees (50 records)
```

### Scenario 2: Migrations Exist but Didn't Auto-Run

**Symptoms:**
```
✅ Connection successful
Total tables: 0  (should be 30+)
No migrations table
```

**Cause:** Migrations failed to auto-run during startup

**Solution:**
```bash
npm run db:setup
```

This manually runs all migrations that weren't applied.

### Scenario 3: Connection Refused

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:3307
```

**Causes:**
1. MySQL/MariaDB container isn't running
2. Wrong host or port
3. DATABASE_URL is incorrect

**Solution:**

Check if containers are running:
```bash
docker ps | grep melitech
```

If not running, start them:
```bash
docker-compose up -d
sleep 10  # Wait for database to initialize
npm run db:health
```

If still not working, check DATABASE_URL in `.env`:
```bash
# Should be something like:
DATABASE_URL=mysql://melitech_user:tjwzT9pW;NGYq1QxSq0B@db:3306/melitech_crm
# Or for local development:
DATABASE_URL=mysql://melitech_user:tjwzT9pW;NGYq1QxSq0B@localhost:3307/melitech_crm
```

### Scenario 4: Access Denied

**Symptoms:**
```
Error: ER_ACCESS_DENIED_ERROR: Access denied for user 'melitech_user'@'localhost'
```

**Causes:**
1. Wrong password in DATABASE_URL
2. User doesn't have permissions for this database
3. Database user doesn't exist

**Solution:**

Check credentials in `.env`:
```bash
DATABASE_URL=mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE
```

Verify with direct connection:
```bash
mysql -u melitech_user -p'tjwzT9pW;NGYq1QxSq0B' -h 127.0.0.1 -P 3307 -e "SELECT VERSION();"
```

### Scenario 5: Partial Migrations (Some Tables Exist)

**Symptoms:**
```
✅ invoices
✅ orders
❌ procurement_requests  (missing)
Applied migrations: 8 of 13
```

**Solution:**

Run the remaining migrations:
```bash
npm run db:setup
```

It will apply migrations 9-13 automatically.

### Scenario 6: Corrupted Tables or Schema Mismatch

**Symptoms:**
```
❌ Unable to describe table (table may not exist)
Error: ER_PARSE_ERROR when running query
```

**Solution (will lose all data):**

```bash
# 1. Stop application
docker-compose down

# 2. Remove database volume (wipes data)
docker volume rm melitech_crm_data

# 3. Restart (fresh database)
docker-compose up -d

# 4. Wait and setup
sleep 10
npm run db:setup

# 5. Verify
npm run db:health
```

---

## Advanced Diagnostics

### Check Specific Table
```bash
docker exec melitech_crm_db mysql -u root -p'R:vVl:m7J9x3Hr|yWEUp' melitech_crm -e "SELECT * FROM invoices LIMIT 5;"
```

### View All Tables
```bash
docker exec melitech_crm_db mysql -u root -p'R:vVl:m7J9x3Hr|yWEUp' melitech_crm -e "SHOW TABLES;"
```

### Check Migration Status
```bash
docker exec melitech_crm_db mysql -u root -p'R:vVl:m7J9x3Hr|yWEUp' melitech_crm -e "SELECT * FROM __drizzle_migrations__;"
```

### Reset Migrations (cautious!)
```bash
docker exec melitech_crm_db mysql -u root -p'R:vVl:m7J9x3Hr|yWEUp' melitech_crm -e "DROP TABLE IF EXISTS __drizzle_migrations__;"

# Then rerun migrations
npm run db:setup
```

---

## Docker Commands Cheat Sheet

### Container Management
```bash
# See running containers
docker ps | grep melitech

# View logs
docker logs melitech_crm_db      # Database logs
docker logs melitech_crm_app     # Application logs
docker logs -f melitech_crm_db   # Live logs (Ctrl+C to exit)

# Restart containers
docker-compose restart
docker-compose down && docker-compose up -d

# Access database CLI
docker exec -it melitech_crm_db mysql -u root -p
# Enter password: R:vVl:m7J9x3Hr|yWEUp
# Then: USE melitech_crm;
```

### Volume Management
```bash
# List volumes
docker volume ls | grep melitech

# Remove volume (deletes database)
docker volume rm melitech_crm_data

# Inspect volume
docker volume inspect melitech_crm_data
```

---

## Environment Variables

### Required for Database Connection
```bash
DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DATABASE
```

### Examples
```bash
# Docker Compose (container names as hostnames)
DATABASE_URL=mysql://melitech_user:tjwzT9pW;NGYq1QxSq0B@db:3306/melitech_crm

# Local Development (localhost)
DATABASE_URL=mysql://melitech_user:tjwzT9pW;NGYq1QxSq0B@localhost:3307/melitech_crm

# Remote Server
DATABASE_URL=mysql://melitech_user:MYPASSWORD@crm.example.com:3306/melitech_crm
```

---

## Verification Checklist

After running diagnostics, check off:

- [ ] `npm run db:health` shows "Connection successful"
- [ ] Total tables shows 30+ (not 0)
- [ ] ✅ appears next to all critical tables
- [ ] No error messages in output
- [ ] Docker containers are running (`docker ps`)
- [ ] .env file has valid DATABASE_URL
- [ ] Application can query data (check browser console for errors)

---

## Performance Tips

### If Database is Slow

1. Check MySQL load:
   ```bash
   docker exec melitech_crm_db mysql -u root -p -e "SHOW PROCESSLIST;"
   ```

2. Check table sizes:
   ```bash
   docker exec melitech_crm_db mysql -u melitech_user -p'...' melitech_crm -e "
     SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) 
     FROM information_schema.tables 
     WHERE table_schema = 'melitech_crm';
   "
   ```

3. Restart database:
   ```bash
   docker-compose restart db
   ```

---

## Getting Help

If diagnostics don't solve the issue:

1. Collect output of `npm run db:diagnose`
2. Share output of `docker logs melitech_crm_db` (last 50 lines)
3. Share output of `docker logs melitech_crm_app` (last 50 lines)
4. Check [DATABASE_TROUBLESHOOTING.md](./DATABASE_TROUBLESHOOTING.md) for more detailed troubleshooting

---

## Reference: Health Check Endpoints

Endpoints available without authentication:

### GET /trpc/health.status
Returns basic server status
```json
{
  "status": "ok",
  "timestamp": "2024-03-03T10:30:00Z",
  "environment": "development"
}
```

### GET /trpc/health.detailed  
Returns full database diagnostics
```json
{
  "database": {
    "status": "connected",
    "connected": true,
    "tablesCount": 30,
    "tablesExist": {
      "invoices": "yes",
      "orders": "yes"
    }
  }
}
```

### GET /trpc/health.migrations
Returns applied migration history
```json
{
  "status": "success",
  "migrations": [
    {"name": "0000_initial_schema.sql", "installed_on": "2024-03-03T10:15:00Z"},
    {"name": "0001_add_features.sql", "installed_on": "2024-03-03T10:16:00Z"}
  ],
  "count": 13
}
```

---

## Summary

| Problem | Quick Fix |
|---------|-----------|
| "Connection refused" | `docker-compose up -d` |
| "Access denied" | Check DATABASE_URL in .env |
| "No tables found" | `npm run db:setup` |
| "Some tables missing" | `npm run db:setup` |
| "Database is slow" | `docker-compose restart db` |
| "Module not found errors" | `npm install` then `npm run build` |

**Always start with:** `npm run db:diagnose`
