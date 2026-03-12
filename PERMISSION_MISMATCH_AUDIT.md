# Permission Mismatch Audit Report

## Overview
This report documents mismatches between client-side permissions (in `client/src/lib/permissions.ts`) and server-side permissions (in `server/middleware/enhancedRbac.ts`).

## Critical Issues Found

### 1. **quotations:view** - Missing accountant role on server
**Client:** `["super_admin", "admin", "procurement_manager", "accountant"]`
**Server:** `["super_admin", "admin", "procurement_manager"]`
**Risk:** Accountants cannot view quotations on backend despite frontend allowing it
**File:** Quotations.tsx uses `useRequireFeature("quotations:view")`

### 2. **Review needed for:**
- warranty:view
- warranty:create
- warranty:edit
- asset-related permissions
- Any client-specific permissions not on server

## How These Mismatches Occur

1. **Frontend Check Passes:** `useRequireFeature()` checks `FEATURE_ACCESS` in client permissions
2. **Backend Call Made:** Frontend makes API call (user role is in client's allow list)
3. **Backend Check Fails:** Server checks its own `FEATURE_ACCESS` 
4. **User Gets Blocked:** API returns `FORBIDDEN` even though UI allowed the action

## Affected Pages

### Pages that may have backend blocking:
- Quotations.tsx → "quotations:view" with accountant role
- WarrantyManagement.tsx → "warranty:view" (verify roles match)
- Any procurement/asset management pages

## Solution Requirements

1. **Synchronize Permissions:** Server and client `FEATURE_ACCESS` must have identical entries
2. **Use Shared Source:** Consider generating both from a single source of truth
3. **Testing:** Add permission matrix tests to catch future divergence

## Next Steps

1. [ ] Extract all permission entries from both files
2. [ ] Create comprehensive comparison matrix
3. [ ] Fix all identified mismatches
4. [ ] Add test to prevent future divergence
5. [ ] Document the canonical permission list
