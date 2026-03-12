# Local Testing Guide - Standalone Authentication

This guide helps you test the Melitech CRM local authentication system on your machine before production deployment.

## Quick Start (5 minutes)

### 1. Prerequisites

- Node.js v22+ installed
- pnpm installed (`npm install -g pnpm`)
- MySQL/MariaDB running locally
- Port 3000 available

### 2. Database Setup

```bash
# Create database and user
mysql -u root -p << EOF
CREATE DATABASE melitech_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'melitech_user'@'localhost' IDENTIFIED BY 'Vzy1mvROm2A9bQZGvHjU';
GRANT ALL PRIVILEGES ON melitech_crm.* TO 'melitech_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# Verify connection
mysql -h localhost -u melitech_user -pVzy1mvROm2A9bQZGvHjU melitech_crm -e "SELECT 1;"
```

### 3. Update Environment

```bash
# Edit .env file
nano .env

# Update DATABASE_URL to use localhost instead of 'db'
DATABASE_URL=mysql://melitech_user:Vzy1mvROm2A9bQZGvHjU@localhost:3306/melitech_crm
```

### 4. Install & Run

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm db:push

# Start dev server
pnpm dev
```

### 5. Test in Browser

Open: **http://localhost:3000**

## Complete Testing Workflow

### Test 1: Signup Flow

1. Click **"Sign in to Continue"** button
2. Should redirect to `/login`
3. Click **"Don't have an account? Sign up"** link
4. Fill signup form:
   - **Name**: John Doe
   - **Email**: john@example.com
   - **Password**: SecurePassword123
5. Click **"Create Account"**
6. **Expected**: Redirect to dashboard, see "Welcome, John Doe"

### Test 2: Login Flow

1. Go to **http://localhost:3000/login**
2. Fill login form:
   - **Email**: john@example.com
   - **Password**: SecurePassword123
3. Click **"Sign In"**
4. **Expected**: Redirect to dashboard, authenticated user shown

### Test 3: Logout Flow

1. Click **user menu** (top right)
2. Click **"Logout"**
3. **Expected**: Redirect to login page, session cleared

### Test 4: Invalid Credentials

1. Go to **http://localhost:3000/login**
2. Fill form with:
   - **Email**: john@example.com
   - **Password**: WrongPassword123
3. Click **"Sign In"**
4. **Expected**: Error message "Invalid email or password"

### Test 5: Duplicate Email

1. Go to **http://localhost:3000/signup**
2. Try to signup with: john@example.com
3. **Expected**: Error message "Email already registered"

### Test 6: Invalid Email Format

1. Go to **http://localhost:3000/signup**
2. Fill form with:
   - **Name**: Test User
   - **Email**: invalid-email
   - **Password**: SecurePassword123
3. Click **"Create Account"**
4. **Expected**: Form validation error "Invalid email address"

### Test 7: Short Password

1. Go to **http://localhost:3000/signup**
2. Fill form with:
   - **Name**: Test User
   - **Email**: test@example.com
   - **Password**: short
3. Click **"Create Account"**
4. **Expected**: Form validation error "Password must be at least 8 characters"

### Test 8: Session Persistence

1. Login with valid credentials
2. Refresh page (F5)
3. **Expected**: Still logged in, dashboard visible
4. Close and reopen browser
5. **Expected**: Session cookie persists, still logged in

### Test 9: Protected Routes

1. Logout
2. Try to access **http://localhost:3000/dashboard** directly
3. **Expected**: Redirect to login page

## Database Verification

### Check Users Table

```bash
mysql -h localhost -u melitech_user -pVzy1mvROm2A9bQZGvHjU melitech_crm << EOF
SELECT id, email, name, loginMethod, createdAt FROM users;
EOF
```

### Check Password Hashes

```bash
mysql -h localhost -u melitech_user -pVzy1mvROm2A9bQZGvHjU melitech_crm << EOF
SELECT id, email, passwordHash FROM users WHERE email = 'john@example.com';
EOF
```

## API Testing with cURL

### Test Signup Endpoint

```bash
curl -X POST http://localhost:3000/api/trpc/auth.register \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "email": "api-test@example.com",
      "password": "ApiTestPassword123",
      "name": "API Test User"
    }
  }' | jq .
```

### Test Login Endpoint

```bash
curl -X POST http://localhost:3000/api/trpc/auth.login \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "email": "api-test@example.com",
      "password": "ApiTestPassword123"
    }
  }' | jq .
```

### Test Get Current User

```bash
curl -X GET http://localhost:3000/api/trpc/auth.me \
  -H "Content-Type: application/json" | jq .
```

## Troubleshooting

### Issue: Database Connection Error

```bash
# Check MySQL is running
sudo systemctl status mysql

# Verify credentials
mysql -h localhost -u melitech_user -pVzy1mvROm2A9bQZGvHjU melitech_crm -e "SELECT 1;"

# Check .env file
cat .env | grep DATABASE_URL
```

### Issue: Migration Fails

```bash
# Check if tables exist
mysql -h localhost -u melitech_user -pVzy1mvROm2A9bQZGvHjU melitech_crm -e "SHOW TABLES;"

# Drop and recreate database (WARNING: Deletes all data)
mysql -h localhost -u melitech_user -pVzy1mvROm2A9bQZGvHjU -e "DROP DATABASE melitech_crm;"
mysql -h localhost -u melitech_user -pVzy1mvROm2A9bQZGvHjU -e "CREATE DATABASE melitech_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Rerun migration
pnpm db:push
```

### Issue: Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 pnpm dev
```

### Issue: Node Modules Issues

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm db:push
pnpm dev
```

## Performance Testing

### Load Testing with Apache Bench

```bash
# Install Apache Bench
sudo apt install -y apache2-utils

# Test login endpoint
ab -n 100 -c 10 -p request.json \
  -T application/json \
  http://localhost:3000/api/trpc/auth.login
```

### Test Multiple Concurrent Users

```bash
# Create 10 test users
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/trpc/auth.register \
    -H "Content-Type: application/json" \
    -d "{
      \"json\": {
        \"email\": \"user$i@example.com\",
        \"password\": \"Password123\",
        \"name\": \"User $i\"
      }
    }"
done
```

## Security Testing

### Test Password Hashing

```bash
# Verify passwords are hashed (not stored in plain text)
mysql -h localhost -u melitech_user -pVzy1mvROm2A9bQZGvHjU melitech_crm << EOF
SELECT email, passwordHash FROM users LIMIT 1;
EOF

# Should see bcrypt hash starting with $2b$10$
```

### Test Session Security

```bash
# Check cookie attributes
curl -i http://localhost:3000/login | grep -i "set-cookie"

# Should see: HttpOnly, Secure (in production), SameSite=Strict
```

### Test SQL Injection

```bash
# Try SQL injection in login
curl -X POST http://localhost:3000/api/trpc/auth.login \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "email": "admin@example.com\" OR \"1\"=\"1",
      "password": "anything"
    }
  }' | jq .

# Should return "Invalid email or password" (not vulnerable)
```

## Cleanup

### Reset Test Data

```bash
# Delete all test users
mysql -h localhost -u melitech_user -pVzy1mvROm2A9bQZGvHjU melitech_crm << EOF
DELETE FROM users WHERE email LIKE '%@example.com';
EOF
```

### Stop Dev Server

```bash
# Press Ctrl+C in terminal running pnpm dev
```

## Next Steps

After successful local testing:

1. ✅ Review PRODUCTION_DEPLOYMENT_GUIDE.md
2. ✅ Set up production server
3. ✅ Configure domain DNS
4. ✅ Install SSL certificate
5. ✅ Deploy application
6. ✅ Run production tests
7. ✅ Monitor logs and metrics

---

**Testing Checklist**

- [ ] Database setup complete
- [ ] .env configured for localhost
- [ ] `pnpm install` successful
- [ ] `pnpm db:push` successful
- [ ] `pnpm dev` running without errors
- [ ] Signup flow works
- [ ] Login flow works
- [ ] Logout flow works
- [ ] Session persistence works
- [ ] Protected routes redirect properly
- [ ] Invalid credentials rejected
- [ ] Database contains test users
- [ ] Password hashes verified
- [ ] All error cases tested

**Last Updated**: November 2025
