# Permission System Quick Reference Guide

## 🚨 Critical: Mismatches Were Found & Fixed

14 permission mismatches were found between client and server and **all have been fixed**.

---

## Summary of Changes

| Feature | Change | Impact |
|---------|--------|--------|
| **contracts:*** | Role reversal fixed | Procurement managers can now manage contracts |
| **quotations:view** | +accountant | Accountants can now view quotations |
| **warranty:*** | +ict_manager | ICT managers can now manage warranties |
| **assets:*** | +procurement_manager | Procurement managers can now manage assets |
| **delivery_notes:*** | +staff | Staff can now create delivery notes |
| **grn:*** | +staff | Staff can now create GRN entries |

---

## What Was Fixed

### Before Fixes
```
User attempts action:
✅ Frontend permission check PASSES
❌ Backend permission check FAILS
❌ API returns 403 FORBIDDEN
❌ User sees error despite permission in UI
```

### After Fixes
```
User attempts action:
✅ Frontend permission check PASSES
✅ Backend permission check PASSES
✅ API succeeds
✅ User can complete action
```

---

## Test These Scenarios

### ✅ Scenario 1: Accountant Views Quotations
```
1. Login as accountant user
2. Navigate to /quotations
3. Should load page without errors
4. Should see quotation list
5. Check Network tab - should see 200 status
```

### ✅ Scenario 2: ICT Manager Manages Warranties
```
1. Login as ict_manager user
2. Navigate to /warranty-management
3. Should load page without errors
4. Should see warranty list
5. Should be able to create/edit warranties
```

### ✅ Scenario 3: Procurement Manager Manages Assets
```
1. Login as procurement_manager user
2. Navigate to /assets
3. Should load page without errors
4. Should see asset list
5. Should be able to perform CRUD operations
```

### ✅ Scenario 4: Staff Creates Delivery Notes
```
1. Login as staff user
2. Navigate to /delivery-notes
3. Should load page without errors
4. Should be able to create/view notes
```

---

## Key Files

| File | Purpose | Status |
|------|---------|--------|
| `server/middleware/enhancedRbac.ts` | Server permissions (FIXED) | ✅ All 14 fixes applied |
| `client/src/lib/permissions.ts` | Client permissions | ✅ No changes needed |
| `PERMISSION_SYSTEM_AUDIT_REPORT.md` | Detailed audit report | 📋 For reference |
| `PERMISSION_FIXES_COMPLETE.md` | Fix documentation | 📋 Implementation details |

---

## Specific Fixes Applied

### Contract Permissions (CRITICAL)
**File:** `server/middleware/enhancedRbac.ts` lines 525-527

**contracts:view**
- OLD: `["super_admin", "admin", "accountant", "project_manager"]`
- NEW: `["super_admin", "admin", "procurement_manager", "accountant"]` ✅

**contracts:create & contracts:edit**
- OLD: `["super_admin", "admin", "accountant"]`
- NEW: `["super_admin", "admin", "procurement_manager"]` ✅

### Quotations Permissions
**File:** `server/middleware/enhancedRbac.ts` line 487

**quotations:view**
- OLD: `["super_admin", "admin", "procurement_manager"]`
- NEW: `["super_admin", "admin", "procurement_manager", "accountant"]` ✅

### Warranty Permissions
**File:** `server/middleware/enhancedRbac.ts` lines 506-508

All warranty permissions (view, create, edit):
- OLD: `["super_admin", "admin", "procurement_manager"]`
- NEW: `["super_admin", "admin", "ict_manager", "procurement_manager"]` ✅

### Assets Permissions
**File:** `server/middleware/enhancedRbac.ts` lines 512-514

All asset permissions (view, create, edit):
- OLD: `["super_admin", "admin", "ict_manager"]`
- NEW: `["super_admin", "admin", "ict_manager", "procurement_manager"]` ✅

### Delivery Notes Permissions
**File:** `server/middleware/enhancedRbac.ts` lines 494-495

**delivery_notes:view**
- OLD: `["super_admin", "admin", "procurement_manager", "accountant"]`
- NEW: `["super_admin", "admin", "procurement_manager", "accountant", "staff"]` ✅

**delivery_notes:create**
- OLD: `["super_admin", "admin", "procurement_manager"]`
- NEW: `["super_admin", "admin", "procurement_manager", "staff"]` ✅

### GRN Permissions
**File:** `server/middleware/enhancedRbac.ts` lines 500-501

**grn:view**
- OLD: `["super_admin", "admin", "procurement_manager", "accountant"]`
- NEW: `["super_admin", "admin", "procurement_manager", "accountant", "staff"]` ✅

**grn:create**
- OLD: `["super_admin", "admin", "procurement_manager"]`
- NEW: `["super_admin", "admin", "procurement_manager", "staff"]` ✅

---

## Verification Checklist

Before marking as complete in your PR review:

- [ ] Read `PERMISSION_SYSTEM_AUDIT_REPORT.md`
- [ ] Verify changes in `server/middleware/enhancedRbac.ts`
- [ ] Test with accountant user - access /quotations
- [ ] Test with ict_manager user - access /warranty-management
- [ ] Test with procurement_manager - access /assets and /contracts
- [ ] Test with staff user - access /delivery-notes and /grn
- [ ] Check browser Network tab - no 403 errors
- [ ] Confirm all API responses return 200

---

## Quick Comparison: Client vs Server

Use this for spot-checking:

```typescript
// Check these permissions match in both files:
// FILE 1: client/src/lib/permissions.ts
// FILE 2: server/middleware/enhancedRbac.ts

const key_permissions = [
  "contracts:view",      // ✅ Now matches
  "contracts:create",    // ✅ Now matches
  "contracts:edit",      // ✅ Now matches
  "quotations:view",     // ✅ Now matches
  "warranty:view",       // ✅ Now matches
  "warranty:create",     // ✅ Now matches
  "warranty:edit",       // ✅ Now matches
  "assets:view",         // ✅ Now matches
  "assets:create",       // ✅ Now matches
  "assets:edit",         // ✅ Now matches
  "delivery_notes:view", // ✅ Now matches
  "delivery_notes:create", // ✅ Now matches
  "grn:view",            // ✅ Now matches
  "grn:create",          // ✅ Now matches
];
```

---

## Testing Command

```bash
# Verify the fix with the comparison tool
node compare-permissions.js

# Expected output after fixes:
# ✅ All permissions are synchronized!
```

---

## What NOT to Do

❌ Don't edit the client permissions without also editing server  
❌ Don't add new features without ensuring client AND server permissions match  
❌ Don't merge PR with permission changes without testing all affected roles  

---

## Next Steps

1. **Today:** Test scenarios 1-4 above
2. **This week:** Deploy to staging for 24-hour validation
3. **Next milestone:** Implement permission sync tests to prevent regressions
4. **Long-term:** Consolidate permission definitions to single source

---

## Questions?

1. See `PERMISSION_SYSTEM_AUDIT_REPORT.md` for full audit details
2. See `PERMISSION_SYNCHRONIZATION_ANALYSIS.md` for technical analysis
3. See `PERMISSION_FIXES_COMPLETE.md` for implementation details
4. Search for "permission" in documentation files

