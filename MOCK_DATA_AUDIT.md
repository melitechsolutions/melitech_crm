# Mock Data Audit Report

## Executive Summary

This document provides a comprehensive audit of all dashboards and modules in the MeliTech CRM system to identify components still using mock/hardcoded data instead of database connections.

## Audit Date
January 30, 2026

---

## Dashboard Analysis

### 1. AccountantDashboard (`/client/src/pages/dashboards/AccountantDashboard.tsx`)

**Status:** ⚠️ PARTIALLY CONNECTED

**Connected to Database:**
- ✅ Dashboard metrics (via `trpc.dashboard.metrics.useQuery()`)
- ✅ Recent invoices (via `trpc.invoices.list.useQuery()`)
- ✅ Recent expenses (via `trpc.expenses.list.useQuery()`)

**Still Using Mock/Hardcoded Data:**
- ❌ Line 113: Net Profit - Hardcoded "KES 1.65M"
- ❌ Lines 102-104: Total Expenses - Calculated estimate (34% of revenue), not real data
- ❌ Lines 148-169: Recent Transactions - Hardcoded transaction list
  - "Invoice INV-2024-001" with "+KES 250K"
  - "Office Supplies" with "-KES 15K"
  - "Salary Payment" with "-KES 500K"
- ❌ Lines 216-225: Invoice table - Hardcoded single row
  - INV-2024-001, Acme Corp, KES 250,000
- ❌ Lines 250-257: Expense list - Hardcoded "Office Supplies" expense
- ❌ Lines 281-292: Bank Reconciliation - Hardcoded balances
  - Bank Balance: KES 1.2M
  - Book Balance: KES 1.2M

---

### 2. StaffDashboard (`/client/src/pages/dashboards/StaffDashboard.tsx`)

**Status:** ✅ FULLY CONNECTED

**Connected to Database:**
- ✅ Attendance data (via `trpc.attendance.list.useQuery()`)
- ✅ Leave requests (via `trpc.leave.list.useQuery()`)
- ✅ Projects data (via `trpc.projects.list.useQuery()`)
- ✅ All statistics calculated from real data
- ✅ Today's attendance status from database
- ✅ Recent activity from database records

**No Mock Data Found**

---

### 3. ClientPortal (`/client/src/pages/ClientPortal.tsx`)

**Status:** ✅ FULLY CONNECTED

**Connected to Database:**
- ✅ Client data (via `trpc.clients.getClientByUserId.useQuery()`)
- ✅ Projects (via `trpc.projects.getClientProjects.useQuery()`)
- ✅ Invoices (via `trpc.invoices.getClientInvoices.useQuery()`)
- ✅ Documents (via `trpc.documents.getClientDocuments.useQuery()`)

**No Mock Data Found**

---

### 4. SuperAdminDashboard (`/client/src/pages/dashboards/SuperAdminDashboard.tsx`)

**Status:** 🔍 NEEDS REVIEW

---

### 5. AdminDashboard (`/client/src/pages/dashboards/AdminDashboard.tsx`)

**Status:** 🔍 NEEDS REVIEW

---

### 6. HRDashboard (`/client/src/pages/dashboards/HRDashboard.tsx`)

**Status:** 🔍 NEEDS REVIEW

---

## Other Modules to Check

### Pages with Potential Mock Data:
1. Accounting.tsx
2. BankReconciliation.tsx
3. ChartOfAccounts.tsx
4. Dashboard.tsx
5. DashboardHome.tsx

---

## Priority Fixes Required

### HIGH PRIORITY:
1. **AccountantDashboard - Recent Transactions Section**
   - Replace hardcoded transactions with real data from database
   - Connect to transactions/payments API

2. **AccountantDashboard - Net Profit Calculation**
   - Implement proper profit calculation: Revenue - Expenses
   - Connect to actual expense data

3. **AccountantDashboard - Bank Reconciliation**
   - Connect to real bank account data
   - Implement actual reconciliation logic

### MEDIUM PRIORITY:
4. **AccountantDashboard - Invoice Table**
   - Already has API connection but showing hardcoded fallback
   - Ensure proper data rendering from `recentInvoices`

5. **AccountantDashboard - Expense List**
   - Already has API connection but showing hardcoded fallback
   - Ensure proper data rendering from `recentExpenses`

---

## Next Steps

1. Complete audit of remaining dashboards (SuperAdmin, Admin, HR)
2. Check all module pages for mock data
3. Implement database connections for identified issues
4. Add proper error handling and loading states
5. Implement role-based access control for approval processes
