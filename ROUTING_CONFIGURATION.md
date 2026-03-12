# Phase 20 Frontend - Routing Configuration Guide

## Quick Setup

Add these 3 simple steps to activate your Phase 20 dashboard:

### Step 1: Import Components

Add to your main App.tsx file:

```typescript
// src/App.tsx

import { MainDashboard } from './pages/MainDashboard';
import { ProjectAnalyticsDashboard } from './pages/analytics/ProjectAnalyticsDashboard';
import { ClientScoringDashboard } from './pages/analytics/ClientScoringDashboard';
import { FinancialReportsPage } from './pages/finance/FinancialReportsPage';
import { TeamPerformancePage } from './pages/team/TeamPerformancePage';
import { ExpenseManagementPage } from './pages/expenses/ExpenseManagementPage';
```

### Step 2: Define Routes

```typescript
// React Router v6 example
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Existing routes */}
        
        {/* Phase 20 Routes */}
        <Route path="/" element={<MainDashboard />} />
        <Route path="/analytics/projects" element={<ProjectAnalyticsDashboard />} />
        <Route path="/analytics/clients" element={<ClientScoringDashboard />} />
        <Route path="/finance/reports" element={<FinancialReportsPage />} />
        <Route path="/team/performance" element={<TeamPerformancePage />} />
        <Route path="/expenses" element={<ExpenseManagementPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Step 3: Add Navigation (Optional)

```typescript
// src/components/Navigation.tsx

import { Link } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Users, DollarSign, ClipboardList, Settings } from 'lucide-react';

export function Navigation() {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/analytics/projects', label: 'Projects', icon: BarChart3 },
    { path: '/analytics/clients', label: 'Clients', icon: Users },
    { path: '/finance/reports', label: 'Finance', icon: DollarSign },
    { path: '/team/performance', label: 'Team', icon: ClipboardList },
    { path: '/expenses', label: 'Expenses', icon: Settings },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="text-2xl font-bold text-blue-600">Melitech</div>
          
          <div className="flex gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

---

## Route Structure

```
/                        → MainDashboard
├── /analytics/
│   ├── projects        → ProjectAnalyticsDashboard
│   └── clients         → ClientScoringDashboard
├── /finance/
│   └── reports         → FinancialReportsPage
├── /team/
│   └── performance     → TeamPerformancePage
└── /expenses           → ExpenseManagementPage
```

---

## Alternative Router Configuration

### Using Next.js App Router

```typescript
// app/page.tsx
import { MainDashboard } from '@/pages/MainDashboard';
export default function Home() {
  return <MainDashboard />;
}

// app/analytics/projects/page.tsx
import { ProjectAnalyticsDashboard } from '@/pages/analytics/ProjectAnalyticsDashboard';
export default function ProjectsPage() {
  return <ProjectAnalyticsDashboard />;
}

// app/analytics/clients/page.tsx
import { ClientScoringDashboard } from '@/pages/analytics/ClientScoringDashboard';
export default function ClientsPage() {
  return <ClientScoringDashboard />;
}

// app/finance/reports/page.tsx
import { FinancialReportsPage } from '@/pages/finance/FinancialReportsPage';
export default function ReportsPage() {
  return <FinancialReportsPage />;
}

// app/team/performance/page.tsx
import { TeamPerformancePage } from '@/pages/team/TeamPerformancePage';
export default function PerformancePage() {
  return <TeamPerformancePage />;
}

// app/expenses/page.tsx
import { ExpenseManagementPage } from '@/pages/expenses/ExpenseManagementPage';
export default function ExpensesPage() {
  return <ExpenseManagementPage />;
}
```

### Using TanStack Router

```typescript
// routes.ts
import { RootRoute, Route, Router } from '@tanstack/react-router';
import { MainDashboard } from './pages/MainDashboard';
import { ProjectAnalyticsDashboard } from './pages/analytics/ProjectAnalyticsDashboard';
import { ClientScoringDashboard } from './pages/analytics/ClientScoringDashboard';
import { FinancialReportsPage } from './pages/finance/FinancialReportsPage';
import { TeamPerformancePage } from './pages/team/TeamPerformancePage';
import { ExpenseManagementPage } from './pages/expenses/ExpenseManagementPage';

const rootRoute = new RootRoute({
  component: Root,
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MainDashboard,
});

const projectsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/analytics/projects',
  component: ProjectAnalyticsDashboard,
});

const clientsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/analytics/clients',
  component: ClientScoringDashboard,
});

const reportsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/finance/reports',
  component: FinancialReportsPage,
});

const performanceRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/team/performance',
  component: TeamPerformancePage,
});

const expensesRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/expenses',
  component: ExpenseManagementPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  projectsRoute,
  clientsRoute,
  reportsRoute,
  performanceRoute,
  expensesRoute,
]);

export const router = new Router({ routeTree });
```

---

## Layout With Sidebar

```typescript
// src/layouts/DashboardLayout.tsx

import { Navigation } from '../components/Navigation';
import { Outlet } from 'react-router-dom';

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
```

Then use it in routing:

```typescript
// src/App.tsx

<Routes>
  <Route element={<DashboardLayout />}>
    <Route path="/" element={<MainDashboard />} />
    <Route path="/analytics/projects" element={<ProjectAnalyticsDashboard />} />
    <Route path="/analytics/clients" element={<ClientScoringDashboard />} />
    <Route path="/finance/reports" element={<FinancialReportsPage />} />
    <Route path="/team/performance" element={<TeamPerformancePage />} />
    <Route path="/expenses" element={<ExpenseManagementPage />} />
  </Route>
</Routes>
```

---

## With Error Boundary

```typescript
// src/components/ErrorBoundary.tsx

import React from 'react';
import { AlertCircle } from 'lucide-react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="mt-4 text-2xl font-bold text-red-600">
              Something went wrong
            </h1>
            <p className="mt-2 text-red-600">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

Use it:

```typescript
// src/App.tsx

<BrowserRouter>
  <ErrorBoundary>
    <Routes>
      {/* Your routes */}
    </Routes>
  </ErrorBoundary>
</BrowserRouter>
```

---

## With Authentication Check

```typescript
// src/components/ProtectedRoute.tsx

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
```

Use it:

```typescript
// src/App.tsx

<Routes>
  <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
    <Route path="/" element={<MainDashboard />} />
    <Route path="/analytics/projects" element={<ProjectAnalyticsDashboard />} />
    {/* ... other routes */}
  </Route>
  <Route path="/login" element={<LoginPage />} />
</Routes>
```

---

## Breadcrumb Navigation

```typescript
// src/components/Breadcrumb.tsx

import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const breadcrumbLabels: { [key: string]: string } = {
  '': 'Dashboard',
  'analytics': 'Analytics',
  'projects': 'Projects',
  'clients': 'Clients',
  'finance': 'Finance',
  'reports': 'Reports',
  'team': 'Team',
  'performance': 'Performance',
  'expenses': 'Expenses',
};

export function Breadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Link to="/" className="text-blue-600 hover:text-blue-800">
        Dashboard
      </Link>
      
      {pathSegments.map((segment, index) => {
        const path = '/' + pathSegments.slice(0, index + 1).join('/');
        const label = breadcrumbLabels[segment] || segment;
        const isLast = index === pathSegments.length - 1;

        return (
          <div key={path} className="flex items-center gap-2">
            <ChevronRight size={16} />
            {isLast ? (
              <span className="text-gray-900 font-medium">{label}</span>
            ) : (
              <Link to={path} className="text-blue-600 hover:text-blue-800">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

Use it in layout:

```typescript
// src/layouts/DashboardLayout.tsx

import { Breadcrumb } from '../components/Breadcrumb';

export function DashboardLayout() {
  return (
    <div>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Breadcrumb />
      </div>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
```

---

## Route Access Control

```typescript
// src/types/auth.ts

export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer';

export interface AuthContext {
  user?: { id: string; role: UserRole };
  isAuthenticated: boolean;
}

// src/hooks/useAuth.ts

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  return useContext(AuthContext);
}

// src/components/RoleBasedRoute.tsx

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  requiredRoles: UserRole[];
}

export function RoleBasedRoute({ 
  children, 
  requiredRoles 
}: RoleBasedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  if (!requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
}
```

Use it:

```typescript
// src/App.tsx

<Routes>
  {/* Admin only */}
  <Route
    element={
      <RoleBasedRoute requiredRoles={['admin']}>
        <DashboardLayout />
      </RoleBasedRoute>
    }
  >
    <Route path="/finance/reports" element={<FinancialReportsPage />} />
  </Route>

  {/* Manager and above */}
  <Route
    element={
      <RoleBasedRoute requiredRoles={['admin', 'manager']}>
        <DashboardLayout />
      </RoleBasedRoute>
    }
  >
    <Route path="/team/performance" element={<TeamPerformancePage />} />
  </Route>

  {/* Everyone (authenticated) */}
  <Route
    element={
      <RoleBasedRoute requiredRoles={['admin', 'manager', 'employee', 'viewer']}>
        <DashboardLayout />
      </RoleBasedRoute>
    }
  >
    <Route path="/" element={<MainDashboard />} />
    <Route path="/analytics/projects" element={<ProjectAnalyticsDashboard />} />
    <Route path="/analytics/clients" element={<ClientScoringDashboard />} />
    <Route path="/expenses" element={<ExpenseManagementPage />} />
  </Route>
</Routes>
```

---

## Lazy Loading Routes

```typescript
// src/App.tsx

import { lazy, Suspense } from 'react';

const MainDashboard = lazy(() => import('./pages/MainDashboard').then(m => ({ default: m.MainDashboard })));
const ProjectAnalyticsDashboard = lazy(() => import('./pages/analytics/ProjectAnalyticsDashboard').then(m => ({ default: m.ProjectAnalyticsDashboard })));
// ... other lazy imports

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500" />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<MainDashboard />} />
            <Route path="/analytics/projects" element={<ProjectAnalyticsDashboard />} />
            {/* ... other routes */}
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

---

## Complete App.tsx Example

```typescript
// src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingSpinner } from './components/LoadingSpinner';

// Routes
const MainDashboard = lazy(() => import('./pages/MainDashboard').then(m => ({ default: m.MainDashboard })));
const ProjectAnalyticsDashboard = lazy(() => import('./pages/analytics/ProjectAnalyticsDashboard').then(m => ({ default: m.ProjectAnalyticsDashboard })));
const ClientScoringDashboard = lazy(() => import('./pages/analytics/ClientScoringDashboard').then(m => ({ default: m.ClientScoringDashboard })));
const FinancialReportsPage = lazy(() => import('./pages/finance/FinancialReportsPage').then(m => ({ default: m.FinancialReportsPage })));
const TeamPerformancePage = lazy(() => import('./pages/team/TeamPerformancePage').then(m => ({ default: m.TeamPerformancePage })));
const ExpenseManagementPage = lazy(() => import('./pages/expenses/ExpenseManagementPage').then(m => ({ default: m.ExpenseManagementPage })));

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<MainDashboard />} />
            <Route path="/analytics/projects" element={<ProjectAnalyticsDashboard />} />
            <Route path="/analytics/clients" element={<ClientScoringDashboard />} />
            <Route path="/finance/reports" element={<FinancialReportsPage />} />
            <Route path="/team/performance" element={<TeamPerformancePage />} />
            <Route path="/expenses" element={<ExpenseManagementPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

---

## Summary

**Choose your routing approach:**

1. **React Router v6** - Most flexible
2. **Next.js App Router** - Simplest for file-based routing
3. **TanStack Router** - Most advanced
4. **Remix** - Full stack framework

**All examples above work with your Phase 20 components!**

Pick the one that matches your project structure and add the routes.

**Then run:** `npm run dev` and visit your dashboard! 🚀
