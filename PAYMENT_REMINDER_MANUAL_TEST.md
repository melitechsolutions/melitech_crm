# Payment Reminder Workflow - Manual Testing Guide

## Overview
This guide walks through testing the payment reminder feature end-to-end using the application UI.

---

## Prerequisites
- Application is running on http://localhost:3001
- You are logged in with a valid user account
- Database has test clients and invoices

---

## Test Scenario 1: Send Individual Payment Reminder

### Steps
1. **Navigate to Invoices Page**
   - Go to http://localhost:3001 (or navigate via dashboard)
   - Click on "Invoices" in the sidebar
   - Expected: Invoices page loads with table showing existing invoices

2. **Find an Overdue Invoice**
   - Look for an invoice with status "Overdue"
   - Verify the invoice has:
     - Invoice Number (e.g., INV-001)
     - Client name and email
     - Amount due
     - Status badge showing "OVERDUE"

3. **Send Individual Reminder**
   - On the invoice row with overdue status, locate the Mail icon button (rightmost column)
   - Click the Mail icon
   - Expected notification: "Payment reminder sent" (green toast at top)

4. **Verify Email (if SMTP configured)**
   - Check email inbox of client email address
   - Expected email content:
     - Subject: "Payment Reminder: Invoice INV-XXX is N days overdue"
     - Body includes:
       - Client name greeting
       - Invoice number and amount
       - Days overdue count
       - Professional call to action

### Pass Criteria
- ✅ Toast notification appears confirming reminder sent
- ✅ No errors in browser console
- ✅ (Optional) Email received if SMTP is configured

---

## Test Scenario 2: Bulk Send Payment Reminders

### Steps
1. **Navigate to Invoices Page**
   - Go to Invoices page (as above)

2. **Select Multiple Invoices**
   - Check the checkbox next to an "Overdue" invoice
   - Check the checkbox next to a "Pending" invoice
   - Expected: Selected invoices are highlighted, count shows selections

3. **Verify Bulk Action Button Appears**
   - Above the table, look for gray button with Mail icon and "Send Reminders" label
   - Button should only appear when invoices are selected

4. **Send Bulk Reminders**
   - Click "Send Reminders" button
   - Expected result: 
     - Toast notification for each invoice sent
     - Bulk action completes

5. **Clear Selection**
   - Click checkbox in table header to deselect all
   - Expected: "Send Reminders" button disappears
   - Verify selection is cleared

### Pass Criteria
- ✅ Bulk button appears/disappears appropriately
- ✅ Multiple reminders can be sent in one action
- ✅ Toast notifications confirm successful sends
- ✅ No console errors

---

## Test Scenario 3: Invoice Status Eligibility

### Steps
1. **Navigate to Invoices Page**

2. **Inspect Various Invoice Statuses**
   - **Draft invoices**: Mail icon should NOT appear (grayed out or hidden)
   - **Pending invoices**: Mail icon should appear and be clickable
   - **Overdue invoices**: Mail icon should appear and be clickable
   - **Sent invoices**: Mail icon should appear and be clickable
   - **Paid invoices**: Mail icon should NOT appear (grayed out or hidden)

3. **Attempt Reminder on Non-Eligible Invoices**
   - Try to select a paid invoice (if checkbox is available)
   - Note: Controls should prevent sending to inappropriate statuses

### Pass Criteria
- ✅ Only appropriate statuses allow reminder sending
- ✅ UI prevents sending to paid/draft invoices

---

## Test Scenario 4: Email Validation

### Steps
1. **Review Email Requirements**
   - Each invoice must have a client with email address
   - Verify client email exists in client details

2. **Attempt Reminder on Invoice Without Email**
   - If a client has no email, attempting to send should:
     - Show error toast: "Client email not available" or similar
     - Not log activity for failed send

3. **Verify Email Format**
   - Client emails should be valid format (name@domain.com)

### Pass Criteria
- ✅ Reminders cannot be sent without valid client email
- ✅ Error messaging is clear

---

## Test Scenario 5: Activity Log Verification

### Steps
1. **After Sending Payment Reminders**
   - Navigate to any Activity Log or Audit Trail (if available)
   - Look for entries with action type: "payment_reminder_sent"

2. **Verify Log Entry Contains**
   - User ID who sent the reminder
   - Invoice ID and invoice number
   - Recipient email address
   - Timestamp of send

### Pass Criteria
- ✅ Reminder sends are logged in activity log
- ✅ Log entries contain complete information

---

## Test Scenario 6: Error Handling

### Negative Test Cases

#### Case 1: Send Reminder for Non-Existent Invoice
- Edit URL to invoice ID that doesn't exist
- Expected: "Invoice not found" error message

#### Case 2: Network Error During Send
- Temporarily disconnect network
- Click "Send Reminder"
- Expected: Error toast appears with message

#### Case 3: Invalid Email Format
- (If manual testing is possible) Attempt to send with malformed email
- Expected: Validation error

### Pass Criteria
- ✅ Graceful error handling for all scenarios
- ✅ User-friendly error messages

---

## Test Scenario 7: UI/UX Validation

### Visual Elements
1. **Mail Icon Button**
   - ✅ Clearly visible in invoice row
   - ✅ Tooltip shows "Send payment reminder" on hover
   - ✅ Disabled state shows for non-eligible statuses

2. **Bulk Action Button**
   - ✅ Only appears when invoices selected
   - ✅ Clear Mail icon and text label
   - ✅ Professional styling matches rest of app

3. **Toast Notifications**
   - ✅ Success toast shows briefly then fades
   - ✅ Error toast persists longer for readability
   - ✅ Multiple toasts stack properly

### Pass Criteria
- ✅ All UI elements render correctly
- ✅ No layout shifts or visual glitches
- ✅ Responsive on mobile (if testing)

---

## Test Scenario 8: Performance Testing

### Steps
1. **Bulk Send to Large Number of Invoices**
   - Select 20+ invoices
   - Click "Send Reminders"
   - Measure response time

2. **Monitor Network Activity**
   - Open browser DevTools → Network tab
   - Send reminders
   - Expected: Single POST to `/api/trpc/email.sendPaymentReminder` per invoice

3. **Check Server Performance**
   - Monitor server logs for errors
   - Check database query performance

### Pass Criteria
- ✅ Bulk sends complete within reasonable time (< 2 seconds)
- ✅ Server handles queries efficiently
- ✅ No memory leaks or resource issues

---

## Checklist for Complete Testing

- [ ] Individual reminder can be sent from Invoices page
- [ ] Bulk reminders work for multiple selected invoices
- [ ] Only overdue/pending/sent invoices show Mail icon
- [ ] Paid and draft invoices cannot receive reminders
- [ ] Email notifications are triggered (if SMTP configured)
- [ ] Activity log shows reminder sent action
- [ ] Error messages display for invalid/missing data
- [ ] Toast notifications work correctly
- [ ] No console errors during workflow
- [ ] UI is responsive and professional looking
- [ ] Performance is acceptable for bulk operations

---

## SMTP Configuration for Email Testing

If you want to test actual email sending, configure SMTP in `.env`:

```env
SMTP_HOST=mail.melitechsolutions.co.ke
SMTP_PORT=465
SMTP_USER=noreply@melitechsolutions.co.ke
SMTP_PASSWORD=Melitechs@@21
SMTP_FROM_NAME=Melitech Solutions
SMTP_FROM_EMAIL=noreply@melitechsolutions.co.ke
```

Then restart the server to load the new configuration.

---

## Troubleshooting

### Issue: Mail icon not appearing on any invoices
- **Check**: Are invoices in correct status? (overdue/pending/sent)
- **Check**: Do clients have email addresses?
- **Check**: Browser console for JavaScript errors
- **Solution**: Reload page, check network requests in DevTools

### Issue: Toast notification doesn't appear
- **Check**: Network tab to see if API call succeeded (200 response)
- **Check**: Console for JavaScript errors
- **Solution**: Check server logs for backend errors

### Issue: Email not received
- **Check**: SMTP configuration in `.env`
- **Check**: Spam/junk folder
- **Check**: Server logs for SMTP errors
- **Solution**: Verify SMTP credentials are correct

### Issue: Selection state doesn't persist
- **Check**: Browser console for state management errors
- **Solution**: Reload page and try again

---

## Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## Related Documentation
- [Email Notifications Setup](../EMAIL_NOTIFICATIONS_SETUP.md)
- [Invoice Management Guide](../FEATURE_WALKTHROUGHS.md)
- [CRUD Implementation Guide](../CRUD_IMPLEMENTATION_GUIDE.md)
