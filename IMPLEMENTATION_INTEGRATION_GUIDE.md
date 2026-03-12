# Implementation Integration Guide

## Quick Start

### 1. Database Migration
Before deploying, ensure the new HR tables are created:

```bash
# Generate migration for new schema
npm run db:generate

# Apply migration to database
npm run db:push
```

### 2. Update tRPC Router Configuration

**Location**: `server/routers.ts`

Add the enhanced payroll router to your main router:

```typescript
import { payrollRouter } from './routers/payroll';

export const appRouter = router({
  // ... existing routers
  payroll: payrollRouter,
});
```

### 3. Register User Procedures

**Location**: `server/routers/users.ts`

The new procedures are already defined:
- `hrProcedure`
- `projectManagerProcedure`
- `staffAssignmentProcedure`

### 4. Update Type Exports

**Location**: `drizzle/index.ts`

The new types are automatically exported:
```typescript
export * from './schema-extended';
```

All new types like `SalaryStructure`, `EmployeeBenefit`, etc. are available.

### 5. Add Routes to App Router

**Location**: `client/src/App.tsx`

Add new page routes:

```tsx
import HRPayrollManagement from './pages/HRPayrollManagement';
import CreateSalaryStructure from './pages/CreateSalaryStructure';
import CreateAllowance from './pages/CreateAllowance';

// In your route configuration:
<Route path="/payroll" component={HRPayrollManagement} />
<Route path="/salary-structures/create" component={CreateSalaryStructure} />
<Route path="/allowances/create" component={CreateAllowance} />
```

---

## File Structure Overview

### Backend Files Modified/Created

```
server/
├── routers/
│   ├── users.ts (MODIFIED - Added HR roles and staff assignment)
│   ├── payroll.ts (ENHANCED - Added comprehensive HR endpoints)
│   └── ... (other routers)
└── routers.ts (TO BE UPDATED - Register payrollRouter)

drizzle/
├── schema-extended.ts (ENHANCED - Added 8 new HR tables)
├── index.ts (USES EXTENDED SCHEMA)
└── ... (migration files)
```

### Frontend Files Added/Modified

```
client/src/
├── pages/
│   ├── SuperAdminDashboard.tsx (ENHANCED)
│   ├── HRPayrollManagement.tsx (NEW)
│   ├── CreateSalaryStructure.tsx (NEW)
│   ├── CreateAllowance.tsx (NEW)
│   └── ... (other pages)
└── ...
```

---

## Feature Checklist

### Completed Implementations
- [x] Super-Admin Dashboard with quick actions
- [x] Project Manager Edit/Assign functionality
- [x] Staff assignment permissions for PM, HR, Admin
- [x] Database schema for HR and payroll
- [x] Full payroll management API routes
- [x] Salary structure management
- [x] Allowances and deductions
- [x] Benefits management
- [x] Tax information tracking
- [x] Salary increment history
- [x] Payroll approval workflow
- [x] HR Dashboard UI
- [x] Create salary structure form
- [x] Create allowance form

### Optional Next Steps
- [ ] Create deduction form (CreateDeduction.tsx)
- [ ] Create benefit form (CreateBenefit.tsx)
- [ ] Payroll export to Excel
- [ ] Payroll report generation
- [ ] Email notifications for approvals
- [ ] Batch payroll processing
- [ ] Department-wise payroll reports
- [ ] Tax compliance reports

---

## Database Schema Reference

### New Tables (8 total)

1. **salaryStructures** - Core salary definition
2. **salaryAllowances** - Additional salary components
3. **salaryDeductions** - Salary reductions
4. **employeeBenefits** - Employee benefit programs
5. **payrollDetails** - Detailed payroll breakdown
6. **payrollApprovals** - Approval workflow
7. **employeeTaxInfo** - Tax configuration
8. **salaryIncrements** - Salary raise history

### Key Fields Notes
- All monetary values in **cents** (KES × 100)
- Percentages stored as **value × 100**
- Timestamps in UTC ISO format
- Soft delete support via `isActive` field
- Audit trail via `createdBy`, `createdAt`, `updatedAt`

---

## API Endpoint Summary

### Authorization Levels
```
HR Operations: super_admin, admin, hr, accountant
Staff Assignment: super_admin, admin, project_manager, hr
```

### Endpoint Categories (25+ endpoints)

| Category | Endpoints | Status |
|----------|-----------|--------|
| Main Payroll | list, getById, byEmployee, create, update, delete | ✅ |
| Salary Structures | list, byEmployee, create, update | ✅ |
| Allowances | list, byEmployee, create | ✅ |
| Deductions | list, byEmployee, create | ✅ |
| Benefits | list, byEmployee, create | ✅ |
| Tax Info | byEmployee, create, update | ✅ |
| Increments | byEmployee, create, approve | ✅ |
| Approvals | byPayroll, create, approve, reject | ✅ |

---

## Configuration Examples

### Environment Variables (if needed)
```env
HR_ADMIN_APPROVAL_REQUIRED=true
PAYROLL_AUTO_CALCULATION=true
TAX_RATE_DEFAULT=25
CURRENCY=KES
```

### User Role Configuration
Ensure these roles exist in your system:
- `super_admin` - Full system access
- `admin` - Full HR access
- `hr` - HR staff access
- `project_manager` - Projects and staff assignment
- `accountant` - Limited payroll access

---

## Testing Guide

### Manual Testing Steps

1. **Create Salary Structure**
   - Navigate to /payroll
   - Click "New Salary Structure"
   - Select employee, enter salary details
   - Save and verify in list

2. **Add Allowances**
   - Click "New Allowance" in Allowances tab
   - Select employee and allowance type
   - Enter amount and frequency
   - Verify in list

3. **Process Payroll**
   - Click "New Payroll" button
   - Select pay period and employee
   - System should auto-calculate based on structure
   - Submit for approval

4. **Test Role-Based Access**
   - Log in as different roles
   - Verify only authorized operations are available
   - Confirm error messages for denied actions

### API Testing with tRPC DevTools
```typescript
// In browser console with tRPC DevTools
trpc.payroll.list.useQuery()
trpc.payroll.salaryStructures.list.useQuery()
trpc.payroll.allowances.create.mutate({...})
```

---

## Performance Optimization Tips

1. **Database Indexes**: All new tables have proper indexes on:
   - `employeeId` (frequently queried)
   - `effectiveDate` (date range queries)
   - `isActive` (filtering active records)

2. **Query Optimization**:
   - Use `byEmployee` queries instead of filtering on frontend
   - Implement pagination for large result sets
   - Cache salary structures (change rarely)

3. **Frontend Optimization**:
   - Lazy load HR components
   - Use React.memo for list items
   - Implement virtual scrolling for large tables

---

## Troubleshooting

### Issue: "Database not available" error
**Solution**: Ensure database migration is complete and connection is valid

### Issue: "Forbidden" error on HR operations
**Solution**: Verify user has correct role (hr, admin, or super_admin)

### Issue: Salary calculations are incorrect
**Solution**: Check if values are properly converted between cents and whole numbers

### Issue: New tables not showing in schema
**Solution**: Run `npm run db:generate` and `npm run db:push`

---

## Support & Documentation

For detailed API documentation, see:
- `HR_PAYROLL_API_REFERENCE.md` - Complete endpoint reference
- `IMPLEMENTATION_SUMMARY_HR_FEATURES.md` - Feature overview
- Individual component TypeScript files for usage examples

---

## Deployment Checklist

Before deploying to production:

- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] User roles created and assigned
- [ ] tRPC router updated with payrollRouter
- [ ] Page routes added to App.tsx
- [ ] Schema types imported where needed
- [ ] Error handling tested
- [ ] Role-based access verified
- [ ] Performance tested with real data
- [ ] Documentation updated for team

---

## Version History

### v1.0.0 (Current - Feb 26, 2026)
- Initial implementation of HR and Payroll management
- 8 new database tables
- 25+ API endpoints
- Complete UI components
- Role-based access control

---

**Last Updated**: February 26, 2026
**Compatibility**: Node 16+, React 18+, tRPC 10+
**Status**: Ready for Integration
