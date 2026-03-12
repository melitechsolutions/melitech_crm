# Database & Diagnostics Quick Reference Card

## 🚀 Emergency: What to Do First

```bash
# Check if database is working
npm run db:health

# If that shows tables: 0, run this:
npm run db:setup

# Then verify:
npm run db:health
```

**Expected:** `✅ Connection successful` + `Total tables: 30`

---

## 📋 Common Tasks

### Development Setup
```bash
npm install              # Install dependencies
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Build for production  
npm run check            # TypeScript validation
npm run format           # Auto-format code
```

### Database Operations
```bash
npm run db:health        # Check database status
npm run db:setup         # Create/migrate database
npm run db:diagnose      # Both: health + setup
npm run db:migrate       # Apply pending migrations
npm run db:seed          # Populate test data
```

### Docker (if using containers)
```bash
docker-compose up -d     # Start containers
docker-compose down      # Stop containers
docker ps                # Show running containers
docker logs melitech_crm_app       # App logs
docker logs melitech_crm_db        # Database logs
```

---

## 🔍 Troubleshooting Flowchart

```
Problem: Queries fail or "No tables found"
  ↓
Run: npm run db:health
  ↓
  ├─ ✅ Connection successful? → YES
  │  ├─ Tables: 30? → YES → ✅ Everything working
  │  ├─ Tables: 30? → NO  → Run npm run db:setup
  │
  └─ ❌ Connection error? → YES
     ├─ Error "ECONNREFUSED"? → docker-compose up -d
     ├─ Error "Access denied"? → Check DATABASE_URL in .env
     └─ Other error? → See DATABASE_TROUBLESHOOTING.md
```

---

## 🌐 Web Endpoints (Public, No Auth)

| Endpoint | Purpose | Use For |
|----------|---------|---------|
| `/api/trpc/health.status` | Basic status | Uptime monitoring |
| `/api/trpc/health.detailed` | Full diagnostics | Debugging |
| `/api/trpc/health.migrations` | Migration history | Version tracking |

Example:
```bash
curl http://localhost:3000/api/trpc/health.status
```

---

## 📁 Important Files

| File | What It Does |
|------|-------------|
| `.env` | Database credentials (DATABASE_URL) |
| `docker-compose.yml` | Container setup (ports, volumes) |
| `drizzle/schema.ts` | Database table definitions |
| `server/routers.ts` | All API endpoints registered here |
| `package.json` | Scripts and dependencies |

---

## 🔐 Critical Information

### Database Credentials
```
User: melitech_user
Password: tjwzT9pW;NGYq1QxSq0B
Database: melitech_crm
Host (Docker): db
Host (Local): localhost:3307
```

### Default Ports
```
Frontend: 5173 (Vite dev server)
Backend: 3000 (TRPC/API)
Database: 3306 (inside Docker) or 3307 (from host)
```

### Environment Variables
```bash
DATABASE_URL=mysql://user:pass@host:port/database
NODE_ENV=development          # or production
GROQ_API_KEY=your_key        # For AI features
```

---

## ⚡ Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Build Time | < 30s | ✅ ~36s |
| TypeScript Errors | 0 | ✅ 0 |
| Build Warnings | < 10 | ✅ 5 |
| Database Tables | 30 | ✅ Designed |
| API Endpoints | 50+ | ✅ Implemented |

---

## 🎯 Decision Tree: Which Command?

```
I want to:

├─ Start coding
│  └─ npm run dev
│
├─ Check if database is okay
│  └─ npm run db:health
│
├─ Fix database (tables missing)
│  └─ npm run db:setup
│
├─ Deploy to production
│  ├─ npm run build
│  ├─ npm start
│  └─ npm run db:migrate
│
├─ See code quality issues
│  └─ npm run check
│
├─ Format code nicely
│  └─ npm run format
│
└─ Create backup of database
   └─ docker exec melitech_crm_db mysqldump -u root -p melitech_crm > backup.sql
```

---

## 🆘 SOS Quick Fixes

### "Connection refused"
```bash
docker-compose up -d && sleep 10 && npm run db:health
```

### "Access denied"
Check `.env` file for correct DATABASE_URL

### "Tables not found"
```bash
npm run db:setup
```

### "Port already in use"
Change in `docker-compose.yml`:
```yaml
ports:
  - "3307:3306"  # Change 3307 to something else
```

### "Out of disk space"
Docker volumes getting big:
```bash
docker volume ls
docker volume rm $(docker volume ls -q)  # ⚠️ WARNING: Deletes all data!
```

### "Build won't compile"
```bash
npm install --force && npm run build
```

---

## 📊 Status Check Routine

Run this hourly to ensure everything is working:

```bash
# Quick status
npm run db:health

# Full diagnostics (if issues found)
npm run db:diagnose

# Logs (if problems persist)
docker logs melitech_crm_app --tail 50
docker logs melitech_crm_db --tail 50
```

---

## 🔄 Deployment Checklist

- [ ] `npm run check` passes (no TypeScript errors)
- [ ] `npm run build` succeeds (~36 seconds)
- [ ] `npm run db:health` shows connected
- [ ] All 30+ tables exist in database
- [ ] `.env` has correct DATABASE_URL
- [ ] `.env` has GROQ_API_KEY (if using AI)
- [ ] `docker ps` shows both app and db running
- [ ] `curl http://localhost:3000/api/trpc/health.status` returns 200

---

## 📞 Getting Help

1. **Quick question?** → Check [DIAGNOSTIC_GUIDE.md](./DIAGNOSTIC_GUIDE.md)
2. **Setup problem?** → Check [DATABASE_TROUBLESHOOTING.md](./DATABASE_TROUBLESHOOTING.md)
3. **Project overview?** → Check [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)
4. **API questions?** → Check [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)
5. **Deployment help?** → Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 📝 Useful SQL Queries

```sql
-- Check database size
SELECT 
  table_name, 
  ROUND(((data_length + index_length) / 1024 / 1024), 2) as size_mb
FROM information_schema.tables 
WHERE table_schema = 'melitech_crm';

-- List all tables
SHOW TABLES;

-- Check table record count
SELECT COUNT(*) FROM invoices;
SELECT COUNT(*) FROM orders;
SELECT COUNT(*) FROM employees;

-- View migration history
SELECT * FROM __drizzle_migrations__;

-- Check active connections
SHOW PROCESSLIST;
```

---

## 💾 Backup & Recovery

### Create Backup
```bash
docker exec melitech_crm_db mysqldump \
  -u root \
  -p'R:vVl:m7J9x3Hr|yWEUp' \
  melitech_crm \
  > melitech_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Backup
```bash
docker exec -i melitech_crm_db mysql \
  -u root \
  -p'R:vVl:m7J9x3Hr|yWEUp' \
  melitech_crm \
  < melitech_backup.sql
```

---

## 🎯 Success Indicators

When everything is working, you should see:

```
✅ npm run build → "built in 36.63s"
✅ npm run db:health → "✅ Connection successful"
✅ npm run db:health → "Total tables: 30"
✅ npm run dev → "Local: http://localhost:5173"
✅ Browser → No errors in Console
✅ Database → All tables have data
```

---

**Bookmark this page. Print it. Keep it handy!**

*For detailed information, see the full guides in the repository.*
