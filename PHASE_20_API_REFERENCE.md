# Phase 20 API Reference - New Features

## Quick Access Guide

### Bulk Team Operations
```typescript
// Reassign team members
trpc.projects.teamMembers.bulkReassign.useMutation()

// Update team member details
trpc.projects.teamMembers.bulkUpdate.useMutation()

// Delete team members
trpc.projects.teamMembers.bulkDelete.useMutation()
```

### Service Templates
```typescript
// List templates
trpc.serviceTemplates.list.useQuery({ category?, search?, limit?, offset? })

// CRUD operations
trpc.serviceTemplates.getById.useQuery(templateId)
trpc.serviceTemplates.create.useMutation()
trpc.serviceTemplates.update.useMutation()
trpc.serviceTemplates.delete.useMutation()

// Usage tracking
trpc.serviceTemplates.getUsageStats.useQuery(templateId)
trpc.serviceTemplates.trackUsage.useMutation()
trpc.serviceTemplates.getUsageHistory.useQuery({ templateId, dateFrom?, dateTo? })

// Categories
trpc.serviceTemplates.getCategories.useQuery()
trpc.serviceTemplates.getByCategory.useQuery(category)

// Bulk operations
trpc.serviceTemplates.bulkDelete.useMutation()
```

### Budget Management
```typescript
// Project budgets
trpc.budget.projectBudgets.list.useQuery({ projectId?, status? })
trpc.budget.projectBudgets.getById.useQuery(budgetId)
trpc.budget.projectBudgets.create.useMutation()
trpc.budget.projectBudgets.update.useMutation()
trpc.budget.projectBudgets.delete.useMutation()

// Department budgets
trpc.budget.departmentBudgets.list.useQuery({ year, departmentId?, status? })
trpc.budget.departmentBudgets.create.useMutation()
trpc.budget.departmentBudgets.updateSpent.useMutation() // Auto-calc from expenses

// Dashboard & reporting
trpc.budget.dashboard.summary.useQuery({ year? })
trpc.budget.dashboard.byDepartment.useQuery({ year? })
trpc.budget.dashboard.byProject.useQuery()
trpc.budget.dashboard.alerts.useQuery()
```

---

## DETAILED API REFERENCE

## 1. BULK TEAM OPERATIONS

### bulkReassign
Move multiple team members to a different project.

**Input:**
```typescript
{
  memberIds: string[]      // Team member IDs to reassign
  newProjectId: string     // Destination project ID
}
```

**Output:**
```typescript
{
  success: boolean
  successCount: number     // Number reassigned successfully
  errors: string[]        // Error messages for failed reassignments
  totalRequested: number  // Total members requested
}
```

**Example:**
```typescript
const result = await trpc.projects.teamMembers.bulkReassign.mutate({
  memberIds: ["tm-001", "tm-002", "tm-003"],
  newProjectId: "proj-2024-remote-work"
});
// Returns: { success: true, successCount: 3, errors: [], totalRequested: 3 }
```

**Activity Log:**
- Action: `team_member_reassigned`
- Entity: `projectTeamMember`
- Description: "Reassigned from project X to Y"

---

### bulkUpdate
Update multiple team member assignments.

**Input:**
```typescript
{
  memberIds: string[]
  updates: {
    role?: string              // e.g., "Lead Developer"
    hoursAllocated?: number    // e.g., 40 (per week)
    startDate?: string         // ISO date string
    endDate?: string           // ISO date string
    isActive?: boolean
  }
}
```

**Output:**
```typescript
{
  success: boolean
  successCount: number
  errors: string[]
  totalRequested: number
}
```

**Example:**
```typescript
const result = await trpc.projects.teamMembers.bulkUpdate.mutate({
  memberIds: ["tm-001", "tm-002"],
  updates: {
    role: "Senior Developer",
    hoursAllocated: 40,
    startDate: "2026-03-01"
  }
});
// Only filled fields are updated; blank fields are skipped
```

**Activity Log:**
- Action: `team_member_bulk_updated`
- Entity: `projectTeamMember`
- Description: "Updated team member assignment fields"

---

### bulkDelete
Remove multiple team members from project.

**Input:**
```typescript
{
  memberIds: string[]  // Team member IDs to delete
}
```

**Output:**
```typescript
{
  success: boolean
  successCount: number
  errors: string[]
  totalRequested: number
}
```

**Example:**
```typescript
const result = await trpc.projects.teamMembers.bulkDelete.mutate({
  memberIds: ["tm-001", "tm-002", "tm-003"]
});
```

**Activity Log:**
- Action: `team_member_deleted`
- Entity: `project`
- Description: "Bulk removed staff member from project team"

---

## 2. SERVICE TEMPLATES

### list
Get all service templates with optional filtering.

**Input:**
```typescript
{
  limit?: number       // Default: 50
  offset?: number      // Default: 0
  category?: string    // Filter by category
  search?: string      // Search in name
}
```

**Output:**
```typescript
ServiceTemplate[]
// Each template contains:
// {
//   id, name, description, category, hourlyRate, fixedPrice,
//   unit, taxRate, estimatedDuration, deliverables (JSON),
//   terms, isActive, createdBy, createdAt, updatedAt
// }
```

---

### getById
Get single template.

**Input:** `templateId: string`

**Output:** `ServiceTemplate | null`

---

### create
Create new service template.

**Input:**
```typescript
{
  name: string                    // Required
  description?: string
  category?: string
  hourlyRate?: number             // In KES (will be converted to cents)
  fixedPrice?: number             // In KES
  unit?: string                   // "hour", "day", "project", etc.
  taxRate?: number                // Percentage (default 0)
  estimatedDuration?: number      // In hours
  deliverables?: string[]         // Array of deliverable descriptions
  terms?: string                  // Service terms and conditions
}
```

**Output:** `{ id: string }`

**Example:**
```typescript
const { id } = await trpc.serviceTemplates.create.mutate({
  name: "Website Design - E-commerce",
  category: "Design",
  hourlyRate: 2500,           // KES
  fixedPrice: 50000,          // KES
  unit: "project",
  taxRate: 16,                // 16% VAT
  estimatedDuration: 80,      // 80 hours
  deliverables: [
    "Wireframes",
    "UI Design", 
    "Responsive CSS",
    "Client Revisions (2 rounds)"
  ],
  terms: "50% upfront, 50% on delivery. Maintenance not included."
});
```

**Activity Log:**
- Action: `service_template_created`
- Entity: `serviceTemplate`
- Description: "Created service template: [name]"

---

### update
Update existing template.

**Input:**
```typescript
{
  id: string
  name?: string
  description?: string
  category?: string
  hourlyRate?: number
  fixedPrice?: number
  taxRate?: number
  estimatedDuration?: number
  deliverables?: string[]
  terms?: string
  isActive?: boolean
}
```

**Output:** `{ success: boolean }`

---

### delete
Soft delete template (mark inactive).

**Input:** `templateId: string`

**Output:** `{ success: boolean }`

**Activity Log:**
- Action: `service_template_deleted`
- Entity: `serviceTemplate`

---

### trackUsage
Record service usage.

**Input:**
```typescript
{
  serviceTemplateId: string
  invoiceId?: string               // Link to invoice if applicable
  estimateId?: string              // Link to estimate if applicable
  projectId?: string               // Link to project if applicable
  clientId: string                 // Required - which client used it
  quantity: number                 // Default: 1
  duration?: number                // In hours (if hourly service)
  usageDate: string                // ISO date string
  status: "pending" | "delivered" | "invoiced" | "paid" | "cancelled"
  notes?: string                   // Additional notes about usage
}
```

**Output:** `{ id: string }`

**Example:**
```typescript
const { id } = await trpc.serviceTemplates.trackUsage.mutate({
  serviceTemplateId: "svc-website-design",
  invoiceId: "inv-2026-001",
  clientId: "cli-acme-corp",
  quantity: 1,
  duration: 80,
  usageDate: "2026-02-27",
  status: "invoiced",
  notes: "Delivered 80 hours of design work for new product launch"
});
```

**Activity Log:**
- Action: `service_usage_tracked`
- Entity: `serviceUsage`

---

### getUsageStats
Get usage statistics for template.

**Input:** `templateId: string`

**Output:**
```typescript
{
  template: ServiceTemplate
  totalUsages: number              // Total times used
  totalQuantity: number            // Sum of all quantities
  totalDuration: number            // Sum of all hours
  estimatedRevenue: number         // In cents (hourly + fixed)
  statusBreakdown: {
    pending: number
    delivered: number
    invoiced: number
    paid: number
    cancelled: number
  }
  lastUsed: Date | null
}
```

**Example:**
```typescript
const stats = await trpc.serviceTemplates.getUsageStats.query("svc-web-dev");
// Returns: {
//   totalUsages: 5,
//   totalDuration: 200,
//   estimatedRevenue: 500000 (in cents = 5,000 KES),
//   statusBreakdown: { invoiced: 3, paid: 2, ... },
//   lastUsed: Date(2026-02-27)
// }
```

---

### getUsageHistory
Get all usage records for a template.

**Input:**
```typescript
{
  serviceTemplateId: string
  limit?: number                   // Default: 100
  offset?: number                  // Default: 0
  dateFrom?: string                // ISO date filter
  dateTo?: string                  // ISO date filter
}
```

**Output:** `ServiceUsageTracking[]`

---

### getByCategory
Get templates in specific category.

**Input:** `category: string` (e.g., "Development", "Design")

**Output:** `ServiceTemplate[]`

---

### getCategories
Get all unique template categories.

**Output:** `string[]` (sorted alphabetically)

---

### bulkDelete
Delete multiple templates.

**Input:** `templateIds: string[]`

**Output:**
```typescript
{
  success: boolean
  successCount: number
  errors: string[]
}
```

---

## 3. BUDGET MANAGEMENT

### Project Budgets

#### projectBudgets.list
Get project budgets.

**Input:**
```typescript
{
  projectId?: string
  status?: "under" | "at" | "over"  // Budget status
  limit?: number
  offset?: number
}
```

**Output:** `ProjectBudget[]`

---

#### projectBudgets.create
Create new project budget.

**Input:**
```typescript
{
  projectId: string
  budgetedAmount: number            // In KES
  startDate: string                 // ISO date
  endDate?: string                  // ISO date
  notes?: string
}
```

**Output:** `{ id: string }`

**Example:**
```typescript
const { id } = await trpc.budget.projectBudgets.create.mutate({
  projectId: "proj-2026-mobile-app",
  budgetedAmount: 150000,           // 150,000 KES
  startDate: "2026-03-01",
  endDate: "2026-05-31",
  notes: "Mobile app development - Q2 2026"
});
```

---

#### projectBudgets.update
Update budget amounts and notes.

**Input:**
```typescript
{
  id: string
  budgetedAmount?: number           // Update total budget
  spent?: number                    // Update spent amount (auto-calc status)
  notes?: string
}
```

**Output:** `{ success: boolean }`

**Auto-Calculation:**
- Updates `remaining = budgetedAmount - spent`
- Status: "under" if spent < budgeted, "over" if spent > budgeted, "at" if equal

---

#### projectBudgets.delete
Remove budget record.

**Output:** `{ success: boolean }`

---

### Department Budgets

#### departmentBudgets.list
Get department budgets for year.

**Input:**
```typescript
{
  year: number                      // Required
  departmentId?: string
  status?: "under" | "at" | "over"
}
```

**Output:** `DepartmentBudget[]`

---

#### departmentBudgets.create
Create annual department budget.

**Input:**
```typescript
{
  departmentId: string
  year: number
  budgetedAmount: number            // In KES
  category?: string                 // e.g., "payroll", "marketing"
  notes?: string
}
```

**Output:** `{ id: string }`

---

#### departmentBudgets.updateSpent
Auto-calculate spent from expenses table.

**Input:**
```typescript
{
  departmentId: string
  year: number
}
```

**Output:**
```typescript
{
  success: boolean
  spent: number                     // Total spent (in KES)
  remaining: number                 // Budget remaining (in KES)
}
```

**Logic:**
- Sums all expenses for department in specified year
- Updates budget record with spent amount
- Recalculates remaining and status

---

### Budget Dashboard

#### dashboard.summary
Get overall budget summary.

**Input:**
```typescript
{
  year?: number                     // Default: current year
}
```

**Output:**
```typescript
{
  year: number
  projects: {
    total: number                   // Total budgeted (cents)
    spent: number                   // Total spent (cents)
    remaining: number               // Balance (cents)
    percentage: number              // Spent % (0-100)
  }
  departments: {
    total: number
    spent: number
    remaining: number
    percentage: number
    overBudgetCount: number         // How many over budget
  }
  combined: {
    total: number                   // Projects + Departments
    spent: number
    remaining: number
  }
}
```

**Example:**
```typescript
const summary = await trpc.budget.dashboard.summary.query({ year: 2026 });
// Returns: {
//   projects: { total: 5000000, spent: 3200000, remaining: 1800000, percentage: 64 },
//   departments: { total: 10000000, spent: 8500000, remaining: 1500000, percentage: 85, overBudgetCount: 2 },
//   combined: { total: 15000000, spent: 11700000, remaining: 3300000 }
// }
```

---

#### dashboard.byDepartment
Compare budget vs actual by department.

**Input:**
```typescript
{
  year?: number                     // Default: current year
}
```

**Output:**
```typescript
{
  id: string
  departmentId: string
  category?: string
  budgeted: number                  // In cents
  spent: number                     // In cents
  remaining: number
  percentage: number                // Spent %
  status: "under" | "at" | "over"
  notes?: string
}[]
```

---

#### dashboard.byProject
Compare budget vs actual by project.

**Output:**
```typescript
{
  id: string
  projectId: string
  budgeted: number                  // In cents
  spent: number                     // In cents
  remaining: number
  percentage: number                // Spent %
  status: "under" | "at" | "over"
  startDate?: Date
  endDate?: Date
}[]
```

---

#### dashboard.alerts
Get items that are over budget.

**Output:**
```typescript
{
  id: string
  type: "department" | "project"
  name: string
  category?: string
  budgeted: number                  // In cents
  spent: number                     // In cents
  overage: number                   // Amount over (in cents)
  percentage: number                // Spent % (>100)
  severity: "critical" | "warning"  // Critical if >120% spent
}[]
```

**Example:**
```typescript
const alerts = await trpc.budget.dashboard.alerts.query();
// Returns items where spent > budgeted
// Sorted by severity (critical first)
```

---

## Frontend Components

### BulkTeamOperations
Multi-select component for team member bulk operations.

**Props:**
```typescript
interface BulkTeamOperationsProps {
  teamMembers: TeamMember[]
  onOperationComplete: () => void
  projectId: string
}
```

**Features:**
- Checkbox per team member
- Select all / deselect all toggle
- Bulk action toolbar (appears when items selected)
- Reassign modal with project selector
- Update modal for role/hours/dates
- Delete confirmation dialog
- Toast notifications

**Usage:**
```typescript
<BulkTeamOperations
  teamMembers={projectMembers}
  onOperationComplete={() => refetch()}
  projectId={projectId}
/>
```

---

### ProjectTimeline
Gantt chart visualization component.

**Props:**
```typescript
interface ProjectTimelineProps {
  projects: any[]
}
```

**Features:**
- Horizontal timeline with month headers
- Color-coded project bars
- Priority indicators
- Progress visualization
- Overdue alerts
- Hover tooltips
- Legend

**Usage:**
```typescript
<ProjectTimeline projects={allProjects} />
```

---

### BudgetDashboard
Complete budget management dashboard.

**Features:**
- Year selector
- Alert section for over-budget items
- Summary cards (overall, projects, departments)
- Department budget table
- Project budget grid
- Color-coded progress bars
- Currency formatting

**Usage:**
```typescript
<BudgetDashboard />
```

---

## Common Patterns and Helpers

### Amount Conversion
All monetary amounts stored in cents for precision:

```typescript
// Store: multiply by 100
const storageCents = 2500.50 * 100;  // 250050

// Display: divide by 100
const display = storageCents / 100;   // 2500.50

// Format for display
amount.toLocaleString("en-US", {
  style: "currency",
  currency: "KES"
})
```

### Date Handling
All dates as ISO strings:

```typescript
// Pass to API
const date = new Date().toISOString();  // "2026-02-27T10:30:00Z"

// Receive from API
const parsedDate = new Date("2026-02-27T10:30:00Z");

// Display
date.toLocaleDateString();  // "2/27/2026"
```

### Error Handling
```typescript
try {
  const result = await trpc.budget.projectBudgets.create.mutate(input);
  setToast({ message: "Budget created successfully", type: "success" });
} catch (error) {
  setToast({
    message: `Error: ${(error as any).message}`,
    type: "error"
  });
}
```

### Activity Logging
All mutations auto-log activities:

```typescript
// Logged data includes:
// - userId: current user ID
// - action: procedure-specific action name
// - entityType: "budget", "serviceTemplate", "projectTeamMember"
// - entityId: affected record ID
// - description: human-readable change description
// - timestamp: automatic
```

---

## Validation Rules

### Service Templates
- Name: Required, 1-255 characters
- Category: Optional, max 100 characters
- Hourly Rate: Optional, stored in cents
- Fixed Price: Optional, stored in cents
- Estimated Duration: Optional, in hours

### Budgets
- Budgeted Amount: Required, must be positive
- Department ID: Required for department budgets
- Year: Required for department budgets
- Status: Auto-calculated based on spent amount

### Team Operations
- Member IDs: Required, must exist
- New Project ID: Required for reassign
- At least one update field required for bulk update

---

## Performance Tips

1. **Use pagination** for large lists:
   ```typescript
   trpc.serviceTemplates.list.useQuery({
     limit: 20,
     offset: (page - 1) * 20
   })
   ```

2. **Filter before querying**:
   ```typescript
   trpc.budget.dashboard.summary.useQuery({ year: selectedYear })
   ```

3. **Cache results** with React Query:
   ```typescript
   const { data: templates } = trpc.serviceTemplates.getCategories.useQuery()
   // Automatically cached and reused
   ```

4. **Lazy load** usage history:
   ```typescript
   const [showHistory, setShowHistory] = useState(false)
   const history = trpc.serviceTemplates.getUsageHistory.useQuery(
     { templateId },
     { enabled: showHistory }  // Only fetch when needed
   )
   ```

---

## Related Documentation

- [Phase 20 Feature Implementation](./PHASE_20_FEATURE_IMPLEMENTATION.md)
- [Database Schema](./drizzle/schema-extended.ts)
- [Backend Routers](./server/routers/)
- [Frontend Components](./client/src/components/)

