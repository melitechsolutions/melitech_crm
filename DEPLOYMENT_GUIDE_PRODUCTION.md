# Melitech CRM - Comprehensive Deployment Guide

**Version:** 3.0  
**Date:** January 2024  
**Status:** Production Ready

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Migration & Setup](#database-migration--setup)
4. [Application Build & Deployment](#application-build--deployment)
5. [Docker Containerization](#docker-containerization)
6. [Cloud Deployment (AWS, Azure, GCP)](#cloud-deployment-aws-azure-gcp)
7. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
8. [Monitoring & Logging](#monitoring--logging)
9. [Post-Deployment Validation](#post-deployment-validation)
10. [Rollback Procedures](#rollback-procedures)
11. [Performance Tuning](#performance-tuning)
12. [Security Hardening](#security-hardening)

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] Build succeeds without errors (`npm run build`)
- [ ] TypeScript compilation successful (no `any` types unless justified)
- [ ] Code reviews completed
- [ ] No console.log statements in production code
- [ ] No hardcoded credentials or secrets

### Documentation
- [ ] API documentation updated
- [ ] Database schema documented
- [ ] Environment variables documented
- [ ] Runbook created for common operations
- [ ] Team trained on deployment process

### Security
- [ ] HTTPS certificates valid
- [ ] API keys rotated
- [ ] Database backups tested
- [ ] CORS configuration verified
- [ ] Rate limiting configured
- [ ] SQL injection protections verified

### Infrastructure
- [ ] Server capacity sufficient
- [ ] Database backups scheduled
- [ ] Logging configured
- [ ] Monitoring alerts set up
- [ ] CDN configured (if applicable)
- [ ] Load balancer health checks working

---

## Environment Setup

### 1. Production Environment Variables

Create `.env.production` file:

```bash
# Application
NODE_ENV=production
APP_NAME=melitech-crm
APP_VERSION=3.0.0
LOG_LEVEL=info

# Server
PORT=3000
HOST=0.0.0.0
API_URL=https://api.melitech.com
FRONTEND_URL=https://melitech.com

# Database
DB_HOST=prod-mysql.example.com
DB_PORT=3306
DB_NAME=melitech_crm_prod
DB_USER=crm_user
DB_PASSWORD=${DB_PASSWORD}  # Use vault/secrets manager
DB_POOL_SIZE=20
DB_POOL_IDLE_TIMEOUT=30000

# Redis (optional, for caching)
REDIS_URL=redis://prod-redis.example.com:6379/0
REDIS_PASSWORD=${REDIS_PASSWORD}

# Email Services
RESEND_API_KEY=${RESEND_API_KEY}
SENDGRID_API_KEY=${SENDGRID_API_KEY}

# SMS Services
TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
TWILIO_FROM_NUMBER=${TWILIO_FROM_NUMBER}
AFRICAS_TALKING_API_KEY=${AFRICAS_TALKING_API_KEY}

# Slack
SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}

# Auth
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRY=7d
REFRESH_TOKEN_SECRET=${REFRESH_TOKEN_SECRET}

# Feature Flags
ENABLE_NOTIFICATIONS=true
ENABLE_AUTOMATION=true
ENABLE_REPORTS=true
ENABLE_PROJECT_MANAGEMENT=true

# Monitoring
SENTRY_DSN=${SENTRY_DSN}
DATADOG_API_KEY=${DATADOG_API_KEY}
NEWRELIC_LICENSE_KEY=${NEWRELIC_LICENSE_KEY}

# File Storage
AWS_S3_BUCKET=melitech-prod-files
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
```

### 2. Secrets Management

Use a secrets vault:

**AWS Secrets Manager:**
```bash
aws secretsmanager create-secret \
  --name melitech/prod/db-password \
  --secret-string '{"password":"your-secure-password"}'
```

**HashiCorp Vault:**
```bash
vault kv put secret/melitech/prod \
  db_password=xxxxx \
  jwt_secret=xxxxx \
  api_keys=xxxxx
```

---

## Database Migration & Setup

### 1. Complete Database Schema Setup

```bash
# Connect to production database
mysql -h prod-mysql.example.com -u crm_user -p melitech_crm_prod

# Run all migration scripts in order
source create_accounts_table.sql;
source create_clients_table.sql;
source create_invoices_table.sql;
source create_expenses_table.sql;
source create_projects_table.sql;
source create_notifications_table.sql;
source create_automation_rules_table.sql;
source create_reports_table.sql;

# Verify tables created
SHOW TABLES;
```

### 2. Database Optimization

```sql
-- Create indexes for performance
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_clients_created_date ON clients(created_at);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_automation_rules_status ON automation_rules(is_active);

-- Enable query cache (if using MySQL 5.7)
SET GLOBAL query_cache_type = ON;
SET GLOBAL query_cache_size = 268435456; -- 256MB

-- Optimize table statistics
ANALYZE TABLE invoices;
ANALYZE TABLE clients;
ANALYZE TABLE projects;
```

### 3. Database User Permissions

```sql
-- Create application user with limited permissions
CREATE USER 'crm_user'@'%' IDENTIFIED BY 'strong_password';

-- Grant specific permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON melitech_crm_prod.* TO 'crm_user'@'%';

-- Revoke dangerous permissions
REVOKE CREATE, ALTER, DROP, GRANT OPTION ON melitech_crm_prod.* FROM 'crm_user'@'%';

-- For read-only replica
CREATE USER 'crm_read_only'@'%' IDENTIFIED BY 'password';
GRANT SELECT ON melitech_crm_prod.* TO 'crm_read_only'@'%';

FLUSH PRIVILEGES;
```

### 4. Backup Strategy

```bash
# Daily backup script (cron: 2:00 AM)
#!/bin/bash
DATE=$(date +\%Y\%m\%d)
BACKUP_DIR="/backups/mysql"
DB_NAME="melitech_crm_prod"

mysqldump \
  -h prod-mysql.example.com \
  -u crm_user \
  -p${DB_PASSWORD} \
  --single-transaction \
  --routines \
  --triggers \
  ${DB_NAME} | \
  gzip > ${BACKUP_DIR}/melitech_${DATE}.sql.gz

# Keep last 30 days of backups
find ${BACKUP_DIR} -name "melitech_*.sql.gz" -mtime +30 -delete

# Upload to S3
aws s3 cp \
  ${BACKUP_DIR}/melitech_${DATE}.sql.gz \
  s3://melitech-backups/mysql/
```

---

## Application Build & Deployment

### 1. Build Process

```bash
# Install dependencies
npm ci --legacy-peer-deps  # Use ci, not install, for production

# Build application
npm run build

# Verify build succeeded
if [ ! -d "dist" ]; then
  echo "Build failed"
  exit 1
fi

# Run tests before deployment
npm run test:ci

# Generate coverage report
npm run test:coverage
```

### 2. Deployment via SSH

```bash
#!/bin/bash
# deploy.sh

set -e

# Configuration
REMOTE_USER="deploy"
REMOTE_HOST="prod-server.example.com"
DEPLOY_DIR="/var/www/melitech-crm"
APP_PORT=3000

# Build locally
npm ci
npm run build

# Create deployment package
tar -czf melitech-crm.tar.gz dist package.json package-lock.json

# Upload to server
scp melitech-crm.tar.gz ${REMOTE_USER}@${REMOTE_HOST}:${DEPLOY_DIR}/

# Extract and restart
ssh ${REMOTE_USER}@${REMOTE_HOST} << 'REMOTE_COMMANDS'
  cd /var/www/melitech-crm
  
  # Backup current version
  if [ -d "dist-old" ]; then
    rm -rf dist-old
  fi
  if [ -d "dist" ]; then
    mv dist dist-old
  fi
  
  # Extract new version
  tar -xzf melitech-crm.tar.gz
  
  # Install production dependencies
  npm ci --production
  
  # Run migrations/setup
  npm run migrate:latest
  
  # Restart service
  sudo systemctl restart melitech-crm
  
  # Verify service is running
  sleep 5
  if ! curl -f http://localhost:${APP_PORT}/health; then
    echo "Health check failed, rolling back..."
    rm -rf dist
    mv dist-old dist
    npm ci --production
    sudo systemctl restart melitech-crm
    exit 1
  fi
  
  # Cleanup old backup
  rm -f melitech-crm.tar.gz
REMOTE_COMMANDS

echo "Deployment successful!"
```

### 3. Systemd Service Configuration

Create `/etc/systemd/system/melitech-crm.service`:

```ini
[Unit]
Description=Melitech CRM Application
After=network.target mysql.service redis.service
Wants=mysql.service redis.service

[Service]
Type=simple
User=melitech
WorkingDirectory=/var/www/melitech-crm
EnvironmentFile=/var/www/melitech-crm/.env.production

# Process management
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

# Resource limits
MemoryLimit=512M
CPUQuota=80%
LimitNOFILE=65535

# Hardening
NoNewPrivileges=true
HardReadOnlyPaths=/
ReadWritePaths=/var/www/melitech-crm /var/log/melitech-crm

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable melitech-crm
sudo systemctl start melitech-crm
sudo systemctl status melitech-crm
```

---

## Docker Containerization

### 1. Dockerfile (Multi-stage build)

```dockerfile
# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Build application
COPY . .
RUN npm run build
RUN npm run test:ci

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Install security updates
RUN apk update && \
    apk add --no-cache \
    dumb-init \
    curl && \
    rm -rf /var/cache/apk/*

# Create app user (non-root)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Metadata
LABEL maintainer="Melitech Team"
LABEL version="3.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

### 2. Docker Compose (Local Development/Staging)

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DB_HOST: mysql
      REDIS_URL: redis://redis:6379/0
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - melitech
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: melitech_crm_prod
      MYSQL_USER: crm_user
      MYSQL_PASSWORD: crm_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - melitech

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - melitech

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - melitech

networks:
  melitech:
    driver: bridge

volumes:
  mysql_data:
  redis_data:
```

### 3. Build and Push to Registry

```bash
# Build image
docker build -t melitech-crm:3.0.0 .

# Test locally
docker run -d \
  --name melitech-test \
  -e NODE_ENV=production \
  -p 3000:3000 \
  melitech-crm:3.0.0

# Tag for registry
docker tag melitech-crm:3.0.0 \
  registry.example.com/melitech-crm:3.0.0

# Push to registry
docker push registry.example.com/melitech-crm:3.0.0

# Cleanup
docker rm melitech-test
```

---

## Cloud Deployment (AWS, Azure, GCP)

### AWS Deployment (ECS + RDS + CloudFront)

```bash
# 1. Create RDS MySQL instance
aws rds create-db-instance \
  --db-instance-identifier melitech-mysql \
  --db-instance-class db.t3.medium \
  --engine mysql \
  --master-username crm_user \
  --master-user-password "${DB_PASSWORD}" \
  --allocated-storage 100 \
  --storage-type gp3 \
  --backup-retention-period 30 \
  --multi-az \
  --publicly-accessible false

# 2. Create ECS cluster
aws ecs create-cluster --cluster-name melitech-prod

# 3. Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# 4. Create service
aws ecs create-service \
  --cluster melitech-prod \
  --service-name melitech-crm \
  --task-definition melitech-crm:1 \
  --desired-count 3 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[subnet-xxx,subnet-yyy],
    securityGroups=[sg-xxx],
    assignPublicIp=DISABLED
  }"

# 5. Setup ALB
aws elbv2 create-load-balancer \
  --name melitech-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx

# 6. Create target group
aws elbv2 create-target-group \
  --name melitech-targets \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxx

# 7. Setup CloudFront CDN
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

**task-definition.json:**
```json
{
  "family": "melitech-crm",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "melitech-crm",
      "image": "registry.example.com/melitech-crm:3.0.0",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "DB_HOST",
          "value": "melitech-mysql.xxx.rds.amazonaws.com"
        }
      ],
      "secrets": [
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:..."
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/melitech-crm",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
      }
    }
  ]
}
```

### Azure Deployment (App Service + Azure Database for MySQL)

```bash
# Create resource group
az group create \
  --name melitech-prod \
  --location eastus

# Create MySQL database
az mysql server create \
  --resource-group melitech-prod \
  --name melitech-mysql \
  --location eastus \
  --admin-user crm_user \
  --admin-password "${DB_PASSWORD}" \
  --sku-name B_Gen5_1

# Create App Service plan
az appservice plan create \
  --name melitech-plan \
  --resource-group melitech-prod \
  --sku P1V2 \
  --is-linux

# Create web app
az webapp create \
  --resource-group melitech-prod \
  --plan melitech-plan \
  --name melitech-crm \
  --deployment-container-image-name-user "username" \
  --deployment-container-image-name "registry.example.com/melitech-crm:3.0.0"

# Configure app settings
az webapp config appsettings set \
  --resource-group melitech-prod \
  --name melitech-crm \
  --settings \
    NODE_ENV=production \
    DB_HOST=melitech-mysql.mysql.database.azure.com \
    WEBSITES_PORT=3000
```

### GCP Deployment (Cloud Run + Cloud SQL)

```bash
# Create Cloud SQL MySQL instance
gcloud sql instances create melitech-mysql \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create melitech_crm_prod \
  --instance=melitech-mysql

# Deploy to Cloud Run
gcloud run deploy melitech-crm \
  --image=gcr.io/project-id/melitech-crm:3.0.0 \
  --platform=managed \
  --region=us-central1 \
  --memory=512Mi \
  --cpu=1 \
  --timeout=60 \
  --set-env-vars="NODE_ENV=production,DB_HOST=cloudsql" \
  --add-cloudsql-instances=project:us-central1:melitech-mysql
```

---

## CI/CD Pipeline Setup

See [GITHUB_ACTIONS_CICD.md](GITHUB_ACTIONS_CICD.md) for complete GitHub Actions setup.

Quick start:
```bash
# Copy CI/CD workflow
cp .github/workflows/ci-cd.yml .github/workflows/

# Push to repository
git add .github/
git commit -m "Add GitHub Actions CI/CD pipeline"
git push origin main
```

---

## Monitoring & Logging

### 1. Application Logging

```typescript
// src/services/logger.ts
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "melitech-crm" },
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;
```

### 2. Error Tracking (Sentry)

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ request: true }),
  ],
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### 3. Performance Monitoring (New Relic / Datadog)

```bash
# New Relic agent setup
npm install newrelic --save

# Create newrelic.js configuration
newrelic-admin generate-config ${NEWRELIC_LICENSE_KEY} newrelic.js

# Start application with agent
node -r newrelic dist/index.js
```

### 4. Metrics Collection (Prometheus)

```typescript
import promClient from "prom-client";

// Default metrics
promClient.collectDefaultMetrics();

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "statusCode"],
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

---

## Post-Deployment Validation

### 1. Health Checks

```bash
#!/bin/bash
# health-check.sh

set -e

HEALTH_URL="https://api.melitech.com/health"
MAX_RETRIES=5
RETRY_INTERVAL=10

echo "Running post-deployment health checks..."

for i in $(seq 1 $MAX_RETRIES); do
  echo "Attempt $i/$MAX_RETRIES..."
  
  RESPONSE=$(curl -s -w "\n%{http_code}" $HEALTH_URL)
  HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
  BODY=$(echo "$RESPONSE" | head -n -1)
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Health check passed"
    echo "Response: $BODY"
    exit 0
  fi
  
  if [ $i -lt $MAX_RETRIES ]; then
    echo "✗ Health check failed (HTTP $HTTP_CODE)"
    sleep $RETRY_INTERVAL
  fi
done

echo "✗ Health check failed after $MAX_RETRIES attempts"
exit 1
```

### 2. Smoke Tests

```bash
#!/bin/bash
# smoke-tests.sh

echo "Running smoke tests..."

# Test API endpoint
curl -f https://api.melitech.com/api/health || exit 1
echo "✓ API health check passed"

# Test database connection
curl -f https://api.melitech.com/api/test/db || exit 1
echo "✓ Database connection verified"

# Test authentication
TOKEN=$(curl -s -X POST https://api.melitech.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}' \
  | jq -r '.token')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
  echo "✓ Authentication working"
else
  echo "✗ Authentication failed"
  exit 1
fi

echo "✓ All smoke tests passed!"
```

### 3. Database Validation

```sql
-- Verify all tables exist
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = 'melitech_crm_prod';

-- Check table row counts
SELECT 
  TABLE_NAME,
  TABLE_ROWS
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'melitech_crm_prod'
ORDER BY TABLE_NAME;

-- Verify indexes
SELECT * FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'melitech_crm_prod';
```

---

## Rollback Procedures

### 1. Rollback via Systemd

```bash
#!/bin/bash
# rollback.sh

set -e

DEPLOY_DIR="/var/www/melitech-crm"
BACKUP_DIR="${DEPLOY_DIR}/dist-old"

echo "Rolling back to previous version..."

if [ ! -d "$BACKUP_DIR" ]; then
  echo "ERROR: No backup version found"
  exit 1
fi

# Stop service
sudo systemctl stop melitech-crm

# Restore previous version
rm -rf ${DEPLOY_DIR}/dist
mv ${BACKUP_DIR} ${DEPLOY_DIR}/dist

# Restart service
sudo systemctl start melitech-crm

# Verify
sleep 5
curl -f http://localhost:3000/health || {
  echo "Rollback verification failed"
  exit 1
}

echo "✓ Rollback successful"
```

### 2. Database Rollback

```bash
#!/bin/bash
# rollback-database.sh

set -e

DB_NAME="melitech_crm_prod"
BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
  # Find latest backup
  BACKUP_FILE=$(ls -t /backups/mysql/melitech_*.sql.gz | head -1)
fi

echo "Rolling back database from: $BACKUP_FILE"
echo "WARNING: This will restore the database to the backup timestamp!"
read -p "Continue? (y/n) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  exit 1
fi

# Backup current state before restore
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p ${DB_NAME} | gzip > /backups/mysql/pre-restore_${DATE}.sql.gz

# Restore from backup
gunzip < ${BACKUP_FILE} | mysql -u root -p ${DB_NAME}

echo "✓ Database restored successfully"
```

### 3. Docker Container Rollback

```bash
#!/bin/bash
# rollback-docker.sh

REGISTRY="registry.example.com"
IMAGE_NAME="melitech-crm"
CURRENT_TAG="3.0.0"
PREVIOUS_TAG="2.9.9"

echo "Rolling back from $CURRENT_TAG to $PREVIOUS_TAG..."

# Pull previous image
docker pull ${REGISTRY}/${IMAGE_NAME}:${PREVIOUS_TAG}

# Stop current container
docker-compose down

# Update docker-compose.yml
sed -i "s/:${CURRENT_TAG}/:${PREVIOUS_TAG}/g" docker-compose.yml

# Start with previous version
docker-compose up -d

# Verify
sleep 10
docker-compose ps

echo "✓ Rollback to $PREVIOUS_TAG complete"
```

---

## Performance Tuning

### 1. Database Query Optimization

```sql
-- Identify slow queries
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Analyze query execution plans
EXPLAIN SELECT * FROM invoices 
WHERE client_id = 1 AND status = 'pending'
ORDER BY invoice_date DESC;

-- Monitor InnoDB status
SHOW ENGINE INNODB STATUS;

-- Check connection pool
SHOW PROCESSLIST;
```

### 2. Application Caching

```typescript
// Redis caching example
import { createClient } from "redis";

const redis = createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

export const getCachedInvoices = async (clientId: string) => {
  const cacheKey = `invoices:${clientId}`;
  
  // Try cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from DB
  const invoices = await invoicesTable
    .select()
    .where(eq(invoicesTable.clientId, clientId));
  
  // Store in cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(invoices));
  
  return invoices;
};
```

### 3. Node.js Optimization

```bash
# Enable clustering for multi-core
PM2_INSTANCES=max pm2 start dist/index.js

# Increase heap size
NODE_OPTIONS="--max-old-space-size=4096" node dist/index.js

# Enable compression
GZIP=true node dist/index.js
```

---

## Security Hardening

### 1. HTTPS/TLS Configuration

```nginx
server {
  listen 443 ssl http2;
  server_name api.melitech.com;

  ssl_certificate /etc/ssl/certs/melitech.crt;
  ssl_certificate_key /etc/ssl/private/melitech.key;
  
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;
  ssl_session_cache shared:SSL:10m;
  ssl_session_timeout 10m;

  # HSTS
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}

# Redirect HTTP to HTTPS
server {
  listen 80;
  server_name api.melitech.com;
  return 301 https://$server_name$request_uri;
}
```

### 2. Rate Limiting

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

app.post("/auth/login", authLimiter, async (req, res) => {
  // Login logic
});
```

### 3. CORS Configuration

```typescript
import cors from "cors";

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
}));
```

### 4. Environment Security

```bash
# Use .env.production template, never commit actual values
cat > .env.production << 'EOF'
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET}
API_KEYS=${API_KEYS}
AWS_SECRET=${AWS_SECRET}
EOF

# Restrict file permissions
chmod 600 .env.production
chmod 700 ~/.ssh/production_key

# Verify no secrets in git history
git log --all --source -S "password" -- *.js *.ts
```

---

## Troubleshooting

### Application won't start
```bash
# Check logs
journalctl -u melitech-crm -n 100

# Verify environment
env | grep DB_
env | grep NODE_

# Check port availability
netstat -tlnp | grep 3000
```

### Database connection issues
```bash
# Test connection
mysql -h ${DB_HOST} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} -e "SELECT 1;"

# Check MySQL logs
tail -f /var/log/mysql/error.log
```

### Memory leaks
```bash
# Generate heap dump
kill -USR2 $(pidof node)

# Analyze with Chrome DevTools
```

---

## Support & Escalation

- **Production Issues:** Page on-call engineer
- **Database Issues:** Database team
- **Infrastructure Issues:** DevOps team
- **Escalation:** Contact engineering manager

**Runbook:** https://wiki.example.com/melitech-runbook  
**Status Page:** https://status.melitech.com  
**Contact:** devops@melitech.com

---

**Last Updated:** January 2024  
**Next Review:** April 2024
