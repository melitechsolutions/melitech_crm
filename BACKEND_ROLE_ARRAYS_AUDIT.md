# Backend Hardcoded Role Arrays Audit Report

## Overview
This document identifies **hardcoded role array patterns** found throughout the backend routers that should be consolidated into the centralized RBAC middleware (`server/middleware/enhancedRbac.ts`).

## Issue Summary
Multiple backend routers contain hardcoded role checks using array literals like `["super_admin", "admin"]` instead of leveraging the centralized `FEATURE_ACCESS` permission system and `createFeatureRestrictedProcedure()` pattern.

**Impact:** 
- Inconsistent permission checking across endpoints
- Difficult to maintain and audit permissions
- Role changes require updates in multiple files
- No single source of truth for permissions

---

## Hardcoded Role Patterns Found

### Pattern 1: Array-based Role Checks
```typescript
// ANTI-PATTERN: Hardcoded arrays
const canApprove = ["super_admin", "admin", "accountant", "hr"].includes(ctx.user.role);
```

**Files Found:**
- `server/routers/approvals.ts` (lines 812, 846) - Multiple instances
- `server/routers/expenses.ts` (line 19) - Uses `createRoleRestrictedProcedure(["super_admin", "admin"])`
- `server/routers/imprest.ts` (line 14)
- `server/routers/invoices.ts` (line 17)
- `server/routers/lpo.ts` (line 14)
- `server/routers/payments.ts` (line 18)
- `server/routers/receipts.ts` (line 13)

### Pattern 2: Conditional Role Comparisons
```typescript
// ANTI-PATTERN: Manual role comparisons
if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
  throw new Error("Unauthorized: Only admins can modify brand settings");
}
```

**Files Found:**
- `server/routers/brandCustomization.ts` (lines 92, 157) - 2 instances
- `server/routers/clientScoring.ts` (line 307)
- `server/routers/emailQueue.ts` (lines 195, 209)
- `server/routers/importExport.ts` (lines 839, 952)
- `server/routers/paymentReminders.ts` (line 395)
- `server/routers/permissions.ts` (lines 191, 247, 331, 378)
- `server/routers/projectAnalytics.ts` (line 309)
- `server/routers/staffChat.ts` (lines 99, 182)

### Pattern 3: Role Inclusion Checks for Multiple Roles
```typescript
// ANTI-PATTERN: Arrays for specific operations
if (!["admin", "finance", "procurement"].includes(ctx.user?.role || "")) {
  throw new Error("Unauthorized: Admin or Procurement role required");
}
```

**Files Found:**
- `server/routers/suppliers.ts` (lines 156, 229, 284)
- `server/routers/professionalBudgeting.ts` (line 323) - `['admin', 'manager']`

### Pattern 4: Role-Based Data Filtering (Navigation Items)
```typescript
// In DashboardLayout.tsx - Can be acceptable as it's frontend UI filtering
roles: ["super_admin", "admin"]
children: [...]
```

**Files Found:**
- `client/src/components/DashboardLayout.tsx` (navigation items filtering)
- `server/routers/roles.ts` (line 98)

---

## Recommendations for Refactoring

### Priority 1: Critical (Affects Admin/Super Admin Operations)
These control access to sensitive operations and should be migrated to FEATURE_ACCESS immediately:

1. **importExport.ts** (lines 839, 952)
   - Affects: Backup creation and restoration
   - Current: `ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin'`
   - Should use: `"import:create"` and `"import:restore"` (already defined in enhancedRbac.ts)

2. **permissions.ts** (lines 191, 247, 331, 378)
   - Affects: Permission viewing and management (super_admin only)
   - Current: `ctx.user.role !== "super_admin"`
   - Should use: New permission `"permissions:manage"` → `["super_admin"]`

3. **brandCustomization.ts** (lines 92, 157)
   - Affects: Brand settings modification
   - Current: `ctx.user.role !== "admin" && ctx.user.role !== "super_admin"`
   - Should use: New permission `"brand:customize"` → `["super_admin", "admin"]`

### Priority 2: High (Financial/HR Operations)
1. **approvals.ts** (lines 812, 846)
   - Affects: Approval workflows
   - Current: `["super_admin", "admin", "accountant", "hr"]`
   - Should use: `"approvals:approve"` (already defined in enhancedRbac.ts)

2. **expenses.ts**, **invoices.ts**, **payments.ts**, **receipts.ts**, **imprest.ts**, **lpo.ts**
   - All use: `createRoleRestrictedProcedure(["super_admin", "admin"])`
   - Should consolidate role definitions

3. **suppliers.ts** (lines 156, 229, 284)
   - Affects: Supplier management and finance operations
   - Current: Multiple role arrays `["admin", "finance", "procurement"]`
   - Should use: Consolidated procurement permissions

### Priority 3: Medium (Support Operations)
1. **staffChat.ts** (lines 99, 182)
   - Affects: Chat history management
   - Current: `ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin'`
   - Should use: New permission `"chat:manage"` → `["super_admin", "admin"]`

2. **emailQueue.ts** (lines 195, 209)
   - Affects: Email processing queue
   - Current: `ctx.user?.role !== "admin"` and `ctx.user?.role !== "system"`
   - Should use: New permission `"email:queue"` → `["super_admin", "admin", "system"]`

3. **paymentReminders.ts** (line 395)
   - Affects: Payment reminder triggers
   - Current: `ctx.user?.role !== "admin" && ctx.user?.role !== "system"`
   - Should use: New permission `"payments:remind"` → `["super_admin", "admin", "system"]`

### Priority 4: Lower (Analytics/Project Operations)
1. **projectAnalytics.ts** (line 309)
   - Current: `ctx.user?.role !== 'admin'`
   - Should use: `"analytics:view"` → `["super_admin", "admin"]`

2. **profess ionalBudgeting.ts** (line 323)
   - Current: `ctx.user.role !== 'admin' && ctx.user.role !== 'manager'`
   - Should use: `"budgets:approve"` → `["super_admin", "admin", "manager"]`

3. **clientScoring.ts** (line 307)
   - Current: `ctx.user?.role !== 'admin'`
   - Should use: `"clients:score"` → `["super_admin", "admin"]`

---

## Current FEATURE_ACCESS Definitions (Already Defined in enhancedRbac.ts)

These permissions are already defined and ready to use:
- ✅ `"import:create"` → `["super_admin", "admin"]`
- ✅ `"import:restore"` → `["super_admin", "admin"]`
- ✅ `"users:edit"` → `["super_admin", "admin"]`
- ✅ `"users:view"` → `["super_admin", "admin"]`
- ✅ `"approvals:read"`, `"approvals:approve"`, `"approvals:reject"`, `"approvals:delete"`
- ✅ `"accounting:*"` (accounting:read, accounting:create, accounting:edit, accounting:delete)
- ✅ `"attendance:*"` (attendance:read, attendance:create, attendance:edit, attendance:delete)

---

## Refactoring Template

### Before (Antipattern):
```typescript
export const myRouter = router({
  sensitiveOperation: publicProcedure
    .input(z.object({}))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new Error("Unauthorized");
      }
      // Operation logic...
    }),
});
```

### After (Best Practice):
```typescript
// Import the feature-restricted procedure creator
import { createFeatureRestrictedProcedure } from "@/middleware/enhancedRbac";

export const myRouter = router({
  sensitiveOperation: createFeatureRestrictedProcedure("brand:customize")
    .input(z.object({}))
    .mutation(async ({ ctx, input }) => {
      // Permission is already checked by middleware
      // Operation logic...
    }),
});
```

---

## Files Requiring Updates (Summary)

**Essential (Affects Admin Dashboard Functionality):**
1. `server/routers/importExport.ts` - Uses old role checks
2. `server/routers/permissions.ts` - Uses old `super_admin` checks
3. `server/routers/approvals.ts` - Multiple hardcoded arrays

**Important (Financial/HR Operations):**
4. `server/routers/brandCustomization.ts`
5. `server/routers/suppliers.ts`
6. `server/routers/staffChat.ts`
7. `server/routers/emailQueue.ts`

**Moderate:**
8. `server/routers/paymentReminders.ts`
9. `server/routers/projectAnalytics.ts`
10. `server/routers/professionalBudgeting.ts`
11. `server/routers/clientScoring.ts`

**Note:** The `createRoleRestrictedProcedure` pattern (used in expenses, invoices, payments, etc.) is acceptable but these should align with the FEATURE_ACCESS definitions.

---

## Next Steps

1. ✅ **COMPLETED:** Added new permissions to `enhancedRbac.ts` for:
   - `users:edit`, `users:view`, `users:create`, `users:delete`
   - `import:create`, `import:restore`, `export:create`
   - Full accounting, attendance, approvals permission families

2. ⏳ **TODO:** Migrate critical files to use `createFeatureRestrictedProcedure("permission:name")`

3. ⏳ **TODO:** Add missing permission definitions for:
   - `"brand:customize"`
   - `"permissions:manage"`
   - `"chat:manage"`
   - `"email:queue"`
   - `"payments:remind"`
   - `"analytics:view"`
   - `"budgets:approve"`
   - `"clients:score"`

4. ⏳ **TODO:** Audit all 11 files and perform refactoring

---

## Reference
- Enhanced RBAC Middleware: `server/middleware/enhancedRbac.ts`
- Frontend Permission Hook: `client/lib/permissions.ts`
- Current Session: Fixed React hook violations and added initial RBAC permissions
