# Melitech CRM - Complete Deployment Guide for Beginners

**Version**: 1.0  
**Last Updated**: December 2025  
**Author**: Manus AI

This guide walks you through deploying Melitech CRM step-by-step, even if you've never deployed an application before.

---

## What is Deployment?

Deployment means taking your application from your computer and putting it on a server so other people can use it. Think of it like moving from your home office to a real office building where your team can access the application from anywhere.

---

## Before You Start

### What You'll Need

Before you begin, gather these items:

**Hardware**: A server or computer that will run your application 24/7. This can be a physical server in your office, a cloud server (AWS, DigitalOcean, Linode), or a virtual machine. The server needs at least 2GB of RAM and 10GB of disk space.

**Software**: Docker and Docker Compose installed on your server. These tools make deployment much easier by packaging everything your application needs.

**Information**: Database credentials (username and password), API keys for email services, and any other configuration your application needs.

**Time**: Plan for 2-3 hours for the initial deployment. Have a quiet time when you won't be interrupted.

**Backup**: A complete backup of any existing data. If something goes wrong, you'll want to restore from backup.

### Choosing Your Deployment Method

You have two main options:

**Option 1: Docker Deployment (Recommended for Beginners)**

Docker packages your application with all its dependencies, making deployment consistent and reliable. This is the recommended approach because it handles many configuration details automatically.

**Option 2: Manual Deployment**

You install each component separately (Node.js, MySQL, etc.) and configure them manually. This gives you more control but requires more technical knowledge.

This guide focuses on Docker deployment because it's simpler and more reliable.

---

## Step 1: Prepare Your Server

### Step 1.1: Choose a Server

You have several options:

**Cloud Providers** (Recommended for most businesses):
- **DigitalOcean**: Simple, affordable, good documentation
- **AWS EC2**: Powerful but more complex
- **Linode**: Good balance of features and ease of use
- **Heroku**: Easiest but more expensive
- **Azure**: Enterprise option

**On-Premises Server**:
- Your own server in your office
- Requires IT expertise to maintain
- Full control over your data

For this guide, we'll assume you're using a cloud provider like DigitalOcean.

### Step 1.2: Create Your Server

If using a cloud provider:

1. Create an account with your chosen provider
2. Create a new server (called a "droplet" on DigitalOcean, "instance" on AWS)
3. Choose Ubuntu 22.04 LTS as the operating system
4. Select at least 2GB RAM and 50GB disk space
5. Choose a region close to your users
6. Create the server and note the IP address

### Step 1.3: Connect to Your Server

You'll connect to your server using SSH (a secure way to access remote computers).

**On Windows**:
1. Download PuTTY (free SSH client)
2. Enter your server's IP address
3. Click "Open"
4. Log in with your credentials

**On Mac or Linux**:
1. Open Terminal
2. Type: `ssh root@YOUR_SERVER_IP`
3. Enter your password when prompted

### Step 1.4: Update Your Server

Once connected, update the system:

```bash
sudo apt update
sudo apt upgrade -y
```

This ensures your server has the latest security patches.

---

## Step 2: Install Required Software

### Step 2.1: Install Docker

Docker is the tool that will run your application. Install it with:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

Verify installation:

```bash
docker --version
```

You should see something like: `Docker version 24.0.0`

### Step 2.2: Install Docker Compose

Docker Compose helps manage multiple containers (database, application, etc.):

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

Verify installation:

```bash
docker-compose --version
```

You should see something like: `Docker Compose version 2.20.0`

### Step 2.3: Install Git

Git helps you download your application:

```bash
sudo apt install git -y
```

Verify installation:

```bash
git --version
```

---

## Step 3: Download Your Application

### Step 3.1: Clone the Repository

Navigate to your home directory and clone the Melitech CRM repository:

```bash
cd ~
git clone https://github.com/yourusername/melitech_crm.git
cd melitech_crm
```

Replace `yourusername` with your actual GitHub username.

### Step 3.2: Verify Files

Check that all files were downloaded:

```bash
ls -la
```

You should see files like `Dockerfile`, `docker-compose.yml`, `package.json`, etc.

---

## Step 4: Configure Your Application

### Step 4.1: Create Environment File

Your application needs a configuration file called `.env`. Create it:

```bash
nano .env
```

This opens a text editor. Add the following configuration (replace values with your actual credentials):

```
# Database Configuration
DATABASE_URL=mysql://melitech_user:your_secure_password@db:3306/melitech

# Application Configuration
NODE_ENV=production
JWT_SECRET=your_very_secure_random_string_here
VITE_APP_TITLE=Melitech Solutions CRM
VITE_APP_LOGO=https://your-domain.com/logo.png

# OAuth Configuration
VITE_APP_ID=your_oauth_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Built-in APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key_here
```

To save the file in nano:
1. Press `Ctrl+O` to save
2. Press `Enter` to confirm
3. Press `Ctrl+X` to exit

### Step 4.2: Understand Configuration

Here's what each setting means:

**DATABASE_URL**: How to connect to your database. The format is `mysql://username:password@host:port/database`

**NODE_ENV**: Set to `production` for live deployment

**JWT_SECRET**: A random string used to secure sessions. Generate one with: `openssl rand -base64 32`

**VITE_APP_TITLE**: The name shown in the browser tab and login page

**VITE_APP_LOGO**: URL to your company logo

**SMTP Settings**: For sending emails. If using Gmail, create an "App Password" in your Google account settings

### Step 4.3: Verify Configuration

Check that your .env file looks correct:

```bash
cat .env
```

Make sure all values are filled in and there are no syntax errors.

---

## Step 5: Build and Start Your Application

### Step 5.1: Build Docker Image

This creates a Docker image (a blueprint) for your application:

```bash
docker-compose build --no-cache
```

This takes 5-10 minutes. You'll see lots of output as Docker downloads and installs dependencies. This is normal.

### Step 5.2: Start Services

Now start your application:

```bash
docker-compose up -d
```

The `-d` flag means "run in background". You'll see output like:

```
Creating melitech_crm_db_1 ... done
Creating melitech_crm_app_1 ... done
```

### Step 5.3: Wait for Services to Start

Services need time to start. Wait 30-60 seconds, then check status:

```bash
docker-compose ps
```

You should see something like:

```
NAME                COMMAND                  SERVICE      STATUS
melitech_crm_db     "docker-entrypoint..."   db           Up (healthy)
melitech_crm_app    "/app/start.sh"          app          Up (healthy)
```

Both services should show "Up" status.

### Step 5.4: Check Logs

View logs to see if there are any errors:

```bash
docker-compose logs app
```

Look for messages like `[Startup] ✅ Database initialization complete` and `Server running on http://localhost:3000/`

If you see errors, check the "Troubleshooting" section below.

---

## Step 6: Set Up Domain and HTTPS

### Step 6.1: Point Domain to Server

If you have a domain name (e.g., crm.yourdomain.com):

1. Log into your domain registrar (GoDaddy, Namecheap, etc.)
2. Find DNS settings
3. Add an A record pointing to your server's IP address
4. Wait 15-30 minutes for DNS to propagate

### Step 6.2: Install SSL Certificate

SSL makes your connection secure (HTTPS instead of HTTP). Use Let's Encrypt (free):

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Then create the certificate:

```bash
sudo certbot certonly --standalone -d your-domain.com
```

Follow the prompts to create your certificate.

### Step 6.3: Configure HTTPS in Docker

Edit your `docker-compose.yml` file:

```bash
nano docker-compose.yml
```

Find the ports section and add SSL ports:

```yaml
services:
  app:
    ports:
      - "80:3000"
      - "443:3000"
```

Save and restart:

```bash
docker-compose restart
```

---

## Step 7: Verify Everything Works

### Step 7.1: Test Application Access

Open your web browser and navigate to:

```
http://YOUR_SERVER_IP:3000
```

Or if you set up a domain:

```
https://your-domain.com
```

You should see the Melitech CRM login page.

### Step 7.2: Test Login

1. Click "Sign in to Continue"
2. Use your credentials to log in
3. You should see the dashboard

### Step 7.3: Test Core Features

Create a test client to verify everything works:

1. Click **Clients** in the menu
2. Click **"Add New Client"**
3. Fill in test information
4. Click **"Save Client"**

If this works, your database connection is working correctly.

### Step 7.4: Check Logs for Errors

```bash
docker-compose logs --tail 50
```

There should be no error messages. If you see errors, refer to the troubleshooting section.

---

## Step 8: Set Up Backups

### Step 8.1: Create Backup Script

Create a script to backup your database:

```bash
nano ~/backup.sh
```

Add the following:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T db mysqldump -u root -p$MYSQL_ROOT_PASSWORD melitech > $BACKUP_DIR/melitech_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "melitech_*.sql" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/melitech_$DATE.sql"
```

Make it executable:

```bash
chmod +x ~/backup.sh
```

### Step 8.2: Schedule Automatic Backups

Run backups daily at 2 AM:

```bash
crontab -e
```

Add this line:

```
0 2 * * * ~/backup.sh
```

Save and exit. Your database will now backup automatically every day.

### Step 8.3: Store Backups Safely

Copy backups to a safe location (cloud storage, external drive, etc.):

```bash
# Copy to cloud storage (example with AWS S3)
aws s3 sync /home/ubuntu/backups s3://your-bucket/melitech-backups/
```

---

## Step 9: Monitor Your Application

### Step 9.1: Set Up Log Monitoring

View logs in real-time:

```bash
docker-compose logs -f app
```

Press `Ctrl+C` to stop viewing logs.

### Step 9.2: Monitor System Resources

Check CPU, memory, and disk usage:

```bash
docker stats
```

This shows real-time resource usage. Press `Ctrl+C` to exit.

### Step 9.3: Check Disk Space

Make sure you don't run out of disk space:

```bash
df -h
```

You should have at least 5GB free.

### Step 9.4: Set Up Alerts

For production systems, set up alerts to notify you of problems:

1. Use your server provider's monitoring (DigitalOcean Monitoring, AWS CloudWatch)
2. Set alerts for: High CPU, High memory, Low disk space, Application down
3. Configure email notifications

---

## Step 10: Maintain Your Application

### Step 10.1: Regular Updates

Check for updates weekly:

```bash
cd ~/melitech_crm
git pull origin main
docker-compose build --no-cache
docker-compose up -d
```

### Step 10.2: Database Maintenance

Optimize your database monthly:

```bash
docker-compose exec db mysql -u root -p$MYSQL_ROOT_PASSWORD melitech -e "OPTIMIZE TABLE users, clients, invoices;"
```

### Step 10.3: Clean Up Old Data

Remove old logs and temporary files:

```bash
docker system prune -a
```

### Step 10.4: Security Updates

Apply security patches immediately:

```bash
sudo apt update
sudo apt upgrade -y
```

---

## Troubleshooting

### Problem: Application Won't Start

**What to do**: Check the logs to see the error:

```bash
docker-compose logs app
```

Look for error messages. Common causes:

**"Cannot connect to database"**: Database isn't running or credentials are wrong
- Solution: Check DATABASE_URL in .env file
- Solution: Verify database container is running: `docker-compose ps`

**"Cannot find module 'tsx'"**: Missing dependency
- Solution: Rebuild: `docker-compose build --no-cache`

**"Port 3000 already in use"**: Another application is using port 3000
- Solution: Change port in docker-compose.yml from `"3000:3000"` to `"3001:3000"`

### Problem: Can't Access Application

**What to do**: Verify the application is running:

```bash
docker-compose ps
```

If not running, start it:

```bash
docker-compose up -d
```

**Firewall blocking access**: Check if firewall allows port 3000:

```bash
sudo ufw allow 3000
```

### Problem: Slow Performance

**What to do**: Check resource usage:

```bash
docker stats
```

If CPU or memory is high:
- Increase server resources (add more RAM or CPU)
- Optimize database queries
- Enable caching

### Problem: Database Connection Error

**What to do**: Verify database is running:

```bash
docker-compose ps
```

Test connection:

```bash
docker-compose exec db mysql -u root -p$MYSQL_ROOT_PASSWORD -e "SELECT 1;"
```

If this fails, check DATABASE_URL in .env file.

### Problem: Email Not Sending

**What to do**: Verify SMTP credentials in .env file are correct:

```bash
cat .env | grep SMTP
```

Test SMTP connection:

```bash
docker-compose exec app telnet SMTP_HOST SMTP_PORT
```

### Problem: Users Can't Log In

**What to do**: Check authentication logs:

```bash
docker-compose logs app | grep -i auth
```

Verify OAuth credentials in .env file are correct:

```bash
cat .env | grep OAUTH
```

---

## Rollback Procedure

If something goes wrong after deployment, you can rollback to the previous version:

### Step 1: Stop Current Application

```bash
docker-compose down
```

### Step 2: Restore Database from Backup

```bash
docker-compose up -d db
sleep 30
docker-compose exec -T db mysql -u root -p$MYSQL_ROOT_PASSWORD melitech < /home/ubuntu/backups/melitech_YYYYMMDD_HHMMSS.sql
```

Replace the date with your backup date.

### Step 3: Restore Previous Application Version

```bash
git checkout previous-version-tag
docker-compose build --no-cache
docker-compose up -d
```

### Step 4: Verify Everything Works

```bash
docker-compose logs app
```

Check that application started successfully.

---

## Next Steps After Deployment

### Immediate (First Day)

Monitor your application closely. Check logs regularly for errors. Test all major features. Gather feedback from users.

### Short-term (First Week)

Optimize performance based on usage patterns. Apply any security updates. Train your team on the new system. Document any issues encountered.

### Long-term (Ongoing)

Monitor system health continuously. Plan for growth and scaling. Keep software updated. Maintain regular backups. Gather user feedback for improvements.

---

## Getting Help

If you encounter issues:

1. **Check Logs**: Most problems are explained in logs
2. **Review Troubleshooting**: Check the troubleshooting section above
3. **Read Documentation**: Refer to other guides in the project
4. **Contact Support**: Reach out to your system administrator or support team

---

## Summary

You've successfully deployed Melitech CRM! Here's what you accomplished:

1. Prepared your server with required software
2. Downloaded and configured your application
3. Built and started Docker containers
4. Set up domain and HTTPS
5. Verified everything works
6. Set up backups and monitoring
7. Learned how to maintain and troubleshoot

Your application is now running and accessible to your team. Continue monitoring it, keeping it updated, and gathering feedback for improvements.

**Congratulations on your successful deployment!**

---

## Quick Reference Commands

```bash
# Start application
docker-compose up -d

# Stop application
docker-compose down

# View logs
docker-compose logs -f app

# Check status
docker-compose ps

# Restart application
docker-compose restart

# Rebuild application
docker-compose build --no-cache

# View resource usage
docker stats

# Backup database
docker-compose exec db mysqldump -u root -p$MYSQL_ROOT_PASSWORD melitech > backup.sql

# Restore database
docker-compose exec -T db mysql -u root -p$MYSQL_ROOT_PASSWORD melitech < backup.sql

# Update application
git pull origin main
docker-compose build --no-cache
docker-compose up -d
```

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Author**: Manus AI
