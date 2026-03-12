# React Error #310 Diagnosis

## Error Overview
React Error #310: "Too many re-renders. React limits the number of renders to prevent an infinite loop."

This error occurs when a component continuously triggers state updates, causing React to enter an infinite render loop.

## Root Cause Analysis

### Issue 1: useMutation Hook Called Outside Component Function
**Location**: Multiple pages including CreateEstimate.tsx, CreateInvoice.tsx, EditEstimate.tsx, etc.

**Problem**: 
The `useMutation` hook is being called in `useEffect` dependencies array without being memoized or properly handled. In lines like:

```typescript
const getNextNumberMutation = trpc.settings.getNextDocumentNumber.useMutation();

useEffect(() => {
  // ... uses getNextNumberMutation
}, []); // Missing dependency
```

The mutation object is created on every render but not included in the dependency array, or if included, causes re-renders.

### Issue 2: Callback Dependencies in Estimate/Invoice/Payment/Expense Forms
**Locations**: 
- `/client/src/pages/CreateEstimate.tsx` (lines 46-92)
- `/client/src/pages/EditEstimate.tsx` (lines 20-145)
- `/client/src/pages/CreateInvoice.tsx` (lines 46+)
- `/client/src/components/DepartmentForm.tsx` (lines 35-60)
- `/client/src/components/ExpenseForm.tsx` (lines 38-65)

**Problem**:
The `useCallback` hooks include mutation objects in their dependency arrays:

```typescript
const handleSave = useCallback((data: any) => {
  // ... logic
  createEstimateMutation.mutate(estimateData);
}, [createEstimateMutation]); // This causes re-renders
```

The mutation object reference changes on every render, causing the callback to be recreated, which triggers re-renders in child components.

### Issue 3: Missing Permissions Data in RolesAndPermissionsSection
**Location**: `/client/src/components/settings/RolesAndPermissionsSection.tsx`

**Problem**:
The permissions dropdown appears blank because:
1. The component correctly fetches permissions via `trpc.settings.getPermissions.useQuery()`
2. However, if the backend doesn't return any permissions or the query fails silently, the dropdown will be empty
3. No error handling or loading states are properly displayed to the user

## Affected Components

1. **CreateEstimate.tsx** - React #310 error on mount/save
2. **EditEstimate.tsx** - React #310 error on mount/save
3. **CreateInvoice.tsx** - React #310 error on mount/save
4. **EditInvoice.tsx** - React #310 error on mount/save
5. **CreatePayment.tsx** - Likely same issue
6. **DepartmentForm.tsx** - Save button triggers re-renders
7. **ExpenseForm.tsx** - Save button triggers re-renders
8. **RolesAndPermissionsSection.tsx** - Permissions dropdown blank

## Solutions Required

### Fix 1: Remove Mutation from useCallback Dependencies
Replace mutation objects in dependency arrays with stable references or remove them entirely since mutations are stable by design in tRPC.

### Fix 2: Fix useEffect Dependencies
Either:
- Add `getNextNumberMutation` to the dependency array and handle the re-render
- OR use `mutateAsync` directly without storing the mutation in a variable
- OR use a ref to store the mutation

### Fix 3: Add Error Handling for Permissions Query
Add proper error states and fallback UI when permissions fail to load.

## Priority
**HIGH** - This is blocking core functionality across multiple modules (Estimates, Invoices, Payments, Expenses, Departments, Roles).
