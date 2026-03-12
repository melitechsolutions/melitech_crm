# Enhanced Role Management & Custom Dashboard Builder

## Overview

This document describes two major new features being added to the Melitech CRM system:

1. **Clear Permission Labeling in Role Management** - Granular permission system with well-organized categories
2. **Custom Dashboard Builder** - Drag & drop interface for creating personalized dashboards

---

## Feature 1: Enhanced Role Management with Clear Permission Labels

### Purpose
Provide administrators with a clear, intuitive interface to manage roles and assign permissions with explicit labels and descriptions.

### Key Components

#### 1. **Permission Definitions** (`client/src/lib/permissionDefinitions.ts`)

Defines all available permissions in the system with:
- **Clear Labels**: Human-readable permission names (e.g., "Create Invoices")
- **Descriptions**: What each permission allows
- **Categories**: Organized by module (Invoices, Estimates, Payments, etc.)
- **Icons**: Visual indicators for permission types

**Available Permissions Categories:**
- Invoices (View, Create, Edit, Delete, Approve, Export)
- Estimates (View, Create, Edit, Delete, Approve, Reject)
- Payments (View, Create, Edit, Delete, Approve)
- Expenses (View, Create, Edit, Delete, Approve)
- Clients (View, Create, Edit, Delete, Manage)
- Employees (View, Create, Edit, Deactivate, Manage)
- Reports (View, Create, Export)
- Users (View, Create, Edit, Delete, Manage)
- Roles & Permissions (View, Create, Edit, Delete, Manage)
- Settings (View, Manage)
- Workflows (View, Create, Edit, Delete)
- Dashboard (View, Customize)

#### 2. **Enhanced Role Management Component** (`client/src/components/EnhancedRoleManagement.tsx`)

Features:
- **Role Cards**: Visual display of roles with:
  - Permission counts and progress bars
  - System vs Custom role indicators
  - User count assigned to role
  - Edit and Delete actions

- **Create/Edit Dialog**: 
  - Role details (display name, description)
  - Tabbed permission interface organized by category
  - Permission summary showing selected count
  - Visual indicators (checkmarks) for assigned permissions

- **Search & Filter**: Find roles quickly by name or description

### Usage Example

```tsx
import { EnhancedRoleManagement } from "@/components/EnhancedRoleManagement";

function RolesPage() {
  // Fetch roles from backend
  const { data: roles } = useQuery();

  const handleRoleUpdate = (role: EnhancedRole) => {
    // Update role with new permissions
    updateRoleMutation.mutate(role);
  };

  const handleRoleCreate = (roleData) => {
    // Create new role
    createRoleMutation.mutate(roleData);
  };

  return (
    <EnhancedRoleManagement
      roles={roles}
      onRoleUpdate={handleRoleUpdate}
      onRoleCreate={handleRoleCreate}
      isLoading={isLoading}
    />
  );
}
```

### Backend Integration

Update the following endpoints:

1. **GET /api/roles/permissions** - List all permissions with metadata
2. **POST /api/roles** - Create role with permission list
3. **PUT /api/roles/:id** - Update role permissions
4. **GET /api/roles** - Get all roles with permission summaries

---

## Feature 2: Custom Dashboard Builder

### Purpose
Allow users to create personalized dashboards with drag & drop widgets, including analytics and charts specific to their role.

### Key Components

#### 1. **Dashboard Widget Definitions** (`client/src/lib/dashboardWidgets.ts`)

Defines all available dashboard widgets:

**Finance Widgets:**
- Revenue by Client (Pie chart)
- Expenses by Category (Pie chart)
- Revenue Trend (Line chart - monthly)
- Expense Trend (Line chart - monthly)

**Sales & Quotas Widgets:**
- Invoice Status (Distribution: Draft, Sent, Paid, Overdue)
- Estimate Status (Distribution of all states)
- Payment Status (Distribution of all states)
- Top Clients (Table of best performers)

**HR & Operations Widgets:**
- Employee Overview (Count by dept/status)
- Active Projects (Status distribution)
- Recent Tasks (Upcoming tasks list)

**KPI & Summary:**
- Key Metrics (Important KPIs)
- Summary (Overall business snapshot)

**Widget Properties:**
- `id`: Unique identifier
- `type`: Widget type (revenue, expenses, etc.)
- `title`: Display title
- `description`: Purpose description
- `size`: small (1 col), medium (2 cols), large (3 cols)
- `row`: Grid row position
- `col`: Grid column position
- `refreshInterval`: Auto-refresh time in seconds
- `config`: Widget-specific configuration

#### 2. **Custom Dashboard Builder Component** (`client/src/components/CustomDashboardBuilder.tsx`)

Features:

**Edit Mode:**
- Toggle edit mode to modify layout
- Add widgets from categorized library
- Remove widgets with X button
- Drag & drop to reposition (placeholder for advanced feature)
- Adjust grid columns (4, 6, 8, or 12)

**Widget Management:**
- Organized by category (Finance, Sales, Operations, KPI)
- Size indicators showing grid span
- Visual preview of widget type
- Position tracking (row/col)

**Layout Controls:**
- Save button (only shows if changes made)
- Reset to default button
- Done Editing button

**Display Mode:**
- Clean, card-based widget display
- Color-coded by category
- Optimized spacing

### Usage Example

```tsx
import { CustomDashboardBuilder } from "@/components/CustomDashboardBuilder";

function DashboardSettingsPage() {
  const [layout, setLayout] = useState<DashboardLayout | null>(null);
  
  const handleSaveDashboard = (updatedLayout: DashboardLayout) => {
    saveDashboardMutation.mutate(updatedLayout);
  };

  return (
    <CustomDashboardBuilder
      layout={layout}
      onSave={handleSaveDashboard}
      isLoading={isSaving}
    />
  );
}
```

### Dashboard Layout Storage

**Schema:**
```typescript
interface DashboardLayout {
  id: string;
  name: string;
  userId: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  gridColumns: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Backend Integration

Create new API endpoints:

1. **GET /api/dashboard/layouts** - List user's saved layouts
2. **POST /api/dashboard/layouts** - Create new layout
3. **PUT /api/dashboard/layouts/:id** - Update layout
4. **DELETE /api/dashboard/layouts/:id** - Delete layout
5. **GET /api/dashboard/layouts/:id/data** - Get data for layout widgets

---

## Implementation Steps

### Phase 1: Backend Setup (2-3 days)
- [ ] Create `DashboardLayout` table in database
- [ ] Create `DashboardWidget` records for each widget type
- [ ] Create dashboard API endpoints
- [ ] Update permission system with new permission types
- [ ] Add permission seeding for system roles

### Phase 2: UI Components (3-4 days)
- [ ] Implement permission definitions
- [ ] Build EnhancedRoleManagement component
- [ ] Build CustomDashboardBuilder component
- [ ] Create dashboard data fetching hooks
- [ ] Implement chart/analytics components

### Phase 3: Integration (2-3 days)
- [ ] Integrate components into settings pages
- [ ] Add navigation/menu items
- [ ] Connect to backend APIs
- [ ] User testing and refinement
- [ ] Documentation update

### Phase 4: Advanced Features (Optional - Future)
- [ ] Real drag & drop repositioning
- [ ] Advanced chart customization
- [ ] Widget resize functionality
- [ ] Export dashboard as PDF
- [ ] Share layouts with team members
- [ ] Dashboard templates for different roles

---

## Data Flow

### Permission Assignment
```
User (Settings - Roles) 
  → Select Role 
  → View Permissions (categorized)
  → Toggle Permissions
  → Save Changes
  → UpdateRole API Call
  → Permission Cache Invalidated
  → UI Updated
```

### Dashboard Customization
```
User (Dashboard Settings)
  → Edit Mode Enabled
  → Add/Remove Widgets
  → Adjust Grid
  → Save Layout
  → SaveDashboard API Call
  → Layout Stored in DB
  → Dashboard Refreshed
```

---

## Security Considerations

1. **Permission Validation**: Always validate permissions on backend
2. **Row-Level Security**: Ensure users only see data they have permissions for
3. **Audit Logging**: Log all permission changes
4. **Role Inheritance**: Consider role hierarchy (admin > manager > staff)
5. **Default Permissions**: System roles (super_admin, admin) cannot be modified

---

## User Experience Enhancements

### For Administrators:
- Bulk permission assignment
- Permission templates for common roles
- Permission usage analytics (which permissions are used most)
- Audit trail of permission changes

### For Regular Users:
- Pre-built dashboard templates by role
- Quick-start layouts for common tasks
- Save multiple dashboard variations
- Share dashboard configurations

---

## Future Enhancements

1. **AI-Powered Dashboards**: Auto-suggest widgets based on user behavior
2. **Real-time Widgets**: WebSocket updates for key metrics
3. **Mobile Dashboard**: Responsive widget layouts for mobile
4. **Dashboard Publishing**: Share read-only dashboard links
5. **Widget Plugins**: Allow custom widget development
6. **Smart Permissions**: ML-based permission recommendations
7. **Permission Delegation**: Allow managers to assign subset of their permissions
8. **Time-based Permissions**: Temporary elevated permissions

---

## Files Created/Modified

### New Files:
- `client/src/lib/permissionDefinitions.ts` - Permission definitions
- `client/src/components/EnhancedRoleManagement.tsx` - Role mgmt component
- `client/src/lib/dashboardWidgets.ts` - Widget definitions
- `client/src/components/CustomDashboardBuilder.tsx` - Dashboard builder

### To Be Modified:
- `client/src/pages/Roles.tsx` - Replace with EnhancedRoleManagement
- `client/src/pages/Settings.tsx` - Add dashboard builder section
- Database schema - Add DashboardLayout and related tables
- Backend API routes - Add dashboard and permission endpoints

---

## Testing Checklist

- [ ] Create role with all permission categories
- [ ] Edit role and toggle permissions individually
- [ ] Add widgets to dashboard
- [ ] Remove widgets from dashboard
- [ ] Save and load dashboard layouts
- [ ] Verify permissions are enforced on backend
- [ ] Test with different screen sizes/resolutions
- [ ] Cross-browser compatibility
- [ ] Performance with large number of widgets
- [ ] Permission caching and invalidation

---

## Localization

All UI text should be prepared for internationalization:
- Permission labels use i18n keys
- Widget titles and descriptions use i18n
- Category names use i18n
- Button and dialog text use i18n

Example:
```tsx
<Label>{t("permissions.invoice.create")}</Label>
<p>{t("permissions.invoice.create_description")}</p>
```
