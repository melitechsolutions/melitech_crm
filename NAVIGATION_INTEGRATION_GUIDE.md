# Permission-Based Navigation Integration Guide

## Overview

This guide shows how to update your DashboardLayout component to automatically filter navigation items based on user permissions.

## Step 1: Update DashboardLayout Component

In your `client/src/components/DashboardLayout.tsx`, update the navigation rendering:

```tsx
import { usePermissions, filterNavigationByPermissions, NAVIGATION_ITEMS } from "@/_core/hooks/usePermissions";
import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";

export default function DashboardLayout({ children }) {
  const { user } = useAuthWithPersistence();
  const { hasPermission } = usePermissions(user?.id);

  // Filter navigation items based on user permissions
  const visibleNavItems = filterNavigationByPermissions(
    NAVIGATION_ITEMS,
    hasPermission,
    user?.role
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white">
        <nav className="p-4 space-y-2">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.name}
            />
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

## Step 2: Create NavLink Component

Create a reusable NavLink component that displays the icon and label:

```tsx
import { useLocation } from "wouter";
import * as Icons from "lucide-react";

interface NavLinkProps {
  href: string;
  icon: string;
  label: string;
}

export function NavLink({ href, icon, label }: NavLinkProps) {
  const [location] = useLocation();
  const Icon = Icons[icon as keyof typeof Icons] as React.ComponentType<any>;
  const isActive = location === href;

  return (
    <a
      href={href}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? "bg-blue-600 text-white"
          : "hover:bg-gray-800 text-gray-300"
      }`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span>{label}</span>
    </a>
  );
}
```

## Step 3: Add Permission-Based Visibility to Buttons

For buttons and actions, use the `hasPermission` hook:

```tsx
function InvoiceActions({ invoiceId }) {
  const { hasPermission } = usePermissions(userId);

  return (
    <div className="flex gap-2">
      {hasPermission("invoices_view") && (
        <Button onClick={() => handleView(invoiceId)}>
          View
        </Button>
      )}
      
      {hasPermission("invoices_edit") && (
        <Button onClick={() => handleEdit(invoiceId)} variant="outline">
          Edit
        </Button>
      )}
      
      {hasPermission("invoices_delete") && (
        <Button 
          onClick={() => handleDelete(invoiceId)} 
          variant="destructive"
        >
          Delete
        </Button>
      )}
      
      {hasPermission("invoices_download") && (
        <Button onClick={() => handleDownload(invoiceId)} variant="secondary">
          Download
        </Button>
      )}
      
      {hasPermission("invoices_print") && (
        <Button onClick={() => handlePrint(invoiceId)} variant="secondary">
          Print
        </Button>
      )}
      
      {hasPermission("invoices_send") && (
        <Button onClick={() => handleSend(invoiceId)} variant="secondary">
          Send
        </Button>
      )}
    </div>
  );
}
```

## Step 4: Restrict Access to Pages

Protect entire pages from unauthorized access:

```tsx
import { usePermissions } from "@/_core/hooks/usePermissions";
import { useLocation } from "wouter";

function InvoicesPage() {
  const { hasPermission } = usePermissions(userId);
  const [, setLocation] = useLocation();

  // Redirect if no permission
  useEffect(() => {
    if (!hasPermission("invoices_view")) {
      setLocation("/dashboard"); // Redirect to dashboard
      toast.error("You don't have permission to access invoices");
    }
  }, [hasPermission]);

  return (
    <div>
      {/* Invoice content */}
    </div>
  );
}
```

## Step 5: Update Permission Categories for Frontend

If you want to add more navigation items, update the `NAVIGATION_ITEMS` array in `usePermissions.ts`:

```tsx
export const NAVIGATION_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    permissions: [], // Always visible
  },
  {
    name: "Custom Module",
    href: "/custom-module",
    icon: "CheckCircle",
    permissions: ["custom_module_view"], // Add corresponding permission
  },
  // ... other items
];
```

## Step 6: Create Permission Groups (Optional)

For easier management of related permissions:

```tsx
// Create permission groups in permissions.ts
export const PERMISSION_GROUPS = {
  INVOICE_OPERATIONS: [
    "invoices_view",
    "invoices_create",
    "invoices_edit",
    "invoices_send",
    "invoices_mark_paid",
  ],
  INVOICE_DANGEROUS: [
    "invoices_delete",
  ],
  INVOICE_EXPORT: [
    "invoices_download",
    "invoices_print",
  ],
};

// Use in components:
function InvoiceControls() {
  const { hasAllPermissions } = usePermissions(userId);
  
  if (hasAllPermissions(PERMISSION_GROUPS.INVOICE_OPERATIONS)) {
    return <FullInvoiceUI />;
  }
  
  return <LimitedInvoiceUI />;
}
```

## Step 7: Test Permission-Based Navigation

1. Create test users with different permission sets:
   ```tsx
   // Test User 1: Accountant
   - invoices_view
   - payments_view
   - expenses_view
   - reports_view
   
   // Test User 2: Sales Manager
   - invoices_view
   - invoices_create
   - invoices_send
   - estimates_view
   - clients_view
   
   // Test User 3: Limited Access
   - invoices_view only
   ```

2. Login as each user and verify:
   - Navigation shows only permitted items
   - Buttons are hidden for unpermitted actions
   - Page access is restricted appropriately

## Advanced: Component-Level Permission Checks

Create a PermissionGate component for cleaner code:

```tsx
interface PermissionGateProps {
  permissions: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGate({
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasAllPermissions, hasAnyPermission } = usePermissions(userId);
  
  const hasAccess = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Usage:
<PermissionGate permissions={["invoices_create", "invoices_edit"]}>
  <EditInvoiceButton />
</PermissionGate>

<PermissionGate 
  permissions={["invoices_delete"]}
  fallback={<p>You don't have permission to delete invoices</p>}
>
  <DeleteInvoiceButton />
</PermissionGate>
```

## Performance Tips

1. **Memoize Permission Checks:**
```tsx
const canCreateInvoices = useMemo(() => hasPermission("invoices_create"), []);
```

2. **Batch Navigation Filtering:**
```tsx
const visibleNav = useMemo(() => 
  filterNavigationByPermissions(NAVIGATION_ITEMS, hasPermission, userRole),
  [hasPermission, userRole]
);
```

3. **Cache Permission States:**
```tsx
const [cachedPermissions, setCachedPermissions] = useState<Record<string, boolean>>({});

const hasPermissionCached = useCallback((perm: string) => {
  if (cachedPermissions[perm] !== undefined) {
    return cachedPermissions[perm];
  }
  const result = hasPermission(perm);
  setCachedPermissions(prev => ({ ...prev, [perm]: result }));
  return result;
}, [cachedPermissions, hasPermission]);
```

## Troubleshooting

### Navigation not updating after permission change
- Clear localStorage and refresh page
- Verify query cache was invalidated: `queryClient.invalidateQueries(['permissions.getUserPermissions'])`

### Permission check always returns false
- Verify user ID is correct
- Check if super_admin role has override enabled
- Review database for userPermissions records

### Performance issues
- Implement permission caching
- Use `useMemo` for navigation filtering
- Batch permission checks instead of individual queries

## Summary

By following these steps, you'll have:
- ✅ Automatic navigation filtering based on permissions
- ✅ Permission-based button visibility
- ✅ Page-level access control
- ✅ Reusable permission checking utilities
- ✅ Performance optimizations
- ✅ Clean, maintainable code

The navigation will automatically adapt for each user based on their assigned permissions, providing a seamless and secure user experience.
