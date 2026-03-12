# Unified Landing Page - Implementation Examples & Customization Guide

## Quick Reference: Adding Features

### 1. Adding a New User Role

**Step 1:** Define role in database/schema
```sql
UPDATE users SET role = 'new_role' WHERE id = 'user_id';
```

**Step 2:** Add to role constants
Edit: `client/src/const.ts` (or similar)
```typescript
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  NEW_ROLE: 'new_role',
  // ... others
} as const;
```

**Step 3:** Add welcome message
Edit: `client/src/pages/UnifiedLanding.tsx` → `getRoleWelcome()`
```typescript
const roleMessages: Record<string, { greeting: string; subtitle: string }> = {
  new_role: {
    greeting: "Your Custom Greeting",
    subtitle: "Your custom subtitle",
  },
};
```

**Step 4:** Add quick actions
Edit: `getQuickActions()` function
```typescript
const roleSpecificActions: Record<string, QuickAction[]> = {
  new_role: [
    {
      id: "action-1",
      title: "Action Title",
      description: "Action description",
      icon: <YourIcon className="w-8 h-8" />,
      href: "/module-path",
      color: "from-color-500 to-color-600",
      stats: { label: "Count Label", value: 0 },
    },
    // ... more actions
  ],
};
```

**Step 5:** Add role-specific metrics
Edit: `getOverviewMetrics()` function
```typescript
if (user?.role === "new_role") {
  baseMetrics.push({
    title: "Custom Metric",
    value: metrics.customValue,
    description: "Metric description",
    icon: <MetricIcon className="w-5 h-5" />,
    color: "border-l-color-500 bg-color-50 dark:bg-color-900/20",
    href: "/path",
  });
}
```

**Step 6:** Add role-specific widget (optional)
```typescript
{user?.role === "new_role" && (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold tracking-tight">Custom Section</h2>
    <Card>
      {/* Your custom content */}
    </Card>
  </div>
)}
```

---

### 2. Adding a New Quick Action

**Example: Adding "Invoices" quick action**

```typescript
// In getQuickActions()
const baseActions: QuickAction[] = [
  // ... existing actions ...
  {
    id: "invoices",
    title: "Invoices",
    description: "Create and manage invoices",
    icon: <FileText className="w-8 h-8" />,
    href: "/invoices",
    color: "from-purple-500 to-purple-600",
    stats: { label: "Pending", value: metrics.pendingInvoices },
  },
];
```

**Key Properties:**
- `id`: Unique identifier (used for keys)
- `title`: Display name
- `description`: Hover text
- `icon`: React component (use lucide-react)
- `href`: Navigation target
- `color`: Tailwind gradient (`from-X-500 to-X-600`)
- `stats`: Optional metrics display
- `roles`: Optional role filter

**Using Stats from Metrics:**

```typescript
stats: { label: "Total", value: metrics.yourMetric }
```

**Accessing Metrics:**
```typescript
// Available in component:
metrics.totalProjects
metrics.activeClients
metrics.pendingInvoices
metrics.monthlyRevenue
metrics.totalProducts
metrics.totalServices
metrics.totalEmployees
metrics.totalExpenses
metrics.budgetsCount
metrics.lprosCount

// Or add new ones to useQuery:
const { data: dashboardMetrics } = trpc.dashboard.metrics.useQuery();
```

---

### 3. Adding a New Metric Card

**Example: Adding "Total Revenue" metric**

```typescript
// In getOverviewMetrics()
const baseMetrics: MetricCard[] = [
  // ... existing metrics ...
  {
    title: "Total Revenue",
    value: `KES ${(metrics.monthlyRevenue || 0).toLocaleString()}`,
    description: "This month",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
    href: "/payments",
    change: "+12.5%",
    trend: "up",
  },
];
```

**Properties:**
- `title`: Metric name
- `value`: Display value (string or number)
- `description`: Subtext/context
- `icon`: lucide-react icon
- `color`: Border and background styling
- `href`: Navigation on click
- `change`: Optional trend indicator
- `trend`: Optional "up" or "down" direction

---

### 4. Adding a Role-Specific Widget

**Example: Adding "Revenue Breakdown" chart for Accountant**

```typescript
// At bottom of JSX in component, before closing </div>
{user?.role === "accountant" && (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold tracking-tight">Revenue Analysis</h2>
    
    <Card>
      <CardHeader>
        <CardTitle>Monthly Breakdown</CardTitle>
        <CardDescription>Revenue by category</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Use recharts, charts, or custom visualization */}
        <div className="h-80">
          {/* Chart component here */}
        </div>
      </CardContent>
    </Card>
  </div>
)}
```

---

### 5. Customizing Colors

**Change Quick Action Card Color:**

```typescript
// Current: Blue
{
  id: "projects",
  color: "from-blue-500 to-blue-600",  // ← Change this
}

// Available Tailwind colors:
// from-slate-500 to-slate-600
// from-gray-500 to-gray-600
// from-zinc-500 to-zinc-600
// from-neutral-500 to-neutral-600
// from-stone-500 to-stone-600
// from-red-500 to-red-600
// from-orange-500 to-orange-600
// from-amber-500 to-amber-600
// from-yellow-500 to-yellow-600
// from-lime-500 to-lime-600
// from-green-500 to-green-600
// from-emerald-500 to-emerald-600
// from-teal-500 to-teal-600
// from-cyan-500 to-cyan-600
// from-sky-500 to-sky-600
// from-blue-500 to-blue-600
// from-indigo-500 to-indigo-600
// from-violet-500 to-violet-600
// from-purple-500 to-purple-600
// from-fuchsia-500 to-fuchsia-600
// from-pink-500 to-pink-600
// from-rose-500 to-rose-600
```

**Change Metric Card Color:**

```typescript
// Current: Green border/background
{
  title: "Active Clients",
  color: "border-l-green-500 bg-green-50 dark:bg-green-900/20",  // ← Change this
}

// Available options (border first, then background):
// border-l-red-500 bg-red-50 dark:bg-red-900/20
// border-l-orange-500 bg-orange-50 dark:bg-orange-900/20
// border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20
// border-l-green-500 bg-green-50 dark:bg-green-900/20
// border-l-teal-500 bg-teal-50 dark:bg-teal-900/20
// border-l-blue-500 bg-blue-50 dark:bg-blue-900/20
// border-l-purple-500 bg-purple-50 dark:bg-purple-900/20
// border-l-pink-500 bg-pink-50 dark:bg-pink-900/20
```

---

### 6. Modifying Welcome Message

**Example: Different greeting for super_admin**

```typescript
const getRoleWelcome = () => {
  const roleMessages: Record<string, { greeting: string; subtitle: string }> = {
    super_admin: {
      greeting: "👑 Master Control Panel",  // ← Custom icon + text
      subtitle: "Full system oversight and management",
    },
    // ... others
  };
  
  return roleMessages[user?.role || "user"] || roleMessages.user;
};
```

---

### 7. Adding Real-Time Data Updates

**Example: Auto-refresh metrics every 30 seconds**

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // Refetch metrics
    const refetch = dashboardMetrics;
    // Metrics will update automatically
  }, 30000); // 30 seconds
  
  return () => clearInterval(interval);
}, []);
```

---

### 8. Adding User Preferences

**Example: Allow users to hide sections**

```typescript
const [hiddenSections, setHiddenSections] = useState<string[]>([]);

const toggleSection = (sectionId: string) => {
  setHiddenSections(prev =>
    prev.includes(sectionId)
      ? prev.filter(id => id !== sectionId)
      : [...prev, sectionId]
  );
};

// Then conditionally render:
{!hiddenSections.includes('metrics') && (
  <div className="space-y-3">
    <h2 className="text-xl font-semibold tracking-tight">Key Metrics</h2>
    {/* Metrics content */}
  </div>
)}
```

---

### 9. Adding Custom Filters

**Example: Filter by date range**

```typescript
const [dateRange, setDateRange] = useState({
  start: new Date(new Date().setDate(1)),  // First day of month
  end: new Date(),  // Today
});

// Update queries to use date range:
const { data: dashboardMetrics } = trpc.dashboard.metrics.useQuery({
  startDate: dateRange.start,
  endDate: dateRange.end,
});
```

---

### 10. Adding Notifications/Alerts

**Example: Show alert for pending approvals**

```typescript
const [alerts, setAlerts] = useState<Alert[]>([]);

useEffect(() => {
  if (user?.role === 'admin' && metrics.pendingApprovals > 0) {
    setAlerts([
      {
        id: 'pending-approvals',
        type: 'info',
        title: 'Pending Approvals',
        message: `You have ${metrics.pendingApprovals} pending approvals`,
        actionHref: '/approvals',
      },
    ]);
  }
}, [metrics.pendingApprovals]);

return (
  <>
    {/* Display alerts */}
    {alerts.map(alert => (
      <Alert key={alert.id}>
        <AlertTitle>{alert.title}</AlertTitle>
        <AlertDescription>
          {alert.message}
          {alert.actionHref && (
            <Button size="sm" onClick={() => navigate(alert.actionHref)}>
              View
            </Button>
          )}
        </AlertDescription>
      </Alert>
    ))}
    {/* Rest of page */}
  </>
);
```

---

### 11. Code: Complete Role Addition Example

**File:** `client/src/pages/UnifiedLanding.tsx`

```typescript
// COMPLETE EXAMPLE: Adding "Approver" role

// Step 1: Add to getRoleWelcome()
const getRoleWelcome = () => {
  const roleMessages: Record<string, { greeting: string; subtitle: string }> = {
    // ... existing roles ...
    approver: {
      greeting: "🔍 Approval Dashboard",
      subtitle: "Review and approve pending requests",
    },
  };
  return roleMessages[user?.role || "user"] || roleMessages.user;
};

// Step 2: Add to getQuickActions()
const getQuickActions = (): QuickAction[] => {
  const baseActions: QuickAction[] = [/* ...existing... */];

  const roleSpecificActions: Record<string, QuickAction[]> = {
    // ... existing roles ...
    approver: [
      {
        id: "approvals",
        title: "Pending Approvals",
        description: "Review requests",
        icon: <CheckCircle2 className="w-8 h-8" />,
        href: "/approvals",
        color: "from-amber-500 to-amber-600",
        stats: { label: "Pending", value: 5 }, // Would come from metrics
      },
      {
        id: "approved",
        title: "Approved Requests",
        description: "View history",
        icon: <CheckCircle2 className="w-8 h-8" />,
        href: "/approvals/approved",
        color: "from-green-500 to-green-600",
      },
    ],
  };

  return [
    ...baseActions,
    ...(roleSpecificActions[user?.role || "user"] || []),
  ];
};

// Step 3: Add to getOverviewMetrics()
const getOverviewMetrics = (): MetricCard[] => {
  const baseMetrics: MetricCard[] = [/* ...existing... */];

  if (user?.role === "approver") {
    baseMetrics.push(
      {
        title: "Pending Approvals",
        value: 5,
        description: "Awaiting review",
        icon: <AlertCircle className="w-5 h-5" />,
        color: "border-l-amber-500 bg-amber-50 dark:bg-amber-900/20",
        href: "/approvals",
      },
      {
        title: "Approved This Month",
        value: 23,
        description: "Processed requests",
        icon: <CheckCircle2 className="w-5 h-5" />,
        color: "border-l-green-500 bg-green-50 dark:bg-green-900/20",
        href: "/approvals/approved",
      }
    );
  }

  return baseMetrics;
};

// Step 4: (Optional) Add role-specific widget in JSX
{user?.role === "approver" && (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold tracking-tight">Approval Queue</h2>
    <Card>
      <CardHeader>
        <CardTitle>Requests Awaiting Approval</CardTitle>
        <CardDescription>5 items pending your review</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li>Invoice #1001 - KES 50,000 - Submitted 2 hours ago</li>
          <li>Expense Report - KES 12,500 - Submitted 5 hours ago</li>
          <li>Leave Request - 3 days - Submitted yesterday</li>
        </ul>
      </CardContent>
    </Card>
  </div>
)}
```

---

### 12. Testing Your Changes

**Local Testing:**

1. Build and run:
```bash
npm run build
docker-compose restart app
```

2. Access landing page:
```
http://localhost:3000/dashboard
```

3. Test with different roles by:
   - Creating test users with different roles
   - Logging in as each role
   - Verifying custom content appears

**Automated Testing (Future):**

```typescript
// Example test file: UnifiedLanding.test.tsx
import { render, screen } from '@testing-library/react';
import UnifiedLanding from './UnifiedLanding';

describe('UnifiedLanding', () => {
  test('shows accountant dashboard when user role is accountant', () => {
    // Mock user with accountant role
    // Render component
    // Assert accountant-specific content is visible
  });

  test('shows quick action cards for role', () => {
    // Verify quick action cards render
    // Verify correct number of cards
  });

  test('metrics display correctly', () => {
    // Mock metrics data
    // Verify metrics display correct values
  });
});
```

---

## File Structure Reference

```
client/src/
├── pages/
│   ├── UnifiedLanding.tsx ............. Main component
│   ├── Home.tsx ...................... Entry point (/)
│   └── dashboards/
│       ├── Dashboard.tsx ............. Legacy dashboard
│       ├── SuperAdminDashboard.tsx ... Role-specific
│       ├── AdminDashboard.tsx ........ Role-specific
│       ├── HRDashboard.tsx ........... Role-specific
│       ├── AccountantDashboard.tsx ... Role-specific
│       ├── ProjectManagerDashboard.tsx . Role-specific
│       └── StaffDashboard.tsx ........ Role-specific
│
├── components/
│   └── DashboardLayout.tsx ........... Main layout wrapper
│
└── App.tsx .......................... Router configuration
```

## Debugging Tips

### Metrics Not Showing

1. Check browser console for errors
2. Verify tRPC query: `trpc.dashboard.metrics`
3. Check database for data
4. Verify user has permission to view metrics

### Quick Actions Not Navigating

1. Check href path exists in App.tsx routes
2. Verify wouter `navigate()` function
3. Check browser console for routing errors

### Role-Specific Content Not Appearing

1. Verify `user?.role` matches role string in conditionals
2. Check user role in database
3. Verify role string is exactly correct (case-sensitive)
4. Check browser console: `console.log(user?.role)`

### Styling Issues

1. Verify Tailwind classes are correct
2. Check dark mode CSS classes
3. Verify color class names exist in Tailwind config
4. Check z-index conflicts with other elements

---

## Best Practices

1. **Keep roles consistent:** Use same role names everywhere
2. **Use TypeScript:** For better type safety
3. **Follow naming conventions:** `from-color-500 to-color-600`
4. **Add descriptions:** Make code self-documenting
5. **Test all roles:** Verify each role displays correctly
6. **Mobile first:** Design for mobile, scale up
7. **Accessibility:** Maintain WCAG AA compliance
8. **Performance:** Keep components lightweight
9. **Comments:** Document complex logic
10. **Version control:** Commit regularly with clear messages

---

## Common Patterns

### Pattern 1: Conditional Rendering by Role

```typescript
{user?.role === "accountant" && (
  <FinancialWidget />
)}
```

### Pattern 2: Role-Based Data

```typescript
const getDataForRole = (role?: string) => {
  switch(role) {
    case 'accountant':
      return accountantData;
    case 'hr':
      return hrData;
    default:
      return defaultData;
  }
};
```

### Pattern 3: Dynamic Lists

```typescript
const roleSpecificItems: Record<string, Item[]> = {
  role1: [item1, item2],
  role2: [item3, item4],
};

const items = roleSpecificItems[user?.role] || [];
```

---

## Performance Considerations

- **Lazy load components:** Use React.lazy() for large components
- **Memoize expensive computations:** useMemo() for heavy calculations
- **Optimize re-renders:** useCallback() for callback functions
- **Limit API calls:** One tRPC query per page load
- **Cache metrics:** Store in local state, refetch on demand

---

## Summary

This guide provides complete implementation examples for extending and customizing the Unified Landing Page. Follow the step-by-step examples to add new roles, actions, metrics, and widgets quickly and consistently.
