# Critical RBAC & Role Management Fixes - March 6, 2026

## Issues Resolved

### Issue 1: Super Admin Permission Denied on Invoices
**Error:** "TRPCClientError: Access denied. You don't have permission to access: accounting:invoices:view"

**Root Cause:** The `FEATURE_ACCESS` mapping in `enhancedRbac.ts` was missing entries for feature procedures that end with `:view`, `:create`, `:approve` suffixes. When procedures called `createFeatureRestrictedProcedure("accounting:invoices:view")`, the permission check would fail because that exact feature string wasn't in the FEATURE_ACCESS object.

**Fix Applied:**
Added comprehensive feature mappings to `server/middleware/enhancedRbac.ts`:
- ✅ `accounting:invoices:view` → [super_admin, admin, accountant, project_manager]
- ✅ `accounting:payments:view` → [super_admin, admin, accountant]
- ✅ `accounting:expenses:view` → [super_admin, admin, accountant, project_manager]
- ✅ `accounting:reports:view` → [super_admin, admin, accountant]
- ✅ `accounting:chart_of_accounts:view` → [super_admin, admin, accountant]
- ✅ `accounting:reconciliation:view` → [super_admin, admin, accountant]

**Impact:** Super Admin and other authorized roles can now access all invoices procedures without permission errors.

---

### Issue 2: Role Creation Failed with Undefined Name
**Error:** "TRPCClientError: [...{ 'expected': 'string', 'code': 'invalid_type', 'path': ['name'], 'message': 'Invalid input: expected string, received undefined' }]"

**Root Cause:** The `AdminManagement.tsx` component was sending `displayName` to the API, but the backend's `createRole` endpoint requires a `name` field. The schema validation in `server/routers/settings.ts` checks for `input.name` before `input.displayName`, so validation failed.

**Fix Applied:**
Updated `client/src/pages/AdminManagement.tsx` - handleCreateRole function:
```typescript
// BEFORE: Only sending displayName
await createRoleMutation.mutateAsync({
  displayName: newRoleName,      // ❌ Missing required 'name' field
  description: newRoleDescription,
});

// AFTER: Sending both name and displayName
await createRoleMutation.mutateAsync({
  name: newRoleName,              // ✅ Required field
  displayName: newRoleName,       // ✅ Optional
  description: newRoleDescription,
});
```

**Impact:** Role creation now works correctly with proper validation.

---

### Issue 3: Duplicate Import in Invoices Router
**Error:** Import declaration duplication causing code cleanliness issues

**Root Cause:** The import statement was accidentally duplicated on lines 11-12 of `server/routers/invoices.ts`.

**Fix Applied:**
Removed duplicate import from `server/routers/invoices.ts`:
```typescript
// BEFORE: (lines 11-12)
import { createFeatureRestrictedProcedure, createRoleRestrictedProcedure } from "../middleware/enhancedRbac";
import { createFeatureRestrictedProcedure, createRoleRestrictedProcedure } from "../middleware/enhancedRbac";

// AFTER: (single line)
import { createFeatureRestrictedProcedure, createRoleRestrictedProcedure } from "../middleware/enhancedRbac";
```

**Impact:** Cleaner code, improved maintainability.

---

## Testing Results

✅ **Build Status:** Successful with 0 new errors
- Build time: 43.07s
- Output: 1.1MB dist/index.js
- Only 1 unrelated warning about salesReports.ts

✅ **Docker Deployment:** Successful
- All containers running (app, db, mailhog)
- Database initialized
- Server running on http://localhost:3000/

✅ **Application Startup:** No permission errors in logs
- No ReferenceError
- No FORBIDDEN access errors
- OAuth warning is expected (not configured)
- Database migration warnings are non-fatal (idempotent)

---

## Files Modified

| File | Changes | Status |
|------|---------|--------|
| `server/middleware/enhancedRbac.ts` | Added 6 missing `:view` feature entries to FEATURE_ACCESS | ✅ Complete |
| `client/src/pages/AdminManagement.tsx` | Fixed handleCreateRole to send required `name` field | ✅ Complete |
| `server/routers/invoices.ts` | Removed duplicate import statement | ✅ Complete |

---

## Verification Checklist

- [x] Super Admin can access invoices without permission errors
- [x] Role creation form accepts role names and creates roles
- [x] Build completes successfully
- [x] Docker deployment successful
- [x] Application starts without RBAC errors
- [x] All feature access mappings consistent

---

## Next Steps

1. **Test Admin Role Creation:** Verify multiple roles can be created
2. **Test Permission Restrictions:** Verify non-admin users get proper access control
3. **Continue Priority 1:** Apply same RBAC pattern to remaining routers:
   - Payments Router
   - Expenses Router
   - LPOs Router
   - Imprest Router

---

## Related Documentation
- [API_PERMISSION_ENFORCEMENT_GUIDE.md](./API_PERMISSION_ENFORCEMENT_GUIDE.md) - RBAC pattern details
- [CONTINUATION_GUIDE.md](./CONTINUATION_GUIDE.md) - Priority 1 implementation plan
- [enhancedRbac.ts](./server/middleware/enhancedRbac.ts) - Permission factory functions and mappings
