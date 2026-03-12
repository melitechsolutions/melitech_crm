# Comprehensive Implementation Plan: Advanced Features

**Date**: March 10, 2026  
**Project**: Melitech CRM  
**Phase**: Feature Enhancement & Integration  

---

## Executive Summary

This plan consolidates implementation of 4 major feature sets:
1. **Frontend Components**: Billing Dashboard, Enhanced Receipts, Password Management
2. **Payment Gateway Integration**: Stripe & M-Pesa
3. **Communication Services**: Email & SMS Integration  
4. **System Monitoring**: 24/7 Scheduler Job Monitoring

**Timeline**: ~3-4 weeks for full implementation  
**Technology Stack**: React/Vite, tRPC, Express, MySQL, Docker

---

## Part 1: Frontend Components (React)

### 1.1 Billing Dashboard Component

**Location**: `client/src/pages/BillingDashboard.tsx`

**Current State**: 
- Basic `billingRouter` exists for SaaS subscriptions
- `BillingInvoices` table in schema
- Needs enhanced dashboard UI

**To Implement**:
```
✓ Dashboard Overview
  - Revenue trends chart (last 12 months)
  - Outstanding invoices alert
  - Revenue vs. target comparison
  - Cash flow visualization (receipts vs. expenses)

✓ Invoice Management
  - List all invoices with filters (status, date range, client)
  - Invoice details view with payment history
  - Invoice PDF generation
  - Batch invoice actions

✓ Key Metrics Display
  - Total revenue YTD
  - Average payment time
  - Overdue amount & count
  - Collection rate %

✓ Reports
  - Revenue by client/product
  - Payment method breakdown
  - Aging schedule for receivables
  - Export to Excel/PDF
```

**Dependencies**:
- recharts (already installed)
- jspdf + jspdf-autotable (already installed)
- exceljs (already installed)
- New endpoints in `billingRouter`

**API Requirements** (tRPC):
```typescript
// Already exist or need enhancement
billing.getRevenueTrends()         // New: last 12 months
billing.getOutstandingInvoices()   // New: filtered
billing.getCashFlowData()          // New
billing.getRevenueByClient()       // New
billing.exportBillingReport()      // New
```

---

### 1.2 Receipts Management Component (Enhanced)

**Location**: `client/src/pages/Receipts.tsx` (exists but needs enhancement)

**Current State**:
- `receiptsRouter` exists with basic CRUD
- `receipts` table exists
- Basic list/create functionality

**To Enhance**:
```
✓ Receipt Dashboard
  - Recent receipts summary
  - Receipt status overview
  - Daily collection trends

✓ Receipt Management
  - Enhanced list with advanced filtering
  - Receipt detail view with payment reconciliation
  - Email receipt to customer
  - Reprint/regenerate receipt
  - PDF receipt generation

✓ Receipts Analytics
  - Total collected by payment method
  - Collection trends
  - Aging analysis
  - Customer collection history

✓ Batch Operations
  - Send multiple receipts
  - Mark as sent/delivered
  - Archive receipts
```

**Database Extension**:
```sql
ALTER TABLE receipts ADD COLUMN:
- receiptStatus: ENUM('draft', 'issued', 'sent', 'delivered', 'archived')
- emailSentAt: TIMESTAMP NULL
- emailRecipient: VARCHAR(320) NULL
- paymentReconciliationId: VARCHAR(64) NULL
- receiptTemplate: VARCHAR(50) DEFAULT 'default'
- metadata: JSON NULL
```

**API Requirements** (tRPC - new):
```typescript
receipts.sendEmailReceipt()          // Email receipt to customer
receipts.generateReceiptPdf()        // Generate PDF on demand
receipts.getReceiptAnalytics()       // Analytics data
receipts.updateReceiptStatus()       // Status workflow
receipts.bulkEmailReceipts()         // Batch send
```

---

### 1.3 Enhanced Password Change Component

**Location**: `client/src/pages/ChangePassword.tsx` (exists but enhance)

**Current State**:
- Basic password change form exists
- Supports role-based redirects
- Handles "requiresPasswordChange" flag

**To Enhance**:
```
✓ Security Features
  - Password strength meter (real-time feedback)
  - Common password check (top 100k passwords DB)
  - History check (prevent reuse of last 3 passwords)
  - Two-factor verification option
  - Session invalidation warning

✓ UX Improvements
  - Password requirements display
  - Show/hide password toggles (already exists)
  - Clear success/error messaging
  - Timeout warning before session ends

✓ Advanced Features
  - Forced password reset with deadline
  - Password expiry policy enforcement
  - Audit logging of password changes
  - Admin password reset for users

✓ Notifications
  - Email confirmation of password change
  - Alert on multiple failed attempts
  - Notification of device login history
```

**Database Extension** (if needed):
```sql
ALTER TABLE users ADD COLUMN(s):
- passwordChangedAt: TIMESTAMP
- passwordExpiresAt: TIMESTAMP NULL
- forcePasswordReset: BOOLEAN DEFAULT 0
- passwordResetDeadline: TIMESTAMP NULL

CREATE TABLE passwordHistory (
  id VARCHAR(64) PRIMARY KEY,
  userId VARCHAR(64) NOT NULL,
  oldPasswordHash VARCHAR(255) NOT NULL,
  changedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**API Requirements** (tRPC - new endpoints):
```typescript
auth.changePassword()                // Enhanced version
auth.validatePasswordStrength()      // Real-time validation
auth.getPasswordRequirements()       // Policy info
auth.sendPasswordChangeEmail()       // Confirmation email
auth.getPasswordHistory()            // Admin view
auth.forcePasswordReset()            // Admin action
```

---

## Part 2: Payment Gateway Integration

### 2.1 Stripe Integration

**Location**: `server/services/stripe.ts` (new)

**Features**:
```
✓ Initialization & Setup
  - API key configuration
  - Webhook signature verification
  - Error handling & retry logic

✓ Payment Processing
  - One-time payments for invoices
  - Payment Method tokens
  - 3D Secure support
  - Idempotency keys

✓ Recurring Billing
  - Subscription management
  - Plan configuration
  - Proration handling

✓ Webhook Handling
  - payment_intent.succeeded
  - payment_intent.payment_failed
  - charge.refunded
  - customer.subscription.updated

✓ Admin Portal
  - View transaction history
  - Process refunds
  - Update payment methods
```

**Database Schema**:
```sql
CREATE TABLE stripePaymentIntents (
  id VARCHAR(64) PRIMARY KEY,
  invoiceId VARCHAR(64) NOT NULL UNIQUE,
  stripeIntentId VARCHAR(255) NOT NULL UNIQUE,
  clientId VARCHAR(64) NOT NULL,
  amount INT NOT NULL,
  currency VARCHAR(3) DEFAULT 'KES',
  status ENUM('requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'requires_capture', 'succeeded', 'canceled') DEFAULT 'requires_payment_method',
  paymentMethod VARCHAR(255),
  receiptEmail VARCHAR(320),
  metadata JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_invoice (invoiceId),
  INDEX idx_client (clientId),
  INDEX idx_status (status)
);

CREATE TABLE stripeWebhookEvents (
  id VARCHAR(64) PRIMARY KEY,
  stripeEventId VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(100) NOT NULL,
  data JSON NOT NULL,
  processed BOOLEAN DEFAULT 0,
  processedAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_processed (processed)
);
```

**Dependencies to Install**:
```json
"stripe": "^14.0.0"
```

**API Router** (`server/routers/stripe.ts` - new):
```typescript
stripe.createPaymentIntent()          // Initiate payment
stripe.getPaymentIntentStatus()       // Check status
stripe.processRefund()                // Refund transaction
stripe.listPaymentMethods()           // Customer methods
stripe.addPaymentMethod()             // Add card
stripe.handleWebhook()                // Webhook processor
```

**Frontend Component** (`client/src/components/StripePaymentModal.tsx` - new):
```typescript
// Uses @stripe/react-stripe-js
- Payment form with card validation
- 3D Secure challenge handling
- Payment status updates
- Success/error handling
```

---

### 2.2 M-Pesa Integration

**Location**: `server/services/mpesa.ts` (new)

**Features**:
```
✓ STK Push (Payment Collection)
  - Phone number validation (Kenya)
  - Amount validation
  - Business reference mapping
  - Transaction tracking

✓ Payment Confirmation
  - Webhook callback validation
  - Transaction confirmation
  - Receipt generation
  - Invoice reconciliation

✓ Transaction History
  - Query transaction status
  - Retry failed transactions
  - Search by reference/phone

✓ Error Handling
  - Invalid phone format
  - Insufficient balance
  - Timeout handling
  - Network retries

✓ Reconciliation
  - Daily settlement reports
  - Discrepancy handling
```

**Database Schema**:
```sql
CREATE TABLE mpesaTransactions (
  id VARCHAR(64) PRIMARY KEY,
  checkoutRequestId VARCHAR(255) UNIQUE NOT NULL,
  invoiceId VARCHAR(64) NOT NULL,
  clientId VARCHAR(64) NOT NULL,
  phoneNumber VARCHAR(20) NOT NULL,
  amount INT NOT NULL,
  businessShortCode VARCHAR(10),
  status ENUM('pending', 'completed', 'failed', 'cancelled', 'expired') DEFAULT 'pending',
  mpesaReceiptNumber VARCHAR(100),
  resultCode INT,
  resultDescription TEXT,
  transactionDate DATETIME,
  initiatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completedAt TIMESTAMP NULL,
  updatedAt TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_invoice (invoiceId),
  INDEX idx_phone (phoneNumber),
  INDEX idx_status (status),
  UNIQUE idx_checkout (checkoutRequestId)
);

CREATE TABLE mpesaSettings (
  id VARCHAR(64) PRIMARY KEY,
  businessShortCode VARCHAR(10),
  consumerKey VARCHAR(255),
  consumerSecret VARCHAR(255),
  passkey VARCHAR(255),
  environment ENUM('sandbox', 'production'),
  callbackUrl VARCHAR(255),
  validationUrl VARCHAR(255),
  isActive BOOLEAN DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Dependencies to Install**:
```json
"axios": "^1.12.0" (already installed)
```

**API Router** (`server/routers/mpesa.ts` - new):
```typescript
mpesa.initiateStkPush()               // Request payment via SMS
mpesa.checkTransactionStatus()        // Query status
mpesa.getTransactionHistory()         // List transactions
mpesa.handleMpesaCallback()           // Webhook processor
mpesa.getMpesaSettings()              // Admin: view settings
mpesa.updateMpesaSettings()           // Admin: configure M-Pesa
```

**M-Pesa Service Methods** (`server/services/mpesa.ts`):
```typescript
- initializeAuth()                    // Get access token
- stkPush(phone, amount, accountReference)
- queryStatus(checkoutRequestId)
- validateCallback(data, signature)   // Daraja signature validation
- reconcileTransaction(mpesaReceipt)
- retryFailedTransaction(transactionId)
```

**Frontend Component** (`client/src/components/MpesaPaymentModal.tsx` - new):
```typescript
- Phone number input (with Kenya country code)
- Amount display
- Animated waiting state (SIM prompt)
- Status polling
- Auto-retry logic
- Success/failure handling
```

---

## Part 3: Communication Services

### 3.1 Email Service Integration (Enhanced)

**Current State**:
- `nodemailer` already installed (~v6.9.3)
- Basic email router exists
- Email templates folder exists

**To Enhance**:
```
✓ Template Engine
  - Template management UI
  - Variable substitution {{name}}, {{amount}}, etc.
  - HTML/Plain text support
  - Preview functionality

✓ Email Queue System
  - Async queue processing
  - Retry on failure (3x with exponential backoff)
  - Rate limiting
  - Scheduled sends

✓ Advanced Features
  - Attachment support (PDF receipts, invoices)
  - HTML email builder (drag-drop blocks)
  - A/B testing
  - Delivery tracking (open/click events)
  - Unsubscribe management

✓ Email Types
  - Payment confirmation
  - Invoice reminders
  - Receipt delivery
  - Password reset
  - User notifications
```

**Database Extension**:
```sql
CREATE TABLE emailQueue (
  id VARCHAR(64) PRIMARY KEY,
  toEmail VARCHAR(320) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  templateId VARCHAR(64),
  templateVariables JSON,
  htmlContent LONGTEXT,
  plainTextContent LONGTEXT,
  attachments JSON,
  status ENUM('pending', 'sending', 'sent', 'failed', 'bounced') DEFAULT 'pending',
  attemptCount INT DEFAULT 0,
  maxAttempts INT DEFAULT 3,
  nextRetryAt TIMESTAMP NULL,
  sentAt TIMESTAMP NULL,
  failureReason TEXT,
  relatedEntityType VARCHAR(50),
  relatedEntityId VARCHAR(64),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_retry (nextRetryAt),
  INDEX idx_created (createdAt)
);

CREATE TABLE emailTemplates (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  subject VARCHAR(500) NOT NULL,
  htmlContent LONGTEXT NOT NULL,
  plainTextContent LONGTEXT,
  variables JSON,
  isActive BOOLEAN DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE emailDeliveryEvents (
  id VARCHAR(64) PRIMARY KEY,
  queueId VARCHAR(64) NOT NULL,
  eventType ENUM('sent', 'opened', 'clicked', 'bounced', 'complained'),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSON,
  INDEX idx_queue (queueId),
  INDEX idx_type (eventType)
);
```

**New API Router** (`server/routers/emailService.ts`):
```typescript
emailService.queueEmail()             // Add to queue
emailService.sendImmediately()        // Send now (override queue)
emailService.getQueueStatus()         // Queue monitoring
emailService.getEmailTemplates()      // List templates
emailService.createTemplate()         // New template
emailService.updateTemplate()         // Edit template
emailService.previewEmail()           // Template preview with variables
emailService.resendEmail()            // Retry failed send
```

**Enhanced Email Service** (`server/services/emailService.ts`):
```typescript
- sendEmailWithRetry(to, subject, html, metadata)
- processEmailQueue()                 // Background job
- sendBulkEmails(recipients, template, variables)
- attachReceiptPdf(emailContent, receiptId)
- trackEmailEvents(queueId, event)
```

**Frontend Component** (`client/src/components/EmailTemplateBuilder.tsx` - new):
```typescript
- Template selector dropdown
- Variable lookup/suggestions
- Rich text editor (or HTML editor)
- Preview pane
- Send test email
- Schedule send
```

---

### 3.2 SMS Service Integration

**Platform Options**:
- **Africa's Talking**: Popular in Kenya, good for M-Pesa integration
- **Twilio**: Expensive but reliable
- **Safaricom (direct API)**: Requires integration

**Recommendation**: Africa's Talking for Kenya market

**Location**: `server/services/smsService.ts` (new)

**Features**:
```
✓ SMS Sending
  - Single SMS
  - Bulk SMS
  - Scheduled SMS
  - Retry on failure

✓ Message Types
  - Payment confirmation (amount, reference)
  - Invoice reminder (amount due, date)
  - Receipt notification (receipt number)
  - Payment reminder (overdue)
  - OTP/2FA messages

✓ Delivery Tracking
  - Delivery status (sent/failed/queued)
  - Delivery timestamp
  - Error codes mapping

✓ Opt-in Management
  - Customer consent tracking
  - Unsubscribe handling
  - DND (Do Not Disturb) compliance
```

**Database Schema**:
```sql
CREATE TABLE smsQueue (
  id VARCHAR(64) PRIMARY KEY,
  phoneNumber VARCHAR(20) NOT NULL,
  message VARCHAR(1000) NOT NULL,
  status ENUM('pending', 'sent', 'failed', 'queued') DEFAULT 'pending',
  provider ENUM('africa_talking', 'twilio', 'safaricom') DEFAULT 'africa_talking',
  providerReference VARCHAR(255),
  deliveryStatus VARCHAR(50),
  attemptCount INT DEFAULT 0,
  maxAttempts INT DEFAULT 3,
  nextRetryAt TIMESTAMP NULL,
  sentAt TIMESTAMP NULL,
  deliveredAt TIMESTAMP NULL,
  failureReason TEXT,
  relatedEntityType VARCHAR(50),
  relatedEntityId VARCHAR(64),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phoneNumber),
  INDEX idx_status (status),
  INDEX idx_retry (nextRetryAt)
);

CREATE TABLE smsCustomerPreferences (
  id VARCHAR(64) PRIMARY KEY,
  clientId VARCHAR(64) UNIQUE NOT NULL,
  phoneNumber VARCHAR(20),
  receivePaymentConfirmation BOOLEAN DEFAULT 1,
  receiveInvoiceReminders BOOLEAN DEFAULT 1,
  receiveReceiptNotification BOOLEAN DEFAULT 1,
  receiveOverdueReminders BOOLEAN DEFAULT 1,
  consentOptInAt TIMESTAMP,
  consentOptOutAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Dependencies to Install**:
```json
"africastalking": "^1.3.0"
```

**API Router** (`server/routers/smsService.ts` - new):
```typescript
sms.sendSms()                        // Send single SMS
sms.queueSms()                       // Add to queue
sms.bulkSendSms()                    // Bulk send
sms.getSmsStatus()                   // Query delivery status
sms.getQueueStatus()                 // Queue monitoring
sms.getCustomerPreferences()         // SMS opt-in status
sms.updateCustomerPreferences()      // Update opt-in/out
```

**SMS Service Methods** (`server/services/smsService.ts`):
```typescript
- initializeClient()
- sendSms(phone, message)
- queueSms(phone, message, metadata)
- processSmsQueue()                  // Background job
- handleDeliveryCallback(data)       // Webhook
- optOutCustomer(phone, type)
- getDeliveryStatus(providerRef)
```

---

## Part 4: 24/7 Scheduler Monitoring System

### 4.1 Job Scheduler & Monitoring

**Current State**:
- `cron` library already installed
- Basic job routers exist (invoiceReminders, recurringInvoices)
- Need centralized monitoring system

**To Implement**:

```
✓ Job Scheduler Dashboard
  - List all scheduled jobs
  - Real-time execution status
  - Last run timestamp & duration
  - Next scheduled run
  - Failure alerts

✓ Job Management
  - Enable/disable jobs
  - Manual job triggers
  - Retry failed jobs
  - View job logs

✓ Monitoring & Alerts
  - Job execution tracking
  - Failure notifications (email/SMS)
  - Heartbeat monitoring (job ran within X hours)
  - Performance metrics (avg duration, success rate)

✓ Job Types
  - Recurring invoice generation
  - Payment reminders
  - Overdue notifications
  - Email queue processor
  - SMS queue processor
  - Cleanup jobs (old logs, temp files)
  - Daily reconciliation reports
  - Subscription renewal checks
```

**Database Schema**:
```sql
CREATE TABLE scheduledJobs (
  id VARCHAR(64) PRIMARY KEY,
  jobName VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255),
  jobType ENUM('recurring_invoice', 'payment_reminder', 'overdue_notification', 
               'email_queue', 'sms_queue', 'cleanup', 'reconciliation', 'subscription_renewal', 'custom'),
  cronExpression VARCHAR(50) NOT NULL,
  handler VARCHAR(255) NOT NULL,
  isActive BOOLEAN DEFAULT 1,
  isManualOnly BOOLEAN DEFAULT 0,
  lastRunAt TIMESTAMP NULL,
  lastRunStatus ENUM('success', 'failed', 'partial', 'skipped') NULL,
  lastRunDuration INT NULL,
  lastFailureReason TEXT,
  nextScheduledRun TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdBy VARCHAR(64),
  INDEX idx_active (isActive),
  INDEX idx_next_run (nextScheduledRun)
);

CREATE TABLE jobExecutionLogs (
  id VARCHAR(64) PRIMARY KEY,
  jobId VARCHAR(64) NOT NULL,
  startTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  endTime TIMESTAMP NULL,
  duration INT,
  status ENUM('running', 'success', 'failed', 'partial', 'cancelled') DEFAULT 'running',
  itemsProcessed INT DEFAULT 0,
  itemsFailed INT DEFAULT 0,
  errorMessage TEXT,
  stdout LONGTEXT,
  stderr LONGTEXT,
  metadata JSON,
  INDEX idx_job (jobId),
  INDEX idx_status (status),
  INDEX idx_start_time (startTime)
);

CREATE TABLE jobAlertRules (
  id VARCHAR(64) PRIMARY KEY,
  jobId VARCHAR(64) NOT NULL,
  alertType ENUM('failure', 'timeout', 'incomplete', 'no_execution') NOT NULL,
  threshold INT,
  action ENUM('email', 'sms', 'both', 'webhook'),
  recipients JSON,
  isActive BOOLEAN DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_job (jobId)
);

CREATE TABLE jobHeartbeat (
  id VARCHAR(64) PRIMARY KEY,
  jobId VARCHAR(64) UNIQUE NOT NULL,
  lastHeartbeatAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expectedHeartbeatInterval INT,
  isHealthy BOOLEAN DEFAULT 1,
  updatedAt TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Job Scheduler Service** (`server/services/jobScheduler.ts` - new):

```typescript
class JobScheduler {
  // Initialization
  initializeScheduler()               // Start all active jobs
  registerJob(jobConfig)              // Add job at runtime
  unregisterJob(jobId)                // Stop job

  // Execution
  executeJob(jobId)                   // Manual trigger
  getJobStatus(jobId)                 // Current status
  getJobHistory(jobId)                // Last N executions

  // Monitoring
  checkJobHealth()                    // Background: monitor heartbeat
  sendAlerts()                        // Background: process alerts
  generateHealthReport()              // Daily health check

  // Utilities
  logJobExecution(jobId, result)
  calculateNextRun(cronExpression)    // When will job run again?
  retryFailedJob(logId)
}
```

**Predefined Jobs** (`server/jobs/`):

1. **invoiceReminders.ts** (exists, enhance)
   ```typescript
   // Send reminders for invoices due in 7 days
   // Send overdue reminders for invoices past due
   // Update invoice aging
   ```

2. **recurringInvoicesJob.ts** (exists, enhance)
   ```typescript
   // Generate new invoices from recurring billing configs
   // Update subscription status
   // Process subscription renewals
   ```

3. **emailQueueProcessor.ts** (new)
   ```typescript
   // Process pending emails in queue
   // Retry failed emails (with exponential backoff)
   // Track delivery status
   ```

4. **smsQueueProcessor.ts** (new)
   ```typescript
   // Process pending SMS in queue
   // Retry failed SMS
   // Update delivery status
   ```

5. **cleanupJob.ts** (new)
   ```typescript
   // Archive old logs (>90 days)
   // Delete temporary files
   // Clean up orphaned records
   ```

6. **reconciliationJob.ts** (new)
   ```typescript
   // Daily settlement reconciliation
   // Match bank transactions to payments
   // Generate variance reports
   // Alert on discrepancies
   ```

**Monitoring Frontend Component** (`client/src/pages/JobMonitoring.tsx` - new):

```typescript
- Job list table with status indicators
- Real-time status updates (WebSocket)
- Execution history timeline
- Log viewer with filtering
- Manual trigger buttons
- Job configuration panel
- Alert rules management
- Health metrics dashboard
  - Average execution time
  - Success rate %
  - Failure trend
  - SLA compliance
```

**API Router** (`server/routers/jobMonitoring.ts` - new):

```typescript
jobMonitoring.listJobs()              // Active scheduled jobs
jobMonitoring.getJobDetails()         // Job config + history
jobMonitoring.getExecutionHistory()   // Last N runs
jobMonitoring.triggerJobManually()    // Execute now
jobMonitoring.updateJobConfig()       // Enable/disable/cron
jobMonitoring.getJobHealthReport()    // Overall health
jobMonitoring.getAlertRules()         // Current alerts
jobMonitoring.updateAlertRules()      // Configure alerts
jobMonitoring.retryJob()              // Retry failed execution
jobMonitoring.getHealthMetrics()      // Dashboard metrics
```

---

## Implementation Sequence & Timeline

### Phase 1: Database & Infrastructure (Days 1-2)
- [ ] Create database migrations for all new tables
- [ ] Set up new service files (stripe, mpesa, sms, emailService, jobScheduler)
- [ ] Configure environment variables

### Phase 2: Payment Gateways (Days 3-6)
- [ ] Stripe integration (service + router + UI component)
- [ ] M-Pesa integration (service + router + UI component)
- [ ] Testing with sandbox credentials
- [ ] Webhook handlers

### Phase 3: Communication Services (Days 7-10)
- [ ] Email service enhancement (queue + templates + tracking)
- [ ] SMS service integration (Africa's Talking)
- [ ] Background job processors
- [ ] Admin templates manager UI

### Phase 4: Billing Frontend (Days 11-14)
- [ ] Billing dashboard implementation
- [ ] Receipt management enhancements
- [ ] Payment history views
- [ ] Analytics & reports

### Phase 5: Job Monitoring (Days 15-17)
- [ ] Job scheduler service
- [ ] Scheduler monitoring dashboard
- [ ] Health metrics & alerting
- [ ] Job configuration UI

### Phase 6: Password Management & Integration (Days 18-19)
- [ ] Enhanced password component
- [ ] Password history & policies
- [ ] Integration testing
- [ ] Documentation

### Phase 7: Testing & Deployment (Days 20-21)
- [ ] End-to-end testing
- [ ] Load testing payment gateways
- [ ] Docker deployment
- [ ] Production migration

---

## Dependencies to Add

```json
{
  "stripe": "^14.0.0",
  "africastalking": "^1.3.0",
  "bull": "^4.11.5",
  "bull-board": "^6.1.6",
  "@stripe/react-stripe-js": "^2.3.0",
  "@stripe/stripe-js": "^2.2.0"
}
```

**Already Installed**:
- @tanstack/react-query (polling for job status)
- recharts (dashboards & charts)
- jspdf + jspdf-autotable (PDF generation)
- exceljs (Excel export)
- nodemailer (email)
- cron (scheduling)
- axios (HTTP)

---

## Security Considerations

1. **Payment Gateways**
   - Stripe/M-Pesa API keys in .env, never in code
   - Webhook signature verification mandatory
   - PCI compliance (no card data storage, use tokenization)
   - HTTPS only for payment forms

2. **Email/SMS**
   - Rate limiting to prevent spam
   - Unsubscribe/opt-out mechanisms
   - Consent tracking
   - Sensitive data masking in logs

3. **Job Scheduler**
   - API key for manual triggers
   - Audit logging all job executions
   - Alert on unauthorized access attempts
   - Job execution timeout

4. **Database**
   - Sensitive payment data encrypted at rest
   - Regular backups before payment processing
   - Audit trail for all payment modifications

---

## Success Criteria

- ✅ Payment gateways process live transactions
- ✅ All scheduled jobs execute reliably 24/7
- ✅ Email/SMS delivery >95% success rate
- ✅ Job monitoring dashboard reflects real-time status
- ✅ Password system enforces security policies
- ✅ Billing dashboard shows accurate metrics
- ✅ Zero unhandled exceptions in production logs
- ✅ All features work in Docker environment
- ✅ Performance tests pass (sub-100ms API calls)

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Payment gateway API downtime | Implement queue system, retry logic, fallback UI |
| SMS/Email delivery failures | Queue system, retry with exponential backoff, alerts |
| Data loss in job processing | Transaction-based processing, idempotent operations |
| Security vulnerabilities | API key rotation, regular security audits, encryption |
| Performance degradation | Index optimization, caching, async job processing |

---

## Post-Implementation Tasks

1. **Documentation**
   - API endpoint documentation (Payment, SMS, Email)
   - Admin guide for job monitoring
   - Customer guide for payment methods

2. **Monitoring**
   - Set up APM (Application Performance Monitoring)
   - Payment transaction monitoring dashboard
   - Email/SMS delivery metrics

3. **Staff Training**
   - How to troubleshoot payment failures
   - Job dashboard usage
   - Template customization

---

## Questions for Stakeholders

1. **Payment Priority**: Stripe (international), M-Pesa (local), or both equally?
2. **SMS Provider**: Africa's Talking (local) or Twilio (international support)?
3. **Compliance**: Need PCI-DSS certification? GDPR considerations?
4. **Billing Frequency**: Monthly? Quarterly? Both?
5. **Alert Channels**: Email only or Slack/Teams integration too?
6. **Job Monitoring**: Web dashboard only or SMS alerts on critical failures?

---

**Document Version**: 1.0  
**Last Updated**: March 10, 2026  
**Author**: Implementation Agent  
**Status**: Ready for Development Phase 1
