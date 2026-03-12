# Backend Implementation Complete - Setup Guide

## Overview

All backend API endpoints and database schema have been created. This document covers the remaining setup steps and how to integrate the frontend components.

## ✅ What's Complete

### Database Schema (Drizzle)
- ✅ `permissionMetadata` table - for storing permission definitions
- ✅ `dashboardLayouts` table - for storing user dashboard configurations
- ✅ `dashboardWidgets` table - for storing widgets in layouts
- ✅ `dashboardWidgetData` table - for caching widget data
- ✅ `permissionAuditLog` table - for tracking permission changes
- ✅ All indexes and foreign keys configured
- ✅ File: `drizzle/migrations/0010_enhanced_permissions_and_dashboard.sql`
- ✅ File: `drizzle/schema.ts` (updated with new tables)

### API Endpoints (tRPC)
- ✅ `enhancedPermissions.list()` - Get all permissions
- ✅ `enhancedPermissions.getByCategory(category)` - Get permissions by category
- ✅ `enhancedPermissions.getCategories()` - Get all categories
- ✅ `enhancedPermissions.getDetail(permissionId)` - Get single permission
- ✅ `enhancedPermissions.search(query)` - Search permissions
- ✅ `enhancedPermissions.getForRole(roleId)` - Get role permissions
- ✅ `enhancedPermissions.assignToRole(roleId, permissionId)` - Assign permission
- ✅ `enhancedPermissions.removeFromRole(roleId, permissionId)` - Remove permission
- ✅ `enhancedPermissions.getAuditLog()` - Get audit logs
- ✅ `enhancedDashboard.getDefault()` - Get user's default layout
- ✅ `enhancedDashboard.getLayout(layoutId)` - Get specific layout
- ✅ `enhancedDashboard.listLayouts()` - List all user layouts
- ✅ `enhancedDashboard.createLayout(layout)` - Create new layout
- ✅ `enhancedDashboard.updateLayout(layout)` - Update layout
- ✅ `enhancedDashboard.deleteLayout(layoutId)` - Delete layout
- ✅ `enhancedDashboard.addWidget(layoutId, widget)` - Add widget
- ✅ `enhancedDashboard.removeWidget(widgetId)` - Remove widget
- ✅ `enhancedDashboard.updateWidget(id, {...})` - Update widget
- ✅ `enhancedDashboard.cacheWidgetData(...)` - Cache widget data
- ✅ `enhancedDashboard.getCachedData(...)` - Get cached data
- ✅ Files: `server/routers/enhancedPermissions.ts`, `server/routers/enhancedDashboard.ts`
- ✅ Registered in: `server/routers.ts`

### Frontend Hooks (React Query)
- ✅ `usePermissions()` - fetch all permissions
- ✅ `usePermissionsByCategory(category)` - fetch permissions by category
- ✅ `usePermissionCategories()` - fetch all categories
- ✅ `useRolePermissions(roleId)` - fetch role permissions
- ✅ `useAssignPermissionToRole()` - assign permission mutation
- ✅ `useRemovePermissionFromRole()` - remove permission mutation
- ✅ `usePermissionAuditLog()` - fetch audit logs
- ✅ `useSearchPermissions(query)` - search permissions
- ✅ `useDefaultDashboardLayout()` - fetch default layout
- ✅ `useDashboardLayout(layoutId)` - fetch specific layout
- ✅ `useDashboardLayouts()` - list all layouts
- ✅ `useCreateDashboardLayout()` - create layout mutation
- ✅ `useUpdateDashboardLayout()` - update layout mutation
- ✅ `useDeleteDashboardLayout()` - delete layout mutation
- ✅ `useAddWidget()` - add widget mutation
- ✅ `useRemoveWidget()` - remove widget mutation
- ✅ `useUpdateWidget()` - update widget mutation
- ✅ `useCacheWidgetData()` - cache data mutation
- ✅ `useCachedWidgetData()` - fetch cached data
- ✅ File: `client/src/hooks/useEnhancedPermissions.ts`
- ✅ File: `client/src/hooks/useEnhancedDashboard.ts`

## 🚀 Setup Steps

### Step 1: Apply Database Migrations

Run the database migration to create new tables:

```bash
# Option A: Using SQL file directly (recommended for Windows)
mysql -h localhost -u root -p melitech_crm < drizzle/migrations/0010_enhanced_permissions_and_dashboard.sql

# Option B: Using Drizzle migrations
pnpm run db:push

# Option C: Using Docker
docker exec melitech_crm_db mysql -u root -proot melitech_crm < drizzle/migrations/0010_enhanced_permissions_and_dashboard.sql
```

### Step 2: Seed Permission Metadata

Populate the permission_metadata table with 50+ permission definitions:

```bash
# Using npm
pnpm tsx scripts/seed-permissions.ts

# Or add to your regular seed script
pnpm run db:seed
```

**Expected Output:**
```
Seeding permission metadata...
✓ Seeded permission: View Invoices
✓ Seeded permission: Create Invoices
✓ Seeded permission: Edit Invoices
... (50+ permissions total)
✓ Permission seeding completed!
```

### Step 3: Verify API Endpoints

Test that the API endpoints are working:

```bash
# Start dev server
pnpm run dev

# Test in browser console or Postman:
api.enhancedPermissions.list.query()
api.enhancedDashboard.getDefault.query()
```

### Step 4: Integrate Frontend Components

The frontend components are already created in previous session:
- `client/src/components/EnhancedRoleManagement.tsx`
- `client/src/components/CustomDashboardBuilder.tsx`
- `client/src/lib/permissionDefinitions.ts`
- `client/src/lib/dashboardWidgets.ts`

### Step 5: Update Existing Pages

#### A. Update Roles Page

In your `client/src/pages/Roles.tsx` or similar:

```typescript
import { EnhancedRoleManagement } from '@/components/EnhancedRoleManagement';
import { useRoles } from '@/hooks/useRoles'; // existing hook
import { api } from '@/utils/api';

export function RolesPage() {
  const { data: roles, isLoading } = useRoles();

  const updateRoleMutation = api.roles.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const createRoleMutation = api.roles.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  return (
    <EnhancedRoleManagement
      roles={roles || []}
      onRoleUpdate={updateRoleMutation.mutate}
      onRoleCreate={createRoleMutation.mutate}
      isLoading={isLoading}
    />
  );
}
```

#### B. Create Dashboard Settings Page

Create new file: `client/src/pages/DashboardSettings.tsx`

```typescript
import { CustomDashboardBuilder } from '@/components/CustomDashboardBuilder';
import { useDefaultDashboardLayout, useUpdateDashboardLayout } from '@/hooks/useEnhancedDashboard';

export function DashboardSettingsPage() {
  const { data: layout, isLoading } = useDefaultDashboardLayout();
  const updateMutation = useUpdateDashboardLayout();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Settings</h1>
        <p className="text-gray-500">Customize your dashboard layout and widgets</p>
      </div>

      <CustomDashboardBuilder
        layout={layout || null}
        onSave={(layout) => updateMutation.mutate(layout)}
        isLoading={updateMutation.isPending || isLoading}
      />
    </div>
  );
}
```

#### C. Add Menu Items

Update your main navigation/settings menu:

```typescript
const settingsMenuItems = [
  // ... existing items
  {
    label: 'Role Management',
    href: '/settings/roles',
    icon: 'Lock',
  },
  {
    label: 'Dashboard',
    href: '/settings/dashboard',
    icon: 'LayoutGrid',
  },
  // ... other items
];
```

### Step 6: Import Required Types and Exports

Make sure these are exported from schema for TypeScript support:

```typescript
// Already done in drizzle/schema.ts:
export type PermissionMetadata = typeof permissionMetadata.$inferSelect;
export type DashboardLayout = typeof dashboardLayouts.$inferSelect;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
export type PermissionAuditLog = typeof permissionAuditLog.$inferSelect;
```

## 🧪 Testing Checklist

### Backend API Tests
- [ ] `enhancedPermissions.list.query()` returns 50+ permissions
- [ ] Permissions are grouped by 12 categories
- [ ] `enhancedPermissions.getForRole(roleId)` returns assigned permissions only
- [ ] Can assign permission to role
- [ ] Can remove permission from role
- [ ] Permission audit log records changes
- [ ] `enhancedDashboard.getDefault()` returns user's default layout
- [ ] Can create new dashboard layout
- [ ] Can update layout with widgets
- [ ] Can add/remove widgets
- [ ] Layout data is saved to database
- [ ] Permissions are enforced (non-admins can't modify others' layouts)

### Frontend Component Tests
- [ ] EnhancedRoleManagement component renders
- [ ] Permissions display by category
- [ ] Can search roles
- [ ] Can toggle permissions on/off
- [ ] Progress bar shows permission coverage
- [ ] Create role modal works
- [ ] Edit role modal works
- [ ] CustomDashboardBuilder renders
- [ ] Can add/remove widgets
- [ ] Grid column selector works
- [ ] Can save layout changes
- [ ] Can reset to default

### Integration Tests
- [ ] Roles page with EnhancedRoleManagement works
- [ ] Dashboard settings page loads
- [ ] Can customize dashboard and save
- [ ] Default layout is applied to new users
- [ ] Audit logs track all changes
- [ ] Permissions are enforced at API level

## 📊 Database Verification

Check that tables were created:

```sql
-- In MySQL:
SHOW TABLES LIKE '%dashboard%';
SHOW TABLES LIKE '%permission%';

SELECT COUNT(*) FROM permission_metadata;
```

Expected: 50+ rows in `permission_metadata`, 0 rows in others (until user interaction)

## 📝 Seed Data Format

The `seed-permissions.ts` script creates permissions in this format:

```json
{
  "id": "uuid",
  "permissionId": "invoice.create",
  "label": "Create Invoices",
  "description": "Create new invoices",
  "category": "Invoices",
  "icon": "plus",
  "isSystem": 1
}
```

This matches the `PERMISSION_DEFINITIONS` array from `permissionDefinitions.ts`.

## 🔗 API Response Format Examples

### List Permissions
```json
[
  {
    "id": "invoice.view",
    "label": "View Invoices",
    "description": "View all invoices",
    "category": "Invoices",
    "icon": "eye",
    "isSystem": true
  }
]
```

### Get Dashboard Layout
```json
{
  "id": "layout-uuid",
  "name": "My Dashboard",
  "description": "Default dashboard",
  "gridColumns": 6,
  "isDefault": true,
  "widgets": [
    {
      "id": "widget-uuid",
      "widgetType": "revenue",
      "widgetTitle": "Revenue by Client",
      "widgetSize": "medium",
      "rowIndex": 0,
      "colIndex": 0,
      "refreshInterval": 300,
      "config": {}
    }
  ],
  "createdAt": "2026-02-25T...",
  "updatedAt": "2026-02-25T..."
}
```

## 🐛 Troubleshooting

### Migration Failed
- Check MySQL is running: `docker-compose ps`
- Verify database exists: `SHOW DATABASES;`
- Check syntax in migration file
- Run manually with `mysql` command if Drizzle fails

### Seed Script Failed
- Check database connection in `server/db.ts`
- Verify `permissionMetadata` table exists
- Check permission definitions have unique `permissionId`
- Review error message for specific issues

### API Endpoint 404
- Verify routers are imported in `server/routers.ts`
- Check router is added to `appRouter`
- Rebuild with `pnpm run build`
- Restart server with `pnpm run dev`

### TypeScript Errors
- Run `pnpm run check` to see all errors
- Verify all exports in `drizzle/schema.ts`
- Check hook imports reference correct paths
- Re-generate types if needed

## 📚 Documentation Files

Reference these files for more details:

1. `ENHANCED_FEATURES_GUIDE.md` - Complete feature documentation
2. `FEATURES_IMPLEMENTATION_COMPLETE.md` - Summary and implementation guide
3. `DEVELOPER_QUICK_GUIDE.md` - Quick reference
4. `BACKEND_SETUP_GUIDE.ts` - Backend specifics (original guide)
5. `EnhancedRolesPage.example.tsx` - Integration examples

## 🎯 Next Steps After Setup

1. **Customize Widget Library** - Add more widget types specific to your needs
2. **Add Dashboard Templates** - Create pre-built dashboard templates by role
3. **Implement Rich Analytics** - Connect widgets to real data queries
4. **Add Permission Reports** - Show who has which permissions
5. **Setup Permission Inheritance** - Allow roles to inherit from other roles
6. **Add Activity Dashboard** - Show recent permission changes to admins

## 💡 Notes

- All API procedures are protected (require authenticated user)
- Permissions system is role-based but can be extended to user-specific
- Dashboard layouts are per-user (no sharing currently)
- Widget data caching is automatic with configurable TTL
- Audit logs track all permission changes for compliance

## ❓ Support

If you encounter issues:

1. Check Docker logs: `docker-compose logs app`
2. Check database logs: `docker-compose logs db`
3. Run TypeScript check: `pnpm run check`
4. Review migration log: Check if `0010_enhanced_permissions_and_dashboard.sql` ran
5. Verify permissions were seeded: `SELECT COUNT(*) FROM permission_metadata;`
