# Vercel Deployment Quick Reference

## One-Click Deploy

**[→ Deploy to Vercel Now](https://vercel.com/new/import?framework=vite&gitOrgLimit=1&hasTrialAvailable=1&name=melitech_crm&owner=melitechsolutions&project-name=melitech-crm&provider=github&s=https://github.com/melitechsolutions/melitech_crm&teamSlug=melitech-solutions-projects)**

---

## Essential Environment Variables

```bash
# Database (REQUIRED)
DATABASE_URL=mysql://user:password@host:3306/melitech_crm

# Security (REQUIRED)
JWT_SECRET=your-32-character-random-string-here

# Application (REQUIRED)
NODE_ENV=production
VITE_APP_ID=melitech_crm
VITE_APP_TITLE=Melitech Solutions

# Email (REQUIRED for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_FROM_EMAIL=noreply@melitech.solutions

# AI (OPTIONAL but recommended)
ANTHROPIC_API_KEY=sk-xxxxxxxxxxxxx
GROQ_API_KEY=gsk-xxxxxxxxxxxxx

# Cookie Security
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
```

---

## Deploy Via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# View logs
vercel logs melitech-crm --prod

# Rollback to previous
vercel deployments
vercel promote <DEPLOYMENT_URL>
```

---

## Deployment Steps (Dashboard)

1. **Go to Vercel:** https://vercel.com/dashboard
2. **Click:** "New Project"
3. **Select:** "Import Git Repository"
4. **Search:** `melitech_crm`
5. **Click:** "Import"
6. **Configure:**
   - Framework: Vite ✅ (auto-detected)
   - Build: `npm run build` ✅ (auto-detected)
   - Output: `dist` ✅ (auto-detected)
7. **Add Environment Variables** (Settings → Environment Variables)
8. **Click:** "Deploy"
9. **Wait:** 3-5 minutes
10. **Done:** Live at `melitech-crm.vercel.app`

---

## Domain Configuration

```bash
# Add custom domain
# Vercel Dashboard → Settings → Domains → Add Domain

# DNS Settings (add to domain registrar):
A Record:     @ → 76.76.19.165
CNAME Record: www → cname.vercel-dns.com

# SSL Certificate: Automatically provisioned by Let's Encrypt
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check environment variables, run `npm run build` locally |
| "Cannot find module" | Verify dependency in `package.json`, check `pnpm-lock.yaml` |
| Database error | Verify `DATABASE_URL`, check IP whitelist |
| Slow performance | Enable Edge caching, optimize database queries |

---

## Rollback (1 minute)

```bash
# Via CLI
vercel deployments  # See all deployments
vercel promote <URL>  # Promote previous deployment

# Via Dashboard
# Deployments → Click previous version → "Promote to Production"
```

---

## Monitoring

- **Dashboard:** https://vercel.com/dashboard/melitech-crm
- **Logs:** `vercel logs melitech-crm --prod --follow`
- **Status:** https://www.vercelstatus.com

---

## First Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] Vercel account created
- [ ] GitHub connected to Vercel
- [ ] Environment variables added
- [ ] Database configured and accessible
- [ ] Build test successful locally (`npm run build`)
- [ ] Deploy button clicked
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic)
- [ ] Production URL tested

---

## Cost Estimation

| Tier | Price | Includes |
|------|-------|----------|
| **Hobby** | Free | 100GB bandwidth, 12 serverless function hours/month |
| **Pro** | $20/mo | Unlimited projects, 1TB bandwidth, Web Analytics |
| **Enterprise** | Custom | Support, SLA, dedicated infrastructure |

**Budget:** Start with Hobby tier, upgrade to Pro as usage grows

---

## Support

- **Docs:** https://vercel.com/docs
- **Community:** https://vercel.com/community
- **Issues:** https://github.com/melitechsolutions/melitech_crm/issues
- **Email:** support@vercel.com

---

Last Updated: March 12, 2026
