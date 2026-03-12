# Continuation Guide: Remaining Features Implementation
**Last Updated:** March 6, 2026

This guide provides step-by-step instructions for completing the remaining features requested.

---

## 1. Complete API Permission Enforcement (Receipts → Users)

### Pattern (Proven on Invoices - 15 procedures)
All routers follow the same 3-step pattern:

```typescript
// Step 1: Add imports at top of router file
import { createFeatureRestrictedProcedure, createRoleRestrictedProcedure } from "../middleware/enhancedRbac";

// Step 2: Create procedure instances after imports, before helper functions
const viewProcedure = createFeatureRestrictedProcedure("module:feature:view");
const createProcedure = createFeatureRestrictedProcedure("module:feature:create");
const approveProcedure = createFeatureRestrictedProcedure("module:feature:approve");
const deleteProcedure = createRoleRestrictedProcedure(["super_admin", "admin"]);

// Step 3: Replace protectedProcedure declarations
export const router = {
  list: viewProcedure.query(...),           // Read access
  getById: viewProcedure.query(...),        // Read access
  create: createProcedure.mutation(...),    // Write access
  update: createProcedure.mutation(...),    // Edit access
  delete: deleteProcedure.mutation(...),    // Admin only
  approve: approveProcedure.mutation(...),  // Approval access
};
```

### Routers to Update (In Priority Order)

#### Priority 1: Accounting Module (Week 1)
1. **Receipts Router** - `server/routers/receipts.ts`
   - Procedures: list, getById, create, update, delete (5 procedures)
   - Feature: "accounting:receipts:view", "accounting:receipts:create"

2. **Payments Router** - `server/routers/payments.ts`
   - Procedures: list, getById, create, update, delete (5 procedures)
   - Feature: "accounting:payments:record", "accounting:payments:approve"

3. **Expenses Router** - `server/routers/expenses.ts`
   - Procedures: list, getById, create, update, delete (5 procedures)
   - Feature: "accounting:expenses:create", "accounting:expenses:approve"

#### Priority 2: Procurement Module (Week 2)
4. **LPOs Router** - `server/routers/lpos.ts`
   - Feature: "procurement:lpos:view", "procurement:lpos:create"

5. **Imprest Router** - `server/routers/imprest.ts`
   - Feature: "procurement:imprest:view", "procurement:imprest:create"

#### Priority 3: Admin & HR Module (Week 3)
6. **Users Router** - `server/routers/users.ts`
   - Feature: "admin:manage_users", "admin:manage_roles"

7. **Settings Router** - `server/routers/settings.ts`
   - Feature: "admin:settings", "admin:system"

### Automated Testing
After each router update:
```bash
# Build and verify no errors
npm run build

# Look for:
# ✅ dist/index.js generated successfully
# ✅ 0 new compilation errors
```

---

## 2. Apply Client-Side Route Protection

### Implementation Steps
1. **Import the hook** in protected pages:
   ```typescript
   import { useRequireFeature } from "@/lib/permissions";
   ```

2. **Use in component**:
   ```typescript
   const { allowed, isLoading } = useRequireFeature("accounting:invoices:view");
   
   if (isLoading) return <LoadingSpinner />;
   if (!allowed) return null; // Auto-redirects via hook
   
   return <YourComponent />;
   ```

3. **Pages to Add Protection** (20+ pages):
   - Admin: AdminManagement, Settings, Users
   - Accounting: Invoices, Receipts, Payments, Expenses, Reports
   - HR: Employees, Payroll, LeaveManagement, Attendance
   - Projects: Projects, ProjectDetails, TeamMembers
   - Procurement: LPOs, Imprests, Suppliers, Orders
   - Other: Clients, Products, Services, BankReconciliation

---

## 3. Display User Initials in Tables

### Available Helper Function
```typescript
// From client/src/lib/permissions.ts
export function getInitials(name?: string): string {
  if (!name) return "N/A";
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}
```

### Implementation Pattern
In any table cell renderer:
```typescript
// React Table example
{
  accessorKey: "createdBy",
  header: "Created By",
  cell: ({ row }) => (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold">
        {getInitials(row.original.createdByName)}
      </div>
      <span className="text-sm">{row.original.createdByName}</span>
    </div>
  ),
}
```

### Tables to Update (8+)
- Invoices: Add createdBy/approvedBy initials columns
- Receipts: Add createdBy initials
- Payments: Add createdBy initials
- Expenses: Add createdBy initials
- Payroll: Add processedBy initials
- Budgets: Add createdBy/approvedBy initials
- Approvals: Add actionBy initials
- Reports: Add generatedBy initials

---

## 4. Implement Dashboard System Status Cards

### TRPC Procedure Skeleton
Create in `server/routers/system.ts`:
```typescript
export const systemRouter = router({
  getSystemStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB error");
      
      // Get active users count
      const activeUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.isActive, true));
      
      // Get pending invoices
      const pendingInvoices = await db
        .select({ id: invoices.id, amount: invoices.total })
        .from(invoices)
        .where(eq(invoices.status, "pending"));
      
      const totalPending = pendingInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      
      return {
        totalUsers: activeUsers.length,
        pendingInvoices: pendingInvoices.length,
        outstandingAmount: totalPending / 100, // Convert from cents
        activeProjects: /* query projects */,
        systemHealth: "operational",
      };
    }),
});
```

### Component Implementation
```typescript
export function SystemStatusCards() {
  const { data: status } = trpc.system.getSystemStatus.useQuery();
  
  if (!status) return <Skeleton />;
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{status.totalUsers}</div>
        </CardContent>
      </Card>
      
      {/* Repeat for other metrics */}
    </div>
  );
}
```

### Dashboard Integration
Add to each role-specific dashboard:
- Super Admin Dashboard: `/crm/super-admin`
- Admin Dashboard: `/crm/admin`
- Accountant Dashboard: `/crm/accountant`
- HR Dashboard: `/crm/hr`
- Project Manager Dashboard: `/crm/project-manager`

---

## 5. Complete Approvals CRUD UI

### Delete Functionality Implementation

#### Add Delete Icon to Approvals Table
In the approvals component, add trash icon column:
```typescript
{
  id: "actions",
  cell: ({ row }) => (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleApprove(row.original.id)}
      >
        ✓ Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleReject(row.original.id)}
      >
        ✗ Reject
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleDelete(row.original.id)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  ),
}
```

#### Wire Delete Mutation
```typescript
const deleteMutation = trpc.approvals.deleteApproval.useMutation({
  onSuccess: () => {
    toast.success("Approval deleted");
    utils.approvals.getPendingApprovals.invalidate();
  },
  onError: (error) => {
    toast.error(`Delete failed: ${error.message}`);
  },
});

const handleDelete = async (id: string) => {
  if (!window.confirm("Permanently delete this approval?")) return;
  await deleteMutation.mutateAsync({ approvalId: id });
};
```

---

## 6. Email Tracking & Analytics Setup

### Implementation Options

#### Option A: Postmark Integration (Recommended)
1. Sign up at postmark.com
2. Install: `npm install postmark`
3. Create email tracking DB tables:
   ```sql
   CREATE TABLE emailEvents (
     id VARCHAR(64) PRIMARY KEY,
     messageId VARCHAR(100),
     eventType ENUM('Bounce', 'Open', 'Click', 'Delivery', 'Spam'),
     timestamp TIMESTAMP,
     data JSON,
     createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

4. Add webhook handler:
   ```typescript
   // In server/webhooks/postmark.ts
   export async function handlePostmarkWebhook(body: any) {
     const { MessageID, RecordType, ...eventData } = body;
     
     const db = await getDb();
     await db.insert(emailEvents).values({
       id: uuidv4(),
       messageId: MessageID,
       eventType: RecordType,
       timestamp: new Date().toISOString(),
       data: JSON.stringify(eventData),
     });
   }
   ```

#### Option B: SendGrid Integration
Similar process with SendGrid webhook handlers

#### Option C: Custom Email Tracking
1. Add tracking pixel to HTML emails
2. Track database operations on send/open events
3. Create analytics dashboard from DB data

### Analytics Dashboard Implementation
```typescript
// Route: /reporting/email-analytics
export function EmailAnalyticsDashboard() {
  const { data: analytics } = trpc.reporting.getEmailAnalytics.useQuery();
  
  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Email Delivery Rate</CardTitle>
        <ChartComponent data={analytics.deliveryRate} />
      </Card>
      
      <Card>
        <CardTitle>Email Open Rate</CardTitle>
        <ChartComponent data={analytics.openRate} />
      </Card>
      
      <Card>
        <CardTitle>Email Click Rate</CardTitle>
        <ChartComponent data={analytics.clickRate} />
      </Card>
      
      <Card>
        <CardTitle>Bounce Rate</CardTitle>
        <ChartComponent data={analytics.bounceRate} />
      </Card>
    </div>
  );
}
```

---

## Testing Checklist

### Before Deploying Each Feature

#### Permission Enforcement Testing
- [ ] Unauthorized users get 403 errors
- [ ] Authorized users can access procedures
- [ ] Admin can access everything
- [ ] Redirects work correctly
- [ ] Audit logs capture all actions

#### Route Protection Testing
- [ ] Direct URL access blocked for unauthorized users
- [ ] Toast notifications show
- [ ] Redirects to correct dashboard
- [ ] Works on both new and legacy routes

#### Table Initials Testing
- [ ] Initials display correctly for all users
- [ ] "N/A" shows for blank names
- [ ] Avatar styling looks good
- [ ] No console errors

#### Status Cards Testing
- [ ] Metrics update in real-time
- [ ] Loading skeleton shows initially
- [ ] No database errors
- [ ] Responsive on mobile

#### Approvals Delete Testing
- [ ] Delete button visible
- [ ] Confirmation dialog works
- [ ] Deletion succeeds
- [ ] Table refreshes
- [ ] Audit log records action

---

## Git Workflow

### Create Feature Branches
```bash
# For each feature
git checkout -b feature/permission-enforcement-receipts
# OR
git checkout -b feature/route-protection-pages
# OR
git checkout -b feature/email-tracking
```

### Commit Messages
```bash
git commit -m "feat: enforce permissions on receipts router (15 procedures)

- Add RBAC feature controls for accounting:receipts:view
- Implement role-based access validation
- Update tests for authentication

RESOLVES: API Permission Enforcement Task"
```

### Push and Create PR
```bash
git push origin feature/permission-enforcement-receipts
# Then create PR with detailed description
```

---

## Documentation Requirements

For each completed feature:
1. Update [IMPLEMENTATION_CHECKLIST_PROGRESS.md](./IMPLEMENTATION_CHECKLIST_PROGRESS.md)
2. Record in [COMPREHENSIVE_FIXES_SUMMARY.md](./COMPREHENSIVE_FIXES_SUMMARY.md)
3. Create test documentation
4. Update API_QUICK_REFERENCE.md if new endpoints

---

## Estimated Timeline

- **Permission Enforcement:** 3-4 weeks (5 routers × 2-3 days each)
- **Route Protection:** 1-2 weeks (20+ pages × 30 minutes each)
- **User Initials:** 3-4 days (8+ tables × 30 minutes each)
- **Status Cards:** 2-3 days (implementation + integration)
- **Approvals Delete:** 1 day (UI + wiring)
- **Email Tracking:** 1-2 weeks (integration + testing)

**Total Estimated:** 8-12 weeks

---

## Support Resources

- RBAC Documentation: [API_PERMISSION_ENFORCEMENT_GUIDE.md](./API_PERMISSION_ENFORCEMENT_GUIDE.md)
- Client Route Guide: [CLIENT_ROUTE_PROTECTION_GUIDE.md](./CLIENT_ROUTE_PROTECTION_GUIDE.md)
- Database Schema: `drizzle/schema.ts` and `drizzle/schema-extended.ts`
- Error Handling: Check `server/middleware/errorHandler.ts`

---

**Next Session:** Start with Priority 1 (Receipts Router) for maximum impact
