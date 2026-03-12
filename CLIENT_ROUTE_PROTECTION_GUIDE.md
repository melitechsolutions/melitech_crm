# Client-Side Route Protection Implementation Guide

## Overview

This guide provides step-by-step instructions for protecting client-side routes using role-based access control. It prevents unauthorized users from accessing restricted pages and provides seamless redirection to appropriate dashboards.

## Architecture

### 1. Route Guard Hook

Create a custom hook to check permissions before rendering:

```typescript
// client/src/hooks/useRequireFeature.ts

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { canAccessFeature, getDashboardUrl } from "@/lib/permissions";
import { toast } from "sonner";

export function useRequireFeature(feature: string) {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      toast.error("Please log in to access this page");
      navigate("/");
      return;
    }

    if (!canAccessFeature(user.role, feature)) {
      toast.error(`Access denied: You don't have permission to ${feature}`);
      navigate(getDashboardUrl(user.role));
    }
  }, [user, feature, isLoading, navigate]);

  return { allowed: user && canAccessFeature(user.role, feature) };
}
```

### 2. Route Guard Component

Create a component wrapper for protected routes:

```typescript
// client/src/components/ProtectedRoute.tsx

import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { canAccessFeature, getDashboardUrl } from "@/lib/permissions";

interface ProtectedRouteProps {
  feature: string;
  children: ReactNode;
}

export function ProtectedRoute({ feature, children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!canAccessFeature(user.role, feature)) {
    return <Navigate to={getDashboardUrl(user.role)} replace />;
  }

  return <>{children}</>;
}
```

### 3. Layout Route Guard

Create a layout-level guard for page modules:

```typescript
// client/src/components/AdminDashboard.tsx

import { useRequireFeature } from "@/hooks/useRequireFeature";

export function AdminDashboard() {
  const { allowed } = useRequireFeature("admin:settings:view");

  if (!allowed) {
    return null;  // ProtectedRoute already handled redirection
  }

  return (
    <div>
      {/* Admin dashboard content */}
    </div>
  );
}
```

## Implementation by Route/Page

### 1. Admin Management Page

```typescript
// client/src/pages/AdminManagement.tsx

import { useRequireFeature } from "@/hooks/useRequireFeature";

export function AdminManagement() {
  const { allowed } = useRequireFeature("admin:settings:manage");

  if (!allowed) return null;

  return (
    <div className="p-6">
      <h1>Admin Management</h1>
      {/* Admin UI */}
    </div>
  );
}

// In router configuration:
// path: "/crm/admin",
// element: <ProtectedRoute feature="admin:settings:manage"><AdminManagement /></ProtectedRoute>,
```

### 2. Accounting/Invoices Page

```typescript
// client/src/pages/Invoices.tsx

import { useRequireFeature } from "@/hooks/useRequireFeature";
import { toast } from "sonner";

export function Invoices() {
  const { allowed } = useRequireFeature("accounting:invoices:view");

  if (!allowed) return null;

  const canCreate = useRequireFeature("accounting:invoices:create").allowed;
  const canApprove = useRequireFeature("accounting:invoices:approve").allowed;

  return (
    <div className="p-6">
      <h1>Invoices</h1>

      {canCreate && (
        <button onClick={() => navigate("/invoices/create")}>
          Create Invoice
        </button>
      )}

      {/* Invoice list */}
    </div>
  );
}
```

### 3. HR Dashboard/Employees Page

```typescript
// client/src/pages/EmployeeDetails.tsx

import { useRequireFeature } from "@/hooks/useRequireFeature";

export function EmployeeDetails({ id }: { id: string }) {
  const { allowed: canView } = useRequireFeature("hr:employees:view");
  const { allowed: canManage } = useRequireFeature("hr:employees:manage");

  if (!canView) return null;

  return (
    <div className="p-6">
      <h1>Employee Details</h1>
      
      {canManage && (
        <button onClick={handleEditClick}>Edit Employee</button>
      )}
      
      {/* Employee details */}
    </div>
  );
}
```

### 4. Procurement Pages

```typescript
// client/src/pages/LPOList.tsx

import { useRequireFeature } from "@/hooks/useRequireFeature";

export function LPOList() {
  const { allowed: canView } = useRequireFeature("procurement:lpo:view");
  const { allowed: canCreate } = useRequireFeature("procurement:lpo:create");
  const { allowed: canApprove } = useRequireFeature("procurement:lpo:approve");

  if (!canView) return null;

  return (
    <div className="p-6">
      <h1>Local Purchase Orders</h1>

      {canCreate && (
        <button onClick={() => navigate("/lpo/create")}>Create LPO</button>
      )}

      {/* LPO list with approval buttons visible only if canApprove */}
    </div>
  );
}
```

### 5. Settings Page

```typescript
// client/src/pages/Settings.tsx

import { useRequireFeature } from "@/hooks/useRequireFeature";

export function Settings() {
  const { allowed: canView } = useRequireFeature("admin:settings:view");
  const { allowed: canManage } = useRequireFeature("admin:settings:manage");

  if (!canView) return null;

  return (
    <div className="p-6">
      <h1>System Settings</h1>

      {!canManage && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          You can view settings but cannot modify them
        </div>
      )}

      {canManage && (
        <form onSubmit={handleSaveSettings}>
          {/* Settings form */}
        </form>
      )}
    </div>
  );
}
```

## Router Configuration Pattern

```typescript
// client/src/router.tsx

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminManagement } from "@/pages/AdminManagement";
import { Invoices } from "@/pages/Invoices";
import { Employees } from "@/pages/Employees";
import { LPOList } from "@/pages/LPOList";

export const routes = [
  {
    path: "/crm/admin",
    element: (
      <ProtectedRoute feature="admin:settings:manage">
        <AdminManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/crm/accounting/invoices",
    element: (
      <ProtectedRoute feature="accounting:invoices:view">
        <Invoices />
      </ProtectedRoute>
    ),
  },
  {
    path: "/crm/hr/employees",
    element: (
      <ProtectedRoute feature="hr:employees:view">
        <Employees />
      </ProtectedRoute>
    ),
  },
  {
    path: "/crm/procurement/lpos",
    element: (
      <ProtectedRoute feature="procurement:lpo:view">
        <LPOList />
      </ProtectedRoute>
    ),
  },
  // ... more routes
];
```

## Permission Visibility Pattern

Show/hide UI elements based on permissions:

```typescript
import { useAuth } from "@/hooks/useAuth";
import { canAccessFeature } from "@/lib/permissions";

export function DocumentTable() {
  const { user } = useAuth();

  return (
    <table>
      <thead>
        <tr>
          <th>Document</th>
          <th>Amount</th>
          {canAccessFeature(user?.role || "", "accounting:invoices:approve") && (
            <th>Actions</th>
          )}
        </tr>
      </thead>
      <tbody>
        {documents.map((doc) => (
          <tr key={doc.id}>
            <td>{doc.name}</td>
            <td>{doc.amount}</td>
            {canAccessFeature(user?.role || "", "accounting:invoices:approve") && (
              <td>
                <button onClick={() => approveDocument(doc.id)}>Approve</button>
                <button onClick={() => rejectDocument(doc.id)}>Reject</button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Error Boundary with Route Protection

```typescript
// client/src/components/RouteErrorBoundary.tsx

import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface RouteErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function RouteErrorBoundary({ children, fallback }: RouteErrorBoundaryProps) {
  const navigate = useNavigate();

  try {
    return <>{children}</>;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      navigate("/dashboard");
      return null;
    }

    return fallback || <div>An error occurred</div>;
  }
}
```

## Navigation with Permission Checks

Update navigation components to only show links for accessible features:

```typescript
// client/src/components/Navigation.tsx

import { useAuth } from "@/hooks/useAuth";
import { canAccessFeature } from "@/lib/permissions";
import { useNavigate } from "react-router-dom";

export function Navigation() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      feature: null,  // Always accessible
    },
    {
      label: "Invoices",
      path: "/invoices",
      feature: "accounting:invoices:view",
    },
    {
      label: "Employees",
      path: "/employees",
      feature: "hr:employees:view",
    },
    {
      label: "LPOs",
      path: "/lpos",
      feature: "procurement:lpo:view",
    },
    {
      label: "Admin",
      path: "/admin",
      feature: "admin:settings:manage",
    },
  ];

  return (
    <nav>
      {menuItems
        .filter(
          (item) => !item.feature || canAccessFeature(user?.role || "", item.feature)
        )
        .map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="nav-item"
          >
            {item.label}
          </button>
        ))}
    </nav>
  );
}
```

## Implementation Checklist

### Phase 1: Setup Hooks & Components
- [ ] Create `client/src/hooks/useRequireFeature.ts`
- [ ] Create `client/src/components/ProtectedRoute.tsx`
- [ ] Create `client/src/components/RouteErrorBoundary.tsx`

### Phase 2: Admin Routes
- [ ] Apply to `/crm/admin`
- [ ] Apply to `/crm/settings`
- [ ] Apply to `/crm/users`

### Phase 3: Accounting Routes
- [ ] Apply to `/crm/invoices`
- [ ] Apply to `/crm/receipts`
- [ ] Apply to `/crm/payments`
- [ ] Apply to `/crm/expenses`

### Phase 4: HR Routes
- [ ] Apply to `/crm/employees`
- [ ] Apply to `/crm/payroll`
- [ ] Apply to `/crm/attendance`
- [ ] Apply to `/crm/leave`

### Phase 5: Procurement Routes
- [ ] Apply to `/crm/lpos`
- [ ] Apply to `/crm/imprests`
- [ ] Apply to `/crm/suppliers`

### Phase 6: Sales Routes
- [ ] Apply to `/crm/invoices` (sales view)
- [ ] Apply to `/crm/estimates`
- [ ] Apply to `/crm/clients`

### Phase 7: Testing
- [ ] Manual testing with different user roles
- [ ] Test redirects for unauthorized access
- [ ] Test menu items appear/disappear correctly
- [ ] Test nested route protection
- [ ] Load testing for permission checks

## Performance Optimization

Cache permission checks to avoid repeated calculations:

```typescript
// client/src/lib/permissionCache.ts

import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";

const permissionCache = new Map<string, boolean>();

export function useCanAccessFeature(feature: string) {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) return false;

    const cacheKey = `${user.role}:${feature}`;
    
    if (permissionCache.has(cacheKey)) {
      return permissionCache.get(cacheKey)!;
    }

    const result = canAccessFeature(user.role, feature);
    permissionCache.set(cacheKey, result);
    return result;
  }, [user, feature]);
}
```

## Testing Route Protection

```typescript
// client/src/__tests__/ProtectedRoute.test.tsx

import { render, screen } from "@testing-library/react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

describe("ProtectedRoute", () => {
  it("should allow authorized users", () => {
    const user = { role: "admin" };
    // Mock auth context
    render(
      <ProtectedRoute feature="admin:settings:manage">
        <div>Admin Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });

  it("should redirect unauthorized users", () => {
    const user = { role: "client" };
    // Mock auth context
    render(
      <ProtectedRoute feature="admin:settings:manage">
        <div>Admin Content</div>
      </ProtectedRoute>
    );
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });
});
```

## Related Documentation

- **RBAC Implementation:** `server/middleware/enhancedRbac.ts`
- **Permission Constants:** `client/src/lib/permissions.ts`
- **API Permission Enforcement:** `API_PERMISSION_ENFORCEMENT_GUIDE.md`
- **Auto-Numbering System:** `PROCUREMENT_AUTO_NUMBERING_GUIDE.md`
