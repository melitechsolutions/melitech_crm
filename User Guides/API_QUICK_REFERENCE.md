# Melitech CRM - API Quick Reference

## Chart of Accounts

### List Accounts
```typescript
const accounts = await trpc.chartOfAccounts.list.query({
  limit: 50,
  offset: 0,
  type: 'asset' // optional: 'asset', 'liability', 'equity', 'revenue', 'expense'
});
```

### Create Account
```typescript
const result = await trpc.chartOfAccounts.create.mutate({
  accountCode: "1000-CASH",
  accountName: "Cash Account",
  accountType: "asset",
  balance: 10000,
  description: "Main cash account"
});
```

### Update Account
```typescript
const result = await trpc.chartOfAccounts.update.mutate({
  id: "account-id",
  accountName: "Updated Name",
  balance: 15000
});
```

### Delete Account (with validation)
```typescript
const result = await trpc.chartOfAccounts.delete.mutate("account-id");
```

### Bulk Delete Accounts
```typescript
const result = await trpc.chartOfAccounts.bulkDelete.mutate([
  "account-id-1",
  "account-id-2"
]);
// Returns: { deleted: 2, failed: 0, errors: [] }
```

### Get Account Hierarchy
```typescript
const hierarchy = await trpc.chartOfAccounts.getHierarchy.query();
```

### Validate Deletion
```typescript
const validation = await trpc.chartOfAccounts.validateDeletion.query("account-id");
// Returns: { canDelete: true, reason: "Account can be deleted" }
```

### Export Accounts
```typescript
const export = await trpc.chartOfAccounts.export.query({
  type: 'all', // or specific type
  format: 'csv' // or 'json'
});
```

---

## Email Operations

### Send Invoice
```typescript
const result = await trpc.email.sendInvoice.mutate({
  invoiceId: "inv-123",
  recipientEmail: "client@example.com",
  message: "Optional message",
  attachPDF: true
});
```

### Send Estimate
```typescript
const result = await trpc.email.sendEstimate.mutate({
  estimateId: "est-123",
  recipientEmail: "client@example.com",
  attachPDF: true
});
```

### Send Payment Reminder
```typescript
const result = await trpc.email.sendPaymentReminder.mutate({
  invoiceId: "inv-123",
  recipientEmail: "client@example.com"
});
```

### Send Payment Received Notification
```typescript
const result = await trpc.email.sendPaymentReceivedNotification.mutate({
  invoiceId: "inv-123",
  recipientEmail: "client@example.com",
  paymentAmount: 5000
});
```

### Batch Send Invoices
```typescript
const result = await trpc.email.batchSendInvoices.mutate({
  invoiceIds: ["inv-1", "inv-2", "inv-3"],
  message: "Optional message"
});
// Returns: { sent: 3, failed: 0, errors: [] }
```

### Batch Send Payment Reminders
```typescript
const result = await trpc.email.batchSendPaymentReminders.mutate({
  invoiceIds: ["inv-1", "inv-2"],
  daysOverdueThreshold: 7
});
```

---

## Reports

### Profit & Loss Report
```typescript
const pl = await trpc.reports.profitAndLoss.query({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31')
});
// Returns: { period, revenue, expenses, netIncome, netIncomePercentage }
```

### Balance Sheet
```typescript
const bs = await trpc.reports.balanceSheet.query();
// Returns: { assets, liabilities, equity, totalLiabilitiesAndEquity, balanced }
```

### Sales Report
```typescript
const sales = await trpc.reports.salesReport.query({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  groupBy: 'month' // 'day', 'week', or 'month'
});
// Returns: { period, summary, byClient, byStatus }
```

### Cash Flow Report
```typescript
const cf = await trpc.reports.cashFlowReport.query({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31')
});
// Returns: { period, inflow, outflow, netCashFlow, cashFlowTrend }
```

### Customer Analysis
```typescript
const ca = await trpc.reports.customerAnalysis.query();
// Returns: { summary, topCustomers, allCustomers }
```

### Aging Report
```typescript
const aging = await trpc.reports.agingReport.query();
// Returns: { aged, totals, grandTotal, percentages }
```

---

## Import/Export

### Import Clients
```typescript
const result = await trpc.importExport.importClients.mutate({
  data: [
    {
      companyName: "Acme Corp",
      contactPerson: "John Doe",
      email: "john@acme.com",
      phone: "+254700000000",
      address: "123 Main St",
      city: "Nairobi",
      country: "Kenya",
      status: "active"
    }
  ],
  skipDuplicates: true
});
// Returns: { imported: 1, skipped: 0, errors: [] }
```

### Import Services
```typescript
const result = await trpc.importExport.importServices.mutate({
  data: [
    {
      serviceName: "Web Development",
      description: "Custom web development",
      serviceType: "development",
      rate: 5000,
      unit: "hour",
      status: "active"
    }
  ],
  skipDuplicates: true
});
```

### Import Products
```typescript
const result = await trpc.importExport.importProducts.mutate({
  data: [
    {
      productName: "Laptop",
      description: "Dell XPS 13",
      sku: "DELL-XPS-13",
      unitPrice: 150000,
      quantity: 10,
      category: "Electronics",
      status: "active"
    }
  ],
  skipDuplicates: true
});
```

### Export Clients
```typescript
const export = await trpc.importExport.exportClients.query({
  format: 'csv', // or 'json'
  status: 'active' // or 'all', 'inactive', etc.
});
// Returns: { data, format, fileName }
```

### Export Services
```typescript
const export = await trpc.importExport.exportServices.query({
  format: 'csv'
});
```

### Export Products
```typescript
const export = await trpc.importExport.exportProducts.query({
  format: 'csv'
});
```

### Validate Import Data
```typescript
const validation = await trpc.importExport.validateImportData.query({
  type: 'clients', // 'clients', 'services', or 'products'
  data: importData
});
// Returns: { isValid, errors, warnings, rowCount }
```

---

## Error Handling Examples

### Handling Chart of Accounts Errors
```typescript
try {
  await trpc.chartOfAccounts.delete.mutate(accountId);
} catch (error) {
  if (error.message.includes("child accounts")) {
    console.log("Cannot delete account with child accounts");
  } else if (error.message.includes("not found")) {
    console.log("Account not found");
  }
}
```

### Handling Bulk Operation Errors
```typescript
const result = await trpc.chartOfAccounts.bulkDelete.mutate(accountIds);
if (result.failed > 0) {
  console.log("Some accounts failed to delete:");
  result.errors.forEach(error => console.log(error));
}
```

### Handling Import Errors
```typescript
const result = await trpc.importExport.importClients.mutate({
  data: clients,
  skipDuplicates: true
});
console.log(`Imported: ${result.imported}, Skipped: ${result.skipped}`);
if (result.errors.length > 0) {
  console.log("Errors:", result.errors);
}
```

---

## Common Patterns

### Fetching and Displaying Data
```typescript
const { data, isLoading, error } = trpc.chartOfAccounts.list.useQuery({
  type: 'asset'
});

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
return <div>{data?.map(acc => <div>{acc.accountName}</div>)}</div>;
```

### Mutation with Error Handling
```typescript
const mutation = trpc.chartOfAccounts.create.useMutation({
  onSuccess: (data) => {
    console.log("Account created:", data);
    utils.chartOfAccounts.list.invalidate();
  },
  onError: (error) => {
    console.error("Error creating account:", error.message);
  }
});

const handleCreate = (formData) => {
  mutation.mutate(formData);
};
```

### Batch Operations
```typescript
const batchDelete = trpc.chartOfAccounts.bulkDelete.useMutation({
  onSuccess: (result) => {
    toast.success(`Deleted ${result.deleted} accounts`);
    if (result.failed > 0) {
      toast.error(`Failed to delete ${result.failed} accounts`);
    }
  }
});

const handleBulkDelete = (selectedIds) => {
  batchDelete.mutate(selectedIds);
};
```

---

## Response Formats

### Success Response
```typescript
{
  success: true,
  message: "Operation completed successfully",
  data: { /* operation-specific data */ }
}
```

### Error Response
```typescript
{
  code: "BAD_REQUEST" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "INTERNAL_SERVER_ERROR",
  message: "Detailed error message",
  cause: { /* error details */ }
}
```

### Bulk Operation Response
```typescript
{
  imported: 5,
  skipped: 2,
  failed: 1,
  errors: [
    "Row 3: Email already exists",
    "Row 7: Invalid phone number"
  ]
}
```

---

## Performance Tips

1. **Use pagination** for large datasets:
   ```typescript
   const accounts = await trpc.chartOfAccounts.list.query({
     limit: 50,
     offset: 0
   });
   ```

2. **Batch operations** instead of individual calls:
   ```typescript
   // Good: Single batch call
   await trpc.email.batchSendInvoices.mutate(invoiceIds);
   
   // Avoid: Multiple individual calls
   for (const id of invoiceIds) {
     await trpc.email.sendInvoice.mutate(id);
   }
   ```

3. **Use query invalidation** carefully:
   ```typescript
   utils.chartOfAccounts.list.invalidate(); // Invalidate all
   utils.chartOfAccounts.getById.invalidate(accountId); // Invalidate specific
   ```

4. **Cache reports** for frequently accessed data:
   ```typescript
   const { data } = trpc.reports.balanceSheet.useQuery(undefined, {
     staleTime: 1000 * 60 * 5 // 5 minutes
   });
   ```

---

Generated: 2025-01-28
