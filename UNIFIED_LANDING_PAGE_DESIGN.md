# Unified Landing Page - Design & Implementation

## Overview

The **Unified Landing Page** serves as a standard entry point for all users across the Melitech CRM system, regardless of their role. This provides a consistent, role-aware dashboard experience that meets each user type's specific needs while maintaining design consistency.

**Access Point:** `http://localhost:3000/dashboard`
**Entry Point:** Click the logo/dashboard icon in the sidebar to navigate here

## Design Principles

### 1. **Role-Aware Personalization**
- Each user sees content tailored to their role
- Dynamic quick actions based on role permissions
- Role-specific metrics and tips

### 2. **Consistency Across Roles**
- Unified layout structure for all users
- Standard component usage (cards, buttons, icons)
- Consistent color scheme and styling

### 3. **Information Hierarchy**
- Welcome message (role-specific)
- Quick actions for immediate access
- Key metrics at a glance
- Getting started tips and resources

### 4. **Performance**
- Minimal data fetching (uses single tRPC query)
- Lazy-loaded components
- Responsive design for all screen sizes

## User Roles & Their Experience

### 1. **Super Admin** 👨‍💼
**Path:** `/crm/super-admin` (also accessible from `/dashboard`)

**Quick Actions:**
- Clients
- Projects
- Invoices
- Payments
- Administration (system settings)
- Reports (system analytics)

**Key Metrics:**
- Total Projects
- Active Clients
- Pending Invoices
- Monthly Revenue

**Special Feature:**
- System Status Panel showing:
  - Database connection status
  - API server status
  - Active services status

**Getting Started:**
- System monitoring tips
- Quick access to Administration
- Link to Settings

---

### 2. **Accountant** 👨‍💻
**Path:** `/crm/accountant`

**Quick Actions:**
- Invoices
- Payments
- Accounting (account management)
- Expenses
- Budgets

**Key Metrics:**
- Total Projects
- Active Clients
- Pending Invoices
- Monthly Revenue
- **Total Expenses** (role-specific)

**Getting Started:**
- Pro tips for financial management
- Quick access to:
  - View Reports
  - Settings

---

### 3. **HR Manager** 👩‍💼
**Path:** `/crm/hr`

**Quick Actions:**
- Clients
- Projects
- Invoices
- Payments
- Employees
- Payroll
- Attendance

**Key Metrics:**
- Total Projects
- Active Clients
- Pending Invoices
- Monthly Revenue
- **Total Employees** (role-specific)

**Getting Started:**
- Payroll automation tips
- Quick access to:
  - View Reports
  - Settings

---

### 4. **Project Manager** 📊
**Path:** `/crm/project-manager`

**Quick Actions:**
- Clients
- Projects
- Invoices
- Payments
- Team Tasks
- Milestones

**Key Metrics:**
- Total Projects
- Active Clients
- Pending Invoices
- Monthly Revenue
- **Active Projects** (role-specific)

**Getting Started:**
- Project management tips
- Milestone tracking hints
- Quick links to Reports

---

### 5. **Staff Member** 👤
**Path:** `/crm/staff`

**Quick Actions:**
- Clients
- Projects
- Invoices
- Payments

**Key Metrics:**
- Total Projects
- Active Clients
- Pending Invoices
- Monthly Revenue

**Getting Started:**
- General productivity tips
- Task management hints

---

### 6. **Admin** 🛡️
**Path:** `/crm/admin`

**Quick Actions:**
- Clients
- Projects
- Invoices
- Payments
- Administration

**Key Metrics:**
- Total Projects
- Active Clients
- Pending Invoices
- Monthly Revenue

---

### 7. **Client User** 🏢
**Path:** `/client-portal`

**Limited Access:**
- View own projects
- View invoices
- Make payments
- View estimates

---

## Component Structure

### Main Component: `UnifiedLanding.tsx`

Located at: `client/src/pages/UnifiedLanding.tsx`

#### Key Functions:

1. **getRoleWelcome()**
   - Returns role-specific greeting and subtitle
   - Customizes welcome message based on user role

2. **getQuickActions()**
   - Builds array of quick action cards
   - Base actions available to all users
   - Role-specific actions appended based on role
   - Each action includes:
     - Title, description, icon
     - Navigation link
     - Color scheme
     - Optional stats (e.g., count of items)

3. **getOverviewMetrics()**
   - Displays key business metrics
   - Base metrics for all users
   - Role-specific metrics added dynamically
   - Clickable to navigate to relevant pages

#### Integration Points:

- **DashboardLayout:** Main layout wrapper
- **trpc.dashboard.metrics:** Fetches metrics data
- **Navigation:** Uses wouter `navigate()` for routing

## Customization Guide

### Adding a New Role Quick Action

Edit `getQuickActions()` in `UnifiedLanding.tsx`:

```typescript
const roleSpecificActions: Record<string, QuickAction[]> = {
  new_role: [
    {
      id: "unique-id",
      title: "Action Title",
      description: "Action description",
      icon: <IconComponent className="w-8 h-8" />,
      href: "/route-path",
      color: "from-color-500 to-color-600",
      stats: { label: "Label", value: "value" },
    },
  ],
};
```

### Adding a New Metric

Edit `getOverviewMetrics()`:

```typescript
if (user?.role === "your_role") {
  baseMetrics.push({
    title: "Metric Title",
    value: metrics.yourMetric,
    description: "Description",
    icon: <IconComponent className="w-5 h-5" />,
    color: "border-l-color-500 bg-color-50 dark:bg-color-900/20",
    href: "/path",
  });
}
```

### Changing Welcome Message

Edit `roleMessages` in `getRoleWelcome()`:

```typescript
const roleMessages: Record<string, { greeting: string; subtitle: string }> = {
  your_role: {
    greeting: "Your Greeting",
    subtitle: "Your subtitle",
  },
};
```

### Adding System Status Widget

Currently available for Super Admin. To add for another role:

```typescript
{user?.role === "your_role" && (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold tracking-tight">Custom Title</h2>
    {/* Your custom widget */}
  </div>
)}
```

## Styling & Design

### Color Scheme

Quick action cards use Tailwind gradient colors:
- `from-blue-500 to-blue-600` - Projects
- `from-green-500 to-green-600` - Clients
- `from-purple-500 to-purple-600` - Invoices
- `from-emerald-500 to-emerald-600` - Payments
- `from-orange-500 to-orange-600` - Expenses
- `from-pink-500 to-pink-600` - Accounting
- `from-indigo-500 to-indigo-600` - Budgets
- `from-cyan-500 to-cyan-600` - Employees
- `from-lime-500 to-lime-600` - Payroll
- `from-rose-500 to-rose-600` - Attendance
- `from-violet-500 to-violet-600` - Custom actions
- `from-fuchsia-500 to-fuchsia-600` - Milestones
- `from-amber-500 to-amber-600` - Reports

### Responsive Design

- **Mobile:** Single column layout, compact spacing
- **Tablet (md):** 2 columns for quick actions, 2 columns for metrics
- **Desktop (lg):** Up to 4 columns
- **Large Screens (xl):** Up to 5 columns

## Navigation Flow

```
Logo/Dashboard Click
        ↓
Navigate to /dashboard
        ↓
UnifiedLanding Component Loads
        ↓
Fetches metrics via trpc.dashboard.metrics
        ↓
Role-based content renders (welcome, actions, metrics)
        ↓
User can:
  - Click quick action cards → Navigate to specific modules
  - Click metric cards → Navigate to relevant pages
  - Use sidebar navigation for other modules
  - Click profile for account settings
```

## API Dependencies

### tRPC Queries Used:

1. **`trpc.dashboard.metrics`**
   - Returns aggregated metrics
   - Required fields:
     - `totalProjects`
     - `activeClients`
     - `pendingInvoices`
     - `monthlyRevenue`
     - `totalProducts`
     - `totalServices`
     - `totalEmployees`
     - `totalExpenses`
     - `budgetsCount`
     - `lprosCount`

## Routing Configuration

**App.tsx Route Definition:**

```typescript
<Route path={"/dashboard"} component={UnifiedLanding} />
```

**DashboardLayout Updates:**
- Logo button navigates to `/dashboard`
- Sidebar "Dashboard" link points to `/dashboard`

## User Flow Example

### Day-in-Life: Accountant

1. **9:00 AM** - Opens CRM, logs in
2. **9:05 AM** - Clicks logo → Lands on Unified Dashboard
3. **Dashboard Shows:**
   - "Financial Dashboard" welcome
   - Quick access to: Invoices, Payments, Accounting, Expenses, Budgets
   - Key metrics: Revenue, Projects, Clients, Pending Invoices, Total Expenses
4. **9:10 AM** - Clicks "Invoices" → Navigates to invoices module
5. **1:00 PM** - Clicks logo again → Returns to Unified Dashboard
6. **3:00 PM** - Clicks "Reports" → Views financial reports

## Future Enhancements

1. **Customizable Dashboard**
   - Allow users to arrange quick actions
   - Save preferred layout per role

2. **Real-time Metrics**
   - WebSocket integration for live updates
   - Refresh indicators

3. **Shortcuts & Bookmarks**
   - User-defined quick access
   - Personal shortcuts menu

4. **Activity Feed**
   - Recent user activities
   - Team collaborations
   - System notifications

5. **Performance Analytics**
   - Role-specific KPIs
   - Trend indicators
   - Comparative metrics

6. **Customizable Themes**
   - Role-based color schemes
   - Brand customization
   - Dark mode per role

## Troubleshooting

### Landing page shows generic messages
- **Cause:** User role not set correctly
- **Solution:** Update user role in database using admin panel

### Metrics not updating
- **Cause:** tRPC query failing
- **Solution:** Check browser console for error messages; verify database connectivity

### Quick actions not navigating
- **Cause:** Route not defined
- **Solution:** Add route to App.tsx Router component

### Role-specific content not showing
- **Cause:** Conditional logic not matching role
- **Solution:** Verify user role value matches string in `roleMessages` or role-specific arrays

## Files Modified

1. **`client/src/pages/UnifiedLanding.tsx`** (NEW)
   - Main landing page component

2. **`client/src/App.tsx`**
   - Added import for UnifiedLanding
   - Added route: `/dashboard` → UnifiedLanding

3. **`client/src/components/DashboardLayout.tsx`**
   - Updated logo button: `/` → `/dashboard`
   - Updated sidebar "Dashboard" link: `/crm/super-admin` → `/dashboard`

## Summary

The Unified Landing Page provides a consistent, role-aware entry point for all CRM users. It combines standardized design with personalized content to ensure every user sees relevant information and quick actions for their role. The design is extensible, allowing easy addition of new roles, actions, and metrics as the system grows.

**Key Benefits:**
✅ Single entry point for all users
✅ Role-specific personalization
✅ Consistent design language
✅ Easy to customize and extend
✅ Performance-optimized
✅ Mobile-responsive
✅ Accessible interface
