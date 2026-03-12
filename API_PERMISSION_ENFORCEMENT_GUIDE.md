# API Route Permission Enforcement Implementation Guide

## Overview

This guide provides step-by-step instructions for enforcing permissions at the TRPC API router level using the role-based access control (RBAC) system implemented in `server/middleware/enhancedRbac.ts`.

## Quick Reference

### 1. Import the RBAC Functions

```typescript
import { 
  createRoleRestrictedProcedure, 
  createFeatureRestrictedProcedure 
} from "@/middleware/enhancedRbac";
```

### 2. Create Restricted Procedures

```typescript
// Role-based restriction (accepts multiple roles)
const receiptsProcedure = createRoleRestrictedProcedure(
  ["super_admin", "admin", "accountant"]
);

// Feature-based restriction (more granular)
const receiptsCreateProcedure = createFeatureRestrictedProcedure(
  "accounting:receipts:create"
);
```

### 3. Apply to Router Methods

```typescript
export const receiptsRouter = router({
  list: receiptsProcedure.query(async () => { /* ... */ }),
  create: receiptsCreateProcedure.mutation(async ({ input }) => { /* ... */ }),
  delete: createRoleRestrictedProcedure(["super_admin", "admin"]).mutation(...),
});
```

## Permission Matrix

### Accounting & Finance

| Feature | Roles | Routers |
|---------|-------|---------|
| `accounting:invoices:view` | accountant, admin, super_admin | invoices.list |
| `accounting:invoices:create` | accountant, admin, super_admin | invoices.create |
| `accounting:invoices:approve` | admin, super_admin | invoices.approve |
| `accounting:receipts:view` | accountant, admin, super_admin | receipts.list |
| `accounting:receipts:create` | accountant, admin, super_admin | receipts.create |
| `accounting:payments:view` | accountant, admin, super_admin | payments.list |
| `accounting:payments:create` | accountant, admin, super_admin | payments.create |
| `accounting:payments:approve` | admin, super_admin | payments.approve |
| `accounting:expenses:view` | accountant, admin, super_admin | expenses.list |
| `accounting:expenses:create` | accountant, admin, super_admin | expenses.create |
| `accounting:coa:manage` | admin, super_admin | chartOfAccounts.* |

### Sales & Estimates

| Feature | Roles | Routers |
|---------|-------|---------|
| `sales:estimates:view` | sales_rep, sales_manager, admin, super_admin | estimates.list |
| `sales:estimates:create` | sales_rep, sales_manager, admin, super_admin | estimates.create |
| `sales:estimates:approve` | sales_manager, admin, super_admin | estimates.approve |
| `sales:clients:view` | sales_rep, sales_manager, admin, super_admin | clients.list |
| `sales:clients:manage` | sales_manager, admin, super_admin | clients.create/update |

### HR & Employees

| Feature | Roles | Routers |
|---------|-------|---------|
| `hr:employees:view` | hr_manager, admin, super_admin | employees.list |
| `hr:employees:manage` | hr_manager, admin, super_admin | employees.create/update |
| `hr:payroll:view` | hr_manager, admin, super_admin | payroll.list |
| `hr:payroll:process` | admin, super_admin | payroll.process |
| `hr:leaves:view` | employee, hr_manager, admin, super_admin | leave.list |
| `hr:leaves:approve` | hr_manager, admin, super_admin | leave.approve |
| `hr:attendance:manage` | hr_manager, admin, super_admin | attendance.manage |

### Procurement

| Feature | Roles | Routers |
|---------|-------|---------|
| `procurement:lpo:view` | procurement_officer, admin, super_admin | lpo.list |
| `procurement:lpo:create` | procurement_officer, admin, super_admin | lpo.create |
| `procurement:lpo:approve` | admin, super_admin | lpo.approve |
| `procurement:imprest:view` | employee, procurement_officer, admin, super_admin | imprest.list |
| `procurement:imprest:request` | employee, procurement_officer, admin, super_admin | imprest.create |
| `procurement:imprest:approve` | admin, super_admin | imprest.approve |
| `procurement:imprest:surrender` | employee, procurement_officer, admin, super_admin | imprestSurrender.create |

### Admin & Settings

| Feature | Roles | Routers |
|---------|-------|---------|
| `admin:settings:view` | super_admin, admin | settings.get |
| `admin:settings:manage` | super_admin, admin | settings.update |
| `admin:users:manage` | super_admin, admin | users.create/update |
| `admin:roles:manage` | super_admin | roles.update |
| `admin:permissions:manage` | super_admin | permissions.update |

## Implementation Patterns

### Pattern 1: Basic Role Restriction

Restrict to specific roles only:

```typescript
const accountingProcedure = createRoleRestrictedProcedure([
  "super_admin",
  "admin",
  "accountant"
]);

export const invoicesRouter = router({
  list: accountingProcedure.query(async () => {
    const db = await getDb();
    return db.select().from(invoices);
  }),

  create: accountingProcedure.mutation(async ({ input, ctx }) => {
    const db = await getDb();
    // Create logic here
  }),

  delete: createRoleRestrictedProcedure(["super_admin", "admin"]).mutation(async ({ input }) => {
    // Only super_admin and admin can delete
  }),
});
```

### Pattern 2: Feature-Based Restriction

Restrict to specific features with more granularity:

```typescript
const viewInvoicesProcedure = createFeatureRestrictedProcedure(
  "accounting:invoices:view"
);

const createInvoicesProcedure = createFeatureRestrictedProcedure(
  "accounting:invoices:create"
);

const approveInvoicesProcedure = createFeatureRestrictedProcedure(
  "accounting:invoices:approve"
);

export const invoicesRouter = router({
  list: viewInvoicesProcedure.query(...),
  create: createInvoicesProcedure.mutation(...),
  approve: approveInvoicesProcedure.mutation(...),
});
```

### Pattern 3: Mixed Role & Feature Restriction

Use role restriction for basic access, feature for specific actions:

```typescript
const baseProcedure = createRoleRestrictedProcedure([
  "hr_manager",
  "admin",
  "super_admin"
]);

const approveProcedure = createFeatureRestrictedProcedure(
  "hr:leaves:approve"
);

export const leaveRouter = router({
  list: baseProcedure.query(...),           // Any HR manager can view
  create: baseProcedure.mutation(...),      // Any HR manager can create
  approve: approveProcedure.mutation(...),  // Only approved users can approve
  reject: approveProcedure.mutation(...),
  cancel: baseProcedure.mutation(...),      // Any HR manager can cancel own request
});
```

## Router-by-Router Implementation Checklist

### 1. Invoices Router (`server/routers/invoices.ts`)

```typescript
import { createFeatureRestrictedProcedure, createRoleRestrictedProcedure } from "@/middleware/enhancedRbac";

const viewProcedure = createFeatureRestrictedProcedure("accounting:invoices:view");
const createProcedure = createFeatureRestrictedProcedure("accounting:invoices:create");
const approveProcedure = createFeatureRestrictedProcedure("accounting:invoices:approve");
const deleteProcedure = createRoleRestrictedProcedure(["super_admin", "admin"]);

export const invoicesRouter = router({
  list: viewProcedure.query(...),
  getById: viewProcedure.query(...),
  create: createProcedure.mutation(...),
  update: createProcedure.mutation(...),
  approve: approveProcedure.mutation(...),
  delete: deleteProcedure.mutation(...),
  // ... other procedures
});
```

**Status:** ⏳ Pending

### 2. Receipts Router (`server/routers/receipts.ts`)

```typescript
const viewProcedure = createFeatureRestrictedProcedure("accounting:receipts:view");
const createProcedure = createFeatureRestrictedProcedure("accounting:receipts:create");

export const receiptsRouter = router({
  list: viewProcedure.query(...),
  getById: viewProcedure.query(...),
  create: createProcedure.mutation(...),
  // ... other procedures
});
```

**Status:** ⏳ Pending

### 3. Payments Router (`server/routers/payments.ts`)

```typescript
const viewProcedure = createFeatureRestrictedProcedure("accounting:payments:view");
const createProcedure = createFeatureRestrictedProcedure("accounting:payments:create");
const approveProcedure = createFeatureRestrictedProcedure("accounting:payments:approve");

export const paymentsRouter = router({
  list: viewProcedure.query(...),
  create: createProcedure.mutation(...),
  approve: approveProcedure.mutation(...),
  // ... other procedures
});
```

**Status:** ⏳ Pending

### 4. Expenses Router (`server/routers/expenses.ts`)

```typescript
const viewProcedure = createFeatureRestrictedProcedure("accounting:expenses:view");
const createProcedure = createFeatureRestrictedProcedure("accounting:expenses:create");

export const expensesRouter = router({
  list: viewProcedure.query(...),
  create: createProcedure.mutation(...),
  // ... other procedures
});
```

**Status:** ⏳ Pending

### 5. LPO Router (`server/routers/lpo.ts`)

```typescript
const viewProcedure = createFeatureRestrictedProcedure("procurement:lpo:view");
const createProcedure = createFeatureRestrictedProcedure("procurement:lpo:create");
const approveProcedure = createFeatureRestrictedProcedure("procurement:lpo:approve");

export const lpoRouter = router({
  list: viewProcedure.query(...),
  create: createProcedure.mutation(...),
  approve: approveProcedure.mutation(...),
  // ... other procedures
});
```

**Status:** ⏳ Pending

### 6. Imprest Router (`server/routers/imprest.ts`)

```typescript
const viewProcedure = createFeatureRestrictedProcedure("procurement:imprest:view");
const createProcedure = createFeatureRestrictedProcedure("procurement:imprest:request");
const approveProcedure = createFeatureRestrictedProcedure("procurement:imprest:approve");

export const imprestRouter = router({
  list: viewProcedure.query(...),
  create: createProcedure.mutation(...),
  approve: approveProcedure.mutation(...),
  // ... other procedures
});
```

**Status:** ⏳ Pending

### 7. Users Router (`server/routers/users.ts`)

```typescript
const manageProcedure = createFeatureRestrictedProcedure("admin:users:manage");

export const usersRouter = router({
  list: createRoleRestrictedProcedure(["super_admin", "admin"]).query(...),
  create: manageProcedure.mutation(...),
  update: manageProcedure.mutation(...),
  delete: createRoleRestrictedProcedure(["super_admin"]).mutation(...),
  // ... other procedures
});
```

**Status:** ⏳ Pending

### 8. Settings Router (`server/routers/settings.ts`)

```typescript
const viewProcedure = createFeatureRestrictedProcedure("admin:settings:view");
const manageProcedure = createFeatureRestrictedProcedure("admin:settings:manage");

export const settingsRouter = router({
  get: viewProcedure.query(...),
  update: manageProcedure.mutation(...),
  // ... other procedures
});
```

**Status:** ⏳ Pending

### 9. Employees Router (`server/routers/employees.ts`)

```typescript
const viewProcedure = createFeatureRestrictedProcedure("hr:employees:view");
const manageProcedure = createFeatureRestrictedProcedure("hr:employees:manage");

export const employeesRouter = router({
  list: viewProcedure.query(...),
  getById: viewProcedure.query(...),
  create: manageProcedure.mutation(...),
  update: manageProcedure.mutation(...),
  // ... other procedures
});
```

**Status:** ⏳ Pending

## Error Handling

When a user lacks permission, the middleware will throw a `TRPCError`:

```typescript
{
  code: "UNAUTHORIZED",
  message: "User role 'client' does not have permission to access this resource"
}
```

### Handle on Frontend

```typescript
const createInvoiceMutation = trpc.invoices.create.useMutation({
  onError: (error) => {
    if (error.data?.code === "UNAUTHORIZED") {
      toast.error("You don't have permission to create invoices");
      navigate(getDashboardUrl(user.role));
    } else {
      toast.error(error.message);
    }
  },
});
```

## Testing Permission Enforcement

### Unit Test Example

```typescript
import { createRoleRestrictedProcedure } from "@/middleware/enhancedRbac";

describe("Permission Enforcement", () => {
  it("should deny access to unauthorized roles", async () => {
    const procedure = createRoleRestrictedProcedure(["admin", "accountant"]);
    
    const ctx = {
      user: { role: "client" },  // Unauthorized role
    };
    
    const query = procedure.query(async () => "should not reach here");
    
    // Test that TRPCError is thrown
    await expect(query({ ctx })).rejects.toThrow();
  });

  it("should allow access to authorized roles", async () => {
    const procedure = createRoleRestrictedProcedure(["admin", "accountant"]);
    
    const ctx = {
      user: { role: "accountant" },  // Authorized role
    };
    
    const query = procedure.query(async () => "success");
    
    // Test that procedure executes
    const result = await query({ ctx });
    expect(result).toBe("success");
  });
});
```

## Migration Path (Step by Step)

### Phase 1: Setup (Week 1)
1. Create `server/middleware/enhancedRbac.ts` ✅ DONE
2. Create centralized RBAC utilities
3. Update client-side permissions library ✅ DONE

### Phase 2: Implement Accounting Routers (Week 2)
1. ⏳ Update `invoices.ts`
2. ⏳ Update `receipts.ts`
3. ⏳ Update `payments.ts`
4. ⏳ Update `expenses.ts`

### Phase 3: Implement Procurement Routers (Week 3)
1. ⏳ Update `lpo.ts`
2. ⏳ Update `imprest.ts`
3. ⏳ Update `imprestSurrender.ts`

### Phase 4: Implement Admin Routers (Week 4)
1. ⏳ Update `users.ts`
2. ⏳ Update `settings.ts`
3. ⏳ Update `roles.ts`
4. ⏳ Update `permissions.ts`

### Phase 5: Frontend Protection (Week 5)
1. ⏳ Create route guards
2. ⏳ Apply to protected pages
3. ⏳ Test access control

### Phase 6: Testing & Validation (Week 6)
1. ⏳ Unit tests for permission enforcement
2. ⏳ Integration tests for workflows
3. ⏳ User acceptance testing

## Compliance Checklist

- [ ] All CRUD operations have appropriate role checks
- [ ] Delete operations restricted to admins
- [ ] Approval operations restricted to authorized roles
- [ ] Settings changes restricted to admins
- [ ] User management restricted to super_admin/admin
- [ ] Error messages don't leak sensitive information
- [ ] Audit logs capture permission checks
- [ ] Frontend reflects backend permissions
- [ ] Test coverage > 80% for permission logic

## Related Files

- **RBAC Implementation:** `server/middleware/enhancedRbac.ts`
- **Client Permissions:** `client/src/lib/permissions.ts`
- **Permission Constants:** See `FEATURE_ACCESS` and `MODULE_ACCESS` in permissions.ts
- **Auto-Numbering:** `PROCUREMENT_AUTO_NUMBERING_GUIDE.md`
- **Next Steps:** Route Protection - `create route-guards.tsx`
