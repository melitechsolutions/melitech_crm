# Tax Rate Implementation Guide - Inclusive vs Exclusive

## Overview
This document outlines the implementation of inclusive and exclusive tax rate options for invoices, estimates, and receipts.

## Database Schema Updates

### 1. Add Tax Type Field to invoiceItems Table
```sql
ALTER TABLE invoiceItems ADD COLUMN taxType ENUM('inclusive', 'exclusive') DEFAULT 'exclusive' AFTER taxRate;
```

### 2. Add Tax Type Field to estimateItems Table
```sql
ALTER TABLE estimateItems ADD COLUMN taxType ENUM('inclusive', 'exclusive') DEFAULT 'exclusive' AFTER taxRate;
```

### 3. Add Tax Type Field to invoices Table
```sql
ALTER TABLE invoices ADD COLUMN taxType ENUM('inclusive', 'exclusive') DEFAULT 'exclusive' AFTER taxAmount;
```

### 4. Add Tax Type Field to estimates Table
```sql
ALTER TABLE estimates ADD COLUMN taxType ENUM('inclusive', 'exclusive') DEFAULT 'exclusive' AFTER taxAmount;
```

## Frontend Implementation

### Tax Calculation Logic

#### Exclusive Tax (Current Implementation)
```
Subtotal = Quantity × Unit Price
Tax Amount = Subtotal × Tax Rate / 100
Total = Subtotal + Tax Amount
```

#### Inclusive Tax (New Implementation)
```
Total = Quantity × Unit Price
Subtotal = Total / (1 + Tax Rate / 100)
Tax Amount = Total - Subtotal
```

### UI Components to Update

1. **DocumentForm.tsx**
   - Add tax type selector (Inclusive/Exclusive)
   - Update calculateLineTotal() function to handle both types
   - Update line item display to show correct calculations

2. **InvoiceDetails.tsx / EstimateDetails.tsx**
   - Display tax type in invoice/estimate header
   - Show correct tax calculations based on type

3. **Invoices.tsx / Estimates.tsx**
   - Add tax type column to list view
   - Add filter by tax type

## Backend Implementation

### Updated Validation Schemas

```typescript
const lineItemSchema = z.object({
  id: z.string().optional(),
  itemType: z.enum(['product', 'service', 'custom']),
  itemId: z.string().optional(),
  description: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  taxRate: z.number().nonnegative().default(0),
  taxType: z.enum(['inclusive', 'exclusive']).default('exclusive'),
  discountPercent: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
});
```

### Calculation Functions

```typescript
function calculateLineItemTotals(
  quantity: number,
  unitPrice: number,
  taxRate: number,
  taxType: 'inclusive' | 'exclusive',
  discountPercent: number = 0
) {
  if (taxType === 'exclusive') {
    const subtotal = quantity * unitPrice;
    const discountAmount = (subtotal * discountPercent) / 100;
    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = (discountedSubtotal * taxRate) / 100;
    const total = discountedSubtotal + taxAmount;
    
    return {
      subtotal: discountedSubtotal,
      taxAmount,
      total,
      discountAmount,
    };
  } else {
    // Inclusive tax
    const total = quantity * unitPrice;
    const discountAmount = (total * discountPercent) / 100;
    const discountedTotal = total - discountAmount;
    const subtotal = discountedTotal / (1 + taxRate / 100);
    const taxAmount = discountedTotal - subtotal;
    
    return {
      subtotal,
      taxAmount,
      total: discountedTotal,
      discountAmount,
    };
  }
}
```

## API Endpoints Updates

### Create Invoice with Tax Type
```typescript
create: protectedProcedure
  .input(z.object({
    // ... existing fields
    taxType: z.enum(['inclusive', 'exclusive']).default('exclusive'),
    lineItems: z.array(lineItemSchema).optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    // Implementation with tax type support
  }),
```

### Update Invoice with Tax Type
```typescript
update: protectedProcedure
  .input(z.object({
    // ... existing fields
    taxType: z.enum(['inclusive', 'exclusive']).optional(),
  }))
  .mutation(async ({ input }) => {
    // Implementation with tax type support
  }),
```

## Testing Checklist

- [ ] Create invoice with exclusive tax
- [ ] Create invoice with inclusive tax
- [ ] Verify tax calculations for exclusive tax
- [ ] Verify tax calculations for inclusive tax
- [ ] Update invoice tax type and verify recalculation
- [ ] Create estimate with both tax types
- [ ] Create receipt with both tax types
- [ ] Export/Print invoice with correct tax display
- [ ] Verify line item tax calculations
- [ ] Test with discount and tax combinations

## Example Scenarios

### Scenario 1: Exclusive Tax
- Unit Price: 100
- Quantity: 1
- Tax Rate: 16%
- Result:
  - Subtotal: 100
  - Tax: 16
  - Total: 116

### Scenario 2: Inclusive Tax
- Unit Price: 116 (includes tax)
- Quantity: 1
- Tax Rate: 16%
- Result:
  - Subtotal: 100
  - Tax: 16
  - Total: 116

## Migration Notes

- Default all existing invoices/estimates to 'exclusive' tax type
- Provide UI option to bulk update tax type for existing documents
- Add validation to prevent mixing tax types in single document
