# Procurement Auto-Numbering System

## Overview

The procurement and business document auto-numbering system provides consistent, sequential document numbering across all modules. Each document type has a unique prefix and 6-digit (or 4-digit for suppliers) sequential number.

## Document Types & Numbering Format

| Document Type | Prefix | Format | Router | Field |
|---|---|---|---|---|
| LPO (Local Purchase Order) | LPO | LPO-000001 | `server/routers/lpo.ts` | `lpoNumber` |
| Purchase Order | PO | PO-000001 | `server/routers/approvals.ts` | `orderNumber` |
| Imprest | IMP | IMP-000001 | `server/routers/imprest.ts` | `imprestNumber` |
| Imprest Surrender | IMPS | IMPS-000001 | `server/routers/imprestSurrender.ts` | `surrenderNumber` |
| Receipt | REC | REC-000001 | `server/routers/receipts.ts` | `receiptNumber` |
| Invoice | INV | INV-000001 | `server/routers/invoices.ts` | `invoiceNumber` |
| Estimate | EST | EST-000001 | `server/routers/estimates.ts` | `estimateNumber` |
| Payment | PAY | PAY-000001 | `server/routers/payments.ts` | `referenceNumber` |
| Expense | EXP | EXP-000001 | `server/routers/expenses.ts` | `expenseNumber` |
| Supplier | SUP | SUP-0001 | `server/routers/suppliers.ts` | `supplierNumber` |

## Implementation Pattern

### 1. Generate Number in Router

Each router implements its own `generateNext[DocType]Number()` function:

```typescript
async function generateNextLPONumber(db: any): Promise<string> {
  try {
    const result = await db.select({ num: lpos.lpoNumber })
      .from(lpos)
      .orderBy(desc(lpos.createdAt))
      .limit(1);
    
    let seq = 0;
    if (result && result.length > 0 && result[0].num) {
      const match = result[0].num.match(/(\d+)$/);
      if (match) seq = parseInt(match[1]);
    }
    seq++;
    return `LPO-${String(seq).padStart(6, '0')}`;
  } catch (err) {
    console.warn("number generator error", err);
    return `LPO-000001`;
  }
}
```

### 2. Use in Create Mutation

```typescript
create: protectedProcedure
  .input(z.object({
    vendorId: z.string(),
    amount: z.number().positive(),
    // ... other fields
  }))
  .mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("DB not available");
    
    const id = uuidv4();
    const lpoNumber = await generateNextLPONumber(db);  // ← Generate number
    
    await db.insert(lpos).values({
      id,
      lpoNumber,  // ← Assign to document
      vendorId: input.vendorId,
      amount: input.amount,
      status: 'draft',
      createdBy: ctx.user.id,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });
    
    return { id };
  }),
```

### 3. Query Next Number

Expose a procedure to get the next number without creating the document:

```typescript
getNextNumber: protectedProcedure
  .query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const nextNumber = await generateNextLPONumber(db);
    return { lpoNumber: nextNumber };  // Return to frontend for preview
  }),
```

## Centralized Utility (Optional)

A centralized numbering utility exists at `server/utils/documentNumbering.ts` for standardized implementations:

```typescript
import { 
  getNextDocumentNumber, 
  getNextDocumentNumbers,
  isValidDocumentNumber,
  getDocumentTypeFromNumber,
  extractSequenceNumber 
} from "../utils/documentNumbering";

// Generate single number
const number = await getNextDocumentNumber("lpo");  // "LPO-000001"

// Generate batch
const numbers = await getNextDocumentNumbers("invoice", 10);  // ["INV-000001", ...]

// Validate format
const valid = isValidDocumentNumber("lpo", "LPO-000001");  // true

// Extract document type
const type = getDocumentTypeFromNumber("LPO-000001");  // "lpo"

// Extract sequence
const seq = extractSequenceNumber("LPO-000042");  // 42
```

## Current Implementation Status

✅ **Implemented with auto-numbering:**
- LPO (Local Purchase Order) - `server/routers/lpo.ts`
- Imprest - `server/routers/imprest.ts`
- Imprest Surrender - `server/routers/imprestSurrender.ts`
- Receipt - `server/routers/receipts.ts`
- Invoice - `server/routers/invoices.ts`
- Estimate - `server/routers/estimates.ts`
- Payment - `server/routers/payments.ts`
- Expense - `server/routers/expenses.ts`
- Supplier - `server/routers/suppliers.ts`

⚠️ **Pending auto-numbering:**
- Purchase Order (PO) - Uses raw database queries in `server/routers/approvals.ts`

## Frontend Integration

### Getting Next Number for Preview

```typescript
import { trpc } from "@/utils/trpc";

export function CreateLPOForm() {
  const { data: nextNumber } = trpc.lpo.getNextLPONumber.useQuery();
  
  return (
    <form>
      <input 
        type="text" 
        value={nextNumber?.lpoNumber || ""} 
        disabled 
      />
      {/* Form fields */}
    </form>
  );
}
```

### Creating Document with Number

```typescript
const createMutation = trpc.lpo.create.useMutation({
  onSuccess: (data) => {
    toast.success("LPO created successfully!");
    // Number is auto-assigned in backend
    navigate(`/lpo/${data.id}`);
  },
});

const handleCreate = (formData) => {
  createMutation.mutate({
    vendorId: formData.vendorId,
    amount: formData.amount,
    // Don't include lpoNumber - it's auto-generated
  });
};
```

## Database Schema Requirements

Each document table must have a number field:

```sql
-- LPO Table
ALTER TABLE lpos ADD COLUMN lpoNumber VARCHAR(20) UNIQUE NOT NULL;

-- Imprest Table
ALTER TABLE imprests ADD COLUMN imprestNumber VARCHAR(20) UNIQUE NOT NULL;

-- Imprest Surrender Table
ALTER TABLE imprest_surrenders ADD COLUMN surrenderNumber VARCHAR(20) UNIQUE NOT NULL;

-- Receipt Table
ALTER TABLE receipts ADD COLUMN receiptNumber VARCHAR(20) UNIQUE NOT NULL;

-- Invoice Table
ALTER TABLE invoices ADD COLUMN invoiceNumber VARCHAR(20) UNIQUE NOT NULL;

-- Estimate Table
ALTER TABLE estimates ADD COLUMN estimateNumber VARCHAR(20) UNIQUE NOT NULL;

-- Payment Table
ALTER TABLE payments ADD COLUMN referenceNumber VARCHAR(20) UNIQUE NOT NULL;

-- Expense Table
ALTER TABLE expenses ADD COLUMN expenseNumber VARCHAR(20) UNIQUE NOT NULL;

-- Supplier Table
ALTER TABLE suppliers ADD COLUMN supplierNumber VARCHAR(20) UNIQUE NOT NULL;
```

## Best Practices

### 1. Always Add Unique Constraint
```typescript
// In schema definition
export const lpos = sqliteTable("lpos", {
  // ... other columns
  lpoNumber: text("lpoNumber").unique().notNull(),
});
```

### 2. Handle Errors Gracefully
```typescript
async function generateNextLPONumber(db: any): Promise<string> {
  try {
    // ... numbering logic
  } catch (err) {
    console.warn("Error generating LPO number", err);
    // Fallback to timestamp-based number
    return `LPO-${Date.now().toString().slice(-6)}`;
  }
}
```

### 3. Include DateTime Fields
Always set `createdAt` and `updatedAt` in ISO format:
```typescript
createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
```

### 4. Expose Number to Frontend
Create a `getNext[DocType]Number` query procedure:
```typescript
getNextNumber: protectedProcedure
  .query(async () => {
    const db = await getDb();
    const number = await generateNextNumber(db);
    return { documentNumber: number };
  }),
```

### 5. Log Number Generation
Track number generation for audit purposes:
```typescript
console.log(`Generated ${docType} number: ${number}`);
activityLog.push({
  type: "document_number_generated",
  docType,
  number,
  timestamp: new Date(),
});
```

## Testing Auto-Numbering

### 1. Test Sequential Generation
```typescript
// Create 5 documents, verify numbers go 000001 -> 000005
for (let i = 0; i < 5; i++) {
  const { id } = await trpc.lpo.create.mutate({
    vendorId: "vendor-123",
    amount: 5000,
  });
}
// Query all LPOs, check numbers are sequential
```

### 2. Test Error Handling
```typescript
// Simulate DB failure, verify fallback number is generated
// Verify duplicate numbers are prevented by UNIQUE constraint
```

### 3. Test Concurrent Creation
```typescript
// Simulate 10 simultaneous document creations
// Verify all get unique numbers (potential race condition testing)
```

## Troubleshooting

### Problem: Numbers not incrementing

**Cause:** Function selecting wrong field or wrong ordering
**Solution:** Verify:
1. Table has the correct number field
2. Using `orderBy(desc(...))` to get last entry
3. Regex pattern matches document prefix correctly

### Problem: Duplicate numbers

**Cause:** Missing UNIQUE constraint
**Solution:** Add to schema:
```typescript
lpoNumber: text("lpoNumber").unique().notNull(),
```

### Problem: Fallback numbers generated repeatedly

**Cause:** Database connection issue
**Solution:** Check:
1. Database is initialized
2. User has SELECT permission
3. Connection pool not exhausted

## Future Enhancements

### 1. Year-Based Numbering
```typescript
// Example: INV-2024-000001
const year = new Date().getFullYear();
const number = `INV-${year}-${String(seq).padStart(6, '0')}`;
```

### 2. Organization-Scoped Numbering
```typescript
// Each organization has its own numbering sequence
const number = `LPO-${orgId}-${String(seq).padStart(6, '0')}`;
```

### 3. Custom Prefixes
```typescript
// Allow configurable prefixes per organization
const prefix = settings.lpoPrefix || "LPO";
const number = `${prefix}-${String(seq).padStart(6, '0')}`;
```

### 4. Number Format Validation
```typescript
// Validate incoming numbers match expected format
const pattern = /^[A-Z]+-\d+$/;
if (!pattern.test(number)) {
  throw new Error("Invalid document number format");
}
```
