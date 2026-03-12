# Bulk Actions & Pagination Implementation Guide

## Overview

This guide explains how to implement bulk actions with pagination in all list pages. Two key components have been created:

1. **BulkActionsToolbar** - Reusable component for bulk operations
2. **Enhanced Pagination** - Pagination component already available in the UI library

## Quick Start

### 1. Import Required Components

```tsx
import { BulkActionsToolbar, useBulkActions, BulkActionCheckbox } from "@/components/BulkActionsToolbar";
import { useState } from "react";
```

### 2. Set Up State Management

```tsx
export default function ClientsList() {
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  
  // Fetch data with pagination
  const { 
    data: clients = [],
    isLoading,
    isPending,
  } = trpc.clients.list.useQuery({
    limit,
    offset: (page - 1) * limit,
  });

  // Bulk actions state using custom hook
  const {
    selectedIds,
    isSelectAllChecked,
    toggleId,
    selectAll,
    clearSelection,
  } = useBulkActions(clients, "id");

  // Mutations for bulk operations
  const bulkDeleteMutation = trpc.clients.bulkDelete.useMutation({
    onSuccess: () => {
      toast.success("Clients deleted successfully");
      clearSelection();
      utils.clients.list.invalidate();
    },
  });

  const bulkStatusMutation = trpc.clients.bulkUpdateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      clearSelection();
      utils.clients.list.invalidate();
    },
  });
```

### 3. Define Bulk Actions

```tsx
  const bulkActions = [
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      variant: "destructive" as const,
      onClick: async (ids) => {
        await bulkDeleteMutation.mutateAsync({ ids });
      },
    },
    {
      id: "archive",
      label: "Archive",
      icon: <Archive className="w-4 h-4" />,
      onClick: async (ids) => {
        await bulkStatusMutation.mutateAsync({
          ids,
          status: "archived",
        });
      },
    },
    {
      id: "export",
      label: "Export",
      icon: <Download className="w-4 h-4" />,
      onClick: async (ids) => {
        // Export selected clients to CSV
        const selectedClients = clients.filter(c => ids.includes(c.id));
        const csv = convertToCSV(selectedClients);
        downloadCSV(csv, "clients.csv");
      },
    },
  ];
```

### 4. Render UI with Bulk Actions

```tsx
  return (
    <div className="space-y-4">
      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedIds={selectedIds}
        totalCount={clients.length}
        isSelectAllChecked={isSelectAllChecked}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        actions={bulkActions}
        isLoading={isLoading || bulkDeleteMutation.isPending}
      />

      {/* Table with Checkboxes */}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12">
              <Checkbox
                checked={isSelectAllChecked}
                onCheckedChange={selectAll}
                disabled={isLoading}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <BulkActionCheckbox
                  id={client.id}
                  checked={selectedIds.includes(client.id)}
                  onCheckedChange={(checked) => toggleId(client.id, Boolean(checked))}
                  disabled={isLoading}
                />
              </TableCell>
              <TableCell>{client.name}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>
                <Badge variant={client.status === "active" ? "default" : "secondary"}>
                  {client.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} clients
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.ceil(totalCount / limit) }, (_, i) => i + 1)
              .slice(Math.max(0, page - 3), Math.min(Math.ceil(totalCount / limit), page + 2))
              .map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(p)}
                  disabled={isLoading}
                >
                  {p}
                </Button>
              ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(totalCount / limit) || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Backend Implementation

### Add tRPC Procedures for Bulk Operations

```typescript
// server/routers/clients.ts

export const clientsRouter = router({
  // ... existing procedures

  // Bulk delete clients
  bulkDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.clients.deleteMany({
        where: { id: { in: input.ids } },
      });

      return { success: true, deleted: input.ids.length };
    }),

  // Bulk update status
  bulkUpdateStatus: protectedProcedure
    .input(z.object({ 
      ids: z.array(z.string()),
      status: z.enum(["active", "inactive", "archived"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.clients.updateMany({
        data: { status: input.status },
        where: { id: { in: input.ids } },
      });

      return { success: true, updated: input.ids.length };
    }),

  // List with pagination
  list: protectedProcedure
    .input(z.object({
      limit: z.number().default(20).max(100),
      offset: z.number().default(0),
      search: z.string().optional(),
      status: z.enum(["active", "inactive", "archived"]).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const where = {
        ...(input.search && {
          OR: [
            { name: { contains: input.search, mode: "insensitive" } },
            { email: { contains: input.search, mode: "insensitive" } },
          ],
        }),
        ...(input.status && { status: input.status }),
      };

      const [clients, total] = await Promise.all([
        db.clients.findMany({
          where,
          take: input.limit,
          skip: input.offset,
          orderBy: { createdAt: "desc" },
        }),
        db.clients.count({ where }),
      ]);

      return {
        data: clients,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),
});
```

## Features

### BulkActionsToolbar Props

| Prop | Type | Description |
|------|------|-------------|
| `selectedIds` | `string[]` | Array of currently selected item IDs |
| `totalCount` | `number` | Total number of items in the list |
| `isSelectAllChecked` | `boolean` | Whether select-all checkbox is checked |
| `onSelectAll` | `(checked: boolean) => void` | Callback when select-all is toggled |
| `onClearSelection` | `() => void` | Callback to clear selection |
| `actions` | `BulkAction[]` | Array of action definitions |
| `isLoading` | `boolean` | Whether any operation is in progress |

### useBulkActions Hook

```tsx
const {
  selectedIds,           // string[] - Currently selected IDs
  isSelectAllChecked,    // boolean - Is select-all active
  toggleId,             // (id: string, checked: boolean) => void
  selectAll,            // (checked: boolean) => void
  clearSelection,       // () => void
} = useBulkActions(items, "id");
```

## Example: Employees List with Bulk Actions

```tsx
import { BulkActionsToolbar, useBulkActions, BulkActionCheckbox } from "@/components/BulkActionsToolbar";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Mail, Download, Shield } from "lucide-react";

export default function Employees() {
  // ... state setup
  const [page, setPage] = useState(1);
  const [limit, setPage] = useState(25);

  const { data: employees = [], isLoading } = trpc.employees.list.useQuery({
    limit,
    offset: (page - 1) * limit,
  });

  const { selectedIds, isSelectAllChecked, toggleId, selectAll, clearSelection } = 
    useBulkActions(employees, "id");

  const bulkDeleteMutation = trpc.employees.bulkDelete.useMutation({
    onSuccess: () => {
      toast.success("Employees removed");
      clearSelection();
      utils.employees.list.invalidate();
    },
  });

  const bulkSendEmailMutation = trpc.communications.bulkEmail.useMutation({
    onSuccess: () => {
      toast.success("Emails queued for sending");
      clearSelection();
    },
  });

  const bulkGrantAccessMutation = trpc.roles.bulkGrantAccess.useMutation({
    onSuccess: () => {
      toast.success("Access granted");
      clearSelection();
      utils.employees.list.invalidate();
    },
  });

  const bulkActions = [
    {
      id: "send-email",
      label: "Send Email",
      icon: <Mail className="w-4 h-4" />,
      onClick: async (ids) => {
        await bulkSendEmailMutation.mutateAsync({
          employeeIds: ids,
          subject: "Important Update",
          template: "onboarding",
        });
      },
    },
    {
      id: "grant-access",
      label: "Grant Access",
      icon: <Shield className="w-4 h-4" />,
      onClick: async (ids) => {
        await bulkGrantAccessMutation.mutateAsync({
          employeeIds: ids,
          roleId: "employee",
        });
      },
    },
    {
      id: "export",
      label: "Export",
      icon: <Download className="w-4 h-4" />,
      onClick: async (ids) => {
        // Export
        const selected = employees.filter(e => ids.includes(e.id));
        exportToCSV(selected, "employees.csv");
      },
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      variant: "destructive",
      onClick: async (ids) => {
        await bulkDeleteMutation.mutateAsync({ ids });
      },
    },
  ];

  return (
    <ModuleLayout
      title="Employees"
      description="Manage your team members"
    >
      <BulkActionsToolbar
        selectedIds={selectedIds}
        totalCount={employees.length}
        isSelectAllChecked={isSelectAllChecked}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        actions={bulkActions}
        isLoading={isLoading}
      />

      {/* Render table with checkboxes */}
    </ModuleLayout>
  );
}
```

## Best Practices

1. **Confirmation Dialogs** - Always confirm before destructive actions
2. **Feedback** - Use toast notifications for operation results
3. **Disable During Operation** - Disable checkboxes and actions while operations are in progress
4. **Progressive Enhancement** - Start with single delete, add bulk later
5. **Pagination** - Use reasonable defaults (20-50 items per page)
6. **API Design** - Create explicit bulk endpoints rather than looping single operations
7. **Accessibility** - Ensure checkboxes are keyboard accessible

## Modules to Update

### Priority 1 (Core Operations)
- [ ] Clients - Add bulk delete, bulk update status
- [ ] Invoices - Add bulk delete, bulk send reminder
- [ ] Employees - Add bulk delete, bulk grant access

### Priority 2 (Important)
- [ ] Projects - Add bulk delete, bulk update status
- [ ] Products - Add bulk delete, bulk update price
- [ ] Payments - Add bulk export, bulk reconcile

### Priority 3 (Nice to Have)
- [ ] Expenses - Add bulk delete, bulk approve
- [ ] Departments - Add bulk archive
- [ ] Leave Requests - Add bulk approve/reject

## Testing Checklist

- [ ] Select single item
- [ ] Select multiple items
- [ ] Select all items
- [ ] Deselect all items
- [ ] Execute single action
- [ ] Execute action on multiple items
- [ ] Pagination works with selections
- [ ] Selections clear after successful action
- [ ] Bulk actions disable during operation
- [ ] Confirmation dialogs appear for destructive actions
- [ ] Database updates correctly
- [ ] UI refreshes after operation

