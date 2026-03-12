# Claude Haiku 4.5 AI Integration - Environment Setup Guide

**Created:** February 20, 2026  
**Version:** 1.0  
**Status:** Ready for Production Deployment

---

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Getting Claude API Key](#getting-claude-api-key)
4. [Local Development Setup](#local-development-setup)
5. [Docker Setup](#docker-setup)
6. [Production Deployment](#production-deployment)
7. [Testing & Validation](#testing--validation)
8. [Troubleshooting](#troubleshooting)
9. [API Cost Estimation](#api-cost-estimation)
10. [Security Best Practices](#security-best-practices)

---

## Overview

The Melitech CRM now includes **Claude Haiku 4.5** AI powered features for:
- **Document Summarization** - Extract insights from documents (key points, action items, financial summaries)
- **Email Generation** - Create professional emails in multiple styles
- **Financial Analysis** - Analyze expenses, revenue, cash flow, and profitability
- **Chat Assistant** - Conversational AI for CRM data queries and business intelligence

### AI Features at a Glance

| Feature | Model | Input | Output | Tokens (Est.) |
|---------|-------|-------|--------|---------------|
| Summarize Document | Claude 3.5 Haiku | Text (up to 10k chars) | Summary (500-1000 words) | 500-1500 |
| Generate Email | Claude 3.5 Haiku | Context (500-2000 chars) | Email (200-500 words) | 300-800 |
| Chat (Single Turn) | Claude 3.5 Haiku | Message + Context | Response | 200-1000 |
| Analyze Financials | Claude 3.5 Haiku | Financial data description | Analysis with insights | 300-1200 |

---

## Prerequisites

### System Requirements
- **Node.js:** 18.x or higher
- **Docker:** 20.10+ (for containerized deployment)
- **npm/pnpm:** Latest version
- **Anthropic Account:** Active with billing enabled

### Permissions Required
- Ability to set environment variables
- Access to `.env` file (local) or container/cloud configuration (production)
- Ability to restart application services

---

## Getting Claude API Key

### Step 1: Create Anthropic Account
1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Sign up with email or Google account
3. Verify email address

### Step 2: Enable Billing
1. Go to **Settings** → **Billing**
2. Add a payment method (credit/debit card)
3. Set up billing (pay-as-you-go recommended for evaluation)

### Step 3: Generate API Key
1. Navigate to **API Keys** section
2. Click **Create Key**
3. Give it a name (e.g., "Melitech CRM Production")
4. **Copy the key immediately** (it won't be shown again)
5. Store securely (see [Security Best Practices](#security-best-practices))

### Step 4: Set Rate Limits (Optional)
1. In API Keys settings, set monthly spend limit
2. Recommended initial limit: $20/month for development
3. Increase as needed after monitoring usage

**Save your API key securely before proceeding.**

---

## Local Development Setup

### Option A: Using `.env` File (Recommended)

#### 1. Create `.env` File
```bash
cd /path/to/melitech_crm
touch .env
```

#### 2. Add API Key
```env
# Claude AI Integration
ANTHROPIC_API_KEY=sk-ant-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Set model version (default is claude-3-5-haiku-20241022)
ANTHROPIC_MODEL=claude-3-5-haiku-20241022

# Optional: API request timeout (milliseconds, default 30000)
ANTHROPIC_TIMEOUT=30000
```

#### 3. Verify Setup in TypeScript Code
The application will automatically detect the API key:
```typescript
// server/routers/ai.ts will read ANTHROPIC_API_KEY from process.env
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error('ANTHROPIC_API_KEY not set');
}
```

#### 4. Load Environment Variables
**For development (automatic):**
```bash
pnpm run dev
# The dev server automatically loads .env via vite/Node.js
```

**For manual verification:**
```powershell
# PowerShell - Check if env var is loaded
$env:ANTHROPIC_API_KEY
# Should output: sk-ant-v1-...
```

---

### Option B: Command-Line Setup (CLI)

#### Linux/macOS:
```bash
export ANTHROPIC_API_KEY=sk-ant-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
pnpm run dev
```

#### Windows PowerShell:
```powershell
$env:ANTHROPIC_API_KEY = "sk-ant-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
pnpm run dev
```

---

## Docker Setup

### Option A: Using Docker Compose

#### 1. Update `docker-compose.yml`
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5173:5173"
      - "3000:3000"
    environment:
      # Database
      DATABASE_URL: ${DATABASE_URL}
      DB_HOST: ${DB_HOST}
      DB_PORT: ${DB_PORT}
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      
      # Claude AI
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      ANTHROPIC_MODEL: claude-3-5-haiku-20241022
      ANTHROPIC_TIMEOUT: 30000
      
      # Server
      NODE_ENV: development
      SERVER_PORT: 3000
    
    volumes:
      - .:/app
      - /app/node_modules
    
    depends_on:
      - db
  
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

#### 2. Create `.env.docker` File
```bash
cp .env .env.docker
echo "ANTHROPIC_API_KEY=sk-ant-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" >> .env.docker
```

#### 3. Start Services
```bash
docker-compose up -d
# Check logs
docker-compose logs -f app
```

#### 4. Verify Claude is Available
> **Note**: the `ai.checkAvailability` route is protected and requires a logged-in session.
> Call it from within the web UI or pass an authentication cookie with your request.
```bash
# example using existing cookie file exported by your browser
curl -b ~/cookies.txt http://localhost:3000/api/trpc/ai.checkAvailability
# Expected response: {"result":{"data":{"available":true,"model":"claude-3-5-haiku-20241022"}}}
```

---

### Option B: Docker Build with Secrets

For enhanced security in production:

#### 1. Create Secret File
```bash
echo "sk-ant-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" > .secrets/anthropic_key.txt
chmod 600 .secrets/anthropic_key.txt
```

#### 2. Use BuildKit Secrets (Docker Build)
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Mount secret at build time (not in final image)
RUN --mount=type=secret,id=anthropic_key \
    export ANTHROPIC_API_KEY=$(cat /run/secrets/anthropic_key) && \
    pnpm install && \
    pnpm run build

# Runtime: Pass via environment
ENV ANTHROPIC_API_KEY=""
# Set at runtime with: docker run -e ANTHROPIC_API_KEY=...
```

#### 3. Build with Secrets
```bash
docker build --secret anthropic_key=.secrets/anthropic_key.txt -t melitech-crm:latest .
```

---

## Production Deployment

### Option A: Cloud Platform (Recommended)

#### Vercel Deployment
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel deploy

# 3. Add environment variable in Vercel dashboard
# Settings → Environment Variables → Add:
# ANTHROPIC_API_KEY=sk-ant-v1-...

# 4. Redeploy to apply env vars
vercel deploy --prod
```

#### Railway / Render Deployment
1. Connect GitHub repository
2. Add environment variable in dashboard:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-v1-...`
3. Deploy or trigger rebuild

#### AWS ECS / Lambda
```bash
# Via AWS Parameter Store (SSM)
aws ssm put-parameter \
  --name /melitech-crm/anthropic-api-key \
  --value sk-ant-v1-... \
  --type SecureString

# Reference in ECS task definition:
{
  "name": "ANTHROPIC_API_KEY",
  "valueFrom": "arn:aws:ssm:region:account:parameter/melitech-crm/anthropic-api-key"
}
```

---

### Option B: Self-Hosted (VPS/Dedicated Server)

#### 1. SSH into Server
```bash
ssh user@your-server.com
cd /var/www/melitech-crm
```

#### 2. Update `.env` File
```bash
nano .env
# Add: ANTHROPIC_API_KEY=sk-ant-v1-...
# Press Ctrl+X, Y, Enter to save
```

#### 3. Restart Application
```bash
# If using PM2
pm2 restart melitech-crm

# If using systemd
sudo systemctl restart melitech-crm

# If using Docker Compose
docker-compose up -d --build
```

#### 4. Verify Deployment
```bash
curl https://your-crm.com/api/trpc/ai.checkAvailability
# Should return: {"available":true,"model":"claude-3-5-haiku-20241022"}
```

---

## Testing & Validation

### 1. API Health Check

#### Using cURL
```bash
# Check if Claude is available
curl -X POST http://localhost:3000/api/trpc/ai.checkAvailability

# Should return:
# {"result":{"data":{"available":true,"model":"claude-3-5-haiku-20241022","features":["summarizeDocument","generateEmail","chat","analyzeFinancials"]}}}
```

#### Using Browser Console
```javascript
// From the CRM application, open browser console
fetch('/api/trpc/ai.checkAvailability', { method: 'POST' })
  .then(r => r.json())
  .then(d => console.log(d))
```

---

### 2. Test Document Summarization

#### Via API
```bash
curl -X POST http://localhost:3000/api/trpc/ai.summarizeDocument \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "text": "Our Q4 2025 budget allocation: Services 40%, Products 35%, Operations 25%. Main priorities are cloud infrastructure upgrade (KES 500k) and team expansion (3 new hires). Expected ROI is 25% YoY growth.",
      "focus": "financial"
    }
  }'

# Expected response (200ms - 2s):
{
  "result": {
    "data": "KEY FINANCIAL INSIGHTS:\n- Budget allocation summary: Services 40%, Products 35%, Operations 25%\n- Major investments: Cloud infrastructure and team expansion\n- Expected outcome: 25% year-over-year growth..."
  }
}
```

---

### 3. Test Email Generation

```bash
curl -X POST http://localhost:3000/api/trpc/ai.generateEmail \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "context": "Project: Website Redesign, Client: Acme Corp, Status: Milestone 2 complete, Next: Final testing in 2 weeks",
      "tone": "professional",
      "type": "project_update"
    }
  }'

# Expected: Professional email greeting, milestone summary, next steps
```

---

### 4. Test Financial Analysis

```bash
curl -X POST http://localhost:3000/api/trpc/ai.analyzeFinancials \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "financialData": "January expenses: Salaries 60k, Cloud 15k, Marketing 10k. February: Salaries 60k, Cloud 18k (↑20%), Marketing 12k.",
      "metricType": "expense_trends"
    }
  }'

# Expected: Trend analysis with opportunities
```

---

### 5. Test Chat Assistant

```bash
curl -X POST http://localhost:3000/api/trpc/ai.chat \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "message": "What are our top clients by revenue?",
      "context": "Optional: CRM context data"
    }
  }'

# Expected: Natural language response with insights
```

---

### 6. Full Integration Test in UI

#### Step 1: Navigate to Profile
```
Login → Profile → (scroll to Photo section)
```

#### Step 2: Upload Photo
```
Click "Upload Photo" → Select image → Confirm
Expected: Photo displays immediately, toast shows success
```

#### Step 3: Open Settings
```
Settings → Company Info tab
```

#### Step 4: Test AI Features (Future Frontend Integration)
Once the frontend is updated with AI feature buttons:
```
1. Document Summarization:
   - Input: Paste contract text
   - Click "Summarize"
   - See AI-generated summary in 2-5 seconds

2. Email Generator:
   - Input: Project details
   - Select tone (friendly/professional)
   - Click "Generate Email"
   - Copy and customize if needed

3. Financial Analysis:
   - Select date range
   - Click "Analyze Trends"
   - View AI insights dashboard
```

---

## Troubleshooting

### Issue 1: `ANTHROPIC_API_KEY not found`

**Symptom:** Error message on startup or when accessing AI features

**Causes & Solutions:**

```bash
# Solution A: Check .env file exists and is readable
ls -la .env
cat .env | grep ANTHROPIC_API_KEY

# Solution B: Verify env var is loaded in runtime
node -e "console.log(process.env.ANTHROPIC_API_KEY)"

# Solution C: Restart dev server (not cached)
pnpm run dev

# Solution D: Check for typos
# Make sure key starts with: sk-ant-v1-
# Not: sk_ant_v1_ (underscore instead of dash)
```

---

### Issue 2: `401 Unauthorized from Anthropic API`

**Symptom:** "Invalid API key" error

**Causes & Solutions:**

```bash
# Solution A: Verify key in .env matches exactly
# Check for:
# - Leading/trailing spaces
# - Special characters (copy from console.anthropic.com, not email)
# - Correct format: sk-ant-v1-[base64 characters]

# Solution B: Regenerate key if in doubt
# Go to console.anthropic.com → API Keys → Delete old → Create new

# Solution C: Check key hasn't been revoked
# In console.anthropic.com, verify key is not showing as "Inactive"

# Solution D: Test key directly
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json"
```

---

### Issue 3: `Timeout or slow responses (>5 seconds)`

**Symptom:** AI features taking too long

**Causes & Solutions:**

```bash
# Solution A: Check network connectivity
ping api.anthropic.com

# Solution B: Increase timeout in .env
echo "ANTHROPIC_TIMEOUT=60000" >> .env  # 60 seconds
pnpm run dev

# Solution C: Monitor API rate limits
# Check Anthropic dashboard → Usage
# If hitting limits, upgrade billing plan

# Solution D: Check server logs
# Look for: "request to https://api.anthropic.com/v1/messages"
# If 429 (rate limit): reduce request frequency or upgrade plan
```

---

### Issue 4: `Document too large to process`

**Symptom:** "Content length exceeded" error

**Solution:**
```
Maximum input size: 200,000 tokens (~750,000 characters)
For documents larger than this:
1. Split into smaller chunks
2. Summarize chunks individually
3. Create meta-summary from chunk summaries
```

---

### Issue 5: `CORS or Network Errors (Frontend)`

**Symptom:** Browser console shows CORS error

**Solution:**
```typescript
// The API is called server-side via tRPC, not directly
// If still getting CORS error, check:

// 1. TRPC route exists in server/routers.ts
import { aiRouter } from "./routers/ai";
export const appRouter = router({
  // ... other routers
  ai: aiRouter,  // ← This must exist
});

// 2. Frontend calls via tRPC, not direct fetch
const { data } = trpc.ai.chat.useQuery({ message: "..." });
// NOT: fetch('/api/anthropic/...') ← Wrong
```

---

## API Cost Estimation

### Pricing Model
- **Input tokens:** $0.80 per million tokens
- **Output tokens:** $2.40 per million tokens
- **Typical requests:** 100-1500 tokens total per API call

### Cost Examples

| Feature | Input Size | Output Size | Est. Cost | Monthly (1000 calls) |
|---------|-----------|------------|-----------|----------------------|
| Document Summary | 2000 tokens | 500 tokens | $0.002 | $2.00 |
| Email Generation | 500 tokens | 300 tokens | $0.0006 | $0.60 |
| Chat (single turn) | 300 tokens | 200 tokens | $0.0004 | $0.40 |
| Financial Analysis | 1000 tokens | 800 tokens | $0.0018 | $1.80 |

**Estimated Monthly Cost:**
- Light usage (100 calls/month): $0.30 - $0.50
- Medium usage (500 calls/month): $1.50 - $2.50
- Heavy usage (2000 calls/month): $6.00 - $10.00

### Cost Optimization Tips
1. **Reuse summaries:** Cache results in database
2. **Batch requests:** Combine multiple documents
3. **Trim context:** Only send relevant information
4. **Monitor usage:** Set alerts in Anthropic dashboard

---

## Security Best Practices

### 1. API Key Management

#### ✅ DO:
```bash
# Store in environment variables
export ANTHROPIC_API_KEY="sk-ant-v1-..."

# Rotate keys quarterly
# Regenerate in console.anthropic.com and update .env

# Use different keys for dev/staging/prod
# ANTHROPIC_API_KEY_DEV=...
# ANTHROPIC_API_KEY_PROD=...
```

#### ❌ DON'T:
```bash
# Hardcode in source code
const apiKey = "sk-ant-v1-...";  // ❌ NEVER

# Commit .env to Git
git add .env  # ❌ NEVER

# Share key via email/Slack
"Here's the key: sk-ant-v1-..."  # ❌ NEVER

# Use in client-side code (frontend)
fetch(..., { headers: { 'x-api-key': API_KEY } })  // ❌ NEVER
```

---

### 2. Rate Limiting

```typescript
// Add rate limiting in server/routers/ai.ts
import rateLimit from 'express-rate-limit';

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 10,  // 10 requests per minute per IP
  message: 'Too many AI requests, please try again later'
});

// Apply to routes
app.use('/api/trpc/ai', aiLimiter);
```

---

### 3. Input Validation

```typescript
// Always validate and sanitize input
import { z } from 'zod';

const summarizeSchema = z.object({
  text: z.string().max(200000),  // Max 200k chars
  focus: z.enum(['key_points', 'action_items', 'financial', 'general'])
});

const input = summarizeSchema.parse(req.body);  // Throws on invalid
```

---

### 4. Audit Logging

```typescript
// Log all AI API calls for audit trail
import logger from './logger';

logger.info('ai_api_call', {
  feature: 'summarizeDocument',
  userId: user.id,
  inputLength: text.length,
  timestamp: new Date().toISOString(),
  // Don't log actual API key or sensitive data!
});
```

---

### 5. Credential Rotation

**Rotation Schedule:**
- Every 90 days (automatic reminder)
- Immediately if suspected compromise
- Before major deployments

**Steps:**
1. Generate new key in console.anthropic.com
2. Update .env (local) or cloud provider (production)
3. Restart application
4. Verify all features work with new key
5. Delete old key in console

---

## FAQ

### Q1: Can I use Claude API for free?
**A:** Anthropic offers a free tier with limited requests. For production use, you need paid billing enabled (~$0.0 01-0.01 per request).

### Q2: What's the difference between Haiku, Sonnet, and Opus?
**A:** 
- **Haiku:** Fastest, cheapest (recommended for CRM)
- **Sonnet:** Balanced speed and intelligence
- **Opus:** Most intelligent, slowest

We use Haiku for cost-effectiveness.

### Q3: Can I cache API responses?
**A:** Yes! Implement Redis caching in server/routers/ai.ts:
```typescript
const cacheKey = `ai:${feature}:${Math.hash(input)}`;
const cached = await redis.get(cacheKey);
if (cached) return cached;
const result = await callAnthropicAPI(...);
await redis.set(cacheKey, result, 3600);  // 1 hour TTL
return result;
```

### Q4: Is there a max file size?
**A:** Max 200,000 tokens (~750k chars). Larger docs need chunking.

### Q5: Can I use Claude in production?
**A:** Yes, Claude 3.5 Haiku is production-ready and used in many large applications.

### Q6: How do I monitor API usage?
**A:** 
1. Go to console.anthropic.com → Usage
2. Set monthly spend limit
3. Enable billing alerts
4. Monitor in-app logs

---

## Support & Resources

- **Anthropic Docs:** https://docs.anthropic.com
- **API Reference:** https://api.anthropic.com
- **Status Page:** https://status.anthropic.com
- **Support Email:** support@anthropic.com (for paid plans)

---

## Verification Checklist

- [ ] Anthropic account created and verified
- [ ] Billing enabled and payment method added
- [ ] API key generated and securely stored
- [ ] `.env` file created with `ANTHROPIC_API_KEY`
- [ ] Application started and env var loaded
- [ ] `checkAvailability` endpoint returns `true`
- [ ] Document summarization test successful
- [ ] Email generation test successful
- [ ] Financial analysis test successful
- [ ] Chat endpoint test successful
- [ ] Profile photo upload test successful
- [ ] Rate limiting configured
- [ ] Audit logging configured
- [ ] API cost monitoring enabled

---

**Last Updated:** February 20, 2026  
**Next Review:** May 20, 2026  
**Status:** Ready for Production
