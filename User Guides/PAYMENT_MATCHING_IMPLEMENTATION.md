# Payment Recording & Document Matching Implementation Guide

## Overview
This document outlines the automatic payment recording system with intelligent document matching for invoices, estimates, and receipts in the Melitech CRM application.

---

## Features Implemented

### 1. **Automatic Payment Recording**
When a payment is recorded, the system automatically:
- ✅ Updates invoice paid amount
- ✅ Updates invoice status (draft → sent → partial → paid)
- ✅ Matches related estimates and marks them as completed
- ✅ Automatically creates receipts for paid invoices
- ✅ Logs all activities for audit trail

### 2. **Document Status Management**

#### Invoice Status Flow
```
draft → sent → partial → paid
                ↓
              overdue
                ↓
              cancelled
```

**Status Transitions on Payment:**
- **No payment**: `draft` or `sent`
- **Partial payment**: `partial` (when 0 < paid < total)
- **Full payment**: `paid` (when paid >= total)
- **Payment reversal**: Reverts to appropriate status

#### Estimate Status Flow
```
draft → sent → accepted → completed
                ↓
              rejected
                ↓
              expired
```

**Status Transitions on Payment:**
- **On full invoice payment**: `accepted` → `completed`
- Automatically matches estimates with same client and amount

#### Receipt Status
- **Auto-created** when invoice is fully paid
- **Linked** to payment record
- **Contains** payment details and reference

### 3. **Automatic Document Matching**

#### Matching Criteria
1. **Same Client**: Payment must be for same client
2. **Amount Match**: Estimate total should match invoice total
3. **Status Check**: Estimate must be in `accepted` status
4. **Relationship**: Automatic linking based on client and amounts

#### Matching Process
```
Payment Recorded
    ↓
Update Invoice Status
    ↓
Auto-Match Estimates (if full payment)
    ↓
Create Receipt (if full payment)
    ↓
Log All Activities
```

---

## API Endpoints

### 1. **Create Payment (Basic)**
```typescript
POST /api/trpc/payments.create

Input:
{
  invoiceId: string;
  clientId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: "cash" | "bank_transfer" | "cheque" | "mpesa" | "card" | "other";
  referenceNumber?: string;
  notes?: string;
  estimateId?: string;
  receiptId?: string;
}

Response:
{
  id: string;
  invoiceStatus: string;
  message: string;
}
```

### 2. **Record Payment (Advanced with Auto-Matching)**
```typescript
POST /api/trpc/payments.recordPayment

Input:
{
  invoiceId: string;
  clientId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: "cash" | "bank_transfer" | "cheque" | "mpesa" | "card" | "other";
  referenceNumber?: string;
  notes?: string;
  autoMatch?: boolean; // Default: true
}

Response:
{
  paymentId: string;
  isPaid: boolean;
  invoiceStatus: "draft" | "sent" | "paid" | "partial" | "overdue" | "cancelled";
  matchedDocuments: {
    invoice: {
      id: string;
      number: string;
      status: string;
      paidAmount: number;
      total: number;
    };
    estimates: Array<{
      id: string;
      number: string;
      status: string;
    }>;
    receipts: Array<{
      id: string;
      number: string;
      status: string;
    }>;
  };
  message: string;
}
```

### 3. **Get Invoice Payment Summary**
```typescript
GET /api/trpc/payments.getInvoicePaymentSummary?input="invoice_id"

Response:
{
  invoiceId: string;
  invoiceNumber: string;
  invoiceTotal: number;
  paidAmount: number;
  outstandingAmount: number;
  status: string;
  paymentCount: number;
  payments: Array<{
    id: string;
    amount: number;
    date: string;
    method: string;
    reference?: string;
  }>;
  isPaid: boolean;
}
```

### 4. **Get Client Payment Summary**
```typescript
GET /api/trpc/payments.getClientPaymentSummary?input="client_id"

Response:
{
  totalAmount: number;
  totalPaid: number;
  totalOutstanding: number;
  paymentCount: number;
  invoiceCount: number;
  paidInvoices: number;
  partialInvoices: number;
  unpaidInvoices: number;
}
```

---

## Frontend Implementation Examples

### 1. **Record Payment with Auto-Matching**
```typescript
import { trpc } from "@/lib/trpc";

export function PaymentForm({ invoiceId, clientId, invoiceTotal }) {
  const recordPaymentMutation = trpc.payments.recordPayment.useMutation({
    onSuccess: (data) => {
      if (data.isPaid) {
        toast.success("Payment recorded successfully! Invoice marked as PAID.");
        
        // Show matched documents
        console.log("Matched Estimates:", data.matchedDocuments.estimates);
        console.log("Created Receipts:", data.matchedDocuments.receipts);
        
        // Refresh invoice details
        queryClient.invalidateQueries({ queryKey: ["invoices.getWithItems"] });
        queryClient.invalidateQueries({ queryKey: ["payments.getInvoicePaymentSummary"] });
      } else {
        toast.success("Payment recorded. Invoice marked as PARTIAL.");
      }
    },
  });

  const handleRecordPayment = (formData) => {
    recordPaymentMutation.mutate({
      invoiceId,
      clientId,
      amount: formData.amount,
      paymentDate: new Date(formData.paymentDate),
      paymentMethod: formData.paymentMethod,
      referenceNumber: formData.referenceNumber,
      notes: formData.notes,
      autoMatch: true, // Enable automatic matching
    });
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleRecordPayment({
        amount: parseFloat(formData.get("amount")),
        paymentDate: formData.get("paymentDate"),
        paymentMethod: formData.get("paymentMethod"),
        referenceNumber: formData.get("referenceNumber"),
        notes: formData.get("notes"),
      });
    }}>
      <Input name="amount" type="number" placeholder="Payment Amount" required />
      <Input name="paymentDate" type="date" required />
      <Select name="paymentMethod" required>
        <option value="cash">Cash</option>
        <option value="bank_transfer">Bank Transfer</option>
        <option value="cheque">Cheque</option>
        <option value="mpesa">M-Pesa</option>
        <option value="card">Card</option>
        <option value="other">Other</option>
      </Select>
      <Input name="referenceNumber" placeholder="Reference Number (Optional)" />
      <Textarea name="notes" placeholder="Notes (Optional)" />
      <Button type="submit" disabled={recordPaymentMutation.isPending}>
        {recordPaymentMutation.isPending ? "Recording..." : "Record Payment"}
      </Button>
    </form>
  );
}
```

### 2. **Display Payment Summary**
```typescript
import { trpc } from "@/lib/trpc";

export function InvoicePaymentSummary({ invoiceId }) {
  const { data: summary } = trpc.payments.getInvoicePaymentSummary.useQuery(invoiceId);

  if (!summary) return <div>Loading...</div>;

  const progressPercent = (summary.paidAmount / summary.invoiceTotal) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between mb-2">
              <span>Payment Progress</span>
              <span className="font-semibold">{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  summary.isPaid ? "bg-green-500" : "bg-blue-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Amount Details */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Invoice Total</p>
              <p className="text-lg font-semibold">${summary.invoiceTotal / 100}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Paid Amount</p>
              <p className="text-lg font-semibold text-green-600">
                ${summary.paidAmount / 100}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Outstanding</p>
              <p className={`text-lg font-semibold ${
                summary.outstandingAmount > 0 ? "text-red-600" : "text-green-600"
              }`}>
                ${summary.outstandingAmount / 100}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div>
            <Badge variant={summary.isPaid ? "default" : "secondary"}>
              {summary.status.toUpperCase()}
            </Badge>
          </div>

          {/* Payment History */}
          {summary.paymentCount > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Payment History</h4>
              <div className="space-y-2">
                {summary.payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between text-sm">
                    <span>
                      {new Date(payment.date).toLocaleDateString()} - {payment.method}
                      {payment.reference && ` (${payment.reference})`}
                    </span>
                    <span className="font-semibold">${payment.amount / 100}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3. **Client Payment Dashboard**
```typescript
import { trpc } from "@/lib/trpc";

export function ClientPaymentDashboard({ clientId }) {
  const { data: summary } = trpc.payments.getClientPaymentSummary.useQuery(clientId);

  if (!summary) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">${summary.totalAmount / 100}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">${summary.totalPaid / 100}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">${summary.totalOutstanding / 100}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summary.paidInvoices}/{summary.invoiceCount}</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Database Schema Considerations

### Current Tables
- `payments` - Payment records
- `invoices` - Invoice documents with `paidAmount` and `status`
- `estimates` - Estimate documents with `status`
- `receipts` - Receipt documents with `paymentId` link

### Recommended Schema Additions (Optional)
```sql
-- Add completion date to estimates
ALTER TABLE estimates ADD COLUMN completedDate DATETIME AFTER status;

-- Add payment tracking to estimates
ALTER TABLE estimates ADD COLUMN paidAmount INT DEFAULT 0 AFTER total;

-- Add index for faster queries
CREATE INDEX idx_payment_invoice_date ON payments(invoiceId, paymentDate);
CREATE INDEX idx_invoice_status_date ON invoices(status, issueDate);
CREATE INDEX idx_estimate_status_client ON estimates(status, clientId);
```

---

## Workflow Examples

### Scenario 1: Full Payment Recording
```
1. User records payment of $1000 for Invoice INV-001
2. System creates payment record
3. Invoice status: sent → paid
4. System finds matching estimate EST-001 (same client, $1000)
5. Estimate status: accepted → completed
6. System auto-creates receipt RCP-20241222-001
7. All activities logged to audit trail
8. User sees: "Payment recorded. Invoice marked as PAID. 1 estimate completed. Receipt created."
```

### Scenario 2: Partial Payment Recording
```
1. User records payment of $500 for Invoice INV-002 (total $1000)
2. System creates payment record
3. Invoice status: sent → partial
4. System does NOT auto-match estimates (payment incomplete)
5. No receipt created (payment incomplete)
6. Activities logged
7. User sees: "Payment recorded. Invoice marked as PARTIAL."
```

### Scenario 3: Multiple Payments
```
1. First payment: $600 for Invoice INV-003 (total $1000)
   - Status: sent → partial
2. Second payment: $400 for Invoice INV-003
   - Status: partial → paid
   - Auto-match estimates
   - Create receipt
3. User sees complete payment history and matched documents
```

---

## Activity Logging

All payment and document matching activities are automatically logged:

```typescript
// Examples of logged activities:
{
  action: "payment_created",
  description: "Created payment of $1000 for invoice INV-001. Invoice status updated to paid"
}

{
  action: "estimate_auto_matched",
  description: "Estimate EST-001 auto-matched and marked as completed"
}

{
  action: "receipt_auto_created",
  description: "Receipt automatically created for payment PAY-001"
}

{
  action: "payment_updated",
  description: "Updated payment. Invoice status updated to partial"
}

{
  action: "payment_deleted",
  description: "Deleted payment. Invoice status updated to sent"
}
```

---

## Testing Checklist

### Payment Recording
- [ ] Record full payment for invoice
- [ ] Verify invoice status changes to "paid"
- [ ] Record partial payment for invoice
- [ ] Verify invoice status changes to "partial"
- [ ] Record multiple payments for same invoice
- [ ] Verify total paid amount is correct

### Document Matching
- [ ] Record full payment with auto-match enabled
- [ ] Verify matching estimates are marked as "completed"
- [ ] Verify receipt is auto-created
- [ ] Verify all documents are linked correctly
- [ ] Verify activity log contains all actions

### Payment Updates
- [ ] Update payment amount
- [ ] Verify invoice status recalculates correctly
- [ ] Delete payment
- [ ] Verify invoice status reverts appropriately

### Payment Summaries
- [ ] Get invoice payment summary
- [ ] Verify all amounts and counts are correct
- [ ] Get client payment summary
- [ ] Verify aggregated totals are accurate

### Edge Cases
- [ ] Overpayment (payment > invoice total)
- [ ] Zero amount payment
- [ ] Payment with invalid invoice
- [ ] Payment with no matching estimates
- [ ] Concurrent payment updates

---

## Performance Considerations

### Query Optimization
- Indexes on `invoiceId`, `clientId`, `paymentDate`
- Indexes on `status` fields for filtering
- Batch operations for multiple document updates

### Caching Strategy
- Cache invoice payment summaries
- Cache client payment summaries
- Invalidate cache on payment changes

### Scalability
- Use database transactions for payment recording
- Implement rate limiting on payment endpoints
- Archive old payment records periodically

---

## Security Considerations

### Access Control
- Only authorized users can record payments
- Users can only see payments for their clients
- Audit trail tracks all payment modifications

### Data Validation
- Validate payment amounts (positive, non-zero)
- Validate invoice exists and belongs to client
- Validate payment method is allowed

### Fraud Prevention
- Duplicate payment detection
- Overpayment warnings
- Audit trail for all changes

---

## Future Enhancements

1. **Partial Estimate Payments**: Allow payments to estimates directly
2. **Payment Plans**: Support installment-based payments
3. **Automatic Reminders**: Send payment reminders before due dates
4. **Payment Reconciliation**: Match bank transactions to payments
5. **Multi-Currency**: Support payments in different currencies
6. **Payment Disputes**: Track and resolve payment disputes
7. **Refunds**: Process refunds and credit notes
8. **Payment Analytics**: Detailed payment reports and trends

---

## References

- Payment Router: `/server/routers/payments.ts`
- Invoice Schema: `/drizzle/schema.ts` (invoices table)
- Estimate Schema: `/drizzle/schema.ts` (estimates table)
- Receipt Schema: `/drizzle/schema.ts` (receipts table)
- Activity Logging: `/server/db.ts` (logActivity function)

---

**Document Generated:** December 22, 2025
**Status:** Ready for Implementation and Testing
