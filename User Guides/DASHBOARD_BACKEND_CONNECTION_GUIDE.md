# Dashboard Backend Connection Guide

## 📊 Current Status

### ✅ Backend APIs - READY
All backend routers are implemented and working:
- Dashboard metrics endpoints
- User management
- Client management
- Project management
- Financial management
- HR management
- And more...

### ⚠️ Frontend Dashboards - NEEDS CONNECTION
The dashboard components currently display mock/static data. They need to be connected to the backend APIs.

---

## 🔌 How to Connect Dashboards to Backend

### Step 1: Import tRPC Client

At the top of your dashboard component:

```typescript
import { trpc } from "@/lib/trpc";
```

### Step 2: Use tRPC Queries

Replace mock data with real API calls:

```typescript
// OLD (mock data):
const totalProjects = 42;
const activeClients = 18;

// NEW (real data):
const { data: metrics, isLoading } = trpc.dashboard.metrics.useQuery();
const totalProjects = metrics?.totalProjects || 0;
const activeClients = metrics?.activeClients || 0;
```

---

## 📝 Example: Admin Dashboard

### Before (Mock Data)

```typescript
export default function AdminDashboard() {
  const { user } = useAuthWithPersistence();
  
  // Mock data
  const stats = {
    totalUsers: 150,
    activeProjects: 42,
    totalRevenue: 125000,
  };

  return (
    <DashboardLayout>
      <StatCard title="Total Users" value={stats.totalUsers} />
      <StatCard title="Active Projects" value={stats.activeProjects} />
      <StatCard title="Revenue" value={stats.totalRevenue} />
    </DashboardLayout>
  );
}
```

### After (Real Data)

```typescript
import { trpc } from "@/lib/trpc";

export default function AdminDashboard() {
  const { user } = useAuthWithPersistence();
  
  // Fetch real data from backend
  const { data: metrics, isLoading, error } = trpc.dashboard.metrics.useQuery();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorMessage error={error.message} />;
  }

  return (
    <DashboardLayout>
      <StatCard title="Total Users" value={metrics?.totalEmployees || 0} />
      <StatCard title="Active Projects" value={metrics?.totalProjects || 0} />
      <StatCard title="Revenue" value={metrics?.monthlyRevenue || 0} />
    </DashboardLayout>
  );
}
```

---

## 🎯 Dashboard-Specific Connections

### 1. Admin Dashboard

**File:** `client/src/pages/dashboards/AdminDashboard.tsx`

**Available Endpoints:**
```typescript
// System metrics
const { data: metrics } = trpc.dashboard.metrics.useQuery();

// User management
const { data: users } = trpc.users.list.useQuery();

// All other endpoints available
```

**What to Display:**
- Total users/employees
- Active projects
- System health
- Recent activities
- User management interface

---

### 2. Accountant Dashboard

**File:** `client/src/pages/dashboards/AccountantDashboard.tsx`

**Available Endpoints:**
```typescript
// Accounting metrics
const { data: metrics } = trpc.dashboard.accountingMetrics.useQuery();

// Invoices
const { data: invoices } = trpc.invoices.list.useQuery();

// Payments
const { data: payments } = trpc.payments.list.useQuery();

// Expenses
const { data: expenses } = trpc.expenses.list.useQuery();
```

**What to Display:**
- Total revenue
- Pending invoices
- Recent payments
- Expense tracking
- Financial charts

---

### 3. HR Dashboard

**File:** `client/src/pages/dashboards/HRDashboard.tsx`

**Available Endpoints:**
```typescript
// HR metrics
const { data: metrics } = trpc.dashboard.hrMetrics.useQuery();

// Employees
const { data: employees } = trpc.employees.list.useQuery();

// Attendance
const { data: attendance } = trpc.attendance.list.useQuery();

// Leave requests
const { data: leaves } = trpc.leave.list.useQuery();

// Payroll
const { data: payroll } = trpc.payroll.list.useQuery();
```

**What to Display:**
- Total employees
- Attendance statistics
- Leave requests
- Payroll summary
- Employee directory

---

### 4. Staff Dashboard

**File:** `client/src/pages/dashboards/StaffDashboard.tsx`

**Available Endpoints:**
```typescript
// User's projects
const { data: projects } = trpc.projects.list.useQuery({
  assignedTo: user?.id
});

// User's attendance
const { data: attendance } = trpc.attendance.list.useQuery({
  employeeId: user?.id
});

// User's leave
const { data: leaves } = trpc.leave.list.useQuery({
  employeeId: user?.id
});
```

**What to Display:**
- Assigned projects
- Personal attendance
- Leave balance
- Timesheets
- Tasks

---

### 5. Client Portal

**File:** `client/src/pages/ClientPortal.tsx`

**Available Endpoints:**
```typescript
// Client's projects
const { data: projects } = trpc.projects.list.useQuery({
  clientId: user?.clientId
});

// Client's invoices
const { data: invoices } = trpc.invoices.list.useQuery({
  clientId: user?.clientId
});

// Client's payments
const { data: payments } = trpc.payments.list.useQuery({
  clientId: user?.clientId
});
```

**What to Display:**
- Active projects
- Invoices
- Payment history
- Support tickets
- Documents

---

## 🛠️ Common Patterns

### Loading States

```typescript
const { data, isLoading, error } = trpc.dashboard.metrics.useQuery();

if (isLoading) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

if (error) {
  return (
    <div className="p-4 bg-red-50 text-red-600 rounded-lg">
      Error: {error.message}
    </div>
  );
}
```

### Mutations (Create/Update/Delete)

```typescript
const createProject = trpc.projects.create.useMutation({
  onSuccess: () => {
    // Refresh the list
    utils.projects.list.invalidate();
    toast.success("Project created!");
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

const handleSubmit = (data) => {
  createProject.mutate(data);
};
```

### Refetching Data

```typescript
const utils = trpc.useUtils();

// Refetch specific query
utils.dashboard.metrics.invalidate();

// Refetch all queries
utils.invalidate();
```

---

## 📦 Available Backend Routers

All routers are in `/server/routers/`:

| Router | File | Purpose |
|--------|------|---------|
| `auth` | `auth.ts` | Authentication & user sessions |
| `dashboard` | `dashboard.ts` | Dashboard metrics |
| `users` | `users.ts` | User management |
| `clients` | `clients.ts` | Client management |
| `projects` | `projects.ts` | Project management |
| `invoices` | `invoices.ts` | Invoice management |
| `payments` | `payments.ts` | Payment processing |
| `expenses` | `expenses.ts` | Expense tracking |
| `employees` | `employees.ts` | Employee management |
| `attendance` | `attendance.ts` | Attendance tracking |
| `leave` | `leave.ts` | Leave management |
| `payroll` | `payroll.ts` | Payroll processing |
| `departments` | `departments.ts` | Department management |
| `products` | `products.ts` | Product catalog |
| `services` | `services.ts` | Service catalog |
| `opportunities` | `opportunities.ts` | Sales opportunities |
| `estimates` | `estimates.ts` | Estimate/quote management |
| `chartOfAccounts` | `chartOfAccounts.ts` | Accounting chart |
| `settings` | `settings.ts` | System settings |
| `savedFilters` | `savedFilters.ts` | User-saved filters |

---

## 🔍 How to Explore Available Endpoints

### Method 1: Check Router Files

Open any router file in `/server/routers/` to see available procedures:

```typescript
// Example from dashboard.ts
export const dashboardRouter = router({
  metrics: protectedProcedure.query(async ({ ctx }) => { ... }),
  accountingMetrics: protectedProcedure.query(async ({ ctx }) => { ... }),
  hrMetrics: protectedProcedure.query(async ({ ctx }) => { ... }),
});
```

### Method 2: TypeScript Autocomplete

In your component, type `trpc.` and let TypeScript show you all available routers:

```typescript
trpc. // <-- TypeScript will show: auth, dashboard, users, clients, etc.
trpc.dashboard. // <-- TypeScript will show: metrics, accountingMetrics, hrMetrics
```

### Method 3: Check Main Router

Open `/server/routes.ts` to see how all routers are combined:

```typescript
export const appRouter = router({
  auth: authRouter,
  dashboard: dashboardRouter,
  users: usersRouter,
  // ... etc
});
```

---

## ✅ Testing Your Connections

### 1. Check Network Tab

Open browser DevTools → Network tab → Filter by "trpc"

You should see requests like:
- `GET /api/trpc/dashboard.metrics`
- `GET /api/trpc/users.list`
- etc.

### 2. Check Console

Add logging to see the data:

```typescript
const { data } = trpc.dashboard.metrics.useQuery();

useEffect(() => {
  console.log("Dashboard metrics:", data);
}, [data]);
```

### 3. Check Backend Logs

```bash
docker-compose logs app --follow
```

Look for tRPC query logs.

---

## 🚀 Quick Start Checklist

For each dashboard:

- [ ] Import `trpc` from `@/lib/trpc`
- [ ] Replace mock data with `trpc.*.useQuery()`
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test with real data
- [ ] Add mutations for create/update/delete
- [ ] Add refetch on success
- [ ] Test all user interactions

---

## 💡 Pro Tips

1. **Use React Query DevTools** to debug queries:
   ```typescript
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
   ```

2. **Batch requests** when fetching multiple things:
   ```typescript
   const [metrics, users, projects] = trpc.useQueries((t) => [
     t.dashboard.metrics(),
     t.users.list(),
     t.projects.list(),
   ]);
   ```

3. **Optimistic updates** for better UX:
   ```typescript
   const utils = trpc.useUtils();
   
   const updateProject = trpc.projects.update.useMutation({
     onMutate: async (newData) => {
       // Cancel outgoing refetches
       await utils.projects.list.cancel();
       
       // Snapshot previous value
       const previous = utils.projects.list.getData();
       
       // Optimistically update
       utils.projects.list.setData(undefined, (old) => ({
         ...old,
         ...newData,
       }));
       
       return { previous };
     },
     onError: (err, newData, context) => {
       // Rollback on error
       utils.projects.list.setData(undefined, context.previous);
     },
   });
   ```

---

**Last Updated:** December 15, 2025
**Status:** Backend Ready ✅ | Frontend Needs Connection ⚠️
