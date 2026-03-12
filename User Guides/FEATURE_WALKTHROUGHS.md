# Melitech CRM - Feature Walkthroughs

**Step-by-step guides for common tasks**

---

## Table of Contents

1. [Sales Management](#sales-management)
2. [Financial Management](#financial-management)
3. [Project Management](#project-management)
4. [Human Resources](#human-resources)
5. [Reporting and Analytics](#reporting-and-analytics)

---

## Sales Management

### Walkthrough 1: Complete Sales Pipeline from Lead to Invoice

**Scenario**: You've identified a new business opportunity and want to track it through the entire sales process.

**Time Required**: 20 minutes

#### Step 1: Create an Opportunity (5 minutes)

1. Click **Opportunities** in the main menu
2. Click **"Add Opportunity"**
3. Fill in the following information:
   - **Opportunity Name**: "Website Redesign for ABC Corp"
   - **Client**: Select "ABC Corp" (or create new if not in system)
   - **Value**: 15000
   - **Stage**: "Lead"
   - **Probability**: 25% (early stage)
   - **Expected Close Date**: 90 days from today
   - **Description**: "ABC Corp wants to redesign their website. Initial consultation completed. Waiting for their approval to proceed."
4. Click **"Save Opportunity"**

**What you've done**: Created a record to track this potential deal. The system will help you monitor it through the sales process.

#### Step 2: Move Opportunity Through Pipeline (5 minutes)

As the opportunity progresses, you'll move it through different stages:

1. Go to **Opportunities** and view the **Pipeline** view
2. You'll see columns for each stage:
   - Lead
   - Qualified
   - Proposal
   - Negotiation
   - Closing

3. When you've qualified the lead, drag the opportunity card from "Lead" to "Qualified"
4. Update the probability to 50%
5. As you move through stages, continue updating:
   - **Proposal stage**: Probability 60%, update description with proposal details
   - **Negotiation stage**: Probability 75%, note any negotiation points
   - **Closing stage**: Probability 90%, prepare to convert to invoice

#### Step 3: Create an Estimate (5 minutes)

Before sending an invoice, create an estimate for the client:

1. Click **Estimates** in the main menu
2. Click **"Create Estimate"**
3. Fill in:
   - **Client**: "ABC Corp"
   - **Expiration Date**: 14 days from today
4. Click **"Add Line Item"**
5. Enter:
   - **Description**: "Website Redesign - Full Service"
   - **Quantity**: 1
   - **Unit Price**: 15000
6. Add a personal message: "Thank you for considering our services. We're excited about this project."
7. Click **"Save Estimate"**

#### Step 4: Send Estimate to Client (3 minutes)

1. Find the estimate you just created
2. Click **"Send Estimate"**
3. Verify the client's email address
4. Click **"Send"**

**What happens next**: The client receives the estimate and can review it. Once they approve, you'll convert it to an invoice.

#### Step 5: Convert Estimate to Invoice (2 minutes)

Once the client approves:

1. Open the estimate
2. Click **"Convert to Invoice"**
3. The system creates an invoice with the same line items
4. Adjust the dates:
   - **Invoice Date**: Today
   - **Due Date**: 30 days from today
5. Click **"Save Invoice"**

#### Step 6: Send Invoice to Client (2 minutes)

1. Open the invoice you just created
2. Click **"Send Invoice"**
3. Add a message: "Thank you for approving our proposal. Please find the invoice attached. Payment is due in 30 days."
4. Click **"Send"**

**Result**: You've successfully moved an opportunity from initial lead to invoice. Now you track payment and project completion.

---

### Walkthrough 2: Managing Multiple Opportunities

**Scenario**: You have several opportunities at different stages and want to see your overall sales pipeline.

**Time Required**: 10 minutes

#### Step 1: View Your Pipeline

1. Click **Opportunities** in the main menu
2. Click the **Pipeline** view (if not already selected)
3. You'll see all your opportunities organized by stage

#### Step 2: Analyze Your Pipeline

Look at your pipeline and note:

- **Total Value**: Sum of all opportunity values
- **Weighted Value**: Calculated based on probability (e.g., $10,000 opportunity at 50% probability = $5,000 weighted value)
- **Opportunities by Stage**: How many deals are in each stage
- **Bottlenecks**: Stages with too many opportunities (may need to move deals forward)

#### Step 3: Prioritize Your Work

1. Focus on opportunities in "Closing" stage - these are closest to completion
2. Follow up on opportunities in "Proposal" stage - these need attention
3. Qualify leads in "Lead" stage - determine if they're worth pursuing

#### Step 4: Update Opportunities

For each opportunity:

1. Click on the opportunity card
2. Review the details
3. Update:
   - **Stage**: Move to next stage if progress made
   - **Probability**: Adjust based on recent developments
   - **Expected Close Date**: Update if timeline changed
   - **Description**: Add notes about recent conversations or developments
4. Click **"Save"** to update

#### Step 5: Generate Pipeline Report

1. Click **Reports** (if available in Opportunities module)
2. Select **"Pipeline Report"**
3. Choose date range
4. Click **"Generate Report"**
5. Review the report showing:
   - Total pipeline value
   - Opportunities by stage
   - Opportunities by probability
   - Forecast revenue

**Tip**: Run this report weekly to monitor your sales progress and identify issues early.

---

## Financial Management

### Walkthrough 3: Managing Invoices and Payments

**Scenario**: You need to create an invoice, send it to a client, track payment, and record it in the system.

**Time Required**: 15 minutes

#### Step 1: Create an Invoice

1. Click **Invoices** in the main menu
2. Click **"Create New Invoice"**
3. Select the **Client** from the dropdown
4. Enter:
   - **Invoice Number**: Auto-generated or custom (e.g., INV-2025-001)
   - **Invoice Date**: Today's date
   - **Due Date**: 30 days from today
   - **Description**: "Professional Services - December 2025"
5. Click **"Add Line Item"** for each item:
   - **Description**: "Consulting Services"
   - **Quantity**: 10 hours
   - **Unit Price**: 150 per hour
   - Total automatically calculates: 1500
6. Add another line item if needed
7. Review the total amount
8. Click **"Save Invoice"**

#### Step 2: Send Invoice to Client

1. Open the invoice you just created
2. Click **"Send Invoice"**
3. Verify the email address is correct
4. Add a professional message: "Please find the invoice for services rendered in December. Payment is due by [due date]. Thank you for your business."
5. Click **"Send"**

**What happens**: The client receives the invoice via email and can review it.

#### Step 3: Track Invoice Status

1. Go to **Invoices** and view your invoice list
2. Each invoice shows its status:
   - **Sent**: Waiting for payment
   - **Partially Paid**: Some payment received
   - **Paid**: Fully paid
   - **Overdue**: Past due date
3. Click on an invoice to see:
   - Invoice details
   - Payment history
   - Any notes or communications

#### Step 4: Record a Payment

When the client pays:

1. Click **Payments** in the main menu
2. Click **"Record Payment"**
3. Select the **Invoice** that was paid
4. Enter:
   - **Payment Amount**: The amount received
   - **Payment Date**: Date the payment was received
   - **Payment Method**: Check, Bank Transfer, Credit Card, etc.
   - **Reference Number**: Check number or transaction ID
5. Click **"Save Payment"**

**Result**: The invoice automatically updates to show it's been paid. The payment is recorded in your financial records.

#### Step 5: Send Payment Reminder (Optional)

If payment is overdue:

1. Go to **Invoices** and filter for **Overdue** status
2. Click on an overdue invoice
3. Click **"Send Reminder"**
4. Add a message: "This is a friendly reminder that payment for invoice [number] is now overdue. Please submit payment at your earliest convenience."
5. Click **"Send"**

---

### Walkthrough 4: Tracking Business Expenses

**Scenario**: You need to record various business expenses and categorize them properly for financial reporting.

**Time Required**: 10 minutes

#### Step 1: Record an Office Supply Expense

1. Click **Expenses** in the main menu
2. Click **"Add Expense"**
3. Fill in:
   - **Expense Category**: "Office Supplies"
   - **Amount**: 250
   - **Date**: Today's date
   - **Description**: "Printer paper, ink cartridges, and office supplies from Office Depot"
   - **Payment Method**: "Credit Card"
4. Upload the receipt if available
5. Click **"Save Expense"**

#### Step 2: Record a Travel Expense

1. Click **"Add Expense"**
2. Fill in:
   - **Expense Category**: "Travel"
   - **Amount**: 450
   - **Date**: Date of travel
   - **Description**: "Flight and hotel for client meeting in New York"
   - **Payment Method**: "Corporate Card"
3. Click **"Save Expense"**

#### Step 3: Record a Meal Expense

1. Click **"Add Expense"**
2. Fill in:
   - **Expense Category**: "Meals"
   - **Amount**: 85
   - **Date**: Date of meal
   - **Description**: "Client lunch meeting with John Smith from ABC Corp"
   - **Payment Method**: "Cash"
4. Upload receipt
5. Click **"Save Expense"**

#### Step 4: View Expense Summary

1. Go to **Expenses** and view the expense list
2. Notice the **Summary** section showing:
   - Total expenses this month
   - Expenses by category
   - Top expense categories
3. Click **"Reports"** to generate detailed expense reports

#### Step 5: Reconcile Expenses

1. Compare your recorded expenses with your credit card statement
2. Verify that:
   - All expenses are recorded
   - Amounts match
   - Dates are correct
3. Mark reconciled expenses as "Verified"

**Tip**: Record expenses immediately when they occur. Waiting until later makes it harder to remember details and categorize correctly.

---

## Project Management

### Walkthrough 5: Creating and Managing a Project

**Scenario**: You're starting a new project and need to set it up in the system, assign tasks, and track progress.

**Time Required**: 25 minutes

#### Step 1: Create the Project

1. Click **Projects** in the main menu
2. Click **"Create Project"**
3. Fill in the project information:
   - **Project Name**: "Website Redesign - ABC Corp"
   - **Client**: "ABC Corp"
   - **Start Date**: Today's date
   - **End Date**: 90 days from today
   - **Budget**: 15000
   - **Description**: "Complete redesign of ABC Corp's website including new design, functionality, and content migration"
4. Click **"Add Team Member"** to assign people:
   - Select project manager
   - Select designer
   - Select developer
   - Select QA tester
5. Click **"Create Project"**

**What you've done**: Created a project container and assigned the team.

#### Step 2: Create Project Tasks

1. Open the project you just created
2. Click **"Add Task"** for each major task:

**Task 1: Design Phase**
- **Task Name**: "Create Website Design Mockups"
- **Assigned To**: Designer
- **Due Date**: 14 days from today
- **Priority**: High
- **Description**: "Create 3 design mockups for client review. Include homepage, product pages, and contact page."

**Task 2: Development Phase**
- **Task Name**: "Develop Website Frontend"
- **Assigned To**: Developer
- **Due Date**: 45 days from today
- **Priority**: High
- **Description**: "Build responsive frontend using approved design. Implement all interactive elements."

**Task 3: Content Migration**
- **Task Name**: "Migrate Content from Old Site"
- **Assigned To**: Team member
- **Due Date**: 60 days from today
- **Priority**: Medium
- **Description**: "Transfer all existing content from old website to new site. Optimize for SEO."

**Task 4: Testing**
- **Task Name**: "Quality Assurance Testing"
- **Assigned To**: QA tester
- **Due Date**: 75 days from today
- **Priority**: High
- **Description**: "Test all functionality across browsers and devices. Document and report bugs."

**Task 5: Deployment**
- **Task Name**: "Deploy to Production"
- **Assigned To**: Developer
- **Due Date**: 85 days from today
- **Priority**: High
- **Description**: "Move website to production server. Set up monitoring and backups."

#### Step 3: Set Task Dependencies

Some tasks depend on others being completed first:

1. Open the "Develop Website Frontend" task
2. Set it as dependent on "Create Website Design Mockups"
3. This prevents the developer from starting before the design is approved

#### Step 4: Track Project Progress

1. Go to the project dashboard
2. View the **Progress Bar** showing overall completion
3. See individual task status:
   - Not Started: 5 tasks
   - In Progress: 1 task
   - Completed: 0 tasks
4. View the **Timeline** showing:
   - Project start and end dates
   - Task durations
   - Critical path (tasks that affect overall timeline)

#### Step 5: Update Task Status

As team members work:

1. Click on a task to open it
2. Change the **Status** to "In Progress"
3. Add a comment: "Started work on design mockups. Will have first draft by Friday."
4. Click **"Save"**

**For team members**: They can update their own task status:
1. Click on their assigned task
2. Update status as they work
3. Add comments about progress

#### Step 6: Monitor Project Health

1. Review the project weekly
2. Check for:
   - Tasks that are behind schedule (red flags)
   - Bottlenecks where tasks are blocked
   - Team members who are overloaded
3. Adjust timelines or resources if needed
4. Communicate changes to the team

#### Step 7: Complete the Project

When all tasks are done:

1. Mark all tasks as "Completed"
2. The project progress bar reaches 100%
3. Click **"Archive Project"** to move it to completed projects
4. Generate a **Project Report** showing:
   - Actual vs. planned timeline
   - Actual vs. budgeted costs
   - Team member contributions
   - Lessons learned

---

## Human Resources

### Walkthrough 6: Processing Employee Leave Requests

**Scenario**: An employee requests leave and you need to approve or deny it.

**Time Required**: 5 minutes

#### Step 1: View Pending Leave Requests (Manager)

1. Click **Leave** in the main menu
2. Click **"Pending Requests"**
3. You see all leave requests waiting for your approval

#### Step 2: Review a Leave Request

1. Click on a leave request to view details:
   - Employee name
   - Leave type (vacation, sick, personal)
   - Start and end dates
   - Number of days requested
   - Reason for leave
   - Leave balance (how many days they have left)
2. Review the request and check:
   - Is the employee's leave balance sufficient?
   - Are there any coverage concerns?
   - Is the timing appropriate?

#### Step 3: Approve the Request

If you approve:

1. Click **"Approve"**
2. Add a comment (optional): "Approved. Please ensure your work is covered."
3. Click **"Confirm Approval"**

**What happens**: The employee is notified that their leave is approved. The dates are blocked on the calendar.

#### Step 4: Deny the Request

If you need to deny:

1. Click **"Reject"**
2. Enter a reason: "We have a critical project deadline during this period. Please select alternative dates."
3. Click **"Confirm Rejection"**

**What happens**: The employee is notified and can request different dates.

#### Step 5: Employee Views Their Leave Balance

As an employee:

1. Click **Leave** in the main menu
2. Click **"My Leave Balance"**
3. View:
   - Vacation days remaining
   - Sick leave remaining
   - Personal leave remaining
   - Leave history

---

### Walkthrough 7: Processing Payroll

**Scenario**: It's the end of the month and you need to process payroll for all employees.

**Time Required**: 30 minutes

#### Step 1: Access Payroll

1. Click **Payroll** in the main menu
2. Click **"Create Payroll"**

#### Step 2: Select Pay Period

1. Choose the **Pay Period**: Monthly (or your company's pay frequency)
2. Select the **Month**: December 2025
3. Click **"Next"**

#### Step 3: Review Employee List

The system displays all active employees with:
- Base salary
- Any bonuses or deductions
- Leave taken (unpaid leave reduces pay)
- Overtime hours (if applicable)

#### Step 4: Make Adjustments

For each employee, review and adjust if needed:

1. **Employee A**: Base salary $5,000
   - Add bonus: $500 (performance bonus)
   - Deduct: $100 (unpaid leave - 1 day)
   - Net: $5,400

2. **Employee B**: Base salary $4,000
   - No adjustments
   - Net: $4,000

3. **Employee C**: Base salary $6,000
   - Add overtime: $300 (10 hours at $30/hour)
   - Net: $6,300

#### Step 5: Calculate Payroll

1. Click **"Calculate Payroll"**
2. The system calculates:
   - Gross salary for each employee
   - Tax deductions
   - Insurance deductions
   - Net pay (amount to be paid)
3. Review the summary showing:
   - Total gross payroll
   - Total deductions
   - Total net payroll

#### Step 6: Review and Approve

1. Review the payroll summary
2. Check for any errors or unusual amounts
3. Click **"Process Payroll"** to finalize

#### Step 7: Generate Payslips

1. Go to the completed payroll
2. For each employee, click **"Generate Payslip"**
3. The payslip shows:
   - Gross salary
   - All deductions
   - Net pay
   - Year-to-date totals
4. Click **"Email"** to send payslip to employee
5. Or click **"Download"** to save as PDF

**Result**: Payroll is processed and employees receive their payslips.

---

## Reporting and Analytics

### Walkthrough 8: Creating and Analyzing Reports

**Scenario**: You need to understand your business performance and create reports for management.

**Time Required**: 20 minutes

#### Step 1: Access Reports

1. Click **Dashboard** in the main menu
2. Or navigate to specific modules (Invoices, Projects, etc.) and click **"Reports"**

#### Step 2: Create a Revenue Report

1. Click **Invoices** → **"Reports"**
2. Select **"Revenue Report"**
3. Set the date range: Last 12 months
4. Click **"Generate Report"**

**The report shows**:
- Total revenue for the period
- Revenue by client
- Revenue by month (trend)
- Outstanding invoices

#### Step 3: Analyze the Revenue Report

Look for:
- **Trend**: Is revenue increasing or decreasing?
- **Top Clients**: Who generates the most revenue?
- **Seasonality**: Are there patterns by month?
- **Outstanding**: How much money is owed to you?

#### Step 4: Create a Project Performance Report

1. Click **Projects** → **"Reports"**
2. Select **"Project Performance Report"**
3. Choose the date range: Last quarter
4. Click **"Generate Report"**

**The report shows**:
- Projects completed on time
- Projects over budget
- Average project duration
- Team member utilization

#### Step 5: Create an Expense Report

1. Click **Expenses** → **"Reports"**
2. Select **"Expense Report"**
3. Set date range: Last month
4. Filter by category (optional)
5. Click **"Generate Report"**

**The report shows**:
- Total expenses by category
- Highest expense categories
- Expense trends
- Budget vs. actual

#### Step 6: Export Report

1. After generating a report, click **"Export"**
2. Choose format:
   - **PDF**: For printing or sharing
   - **Excel**: For further analysis
3. Click **"Download"**
4. Open in your preferred application

#### Step 7: Create a Dashboard View

1. Go to **Dashboard**
2. Click **"Customize Dashboard"**
3. Select widgets to display:
   - Revenue chart
   - Project status
   - Employee metrics
   - Expense summary
4. Drag to rearrange
5. Click **"Save Layout"**

**Result**: You have a personalized dashboard showing key metrics at a glance.

---

## Tips for Success

### Tip 1: Regular Data Entry
Enter data as soon as transactions occur. This keeps your system current and accurate.

### Tip 2: Use Notes and Comments
Add context to records. Future users will appreciate understanding why decisions were made.

### Tip 3: Review Reports Regularly
- Financial reports: Monthly
- Project reports: Weekly
- Sales reports: Daily
- HR reports: Monthly

### Tip 4: Keep Team Informed
Use comments and notifications to keep team members updated on important changes.

### Tip 5: Customize to Your Needs
The system is flexible. Adjust workflows to match your business processes.

---

**You now understand the key workflows in Melitech CRM. Practice these walkthroughs and you'll become proficient quickly!**
