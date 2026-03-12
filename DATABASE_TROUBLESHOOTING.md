# Database Troubleshooting Guide

## Issue: TRPC Query Error on Invoices Table

### Error Example
```
Failed query: select `id`, `invoiceNumber`, ... from `invoices` limit ?
params: 50
```

## Root Cause Analysis

This error typically indicates one of the following:

1. **Database Not Connected** - The MySQL/MariaDB instance isn't running or accessible
2. **Migrations Not Run** - The invoices table doesn't exist in the database
3. **Connection String Issue** - The `DATABASE_URL` environment variable is incorrect
4. **Permissions Issue** - The database user doesn't have proper permissions
5. **Network/Firewall** - Connection is being blocked

## Diagnostic Steps

### Step 1: Check Database Health
Use the health check endpoint (no authentication needed):
```bash
curl http://localhost:3000/trpc/health.status
curl http://localhost:3000/trpc/health.detailed
curl http://localhost:3000/trpc/health.migrations
```

Expected successful response:
```json
{
  "database": {
    "status": "connected",
    "connected": true,
    "tablesCount": 30,
    "tablesExist": {
      "invoices": "yes"
    }
  }
}
```

### Step 2: Verify Docker Container

If using Docker Compose:
```bash
# Check if containers are running
docker ps | grep melitech

# Check database logs
docker logs melitech_crm_db

# Check application logs
docker logs melitech_crm_app

# Verify database is accessible
docker exec melitech_crm_db mysql -u melitech_user -p'tjwzT9pW;NGYq1QxSq0B' -e "USE melitech_crm; SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'melitech_crm';"
```

### Step 3: Check Environment Variables

Verify `DATABASE_URL` is set correctly:

**Docker Compose (internal network):**
```
DATABASE_URL=mysql://melitech_user:tjwzT9pW;NGYq1QxSq0B@db:3306/melitech_crm
```

**Local Development (localhost):**
```
DATABASE_URL=mysql://melitech_user:tjwzT9pW;NGYq1QxSq0B@localhost:3307/melitech_crm
```

**Remote Server (production):**
```
DATABASE_URL=mysql://melitech_user:PASSWORD@hostname:3306/melitech_crm
```

### Step 4: Run Migrations Manually

If migrations didn't run automatically:

```bash
# Using Docker
docker exec melitech_crm_app npm run migrate

# Locally
npm run migrate

# Or directly with MySQL
mysql -u melitech_user -p -h localhost melitech_crm < drizzle/migrations/0000_initial_schema.sql
```

### Step 5: Verify Database Connection

Test the connection directly:

```bash
# MySQL CLI
mysql -u melitech_user -p'tjwzT9pW;NGYq1QxSq0B' -h localhost -P 3307 -e "SELECT VERSION();"

 Python
python3 -c "
import mysql.connector
try:
    conn = mysql.connector.connect(
        host='localhost',
        port=3307,
        user='melitech_user',
        password='tjwzT9pW;NGYq1QxSq0B',
        database='melitech_crm'
    )
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \"melitech_crm\"')
    print(f'Tables found: {cursor.fetchone()[0]}')
    cursor.execute('SHOW TABLES LIKE \"invoices\"')
    print(f'Invoices table exists: {bool(cursor.fetchone())}')
    conn.close()
except Exception as e:
    print(f'Error: {e}')
"
```

### Step 6: Check Invoices Table Structure

```bash
# Check if table exists and columns match
mysql -u melitech_user -p -h localhost melitech_crm -e "DESC invoices;"

# Column names should include: id, invoiceNumber, clientId, estimateId, title, status, issueDate, dueDate, subtotal, taxAmount, discountAmount, total, paidAmount, notes, terms, paymentDetails, createdBy, createdAt, updatedAt, paymentPlanId
```

## Common Solutions

### Solution 1: Docker Container Issues

```bash
# Stop and remove containers
docker-compose down

# Rebuild and restart
docker-compose up -d

# Check logs
docker logs melitech_crm_db

# Wait for healthcheck to pass (watch the logs)
```

### Solution 2: Reset Database

```bash
# **WARNING: This deletes all data!**

# Stop containers
docker-compose down

# Remove database volume
docker volume rm melitech_crm_data

# Restart (will initialize fresh)
docker-compose up -d

# Wait for database to be ready (60 seconds)
sleep 60

# Check migrations ran
docker logs melitech_crm_app | grep -i migration
```

### Solution 3: Recreate Invoices Table

If the table structure is corrupted:

```bash
# Drop and recreate
mysql -u melitech_user -p'tjwzT9pW;NGYq1QxSq0B' -h localhost melitech_crm -e "
DROP TABLE IF EXISTS invoices;
"

# Then run initial migration
docker exec melitech_crm_db mysql -u melitech_user -p'tjwzT9pW;NGYq1QxSq0B' melitech_crm < drizzle/migrations/0000_initial_schema.sql
```

### Solution 4: Check Drizzle Configuration

Edit `.env` if needed:
```bash
# Should be set to path containing migration files
DATABASE_URL=mysql://user:pass@host:port/database
```

## Environment Variables Reference

| Variable | Example | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `mysql://user:pass@host:3306/db` | Database connection string |
| `NODE_ENV` | `production` | Enables migrations on startup |
| `GROQ_API_KEY` | `xxxx` | AI feature (optional) |
| `GROQ_MODEL` | `llama-3.1-70b-versatile` | AI model selection |

## Logs to Check

1. **Application startup logs** - Check for migration messages
   ```
   [Database] Drizzle connection created
   [Database] Running migrations...
   [Database] Migrations completed
   ```

2. **Database logs** - Check for connection errors
   ```
   docker logs melitech_crm_db
   ```

3. **Browser console** - TRPC error details

## Fallback: In-Memory Database

If MySQL isn't available for development:

```bash
# The application falls back to SQLite in-memory (losing data on restart)
# This is NOT for production
npm run dev  # Uses SQLite in-memory
```

## Admin Commands Reference

```bash
# Check all tables
mysql -u melitech_user -p -h localhost melitech_crm -e "SHOW TABLES;"

# Check specific table
mysql -u melitech_user -p -h localhost melitech_crm -e "DESC invoices;"

# Count records
mysql -u melitech_user -p -h localhost melitech_crm -e "SELECT COUNT(*) as invoice_count FROM invoices;"

# View migration status
mysql -u melitech_user -p -h localhost melitech_crm -e "SELECT * FROM __drizzle_migrations__;"

# Reset migrations table (careful!)
mysql -u melitech_user -p -h localhost melitech_crm -e "DROP TABLE IF EXISTS __drizzle_migrations__;"
```

## Health Check Endpoints

All endpoints return JSON and don't require authentication:

- `GET /trpc/health.status` - Basic server status
- `GET /trpc/health.detailed` - Full diagnostic info
- `GET /trpc/health.migrations` - List applied migrations

## Need Help?

1. Check logs: `docker logs melitech_crm_app` or `docker logs melitech_crm_db`
2. Run health checks to get diagnostic info
3. Verify `DATABASE_URL` is set correctly
4. Ensure MySQL container is healthy: `docker ps`
5. Reset database volume if corrupted
