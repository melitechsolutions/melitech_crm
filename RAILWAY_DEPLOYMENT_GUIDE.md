# Melitech CRM - Railway.app Deployment Guide

Vercel is designed for **serverless static sites and functions**, not persistent Node.js servers. 

Your Melitech CRM is a **full-stack Express app** that requires:
- Node.js runtime (persistent server running 24/7)
- Database connection
- API endpoints

**RECOMMENDED: Deploy to Railway.app instead** (much simpler for full-stack apps)

## Quick Railway Setup

### 1. Connect Repository
- Go to https://railway.app
- Click "New Project" → "Deploy from GitHub"
- Select your `melitech_crm` repository
- Railway auto-detects it's a Node.js project

### 2. Add MySQL Database  
- In Railway dashboard, click "Add Service"
- Select "MySQL"
- Railway automatically links `DATABASE_URL` env var

### 3. Environment Variables
Railway dashboard → Variables → Add:
- `NODE_ENV`: production
- `JWT_SECRET`: melitech_prod_secret_key_2024_vercel_deployment_secure
- `VITE_APP_ID`: melitech_crm
- `VITE_APP_TITLE`: Melitech Solutions

### 4. Deploy
- Railway auto-deploys on git push
- Custom domain: Railway dashboard → Domain → Add custom domain

## Why Railway > Vercel for this app:
✅ Supports persistent Node.js servers  
✅ Built-in MySQL database  
✅ Auto environment variable linking  
✅ Easier full-stack deployments  

## If you MUST use Vercel:
You'd need to split the architecture:
- Frontend → Vercel (static site)
- API → Separate Node.js server (Railway/Render)
- Requires code restructuring (separate build/runtime)
