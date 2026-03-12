# Client-Side Route Protection Implementation - Priority 2

**Date:** March 6, 2026  
**Status:** 🚀 IN PROGRESS

---

## Implementation Overview

Apply client-side permission checks to 25+ protected pages to prevent unauthorized access and provide better user experience with automatic redirects.

### Three Permission Hooks Available

```typescript
// For feature-based access
const { allowed, isLoading, user } = useRequireFeature("accounting:invoices:view");

// For module-based access
const { allowed, isLoading, user } = useRequireModule("invoices");

// For role-based access
const { allowed, isLoading, user } = useRequireRole(["super_admin", "admin"]);
```

---

## Protected Pages - Implementation Checklist

### Admin Module (3 pages)
- [ ] AdminManagement.tsx → `useRequireRole(["super_admin"])`
- [ ] Settings.tsx → `useRequireFeature("settings:edit")`
- [ ] Users.tsx or Users management → `useRequireFeature("admin:manage_users")`

### Accounting Module (8 pages)
- [ ] Invoices.tsx → `useRequireFeature("accounting:invoices:view")`
- [ ] CreateInvoice.tsx → `useRequireFeature("accounting:invoices:create")`
- [ ] EditInvoice.tsx → `useRequireFeature("accounting:invoices:edit")`
- [ ] Receipts.tsx → `useRequireFeature("accounting:receipts:view")`
- [ ] CreateReceipt.tsx → `useRequireFeature("accounting:receipts:create")`
- [ ] Payments.tsx → `useRequireFeature("accounting:payments:view")`
- [ ] CreatePayment.tsx → `useRequireFeature("accounting:payments:create")`
- [ ] Expenses.tsx → `useRequireFeature("accounting:expenses:view")`

### HR Module (5 pages)
- [ ] Employees.tsx → `useRequireFeature("hr:employees:view")`
- [ ] CreateEmployee.tsx → `useRequireFeature("hr:employees:create")`
- [ ] Payroll.tsx → `useRequireFeature("hr:payroll:view")`
- [ ] Attendance.tsx → `useRequireFeature("hr:attendance")`
- [ ] LeaveManagement.tsx → `useRequireFeature("hr:leave")`

### Projects Module (3 pages)
- [ ] Projects.tsx → `useRequireFeature("projects:view")`
- [ ] CreateProject.tsx → `useRequireFeature("projects:create")`
- [ ] ProjectDetails.tsx → `useRequireFeature("projects:view")`

### Procurement Module (4 pages)
- [ ] LPOs.tsx → `useRequireFeature("procurement:lpo:view")`
- [ ] CreateLPO.tsx → `useRequireFeature("procurement:lpo:create")`
- [ ] Imprests.tsx → `useRequireFeature("procurement:imprest:view")`
- [ ] CreateImprest.tsx → `useRequireFeature("procurement:imprest:create")`

### Sales & Clients (3 pages)
- [ ] Clients.tsx → `useRequireFeature("clients:view")`
- [ ] CreateClient.tsx → `useRequireFeature("clients:create")`
- [ ] Opportunities.tsx → `useRequireFeature("sales:opportunities")`

### Products & Services (3 pages)
- [ ] Products.tsx → `useRequireFeature("products:view")`
- [ ] CreateProduct.tsx → `useRequireFeature("products:create")`
- [ ] Services.tsx → `useRequireFeature("services:view")`

### Reports & Reporting (2 pages)
- [ ] Reports.tsx → `useRequireFeature("reports:view")`
- [ ] FinancialReports.tsx → `useRequireFeature("reports:financial")`

### Tools & Utilities (1 page)
- [ ] Tools.tsx → `useRequireRole(["super_admin", "admin"])`

---

## Implementation Pattern

### Before Protection
```typescript
export default function Invoices() {
  const { data: invoices } = trpc.invoices.list.useQuery();
  
  return (
    <div>
      {/* Page content */}
    </div>
  );
}
```

### After Protection
```typescript
import { useRequireFeature } from "@/lib/permissions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Invoices() {
  const { allowed, isLoading, user } = useRequireFeature("accounting:invoices:view");

  if (isLoading) return <LoadingSpinner />;
  if (!allowed) return null; // Auto-redirects via hook

  const { data: invoices } = trpc.invoices.list.useQuery();
  
  return (
    <div>
      {/* Page content */}
    </div>
  );
}
```

---

## Step-by-Step Implementation

### 1. Import the Hook
```typescript
import { useRequireFeature } from "@/lib/permissions";
```

### 2. Add Hook at Top of Component
```typescript
const { allowed, isLoading } = useRequireFeature("accounting:invoices:view");
```

### 3. Add Loading & Permission Checks
```typescript
if (isLoading) return <LoadingSpinner />;
if (!allowed) return null;
```

### 4. Render Page Content
The rest of your page renders normally.

---

## Available Features Mapping

### Admin
- admin:manage_users
- admin:manage_roles
- admin:settings
- admin:system
- settings:view
- settings:edit
- settings:company
- settings:billing
- settings:integrations
- settings:security
- settings:roles
- settings:audit

### Accounting
- accounting:invoices:view
- accounting:invoices:create
- accounting:invoices:edit
- accounting:invoices:delete
- accounting:invoices:approve
- accounting:receipts:view
- accounting:receipts:create
- accounting:receipts:edit
- accounting:receipts:delete
- accounting:payments:view
- accounting:payments:create
- accounting:payments:edit
- accounting:payments:approve
- accounting:payments:delete
- accounting:expenses:view
- accounting:expenses:create
- accounting:expenses:edit
- accounting:expenses:approve
- accounting:expenses:reject
- accounting:expenses:delete
- accounting:reports:view
- accounting:chart_of_accounts:view
- accounting:reconciliation:view

### HR
- hr:employees:view
- hr:employees:create
- hr:employees:edit
- hr:employees:delete
- hr:departments:view
- hr:departments:create
- hr:departments:edit
- hr:departments:delete
- hr:payroll:view
- hr:payroll:create
- hr:payroll:approve
- hr:leave
- hr:leave:approve
- hr:attendance

### Procurement
- procurement:suppliers:view
- procurement:suppliers:create
- procurement:suppliers:edit
- procurement:suppliers:delete
- procurement:lpo:view
- procurement:lpo:create
- procurement:lpo:edit
- procurement:lpo:delete
- procurement:lpo:approve
- procurement:imprest:view
- procurement:imprest:create
- procurement:imprest:edit
- procurement:imprest:delete
- procurement:imprest:approve
- procurement:orders:view
- procurement:orders:create
- procurement:orders:edit
- procurement:orders:delete

### Sales & Clients
- clients:view
- clients:create
- clients:edit
- clients:delete
- clients:manage_relationships
- sales:view
- sales:create
- sales:edit
- sales:delete
- sales:pipeline
- sales:opportunities
- sales:opportunities:create
- sales:opportunities:edit
- sales:opportunities:delete

### Products & Services
- products:view
- products:create
- products:edit
- products:delete
- products:manage_inventory
- services:view
- services:create
- services:edit
- services:delete

### Projects
- projects:view
- projects:create
- projects:edit
- projects:delete
- projects:manage_team
- projects:manage_milestones
- projects:manage_budget

### Reports
- reports:view
- reports:create
- reports:financial
- reports:sales
- reports:projects
- reports:hr
- reports:procurement
- reports:export

### Tools
- tools:import_export
- tools:data_backup
- tools:system_health
- tools:api_management
- tools:automation
- tools:workflows

### Communications
- communications:view
- communications:send
- communications:email
- communications:notifications
- communications:tickets
- communications:tickets:create
- communications:tickets:resolve

---

## Companion Utilities

### useRequireModule(module: string)
For broader module-level protection instead of specific features:
```typescript
const { allowed, isLoading } = useRequireModule("invoices");
```

### useRequireRole(roles: UserRole[])
For role-specific pages:
```typescript
const { allowed, isLoading } = useRequireRole(["super_admin", "admin"]);
```

---

## Testing Checklist

For each page, verify:
- [ ] Unauthorized users get toast notification
- [ ] Unauthorized users redirected to their dashboard
- [ ] Authorized users can see page
- [ ] Loading spinner shows briefly while checking permission
- [ ] No console errors
- [ ] Page data loads correctly after permission check

---

## Progress Tracking

| Module | Pages | Status |
|--------|-------|--------|
| Admin | 3 | ⏳ Not Started |
| Accounting | 8 | ⏳ Not Started |
| HR | 5 | ⏳ Not Started |
| Projects | 3 | ⏳ Not Started |
| Procurement | 4 | ⏳ Not Started |
| Sales/Clients | 3 | ⏳ Not Started |
| Products/Services | 3 | ⏳ Not Started |
| Reports | 2 | ⏳ Not Started |
| Tools | 1 | ⏳ Not Started |
| **Total** | **32** | **⏳ Not Started** |

---

## Alternative: Direct Module Check

For simpler cases, you can also use the module check:
```typescript
import { useRequireModule } from "@/lib/permissions";

export default function Invoices() {
  const { allowed, isLoading } = useRequireModule("invoices");

  if (isLoading) return <LoadingSpinner />;
  if (!allowed) return null;

  // Rest of component
}
```

---

## Rollback Plan

If any hook causes issues:
1. Remove the hook and its checks
2. The page will still be protected at API level by RBAC
3. API calls will fail with 403 if user is unauthorized
4. Fallback to API-level protection only until client-side issues are resolved

---

## Next Steps

1. ✅ Create hooks (DONE)
2. ⏳ Update 32 pages with permission checks
3. ⏳ Test and verify all protected pages
4. ⏳ Document any special cases or exceptions
5. ⏳ Move to Priority 3 (User Initials + Dashboard Cards)

---

## Documentation References

- [enhancedRbac.ts](./server/middleware/enhancedRbac.ts) - Server-side RBAC config
- [permissions.ts](./client/src/lib/permissions.ts) - Client-side permission utilities (contains hooks)
- [CONTINUATION_GUIDE.md](./CONTINUATION_GUIDE.md) - Complete implementation roadmap
