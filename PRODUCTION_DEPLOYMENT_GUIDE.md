# Melitech CRM - Production Deployment Guide

## Overview

This guide provides step-by-step instructions to deploy Melitech CRM to **accounts.melitechsolutions.co.ke** with local username/password authentication (no Manus OAuth).

## Prerequisites

- **Server**: Ubuntu 20.04 LTS or later (VPS, dedicated server, or cloud instance)
- **Domain**: accounts.melitechsolutions.co.ke (DNS configured to point to server IP)
- **SSH Access**: Root or sudo privileges
- **Ports**: 80 (HTTP), 443 (HTTPS), 3000 (Node.js), 3306 (MySQL)

## Phase 1: Server Setup & Dependencies

### 1.1 Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Install Node.js (v22 LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verify: v22.x.x
npm --version   # Verify: 10.x.x
```

### 1.3 Install pnpm Package Manager

```bash
npm install -g pnpm
pnpm --version  # Verify: 10.x.x
```

### 1.4 Install MySQL Server

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Create database and user
sudo mysql -e "CREATE DATABASE melitech_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER 'melitech_user'@'localhost' IDENTIFIED BY 'Vzy1mvROm2A9bQZGvHjU';"
sudo mysql -e "GRANT ALL PRIVILEGES ON melitech_crm.* TO 'melitech_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Verify connection
mysql -h localhost -u melitech_user -pVzy1mvROm2A9bQZGvHjU melitech_crm -e "SELECT 1;"
```

### 1.5 Install Nginx (Reverse Proxy)

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 1.6 Install Certbot (SSL/TLS)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

## Phase 2: Application Setup

### 2.1 Clone/Download Project

```bash
cd /opt
sudo git clone <your-repo-url> melitech_crm
# OR download and extract your project
cd melitech_crm
```

### 2.2 Create Environment Configuration

```bash
# Create .env file with production settings
cat > .env << 'EOF'
# Application
VITE_APP_ID=melitech_crm_production
VITE_APP_TITLE=Melitech Solutions CRM
VITE_APP_LOGO=https://accounts.melitechsolutions.co.ke/logo.png

# Database (Production)
DATABASE_URL=mysql://melitech_user:Vzy1mvROm2A9bQZGvHjU@localhost:3306/melitech_crm

# Security
JWT_SECRET=$(openssl rand -base64 32)

# Server
NODE_ENV=production
PORT=3000

# Optional: Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@melitechsolutions.co.ke
SMTP_FROM_NAME=Melitech Solutions

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
EOF

# Secure the file
chmod 600 .env
```

### 2.3 Install Dependencies

```bash
cd /opt/melitech_crm
pnpm install
```

### 2.4 Run Database Migrations

```bash
pnpm db:push
```

This command will:
- Generate migration files from your Drizzle schema
- Apply migrations to the database
- Create all required tables with proper indexes

### 2.5 Build Application

```bash
pnpm build
```

This creates:
- `/dist/public` - Frontend static files
- `/dist/server` - Compiled server code (if applicable)

## Phase 3: Process Management with PM2

### 3.1 Install PM2 Globally

```bash
sudo npm install -g pm2
pm2 startup
sudo env PATH=$PATH:/usr/local/bin pm2 startup -u ubuntu --hp /home/ubuntu
```

### 3.2 Create PM2 Ecosystem File

```bash
cat > /opt/melitech_crm/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'melitech-crm',
      script: './server/_core/index.ts',
      interpreter: 'node',
      require: 'tsx',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      instances: 'max',
      exec_mode: 'cluster',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
EOF
```

### 3.3 Start Application with PM2

```bash
cd /opt/melitech_crm
pm2 start ecosystem.config.js --env production
pm2 save
pm2 logs melitech-crm  # View logs
```

Verify the app is running:
```bash
curl http://localhost:3000
```

## Phase 4: Nginx Configuration

### 4.1 Create Nginx Configuration

```bash
sudo tee /etc/nginx/sites-available/melitech-crm > /dev/null << 'EOF'
upstream melitech_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name accounts.melitechsolutions.co.ke;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name accounts.melitechsolutions.co.ke;

    # SSL Certificates (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/accounts.melitechsolutions.co.ke/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/accounts.melitechsolutions.co.ke/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/melitech-crm-access.log;
    error_log /var/log/nginx/melitech-crm-error.log;

    # Root directory for static files
    root /opt/melitech_crm/dist/public;

    # Proxy settings
    location / {
        # Try to serve static files first
        try_files $uri $uri/ @backend;
    }

    # API routes - proxy to Node.js backend
    location @backend {
        proxy_pass http://melitech_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Specific API routes
    location /api/ {
        proxy_pass http://melitech_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ /\.env {
        deny all;
    }
}
EOF
```

### 4.2 Enable Nginx Site

```bash
sudo ln -s /etc/nginx/sites-available/melitech-crm /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

## Phase 5: SSL/TLS Certificate Setup

### 5.1 Obtain SSL Certificate with Certbot

```bash
sudo certbot certonly --nginx -d accounts.melitechsolutions.co.ke

# Follow the prompts to verify domain ownership
# Certbot will automatically update Nginx configuration
```

### 5.2 Set Up Auto-Renewal

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

## Phase 6: Database Backup & Maintenance

### 6.1 Create Backup Script

```bash
cat > /opt/melitech_crm/backup-db.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/melitech_crm/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/melitech_crm_$TIMESTAMP.sql.gz"

mkdir -p $BACKUP_DIR

# Backup database
mysqldump -h localhost -u melitech_user -pVzy1mvROm2A9bQZGvHjU melitech_crm | gzip > $BACKUP_FILE

# Keep only last 30 days of backups
find $BACKUP_DIR -name "melitech_crm_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
EOF

chmod +x /opt/melitech_crm/backup-db.sh
```

### 6.2 Schedule Daily Backups with Cron

```bash
# Add to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/melitech_crm/backup-db.sh") | crontab -
```

## Phase 7: Testing & Verification

### 7.1 Test Application Access

```bash
# From your local machine
curl -k https://accounts.melitechsolutions.co.ke/
# Should return HTML of login page
```

### 7.2 Test Authentication Flow

1. **Open browser**: https://accounts.melitechsolutions.co.ke
2. **Click "Sign in to Continue"** → Should redirect to /login
3. **Test Signup**:
   - Email: test@example.com
   - Password: TestPassword123
   - Name: Test User
   - Click "Create Account"
4. **Test Login**:
   - Email: test@example.com
   - Password: TestPassword123
   - Should see dashboard
5. **Test Logout**:
   - Click logout button
   - Should redirect to login page

### 7.3 Verify Database

```bash
mysql -h localhost -u melitech_user -pVzy1mvROm2A9bQZGvHjU melitech_crm -e "SELECT id, email, name FROM users LIMIT 5;"
```

### 7.4 Check Application Logs

```bash
pm2 logs melitech-crm
```

## Phase 8: Monitoring & Maintenance

### 8.1 Monitor Application Health

```bash
# Check PM2 status
pm2 status

# Monitor in real-time
pm2 monit
```

### 8.2 Monitor Server Resources

```bash
# Install htop for system monitoring
sudo apt install -y htop
htop

# Check disk space
df -h

# Check memory usage
free -h
```

### 8.3 View Application Logs

```bash
# Real-time logs
pm2 logs melitech-crm

# Specific log files
tail -f /opt/melitech_crm/logs/error.log
tail -f /opt/melitech_crm/logs/out.log
```

## Phase 9: Troubleshooting

### Issue: Application won't start

```bash
# Check PM2 logs
pm2 logs melitech-crm

# Check Node.js version
node --version

# Verify database connection
mysql -h localhost -u melitech_user -pVzy1mvROm2A9bQZGvHjU melitech_crm -e "SELECT 1;"

# Restart application
pm2 restart melitech-crm
```

### Issue: Database connection error

```bash
# Verify MySQL is running
sudo systemctl status mysql

# Check database exists
mysql -h localhost -u melitech_user -pVzy1mvROm2A9bQZGvHjU -e "SHOW DATABASES;"

# Verify user permissions
mysql -h localhost -u melitech_user -pVzy1mvROm2A9bQZGvHjU melitech_crm -e "SELECT 1;"
```

### Issue: SSL certificate not working

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew --force-renewal

# Check Nginx configuration
sudo nginx -t
```

### Issue: 502 Bad Gateway from Nginx

```bash
# Verify Node.js app is running
curl http://localhost:3000

# Check Nginx error logs
sudo tail -f /var/log/nginx/melitech-crm-error.log

# Restart Nginx
sudo systemctl restart nginx
```

## Phase 10: Production Checklist

Before going live, verify:

- [ ] Domain DNS points to server IP
- [ ] SSL certificate installed and auto-renewing
- [ ] Database created and migrations applied
- [ ] Application running via PM2
- [ ] Nginx reverse proxy configured
- [ ] Firewall allows ports 80, 443
- [ ] Backup script scheduled
- [ ] Application accessible via HTTPS
- [ ] Login/signup flow works
- [ ] Database backups working
- [ ] Logs being collected
- [ ] Email configuration set (if using password reset)

## Security Best Practices

### 10.1 Firewall Configuration

```bash
sudo ufw enable
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw status
```

### 10.2 Fail2Ban (Brute Force Protection)

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 10.3 Regular Updates

```bash
# Enable automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Deployment Commands Summary

```bash
# Complete deployment from scratch
cd /opt/melitech_crm

# 1. Install dependencies
pnpm install

# 2. Run migrations
pnpm db:push

# 3. Build application
pnpm build

# 4. Start with PM2
pm2 start ecosystem.config.js --env production

# 5. Save PM2 configuration
pm2 save

# 6. Verify
curl https://accounts.melitechsolutions.co.ke
```

## Support & Troubleshooting

For issues or questions:
1. Check application logs: `pm2 logs melitech-crm`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/melitech-crm-error.log`
3. Verify database: `mysql -h localhost -u melitech_user -p melitech_crm -e "SELECT 1;"`
4. Check PM2 status: `pm2 status`

## Next Steps

After successful deployment:
1. **Configure Email** for password reset functionality
2. **Set up monitoring** (Datadog, New Relic, or similar)
3. **Configure backups** to remote storage (AWS S3, Google Cloud, etc.)
4. **Set up CI/CD** for automated deployments
5. **Create admin account** for your team
6. **Configure custom domain** email (if needed)

---

**Deployment Date**: [Your Date]
**Version**: 1.0.0
**Last Updated**: November 2025
