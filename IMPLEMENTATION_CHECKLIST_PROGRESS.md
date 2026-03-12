# Permission Enforcement Implementation Checklist

## ✅ Completed Phase 1: Foundation

### Server-Side (RBAC Middleware)
- [x] `server/middleware/enhancedRbac.ts` - Centralized permission factories
- [x] `server/routers/invoices.ts` - Full permission enforcement implemented

### Client-Side (Route Protection)
- [x] `client/src/hooks/useRequireFeature.ts` - Feature permission hook created
- [x] `client/src/components/ProtectedRoute.tsx` - Route protection component (existing)
- [x] `client/src/lib/permissions.ts` - 27+ features mapped to roles

## ⏳ Remaining Implementation (Priority Order)

### Phase 2: Critical Accounting Routers (This Week)

#### 1. Receipts Router
```typescript
// server/routers/receipts.ts
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";

const viewProcedure = createFeatureRestrictedProcedure("accounting:receipts:view");
const createProcedure = createFeatureRestrictedProcedure("accounting:receipts:create");

// Replace: list, getById, byClient → viewProcedure
// Replace: create, update → createProcedure
// Replace: delete → createRoleRestrictedProcedure(["super_admin", "admin"])
```

#### 2. Payments Router
```typescript
// server/routers/payments.ts
const viewProcedure = createFeatureRestrictedProcedure("accounting:payments:view");
const createProcedure = createFeatureRestrictedProcedure("accounting:payments:create");
const approveProcedure = createFeatureRestrictedProcedure("accounting:payments:approve");

// List/view queries → viewProcedure
// Create/update mutations → createProcedure
// Approve mutations → approveProcedure
// Delete mutations → deleteProcedure
```

#### 3. Expenses Router
```typescript
// server/routers/expenses.ts
const viewProcedure = createFeatureRestrictedProcedure("accounting:expenses:view");
const createProcedure = createFeatureRestrictedProcedure("accounting:expenses:create");

// Same pattern as receipts/payments
```

### Phase 3: Procurement Routers (Week 2)

#### 4. LPO Router
```typescript
const viewProcedure = createFeatureRestrictedProcedure("procurement:lpo:view");
const createProcedure = createFeatureRestrictedProcedure("procurement:lpo:create");
const approveProcedure = createFeatureRestrictedProcedure("procurement:lpo:approve");
```

#### 5. Imprest Router
```typescript
const viewProcedure = createFeatureRestrictedProcedure("procurement:imprest:view");
const createProcedure = createFeatureRestrictedProcedure("procurement:imprest:request");
const approveProcedure = createFeatureRestrictedProcedure("procurement:imprest:approve");
```

#### 6. Imprest Surrender Router
```typescript
// Already has auto-numbering, add permissions:
const createProcedure = createFeatureRestrictedProcedure("procurement:imprest:surrender");
```

### Phase 4: Admin/HR Routers (Week 3)

#### 7. Users Router
```typescript
const manageProcedure = createFeatureRestrictedProcedure("admin:users:manage");
```

#### 8. Settings Router
```typescript
const viewProcedure = createFeatureRestrictedProcedure("admin:settings:view");
const manageProcedure = createFeatureRestrictedProcedure("admin:settings:manage");
```

#### 9. Employees Router
```typescript
const viewProcedure = createFeatureRestrictedProcedure("hr:employees:view");
const manageProcedure = createFeatureRestrictedProcedure("hr:employees:manage");
```

## Universal Implementation Pattern

For EVERY router, follow this pattern:

```typescript
// 1. Add imports at top
import { createFeatureRestrictedProcedure, createRoleRestrictedProcedure } from "../middleware/enhancedRbac";

// 2. Define procedure instances BEFORE helper functions
const viewProcedure = createFeatureRestrictedProcedure("module:feature:view");
const createProcedure = createFeatureRestrictedProcedure("module:feature:create");
const approveProcedure = createFeatureRestrictedProcedure("module:feature:approve");
const deleteProcedure = createRoleRestrictedProcedure(["super_admin", "admin"]);

// 3. Replace procedures in router:
// list/getById → viewProcedure.query(...)
// create/update → createProcedure.mutation(...)
// approve/send → approveProcedure.mutation(...)
// delete → deleteProcedure.mutation(...)
```

## Client-Side Page Protection

For EVERY protected page, add at the top:

```typescript
import { useRequireFeature } from "@/hooks/useRequireFeature";

export function AdminManagement() {
  const { allowed } = useRequireFeature("admin:settings:manage");
  
  if (!allowed) return null;  // useRequireFeature handles redirect
  
  return (
    // Page content
  );
}
```

## UI Element Permission Visibility

For conditional feature access within pages:

```typescript
import { useAuth } from "@/hooks/useAuth";
import { canAccessFeature } from "@/lib/permissions";

export function InvoiceTable() {
  const { user } = useAuth();
  
  return (
    <table>
      {canAccessFeature(user?.role || "", "accounting:invoices:approve") && (
        <td>
          <button onClick={handleApprove}>Approve</button>
        </td>
      )}
    </table>
  );
}
```

## Display User Initials in Tables

Apply to ALL document tables (Invoices, Receipts, Payments, Expenses, etc.):

```typescript
import { getInitials } from "@/lib/permissions";

// In column definition:
{
  accessorKey: "createdBy",
  header: "Created By",
  cell: ({ row }) => {
    const initials = getInitials(row.original.createdBy);
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
        {initials}
      </span>
    );
  },
}
```

## Dashboard System Status Cards

In `server/routers/dashboard.ts` or `system.ts`:

```typescript
export const systemRouter = router({
  getSystemStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { status: "offline", metrics: {} };

      try {
        // Count active users
        const userCount = await db.select().from(users);
        
        // Count pending invoices
        const invoiceCount = await db.select().from(invoices)
          .where(eq(invoices.status, "draft"));
        
        // Calculate total outstanding
        const outstanding = await db.selectDistinct()
          .from(invoices)
          .where(ne(invoices.status, "paid"));

        return {
          status: "online",
          metrics: {
            totalUsers: userCount.length,
            pendingInvoices: invoiceCount.length,
            outstandingAmount: outstanding.reduce((sum, inv) => sum + (inv.total || 0), 0),
            lastUpdated: new Date().toISOString(),
          },
        };
      } catch (error) {
        console.error("Status check error:", error);
        return { status: "error", metrics: {} };
      }
    }),
});
```

## Testing Checklist

- [ ] Test with super_admin role - should access everything
- [ ] Test with admin role - should access most features except super_admin-only
- [ ] Test with client role - should access only client portal features
- [ ] Test with staff roles - should only access assigned modules
- [ ] Verify unauthorized access redirects to appropriate dashboard
- [ ] Test with feature access denied - verify toast notification appears
- [ ] Load test with concurrent users accessing different features
- [ ] Verify audit logs capture permission checks

## Quick Reference: Feature Names

```
Accounting
- accounting:invoices:view
- accounting:invoices:create
- accounting:invoices:approve
- accounting:receipts:view/create
- accounting:payments:view/create/approve
- accounting:expenses:view/create
- accounting:coa:manage

HR
- hr:employees:view/manage
- hr:payroll:view/process
- hr:leaves:view/approve
- hr:attendance:manage

Procurement
- procurement:lpo:view/create/approve
- procurement:imprest:view/request/approve/surrender
- procurement:suppliers:view/manage

Sales
- sales:invoices:view/create
- sales:estimates:view/create/approve
- sales:clients:view/manage

Admin
- admin:settings:view/manage
- admin:users:manage
- admin:roles:manage
```

## Estimated Completion Timeline

- **This week:** Receipts, Payments, Expenses routers ✅
- **Next week:** LPO, Imprest routers + client-side pages
- **Week 3:** Users, Settings, Employees routers + initials display
- **Week 4:** Dashboard status cards + comprehensive testing
- **Total:** ~4 weeks to 100% enforcement with proper testing
