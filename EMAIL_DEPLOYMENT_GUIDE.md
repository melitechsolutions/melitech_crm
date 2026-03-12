# Email Deployment & SMTP Configuration Guide

## Overview

Melitech CRM now includes a robust email system with:
- **SMTP Support** - Configurable email sending via any SMTP provider
- **Email Queue** - Reliable email delivery with automatic retry logic
- **Overdue Reminders** - Automated payment reminders for past-due invoices
- **Email Logging** - Full audit trail of all sent/failed emails
- **Background Scheduler** - Automated jobs for email processing and reminders

## Prerequisites

- SMTP server access (Gmail, SendGrid, Office 365, custom mail server, etc.)
- SMTP credentials (host, port, username, password)
- A "From" email address for system notifications

## Environment Configuration

### Required Environment Variables

Create or update your `.env` file with the following:

```env
# ============================================================================
# SMTP EMAIL CONFIGURATION
# ============================================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@melitech.local
SMTP_SECURE=false

# ============================================================================
# EMAIL PREFERENCES (Optional)
# ============================================================================
EMAIL_QUEUE_ENABLED=true
EMAIL_QUEUE_RETRIES=3
EMAIL_QUEUE_RETRY_DELAY_MS=300000
OVERDUE_REMINDER_ENABLED=true
OVERDUE_REMINDER_HOUR=9
```

### Optional Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `EMAIL_QUEUE_ENABLED` | `true` | Enable/disable email queue system |
| `EMAIL_QUEUE_RETRIES` | `3` | Max retry attempts for failed emails |
| `EMAIL_QUEUE_RETRY_DELAY_MS` | `300000` | Initial delay (ms) before retry (uses exponential backoff) |
| `OVERDUE_REMINDER_ENABLED` | `true` | Enable/disable automatic overdue reminders |
| `OVERDUE_REMINDER_HOUR` | `9` | Hour of day to send reminders (0-23) |

## SMTP Provider Setup Guides

### Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Google account
2. **Create an App Password**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Navigate to "App passwords"
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password

3. **Configure Environment Variables**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM=your-email@gmail.com
SMTP_SECURE=false
```

### SendGrid (Production Recommended)

1. **Create SendGrid Account** at [sendgrid.com](https://sendgrid.com)
2. **Create API Key** in Settings → API Keys
3. **Configure Environment Variables**:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-api-key-here
SMTP_FROM=noreply@yourdomain.com
SMTP_SECURE=false
```

### Office 365

1. **Get SMTP Settings**:
   - Host: smtp.office365.com
   - Port: 587
   - Use Modern Authentication

2. **Configure Environment Variables**:
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@company.onmicrosoft.com
SMTP_PASS=your-password
SMTP_FROM=noreply@company.com
SMTP_SECURE=false
```

### Custom Mail Server

If using your own mail server:

```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=mailuser
SMTP_PASS=password
SMTP_FROM=noreply@yourdomain.com
SMTP_SECURE=false
```

## Deployment Steps

### 1. Database Migration

Run the database migration to create email queue tables:

```bash
npm run db:push
```

This creates:
- `emailQueue` - Queue of pending emails
- `emailLog` - Audit trail of sent/failed emails
- `invoiceReminders` - Tracking of overdue reminders

### 2. Update Application Configuration

Update your `server/_core/index.ts` to initialize the scheduler:

```typescript
import { initializeSchedulers } from "./scheduler";

// ... other initialization code ...

// Start background job scheduler
const { emailQueueJob, overdueRemindersJob } = initializeSchedulers();
```

### 3. Add Email Queue Router to tRPC

Update `server/routers/index.ts`:

```typescript
import { emailQueueRouter } from "./emailQueue";
import { paymentRemindersRouter } from "./paymentReminders";

export const appRouter = router({
  // ... existing routers ...
  emailQueue: emailQueueRouter,
  paymentReminders: paymentRemindersRouter,
});
```

### 4. Test SMTP Connection

Run a quick test:

```bash
# Via Node.js
npx tsx -e "
import { sendEmail } from './server/_core/mail.js';
await sendEmail({
  to: 'your-test-email@example.com',
  subject: 'Melitech CRM - SMTP Test',
  html: '<h1>SMTP Configuration Successful!</h1>'
});
"
```

### 5. Monitor Email Queue

Check email queue status via admin dashboard:

```
Admin Panel → Email Management → Queue Status
- Pending emails
- Failed emails
- Retry statistics
```

## Features

### Email Queue System

**Automatic Retry Logic**:
- Attempt 1: Immediate send
- Attempt 2: After 5 minutes
- Attempt 3: After 30 minutes  
- Attempt 4: After 24 hours (max retries = 3 → fail after 3rd attempt)

**Queue Management**:
- Browse pending/failed emails
- Manually retry failed emails
- View detailed error messages for failures
- Export email logs for auditing

### Overdue Invoice Reminders

**Automated Reminders at Multiple Thresholds**:
- 1 day overdue
- 3 days overdue
- 7 days overdue
- 14 days overdue
- 30 days overdue

**Smart Reminder Logic**:
- Never sends duplicate reminders for same invoice/threshold
- Respects client email address availability
- Integrates with email queue for reliability
- Logs all reminder sends for audit trail

**Manual Reminders**:
```typescript
// Trigger reminder manually via API
await paymentReminders.sendReminder.mutate({
  invoiceId: 'inv-123',
  reminderType: 'overdue_7days'
});
```

### Background Jobs

**Email Queue Processor** - Runs every 5 minutes
- Processes pending emails from queue
- Handles retries with exponential backoff
- Logs all send attempts
- Updates email status

**Overdue Reminder Checker** - Runs daily at 09:00 AM
- Identifies all overdue invoices
- Checks reminder history to avoid duplicates
- Queues reminder emails for each applicable threshold
- Reports statistics on reminders sent

## API Endpoints

### Email Queue Management

```typescript
// Get queue status
GET /api/trpc/emailQueue.getStatus

// Get queue entries (paginated)
GET /api/trpc/emailQueue.getQueue?status=pending&limit=50&offset=0

// Process queue manually (admin)
POST /api/trpc/emailQueue.processQueue

// Retry specific email (admin)
POST /api/trpc/emailQueue.retryEmail
{ emailId: 'queue-123' }

// Get email logs
GET /api/trpc/emailQueue.getLogs?status=sent&limit=100
```

### Payment Reminders

```typescript
// Get overdue invoices
GET /api/trpc/paymentReminders.getOverdueInvoices?daysOverdue=7

// Send reminder for invoice
POST /api/trpc/paymentReminders.sendReminder
{
  invoiceId: 'inv-123',
  reminderType: 'overdue_7days'
}

// Get reminder history
GET /api/trpc/paymentReminders.getReminderHistory?invoiceId=inv-123

// Process all overdue reminders (admin)
POST /api/trpc/paymentReminders.processOverdueReminders
```

## Monitoring & Troubleshooting

### Check Email Queue Status

```bash
# Via API
curl http://localhost:3000/api/trpc/emailQueue.getStatus

# Expected response:
{
  "pending": 5,
  "sent": 342,
  "failed": 2,
  "retrying": 1
}
```

### View Failed Emails

```bash
# Get failed queue entries
curl "http://localhost:3000/api/trpc/emailQueue.getQueue?status=failed"
```

### Common Issues

**Issue: "SMTP_HOST and SMTP_PORT must be configured"**
- Solution: Verify environment variables are set
- Check `.env` file has `SMTP_HOST` and `SMTP_PORT`

**Issue: "Authentication failed"**
- Solution: Verify SMTP credentials
- For Gmail: Ensure you're using App Password, not regular password
- For SendGrid: Verify API key is correct

**Issue: "Connection timeout"**
- Solution: Verify SMTP server is accessible from your network
- Check firewall rules allow outbound SMTP connections
- Verify port is correct (usually 587 for TLS)

**Issue: "Emails in queue but not sending"**
- Solution: Verify scheduler is running
- Check server logs: `[SCHEDULER] Email queue processor...`
- Manually trigger: `POST /api/trpc/emailQueue.processQueue`

### View Logs

Emails are logged to:
- Database: `emailLog` table (all sends)
- Console: `[EMAIL QUEUE]` and `[SCHEDULER]` prefixed messages
- Application logs: Check `server.log` or deployment logs

## Performance Considerations

**Email Queue Processing**:
- Runs every 5 minutes (configurable)
- Processes up to 50 emails per run
- Uses exponential backoff to avoid overwhelming failing servers
- Recommended: Monitor system load during peak email times

**Overdue Reminder Checking**:
- Runs once daily at 09:00 AM (configurable)
- Queries all overdue invoices
- Checks reminder history for each invoice
- If 1000+ invoices, may take several minutes

**Database**:
- Add indexes on `emailQueue(status, nextRetryAt)`
- Add indexes on `invoiceReminders(invoiceId, reminderType)`
- Archive old `emailLog` entries monthly for performance

## Production Deployment Checklist

- [ ] SMTP credentials configured in environment
- [ ] SMTP_FROM email address is valid for your domain
- [ ] Database migration run (`npm run db:push`)
- [ ] Email queue router registered in tRPC
- [ ] Scheduler initialization code added to server startup
- [ ] Test SMTP connection successful
- [ ] Email queue accessible via admin dashboard
- [ ] Overdue reminders enabled in environment
- [ ] Scheduled job processor confirmed running in logs
- [ ] Email logs being written to database
- [ ] Monitoring/alerting set up for failed emails
- [ ] Backup plan for email delivery failures

## Security Best Practices

1. **Never Commit Credentials**
   - Store SMTP password in `.env` (not version control)
   - Use `.env.example` with placeholder values

2. **Use App Passwords for Gmail**
   - Never use your full Gmail password
   - Create dedicated app passwords per service

3. **Enable TLS**
   - Set `SMTP_SECURE=false` for port 587 (STARTTLS)
   - Set `SMTP_SECURE=true` for port 465 (implicit TLS)

4. **Restrict Email Queue Access**
   - Only admins can view/manage email queue
   - Regular users can only trigger reminders
   - All actions logged to audit trail

5. **Audit Email Logs**
   - Regularly review `emailLog` table
   - Monitor for unusual patterns
   - Archive old logs for compliance

## Support & Additional Resources

- SMTP Configuration: [nodemailer.com/smtp](https://nodemailer.com/smtp/)
- SendGrid Setup: [sendgrid.com/docs](https://sendgrid.com/docs/)
- Gmail App Passwords: [support.google.com](https://support.google.com/accounts/answer/185833)
- Email Best Practices: [sendgrid.com/resource/email-marketing-guide](https://sendgrid.com/resource/email-marketing-guide/)

---

**Last Updated**: February 26, 2026  
**Version**: 1.0  
**Status**: Production Ready
