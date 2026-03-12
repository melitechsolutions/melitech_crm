# Test User Credentials

## 🔑 Login Credentials for Testing

All test users use the same password: **`password123`**

### Admin User
- **Email:** `admin@melitech.com`
- **Password:** `password123`
- **Role:** Admin
- **Access:** Full system access, all dashboards

### Accountant User
- **Email:** `accountant@melitech.com`
- **Password:** `password123`
- **Role:** Accountant
- **Access:** Financial dashboard, accounting features

### HR Manager
- **Email:** `hr@melitech.com`
- **Password:** `password123`
- **Role:** HR
- **Access:** HR dashboard, employee management

### Staff Member
- **Email:** `staff@melitech.com`
- **Password:** `password123`
- **Role:** Staff
- **Access:** Staff dashboard, limited features

### Client User
- **Email:** `client@melitech.com`
- **Password:** `password123`
- **Role:** Client
- **Access:** Client portal, view-only access

---

## 📋 Quick Test Steps

1. **Start the application:**
   ```bash
   docker-compose up -d
   ```

2. **Create test users:**
   ```bash
   docker-compose exec app npx tsx create-test-users.ts
   ```

3. **Open browser:**
   ```
   http://localhost:3000/login
   ```

4. **Login with any user above**

5. **Test logout:**
   - Click profile icon → Sign Out
   - Should redirect to login page ✅

---

## 🔒 Security Notes

**⚠️ IMPORTANT FOR PRODUCTION:**

1. **Change default passwords immediately!**
2. **Use strong, unique passwords for each user**
3. **Enable two-factor authentication if available**
4. **Regularly rotate passwords**
5. **Remove test accounts before going live**

---

## 🎯 Testing Different Roles

### Test Admin Features
Login as: `admin@melitech.com`
- Access all dashboards
- Manage users
- View system settings
- Access all modules

### Test Accountant Features
Login as: `accountant@melitech.com`
- Access financial dashboard
- Manage invoices
- Track expenses
- Generate financial reports

### Test HR Features
Login as: `hr@melitech.com`
- Access HR dashboard
- Manage employees
- Track attendance
- Manage leave requests

### Test Staff Features
Login as: `staff@melitech.com`
- Access staff dashboard
- View assigned tasks
- Submit timesheets
- Request leave

### Test Client Features
Login as: `client@melitech.com`
- Access client portal
- View projects
- View invoices
- Submit support requests

---

**Created:** December 15, 2025
**Password:** `password123` (for all test users)
