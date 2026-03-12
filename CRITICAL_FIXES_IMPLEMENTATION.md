# Critical System Fixes Implementation Guide

## Completed Fixes ✅

### 1. **Receipts 500 Error - Fixed**
- **Issue**: `value.toISOString is not a function` error in receipts.create mutation
- **Root Cause**: Missing `createdAt` timestamp field assignment  
- **Fix Applied**: Added explicit `createdAt` field with MySQL datetime format in [server/routers/receipts.ts](server/routers/receipts.ts#L190)
- **Status**: ✅ Build verified successful

### 2. **Logo Href Role-Based Routing - Fixed**
- **Issue**: Logo always redirected to `/crm/super-admin` regardless of user role
- **Root Cause**: Hardcoded navigation in [client/src/components/DashboardLayout.tsx](client/src/components/DashboardLayout.tsx#L406)
- **Fix Applied**: 
  - Imported `getDashboardUrl` from permissions library
  - Changed `onClick={() => navigate("/")}` → `onClick={() => navigate(getDashboardUrl(user?.role || "staff"))}`
- **Affected Roles**:
  - super_admin → `/crm/super-admin`
  - admin → `/crm/admin`
  - accountant → `/crm/accounting-dashboard`
  - hr → `/crm/hr`
  - project_manager → `/crm/projects-dashboard`
  - staff → `/crm/staff-dashboard`
  - client → `/client-portal`

### 3. **Landing Page Flash Navigation - Fixed**
- **Issue**: Navigation to `/landing` only "flashed" and redirected immediately
- **Root Cause**: Hardcoded redirect to `/crm/super-admin` in [client/src/pages/LandingPage.tsx](client/src/pages/LandingPage.tsx#L36)
- **Fix Applied**:
  - Imported `getDashboardUrl` from permissions
  - Changed `navigate("/crm/super-admin")` → `navigate(getDashboardUrl(user.role || "staff"))`
- **Now**: Authenticated users are redirected to their role-appropriate dashboard, unauthenticated users see landing page

### 4. **Permission System Foundation - Created**
- **New Files**:
  - [server/middleware/enhancedRbac.ts](server/middleware/enhancedRbac.ts) - Server-side permission enforcement
  - [client/src/lib/permissions.ts](client/src/lib/permissions.ts) - Enhanced client-side permission utilities
- **Features**:
  - `FEATURE_ACCESS` - Granular feature-level permissions
  - `ROLE_DASHBOARDS` - Role-based dashboard mapping
  - `ROLE_PERMISSIONS` - Comprehensive permission matrices
  - Helper functions: `canAccessFeature()`, `hasRole()`, `filterNavigationByRole()`
  - Procedure factories: `createRoleRestrictedProcedure()`, `createFeatureRestrictedProcedure()`

## Remaining Critical Issues

### High Priority (Security)

#### 1. **Strict Permission Enforcement on AAPI Routes**
```typescript
// Problem: adminProcedure in server/routers.ts line 83 allows 'staff' to admin operations
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin' && ctx.user.role !== 'staff') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// Solution: Apply role-specific procedures to each router
// Example - Update receipts router:
import { createRoleRestrictedProcedure } from "@/middleware/enhancedRbac";

const receiptsProcedure = createRoleRestrictedProcedure(["super_admin", "admin", "accountant"]);

export const receiptsRouter = router({
  list: receiptsProcedure.query(...),
  create: receiptsProcedure.mutation(...),  
  // etc
});
```

**Action Required**:
- Review all routers (see list below)
- Apply appropriate role restrictions using `createRoleRestrictedProcedure()`
- Test with client accounts to ensure restrictions work

**Routers Needing Permission Review**:
- server/routers/receipts.ts ✅ (will be updated)  
- server/routers/invoices.ts
- server/routers/payments.ts
- server/routers/expenses.ts
- server/routers/employees.ts
- server/routers/payroll.ts
- server/routers/settings.ts
- server/routers/users.ts (must only allow super_admin)
- server/routers/roles.ts (must only allow super_admin)

#### 2. **Client-Side Route Protection**
```typescript
// Problem: Any authenticated user can navigate to restricted routes
// Solution: Create route guards component

// File: client/src/lib/routeGuards.tsx
import { useAuth } from "@/_core/hooks/useAuth";
import { canAccessFeature } from "@/lib/permissions";
import { useLocation } from "wouter";

export function useRequireFeature(feature: string) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  useEffect(() => {
    if (user && !canAccessFeature(user.role, feature)) {
      toast.error(`Access denied: ${feature}`);
      navigate(getDashboardUrl(user.role));
    }
  }, [user, feature, navigate]);
}

// Usage in protected pages:
export default function AdminPage() {
  useRequireFeature("admin:manage_users");
  // ... render page
}
```

#### 3. **Organization-Scoped Access Control** 
```typescript
// Problem: Client portal users might access other orgs' data
// Solution: Add org-scope check to procedures

import { checkOrgScopeAccess } from "@/middleware/enhancedRbac";

const clientsProcedure = createOrgScopedProcedure().use(({ ctx, input, next }) => {
  if (!checkOrgScopeAccess(ctx, input.organizationId)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You only have access to your organization's data"
    });
  }
  return next({ ctx });
});
```

---

### Medium Priority (UX/Features)

#### 4. **Initials Display for Approvals**
```typescript
// Problem: Approvals show full names instead of initials (e.g., "Eliakim Mwaniki" should be "ELMW")

// Solution: Update approval columns to use getInitials() from permissions.ts

import { getInitials } from "@/lib/permissions";

// In table columns:
{
  accessorKey: "createdBy",
  header: "Created By",
  cell: ({ row }) => {
    const createdBy = row.original.createdBy;
    return getInitials(createdBy); // Produces "ELMW"
  }
}

{
  accessorKey: "approvedBy",
  header: "Approved By",
  cell: ({ row }) => {
    const approvedBy = row.original.approvedBy;
    return getInitials(approvedBy);
  }
}

{
  accessorKey: "raisedBy", 
  header: "Raised By",
  cell: ({ row }) => {
    const raisedBy = row.original.raisedBy;
    return getInitials(raisedBy);
  }
}
```

**Files to Update**:
- Invoices table (client/src/pages/Invoices.tsx)
- Estimates table (client/src/pages/Estimates.tsx)
- Payments table (client/src/pages/Payments.tsx)
- Expenses table (client/src/pages/Expenses.tsx)
- Payroll table (client/src/pages/Payroll.tsx)
- Receipts table (client/src/pages/Receipts.tsx)
- Budgets table (client/src/pages/Budgets.tsx)
- Projects table (client/src/pages/Projects.tsx)

#### 5. **Service Create/Edit Mutation Unification**
```typescript
// Problem: Create service doesn't have hourly rate field but Edit does

// Solution: Ensure both use same schema:

export const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  category: z.enum([...CATEGORIES]),
  description: z.string().optional(),
  hourlyRate: z.number().optional(), // ← ADD TO CREATE
  fixedPrice: z.number().optional(),
  taxRate: z.number().optional(),
  unit: z.string().optional(),
  minimumHours: z.number().optional(),
  notes: z.string().optional(),
});

// Create mutation
export const create = createProcedure
  .input(serviceSchema.omit({ id: true }))
  .mutation(({ input, ctx }) => {...});

// Edit mutation  
export const update = createProcedure
  .input(serviceSchema)
  .mutation(({ input, ctx }) => {...});
```

#### 6. **Service Category Dropdown Persistence Bug**
```typescript
// Problem: First selected category persists, blocking other categories

// File: client/src/pages/CreateService.tsx (or EditService.tsx)
// Issue is likely in form state management - category isn't being reset

// Solution: Ensure dropdown state is properly managed
const [formData, setFormData] = useState({
  category: "", // ← Should be empty by default
  // ... other fields
});

const handleCategoryChange = (category: string) => {
  setFormData(prev => ({
    ...prev,
    category, // ← Properly update category
  }));
  // Force dropdown to update
  setShowCategoryDropdown(false);
  // Don't disable other categories
};
```

#### 7. **Dashboard System Status Cards**
```typescript
// Problem: Cards show static text instead of real health stats

// Solution: Create TRPC procedure to gather system health

export const systemRouter = router({
  getSystemStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    
    // Count records
    const invoiceCount = await db.select({ count: sql`COUNT(*)` }).from(invoices);
    const paymentCount = await db.select({ count: sql`COUNT(*)` }).from(payments);
    const employeeCount = await db.select({ count: sql`COUNT(*)` }).from(employees);
    const userCount = await db.select({ count: sql`COUNT(*)` }).from(users);
    
    // Calculate metrics
    const overdue = await db.select().from(invoices).where(sql`dueDate < NOW() AND status != 'paid'`);
    const pendingApprovals = await db.select().from(approvals).where(eq(approvals.status, 'pending'));
    
    return {
      status: "healthy",
      uptime: process.uptime(),
      totalUsers: userCount[0]?.count || 0,
      totalInvoices: invoiceCount[0]?.count || 0,
      totalPayments: paymentCount[0]?.count || 0,
      totalEmployees: employeeCount[0]?.count || 0,
      overdueInvoices: overdue.length,
      pendingApprovals: pendingApprovals.length,
      databaseStatus: "connected",
      timestamp: new Date(),
    };
  }),
});

// Use in dashboard:
const { data: systemStatus } = trpc.system.getSystemStatus.useQuery();

<Card>
  <CardContent>
    <div className="text-2xl font-bold">{systemStatus?.totalUsers || 0}</div>
    <p className="text-sm text-gray-500">Active Users</p>
  </CardContent>
</Card>
```

---

### Low Priority (UI Polish)

#### 8. **Client Portal Module Layout Wrapper Issue**
- **Issue**: Module layout in `/crm/client-portal` is "scrambled"
- **Investigation Needed**:
  - Check [client/src/pages/ClientPortal.tsx](client/src/pages/ClientPortal.tsx)
  - Verify ModuleLayout styling/structure in client portal context
  - Compare with working module layouts in other sections

#### 9. **Navigation Menu Filtering by Role**
- **Current State**: Client-side filtering partially implemented via `roles` prop
- **Issue**: Menu items should be filtered before rendering
- **Fix**: Apply `filterNavigationByRole()` to navigation items in DashboardLayout:

```typescript
const filteredNavigation = filterNavigationByRole(
  getNavigation(user?.role),
  user?.role || "staff"
);

// Then render:
<nav>{filteredNavigation.map(item => renderNavItem(item))}</nav>
```

---

## Testing Checklist

### Permission System Tests
- [ ] Super admin can access all admin features
- [ ] Admin can access most features except user/role management
- [ ] Accountant can only access accounting features
- [ ] HR can only access HR features
- [ ] Client cannot access any admin/HR/accounting features
- [ ] Staff cannot modify settings/system
- [ ] Attempting unauthorized access gives proper error message

### Navigation Tests
- [ ] Logo click redirects to correct role dashboard
- [ ] Landing page doesn't flash for authenticated users
- [ ] Menu items are properly filtered per role
- [ ] Back button works consistently across all modules

### Data Display Tests
- [ ] Approver names show as initials ("ELMW" not "Eliakim Mwaniki")
- [ ] Created by/Approved by/Raised by columns visible on all document tables
- [ ] System status cards show real numbers not placeholders

---

## Next Steps

1. **Immediate** (Session priority):
   - Apply role-specific procedures to critical routers (receipts, invoices, payments)
   - Implement route guards in protected pages
   - Run permission tests

2. **Short-term** (Next session):
   - Update all document table columns with initials display
   - Unify service create/edit schemas
   - Fix category dropdown persistence bug
   - Implement system status TRPC procedures

3. **Medium-term** (Within week):
   - Complete org-scope access control rollout
   - Audit client portal access controls
   - Fix client portal layout issues

---

## Permission Matrix Reference

See [FEATURE_ACCESS](client/src/lib/permissions.ts#L27) for complete feature-permission mappings.

### Quick Reference
```
super_admin  → Full access to everything
admin        → Everything except user/role management  
accountant   → Accounting module only
hr           → HR module only
project_manager → Projects, clients view, limited accounting
staff        → View own projects, limited access
client       → Client portal only (org-scoped)
```
