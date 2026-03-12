# Payment Recording & Document Matching - Testing & Deployment Guide

## Quick Start

### For Developers
1. Review `/server/routers/payments.ts` - Enhanced payment router
2. Review `/PAYMENT_MATCHING_IMPLEMENTATION.md` - Complete implementation guide
3. Test using provided test cases below
4. Deploy following deployment checklist

### For Users
1. Go to Invoice Details page
2. Click "Record Payment" button
3. Enter payment amount, date, and method
4. Click "Record Payment"
5. System automatically updates invoice status and creates receipt

---

## Testing Guide

### Unit Tests

#### Test 1: Record Full Payment
**Objective**: Verify invoice status changes to "paid" when full payment is recorded

```typescript
describe("Payment Recording - Full Payment", () => {
  it("should mark invoice as paid when full payment is recorded", async () => {
    // Setup
    const invoice = {
      id: "inv-001",
      invoiceNumber: "INV-001",
      total: 10000,
      paidAmount: 0,
      status: "sent",
    };

    // Execute
    const result = await trpc.payments.recordPayment.mutate({
      invoiceId: "inv-001",
      clientId: "client-001",
      amount: 10000,
      paymentDate: new Date(),
      paymentMethod: "bank_transfer",
      autoMatch: true,
    });

    // Assert
    expect(result.isPaid).toBe(true);
    expect(result.invoiceStatus).toBe("paid");
    expect(result.matchedDocuments.receipts.length).toBeGreaterThan(0);
  });
});
```

#### Test 2: Record Partial Payment
**Objective**: Verify invoice status changes to "partial" for partial payments

```typescript
describe("Payment Recording - Partial Payment", () => {
  it("should mark invoice as partial when partial payment is recorded", async () => {
    // Setup
    const invoice = {
      id: "inv-002",
      invoiceNumber: "INV-002",
      total: 10000,
      paidAmount: 0,
      status: "sent",
    };

    // Execute
    const result = await trpc.payments.recordPayment.mutate({
      invoiceId: "inv-002",
      clientId: "client-001",
      amount: 5000,
      paymentDate: new Date(),
      paymentMethod: "cash",
      autoMatch: true,
    });

    // Assert
    expect(result.isPaid).toBe(false);
    expect(result.invoiceStatus).toBe("partial");
    expect(result.matchedDocuments.receipts.length).toBe(0);
  });
});
```

#### Test 3: Auto-Match Estimates
**Objective**: Verify estimates are auto-matched and marked as completed

```typescript
describe("Document Matching - Estimates", () => {
  it("should auto-match and complete estimates on full payment", async () => {
    // Setup
    const estimate = {
      id: "est-001",
      estimateNumber: "EST-001",
      clientId: "client-001",
      total: 10000,
      status: "accepted",
    };

    // Execute
    const result = await trpc.payments.recordPayment.mutate({
      invoiceId: "inv-001",
      clientId: "client-001",
      amount: 10000,
      paymentDate: new Date(),
      paymentMethod: "bank_transfer",
      autoMatch: true,
    });

    // Assert
    expect(result.matchedDocuments.estimates.length).toBeGreaterThan(0);
    expect(result.matchedDocuments.estimates[0].status).toBe("completed");
  });
});
```

#### Test 4: Auto-Create Receipt
**Objective**: Verify receipt is auto-created on full payment

```typescript
describe("Document Matching - Receipts", () => {
  it("should auto-create receipt on full payment", async () => {
    // Execute
    const result = await trpc.payments.recordPayment.mutate({
      invoiceId: "inv-001",
      clientId: "client-001",
      amount: 10000,
      paymentDate: new Date(),
      paymentMethod: "bank_transfer",
      autoMatch: true,
    });

    // Assert
    expect(result.matchedDocuments.receipts.length).toBe(1);
    expect(result.matchedDocuments.receipts[0].status).toBe("created");
  });
});
```

#### Test 5: Multiple Payments
**Objective**: Verify multiple payments accumulate correctly

```typescript
describe("Payment Recording - Multiple Payments", () => {
  it("should accumulate multiple payments correctly", async () => {
    // First payment
    const result1 = await trpc.payments.recordPayment.mutate({
      invoiceId: "inv-003",
      clientId: "client-001",
      amount: 6000,
      paymentDate: new Date("2024-12-01"),
      paymentMethod: "cash",
      autoMatch: false,
    });

    expect(result1.invoiceStatus).toBe("partial");

    // Second payment
    const result2 = await trpc.payments.recordPayment.mutate({
      invoiceId: "inv-003",
      clientId: "client-001",
      amount: 4000,
      paymentDate: new Date("2024-12-15"),
      paymentMethod: "bank_transfer",
      autoMatch: true,
    });

    expect(result2.invoiceStatus).toBe("paid");
    expect(result2.isPaid).toBe(true);
  });
});
```

#### Test 6: Payment Summary
**Objective**: Verify payment summary calculations are accurate

```typescript
describe("Payment Summary", () => {
  it("should calculate invoice payment summary correctly", async () => {
    // Execute
    const summary = await trpc.payments.getInvoicePaymentSummary.query("inv-001");

    // Assert
    expect(summary.invoiceTotal).toBe(10000);
    expect(summary.paidAmount).toBe(10000);
    expect(summary.outstandingAmount).toBe(0);
    expect(summary.isPaid).toBe(true);
    expect(summary.paymentCount).toBeGreaterThan(0);
  });
});
```

---

## Manual Testing Scenarios

### Scenario 1: Complete Invoice Payment Flow

**Steps:**
1. Create invoice INV-TEST-001 for $1,000
2. Send invoice to client
3. Record payment of $1,000
4. Verify invoice status is "paid"
5. Verify receipt is created
6. Check activity log

**Expected Results:**
- ✓ Invoice status: sent → paid
- ✓ Receipt created automatically
- ✓ Payment summary shows 100% paid
- ✓ Activity log shows all actions

**Test Data:**
```json
{
  "invoiceId": "inv-test-001",
  "clientId": "client-test-001",
  "amount": 100000,
  "paymentDate": "2024-12-22",
  "paymentMethod": "bank_transfer",
  "referenceNumber": "BANK-12345",
  "notes": "Payment for INV-TEST-001"
}
```

---

### Scenario 2: Partial Payment with Second Payment

**Steps:**
1. Create invoice INV-TEST-002 for $2,000
2. Record payment of $1,200
3. Verify invoice status is "partial"
4. Record second payment of $800
5. Verify invoice status is "paid"
6. Verify receipt is created

**Expected Results:**
- ✓ First payment: status → partial (60% paid)
- ✓ Second payment: status → paid (100% paid)
- ✓ Receipt created after second payment
- ✓ Payment history shows both payments

**Test Data:**
```json
{
  "payment1": {
    "invoiceId": "inv-test-002",
    "clientId": "client-test-001",
    "amount": 120000,
    "paymentDate": "2024-12-15",
    "paymentMethod": "cash"
  },
  "payment2": {
    "invoiceId": "inv-test-002",
    "clientId": "client-test-001",
    "amount": 80000,
    "paymentDate": "2024-12-22",
    "paymentMethod": "bank_transfer"
  }
}
```

---

### Scenario 3: Auto-Match Estimates

**Steps:**
1. Create estimate EST-TEST-001 for $3,000 (accepted status)
2. Convert to invoice INV-TEST-003 for $3,000
3. Record full payment of $3,000
4. Verify estimate status is "completed"
5. Verify receipt is created

**Expected Results:**
- ✓ Invoice status: sent → paid
- ✓ Estimate status: accepted → completed
- ✓ Receipt created automatically
- ✓ Matched documents show in payment response

**Test Data:**
```json
{
  "estimate": {
    "estimateNumber": "EST-TEST-001",
    "clientId": "client-test-001",
    "total": 300000,
    "status": "accepted"
  },
  "invoice": {
    "invoiceNumber": "INV-TEST-003",
    "clientId": "client-test-001",
    "total": 300000,
    "status": "sent"
  },
  "payment": {
    "invoiceId": "inv-test-003",
    "clientId": "client-test-001",
    "amount": 300000,
    "paymentDate": "2024-12-22",
    "paymentMethod": "bank_transfer"
  }
}
```

---

### Scenario 4: Client Payment Dashboard

**Steps:**
1. Create 3 invoices for same client (total $5,000)
2. Record payment for invoice 1 ($2,000) - partial
3. Record payment for invoice 2 ($2,000) - paid
4. Leave invoice 3 unpaid ($1,000)
5. View client payment dashboard

**Expected Results:**
- ✓ Total Amount: $5,000
- ✓ Total Paid: $4,000
- ✓ Outstanding: $1,000
- ✓ Paid Invoices: 1
- ✓ Partial Invoices: 1
- ✓ Unpaid Invoices: 1

---

### Scenario 5: Payment Deletion and Status Revert

**Steps:**
1. Create invoice INV-TEST-004 for $1,500
2. Record payment of $1,500 (status → paid)
3. Delete the payment
4. Verify invoice status reverts to "sent"
5. Verify receipt is deleted or unlinked

**Expected Results:**
- ✓ Payment deleted successfully
- ✓ Invoice status: paid → sent
- ✓ Paid amount: 0
- ✓ Activity log shows deletion

---

## Browser Testing

### Chrome/Edge
- [ ] Record payment
- [ ] View payment summary
- [ ] Check auto-matched documents
- [ ] Verify receipt creation
- [ ] Test on mobile viewport

### Firefox
- [ ] Record payment
- [ ] View payment summary
- [ ] Check auto-matched documents
- [ ] Verify receipt creation

### Safari
- [ ] Record payment
- [ ] View payment summary
- [ ] Check auto-matched documents
- [ ] Verify receipt creation

---

## Performance Testing

### Load Test: Record 100 Payments
```bash
# Expected: Complete in < 5 seconds
# Memory usage: < 100MB
# Database connections: < 10
```

### Query Performance
```sql
-- Payment lookup should be < 100ms
SELECT * FROM payments WHERE invoiceId = 'inv-001';

-- Invoice summary should be < 200ms
SELECT SUM(amount) FROM payments WHERE invoiceId = 'inv-001';

-- Client summary should be < 500ms
SELECT SUM(p.amount) FROM payments p
JOIN invoices i ON p.invoiceId = i.id
WHERE i.clientId = 'client-001';
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Code review completed
- [ ] All tests passing
- [ ] Database backups created
- [ ] Rollback plan documented
- [ ] Deployment window scheduled

### Database Migration
- [ ] No schema changes required (uses existing tables)
- [ ] Verify `payments`, `invoices`, `estimates`, `receipts` tables exist
- [ ] Verify indexes exist on `invoiceId`, `clientId`, `paymentDate`
- [ ] Test on staging database first

### Deployment Steps
1. Backup production database
2. Deploy updated `/server/routers/payments.ts`
3. Deploy frontend components using new endpoints
4. Clear application cache
5. Run smoke tests
6. Monitor error logs

### Post-Deployment
- [ ] Verify payment recording works
- [ ] Verify document matching works
- [ ] Verify receipts are created
- [ ] Verify activity logs are populated
- [ ] Monitor performance metrics
- [ ] Check error logs for issues

### Rollback Plan
If issues occur:
1. Revert to previous version of `payments.ts`
2. Restore database from backup if needed
3. Clear cache
4. Notify users of issue
5. Investigate root cause

---

## Monitoring & Alerts

### Key Metrics to Monitor
- Payment recording success rate
- Average payment processing time
- Document matching success rate
- Receipt creation rate
- Error rate

### Alerts to Set Up
- Payment recording failures > 5% in 1 hour
- Payment processing time > 5 seconds
- Document matching failures > 10% in 1 hour
- Database connection errors
- API response time > 2 seconds

### Logs to Monitor
```
- Payment creation: "payment_created"
- Payment updates: "payment_updated"
- Payment deletion: "payment_deleted"
- Estimate matching: "estimate_auto_matched"
- Receipt creation: "receipt_auto_created"
```

---

## Troubleshooting

### Issue: Payment recorded but invoice status not updated
**Cause**: Database transaction failed
**Solution**: 
1. Check database logs
2. Verify invoice exists
3. Retry payment recording
4. Check for database locks

### Issue: Estimates not auto-matched
**Cause**: Estimates don't match criteria (different client, amount, or status)
**Solution**:
1. Verify estimate belongs to same client
2. Verify estimate total matches invoice total
3. Verify estimate status is "accepted"
4. Check activity logs for matching attempts

### Issue: Receipt not created
**Cause**: Payment is not full payment
**Solution**:
1. Verify payment amount equals invoice total
2. Check if previous payments exist
3. Verify `autoMatch` is enabled
4. Check database for receipt creation errors

### Issue: Duplicate payments recorded
**Cause**: User clicked submit multiple times
**Solution**:
1. Implement button disable on submit
2. Add duplicate detection
3. Show confirmation dialog
4. Check activity logs for duplicates

---

## FAQ

**Q: Can I record payment for partial amount?**
A: Yes. Invoice status will be "partial" until full amount is paid.

**Q: What happens if I record payment more than invoice total?**
A: Payment is recorded, but invoice status will be "paid" (overpayment is allowed).

**Q: Can I delete a payment?**
A: Yes. Deleting a payment will revert invoice status appropriately.

**Q: Are receipts created for partial payments?**
A: No. Receipts are only created when invoice is fully paid.

**Q: Can I match multiple estimates to one invoice?**
A: Yes. All matching estimates (same client, amount) will be auto-matched.

**Q: What if estimate amount doesn't match invoice amount?**
A: Estimate won't be auto-matched. You can manually update or match it.

**Q: Are all activities logged?**
A: Yes. All payment and document matching activities are logged for audit trail.

**Q: Can I disable auto-matching?**
A: Yes. Set `autoMatch: false` when recording payment.

---

## Support & Documentation

For detailed information, refer to:
- `/PAYMENT_MATCHING_IMPLEMENTATION.md` - Complete implementation guide
- `/server/routers/payments.ts` - Payment router source code
- `/FIXES_IMPLEMENTED.md` - Overall fixes and enhancements

---

**Document Generated:** December 22, 2025
**Status:** Ready for Testing and Deployment
