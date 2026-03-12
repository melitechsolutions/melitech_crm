# Bug Analysis Report - Backend Saving Issues

## Date: February 6, 2026

## Issues Identified

### 1. Departments Module - Line 67
**File:** `server/routers/departments.ts`
**Issue:** Using `input.departmentName` which doesn't exist in the input schema
**Line:** 67
```typescript
description: `Created department: ${input.departmentName}`,
```
**Problem:** The input schema defines `name` not `departmentName`. This will cause the log to show `undefined`.
**Fix:** Change to `input.name`

---

### 2. Payments Module - Missing Status Field
**File:** `server/routers/payments.ts`
**Issue:** The `create` mutation doesn't include a default status when status is not provided
**Lines:** 69-75
**Problem:** While line 72 sets `status: input.status || "pending"`, the payment schema might require explicit status handling
**Severity:** Low - Already has fallback but could be clearer

---

### 3. Receipts Module - Missing Activity Logging
**File:** `server/routers/receipts.ts`
**Issue:** No activity logging for create, update, and delete operations
**Lines:** 75-112, 132-175, 177-193
**Problem:** Unlike other modules (payments, departments, expenses), receipts don't log activities
**Impact:** Audit trail is incomplete for receipts

---

### 4. Receipts Module - Line Items Preview/Edit Issues
**File:** `server/routers/receipts.ts`
**Potential Issues:**
- Line items use `rate` field in database but `unitPrice` in the input schema
- The `getWithItems` query returns items but field mapping might not match frontend expectations
- No validation for line items total vs receipt amount

---

## Frontend Files to Check

### Receipts Pages:
- `/home/ubuntu/client/src/pages/CreateReceipt.tsx`
- `/home/ubuntu/client/src/pages/EditReceipt.tsx`
- `/home/ubuntu/client/src/pages/ReceiptDetails.tsx`
- `/home/ubuntu/client/src/pages/Receipts.tsx`

### Other Module Pages:
- `/home/ubuntu/client/src/pages/CreatePayment.tsx`
- `/home/ubuntu/client/src/pages/EditPayment.tsx`
- `/home/ubuntu/client/src/pages/Departments.tsx`
- `/home/ubuntu/client/src/pages/CreateExpense.tsx`
- `/home/ubuntu/client/src/pages/EditExpense.tsx`

## Next Steps
1. Fix the departments logging bug
2. Add activity logging to receipts module
3. Check frontend receipt forms for line items handling
4. Verify field mapping between frontend and backend
5. Test all save operations


## Detailed Analysis Complete

### Critical Issues Found:

#### 1. **Departments Module - Incorrect Field Reference**
- **Location:** `server/routers/departments.ts:67`
- **Bug:** References `input.departmentName` instead of `input.name`
- **Impact:** Activity log shows undefined for department name
- **Severity:** Medium

#### 2. **Receipts Module - Missing Activity Logging**
- **Location:** `server/routers/receipts.ts` (entire file)
- **Bug:** No activity logging for create, update, delete operations
- **Impact:** Incomplete audit trail
- **Severity:** Medium

#### 3. **Receipts Line Items - Field Mapping Issue**
- **Location:** `client/src/pages/EditReceipt.tsx:62`
- **Bug:** Tries to read both `item.rate` and `item.unitPrice` from backend
- **Database Schema:** Uses `rate` field (line 800 in schema.ts)
- **Backend Returns:** `rate` field from database
- **Frontend Expects:** `unitPrice` in forms
- **Current Code:** `unitPrice: (item.rate || item.unitPrice || 0) / 100`
- **Impact:** Line items preview shows incorrect prices or zero values
- **Severity:** HIGH - This is the main line items preview/edit error

#### 4. **Receipts Backend - Inconsistent Field Naming**
- **Location:** `server/routers/receipts.ts:102, 164`
- **Bug:** Backend accepts `unitPrice` from frontend but stores as `rate` in database
- **Code:** `rate: item.unitPrice`
- **Impact:** Creates confusion and potential data loss
- **Severity:** Medium

## Root Cause Analysis

The line items preview and edit errors in receipts are caused by:

1. **Schema uses `rate` field** but frontend uses `unitPrice`
2. **Backend accepts `unitPrice`** from frontend and maps it to `rate` in database
3. **Backend returns `rate`** when querying line items
4. **Frontend tries to read both** `item.rate` and `item.unitPrice` causing confusion
5. **No consistent naming convention** between frontend and backend

## Solutions Required

### Fix 1: Departments Activity Log
Change line 67 in `server/routers/departments.ts`:
```typescript
// FROM:
description: `Created department: ${input.departmentName}`,
// TO:
description: `Created department: ${input.name}`,
```

### Fix 2: Add Activity Logging to Receipts
Add activity logging to create, update, and delete operations in `server/routers/receipts.ts`

### Fix 3: Standardize Line Items Field Naming
Option A: Update backend to return `unitPrice` instead of `rate`
Option B: Update frontend to consistently use `rate`
**Recommended: Option A** - Keep frontend naming as it's more user-friendly

### Fix 4: Fix EditReceipt Line Items Mapping
Update line 62 in `client/src/pages/EditReceipt.tsx`:
```typescript
// FROM:
unitPrice: (item.rate || item.unitPrice || 0) / 100,
// TO:
unitPrice: (item.rate || 0) / 100,
```
This ensures we always read from the correct field returned by backend.
