# HR & Payroll API Reference

## Overview
Complete API documentation for the HR and Payroll management system in Melitech CRM.

## Base Information
- **Base URL**: tRPC procedures via `trpc.payroll.*`
- **Authentication**: Required (protected procedures)
- **Response Format**: JSON
- **Currency**: KES (Kenyan Shilling) in cents
- **Percentages**: Stored as value × 100 (e.g., 25% = 2500)

## Authorization Levels

### HR Procedure
Required roles: `super_admin`, `admin`, `hr`, `accountant`

### Staff Assignment Procedure
Required roles: `super_admin`, `admin`, `project_manager`, `hr`

---

## API Endpoints

### Main Payroll Management

#### List All Payroll Records
```typescript
trpc.payroll.list.useQuery({ limit?: number, offset?: number })
```
**Response**: `Array<Payroll>`
- Returns paginated list of all payroll records
- Default limit: 50, default offset: 0

#### Get Payroll by ID
```typescript
trpc.payroll.getById.useQuery(payrollId: string)
```
**Response**: `Payroll | null`
- Single payroll record with full details

#### Get Payroll by Employee
```typescript
trpc.payroll.byEmployee.useQuery({ employeeId: string })
```
**Response**: `Array<Payroll>`
- All payroll records for specific employee

#### Create Payroll
```typescript
trpc.payroll.create.useMutation()
  .mutate({
    employeeId: string,
    month?: string (YYYY-MM) | Date,
    payPeriodStart?: Date,
    payPeriodEnd?: Date,
    basicSalary: number,
    allowances?: number,
    deductions?: number,
    tax?: number,
    netSalary: number,
    status?: 'draft' | 'processed' | 'paid',
    notes?: string,
  })
```
**Response**: `{ id: string }`
- Creates new payroll record
- Monetary values in cents (KES)

#### Update Payroll
```typescript
trpc.payroll.update.useMutation()
  .mutate({
    id: string,
    ...payrollFields (same as create)
  })
```
**Response**: `{ success: true }`

#### Delete Payroll
```typescript
trpc.payroll.delete.useMutation()
  .mutate(payrollId: string)
```
**Response**: `{ success: true }`

---

### Salary Structure Management

#### List All Salary Structures
```typescript
trpc.payroll.salaryStructures.list.useQuery()
```
**Response**: `Array<SalaryStructure>`

#### Get Employee's Salary Structure
```typescript
trpc.payroll.salaryStructures.byEmployee.useQuery({ employeeId: string })
```
**Response**: `Array<SalaryStructure>`

#### Create Salary Structure
```typescript
trpc.payroll.salaryStructures.create.useMutation()
  .mutate({
    employeeId: string,
    basicSalary: number,        // in cents
    allowances?: number,         // in cents, default 0
    deductions?: number,         // in cents, default 0
    taxRate?: number,            // percentage × 100, default 0
    notes?: string,
  })
```
**Response**: `{ id: string }`
- Sets up complete salary structure for employee
- Automatically sets effectiveDate to now
- Stores in database and creates audit log

#### Update Salary Structure
```typescript
trpc.payroll.salaryStructures.update.useMutation()
  .mutate({
    id: string,
    basicSalary?: number,
    allowances?: number,
    deductions?: number,
    taxRate?: number,
    notes?: string,
  })
```
**Response**: `{ success: true }`

---

### Salary Allowances Management

#### List All Allowances
```typescript
trpc.payroll.allowances.list.useQuery()
```
**Response**: `Array<SalaryAllowance>`

#### Get Employee's Allowances
```typescript
trpc.payroll.allowances.byEmployee.useQuery({ employeeId: string })
```
**Response**: `Array<SalaryAllowance>`

#### Create Allowance
```typescript
trpc.payroll.allowances.create.useMutation()
  .mutate({
    employeeId: string,
    allowanceType: string,               // e.g., "House Allowance"
    amount: number,                      // in cents
    frequency: 'monthly' | 'quarterly' | 'annual' | 'one_time',
    notes?: string,
  })
```
**Response**: `{ id: string }`
- Creates new allowance record
- Automatically active and effective immediately
- Tracks creation user and timestamp

#### Predefined Allowance Types
- House Allowance
- Transport Allowance
- Meal Allowance
- Phone Allowance
- Internet Allowance
- Responsibility Allowance
- Special Allowance
- Other (custom)

---

### Salary Deductions Management

#### List All Deductions
```typescript
trpc.payroll.deductions.list.useQuery()
```
**Response**: `Array<SalaryDeduction>`

#### Get Employee's Deductions
```typescript
trpc.payroll.deductions.byEmployee.useQuery({ employeeId: string })
```
**Response**: `Array<SalaryDeduction>`

#### Create Deduction
```typescript
trpc.payroll.deductions.create.useMutation()
  .mutate({
    employeeId: string,
    deductionType: string,               // e.g., "Loan", "Insurance"
    amount: number,                      // in cents
    frequency: 'monthly' | 'quarterly' | 'annual' | 'one_time',
    reference?: string,                  // e.g., loan account number
    notes?: string,
  })
```
**Response**: `{ id: string }`
- Creates deduction entry
- Can be suspended without deletion (isActive field)

#### Common Deduction Types
- Loan
- Pension Contribution
- Insurance Premium
- Income Tax
- NSSF
- HELB
- Recovery/Adjustment

---

### Employee Benefits Management

#### List All Benefits
```typescript
trpc.payroll.benefits.list.useQuery()
```
**Response**: `Array<EmployeeBenefit>`

#### Get Employee's Benefits
```typescript
trpc.payroll.benefits.byEmployee.useQuery({ employeeId: string })
```
**Response**: `Array<EmployeeBenefit>`

#### Create Benefit
```typescript
trpc.payroll.benefits.create.useMutation()
  .mutate({
    employeeId: string,
    benefitType: string,                 // e.g., "Health Insurance"
    provider?: string,                   // e.g., InsuranceCo Ltd
    coverage?: string,                   // coverage details JSON
    cost?: number,                       // employee cost in cents
    employerCost?: number,               // employer cost in cents
    notes?: string,
  })
```
**Response**: `{ id: string }`
- Tracks both employee and employer costs
- Can have coverage details as JSON

#### Common Benefit Types
- Health Insurance
- Life Insurance
- Pension Plan
- Disability Insurance
- SACCO Membership
- Educational Benefits
- Transport Benefits

---

### Tax Information Management

#### Get Employee's Tax Info
```typescript
trpc.payroll.taxInfo.byEmployee.useQuery({ employeeId: string })
```
**Response**: `EmployeeTaxInfo | null`

#### Create Tax Information
```typescript
trpc.payroll.taxInfo.create.useMutation()
  .mutate({
    employeeId: string,
    taxNumber: string,                   // Required (e.g., P001234567)
    taxBracket?: string,                 // e.g., "30%"
    exemptions?: number,                 // default 0
    notes?: string,
  })
```
**Response**: `{ id: string }`
- Stores tax number and bracket
- Tracks exemptions for tax calculation

#### Update Tax Information
```typescript
trpc.payroll.taxInfo.update.useMutation()
  .mutate({
    id: string,
    taxBracket?: string,
    exemptions?: number,
    notes?: string,
  })
```
**Response**: `{ success: true }`

---

### Salary Increment Management

#### Get Employee's Increment History
```typescript
trpc.payroll.increments.byEmployee.useQuery({ employeeId: string })
```
**Response**: `Array<SalaryIncrement>`

#### Create Salary Increment
```typescript
trpc.payroll.increments.create.useMutation()
  .mutate({
    employeeId: string,
    previousSalary: number,              // in cents
    newSalary: number,                   // in cents
    reason?: string,                     // e.g., "promotion", "merit"
    notes?: string,
  })
```
**Response**: `{ id: string }`
- Automatically calculates increment percentage
- Creates audit record
- Tracks creator

#### Approve Increment
```typescript
trpc.payroll.increments.approve.useMutation()
  .mutate({ id: string })
```
**Response**: `{ success: true }`
- Records approver and approval timestamp

#### Increment Reasons
- Promotion
- Merit Increase
- Cost of Living Adjustment
- Retention Bonus
- Signing Bonus
- Performance Bonus
- Other

---

### Payroll Approvals Workflow

#### Get Payroll Approvals
```typescript
trpc.payroll.approvals.byPayroll.useQuery({ payrollId: string })
```
**Response**: `Array<PayrollApproval>`

#### Create Approval Record
```typescript
trpc.payroll.approvals.create.useMutation()
  .mutate({
    payrollId: string,
    approverRole: string,                // e.g., "hr", "finance", "manager"
  })
```
**Response**: `{ id: string }`
- Creates pending approval record
- Tracks approver automatically

#### Approve Payroll
```typescript
trpc.payroll.approvals.approve.useMutation()
  .mutate({ id: string })
```
**Response**: `{ success: true }`
- Sets status to approved
- Records approval timestamp

#### Reject Payroll
```typescript
trpc.payroll.approvals.reject.useMutation()
  .mutate({
    id: string,
    reason: string,                      // rejection reason
  })
```
**Response**: `{ success: true }`
- Sets status to rejected
- Stores rejection reason

---

## Data Types

### Payroll
```typescript
{
  id: string,
  employeeId: string,
  payPeriodStart: string | null,        // ISO datetime
  payPeriodEnd: string | null,          // ISO datetime
  basicSalary: number,                  // cents
  allowances: number,                   // cents
  deductions: number,                   // cents
  tax: number,                          // cents
  netSalary: number,                    // cents
  status: 'draft' | 'processed' | 'paid',
  paymentDate?: string | null,
  paymentMethod?: string | null,
  notes?: string | null,
  createdBy: string,
  createdAt: string,                    // ISO datetime
  updatedAt: string,                    // ISO datetime
}
```

### SalaryStructure
```typescript
{
  id: string,
  employeeId: string,
  effectiveDate: string,                // ISO datetime
  basicSalary: number,                  // cents
  allowances: number,                   // cents
  deductions: number,                   // cents
  taxRate: number,                      // percentage × 100
  notes?: string | null,
  approvedBy?: string | null,
  approvedAt?: string | null,
  createdBy: string,
  createdAt: string,
  updatedAt: string,
}
```

### SalaryAllowance / SalaryDeduction
```typescript
{
  id: string,
  employeeId: string,
  allowanceType: string,
  amount: number,                       // cents
  frequency: 'monthly' | 'quarterly' | 'annual' | 'one_time',
  effectiveDate: string,                // ISO datetime
  endDate?: string | null,
  isActive: boolean,
  notes?: string | null,
  createdBy: string,
  createdAt: string,
  updatedAt: string,
}
```

### EmployeeBenefit
```typescript
{
  id: string,
  employeeId: string,
  benefitType: string,
  provider?: string,
  enrollDate: string,                   // ISO datetime
  endDate?: string | null,
  isActive: boolean,
  coverage?: string | null,             // JSON string
  cost?: number | null,                 // cents
  employerCost?: number | null,         // cents
  notes?: string | null,
  createdBy: string,
  createdAt: string,
  updatedAt: string,
}
```

---

## Error Handling

All endpoints return proper error responses:

```typescript
{
  code: 'FORBIDDEN' | 'INTERNAL_SERVER_ERROR' | 'BAD_REQUEST',
  message: 'Error description...'
}
```

### Common Errors
- **FORBIDDEN**: User doesn't have required role
- **INTERNAL_SERVER_ERROR**: Database operation failed
- **BAD_REQUEST**: Invalid input data

---

## Examples

### Example 1: Create Complete Payroll
```typescript
// 1. Create salary structure
const structure = await trpc.payroll.salaryStructures.create.mutate({
  employeeId: 'emp-123',
  basicSalary: 5000000,    // 50,000 KES
  allowances: 1500000,     // 15,000 KES
  deductions: 500000,      // 5,000 KES
  taxRate: 2500,           // 25%
});

// 2. Create allowances
await trpc.payroll.allowances.create.mutate({
  employeeId: 'emp-123',
  allowanceType: 'House Allowance',
  amount: 1000000,         // 10,000 KES
  frequency: 'monthly',
});

// 3. Create payroll
const payroll = await trpc.payroll.create.mutate({
  employeeId: 'emp-123',
  payPeriodStart: new Date('2026-02-01'),
  payPeriodEnd: new Date('2026-02-28'),
  basicSalary: 5000000,
  allowances: 1500000,
  deductions: 500000,
  tax: 1625000,            // calculated
  netSalary: 4375000,      // calculated
  status: 'draft',
});

// 4. Request approval
await trpc.payroll.approvals.create.mutate({
  payrollId: payroll.id,
  approverRole: 'hr',
});

// 5. Approve payroll
await trpc.payroll.approvals.approve.mutate({
  id: approval.id,
});
```

### Example 2: Assign Staff to Project
```typescript
// Assign user as team lead to project
await trpc.users.assignStaffToProject.mutate({
  userId: 'user-456',
  projectId: 'proj-789',
  role: 'team_lead',
});
```

---

## Rate Limiting & Best Practices

1. **Batch Operations**: Consider fetching multiple records in one query
2. **Caching**: Use query invalidation wisely
3. **Pagination**: Always paginate for large datasets
4. **Error Handling**: Always handle error responses
5. **Validation**: Client-side validation before submission

---

## Changelog

### Version 1.0.0 (Current)
- Initial HR & Payroll API
- 8 new database tables
- 25+ endpoints
- Role-based access control
- Full CRUD operations

---

**Last Updated**: February 26, 2026
**API Version**: 1.0.0
