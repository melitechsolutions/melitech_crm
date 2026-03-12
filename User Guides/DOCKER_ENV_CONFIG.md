# Docker Environment Variables Configuration Guide

## Overview

When running Melitech CRM in Docker, environment variables are handled in two ways:

1. **Build Arguments** - Used during Docker image build to embed VITE frontend configuration
2. **Runtime Environment** - Used when the container is running for backend configuration

## Build Arguments (docker-compose.yml)

Build arguments are passed to the Dockerfile during the `docker-compose build` process. These configure the frontend (VITE) build.

### VITE Build Arguments

```yaml
build:
  args:
    VITE_OAUTH_PORTAL_URL: http://localhost:3000
    VITE_APP_ID: melitech_crm_ce038232f9a9e7b6
    VITE_APP_TITLE: "Melitech Solutions CRM"
    VITE_APP_LOGO: ""
    VITE_ANALYTICS_ENDPOINT: ""
    VITE_ANALYTICS_WEBSITE_ID: ""
    VITE_FRONTEND_FORGE_API_URL: ""
```

### What Each Build Argument Does

| Argument | Purpose | Example |
|----------|---------|---------|
| `VITE_OAUTH_PORTAL_URL` | OAuth server URL for authentication | `http://localhost:3000` |
| `VITE_APP_ID` | Unique application identifier | `melitech_crm_ce038232f9a9e7b6` |
| `VITE_APP_TITLE` | Application name shown in UI | `Melitech Solutions CRM` |
| `VITE_APP_LOGO` | Logo URL (empty for default) | `https://example.com/logo.png` |
| `VITE_ANALYTICS_ENDPOINT` | Analytics service URL | `https://analytics.example.com` |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics website ID | `abc123def456` |
| `VITE_FRONTEND_FORGE_API_URL` | Frontend API URL | `https://api.example.com` |

## Runtime Environment Variables (docker-compose.yml)

Runtime environment variables are set when the container starts and affect backend behavior.

### Database Configuration

```yaml
environment:
  DATABASE_URL: mysql://root:FgPrIBA1CYe5wyqD8ogi@db:3306/melitech_crm
```

**Format:** `mysql://[user]:[password]@[host]:[port]/[database]`

- `user` - MySQL username (default: root)
- `password` - MySQL password
- `host` - Database hostname (use `db` for Docker service name)
- `port` - MySQL port (3306 is default)
- `database` - Database name

### Security Configuration

```yaml
environment:
  JWT_SECRET: ro5A_c25AwsQHy30Dqg6VAbqQHmeezt1Xfx-e37ApnE
```

**Important:** Change this to a strong random value in production!

Generate a new secret:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((1..32 | ForEach-Object { [char](Get-Random -Minimum 33 -Maximum 126) }) -join ''))
```

### Authentication Configuration

```yaml
environment:
  NODE_ENV: production
  AUTH_MODE: local
  OAUTH_SERVER_URL: http://localhost:3000
  VITE_OAUTH_PORTAL_URL: http://localhost:3000
  VITE_APP_ID: melitech_crm_ce038232f9a9e7b6
```

- `NODE_ENV` - Set to `production` for Docker
- `AUTH_MODE` - Set to `local` for standalone authentication
- `OAUTH_SERVER_URL` - OAuth server URL
- `VITE_OAUTH_PORTAL_URL` - Frontend OAuth URL

### Cookie Configuration (Docker HTTP)

```yaml
environment:
  COOKIE_SAME_SITE: "lax"
  COOKIE_SECURE: "false"
```

**Important:** These settings are required for Docker HTTP environments:
- `COOKIE_SAME_SITE: "lax"` - Allows cookies in HTTP (not just HTTPS)
- `COOKIE_SECURE: "false"` - Allows insecure HTTP connections

For production HTTPS, change to:
```yaml
environment:
  COOKIE_SAME_SITE: "none"
  COOKIE_SECURE: "true"
```

### Application Configuration

```yaml
environment:
  VITE_APP_TITLE: "Melitech Solutions CRM"
  VITE_APP_LOGO: ""
  OWNER_EMAIL: admin@melitechsolutions.co.ke
  OWNER_NAME: Administrator
```

### Analytics Configuration

```yaml
environment:
  VITE_ANALYTICS_ENDPOINT: ""
  VITE_ANALYTICS_WEBSITE_ID: ""
  VITE_FRONTEND_FORGE_API_URL: ""
```

Set these to empty strings if you don't use analytics. If you do:

```yaml
environment:
  VITE_ANALYTICS_ENDPOINT: "https://analytics.example.com"
  VITE_ANALYTICS_WEBSITE_ID: "your-website-id"
  VITE_FRONTEND_FORGE_API_URL: "https://api.example.com"
```

## Common Issues & Solutions

### Issue: URIError: Failed to decode param '/%VITE_*%'

**Cause:** VITE variables are not being substituted during build

**Solution:** Ensure build arguments are properly set in docker-compose.yml:
```yaml
build:
  args:
    VITE_OAUTH_PORTAL_URL: http://localhost:3000
    VITE_APP_ID: melitech_crm_ce038232f9a9e7b6
    # ... other VITE args
```

Then rebuild:
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Issue: [Auth] Missing session cookie

**Cause:** This is normal on first load. It means you're not authenticated yet.

**Solution:** Login with valid credentials. The session cookie will be set after authentication.

### Issue: Cannot connect to database

**Cause:** DATABASE_URL is incorrect or database is not ready

**Solution:** 
1. Verify DATABASE_URL format
2. Ensure `db` service is healthy: `docker-compose ps`
3. Check database logs: `docker-compose logs db`

### Issue: Frontend shows blank page or 404

**Cause:** Frontend build failed due to missing VITE variables

**Solution:**
1. Check build logs: `docker-compose build --no-cache`
2. Verify all VITE build arguments are set
3. Rebuild: `docker-compose build --no-cache && docker-compose up -d`

## Customizing for Your Environment

### Development Environment

```yaml
build:
  args:
    VITE_OAUTH_PORTAL_URL: http://localhost:3000
    VITE_APP_ID: dev_app_id
    VITE_APP_TITLE: "Melitech CRM - Development"
    VITE_APP_LOGO: ""
    VITE_ANALYTICS_ENDPOINT: ""
    VITE_ANALYTICS_WEBSITE_ID: ""
    VITE_FRONTEND_FORGE_API_URL: ""

environment:
  NODE_ENV: development
  JWT_SECRET: dev-secret-change-in-production
  COOKIE_SAME_SITE: "lax"
  COOKIE_SECURE: "false"
```

### Production Environment

```yaml
build:
  args:
    VITE_OAUTH_PORTAL_URL: https://yourdomain.com
    VITE_APP_ID: prod_app_id
    VITE_APP_TITLE: "Melitech Solutions CRM"
    VITE_APP_LOGO: "https://yourdomain.com/logo.png"
    VITE_ANALYTICS_ENDPOINT: "https://analytics.yourdomain.com"
    VITE_ANALYTICS_WEBSITE_ID: "your-analytics-id"
    VITE_FRONTEND_FORGE_API_URL: "https://api.yourdomain.com"

environment:
  NODE_ENV: production
  JWT_SECRET: "$(openssl rand -base64 32)"
  COOKIE_SAME_SITE: "none"
  COOKIE_SECURE: "true"
  DATABASE_URL: "mysql://prod_user:strong_password@prod_db_host:3306/melitech_crm"
```

## Environment Variable Reference

### All Available Variables

| Variable | Type | Default | Purpose |
|----------|------|---------|---------|
| `NODE_ENV` | string | production | Node environment (development/production) |
| `DATABASE_URL` | string | - | MySQL connection string |
| `JWT_SECRET` | string | - | JWT signing secret |
| `AUTH_MODE` | string | local | Authentication mode (local/oauth) |
| `OAUTH_SERVER_URL` | string | - | OAuth server URL |
| `VITE_OAUTH_PORTAL_URL` | string | - | Frontend OAuth URL |
| `VITE_APP_ID` | string | - | Application ID |
| `VITE_APP_TITLE` | string | - | Application title |
| `VITE_APP_LOGO` | string | - | Logo URL |
| `VITE_ANALYTICS_ENDPOINT` | string | - | Analytics endpoint |
| `VITE_ANALYTICS_WEBSITE_ID` | string | - | Analytics website ID |
| `VITE_FRONTEND_FORGE_API_URL` | string | - | Frontend API URL |
| `COOKIE_SAME_SITE` | string | lax | Cookie SameSite attribute |
| `COOKIE_SECURE` | string | false | Cookie Secure attribute |
| `OWNER_EMAIL` | string | - | Owner email address |
| `OWNER_NAME` | string | - | Owner name |

## Rebuilding After Changes

After modifying environment variables in `docker-compose.yml`:

```bash
# Rebuild the image with new build arguments
docker-compose build --no-cache

# Stop and remove old containers
docker-compose down

# Start new containers with new configuration
docker-compose up -d

# View logs to verify
docker-compose logs -f app
```

## Debugging

### View current environment variables in running container

```bash
docker-compose exec app env | grep VITE
docker-compose exec app env | grep DATABASE
```

### View build logs

```bash
docker-compose build --no-cache 2>&1 | tee build.log
```

### Check if variables are embedded in frontend

```bash
docker-compose exec app cat dist/index.html | grep -i vite
```

## Security Best Practices

1. **Never commit secrets to version control**
   - Use `.env` files (add to `.gitignore`)
   - Use Docker secrets for production

2. **Change default credentials**
   - Change `JWT_SECRET`
   - Change database password
   - Change MySQL root password

3. **Use HTTPS in production**
   - Set `COOKIE_SECURE: "true"`
   - Set `COOKIE_SAME_SITE: "none"`
   - Use valid SSL certificates

4. **Rotate secrets regularly**
   - Change JWT_SECRET periodically
   - Update database passwords
   - Audit access logs

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Express.js Configuration](https://expressjs.com/en/advanced/best-practice-security.html)
- [MySQL Connection Strings](https://dev.mysql.com/doc/connector-python/en/connector-python-connectargs.html)

