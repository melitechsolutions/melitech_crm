import { router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { clients, invoices, estimates, payments } from "../../drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import * as db from "../db";
import { sendEmail } from "../_core/mail";

// Email templates with HTML and text versions
const emailTemplates = {
  invoice: (clientName: string, invoiceNumber: string, amount: number, dueDate: string, companyName: string = "Melitech Solutions") => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #1a5490; margin-bottom: 20px;">Invoice ${invoiceNumber}</h2>
        <p>Dear ${clientName},</p>
        <p>Please find below the details of your invoice:</p>
        <div style="background-color: #f5f5f5; border-left: 4px solid #1a5490; padding: 15px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
          <p style="margin: 5px 0;"><strong>Amount:</strong> KES ${amount.toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Due Date:</strong> ${dueDate}</p>
        </div>
        <p>Thank you for your business!</p>
        <p>Best regards,<br><strong>${companyName}</strong></p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">This is an automated email. Please do not reply directly.</p>
      </div>
    `;
    const text = `Invoice ${invoiceNumber}\n\nDear ${clientName},\n\nPlease find below the details of your invoice:\n\nInvoice Number: ${invoiceNumber}\nAmount: KES ${amount.toLocaleString()}\nDue Date: ${dueDate}\n\nThank you for your business!\n\nBest regards,\n${companyName}`;
    return {
      subject: `Invoice ${invoiceNumber} from ${companyName}`,
      html,
      text,
    };
  },
  estimate: (clientName: string, estimateNumber: string, amount: number, validUntil: string, companyName: string = "Melitech Solutions") => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #1a5490; margin-bottom: 20px;">Estimate ${estimateNumber}</h2>
        <p>Dear ${clientName},</p>
        <p>Please find below the details of your estimate:</p>
        <div style="background-color: #f5f5f5; border-left: 4px solid #1a5490; padding: 15px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Estimate Number:</strong> ${estimateNumber}</p>
          <p style="margin: 5px 0;"><strong>Amount:</strong> KES ${amount.toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Valid Until:</strong> ${validUntil}</p>
        </div>
        <p>Please let us know if you have any questions or need any clarifications.</p>
        <p>Best regards,<br><strong>${companyName}</strong></p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">This is an automated email. Please do not reply directly.</p>
      </div>
    `;
    const text = `Estimate ${estimateNumber}\n\nDear ${clientName},\n\nPlease find below the details of your estimate:\n\nEstimate Number: ${estimateNumber}\nAmount: KES ${amount.toLocaleString()}\nValid Until: ${validUntil}\n\nPlease let us know if you have any questions.\n\nBest regards,\n${companyName}`;
    return {
      subject: `Estimate ${estimateNumber} from ${companyName}`,
      html,
      text,
    };
  },
  paymentReminder: (clientName: string, invoiceNumber: string, amount: number, daysOverdue: number, dueDate: string, companyName: string = "Melitech Solutions") => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #d32f2f; margin-bottom: 20px;">Payment Reminder - Invoice Overdue</h2>
        <p>Dear ${clientName},</p>
        <p style="color: #d32f2f; font-weight: bold;">This invoice is <strong>${daysOverdue} days overdue</strong>.</p>
        <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
          <p style="margin: 5px 0;"><strong>Amount Due:</strong> KES ${amount.toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Original Due Date:</strong> ${dueDate}</p>
          <p style="margin: 5px 0;"><strong>Days Overdue:</strong> ${daysOverdue}</p>
        </div>
        <p>Please arrange payment at your earliest convenience. If you have already sent the payment, please disregard this notice.</p>
        <p>Thank you,<br><strong>${companyName}</strong></p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">This is an automated reminder. Please do not reply directly.</p>
      </div>
    `;
    const text = `Payment Reminder - Invoice Overdue\n\nDear ${clientName},\n\nThis invoice is ${daysOverdue} days overdue.\n\nInvoice Number: ${invoiceNumber}\nAmount Due: KES ${amount.toLocaleString()}\nOriginal Due Date: ${dueDate}\nDays Overdue: ${daysOverdue}\n\nPlease arrange payment at your earliest convenience.\n\nThank you,\n${companyName}`;
    return {
      subject: `Payment Reminder: Invoice ${invoiceNumber} is ${daysOverdue} days overdue`,
      html,
      text,
    };
  },
  paymentReceived: (clientName: string, invoiceNumber: string, amount: number, companyName: string = "Melitech Solutions") => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #4CAF50; margin-bottom: 20px;">Payment Received - Thank You!</h2>
        <p>Dear ${clientName},</p>
        <p>Thank you for your payment of <strong>KES ${amount.toLocaleString()}</strong> for invoice <strong>${invoiceNumber}</strong>.</p>
        <div style="background-color: #f1f8e9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
          <p style="margin: 5px 0;"><strong>Amount Received:</strong> KES ${amount.toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Your account is now up to date. We appreciate your prompt payment.</p>
        <p>Best regards,<br><strong>${companyName}</strong></p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">This is an automated email. Please do not reply directly.</p>
      </div>
    `;
    const text = `Payment Received - Thank You!\n\nDear ${clientName},\n\nThank you for your payment of KES ${amount.toLocaleString()} for invoice ${invoiceNumber}.\n\nInvoice Number: ${invoiceNumber}\nAmount Received: KES ${amount.toLocaleString()}\nDate: ${new Date().toLocaleDateString()}\n\nYour account is now up to date.\n\nBest regards,\n${companyName}`;
    return {
      subject: `Payment Received for Invoice ${invoiceNumber}`,
      html,
      text,
    };
  },
};

export const emailRouter = router({
  // Send invoice to client
  sendInvoice: createFeatureRestrictedProcedure("communications:email")
    .input(z.object({
      invoiceId: z.string(),
      recipientEmail: z.string().email(),
      message: z.string().max(1000).optional(),
      attachPDF: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Get invoice and client details
      const invoiceResult = await database
        .select()
        .from(invoices)
        .where(eq(invoices.id, input.invoiceId))
        .limit(1);

      if (!invoiceResult.length) {
        throw new Error("Invoice not found");
      }

      const invoice = invoiceResult[0];
      const clientResult = await database
        .select()
        .from(clients)
        .where(eq(clients.id, invoice.clientId))
        .limit(1);

      if (!clientResult.length) {
        throw new Error("Client not found");
      }

      const client = clientResult[0];
      const template = emailTemplates.invoice(
        client.contactPerson || client.companyName,
        invoice.invoiceNumber,
        invoice.total || 0,
        new Date(invoice.dueDate).toLocaleDateString(),
        process.env.COMPANY_NAME || "Melitech Solutions"
      );

      // Send email through SMTP
      const emailResult = await sendEmail({
        to: input.recipientEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (!emailResult.success) {
        throw new Error(`Failed to send email: ${emailResult.error}`);
      }

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "invoice_sent",
        entityType: "invoice",
        entityId: input.invoiceId,
        description: `Sent invoice ${invoice.invoiceNumber} to ${input.recipientEmail}`,
      });

      return {
        success: true,
        message: `Invoice sent to ${input.recipientEmail}`,
        messageId: emailResult.messageId,
      };
    }),

  // Send estimate to client
  sendEstimate: createFeatureRestrictedProcedure("communications:email")
    .input(z.object({
      estimateId: z.string(),
      recipientEmail: z.string().email(),
      message: z.string().max(1000).optional(),
      attachPDF: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Get estimate and client details
      const estimateResult = await database
        .select()
        .from(estimates)
        .where(eq(estimates.id, input.estimateId))
        .limit(1);

      if (!estimateResult.length) {
        throw new Error("Estimate not found");
      }

      const estimate = estimateResult[0];
      const clientResult = await database
        .select()
        .from(clients)
        .where(eq(clients.id, estimate.clientId))
        .limit(1);

      if (!clientResult.length) {
        throw new Error("Client not found");
      }

      const client = clientResult[0];
      const template = emailTemplates.estimate(
        client.contactPerson || client.companyName,
        estimate.estimateNumber,
        estimate.total || 0,
        new Date(estimate.expiryDate || new Date()).toLocaleDateString(),
        process.env.COMPANY_NAME || "Melitech Solutions"
      );

      // Send email through SMTP
      const emailResult = await sendEmail({
        to: input.recipientEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (!emailResult.success) {
        throw new Error(`Failed to send email: ${emailResult.error}`);
      }

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "estimate_sent",
        entityType: "estimate",
        entityId: input.estimateId,
        description: `Sent estimate ${estimate.estimateNumber} to ${input.recipientEmail}`,
      });

      return {
        success: true,
        message: `Estimate sent to ${input.recipientEmail}`,
        messageId: emailResult.messageId,
      };
    }),

  // Send payment reminder
  sendPaymentReminder: createFeatureRestrictedProcedure("communications:email")
    .input(z.object({
      invoiceId: z.string(),
      recipientEmail: z.string().email(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Get invoice and client details
      const invoiceResult = await database
        .select()
        .from(invoices)
        .where(eq(invoices.id, input.invoiceId))
        .limit(1);

      if (!invoiceResult.length) {
        throw new Error("Invoice not found");
      }

      const invoice = invoiceResult[0];
      const clientResult = await database
        .select()
        .from(clients)
        .where(eq(clients.id, invoice.clientId))
        .limit(1);

      if (!clientResult.length) {
        throw new Error("Client not found");
      }

      const client = clientResult[0];
      const daysOverdue = Math.floor(
        (new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      const template = emailTemplates.paymentReminder(
        client.contactPerson || client.companyName,
        invoice.invoiceNumber,
        invoice.total || 0,
        Math.max(daysOverdue, 0),
        new Date(invoice.dueDate).toLocaleDateString(),
        process.env.COMPANY_NAME || "Melitech Solutions"
      );

      // Send email through SMTP
      const emailResult = await sendEmail({
        to: input.recipientEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (!emailResult.success) {
        throw new Error(`Failed to send email: ${emailResult.error}`);
      }

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "payment_reminder_sent",
        entityType: "invoice",
        entityId: input.invoiceId,
        description: `Sent payment reminder for invoice ${invoice.invoiceNumber} to ${input.recipientEmail}`,
      });

      return {
        success: true,
        message: `Payment reminder sent to ${input.recipientEmail}`,
        messageId: emailResult.messageId,
      };
    }),

  // Send payment received notification
  sendPaymentReceivedNotification: createFeatureRestrictedProcedure("communications:email")
    .input(z.object({
      invoiceId: z.string(),
      recipientEmail: z.string().email(),
      paymentAmount: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Get invoice and client details
      const invoiceResult = await database
        .select()
        .from(invoices)
        .where(eq(invoices.id, input.invoiceId))
        .limit(1);

      if (!invoiceResult.length) {
        throw new Error("Invoice not found");
      }

      const invoice = invoiceResult[0];
      const clientResult = await database
        .select()
        .from(clients)
        .where(eq(clients.id, invoice.clientId))
        .limit(1);

      if (!clientResult.length) {
        throw new Error("Client not found");
      }

      const client = clientResult[0];
      const template = emailTemplates.paymentReceived(
        client.contactPerson || client.companyName,
        invoice.invoiceNumber,
        input.paymentAmount,
        process.env.COMPANY_NAME || "Melitech Solutions"
      );

      // Send email through SMTP
      const emailResult = await sendEmail({
        to: input.recipientEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (!emailResult.success) {
        throw new Error(`Failed to send email: ${emailResult.error}`);
      }

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "payment_notification_sent",
        entityType: "invoice",
        entityId: input.invoiceId,
        description: `Sent payment received notification for invoice ${invoice.invoiceNumber} to ${input.recipientEmail}`,
      });

      return {
        success: true,
        message: `Payment notification sent to ${input.recipientEmail}`,
        messageId: emailResult.messageId,
      };
    }),

  // Batch send invoices
  batchSendInvoices: createFeatureRestrictedProcedure("communications:email")
    .input(z.object({
      invoiceIds: z.array(z.string()).min(1),
      message: z.string().max(1000).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const results = {
        sent: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const invoiceId of input.invoiceIds) {
        try {
          const invoiceResult = await database
            .select()
            .from(invoices)
            .where(eq(invoices.id, invoiceId))
            .limit(1);

          if (!invoiceResult.length) {
            results.failed++;
            results.errors.push(`Invoice ${invoiceId} not found`);
            continue;
          }

          const invoice = invoiceResult[0];
          const clientResult = await database
            .select()
            .from(clients)
            .where(eq(clients.id, invoice.clientId))
            .limit(1);

          if (!clientResult.length || !clientResult[0].email) {
            results.failed++;
            results.errors.push(`No email found for invoice ${invoice.invoiceNumber}`);
            continue;
          }

          const client = clientResult[0];
          const template = emailTemplates.invoice(
            client.contactPerson || client.companyName,
            invoice.invoiceNumber,
            invoice.total || 0,
            new Date(invoice.dueDate).toLocaleDateString(),
            process.env.COMPANY_NAME || "Melitech Solutions"
          );

          // Send email through SMTP
          const emailResult = await sendEmail({
            to: client.email,
            subject: template.subject,
            html: template.html,
            text: template.text,
          });

          if (!emailResult.success) {
            results.failed++;
            results.errors.push(`Failed to send invoice ${invoice.invoiceNumber}: ${emailResult.error}`);
            continue;
          }

          // Log activity
          await db.logActivity({
            userId: ctx.user.id,
            action: "invoice_sent",
            entityType: "invoice",
            entityId: invoiceId,
            description: `Batch sent invoice ${invoice.invoiceNumber} to ${client.email}`,
          });

          results.sent++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Error sending invoice ${invoiceId}: ${error}`);
        }
      }

      return {
        ...results,
        message: `Sent ${results.sent} invoice(s), ${results.failed} failed`,
      };
    }),

  // Batch send payment reminders
  batchSendPaymentReminders: createFeatureRestrictedProcedure("communications:email")
    .input(z.object({
      invoiceIds: z.array(z.string()).min(1),
      daysOverdueThreshold: z.number().default(0),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const results = {
        sent: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const invoiceId of input.invoiceIds) {
        try {
          const invoiceResult = await database
            .select()
            .from(invoices)
            .where(eq(invoices.id, invoiceId))
            .limit(1);

          if (!invoiceResult.length) {
            results.failed++;
            results.errors.push(`Invoice ${invoiceId} not found`);
            continue;
          }

          const invoice = invoiceResult[0];
          
          // Check if invoice is overdue
          const daysOverdue = Math.floor(
            (new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysOverdue < input.daysOverdueThreshold) {
            results.failed++;
            results.errors.push(`Invoice ${invoice.invoiceNumber} not overdue by ${input.daysOverdueThreshold} days`);
            continue;
          }

          const clientResult = await database
            .select()
            .from(clients)
            .where(eq(clients.id, invoice.clientId))
            .limit(1);

          if (!clientResult.length || !clientResult[0].email) {
            results.failed++;
            results.errors.push(`No email found for invoice ${invoice.invoiceNumber}`);
            continue;
          }

          const client = clientResult[0];
          const template = emailTemplates.paymentReminder(
            client.contactPerson || client.companyName,
            invoice.invoiceNumber,
            invoice.total || 0,
            Math.max(daysOverdue, 0),
            new Date(invoice.dueDate).toLocaleDateString(),
            process.env.COMPANY_NAME || "Melitech Solutions"
          );

          // Send email through SMTP
          const emailResult = await sendEmail({
            to: client.email,
            subject: template.subject,
            html: template.html,
            text: template.text,
          });

          if (!emailResult.success) {
            results.failed++;
            results.errors.push(`Failed to send reminder for invoice ${invoice.invoiceNumber}: ${emailResult.error}`);
            continue;
          }

          // Log activity
          await db.logActivity({
            userId: ctx.user.id,
            action: "payment_reminder_sent",
            entityType: "invoice",
            entityId: invoiceId,
            description: `Batch sent payment reminder for invoice ${invoice.invoiceNumber} to ${client.email}`,
          });

          results.sent++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Error sending reminder for invoice ${invoiceId}: ${error}`);
        }
      }

      return {
        ...results,
        message: `Sent ${results.sent} reminder(s), ${results.failed} failed`,
      };
    }),

  // Get email templates
  getTemplates: createFeatureRestrictedProcedure("communications:email")
    .query(async () => {
      return {
        invoice: "Invoice notification template",
        estimate: "Estimate notification template",
        paymentReminder: "Payment reminder template",
        paymentReceived: "Payment received notification template",
      };
    }),
});
