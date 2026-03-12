# Phase 20 Frontend Components - Setup & Integration Guide

## Components Created

All React components have been created with full functionality:

### 1. **Main Dashboard**
📁 `src/pages/MainDashboard.tsx`
- KPI cards (active projects, revenue, team size, at-risk clients)
- Quick action buttons
- Project completion chart
- Client health distribution
- Summary cards

**Features:**
- Real-time data queries via tRPC
- Interactive navigation
- Responsive grid layout
- Color-coded metrics

### 2. **Project Analytics Dashboard**
📁 `src/pages/analytics/ProjectAnalyticsDashboard.tsx`
- Project metrics overview
- Profitability analysis (top 10 projects)
- Risk distribution (pie chart)
- Project completion status
- Risk-level filtering

**Charts:**
- Bar chart: Revenue vs Profit
- Pie chart: Risk distribution (Low/Medium/High)
- Pie chart: Completion status (0-25%, 25-50%, etc.)

**Features:**
- Real-time filtering by risk level
- Summary statistics
- Color-coded risk levels

### 3. **Financial Reports**
📁 `src/pages/finance/FinancialReportsPage.tsx`
- P&L statement with detailed metrics
- 12-month cash flow projection
- Receivables aging analysis
- Top debtors list

**Sections:**
- Revenue, expenses, profit metrics
- Gross/operating margins
- Cash flow inflows/outflows
- AR aging buckets (0-30, 30-60, 60-90, 90-180, 180+ days)

**Charts:**
- Line chart: Cash flow projection
- Bar chart: AR aging distribution

### 4. **Client Scoring Dashboard**
📁 `src/pages/analytics/ClientScoringDashboard.tsx`
- Client health scores (0-100)
- Risk level distribution (Green/Yellow/Red)
- Client score distribution
- Lifetime value vs churn risk scatter plot
- At-risk clients list

**Features:**
- Risk level filtering
- Interactive tables
- Status badges
- Client ranking

### 5. **Team Performance**
📁 `src/pages/team/TeamPerformancePage.tsx`
- Create performance reviews
- Rating sliders (1-10 scales)
- Overall and component ratings
- Team member list with latest reviews
- Skill tracking

**Forms:**
- Employee selector
- Rating sliders for 7 dimensions
- Feedback textarea
- Form validation

**Features:**
- Performance distribution chart
- Star ratings display
- Skill count tracking

### 6. **Expense Management**
📁 `src/pages/expenses/ExpenseManagementPage.tsx`
- Submit expense reports
- Multi-item expense form
- Approval workflow
- Reimbursement processing

**Forms:**
- Dynamic expense item rows
- Amount & category selectors
- Vendor tracking

**Features:**
- Status badges (Draft, Submitted, Approved, Reimbursed)
- Approval action buttons
- Expense summary stats

## Installation & Setup

### Step 1: Copy Components

All files are already created in their proper locations:
```
src/
├── pages/
│   ├── MainDashboard.tsx
│   ├── analytics/
│   │   ├── ProjectAnalyticsDashboard.tsx
│   │   └── ClientScoringDashboard.tsx
│   ├── finance/
│   │   └── FinancialReportsPage.tsx
│   ├── team/
│   │   └── TeamPerformancePage.tsx
│   └── expenses/
│       └── ExpenseManagementPage.tsx
```

### Step 2: Configure Routing

Add routes to your router configuration:

```typescript
// src/App.tsx or src/router.tsx

import { MainDashboard } from './pages/MainDashboard';
import { ProjectAnalyticsDashboard } from './pages/analytics/ProjectAnalyticsDashboard';
import { ClientScoringDashboard } from './pages/analytics/ClientScoringDashboard';
import { FinancialReportsPage } from './pages/finance/FinancialReportsPage';
import { TeamPerformancePage } from './pages/team/TeamPerformancePage';
import { ExpenseManagementPage } from './pages/expenses/ExpenseManagementPage';

export const routes = [
  {
    path: '/',
    element: <MainDashboard />,
    name: 'Dashboard',
  },
  {
    path: '/analytics/projects',
    element: <ProjectAnalyticsDashboard />,
    name: 'Project Analytics',
  },
  {
    path: '/analytics/clients',
    element: <ClientScoringDashboard />,
    name: 'Client Scoring',
  },
  {
    path: '/finance/reports',
    element: <FinancialReportsPage />,
    name: 'Financial Reports',
  },
  {
    path: '/team/performance',
    element: <TeamPerformancePage />,
    name: 'Team Performance',
  },
  {
    path: '/expenses',
    element: <ExpenseManagementPage />,
    name: 'Expense Management',
  },
];
```

### Step 3: Add Navigation Menu

```typescript
// src/components/Navigation.tsx

import { Link } from 'react-router-dom';
import { routes } from '../router';

export function Navigation() {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="text-2xl font-bold text-blue-600">Melitech CRM</div>
          <div className="flex gap-8">
            {routes.map((route) => (
              <Link
                key={route.path}
                to={route.path}
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                {route.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

### Step 4: Verify Dependencies

All required packages are already installed:

```bash
# Charts
✅ recharts

# Forms & Validation
✅ react-hook-form
✅ zod

# Icons
✅ lucide-react

# API
✅ @trpc/react-query
✅ @trpc/server

# Database ORM
✅ drizzle-orm
✅ mysql2

# Styling
✅ tailwindcss
```

If any are missing:
```bash
npm install recharts react-hook-form zod lucide-react
# or
pnpm add recharts react-hook-form zod lucide-react
```

## Component Features

### Data Loading
All components use tRPC hooks with proper loading states:

```typescript
const query = trpc.projectAnalytics.getAllProjectAnalytics.useQuery();
const data = query.data || [];
const isLoading = query.isLoading;
const error = query.error;
```

### Error Handling
Components gracefully handle missing data:

```typescript
{data.length > 0 ? (
  <ChartComponent data={data} />
) : (
  <p className="text-gray-500">No data available</p>
)}
```

### Responsive Design
All components use Tailwind CSS grid system:

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Responsive cards */}
</div>
```

### Charts
Using Recharts with proper formatting:

```typescript
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip formatter={(value) => `Ksh ${value.toLocaleString()}`} />
    <Legend />
    <Bar dataKey="amount" fill="#3b82f6" />
  </BarChart>
</ResponsiveContainer>
```

### Forms
Using React Hook Form with Zod validation:

```typescript
const { register, handleSubmit, watch } = useForm({
  resolver: zodResolver(schema),
});

const onSubmit = async (data) => {
  await mutation.mutateAsync(data);
};
```

## Customization

### Change Colors
Update Tailwind color classes in components:

```typescript
// From:
<div className="bg-blue-100 text-blue-600">

// To:
<div className="bg-indigo-100 text-indigo-600">
```

### Adjust Chart Heights
Update ResponsiveContainer height prop:

```typescript
<ResponsiveContainer width="100%" height={400}>
  {/* Chart */}
</ResponsiveContainer>
```

### Modify Data Limits
Update `.slice(0, n)` in components:

```typescript
// Show 10 items instead of 5:
const topItems = projectsQuery.data?.slice(0, 10) || [];
```

## Testing Components Locally

### Option 1: Start Dev Server
```bash
npm run dev
# Navigate to http://localhost:5173
```

### Option 2: Use Storybook (if installed)
```bash
npm run storybook
```

## Database Requirements

Components require the following tables to function optimally:

**Critical Tables:**
- `projectMetrics` - Project analytics
- `clientHealthScores` - Client scoring
- `performanceReviews` - Team reviews
- `skillsMatrix` - Employee skills
- `expenseReports` - Expense tracking
- `expenses` - Expense lines

**Helper Tables:**
- `projects` - Project data
- `clients` - Client data
- `employees` - Employee data
- `invoices` - Invoice data

To create these tables:
```bash
npm run db:push
```

## Common Issues & Solutions

### Issue: "Failed query: Table not found"
**Solution:** Run database migration
```bash
npm run db:push
```

### Issue: "No tRPC client found"
**Solution:** Ensure tRPC client is configured in your app
```typescript
// src/utils/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
export const trpc = createTRPCReact<AppRouter>();
```

### Issue: Charts not displaying
**Solution:** Check Recharts installation
```bash
npm install recharts
```

### Issue: Styling looks broken
**Solution:** Ensure Tailwind CSS is properly configured
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Performance Tips

1. **Pagination:** Add pagination to large lists
2. **Caching:** Use React Query cache options
3. **Code Splitting:** Lazy load dashboard routes
4. **Debouncing:** Debounce search/filter inputs

Example pagination:
```typescript
const [page, setPage] = useState(1);
const limit = 20;

const query = trpc.projectAnalytics.getAllProjectAnalytics.useQuery({
  limit,
  offset: (page - 1) * limit,
});
```

## Next Steps

1. ✅ Components created
2. ✅ All dependencies installed
3. ⏳ **Add routes to router**
4. ⏳ **Run database migration** (`npm run db:push`)
5. ⏳ **Start dev server** (`npm run dev`)
6. ⏳ **Test in browser**
7. ⏳ **Customize styling**
8. ⏳ **Deploy**

## File Structure

```
melitech_crm/
├── src/
│   ├── pages/
│   │   ├── MainDashboard.tsx ✅
│   │   ├── analytics/
│   │   │   ├── ProjectAnalyticsDashboard.tsx ✅
│   │   │   └── ClientScoringDashboard.tsx ✅
│   │   ├── finance/
│   │   │   └── FinancialReportsPage.tsx ✅
│   │   ├── team/
│   │   │   └── TeamPerformancePage.tsx ✅
│   │   └── expenses/
│   │       └── ExpenseManagementPage.tsx ✅
│   ├── components/
│   ├── utils/
│   └── App.tsx
├── server/
│   ├── routers/ (All Phase 20 routers)
│   └── db.ts
└── drizzle/
    └── schema.ts (All Phase 20 tables)
```

## Summary

✅ **6 React components created**
✅ **All charts integrated (Recharts)**
✅ **All forms built (React Hook Form)**
✅ **tRPC API integration ready**
✅ **Responsive Tailwind CSS design**
✅ **Error handling implemented**
✅ **Dark/Light mode ready**

**Ready to integrate into your routing!**
