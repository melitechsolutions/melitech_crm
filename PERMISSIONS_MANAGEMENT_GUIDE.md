# Permissions Management System

## Overview

The permissions management system provides granular control over user access to different features in the Melitech CRM application. It allows super administrators to configure permissions by category, with support for various actions like View, Create, Edit, Delete, Download, and Print.

## Architecture

### Permission Categories

Permissions are organized into the following categories:

1. **Invoices** - Create, view, edit, delete, download, print, send, mark as paid
2. **Estimates** - Create, view, edit, delete, download, print, send, approve
3. **Receipts** - Create, view, edit, delete, download, print
4. **Payments** - Create, view, edit, delete, reconcile
5. **Expenses** - Create, view, edit, delete, approve
6. **Clients** - Create, view, edit, delete
7. **Users** - Create, view, edit, delete, manage permissions
8. **Products** - Create, view, edit, delete
9. **Projects** - Create, view, edit, delete, manage team
10. **Reports** - Create, view, download, schedule
11. **HR Management** - View, manage employees, payroll, attendance, leave
12. **Settings** - View, edit, manage roles

### Database Tables

The system uses the following tables:

- **userPermissions** - Maps individual users to specific permissions
- **rolePermissions** - Maps roles to permissions (not currently used)
- **permissionMetadata** - Stores permission metadata (label, description, category)

### Permission Grants

Permissions are tracked at the user level using the `userPermissions` table with the following fields:

- `id` - Unique identifier
- `userId` - Reference to the user
- `resource` - The permission ID (e.g., "invoices_view")
- `action` - The action being controlled (e.g., "access")
- `granted` - Whether the permission is granted (1) or denied (0)
- `grantedBy` - The user who granted the permission
- `createdAt` - When the permission was created

## Frontend Implementation

### Using Permissions in Components

#### usePermissions Hook

```tsx
import { usePermissions } from "@/_core/hooks/usePermissions";

function MyComponent() {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions(userId);
  
  // Check single permission
  if (hasPermission("invoices_view")) {
    // Show invoice section
  }
  
  // Check any permission
  if (hasAnyPermission(["invoices_create", "invoices_edit"])) {
    // Show edit button
  }
  
  // Check all permissions
  if (hasAllPermissions(["invoices_create", "invoices_send"])) {
    // Show advanced invoice features
  }
}
```

### Permission-Based Navigation

The system automatically filters navigation items based on user permissions:

```tsx
import { usePermissions } from "@/_core/hooks/usePermissions";
import { filterNavigationByPermissions, NAVIGATION_ITEMS } from "@/_core/hooks/usePermissions";

function Sidebar() {
  const { user } = useAuthWithPersistence();
  const { hasPermission } = usePermissions(user?.id);
  
  const visibleItems = filterNavigationByPermissions(
    NAVIGATION_ITEMS,
    hasPermission,
    user?.role
  );
  
  return (
    <nav>
      {visibleItems.map((item) => (
        <Link key={item.href} to={item.href}>
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
```

### Conditional UI Rendering

```tsx
function InvoiceActions() {
  const { hasPermission } = usePermissions(currentUserId);
  
  return (
    <div className="flex gap-2">
      {hasPermission("invoices_view") && (
        <Button onClick={handleView}>View</Button>
      )}
      {hasPermission("invoices_edit") && (
        <Button onClick={handleEdit}>Edit</Button>
      )}
      {hasPermission("invoices_delete") && (
        <Button onClick={handleDelete} variant="destructive">
          Delete
        </Button>
      )}
      {hasPermission("invoices_download") && (
        <Button onClick={handleDownload}>Download</Button>
      )}
      {hasPermission("invoices_print") && (
        <Button onClick={handlePrint}>Print</Button>
      )}
    </div>
  );
}
```

## Backend Implementation

### Permission Endpoints

All endpoints are located under the `permissions` router:

#### Get All Permissions
```tsx
const { data: allPermissions } = trpc.permissions.getAll.useQuery();
```

Returns all permission definitions organized by category.

#### Get User Permissions
```tsx
const { data: userPerms } = trpc.permissions.getUserPermissions.useQuery(userId);
```

Returns the current user's permissions organized by category.

#### Update Single Permission
```tsx
const mutation = trpc.permissions.updateUserPermission.useMutation();

mutation.mutateAsync({
  userId: "user123",
  permissionId: "invoices_view",
  granted: true,
});
```

#### Bulk Update Permissions
```tsx
const mutation = trpc.permissions.bulkUpdatePermissions.useMutation();

mutation.mutateAsync({
  userId: "user123",
  permissions: {
    "invoices_view": true,
    "invoices_create": true,
    "invoices_edit": true,
    "invoices_delete": false,
    // ... other permissions
  },
});
```

#### Check Permission
```tsx
const { data: hasAccess } = trpc.permissions.hasPermission.useQuery({
  userId: "user123",
  permissionId: "invoices_view",
});
```

### Permission Security

1. **Super Admin Override** - Users with `super_admin` role have all permissions by default
2. **Permission Verification** - All mutations verify the user is super admin before allowing changes
3. **Creator Tracking** - Each permission grant tracks who granted it via `grantedBy` field
4. **Immutability** - Permissions can only be modified by super admins

## Admin Management Interface

### Accessing Permissions Management

1. Navigate to **Admin > Management > Permissions** tab
2. Select a user from the left panel
3. Choose a permission category from the middle panel
4. Check/uncheck permissions on the right panel
5. Click "Save Permissions" to apply changes

### User Interface

The permissions management interface consists of three panels:

- **Left Panel** - User selection with search
- **Middle Panel** - Permission categories
- **Right Panel** - Individual permission checkboxes with descriptions

## Best Practices

1. **Grant Minimum Permissions** - Only grant users the permissions they actually need
2. **Regular Audits** - Periodically review user permissions and remove unused ones
3. **Role-Based Groups** - Group similar permissions together for easier management
4. **Document Changes** - Keep records of who granted/revoked permissions and why
5. **Test After Changes** - Verify permissions work as expected after modifications

## Migration Guide

### For Existing Users

If migrating from a system without granular permissions:

1. Map old roles to new permission sets
2. Create permission groups based on user responsibilities
3. Run migration script to populate `userPermissions` table
4. Test all modules to ensure users have correct access
5. Document the new permission structure

### Sample Permission Sets

#### Accountant
- `invoices_view`, `invoices_edit`
- `payments_view`, `payments_create`, `payments_reconcile`
- `expenses_view`, `expenses_approve`
- `reports_view`, `reports_download`

#### Sales Manager
- `invoices_view`, `invoices_create`, `invoices_send`
- `estimates_view`, `estimates_create`, `estimates_send`, `estimates_approve`
- `clients_view`, `clients_create`, `clients_edit`
- `reports_view`, `reports_download`
- `payments_view`

#### HR Manager
- `hr_employees_manage`, `hr_payroll_view`, `hr_attendance_manage`, `hr_leave_approve`
- `reports_view`, `reports_download`

#### Client Portal User
- `invoices_view`, `invoices_download`
- `payments_view`
- `reports_view` (own only)

## Troubleshooting

### Users Can't See Certain Modules

1. Check if user has view permission for that module
2. Verify user is not filtered by role restrictions
3. Check if module is disabled in system settings
4. Verify database connection and permission records exist

### Permissions Not Updating

1. Ensure user making changes has super_admin role
2. Verify browser cache is cleared
3. Check if user's permission update actually succeeded in database
4. Review error messages in browser console

### Performance Issues

If permission checks are slow:

1. Enable query caching at the router level
2. Batch permission checks instead of individual queries
3. Implement client-side permission caching
4. Use role-based grouping for high-volume users

## Future Enhancements

1. **Time-Based Permissions** - Permissions that expire after a certain date
2. **Conditional Permissions** - Permissions based on invoice amount, project value, etc.
3. **Delegation** - Allow managers to delegate permissions to team members
4. **Audit Trail** - Detailed logging of all permission changes
5. **Permission Templates** - Pre-built permission sets for common roles
6. **API Key Permissions** - Granular API access control
7. **Data Ownership** - Restrict access based on document ownership
