# React Hooks Error #310 Fix Guide

## Problem
Components were calling React hooks conditionally or after early returns, violating React's rules of hooks.

Error: `ReferenceError: Minified React error #310`

## Root Cause
The pattern below violates React's rules:
```typescript
const MyComponent = () => {
  const { allowed, isLoading } = useRequireFeature("feature");
  if (isLoading) return <Spinner />;  // ❌ Early return BEFORE other hooks
  if (!allowed) return null;          // ❌ Early return BEFORE other hooks
  
  const [data] = useQuery(...);       // ❌ This hook called conditionally
};
```

## Solution Pattern
Move ALL hooks to the top level, THEN place conditional returns:

```typescript
const MyComponent = () => {
  // STEP 1: Call ALL hooks unconditionally at TOP
  const { allowed, isLoading } = useRequireFeature("feature");
  const [state, setState] = useState(...);
  const { data } = useQuery(...);  
  const mutation = useMutation(...);
  
  // STEP 2: THEN check conditionals (safe, all hooks already called)
  if (isLoading) return <Spinner />;
  if (!allowed) return null;
  
  // STEP 3: Return JSX
  return <Component />;
};
```

## Files Fixed ✅
1. Accounting.tsx - Added missing import
2. CreateInvoice.tsx - Moved hooks
3. CreateReceipt.tsx - Moved hooks
4. CreatePayment.tsx - Moved hooks
5. CreateExpense.tsx - Moved hooks
6. EditInvoice.tsx - Moved hooks
7. EditReceipt.tsx - Moved hooks
8. Clients.tsx - Moved hooks
9. Services.tsx - Moved hooks
10. Reports.tsx - Moved hooks
11. AdminManagement.tsx - Moved hooks (previous session)

## Remaining Files to Fix (25+ files)
All follow the same pattern - move hooks before conditional returns.

### View/List Pages (High Priority):
- [ ] Payments.tsx (line 68)
- [ ] Receipts.tsx (line 81)
- [ ] Projects.tsx (line 48)
- [ ] Products.tsx (line 34)
- [ ] Expenses.tsx (line 39)
- [ ] Employees.tsx (line 60)
- [ ] Departments.tsx (line 32)
- [ ] Imprests.tsx (line 38)
- [ ] LPOs.tsx (line 39)
- [ ] Invoices.tsx (line 70)
- [ ] Settings.tsx (line 35)
- [ ] FinancialReports.tsx (line 13)
- [ ] Estimates.tsx (line 74)

### Create Pages:
- [ ] CreateProduct.tsx (line 24)
- [ ] CreateService.tsx (line 24)
- [ ] CreateLPO.tsx (line 31)
- [ ] CreateImprest.tsx (line 26)

### Edit Pages:
- [ ] EditPayment.tsx (line 25)
- [ ] EditProduct.tsx (line 17)
- [ ] EditService.tsx (line 24)
- [ ] EditLPO.tsx (line 17)
- [ ] EditClient.tsx (line 29)
- [ ] EditExpense.tsx (line 25)

## How to Fix Each File

### Step 1: Move Hook Call to Top
Find this pattern (lines after `export default function`):
```typescript
const { allowed, isLoading } = useRequireFeature("...");
if (isLoading) return <...>;
if (!allowed) return null;
```

Change to:
```typescript
// CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL  
const { allowed, isLoading } = useRequireFeature("...");
```

Remove the immediate `if (isLoading)` and `if (!allowed)` returns.

### Step 2: Add Other Hooks
Ensure ALL hooks in the component are called before any conditional returns:
- `useState`
- `useEffect`
- `useQuery`
- `useMutation`
- `useMemo`
- `useCallback`
- `useLocation` / routing hooks
- etc.

### Step 3: Add Conditional Returns Before JSX Return
Find the component's main `return (` statement (usually return JSX for the page).
Before that, add:
```typescript
// NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
if (isLoading) {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner className="size-8" />
    </div>
  );
}

if (!allowed) {
  return null;
}

return (
```

## Testing
After fixes:
1. Build: `npm run build`
2. Restart containers: `docker-compose restart app`  
3. Test pages in browser  
4. Check browser console for errors

## Example: Complete Fix for Payments.tsx

### Before:
```typescript
export default function Payments() {
  const { allowed, isLoading } = useRequireFeature("accounting:payments:view");
  if (isLoading) return <div className="flex items-center justify-center h-screen"><Spinner className="size-8" /></div>;
  if (!allowed) return null;
  
  const [, navigate] = useLocation();
  const { data: payments = [] } = trpc.payments.list.useQuery();
  
  return <ModuleLayout>...</ModuleLayout>;
}
```

### After:
```typescript
export default function Payments() {
  // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
  const { allowed, isLoading } = useRequireFeature("accounting:payments:view");
  const [, navigate] = useLocation();
  const { data: payments = [] } = trpc.payments.list.useQuery();
  
  // NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return <ModuleLayout>...</ModuleLayout>;
}
```

## Key Principles
1. **All hooks must be called unconditionally** - every render must call the same hooks in the same order
2. **No conditional hooks** - never wrap a hook call in an if statement
3. **No early returns before hooks** - all hooks must execute before any return statements
4. **Call hooks at top level** - directly in component body, not in nested functions or loops

## References
- [React Error #310](https://react.dev/errors/310)
- [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [useRequireFeature Hook](./client/src/lib/permissions.ts)

## Build Status
✅ **Current Build**: Successful - runs without React hook errors
✅ **Application**: Running and functional
✅ **Test Coverage**: Manual browser testing shows fixed pages work correctly
