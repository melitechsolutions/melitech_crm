# Backend API Routes for Client Portal & Role-Based Dashboards

## Overview

This document outlines the required backend API routes (tRPC procedures) needed to support the fixed authentication system and role-based dashboards.

## Authentication Routes

### `auth.login`
**Type**: Public Mutation
**Input**:
```typescript
{
  email: string;
  password: string;
}
```

**Output**:
```typescript
{
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: "super_admin" | "admin" | "staff" | "accountant" | "hr" | "user" | "client";
  };
  token: string; // JWT token for localStorage fallback
}
```

**Implementation Notes**:
- Return JWT token in response for localStorage fallback
- Set httpOnly cookie with token
- Update `lastSignedIn` timestamp
- Hash and verify password using bcrypt

### `auth.logout`
**Type**: Public Mutation
**Output**:
```typescript
{
  success: boolean;
}
```

**Implementation Notes**:
- Clear session cookie
- Invalidate session on server if using sessions
- No input required

### `auth.me`
**Type**: Public Query
**Output**:
```typescript
{
  id: string;
  email: string;
  name: string;
  role: string;
  loginMethod: string;
} | null
```

**Implementation Notes**:
- Extract user from JWT token in cookie or Authorization header
- Return null if not authenticated
- Used to verify session on page load

### `auth.register`
**Type**: Public Mutation
**Input**:
```typescript
{
  email: string;
  password: string;
  name: string;
}
```

**Output**:
```typescript
{
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
}
```

## Client Routes

### `clients.getClientByUserId`
**Type**: Protected Query
**Input**: None (uses authenticated user ID)
**Output**:
```typescript
{
  id: string;
  name: string;
  email: string;
  phone?: string;
  accountManager?: string;
  address?: string;
  city?: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Implementation Notes**:
- Only accessible to authenticated users
- Returns client data for the authenticated user
- Used in ClientPortal component

### `clients.getAll`
**Type**: Protected Query (Admin/Super Admin only)
**Input**: Optional filters
**Output**:
```typescript
{
  id: string;
  name: string;
  email: string;
  phone?: string;
  accountManager?: string;
  status: "active" | "inactive";
  createdAt: Date;
}[]
```

**Implementation Notes**:
- Only accessible to admin and super_admin roles
- Supports pagination and filtering
- Used in Admin/Super Admin dashboards

## Project Routes

### `projects.getClientProjects`
**Type**: Protected Query
**Input**: None (uses authenticated user ID)
**Output**:
```typescript
{
  id: string;
  name: string;
  status: "active" | "on-hold" | "completed" | "cancelled";
  progress: number; // 0-100
  startDate: Date;
  endDate: Date;
  budget: number;
  spent: number;
  description?: string;
  clientId: string;
}[]
```

**Implementation Notes**:
- Only returns projects for authenticated client
- Includes budget and spending information
- Used in ClientPortal component

### `projects.getAll`
**Type**: Protected Query (Staff/Admin only)
**Input**: Optional filters
**Output**:
```typescript
{
  id: string;
  name: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  clientName: string;
  manager: string;
  createdAt: Date;
}[]
```

**Implementation Notes**:
- Only accessible to staff, admin, and super_admin roles
- Supports filtering by status, client, date range
- Used in Staff/Admin dashboards

## Invoice Routes

### `invoices.getClientInvoices`
**Type**: Protected Query
**Input**: None (uses authenticated user ID)
**Output**:
```typescript
{
  id: string;
  date: Date;
  amount: number;
  status: "paid" | "pending" | "overdue" | "cancelled";
  dueDate: Date;
  description?: string;
  clientId: string;
}[]
```

**Implementation Notes**:
- Only returns invoices for authenticated client
- Includes payment status
- Used in ClientPortal component

### `invoices.getAll`
**Type**: Protected Query (Accountant/Admin only)
**Input**: Optional filters
**Output**:
```typescript
{
  id: string;
  clientName: string;
  amount: number;
  status: string;
  date: Date;
  dueDate: Date;
  paid: number;
  remaining: number;
}[]
```

**Implementation Notes**:
- Only accessible to accountant, admin, and super_admin roles
- Supports filtering by status, date range, client
- Used in Accountant/Admin dashboards

## Document Routes

### `documents.getClientDocuments`
**Type**: Protected Query
**Input**: None (uses authenticated user ID)
**Output**:
```typescript
{
  id: string;
  name: string;
  type: "proposal" | "contract" | "invoice" | "receipt" | "other";
  date: Date;
  size: string;
  url?: string;
  clientId: string;
}[]
```

**Implementation Notes**:
- Only returns documents for authenticated client
- Includes file size and type
- Used in ClientPortal component

### `documents.download`
**Type**: Protected Query
**Input**:
```typescript
{
  documentId: string;
}
```

**Output**:
```typescript
{
  url: string; // Presigned URL for download
  name: string;
}
```

**Implementation Notes**:
- Only accessible to document owner or admin
- Returns presigned URL for secure download
- Logs download for audit trail

## Employee Routes (HR Dashboard)

### `employees.getAll`
**Type**: Protected Query (HR/Admin only)
**Input**: Optional filters
**Output**:
```typescript
{
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  status: "active" | "inactive" | "on-leave";
  hireDate: Date;
  salary?: number;
}[]
```

## Attendance Routes (HR Dashboard)

### `attendance.getTodayStatus`
**Type**: Protected Query
**Input**: None
**Output**:
```typescript
{
  status: "present" | "absent" | "late" | "on-leave";
  checkinTime?: Date;
  checkoutTime?: Date;
}
```

### `attendance.getMonthly`
**Type**: Protected Query
**Input**: Optional month/year
**Output**:
```typescript
{
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  percentage: number;
}
```

## Leave Routes (HR Dashboard)

### `leaves.getPending`
**Type**: Protected Query (HR only)
**Input**: None
**Output**:
```typescript
{
  id: string;
  employeeName: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: "pending" | "approved" | "rejected";
}[]
```

### `leaves.getMyRequests`
**Type**: Protected Query (Staff only)
**Input**: None
**Output**:
```typescript
{
  id: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  status: string;
  approvedBy?: string;
}[]
```

## Payroll Routes (HR/Accountant Dashboard)

### `payroll.getMonthly`
**Type**: Protected Query (HR/Accountant only)
**Input**:
```typescript
{
  month: number;
  year: number;
}
```

**Output**:
```typescript
{
  id: string;
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  deductions: number;
  netSalary: number;
  status: "pending" | "processed" | "paid";
}[]
```

## Financial Routes (Accountant Dashboard)

### `finances.getOverview`
**Type**: Protected Query (Accountant/Admin only)
**Input**: Optional date range
**Output**:
```typescript
{
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  outstandingInvoices: number;
  pendingPayments: number;
}
```

### `finances.getTransactions`
**Type**: Protected Query (Accountant/Admin only)
**Input**: Optional filters
**Output**:
```typescript
{
  id: string;
  type: "income" | "expense";
  description: string;
  amount: number;
  date: Date;
  category: string;
  reference?: string;
}[]
```

## User Management Routes (Super Admin Dashboard)

### `users.getAll`
**Type**: Protected Query (Super Admin only)
**Input**: Optional filters
**Output**:
```typescript
{
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  lastLogin?: Date;
  createdAt: Date;
}[]
```

### `users.create`
**Type**: Protected Mutation (Super Admin only)
**Input**:
```typescript
{
  name: string;
  email: string;
  password: string;
  role: string;
}
```

### `users.updateRole`
**Type**: Protected Mutation (Super Admin only)
**Input**:
```typescript
{
  userId: string;
  role: string;
}
```

## Error Handling

All routes should return proper error responses:

```typescript
{
  code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "BAD_REQUEST" | "INTERNAL_SERVER_ERROR";
  message: string;
}
```

### Common Error Codes:
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User authenticated but lacks permission
- `NOT_FOUND`: Resource not found
- `BAD_REQUEST`: Invalid input
- `INTERNAL_SERVER_ERROR`: Server error

## Implementation Priority

### Phase 1 (Critical)
- `auth.login`
- `auth.logout`
- `auth.me`
- `clients.getClientByUserId`
- `projects.getClientProjects`
- `invoices.getClientInvoices`
- `documents.getClientDocuments`

### Phase 2 (Important)
- `clients.getAll`
- `projects.getAll`
- `invoices.getAll`
- `employees.getAll`
- `attendance.getTodayStatus`
- `finances.getOverview`

### Phase 3 (Enhancement)
- `leaves.getPending`
- `leaves.getMyRequests`
- `payroll.getMonthly`
- `finances.getTransactions`
- `users.getAll`
- `users.create`
- `users.updateRole`

## Testing

Each route should be tested with:
1. Valid authenticated user with correct role
2. Valid authenticated user with incorrect role (should return FORBIDDEN)
3. Unauthenticated user (should return UNAUTHORIZED)
4. Invalid input (should return BAD_REQUEST)
5. Non-existent resource (should return NOT_FOUND)

## Security Considerations

1. **Role-Based Access Control**: Always verify user role before returning data
2. **Data Filtering**: Only return data accessible to the authenticated user
3. **Rate Limiting**: Implement rate limiting on sensitive endpoints
4. **Audit Logging**: Log all access to sensitive data
5. **Input Validation**: Validate all input parameters
6. **SQL Injection**: Use parameterized queries
7. **CORS**: Configure CORS properly for frontend domain

