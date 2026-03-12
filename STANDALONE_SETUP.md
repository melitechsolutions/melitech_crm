# Melitech CRM - Standalone Deployment Guide

This guide explains how to deploy Melitech CRM as a completely independent application with local username/password authentication, without any Manus dependencies.

## Overview

The standalone deployment includes:

- **Local Authentication**: Username/password login system with JWT tokens
- **Self-Contained Backend**: Express.js server with tRPC API
- **Database**: MySQL/TiDB for data persistence
- **Frontend**: React SPA with Vite
- **No External Dependencies**: Completely independent from Manus platform

## Prerequisites

- Node.js 18+ and pnpm
- MySQL 8.0+ or TiDB
- Git (for version control)

## Setup Instructions

### 1. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.standalone.example .env
```

Edit `.env` with your settings:

```env
# Database connection
DATABASE_URL="mysql://user:password@localhost:3306/melitech_crm"

# JWT secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-generated-secret-key"

# Application settings
VITE_APP_TITLE="Melitech Solutions CRM"
VITE_APP_LOGO="https://your-domain.com/logo.png"
VITE_APP_ID="melitech-crm"

# Server port
PORT=3000
NODE_ENV="production"
```

### 2. Database Setup

Create the database and run migrations:

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE melitech_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations
pnpm db:push
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Build for Production

```bash
pnpm build
```

### 5. Start the Server

```bash
# Development mode
pnpm dev

# Production mode
NODE_ENV=production pnpm start
```

The application will be available at `http://localhost:3000`

## Authentication System

### User Registration

New users can sign up at `/signup`:

1. Enter full name, email, and password (minimum 8 characters)
2. Confirm password
3. Account is created and user is automatically logged in

### User Login

Users log in at `/login`:

1. Enter email and password
2. JWT token is generated and stored in secure HTTP-only cookie
3. User is authenticated for subsequent requests

### Password Management

- **Change Password**: Users can change their password in account settings
- **Reset Password**: Forgot password flow (email integration required for production)

## Deployment Options

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

Build and run:

```bash
docker build -t melitech-crm .
docker run -p 3000:3000 --env-file .env melitech-crm
```

### Cloud Deployment (AWS, Google Cloud, Azure)

1. **Prepare the application**:
   ```bash
   pnpm build
   ```

2. **Set environment variables** in your cloud platform's configuration

3. **Database**: Use managed database services (AWS RDS, Google Cloud SQL, etc.)

4. **Deploy**:
   - AWS: Use Elastic Beanstalk or App Runner
   - Google Cloud: Use Cloud Run or App Engine
   - Azure: Use App Service

### Traditional Server Deployment

1. **SSH into your server**:
   ```bash
   ssh user@your-server.com
   ```

2. **Clone the repository**:
   ```bash
   git clone <your-repo> melitech-crm
   cd melitech-crm
   ```

3. **Install and build**:
   ```bash
   pnpm install
   pnpm build
   ```

4. **Use a process manager** (PM2):
   ```bash
   npm install -g pm2
   pm2 start "pnpm start" --name melitech-crm
   pm2 save
   ```

5. **Set up Nginx reverse proxy**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Security Considerations

### Production Checklist

- [ ] Generate strong JWT_SECRET: `openssl rand -base64 32`
- [ ] Use HTTPS/TLS for all connections
- [ ] Enable database authentication with strong credentials
- [ ] Set `NODE_ENV=production`
- [ ] Use environment variables for all sensitive data
- [ ] Never commit `.env` file to version control
- [ ] Enable CORS only for trusted domains
- [ ] Implement rate limiting on authentication endpoints
- [ ] Use secure cookies (HttpOnly, Secure, SameSite)
- [ ] Regular security updates for dependencies: `pnpm audit`
- [ ] Implement logging and monitoring
- [ ] Set up automated backups for database

### Database Security

```sql
-- Create dedicated user with limited privileges
CREATE USER 'melitech'@'localhost' IDENTIFIED BY 'strong-password';
GRANT ALL PRIVILEGES ON melitech_crm.* TO 'melitech'@'localhost';
FLUSH PRIVILEGES;
```

### API Security

- All authentication endpoints require HTTPS
- JWT tokens expire after 1 year (configurable)
- Password hashing uses bcrypt with salt rounds 10
- Rate limiting recommended on login/register endpoints

## Customization

### Branding

Update in `.env`:

```env
VITE_APP_TITLE="Your Company CRM"
VITE_APP_LOGO="https://your-domain.com/your-logo.png"
```

Or modify `client/src/const.ts`:

```typescript
export const APP_TITLE = "Your Custom Title";
export const APP_LOGO = "https://your-logo-url.png";
```

### Email Integration (Optional)

For password reset emails, implement email service in `server/routers/auth.ts`:

```typescript
// Example: Using nodemailer
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// In requestPasswordReset mutation:
await transporter.sendMail({
  to: user.email,
  subject: 'Password Reset',
  html: `<a href="${resetLink}">Reset your password</a>`,
});
```

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solution**: Ensure MySQL is running and DATABASE_URL is correct

```bash
mysql -u root -p -e "SELECT 1;"
```

### JWT Authentication Failed

```
Error: Invalid or expired token
```

**Solution**: Clear browser cookies and log in again

```bash
# Or restart the server to reset all sessions
```

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**: Change PORT in `.env` or kill the process:

```bash
lsof -i :3000
kill -9 <PID>
```

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

## Monitoring & Maintenance

### Logs

Check application logs:

```bash
# PM2 logs
pm2 logs melitech-crm

# Docker logs
docker logs <container-id>
```

### Database Maintenance

```sql
-- Check database size
SELECT table_schema, 
       ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'melitech_crm'
GROUP BY table_schema;

-- Optimize tables
OPTIMIZE TABLE users, clients, invoices;
```

### Backup Strategy

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/melitech-crm"
DATE=$(date +%Y%m%d_%H%M%S)

mysqldump -u melitech -p$DB_PASSWORD melitech_crm > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

## Support & Updates

For issues or questions:

1. Check the troubleshooting section above
2. Review application logs
3. Check database connectivity
4. Verify environment variables

## Migration from Manus Platform

If migrating from Manus-hosted version:

1. **Export data** from Manus platform
2. **Import** into standalone database
3. **Update authentication**: Users need to set passwords for local login
4. **Test thoroughly** before going live
5. **Update DNS** to point to new server

## Next Steps

- [ ] Configure custom domain
- [ ] Set up SSL/TLS certificate
- [ ] Configure email service for password resets
- [ ] Set up automated backups
- [ ] Configure monitoring and alerting
- [ ] Train users on new authentication system
- [ ] Plan data migration strategy

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Status**: Production Ready
