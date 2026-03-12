# React Error Fixes Applied

## Summary
Fixed React Error #310 (infinite re-render loop) across multiple components and resolved missing permissions dropdown in Roles configuration.

---

## Issue 1: React Error #310 - Infinite Re-renders

### Root Cause
The `useMutation` hooks from tRPC were being included in `useCallback` dependency arrays, causing the callbacks to be recreated on every render, which triggered infinite re-render loops.

### Files Fixed

#### 1. `/client/src/pages/CreateEstimate.tsx`
**Changes:**
- Removed `createEstimateMutation` from `handleSave` dependency array (line 92)
- Removed `createEstimateMutation` from `handleSend` dependency array (line 135)
- Added `getNextNumberMutation` to `useEffect` dependency array (line 44)

**Before:**
```typescript
const handleSave = useCallback((data: any) => {
  // ... logic
  createEstimateMutation.mutate(estimateData);
}, [createEstimateMutation]);
```

**After:**
```typescript
const handleSave = useCallback((data: any) => {
  // ... logic
  createEstimateMutation.mutate(estimateData);
}, []);
```

#### 2. `/client/src/pages/EditEstimate.tsx`
**Changes:**
- Removed `updateEstimateMutation` from `handleSave` dependency array (line 108)
- Removed `updateEstimateMutation` from `handleSend` dependency array (line 145)
- Removed `deleteEstimateMutation` from `handleDelete` dependency array (line 151)

#### 3. `/client/src/pages/CreateInvoice.tsx`
**Changes:**
- Removed `createInvoiceMutation` from `handleSave` dependency array (line 93)
- Removed `createInvoiceMutation` from `handleSend` dependency array (line 136)
- Added `getNextNumberMutation` to `useEffect` dependency array (line 44)

#### 4. `/client/src/pages/EditInvoice.tsx`
**Changes:**
- Removed `updateInvoiceMutation` from `handleSave` dependency array (line 106)
- Removed `updateInvoiceMutation` from `handleSend` dependency array (line 143)
- Removed `deleteInvoiceMutation` from `handleDelete` dependency array (line 149)

#### 5. `/client/src/pages/CreatePayment.tsx`
**Changes:**
- Added `getNextNumberMutation` to `useEffect` dependency array (line 59)

### Why This Fix Works
tRPC mutations are **stable references** by design - they don't change between renders. Including them in dependency arrays is unnecessary and causes the callbacks to be recreated unnecessarily, triggering child component re-renders and potentially infinite loops.

---

## Issue 2: Blank Permissions Dropdown in Roles Configuration

### Root Cause
The backend API endpoints for role and permission management were missing from the settings router, and the database schema didn't match the code expectations.

### Files Fixed

#### 1. `/server/routers/settings.ts`
**Added Missing API Endpoints:**
- `createRole` - Create new roles
- `createPermission` - Create new permissions
- `assignPermissionToRole` - Assign permissions to roles
- `removePermissionFromRole` - Remove permissions from roles
- `getRolePermissions` - Get all permissions assigned to a role

**Updated Existing Endpoints:**
- `getRoles` - Changed from hardcoded data to database query
- `getPermissions` - Changed from hardcoded data to database query

**Before:**
```typescript
getPermissions: protectedProcedure.query(async () => {
  return [
    { id: "1", name: "view_all", description: "View all data" },
    // ... hardcoded data
  ];
}),
```

**After:**
```typescript
getPermissions: protectedProcedure.query(async () => {
  return await db.getPermissions();
}),
```

#### 2. `/drizzle/schema.ts`
**Updated `userRoles` Table:**
- Added `roleName` field (varchar 100)
- Added `description` field (text)
- Added `isActive` field (tinyint, default 1)
- Made `userId` and `role` fields optional

**Updated `permissions` Table:**
- Added `permissionName` field (varchar 100)
- Added `category` field (varchar 100)
- Made `name`, `resource`, and `action` fields optional

**Before:**
```typescript
export const userRoles = mysqlTable("userRoles", {
  id: varchar({ length: 64 }).notNull(),
  userId: varchar({ length: 64 }).notNull(),
  role: varchar({ length: 50 }).notNull(),
  assignedBy: varchar({ length: 64 }),
  createdAt: timestamp({ mode: 'string' }).defaultNow(),
});
```

**After:**
```typescript
export const userRoles = mysqlTable("userRoles", {
  id: varchar({ length: 64 }).notNull(),
  userId: varchar({ length: 64 }),
  role: varchar({ length: 50 }),
  roleName: varchar({ length: 100 }),
  description: text(),
  isActive: tinyint().default(1),
  assignedBy: varchar({ length: 64 }),
  createdAt: timestamp({ mode: 'string' }).defaultNow(),
});
```

---

## Issue 3: Department and Expense Forms

### Status
✅ **No changes needed** - These forms don't use `useCallback`, so they're not affected by the mutation dependency issue.

---

## Database Migration Required

⚠️ **IMPORTANT:** You need to run database migrations to apply the schema changes:

```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate
```

Or if using the docker setup:
```bash
docker-compose exec app npm run db:generate
docker-compose exec app npm run db:migrate
```

---

## Testing Checklist

After applying these fixes, test the following:

### Estimates
- [ ] Create new estimate - should not cause infinite re-renders
- [ ] Edit existing estimate - should save without errors
- [ ] Delete estimate - should work correctly

### Invoices
- [ ] Create new invoice - should not cause infinite re-renders
- [ ] Edit existing invoice - should save without errors
- [ ] Delete invoice - should work correctly

### Payments
- [ ] Create new payment - should generate payment number correctly

### Departments
- [ ] Create department - should save correctly
- [ ] Edit department - should update correctly

### Expenses
- [ ] Create expense - should save correctly
- [ ] Edit expense - should update correctly

### Roles & Permissions (Super-Admin)
- [ ] Navigate to Roles configuration - should not redirect
- [ ] Create new role - should save to database
- [ ] Create new permission - should save to database
- [ ] Assign permission to role - dropdown should show permissions
- [ ] Remove permission from role - should work correctly

---

## Additional Notes

### Why Mutations Are Stable
tRPC's `useMutation` hook returns a stable object reference that doesn't change between renders. This is by design to prevent unnecessary re-renders. The mutation object itself is memoized internally.

### Best Practices
1. **Never include mutation objects in dependency arrays** unless you have a specific reason
2. **Use empty dependency arrays** for callbacks that only use mutations
3. **Include only primitive values or stable references** in dependency arrays
4. **Test for infinite loops** by checking the browser console for excessive renders

### Future Prevention
Consider adding ESLint rules to catch this pattern:
```json
{
  "rules": {
    "react-hooks/exhaustive-deps": ["warn", {
      "additionalHooks": "(useCallback|useMemo)"
    }]
  }
}
```

---

## Files Modified

1. `/client/src/pages/CreateEstimate.tsx`
2. `/client/src/pages/EditEstimate.tsx`
3. `/client/src/pages/CreateInvoice.tsx`
4. `/client/src/pages/EditInvoice.tsx`
5. `/client/src/pages/CreatePayment.tsx`
6. `/server/routers/settings.ts`
7. `/drizzle/schema.ts`

Total: **7 files modified**
