# Quick Reference Card: Enhanced Features

## 🎯 Quick Links

| Component | File | Purpose |
|-----------|------|---------|
| Permission Definitions | `client/src/lib/permissionDefinitions.ts` | 50+ permission definitions |
| Role Management | `client/src/components/EnhancedRoleManagement.tsx` | Role & permission UI |
| Dashboard Widgets | `client/src/lib/dashboardWidgets.ts` | Widget definitions |
| Dashboard Builder | `client/src/components/CustomDashboardBuilder.tsx` | Dashboard drag & drop UI |

---

## 💡 Usage Examples

### Enhanced Role Management

```tsx
import { EnhancedRoleManagement } from "@/components/EnhancedRoleManagement";
import type { EnhancedRole } from "@/components/EnhancedRoleManagement";

// In your component
const [roles, setRoles] = useState<EnhancedRole[]>([]);

return (
  <EnhancedRoleManagement
    roles={roles}
    onRoleUpdate={(role) => updateRole(role)}
    onRoleCreate={(data) => createRole(data)}
    isLoading={isLoading}
  />
);
```

### Custom Dashboard Builder

```tsx
import { CustomDashboardBuilder } from "@/components/CustomDashboardBuilder";
import type { DashboardLayout } from "@/lib/dashboardWidgets";

return (
  <CustomDashboardBuilder
    layout={dashboardLayout}
    onSave={(layout) => saveDashboard(layout)}
    isLoading={isSaving}
  />
);
```

---

## 📋 Available Permissions

### Format: `category.action`

```
Invoices: view, create, edit, delete, approve, export
Estimates: view, create, edit, delete, approve, reject
Payments: view, create, edit, delete, approve
Expenses: view, create, edit, delete, approve
Clients: view, create, edit, delete, manage
Employees: view, create, edit, deactivate, manage
Reports: view, create, export
Users: view, create, edit, delete, manage
Roles: view, create, edit, delete, manage
Settings: view, manage
Workflows: view, create, edit, delete
Dashboard: view, customize
```

---

## 🧩 Widget Types

```
Finance Widgets
├── revenue (Pie chart)
├── expenses (Pie chart)
├── revenue-trend (Line chart)
└── expense-trend (Line chart)

Sales & Quotas
├── invoices (Bar chart)
├── estimates (Bar chart)
├── payments (Bar chart)
└── clients (Table)

HR & Operations
├── employees (Card)
├── projects (Status)
└── tasks (List)

KPI & Summary
├── kpi (Card)
└── summary (Overview)
```

---

## 🎨 Widget Sizes

| Size | Width | Columns |
|------|-------|---------|
| Small | 1 column | 1 |
| Medium | 2 columns | 2 |
| Large | 3 columns | 3 |

---

## 📊 Permission Matrix

```
Super Admin   → All permissions
Admin         → Most + user management
Accountant    → Financial + reports
Project Mgr   → Projects + team
Staff         → Tasks + limited
Client        → View only
```

---

## 🗄️ Database Tables

1. `permission_metadata` - Permission definitions
2. `dashboardLayouts` - User dashboard layouts
3. `dashboardWidgets` - Widgets in layouts
4. `dashboardWidgetData` - Widget data cache

---

## 🔌 Key API Endpoints

```
GET    /api/trpc/permissions.list
POST   /api/trpc/roles.list
POST   /api/trpc/roles.create
POST   /api/trpc/roles.update
GET    /api/trpc/dashboard.getLayout
POST   /api/trpc/dashboard.saveLayout
```

---

## 🛠️ Quick Start

1. Import components from `client/src/components/`
2. Pass roles/layout data as props
3. Connect callbacks to backend APIs
4. Implement backend endpoints
5. Seed permission metadata
6. Test and deploy

---

## 📁 Files Created

✅ `client/src/lib/permissionDefinitions.ts`
✅ `client/src/components/EnhancedRoleManagement.tsx`
✅ `client/src/lib/dashboardWidgets.ts`
✅ `client/src/components/CustomDashboardBuilder.tsx`
✅ `client/src/pages/EnhancedRolesPage.example.tsx`
✅ `ENHANCED_FEATURES_GUIDE.md`
✅ `BACKEND_SETUP_GUIDE.ts`
✅ `FEATURES_IMPLEMENTATION_COMPLETE.md`

---

## 💡 Pro Tips

- Use permission namespacing for organization
- Cache widget data with TTL
- Test roles thoroughly before deployment
- Plan permission hierarchy early
- Log permission changes for audit

---

For detailed information, see:
- `ENHANCED_FEATURES_GUIDE.md` - Full documentation
- `BACKEND_SETUP_GUIDE.ts` - Backend implementation
- `EnhancedRolesPage.example.tsx` - Integration examples
