# Complete Setup Guide - Melitech CRM

## 🎉 What's Been Fixed

### 1. ✅ Authentication System
- **Login now works perfectly** with email/password
- Fixed TypeScript compilation error in auth router
- Added proper import for `getUserByEmail` from `db-users.ts`

### 2. ✅ Logout Functionality
- **Logout now redirects to login page** (no more 404 errors)
- Properly clears all authentication state
- Clears localStorage and cookies

### 3. ✅ Test Users Created
- Script to create test users for all dashboard roles
- All users use the same password for easy testing

---

## 🚀 Quick Start

### Step 1: Start the Application

```powershell
# Stop any running containers
docker-compose down

# Start fresh
docker-compose up -d --build

# Wait 30-60 seconds for initialization
```

### Step 2: Create Test Users

```powershell
# Run the test user creation script
docker-compose exec app npx tsx create-test-users.ts
```

This will create the following users:

| Email | Password | Role | Dashboard Access |
|-------|----------|------|------------------|
| `admin@melitech.com` | `password123` | Admin | Full system access |
| `accountant@melitech.com` | `password123` | Accountant | Financial dashboard |
| `hr@melitech.com` | `password123` | HR | HR dashboard |
| `staff@melitech.com` | `password123` | Staff | Staff dashboard |
| `client@melitech.com` | `password123` | Client | Client portal |

### Step 3: Test Login

1. Open http://localhost:3000/login
2. Login with any of the test users above
3. You'll be redirected to the appropriate dashboard based on your role

### Step 4: Test Logout

1. Click on your profile icon in the top-right corner
2. Click "Sign Out"
3. You'll be redirected back to the login page ✅

---

## 📊 Dashboard Backend Status

### ✅ Backend APIs Available

The following backend routers are **already implemented** and ready to use:

- **Dashboard Router** (`/api/trpc/dashboard.*`)
  - `dashboard.metrics` - Get overall system metrics
  - `dashboard.accountingMetrics` - Get accounting metrics
  - `dashboard.hrMetrics` - Get HR metrics

- **Users Router** (`/api/trpc/users.*`)
  - User management endpoints

- **Clients Router** (`/api/trpc/clients.*`)
  - Client management endpoints

- **Projects Router** (`/api/trpc/projects.*`)
  - Project management endpoints

- **Invoices Router** (`/api/trpc/invoices.*`)
  - Invoice management endpoints

- **Employees Router** (`/api/trpc/employees.*`)
  - Employee management endpoints

- **Payroll Router** (`/api/trpc/payroll.*`)
  - Payroll management endpoints

- **Attendance Router** (`/api/trpc/attendance.*`)
  - Attendance tracking endpoints

- **Leave Router** (`/api/trpc/leave.*`)
  - Leave management endpoints

- **Expenses Router** (`/api/trpc/expenses.*`)
  - Expense tracking endpoints

- **Payments Router** (`/api/trpc/payments.*`)
  - Payment processing endpoints

And many more! See `/server/routers/` for all available endpoints.

### ⚠️ Frontend Dashboards Status

The dashboard frontend components are currently using **mock/static data**. They need to be connected to the backend APIs.

**Example: Connecting AdminDashboard to Backend**

```typescript
// In /client/src/pages/dashboards/AdminDashboard.tsx

import { trpc } from "@/lib/trpc";

export default function AdminDashboard() {
  const { user, loading } = useAuthWithPersistence({
    redirectOnUnauthenticated: true,
  });

  // Fetch real data from backend
  const { data: metrics, isLoading: metricsLoading } = trpc.dashboard.metrics.useQuery();
  const { data: accountingMetrics } = trpc.dashboard.accountingMetrics.useQuery();
  
  if (loading || metricsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={metrics?.totalProjects || 0}
          icon={<FolderIcon />}
        />
        <StatCard
          title="Active Clients"
          value={metrics?.activeClients || 0}
          icon={<UsersIcon />}
        />
        {/* ... more cards ... */}
      </div>
    </DashboardLayout>
  );
}
```

---

## 🔧 What You Need to Do Next

### Priority 1: Connect Dashboards to Backend

Each dashboard needs to be updated to fetch real data from the backend:

1. **AdminDashboard** → Use `trpc.dashboard.metrics.useQuery()`
2. **AccountantDashboard** → Use `trpc.dashboard.accountingMetrics.useQuery()`
3. **HRDashboard** → Use `trpc.dashboard.hrMetrics.useQuery()`
4. **StaffDashboard** → Use appropriate employee/project queries
5. **ClientPortal** → Use client-specific queries

### Priority 2: Add Sample Data

To make the dashboards look populated, you can:

1. Create a seed script to add sample data
2. Or manually add data through the UI once dashboards are connected
3. Or import data from existing systems

### Priority 3: Role-Based Access Control

Verify that each dashboard properly checks user roles:

```typescript
useEffect(() => {
  if (!loading && isAuthenticated && user?.role !== "admin") {
    setLocation("/dashboard"); // Redirect if wrong role
  }
}, [loading, isAuthenticated, user, setLocation]);
```

---

## 🐛 Troubleshooting

### Login Still Fails

```powershell
# Check if the fix was applied
docker-compose exec app cat /app/server/routers/auth.ts | grep "getUserByEmail"

# Should show: import { getUserByEmail } from "../db-users";
```

### Logout Redirects to 404

```powershell
# Rebuild to apply the logout fix
docker-compose down
docker-compose up -d --build
```

### Test Users Not Created

```powershell
# Check database connection
docker-compose exec app node -e "const mysql = require('mysql2/promise'); mysql.createConnection(process.env.DATABASE_URL).then(() => console.log('Connected!')).catch(e => console.error('Error:', e.message));"

# Manually check users in database
docker-compose exec db mysql -uroot -p$(grep MYSQL_ROOT_PASSWORD .env | cut -d'=' -f2) melitech_crm -e "SELECT id, email, role FROM users;"
```

### Dashboard Shows No Data

This is expected! The dashboards are not yet connected to the backend. Follow "Priority 1" above to connect them.

---

## 📝 Testing Checklist

- [x] Login with admin@melitech.com works
- [x] Login with accountant@melitech.com works
- [x] Login with hr@melitech.com works
- [x] Login with staff@melitech.com works
- [x] Login with client@melitech.com works
- [x] Logout redirects to login page
- [x] Logout clears authentication state
- [ ] Admin dashboard shows real data
- [ ] Accountant dashboard shows real data
- [ ] HR dashboard shows real data
- [ ] Staff dashboard shows real data
- [ ] Client portal shows real data

---

## 🎯 Summary

### ✅ Working Now
- ✅ Login authentication
- ✅ Logout with proper redirect
- ✅ Test users for all roles
- ✅ Backend APIs ready
- ✅ Role-based routing

### ⚠️ Needs Work
- ⚠️ Connect frontend dashboards to backend APIs
- ⚠️ Add sample/seed data
- ⚠️ Complete UI for all CRUD operations

### 📚 Next Steps
1. Connect dashboards to backend (see examples above)
2. Add sample data for testing
3. Test all user roles and permissions
4. Complete remaining UI components

---

## 🆘 Need Help?

If you encounter any issues:

1. Check the logs: `docker-compose logs app --tail=50`
2. Check database: `docker-compose logs db --tail=20`
3. Verify containers are running: `docker-compose ps`
4. Restart if needed: `docker-compose restart app`

---

**Last Updated:** December 15, 2025
**Status:** Authentication & Logout Fixed ✅ | Dashboards Need Backend Integration ⚠️
