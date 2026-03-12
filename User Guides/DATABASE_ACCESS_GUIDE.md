# Melitech CRM - Database Access Guide

## Overview

This guide provides comprehensive instructions for accessing and managing the Melitech CRM database in Docker environments. The database uses MySQL 8.0 and is managed through Drizzle ORM.

---

## Quick Start

### 1. Start Docker Containers

```bash
# Navigate to project directory
cd /path/to/melitech_crm

# Start all services (MySQL, Redis, App)
docker-compose up -d

# Wait for services to be ready (30-60 seconds)
sleep 30

# Verify services are running
docker-compose ps
```

### 2. Access Database

#### Using the Database Access Script (Recommended)

```bash
# Make script executable (first time only)
chmod +x scripts/db-access.sh

# Connect to interactive MySQL shell
./scripts/db-access.sh shell

# View all tables
./scripts/db-access.sh tables

# View users table
./scripts/db-access.sh users

# View clients table
./scripts/db-access.sh clients

# View invoices table
./scripts/db-access.sh invoices

# View database statistics
./scripts/db-access.sh stats
```

#### Using Docker Directly

```bash
# Connect to MySQL shell
docker exec -it melitech-mysql mysql -u melitech -pmelitech_password_123 melitech_crm

# Run a query directly
docker exec melitech-mysql mysql -u melitech -pmelitech_password_123 melitech_crm -e "SELECT * FROM users;"

# View all tables
docker exec melitech-mysql mysql -u melitech -pmelitech_password_123 melitech_crm -e "SHOW TABLES;"
```

#### Using MySQL Client (if installed locally)

```bash
# Connect to database on localhost
mysql -h localhost -u melitech -pmelitech_password_123 melitech_crm

# Run a query
mysql -h localhost -u melitech -pmelitech_password_123 melitech_crm -e "SELECT * FROM users;"
```

---

## Database Access Script Commands

### Interactive Shell

```bash
./scripts/db-access.sh shell
```

Opens an interactive MySQL shell where you can run SQL commands directly.

**Example:**
```sql
mysql> SELECT * FROM users;
mysql> SELECT COUNT(*) FROM invoices;
mysql> exit
```

### View Tables

```bash
./scripts/db-access.sh tables
```

Lists all tables in the database.

### View Specific Tables

```bash
# View users (first 10 rows)
./scripts/db-access.sh users

# View clients (first 10 rows)
./scripts/db-access.sh clients

# View invoices (first 10 rows)
./scripts/db-access.sh invoices
```

### Database Statistics

```bash
./scripts/db-access.sh stats
```

Shows row counts for all major tables.

### Backup Database

```bash
./scripts/db-access.sh backup
```

Creates a timestamped SQL backup file in the `backups/` directory.

**Output:**
```
Backup created: backups/melitech_crm_20231209_120000.sql
```

### Restore Database

```bash
./scripts/db-access.sh restore backups/melitech_crm_20231209_120000.sql
```

Restores the database from a backup file.

### Run Custom SQL Query

```bash
./scripts/db-access.sh query "SELECT COUNT(*) FROM users;"
```

Executes a custom SQL query.

---

## Database Configuration

### Connection Details

| Property | Value |
|----------|-------|
| Host | localhost (or `mysql` inside Docker) |
| Port | 3306 |
| Username | melitech |
| Password | melitech_password_123 |
| Database | melitech_crm |
| Root Password | root_password_123 |

### Connection String

**From Docker container:**
```
mysql://melitech:melitech_password_123@mysql:3306/melitech_crm
```

**From local machine:**
```
mysql://melitech:melitech_password_123@localhost:3306/melitech_crm
```

### Environment Variables

Located in `.env.docker`:

```env
MYSQL_ROOT_PASSWORD=root_password_123
MYSQL_DATABASE=melitech_crm
MYSQL_USER=melitech
MYSQL_PASSWORD=melitech_password_123
DATABASE_URL=mysql://melitech:melitech_password_123@mysql:3306/melitech_crm
```

---

## Database Schema

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `users` | User accounts | id, email, name, role, passwordHash |
| `clients` | Client information | id, companyName, email, phone, status |
| `invoices` | Invoice records | id, invoiceNumber, clientId, totalAmount, status |
| `payments` | Payment records | id, invoiceId, amount, paymentDate, status |
| `estimates` | Estimate records | id, estimateNumber, clientId, totalAmount |
| `projects` | Project records | id, projectName, clientId, status, budget |
| `employees` | Employee records | id, firstName, lastName, email, department |
| `payroll` | Payroll records | id, employeeId, month, salary, status |
| `products` | Product catalog | id, productName, price, quantity |
| `services` | Service catalog | id, serviceName, price, description |
| `expenses` | Expense records | id, description, amount, category, date |
| `opportunities` | Sales opportunities | id, opportunityName, clientId, value, status |

### User Roles

- `admin` - Full system access
- `user` - Standard user access
- `staff` - Staff member access
- `accountant` - Accounting module access
- `client` - Client portal access
- `super_admin` - System administrator

---

## Common Database Tasks

### Create a New User

```bash
./scripts/db-access.sh query "
INSERT INTO users (id, email, name, role, passwordHash, createdAt, lastSignedIn)
VALUES ('user123', 'user@example.com', 'John Doe', 'user', 'hashed_password', NOW(), NOW());
"
```

### Update User Role

```bash
./scripts/db-access.sh query "
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
"
```

### View All Invoices for a Client

```bash
./scripts/db-access.sh query "
SELECT i.* FROM invoices i
JOIN clients c ON i.clientId = c.id
WHERE c.companyName = 'Client Name';
"
```

### Get Revenue Summary

```bash
./scripts/db-access.sh query "
SELECT 
  DATE_FORMAT(createdAt, '%Y-%m') as month,
  SUM(totalAmount) as revenue,
  COUNT(*) as invoice_count
FROM invoices
WHERE status = 'paid'
GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
ORDER BY month DESC;
"
```

### Find Overdue Invoices

```bash
./scripts/db-access.sh query "
SELECT i.*, c.companyName FROM invoices i
JOIN clients c ON i.clientId = c.id
WHERE i.status = 'pending' AND i.dueDate < NOW();
"
```

### Export Data to CSV

```bash
docker exec melitech-mysql mysql -u melitech -pmelitech_password_123 melitech_crm \
  -e "SELECT * FROM invoices;" | sed 's/\t/,/g' > invoices.csv
```

---

## Database Maintenance

### Check Database Size

```bash
./scripts/db-access.sh query "
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) as size_mb
FROM information_schema.TABLES
WHERE table_schema = 'melitech_crm'
ORDER BY (data_length + index_length) DESC;
"
```

### Optimize Tables

```bash
./scripts/db-access.sh query "
OPTIMIZE TABLE users, clients, invoices, payments, projects;
"
```

### Check Table Status

```bash
./scripts/db-access.sh query "
CHECK TABLE users, clients, invoices, payments;
"
```

### View Database Logs

```bash
docker logs melitech-mysql | tail -50
```

---

## Troubleshooting

### Issue: Cannot Connect to Database

**Solution 1: Verify containers are running**
```bash
docker-compose ps
```

**Solution 2: Check database logs**
```bash
docker logs melitech-mysql
```

**Solution 3: Restart database**
```bash
docker-compose restart mysql
sleep 10
docker-compose ps
```

### Issue: Database Initialization Failed

**Solution: Check app logs**
```bash
docker logs melitech-app
```

**Solution: Rebuild and restart**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
sleep 30
docker logs melitech-app
```

### Issue: Access Denied

**Solution: Verify credentials**
```bash
# Check .env.docker file
cat .env.docker | grep MYSQL

# Verify database is running
docker exec melitech-mysql mysql -u root -proot_password_123 -e "SELECT 1;"
```

### Issue: Out of Disk Space

**Solution: Clean up Docker**
```bash
# Remove unused volumes
docker volume prune

# Remove unused images
docker image prune

# Check disk usage
docker system df
```

---

## Backup and Recovery

### Automatic Backups

Create a cron job for automatic backups:

```bash
# Edit crontab
crontab -e

# Add this line to backup daily at 2 AM
0 2 * * * cd /path/to/melitech_crm && ./scripts/db-access.sh backup
```

### Manual Backup

```bash
./scripts/db-access.sh backup
```

### Restore from Backup

```bash
./scripts/db-access.sh restore backups/melitech_crm_20231209_120000.sql
```

### List Available Backups

```bash
ls -lh backups/
```

---

## Performance Optimization

### Add Indexes

```bash
./scripts/db-access.sh query "
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_client_status ON clients(status);
CREATE INDEX idx_invoice_status ON invoices(status);
CREATE INDEX idx_invoice_date ON invoices(createdAt);
"
```

### Monitor Slow Queries

```bash
./scripts/db-access.sh query "
SELECT * FROM mysql.slow_log LIMIT 10;
"
```

### Check Query Performance

```bash
./scripts/db-access.sh query "
EXPLAIN SELECT * FROM invoices WHERE status = 'pending';
"
```

---

## Security Best Practices

1. **Change Default Passwords**: Update credentials in `.env.docker` before production
2. **Restrict Access**: Only expose database port to trusted networks
3. **Use SSL**: Enable SSL connections for remote access
4. **Regular Backups**: Maintain regular backup schedule
5. **Monitor Access**: Review database logs regularly
6. **Limit Privileges**: Use role-based access control

---

## Docker Commands Reference

```bash
# View all containers
docker-compose ps

# View container logs
docker-compose logs mysql
docker-compose logs app

# Execute command in container
docker exec melitech-mysql mysql -u melitech -pmelitech_password_123 melitech_crm

# Stop containers
docker-compose stop

# Start containers
docker-compose start

# Restart containers
docker-compose restart

# Remove containers and volumes
docker-compose down -v

# View container resource usage
docker stats melitech-mysql
```

---

## Additional Resources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Database Design Best Practices](https://en.wikipedia.org/wiki/Database_design)

---

**Last Updated**: December 9, 2025
**Version**: 1.0
**Status**: ✅ Production Ready
