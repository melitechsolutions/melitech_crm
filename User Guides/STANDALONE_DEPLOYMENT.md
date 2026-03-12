# Melitech CRM - Standalone Deployment to accounts.melitechsolutions.co.ke

This guide provides step-by-step instructions for deploying Melitech CRM to your custom domain with local authentication.

## Pre-Deployment Checklist

- [ ] Domain registered and DNS configured
- [ ] SSL/TLS certificate obtained (Let's Encrypt recommended)
- [ ] Server provisioned (VPS, dedicated server, or cloud instance)
- [ ] MySQL/TiDB database server ready
- [ ] Node.js 18+ installed on server
- [ ] pnpm package manager installed
- [ ] Git installed for repository access

## Deployment Steps

### Step 1: Server Setup

Connect to your server:

```bash
ssh user@accounts.melitechsolutions.co.ke
```

Update system packages:

```bash
sudo apt update && sudo apt upgrade -y
```

Install Node.js (if not already installed):

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

Install pnpm:

```bash
npm install -g pnpm
```

### Step 2: Database Setup

Create MySQL database and user:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE melitech_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'melitech'@'localhost' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON melitech_crm.* TO 'melitech'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Application Setup

Clone the repository:

```bash
cd /var/www
sudo git clone <your-repository-url> melitech-crm
cd melitech-crm
sudo chown -R $USER:$USER .
```

Create environment file:

```bash
cp .env.standalone.example .env
```

Edit `.env` with production values:

```bash
nano .env
```

```env
DATABASE_URL="mysql://melitech:your-secure-password@localhost:3306/melitech_crm"
JWT_SECRET="$(openssl rand -base64 32)"
VITE_APP_TITLE="Melitech Solutions CRM"
VITE_APP_LOGO="https://accounts.melitechsolutions.co.ke/logo.png"
VITE_APP_ID="melitech-crm-production"
PORT=3000
NODE_ENV="production"
```

Install dependencies:

```bash
pnpm install --frozen-lockfile
```

Run database migrations:

```bash
pnpm db:push
```

Build the application:

```bash
pnpm build
```

### Step 4: Process Manager Setup (PM2)

Install PM2 globally:

```bash
sudo npm install -g pm2
```

Create PM2 ecosystem file:

```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'melitech-crm',
    script: 'pnpm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF
```

Start the application:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 5: Nginx Reverse Proxy

Install Nginx:

```bash
sudo apt install -y nginx
```

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/melitech-crm
```

```nginx
upstream melitech_crm {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name accounts.melitechsolutions.co.ke;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name accounts.melitechsolutions.co.ke;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/accounts.melitechsolutions.co.ke/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/accounts.melitechsolutions.co.ke/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Logging
    access_log /var/log/nginx/melitech-crm-access.log;
    error_log /var/log/nginx/melitech-crm-error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;

    # Root location
    root /var/www/melitech-crm/client/dist;
    index index.html;

    # API proxy
    location /api {
        proxy_pass http://melitech_crm;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # Static files with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/melitech-crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: SSL Certificate Setup

Install Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Obtain SSL certificate:

```bash
sudo certbot certonly --nginx -d accounts.melitechsolutions.co.ke
```

Set up auto-renewal:

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Step 7: Firewall Configuration

Configure UFW firewall:

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Step 8: Monitoring & Logging

Create log directory:

```bash
mkdir -p /var/www/melitech-crm/logs
```

View application logs:

```bash
pm2 logs melitech-crm
```

Monitor system resources:

```bash
pm2 monit
```

## Post-Deployment Verification

### 1. Test Application

Open browser and navigate to:

```
https://accounts.melitechsolutions.co.ke
```

### 2. Test Authentication

- [ ] Sign up with new account
- [ ] Log in with credentials
- [ ] Verify session persistence
- [ ] Test logout functionality

### 3. Test API Endpoints

```bash
# Health check
curl https://accounts.melitechsolutions.co.ke/api/health

# Test login
curl -X POST https://accounts.melitechsolutions.co.ke/api/trpc/auth.login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 4. Database Verification

```bash
mysql -u melitech -p melitech_crm -e "SELECT COUNT(*) FROM users;"
```

## Maintenance & Updates

### Regular Backups

Create backup script:

```bash
cat > /var/www/melitech-crm/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/melitech-crm"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u melitech -p$DB_PASSWORD melitech_crm | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Application backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/melitech-crm --exclude=node_modules --exclude=.git

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /var/www/melitech-crm/backup.sh
```

Schedule daily backups:

```bash
sudo crontab -e
```

Add:

```
0 2 * * * /var/www/melitech-crm/backup.sh >> /var/log/melitech-backup.log 2>&1
```

### Application Updates

```bash
cd /var/www/melitech-crm
git pull origin main
pnpm install
pnpm build
pm2 restart melitech-crm
```

### Security Updates

```bash
# Check for vulnerabilities
pnpm audit

# Update dependencies
pnpm update
pnpm audit fix
```

## Troubleshooting

### Application won't start

```bash
# Check PM2 status
pm2 status

# View detailed logs
pm2 logs melitech-crm --err

# Restart application
pm2 restart melitech-crm
```

### Database connection error

```bash
# Test database connection
mysql -u melitech -p -h localhost melitech_crm -e "SELECT 1;"

# Check DATABASE_URL in .env
cat /var/www/melitech-crm/.env | grep DATABASE_URL
```

### SSL certificate issues

```bash
# Renew certificate
sudo certbot renew --dry-run

# Check certificate expiration
sudo certbot certificates
```

### High memory usage

```bash
# Check process memory
ps aux | grep node

# Restart with memory limit
pm2 restart melitech-crm --max-memory-restart 1G
```

## Performance Optimization

### Database Optimization

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_client_name ON clients(name);
CREATE INDEX idx_invoice_date ON invoices(createdAt);

-- Optimize tables
OPTIMIZE TABLE users, clients, invoices, estimates;
```

### Application Optimization

```bash
# Enable compression in Nginx (already configured above)
# Monitor performance
pm2 monit

# Check response times
curl -w "@curl-format.txt" https://accounts.melitechsolutions.co.ke
```

## Support & Escalation

For deployment issues:

1. Check application logs: `pm2 logs melitech-crm`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/melitech-crm-error.log`
3. Check system resources: `htop`
4. Verify database connectivity: `mysql -u melitech -p melitech_crm`

---

**Deployment Date**: [Your Date]  
**Domain**: accounts.melitechsolutions.co.ke  
**Status**: Production Ready
