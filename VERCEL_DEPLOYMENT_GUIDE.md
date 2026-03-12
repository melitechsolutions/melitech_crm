# Vercel Deployment Guide for Melitech CRM

**Last Updated:** March 12, 2026  
**Framework:** Vite (Node.js ESM + React)  
**Repository:** https://github.com/melitechsolutions/melitech_crm

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Deployment](#step-by-step-deployment)
4. [Environment Variables](#environment-variables)
5. [Build Configuration](#build-configuration)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)
8. [Rollback & Recovery](#rollback--recovery)

---

## Quick Start

The fastest way to deploy Melitech CRM to Vercel is using the pre-configured import link:

**[Deploy to Vercel](https://vercel.com/new/import?framework=vite&gitOrgLimit=1&hasTrialAvailable=1&name=melitech_crm&owner=melitechsolutions&project-name=melitech-crm&provider=github&s=https://github.com/melitechsolutions/melitech_crm&teamSlug=melitech-solutions-projects)**

Or manually:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Select "Import Git Repository"
3. Enter: `https://github.com/melitechsolutions/melitech_crm`
4. Click "Import"

---

## Prerequisites

### Account Setup
- ✅ Vercel Account (free or paid tier)
- ✅ GitHub Account with access to `melitechsolutions/melitech_crm`
- ✅ Personal Access Token for private repositories (if needed)

### Repository Requirements
- ✅ Git repository properly configured
- ✅ `package.json` in root directory
- ✅ `pnpm-lock.yaml` for dependency locking
- ✅ Build script: `npm run build`
- ✅ Output directory: `dist/` (configured in `vite.config.ts`)

### Environment & Tools
- Vercel CLI (optional): `npm install -g vercel`
- Node.js 22+ (auto-detected by Vercel)
- pnpm 10.4.1+ (auto-detected)

---

## Step-by-Step Deployment

### Step 1: Prepare Repository

Ensure your repository is clean and ready for deployment:

```bash
# Verify Git status
git status

# Commit any pending changes
git add .
git commit -m "Ready for Vercel deployment"

# Push to GitHub
git push origin main
```

### Step 2: Connect GitHub to Vercel

1. **Sign in** to Vercel Dashboard: https://vercel.com/dashboard
2. **Connect Git Provider**:
   - Click "New Project" 
   - Select "GitHub" 
   - Click "Import Git Repository"
   - Authorize Vercel GitHub App (one-time)
3. **Select Repository**:
   - Search for `melitech_crm`
   - Click "Import"

### Step 3: Configure Project Settings

When Vercel imports the project, it will auto-detect:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

**Verify these settings:**

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: pnpm install
```

### Step 4: Set Environment Variables

Add required environment variables before deployment:

```bash
# Vercel Dashboard → Project Settings → Environment Variables

# Database
DATABASE_URL=your_production_database_url
MYSQL_URL=your_production_mysql_url

# Application
NODE_ENV=production
VITE_APP_ID=melitech_crm
VITE_APP_TITLE=Melitech Solutions

# Security
JWT_SECRET=your_secure_random_jwt_secret
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax

# Email (Mailhog or Production SMTP)
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_FROM_EMAIL=noreply@melitech.solutions
SMTP_FROM_NAME=Melitech Solutions

# AI Integration (Optional)
ANTHROPIC_API_KEY=your_anthropic_api_key
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-70b-versatile

# OAuth (Optional)
OAUTH_SERVER_URL=https://api.manus.im

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT=your_analytics_endpoint
VITE_ANALYTICS_WEBSITE_ID=your_website_id
```

### Step 5: Initialize Deployment

**Option A: Via Dashboard**
1. Click "Deploy" button in import dialog
2. Wait 3-5 minutes for build & deployment
3. Vercel will provide a live URL (e.g., `melitech-crm.vercel.app`)

**Option B: Via CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Select:
# - Account/Team: melitech-solutions-projects
# - Project: melitech-crm
# - Link to existing project: Yes
# - Build configuration: Override
```

### Step 6: Verify Deployment

```bash
# Check deployment status
vercel list

# View logs
vercel logs melitech-crm --prod

# Open in browser
vercel open --prod
```

---

## Environment Variables

### Required Variables

| Variable | Example | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `mysql://user:pass@host/db` | Primary database connection |
| `NODE_ENV` | `production` | Runtime environment |
| `JWT_SECRET` | `xxxxx...xxxxx` | JWT token signing (32+ chars) |

### Recommended Variables

| Variable | Example | Purpose |
|----------|---------|---------|
| `SMTP_HOST` | `smtp.gmail.com` | Email service provider |
| `SMTP_PORT` | `587` | SMTP port (TLS) |
| `ANTHROPIC_API_KEY` | `sk-xxxxx` | Claude AI integration |
| `GROQ_API_KEY` | `gsk_xxxxx` | Groq LLM access |
| `COOKIE_SECURE` | `true` | HTTPS-only cookies |

### Setting Environment Variables

**Via Vercel Dashboard:**
1. Project → Settings → Environment Variables
2. Add key-value pairs
3. Select environments: Production, Preview, Development
4. Click "Save"

**Via Vercel CLI:**
```bash
vercel env add DATABASE_URL
# Follow prompts to enter value and select environments
```

**Via `.env.production` (not recommended for secrets):**
```env
# Only non-sensitive values
VITE_APP_ID=melitech_crm
VITE_APP_TITLE=Melitech Solutions
NODE_ENV=production
```

---

## Build Configuration

### Automatic Detection

Vercel automatically detects:
- **Framework**: Vite (from `vite.config.ts`)
- **Runtime**: Node.js 22
- **Package Manager**: pnpm (from `pnpm-lock.yaml`)

### Manual Override (if needed)

**File: `vercel.json`**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "api/**: {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

### Build Optimization

**Vite Configuration** (`vite.config.ts`):
```javascript
export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@radix-ui/*'],
        }
      }
    }
  }
});
```

---

## Post-Deployment

### 1. Domain Configuration

**Add Custom Domain:**
1. Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `melitech.solutions`)
4. Follow DNS configuration steps:
   - A Record: Points to Vercel
   - CNAME Record: For www subdomain

**DNS Configuration Example:**
```
Type | Name | Value
-----|------|-------
A    | @    | 76.76.19.165 (Vercel IP)
CNAME| www  | cname.vercel-dns.com
```

### 2. SSL/TLS Certificate

- ✅ **Automatically provisioned** by Vercel (free with Let's Encrypt)
- ✅ Auto-renews before expiration
- Available at: Project Settings → Deployments → HTTPS

### 3. Analytics & Monitoring

**Enable Vercel Analytics:**
1. Project Settings → Analytics
2. Toggle "Web Analytics"
3. Dashboard → Analytics

**Monitor:**
- Deployment status
- Build logs
- Edge function performance
- Database query times

### 4. Database Connection

For production database:

```javascript
// server/db.ts
const DATABASE_URL = process.env.DATABASE_URL;

export async function getDb() {
  // Connection with retry logic for Vercel serverless
  return mysql.createConnection({
    uri: DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 10,
  });
}
```

### 5. Scheduled Jobs & Cron

**Optional: Set up scheduled tasks**

**File: `vercel.json`**
```json
{
  "crons": [{
    "path": "/api/cron/billing-reminders",
    "schedule": "0 8 * * *"
  }]
}
```

---

## Troubleshooting

### Build Failures

**Issue: "Build failed"**
```bash
# Check logs
vercel logs melitech-crm --prod

# Common causes:
# - Missing environment variables
# - TypeScript errors
# - Missing dependencies
```

**Solution:**
```bash
# Test build locally
npm run build

# Check for TypeScript errors
npm run check

# Ensure all dependencies are in package.json
npm ls
```

### Runtime Errors

**Issue: "ERR_MODULE_NOT_FOUND"**

**Solution:**
- Verify `@anthropic-ai/sdk` is in `package.json`
- Check `pnpm-lock.yaml` is present
- Run locally: `pnpm install && npm run build`

### Database Connection Issues

**Issue: "Cannot connect to database"**

**Solution:**
1. Verify `DATABASE_URL` in environment variables
2. Check database IP whitelist includes Vercel IPs
3. Test connection string locally:
```bash
mysql -u $DB_USER -p$DB_PASS -h $DB_HOST $DB_NAME
```

### Slow Performance

**Solutions:**
1. **Enable Vercel Edge Caching:**
   - Add cache headers in middleware
   - Use Vercel KV for session storage

2. **Optimize Images:**
   - Use Next.js Image (if migrating)
   - Serve WebP format

3. **Database Optimization:**
   - Add indexes to frequently queried columns
   - Use connection pooling
   - Cache responses with CDN

---

## Rollback & Recovery

### Quick Rollback

**Via Vercel Dashboard:**
1. Project → Deployments
2. Click deployment to roll back (marked with checkmark)
3. Click "Promote to Production"

**Via CLI:**
```bash
# List deployments
vercel deployments

# Rollback to specific deployment
vercel promote <DEPLOYMENT_URL>
```

### Data Recovery

**Database Backup Strategy:**
```bash
# Automated daily backups (configure in database provider)
# Example for MySQL:
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > backup_$(date +%Y%m%d).sql

# Store backups in S3 or Cloud Storage
aws s3 cp backup_$(date +%Y%m%d).sql s3://your-backup-bucket/
```

### Incident Response

**If production is down:**

1. **Immediate Actions** (< 5 min):
   - Roll back to last stable deployment
   - Check Vercel status page
   - Review recent changes

2. **Investigation** (5-30 min):
   - Check build logs
   - Review environment variables
   - Check database connectivity
   - Review error tracking (Sentry, etc.)

3. **Resolution**:
   - Fix identified issues
   - Test locally
   - Deploy new version
   - Monitor for 15+ minutes

---

## Monitoring & Maintenance

### Continuous Monitoring

**Enable Vercel Observability:**
- Dashboard → Monitoring
- Track: CPU, memory, network, requests/sec
- Set up alerts for anomalies

**Recommended Alerts:**
```
- Build time > 10 minutes
- Deployment failure
- Function errors rate > 1%
- Response time > 5 seconds
```

### Regular Maintenance

**Weekly:**
- Review error logs
- Check for security updates
- Monitor database performance

**Monthly:**
- Performance audit
- Dependency updates
- Security scanning (Dependabot)

**Quarterly:**
- Cost analysis
- Capacity planning
- Infrastructure review

---

## Advanced: Custom Configurations

### Rewrites & Redirects

**File: `vercel.json`**
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "http://localhost:3000/api/:path*"
    }
  ],
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

### Edge Functions

**Deploy custom edge logic:**
```javascript
// api/middleware.ts
export default function middleware(request) {
  // Custom auth, rate limiting, etc.
  return request;
}
```

### Zero-Downtime Deployments

Vercel automatically handles:
- ✅ Blue-green deployments
- ✅ Health checks before cutover
- ✅ Automatic rollback on failure

---

## Support & Resources

**Helpful Links:**
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [pnpm Package Manager](https://pnpm.io/)
- [GitHub Actions Integration](https://vercel.com/docs/git/vercel-for-github)

**Contact:**
- Vercel Support: support@vercel.com
- GitHub Issues: github.com/melitechsolutions/melitech_crm/issues

---

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing locally
- [ ] No uncommitted changes
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Build completes successfully
- [ ] No console errors in production build
- [ ] Security scan passed
- [ ] Performance acceptable (Lighthouse > 80)
- [ ] Backup of current production data
- [ ] Rollback plan documented
- [ ] Team notified of deployment
- [ ] Monitoring alerts configured

---

**Last Deployment:** [See deployments in Vercel Dashboard](https://vercel.com/dashboard)  
**Current Production URL:** https://melitech-crm.vercel.app  
**Status:** ✅ Ready for Production Deployment
