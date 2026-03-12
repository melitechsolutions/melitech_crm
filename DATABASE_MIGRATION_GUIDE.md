# Database Migration & Setup Guide

## Current Status

Phase 20 backend is complete with all routers and database schema defined. However, the database tables need to be migrated to the live database.

## Quick Fix: Run Database Migration

The 500 error is occurring because the database tables don't exist yet. To fix this:

### Option 1: Quick Local Setup (Development)

```bash
# Navigate to project directory
cd e:\melitech_crm

# Run Drizzle migration to create all tables
npm run db:push

# Or if using pnpm:
pnpm db:push
```

This will:
- Create all 31 database tables (Phase 1-19 + Phase 20)
- Set up all indexes for performance
- Create proper relationships and constraints
- Initialize type-safe schema

### Option 2: Using Docker Compose

```bash
# Ensure Docker is running
docker-compose up -d

# Run migrations in container
docker-compose exec app npm run db:push
```

## What Gets Created

### Phase 20 Tables (New)
- `projectMetrics` - Project analytics data
- `clientHealthScores` - Client health scoring
- `performanceReviews` - Team performance reviews
- `skillsMatrix` - Employee skills tracking
- `schedules` - Advanced task scheduling
- `vacationRequests` - Vacation/leave management
- `documents` - Document management
- `documentVersions` - Document version history
- `documentAccess` - Document access control
- `notificationRules` - Notification preferences
- `subscriptions` - Recurring subscription data
- `usageMetrics` - Usage-based billing
- `expenseCategories` - Expense categories
- `expenseReports` - Expense report headers
- `expenses` - Expense line items
- `reimbursements` - Reimbursement tracking
- `currencies` - Multi-currency support
- `exchangeRates` - Exchange rate data
- `taxRates` - Tax rate by country
- `forecastModels` - Forecasting models
- `forecastResults` - Forecast results
- `apiKeys` - Integration API keys
- `webhooks` - Webhook definitions
- `integrationLogs` - Integration event logs
- `emailQueue` - Email delivery queue
- `emailLog` - Email send log
- `invoiceReminders` - Invoice reminder tracking

### Existing Tables (Preserved)
- All Phase 1-19 tables remain unchanged
- No data loss
- Full backward compatibility

## Verification

After running migration, verify with:

```bash
# Check connection
npm run db:studio

# This opens Drizzle Studio at:
# http://localhost:5555
```

You should see all 31+ tables listed.

## If Still Getting 500 Error

The backend is designed to gracefully handle missing tables:

1. **Team Members**: Returns empty array instead of error ✅
2. **Workflows**: All mutations have try-catch blocks ✅
3. **Logging**: Uses fallback when activity log unavailable ✅

However, for full functionality, you need to run the migration.

## Frontend Components Created

All React components are already created and ready to use:

✅ `src/pages/MainDashboard.tsx` - Main dashboard with KPIs
✅ `src/pages/analytics/ProjectAnalyticsDashboard.tsx` - Project metrics
✅ `src/pages/analytics/ClientScoringDashboard.tsx` - Client health scores
✅ `src/pages/finance/FinancialReportsPage.tsx` - P&L, cash flow, AR aging
✅ `src/pages/team/TeamPerformancePage.tsx` - Reviews, skills, team dashboard
✅ `src/pages/expenses/ExpenseManagementPage.tsx` - Expense workflow

### To Use Frontend Components

Register them in your routing configuration:

```typescript
// src/App.tsx or your router setup

import { MainDashboard } from './pages/MainDashboard';
import { ProjectAnalyticsDashboard } from './pages/analytics/ProjectAnalyticsDashboard';
import { ClientScoringDashboard } from './pages/analytics/ClientScoringDashboard';
import { FinancialReportsPage } from './pages/finance/FinancialReportsPage';
import { TeamPerformancePage } from './pages/team/TeamPerformancePage';
import { ExpenseManagementPage } from './pages/expenses/ExpenseManagementPage';

const router = [
  { path: '/', element: <MainDashboard /> },
  { path: '/analytics/projects', element: <ProjectAnalyticsDashboard /> },
  { path: '/analytics/clients', element: <ClientScoringDashboard /> },
  { path: '/finance/reports', element: <FinancialReportsPage /> },
  { path: '/team/performance', element: <TeamPerformancePage /> },
  { path: '/expenses', element: <ExpenseManagementPage /> },
];
```

## Dependencies Already Installed

✅ `recharts` - Charts and visualizations
✅ `react-hook-form` - Form handling
✅ `zod` - Schema validation
✅ `lucide-react` - Icon library
✅ `trpc` - Type-safe API
✅ `drizzle-orm` - ORM
✅ `mysql2` - Database driver

## Next Steps

1. **Run Migration**
   ```bash
   npm run db:push
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Visit Dashboard**
   ```
   http://localhost:5173
   ```

4. **View Drizzle Studio** (Optional)
   ```bash
   npm run db:studio
   ```

## Troubleshooting

### Migration Fails with "Connection refused"

Ensure MySQL is running:
```bash
# Check if MySQL is running
docker-compose ps

# Or start it:
docker-compose up -d db
```

### Still Getting 500 Errors After Migration

Check logs:
```bash
# Server logs
npm run dev

# Look for error messages in terminal
```

### Need to Reset Database

```bash
# Drop all tables (be careful in production!)
npm run db:reset

# Then re-migrate:
npm run db:push
```

## Database Diagram

```
Phase 19 Tables → Expanded with Phase 20 Tables
├── Core: projects, clients, invoices, employees
├── Phase 20: analytics, scoring, forecasting
├── Integration: webhooks, api_keys, integration_logs
├── Workflow: expenses, reimbursements, documents
├── Settings: notifications, subscriptions, currencies
└── Email: emailQueue, emailLog, invoiceReminders
```

## Support

All error handling is in place. The application will:
- ✅ Show informative error messages
- ✅ Gracefully degrade when tables missing
- ✅ Provide clear next steps to users

Run the migration to activate all Phase 20 features!

---

**Status**: Architecture ready, database tables defined, frontend components built
**Action Needed**: Run `npm run db:push` to migrate database schema
