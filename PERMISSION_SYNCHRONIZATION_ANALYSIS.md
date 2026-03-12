# Permission Synchronization Analysis

## Executive Summary
This document identifies permission role mismatches between client-side (`client/src/lib/permissions.ts`) and server-side (`server/middleware/enhancedRbac.ts`) FEATURE_ACCESS definitions.

## Critical Findings - TOTAL MISMATCHES: 13 Issues Found

### 1. QUOTATIONS:VIEW - MISMATCH FOUND ❌

**Client (line 129):** `["super_admin", "admin", "procurement_manager", "accountant"]`
**Server (line 487):** `["super_admin", "admin", "procurement_manager"]`
**Issue:** MISSING "accountant" role on server
**Impact:** Accountants cannot view quotations
**Severity:** HIGH

---

### 2. WARRANTY Permissions - MULTIPLE MISMATCHES ❌

**warranty:view**
- Client (line 124): `["super_admin", "admin", "ict_manager", "procurement_manager"]`
- Server (line 506): `["super_admin", "admin", "procurement_manager"]`
- **Issue:** MISSING "ict_manager" on server

**warranty:create**  
- Client (line 125): `["super_admin", "admin", "ict_manager", "procurement_manager"]`
- Server (line 507): `["super_admin", "admin", "procurement_manager"]`
- **Issue:** MISSING "ict_manager" on server

**warranty:edit**
- Client (line 126): `["super_admin", "admin", "ict_manager", "procurement_manager"]`
- Server (line 508): `["super_admin", "admin", "procurement_manager"]`
- **Issue:** MISSING "ict_manager" on server

**Affected Pages:** `client/src/pages/WarrantyManagement.tsx` line 18
**Severity:** HIGH

---

### 3. ASSETS Permissions - MISMATCH FOUND ❌

**assets:view**
- Client (line 119): `["super_admin", "admin", "ict_manager", "procurement_manager"]`
- Server (line 512): `["super_admin", "admin", "ict_manager"]`
- **Issue:** MISSING "procurement_manager" on server

**assets:create**
- Client (line 120): `["super_admin", "admin", "ict_manager", "procurement_manager"]`
- Server (line 513): `["super_admin", "admin", "ict_manager"]`
- **Issue:** MISSING "procurement_manager" on server

**assets:edit**
- Client (line 121): `["super_admin", "admin", "ict_manager", "procurement_manager"]`
- Server (line 514): `["super_admin", "admin", "ict_manager"]`
- **Issue:** MISSING "procurement_manager" on server

**Severity:** HIGH

---

### 4. CONTRACTS Permissions - CRITICAL MISMATCHES ❌

**contracts:view - ROLES COMPLETELY DIFFERENT**
- Client (line 114): `["super_admin", "admin", "procurement_manager", "accountant"]`
- Server (line 525): `["super_admin", "admin", "accountant", "project_manager"]`
- **Issue:** Server has "project_manager" but NOT "procurement_manager"!
- **Severity:** CRITICAL

**contracts:create - ROLES COMPLETELY DIFFERENT**
- Client (line 115): `["super_admin", "admin", "procurement_manager"]`
- Server (line 526): `["super_admin", "admin", "accountant"]`
- **Issue:** Server completely reversed roles!
- **Severity:** CRITICAL

**contracts:edit - ROLES COMPLETELY DIFFERENT**
- Client (line 116): `["super_admin", "admin", "procurement_manager"]`
- Server (line 527): `["super_admin", "admin", "accountant"]`
- **Issue:** Server completely reversed roles!
- **Severity:** CRITICAL

---

### 5. DELIVERY_NOTES Permissions - MISMATCH FOUND ❌

**delivery_notes:view**
- Client (line 134): `["super_admin", "admin", "procurement_manager", "accountant", "staff"]`
- Server (line 494): `["super_admin", "admin", "procurement_manager", "accountant"]`
- **Issue:** MISSING "staff" on server

**delivery_notes:create**
- Client (line 135): `["super_admin", "admin", "procurement_manager", "staff"]`
- Server (line 495): `["super_admin", "admin", "procurement_manager"]`
- **Issue:** MISSING "staff" on server

**Severity:** MEDIUM

---

### 6. GRN (Goods Received Notes) Permissions - MISMATCH FOUND ❌

**grn:view**
- Client (line 139): `["super_admin", "admin", "procurement_manager", "accountant", "staff"]`
- Server (line 500): `["super_admin", "admin", "procurement_manager", "accountant"]`
- **Issue:** MISSING "staff" on server

**grn:create**
- Client (line 140): `["super_admin", "admin", "procurement_manager", "staff"]`
- Server (line 501): `["super_admin", "admin", "procurement_manager"]`
- **Issue:** MISSING "staff" on server

**Severity:** MEDIUM

---

## SUMMARY OF ALL MISMATCHES

**Total Issues Found: 13**
- Critical: 3 (contracts)
- High: 9 (quotations, warranty, assets)
- Medium: 4 (delivery_notes, grn)

## Action Items - PRIORITY ORDER

### CRITICAL - Fix Contracts Permissions (ROLE REVERSAL):

**server/middleware/enhancedRbac.ts - Line 525-527**

Current (WRONG):
```typescript
"contracts:view": ["super_admin", "admin", "accountant", "project_manager"],
"contracts:create": ["super_admin", "admin", "accountant"],
"contracts:edit": ["super_admin", "admin", "accountant"],
```

Should be (from client):
```typescript
"contracts:view": ["super_admin", "admin", "procurement_manager", "accountant"],
"contracts:create": ["super_admin", "admin", "procurement_manager"],
"contracts:edit": ["super_admin", "admin", "procurement_manager"],
```

---

### HIGH PRIORITY - Fix Procurement Manager Permissions:

**server/middleware/enhancedRbac.ts**

1. **Line 487 (quotations:view)** - Add "accountant"
   ```typescript
   "quotations:view": ["super_admin", "admin", "procurement_manager", "accountant"],
   ```

2. **Lines 506-508 (warranty permissions)** - Add "ict_manager"
   ```typescript
   "warranty:view": ["super_admin", "admin", "ict_manager", "procurement_manager"],
   "warranty:create": ["super_admin", "admin", "ict_manager", "procurement_manager"],
   "warranty:edit": ["super_admin", "admin", "ict_manager", "procurement_manager"],
   ```

3. **Lines 512-514 (assets permissions)** - Add "procurement_manager"
   ```typescript
   "assets:view": ["super_admin", "admin", "ict_manager", "procurement_manager"],
   "assets:create": ["super_admin", "admin", "ict_manager", "procurement_manager"],
   "assets:edit": ["super_admin", "admin", "ict_manager", "procurement_manager"],
   ```

---

### MEDIUM PRIORITY - Fix Staff Permissions:

**server/middleware/enhancedRbac.ts**

1. **Line 494-495 (delivery_notes)** - Add "staff"
   ```typescript
   "delivery_notes:view": ["super_admin", "admin", "procurement_manager", "accountant", "staff"],
   "delivery_notes:create": ["super_admin", "admin", "procurement_manager", "staff"],
   ```

2. **Lines 500-501 (grn)** - Add "staff"
   ```typescript
   "grn:view": ["super_admin", "admin", "procurement_manager", "accountant", "staff"],
   "grn:create": ["super_admin", "admin", "procurement_manager", "staff"],
   ```

---

## Verification Checklist

After making fixes, verify with:

1. **Login as accountant**, navigate to /quotations
   - ✓ Should see page
   - ✓ Should be able to list quotations
   - ✓ Network tab should show successful API calls

2. **Login as ict_manager**, navigate to /warranty-management
   - ✓ Should see page
   - ✓ Should be able to list warranties
   - ✓ Network tab should show successful API calls

3. **Login as procurement_manager**, navigate to Assets/Contracts
   - ✓ Should see pages
   - ✓ Should be able to perform CRUD operations
   - ✓ No FORBIDDEN errors in network tab

4. **Login as staff**, navigate to GRN/Delivery Notes
   - ✓ Should be able to view these pages
   - ✓ Network tab should show successful API calls

## Technical Details

### How Mismatches Cause Runtime Failures

1. User logs in with role "accountant"
2. User navigates to /quotations page
3. Frontend calls `useRequireFeature("quotations:view")`
4. Frontend checks: accountant in ["super_admin", "admin", "procurement_manager", "accountant"] ✅ PASS
5. User sees UI and tries to load quotations
6. Frontend calls backend API: `trpc.quotations.list.query()`
7. Backend checks permission: accountant in ["super_admin", "admin", "procurement_manager"] ❌ FAIL
8. Backend returns: `FORBIDDEN` error
9. User sees "Access denied" error despite UI showing page

---

## Files to Modify

### High Priority:
- [ ] `server/middleware/enhancedRbac.ts` - Line 487 (quotations:view)
- [ ] `server/middleware/enhancedRbac.ts` - Lines 505-507 (warranty permissions)

### Verification Needed:
- [ ] Full audit of all permissions for role mismatches
- [ ] Test matrix for user permissions across all features

---

## Testing Recommendations

### Manual Testing
```
1. Login as accountant
2. Navigate to /quotations
3. Should display page and allow viewing quotations
4. Verify API calls succeed (check Network tab)

1. Login as ict_manager
2. Navigate to /warranty-management
3. Should display page and allow viewing warranties
4. Verify API calls succeed
```

### Automated Testing
```typescript
// Test that client and server permissions match
describe('Permission Synchronization', () => {
  it('should have matching quotations:view roles', () => {
    const clientRoles = CLIENT_FEATURE_ACCESS['quotations:view'];
    const serverRoles = SERVER_FEATURE_ACCESS['quotations:view'];
    expect(clientRoles).toEqual(serverRoles);
  });
});
```
