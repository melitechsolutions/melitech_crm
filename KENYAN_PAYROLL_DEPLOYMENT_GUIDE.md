# Kenyan Payroll System - Integration & Deployment Guide

## Pre-Deployment Checklist

Before deploying the Kenyan payroll system, complete the following:

### 1. Database Configuration
- [ ] Verify MySQL database connection
- [ ] Ensure sufficient disk space for payroll records
- [ ] Backup existing data before migrations
- [ ] Test database connectivity from application

### 2. Code Integration
- [ ] Copy `server/utils/kenyan-payroll-calculator.ts` to project
- [ ] Update `server/routers/payroll.ts` with new routes
- [ ] Add `PayslipSummary.tsx` component to `client/src/components/`
- [ ] Add `KenyanPayrollCalculator.tsx` page to `client/src/pages/`
- [ ] Update `HRPayrollManagement.tsx` with calculator button
- [ ] Verify all imports resolve correctly

### 3. Route Registration
Add the following to your main routing configuration (e.g., `client/src/App.tsx`):

```typescript
import KenyanPayrollCalculator from '@/pages/KenyanPayrollCalculator';

// In your route definitions:
<Route path="/payroll/kenyan" component={KenyanPayrollCalculator} />
<Route path="/payroll" component={HRPayrollManagement} />
```

### 4. Dependencies Verification
Ensure these packages are installed:
```bash
npm list zod
npm list drizzle-orm
npm list @trpc/server
npm list @trpc/client
npm list react
npm list sonner
```

### 5. Environment Configuration
Ensure `.env` includes:
```env
DATABASE_URL=mysql://user:password@localhost:3306/melitech
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## File Structure

After integration, your structure should look like:

```
project_root/
├── server/
│   ├── utils/
│   │   └── kenyan-payroll-calculator.ts        [NEW]
│   └── routers/
│       └── payroll.ts                          [UPDATED]
├── client/src/
│   ├── components/
│   │   └── PayslipSummary.tsx                  [NEW]
│   ├── pages/
│   │   ├── KenyanPayrollCalculator.tsx         [NEW]
│   │   └── HRPayrollManagement.tsx             [UPDATED]
│   └── App.tsx                                 [ROUTE UPDATE]
└── drizzle/
    └── schema-extended.ts                      [USES EXISTING TABLES]
```

## Deployment Steps

### Step 1: Copy Files
```bash
# Copy calculator utility
cp server/utils/kenyan-payroll-calculator.ts /path/to/project/server/utils/

# Copy components
cp client/src/components/PayslipSummary.tsx /path/to/project/client/src/components/
cp client/src/pages/KenyanPayrollCalculator.tsx /path/to/project/client/src/pages/

# Update existing files
cp -f server/routers/payroll.ts /path/to/project/server/routers/
cp -f client/src/pages/HRPayrollManagement.tsx /path/to/project/client/src/pages/
```

### Step 2: Install Dependencies (if needed)
```bash
npm install zod sonner drizzle-orm
npm install --save-dev @types/node
```

### Step 3: Update Routes
Edit `client/src/App.tsx`:

```typescript
// Add imports
import KenyanPayrollCalculator from '@/pages/KenyanPayrollCalculator';
import HRPayrollManagement from '@/pages/HRPayrollManagement';

// Add routes
<Route path="/payroll/kenyan" component={KenyanPayrollCalculator} />
<Route path="/payroll" component={HRPayrollManagement} />
```

### Step 4: Verify Imports
Run TypeScript checking:
```bash
npm run type-check
```

### Step 5: Build & Test
```bash
# Build the project
npm run build

# If build succeeds, test locally
npm run dev
```

### Step 6: Test Payroll Calculation
1. Navigate to `/payroll/kenyan`
2. Select an employee
3. Enter salary: 500,000
4. Click "Calculate Payroll"
5. Verify calculations:
   - NSSF: ~30,000 (18K + 12K)
   - PAYE: ~6,690
   - SHIF: 12,500
   - Housing: 7,500
   - Net: ~443,310

## Database Schema

The implementation uses existing tables (no new schema required):

### Tables Used:
1. **payroll** - Main payroll records
2. **payrollDetails** - Component breakdown
3. **employees** - Employee info for lookup
4. **salaryStructures** - Salary configuration
5. **employeeTaxInfo** - Tax number storage

### Data Flow:
```
KenyanPayrollCalculator (UI)
         ↓
  calculateKenyanPayroll()
         ↓
  payroll.kenyanCalculate (Query)
         ↓
  payroll.saveKenyanPayroll (Mutation)
         ↓
  INSERT payroll + payrollDetails
```

## API Testing

### Test with cURL (Backend):

```bash
# Calculate Payroll
curl -X POST http://localhost:3000/trpc/payroll.kenyanCalculate \
  -H "Content-Type: application/json" \
  -d '{
    "basicSalary": 50000000,
    "allowances": 1000000,
    "housingAllowance": 500000
  }'
```

### Test with Frontend Tools:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform calculation on `/payroll/kenyan`
4. Check network requests for `payroll.kenyanCalculate`
5. Verify response structure

## Migration from Old System

If migrating from manual/spreadsheet payroll:

### 1. Data Preparation
```sql
-- Ensure all employees have salary structures
SELECT e.id, e.name, ss.basicSalary
FROM employees e
LEFT JOIN salaryStructures ss ON e.id = ss.employeeId
WHERE ss.id IS NULL;

-- Create missing salary structures
INSERT INTO salaryStructures (...)
SELECT id, name, 50000 FROM employees WHERE id NOT IN (...);
```

### 2. Historical Data Import
```bash
# Create import script for past payrolls
npm run import:historical-payroll <csv-file>
```

### 3. Validation
```sql
-- Verify NSSF calculations
SELECT SUM(nssf) FROM payroll WHERE createdAt > DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Check for any negative salaries
SELECT id, employeeId, netSalary FROM payroll WHERE netSalary < 0;
```

## Troubleshooting Deployment

### Issue: "Module not found: kenyan-payroll-calculator"
**Solution**: Verify file exists at `server/utils/kenyan-payroll-calculator.ts`

### Issue: TypeScript errors in calculator
**Solution**: Run `npm run type-check` - likely missing type imports

### Issue: Payslip component not rendering
**Solution**: 
1. Check if `PayslipSummary.tsx` in `client/src/components/`
2. Verify imports in `KenyanPayrollCalculator.tsx`
3. Check console for React errors

### Issue: Calculations don't match expected values
**Solution**:
1. Verify tax rates in `kenyan-payroll-calculator.ts`
2. Check if values are in cents (database) or KES (user input)
3. Test with known values from quick reference guide

### Issue: NSSF Tier 2 not calculating
**Solution**: Check if salary > 300,000 (in cents: > 30,000,000)

## Performance Optimization

### Caching Strategies
```typescript
// Cache tax brackets (they rarely change)
const TAX_BRACKETS = useMemo(() => [...], []);

// Memoize calculation results
const calculation = useMemo(() => calculateKenyanPayroll(input), [input]);
```

### Database Optimization
```sql
-- Add indexes for quick lookups
CREATE INDEX idx_payroll_employee ON payroll(employeeId);
CREATE INDEX idx_payroll_period ON payroll(payPeriodStart);
CREATE INDEX idx_payroll_status ON payroll(status);
```

### Batch Processing (Future)
```typescript
// For mass payroll calculations
async function processBulkPayroll(employees: Employee[]) {
  const results = employees.map(emp => calculateKenyanPayroll({
    basicSalary: emp.salary,
    allowances: emp.allowances
  }));
  
  return saveBulk(results);
}
```

## Monitoring & Maintenance

### Daily Tasks
- [ ] Review payroll exception reports
- [ ] Verify all employees paid
- [ ] Check for calculation errors

### Weekly Tasks
- [ ] Validate NSSF contributions collected
- [ ] Review PAYE deductions withheld
- [ ] Reconcile net pay totals

### Monthly Tasks
- [ ] Generate KRA PAYE return
- [ ] Submit NSSF contributions
- [ ] Reconcile SHIF deductions
- [ ] Audit payroll records

### Quarterly Tasks
- [ ] Review and update tax brackets (if changed by KRA)
- [ ] Validate relief calculations
- [ ] Prepare compliance report

## Backup Strategy

### Before Each Payroll Run
```bash
# Backup database
mysqldump -u user -p database > payroll_backup_$(date +%Y%m%d).sql

# Archive payroll files
tar -czf payroll_$(date +%Y%m%d).tar.gz payroll_data/
```

### Retention Policy
- Daily backups: 7 days
- Weekly backups: 4 weeks
- Monthly backups: 12 months

## Security Considerations

### Access Control
- [ ] Only HR staff can access payroll calculator
- [ ] Payslips only visible to employee owner and HR
- [ ] Audit trail for all payroll modifications
- [ ] PII protected (tax numbers, salary data)

### Data Encryption
- [ ] Enable SSL/TLS for API calls
- [ ] Encrypt sensitive data in database
- [ ] Use environment variables for credentials
- [ ] Implement API rate limiting

### Compliance
- [ ] KRA compliance audit trail
- [ ] NSSF submission records
- [ ] SHIF reporting documentation
- [ ] Employee consent for deductions

## Rollback Plan

If issues arise:

### Step 1: Stop Processing
```bash
# Halt all payroll operations
# Don't disburse funds until issues resolved
```

### Step 2: Identify Issue
```bash
# Check logs
tail -f /var/log/application.log

# Verify calculations
SELECT * FROM payroll WHERE status='draft' LIMIT 10;
```

### Step 3: Restore Backup
```bash
# If data corruption detected
mysql -u user -p database < payroll_backup_YYYYMMDD.sql
```

### Step 4: Verify Fix
```bash
# Test with known values
# Re-calculate for test employees
# Validate against quick reference
```

## Support Resources

**Internal Documentation:**
- `KENYAN_PAYROLL_SYSTEM.md` - Complete system documentation
- `KENYAN_PAYROLL_QUICK_REFERENCE.md` - Quick lookup tables
- Source code: `server/utils/kenyan-payroll-calculator.ts`

**External Resources:**
- [KRA Official Site](https://www.kra.go.ke/)
- [NSSF Contribution Guide](https://www.nssf.or.ke/)
- [SHIF Information](https://www.shif.go.ke/)

## Deployment Checklist - Final

- [ ] All files copied to correct locations
- [ ] Routes registered in main router
- [ ] TypeScript compilation successful
- [ ] No console errors on `/payroll` page
- [ ] Can access `/payroll/kenyan` calculator
- [ ] Sample calculation produces correct values
- [ ] Database connectivity verified
- [ ] Backup created before going live
- [ ] HR staff trained on new system
- [ ] Documentation available to team
- [ ] Support contact established

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Verified By**: _______________  

**Go-Live Status**: ✅ Ready / ⏳ Pending / ❌ On Hold

---

For issues or questions:
1. Check the quick reference guide
2. Review system documentation
3. Check application logs
4. Contact development team
5. Escalate to management if needed
