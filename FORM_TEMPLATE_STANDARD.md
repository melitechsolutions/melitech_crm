# Form Document Template Guide - Procurement & Approvals

## Overview

This guide defines the standard document template structure for data entry forms in the Melitech CRM system, specifically designed for LPOs (Local Purchase Orders), Imprests, Purchase Orders, and approval workflows. This template ensures consistency in layout, approver/raiser fields, line item formatting, and professional presentation.

## Key Design Principles

### 1. **Approver & Raiser Consistency**
All procurement forms must follow this standardized workflow:

```
┌─────────────────────────────────────────────────────────────┐
│  FORM HEADER & IDENTIFICATION                               │
│  - Document Number (Auto-generated)                         │
│  - Document Type (LPO, Imprest, PO)                        │
│  - Status (Draft/Pending/Approved/Rejected)                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────┬─────────────────────────┐
│  RAISER INFORMATION     │  APPROVER INFORMATION   │
├─────────────────────────┼─────────────────────────┤
│ • Name (Auto-filled)    │ • Name                  │
│ • Department            │ • Title/Role            │
│ • Date Submitted        │ • Department            │
│ • Signature/Approval    │ • Signature/Approval    │
└─────────────────────────┴─────────────────────────┘
```

### 2. **Standard Field Structure**

#### Header Section (Required for All Forms)
```typescript
interface FormHeader {
  documentNumber: string;           // Auto-generated, e.g., LPO-2026001
  documentType: 'lpo' | 'imprest' | 'purchase-order';
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  dateCreated: Date;
  dateSubmitted?: Date;
  dueDate: Date;
  raiserId: string;                 // User who created the form
  approverId?: string;              // Assigned approver
}
```

#### Raiser Section (Always Left Column)
```typescript
interface RaiserInfo {
  name: string;                  // Auto-filled from user profile
  email: string;                 // Auto-filled
  department: string;            // Auto-filled from user profile
  employeeId: string;           // User's staff ID
  submissionDate: Date;         // Timestamp of submission
  signature?: string;           // Digital/manual signature
  notes?: string;               // Raiser's notes/justification
}
```

#### Approver Section (Always Right Column)
```typescript
interface ApproverInfo {
  name: string;                 // Selected from dropdown; cannot be self
  title: string;                // Auto-filled (Manager, Finance Manager, etc.)
  department: string;           // Auto-filled
  approvalDate?: Date;          // Timestamp of approval
  signature?: string;           // Digital/manual signature
  approvalNotes?: string;       // Approver's comments
  approvalStatus: 'pending' | 'approved' | 'rejected';
}
```

### 3. **Line Item Standard Format**

All procurement forms use this consistent table structure:

```html
<table className="items-table">
  <thead>
    <tr>
      <th>Item #</th>        <!-- 001, 002, 003... -->
      <th>Item Name *</th>              <!-- Required -->
      <th>Description</th>              <!-- Optional details -->
      <th>Quantity *</th>               <!-- Required, >0 -->
      <th>Unit Price *</th>             <!-- Required, >0 -->
      <th>Discount %</th>               <!-- 0-100 -->
      <th>Discount Amount</th>          <!-- Auto-calculated -->
      <th>Amount</th>                   <!-- Auto-calculated: (Qty × Price) - Discount -->
      <th>Action</th>                   <!-- Add/Remove buttons -->
    </tr>
  </thead>
  <tbody>
    <!-- Dynamic rows -->
  </tbody>
</table>
```

**Calculations:**
- `Discount Amount = (Quantity × Unit Price) × (Discount % / 100)`
- `Amount = (Quantity × Unit Price) - Discount Amount`
- `Subtotal = SUM(Amount for all items)`
- `Total Discount = SUM(Discount Amount for all items)`
- `Final Total = Subtotal - Total Discount`

### 4. **Form Layout Template Structure**

```
┌────────────────────────────────────────────────────────────┐
│  HEADER SECTION                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Document: LPO-2026-001234  |  Status: Pending       │ │
│  │ Type: Local Purchase Order  |  Date: Mar 5, 2026    │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘

┌───────────────────────────────┬───────────────────────────────┐
│  RAISER SECTION              │  APPROVER SECTION             │
├───────────────────────────────┼───────────────────────────────┤
│ Raiser: John Doe             │ Approver: Select Manager      │
│ Department: Procurement      │ Department: [Auto-fill]       │
│ Date: Mar 5, 2026           │ Status: [Pending Approval]    │
│ Notes: [Optional]            │ Comments: [Optional]          │
└───────────────────────────────┴───────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  RECIPIENT/VENDOR SECTION                                  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Supplier: ____________     Contact: _______________  │ │
│  │ Address: ____________________________________________  │ │
│  │ Delivery Date: ____________                          │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  LINE ITEMS SECTION                                        │
│  │ Item │ Name │ Desc │ Qty │ Price │ Disc% │ Amount │   │
│  ├──────┼──────┼──────┼─────┼───────┼───────┼────────┤   │
│  │ 001  │ ...  │ ...  │ ... │  ...  │  ...  │  ...   │   │
│  │ 002  │ ...  │ ...  │ ... │  ...  │  ...  │  ...   │   │
│  │ [+]  │Add   │      │     │       │       │        │   │
│  └────────────────────────────────────────────────────────┘ │
│                                  Subtotal: KES X,XXX.XX    │
│                              Total Discount: -KES X,XX.XX  │
│                                FINAL TOTAL: KES X,XXX.XX   │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  SUMMARY & ACTIONS                                         │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Items: 2  | Total Amount: KES 125,500.00             │ │
│  │ Status: Pending Approval                             │ │
│  │ [Cancel] [Save as Draft] [Submit for Approval]      │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### 5. **Specific Form Variations**

#### LPO (Local Purchase Order) Template
```typescript
interface LPOTemplate extends FormHeader {
  supplier: {
    name: string;              // Required
    contactPerson?: string;
    phone?: string;
    email?: string;
  };
  deliveryDetails: {
    address: string;           // Required
    date: Date;                // Required
    instructions?: string;
  };
  lineItems: LineItem[];
  notes?: string;             // PO terms, special conditions
}
```

#### Imprest Template
```typescript
interface ImprestTemplate extends FormHeader {
  employee: {
    id: string;               // Required
    name: string;             // Auto-filled
    department: string;       // Auto-filled
    designation?: string;
  };
  purpose: string;            // Required - description of use
  amount: number;             // Required, > 0
  expectedReturnDate: Date;   // Required
  approver: ApproverInfo;     // Manager must approve
}
```

#### Purchase Order Template
```typescript
interface PurchaseOrderTemplate extends FormHeader {
  supplier: {
    name: string;             // Required
    registrationNumber?: string;
    contactDetails: ContactInfo;
  };
  deliveryDetails: {
    address: string;          // Required
    date: Date;               // Required
    terms?: string;
  };
  paymentTerms: {
    method: 'credit' | 'cash' | 'cheque' | 'bank_transfer';
    dueDate?: Date;
    discount?: number;
  };
  lineItems: LineItem[];
}
```

### 6. **Required vs Optional Fields**

#### Always Required (* marked)
- Document Number (auto-generated)
- Raiser Information (auto-filled)
- Approver Selection (cannot be self)
- Delivery Date / Due Date
- Line Items (at least one with name, qty, price)
- Contact Information (supplier/employee)

#### Always Optional
- Item Descriptions
- Notes/Comments
- Special Instructions
- Discount Information (defaults to 0%)

### 7. **Validation Rules**

```typescript
// All forms must enforce:
validationRules = {
  required_fields: {
    documentNumber: "Auto-generated",
    raiserId: "Must have current user",
    approverId: "Cannot be same as raiser",
    deliveryDate: "Must be future date",
    items_minimum: "At least 1 line item required"
  },
  field_formats: {
    quantity: "Number > 0",
    unitPrice: "Number > 0",
    discountPercent: "Number 0-100",
    employeeId: "Must exist in system"
  },
  business_rules: {
    approver_not_self: "Approver must be different person from raiser",
    imprest_max_amount: "Check organizational limits",
    delivery_date_logic: "Cannot be in past",
    supplier_exists: "Supplier must be in system"
  }
}
```

### 8. **Status Workflow**

```
┌─────────┐    ┌─────────┐    ┌──────────┐    ┌──────────┐
│ Draft   │───>│ Pending │───>│ Approved │───>│ Complete │
└─────────┘    └─────────┘    └──────────┘    └──────────┘
                    ↓
                ┌─────────┐
                │Rejected │
                └─────────┘
```

**Status Descriptions:**
- **Draft**: Form saved but not submitted for approval
- **Pending**: Awaiting approver action
- **Approved**: Approver has signed off
- **Rejected**: Approver sent back for revision (with comments)
- **Complete**: Payment/Reconciliation done

---

## CSS Classes for Form Components

```css
/* Container */
.form-container { }
.form-header { }
.form-section { }

/* Two-Column Layout */
.two-column-section { }
.column { }
  .column.raiser { }
  .column.approver { }

/* Labels & Fields */
.field-label { }
.field-input { }
.field-required::after { content: " *"; color: red; }

/* Tables */
.items-table { }
.items-table thead { }
.items-table tbody tr { }
.items-table tfoot { }
  .tfoot-subtotal { }
  .tfoot-discount { }
  .tfoot-total { }

/* Buttons */
.btn-submit { }
.btn-draft { }
.btn-cancel { }

/* Status Badges */
.status-badge { }
  .status-badge.draft { }
  .status-badge.pending { }
  .status-badge.approved { }
  .status-badge.rejected { }
  .status-badge.complete { }
```

---

## Implementation Checklist

- [ ] Form header with document number and metadata
- [ ] Raiser section (left) with auto-filled user info
- [ ] Approver section (right) with validation rules
- [ ] Line items table with calculation engine
- [ ] Real-time total calculations
- [ ] Validation on all required fields
- [ ] Status tracking and workflow
- [ ] Print-friendly styling
- [ ] Mobile responsive layout
- [ ] Save draft functionality
- [ ] Submit with approver notification
- [ ] Edit/Review capabilities
- [ ] Audit trail (who changed what when)

---

## Best Practices

1. **Always auto-fill** user information (name, department, email)
2. **Prevent self-approval** - approver must be different person
3. **Calculate in real-time** - show totals as user types
4. **Validate before submit** - show clear error messages
5. **Maintain audit trail** - log all changes with timestamps
6. **Use consistent terminology** - "Raiser" for creator, "Approver" for reviewer
7. **Support draft saving** - don't lose user data
8. **Make it mobile-friendly** - forms used on-site sometimes
9. **Print properly** - documents must be printable without data loss
10. **Enforce workflow** - don't allow skipping approval steps
