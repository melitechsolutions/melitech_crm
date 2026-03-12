# Melitech CRM Issues Analysis

## Issues Identified

### 1. Backend Saving Issues
**Status**: Backend routers appear correctly implemented
- Projects router: Has proper create/update mutations
- Invoices router: Has proper create/update mutations with line items
- Estimates router: Has proper create/update mutations with line items
- Settings router: Has proper update mutations

**Potential Issues**:
- Date handling: Frontend sends Date objects, but schema expects datetime strings
- The frontend may not be properly calling the mutations
- Type mismatches between frontend and backend

### 2. Expenses COA Selection
**Current Status**: Need to check expenses router and form
- Expenses should have a required Chart of Accounts field
- Need to add validation and UI updates

### 3. System Settings Not Saving
**Current Status**: Settings router exists with update mutations
- Need to check frontend Settings page implementation
- May be a frontend form submission issue

### 4. Terms and Conditions on Documents
**Requirements**:
- **Estimates Terms**:
  1. All prices are in Kenya shillings (KSHs)
  2. VAT is charged where applicable
  3. Quotation is valid for 45 days from date of generation
  4. Payment of 75% is expected before commencement of the project

- **Invoices Terms**:
  1. All prices are in Kenya shillings (KSHs)
  2. VAT is charged where applicable
  3. Invoice is valid for 7 days from date of generation
  4. Late invoices will attract a penalty or suspension of service

- **Payment Details**:
  - Bank: Kenya Commercial Bank
  - Branch: Kitengela
  - Acc.: 1295660644
  - Acc. Name: Melitech Solutions
  - Mpesa Paybill: 522522
  - Acc. Number: 1295660644

- **Receipt Footer**: "Thank you for your business."

- **Document Footer**: "This is a system generated {document Name} and is digitally signed under Melitech Solutions."

### 5. Company Contact Details & Logo
- Need to add full company contact details in header
- Need to add company logo before document title

### 6. Notifications System
- Implement sitewide notifications across all dashboards
- Display necessary notifications

### 7. Payments & Expenses Approval
- Payments approval button not implemented
- Need to add approval option to Expenses

### 8. Project Progress Percentage
- Add % field to project creation form
- Add % field to project edit/preview
- Display progress % on main projects page
- Schema already has `progress` field (int 0-100)

## Database Schema Notes

### Projects Table
- Has `progress` field (int, default 0)
- Does NOT have `progressPercentage` field
- Backend router references both `progress` and `progressPercentage` (line 59, 80, 98, 108)
- **Action**: Need to standardize on `progress` field only

### Date Fields
- Schema uses `datetime({ mode: 'string' })`
- Frontend may be sending Date objects
- **Action**: Ensure proper date conversion

## Next Steps
1. Fix date handling in frontend forms
2. Add progressPercentage field to schema OR remove references from backend
3. Implement COA selection for expenses
4. Fix system settings frontend
5. Add terms and conditions to PDF generators
6. Implement notifications system
7. Add approval workflows
8. Update project forms with progress field
