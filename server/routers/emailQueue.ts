import { router, protectedProcedure, publicProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "../_core/mail";
import { emailQueue, emailLog } from "../../drizzle/schema";

/**
 * Queue an email for sending (with retry logic)
 */
export async function queueEmail(input: {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  eventType: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}) {
  const db = await getDb();
  if (!db) {
    console.error("Database not available for email queue");
    return { success: false, error: "Database not available" };
  }

  try {
    const queueId = uuidv4();
    await db.insertEmailQueue({
      id: queueId,
      recipientEmail: input.recipientEmail,
      recipientName: input.recipientName,
      subject: input.subject,
      htmlContent: input.htmlContent,
      textContent: input.textContent,
      eventType: input.eventType,
      entityType: input.entityType,
      entityId: input.entityId,
      userId: input.userId,
      status: "pending",
      attempts: 0,
      maxAttempts: 3,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      createdAt: new Date().toISOString(),
    });

    console.log(`[EMAIL QUEUE] Queued email ${queueId} to ${input.recipientEmail}`);
    return { success: true, queueId };
  } catch (error) {
    console.error("[EMAIL QUEUE] Error queueing email:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Process pending emails from queue
 * Run via cron job or manual trigger
 */
export async function processEmailQueue() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available for email processing");
    return { success: false, processed: 0, failed: 0 };
  }

  try {
    // Get pending emails ready to send
    const pendingEmails = await db.getEmailQueuePending();
    let processed = 0;
    let failed = 0;

    for (const email of pendingEmails) {
      try {
        // Attempt to send the email
        const result = await sendEmail({
          to: email.recipientEmail,
          subject: email.subject,
          html: email.htmlContent,
          text: email.textContent || undefined,
        });

        if (result.success) {
          // Mark as sent
          await db.updateEmailQueueStatus(email.id, "sent", result.messageId || "");

          // Log successful send
          await db.insertEmailLog({
            id: uuidv4(),
            queueId: email.id,
            recipientEmail: email.recipientEmail,
            subject: email.subject,
            eventType: email.eventType,
            status: "sent",
            messageId: result.messageId || "",
            sentAt: new Date().toISOString(),
          });

          console.log(`[EMAIL QUEUE] Processed email ${email.id} to ${email.recipientEmail} - SUCCESS`);
          processed++;
        } else {
          // Handle retry
          const attempts = email.attempts + 1;
          if (attempts < email.maxAttempts) {
            // Schedule next retry (exponential backoff: 5min, 30min, 24hrs)
            const backoffMs = Math.pow(5, attempts) * 60000;
            const nextRetry = new Date(Date.now() + backoffMs);

            await db.updateEmailQueueRetry(email.id, attempts, nextRetry, result.error || "Send failed");
            console.log(`[EMAIL QUEUE] Email ${email.id} will retry at ${nextRetry.toISOString()}`);
          } else {
            // Max retries exceeded
            await db.updateEmailQueueStatus(email.id, "failed", result.error || "Max retries exceeded");

            await db.insertEmailLog({
              id: uuidv4(),
              queueId: email.id,
              recipientEmail: email.recipientEmail,
              subject: email.subject,
              eventType: email.eventType,
              status: "failed",
              errorMessage: result.error,
              sentAt: new Date().toISOString(),
            });

            console.log(`[EMAIL QUEUE] Email ${email.id} to ${email.recipientEmail} - FAILED after ${attempts} attempts`);
            failed++;
          }
        }
      } catch (error) {
        console.error(`[EMAIL QUEUE] Error processing email ${email.id}:`, error);
        failed++;
      }
    }

    return { success: true, processed, failed, total: pendingEmails.length };
  } catch (error) {
    console.error("[EMAIL QUEUE] Error processing queue:", error);
    return { success: false, error: String(error), processed: 0, failed: 0 };
  }
}

export const emailQueueRouter = router({
  /**
   * Get queue status and stats
   */
  getStatus: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return { pending: 0, failed: 0, sent: 0, retrying: 0 };
    }

    try {
      const stats = await db.getEmailQueueStats();
      return stats;
    } catch (error) {
      console.error("[EMAIL QUEUE] Error getting status:", error);
      return { pending: 0, failed: 0, sent: 0, retrying: 0 };
    }
  }),

  /**
   * Get queue entries (admin view)
   */
  getQueue: createFeatureRestrictedProcedure("communications:email_queue")
    .input(
      z.object({
        status: z.enum(["pending", "sent", "failed", "retrying"]).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { entries: [], total: 0 };
      }

      try {
        const entries = await db.getEmailQueueEntries(input.status, input.limit, input.offset);
        const total = await db.getEmailQueueCount(input.status);
        return { entries, total };
      } catch (error) {
        console.error("[EMAIL QUEUE] Error getting queue entries:", error);
        return { entries: [], total: 0 };
      }
    }),

  /**
   * Manually process queue (admin trigger)
   */
  processQueue: createFeatureRestrictedProcedure("communications:email_queue").mutation(async ({ ctx }) => {
    // Check admin/system role
    if (ctx.user?.role !== "admin" && ctx.user?.role !== "system") {
      throw new Error("Unauthorized - admin only");
    }

    const result = await processEmailQueue();
    return result;
  }),

  /**
   * Retry a specific failed email
   */
  retryEmail: createFeatureRestrictedProcedure("communications:email_queue")
    .input(z.object({ emailId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized - admin only");
      }

      const db = await getDb();
      if (!db) {
        return { success: false, error: "Database not available" };
      }

      try {
        // Reset to pending for retry
        await db.updateEmailQueueStatus(input.emailId, "pending", "");
        console.log(`[EMAIL QUEUE] Email ${input.emailId} marked for retry`);
        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Get email logs for auditing
   */
  getLogs: createFeatureRestrictedProcedure("communications:email_queue")
    .input(
      z.object({
        status: z.enum(["sent", "failed"]).optional(),
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { logs: [], total: 0 };
      }

      try {
        const logs = await db.getEmailLogs(input.status, input.limit, input.offset);
        const total = await db.getEmailLogCount(input.status);
        return { logs, total };
      } catch (error) {
        console.error("[EMAIL QUEUE] Error getting logs:", error);
        return { logs: [], total: 0 };
      }
    }),
});
