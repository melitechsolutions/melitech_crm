import { protectedProcedure, router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { recurringInvoices, invoices, lineItems } from "../../drizzle/schema";
import { getDb } from "../db";
import * as dbFunctions from "../db";
import { eq, and, lte, gte, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

// Define typed procedures
const readProcedure = createFeatureRestrictedProcedure("invoices:read");
const createProcedure = createFeatureRestrictedProcedure("invoices:create");
const updateProcedure = createFeatureRestrictedProcedure("invoices:update");
const deleteProcedure = createFeatureRestrictedProcedure("invoices:delete");

const createRecurringInvoiceSchema = z.object({
  clientId: z.string(),
  templateInvoiceId: z.string(),
  frequency: z.enum(["weekly", "biweekly", "monthly", "quarterly", "annually"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  description: z.string().optional(),
  noteToInvoice: z.string().optional(),
});

const updateRecurringInvoiceSchema = z.object({
  id: z.string(),
  frequency: z.enum(["weekly", "biweekly", "monthly", "quarterly", "annually"]).optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  description: z.string().optional(),
  noteToInvoice: z.string().optional(),
});

// Calculate next due date based on frequency
function calculateNextDueDate(currentDate: Date, frequency: string): Date {
  const nextDate = new Date(currentDate);
  switch (frequency) {
    case "weekly":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case "biweekly":
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case "monthly":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case "quarterly":
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case "annually":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  return nextDate;
}

// Generate invoice number with date suffix
function generateInvoiceNumber(baseNumber: string): string {
  const datePart = new Date().toISOString().split("T")[0].replace(/-/g, "");
  return `${baseNumber}-REC-${datePart}`;
}

export const recurringInvoicesRouter = router({
  create: createProcedure
    .input(createRecurringInvoiceSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify template invoice exists
        const templateInvoice = await db
          .select()
          .from(invoices)
          .where(eq(invoices.id, input.templateInvoiceId))
          .limit(1);

        if (!templateInvoice.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Template invoice not found",
          });
        }

        const id = nanoid();
        const startDate = new Date(input.startDate);
        const nextDueDate = calculateNextDueDate(startDate, input.frequency);

        await db.insert(recurringInvoices).values({
          id,
          clientId: input.clientId,
          templateInvoiceId: input.templateInvoiceId,
          frequency: input.frequency as any,
          startDate: input.startDate,
          endDate: input.endDate,
          nextDueDate: nextDueDate.toISOString(),
          lastGeneratedDate: null,
          isActive: 1,
          description: input.description,
          noteToInvoice: input.noteToInvoice,
          createdBy: ctx.user.id,
        });

        return { id, success: true };
      } catch (error) {
        console.error("[RECURRING_INVOICES] Create error:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create recurring invoice",
        });
      }
    }),

  list: readProcedure
    .input(
      z.object({
        clientId: z.string().optional(),
        activeOnly: z.boolean().optional().default(true),
      })
    )
    .query(async ({ input }) => {
      try {
        const filters = [];
        if (input.clientId) {
          filters.push(eq(recurringInvoices.clientId, input.clientId));
        }
        if (input.activeOnly) {
          filters.push(eq(recurringInvoices.isActive, 1));
        }

        const result = await db
          .select()
          .from(recurringInvoices)
          .where(filters.length > 0 ? and(...filters) : undefined)
          .orderBy(desc(recurringInvoices.createdAt));

        return result;
      } catch (error) {
        console.error("[RECURRING_INVOICES] List error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch recurring invoices",
        });
      }
    }),

  getById: readProcedure
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const result = await db
          .select()
          .from(recurringInvoices)
          .where(eq(recurringInvoices.id, input))
          .limit(1);

        if (!result.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Recurring invoice not found",
          });
        }

        return result[0];
      } catch (error) {
        console.error("[RECURRING_INVOICES] GetById error:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch recurring invoice",
        });
      }
    }),

  update: updateProcedure
    .input(updateRecurringInvoiceSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...updateData } = input;

        const existing = await db
          .select()
          .from(recurringInvoices)
          .where(eq(recurringInvoices.id, id))
          .limit(1);

        if (!existing.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Recurring invoice not found",
          });
        }

        const updates: any = {
          updatedAt: new Date().toISOString(),
        };

        if (updateData.frequency) {
          updates.frequency = updateData.frequency;
          // Recalculate next due date if frequency changed
          const nextDueDate = calculateNextDueDate(
            new Date(existing[0].nextDueDate),
            updateData.frequency
          );
          updates.nextDueDate = nextDueDate.toISOString();
        }

        if (updateData.endDate !== undefined) {
          updates.endDate = updateData.endDate;
        }

        if (updateData.isActive !== undefined) {
          updates.isActive = updateData.isActive ? 1 : 0;
        }

        if (updateData.description !== undefined) {
          updates.description = updateData.description;
        }

        if (updateData.noteToInvoice !== undefined) {
          updates.noteToInvoice = updateData.noteToInvoice;
        }

        await db
          .update(recurringInvoices)
          .set(updates)
          .where(eq(recurringInvoices.id, id));

        return { success: true };
      } catch (error) {
        console.error("[RECURRING_INVOICES] Update error:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update recurring invoice",
        });
      }
    }),

  toggleActive: updateProcedure
    .input(
      z.object({
        id: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await db
          .update(recurringInvoices)
          .set({
            isActive: input.isActive ? 1 : 0,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(recurringInvoices.id, input.id));

        return { success: true };
      } catch (error) {
        console.error("[RECURRING_INVOICES] ToggleActive error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to toggle recurring invoice status",
        });
      }
    }),

  delete: deleteProcedure.input(z.string()).mutation(async ({ input }) => {
    try {
      await db
        .delete(recurringInvoices)
        .where(eq(recurringInvoices.id, input));

      return { success: true };
    } catch (error) {
      console.error("[RECURRING_INVOICES] Delete error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete recurring invoice",
      });
    }
  }),

  // Manually trigger an invoice generation from recurring template
  triggerGeneration: createProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      try {
        const recurringInvoice = await db
          .select()
          .from(recurringInvoices)
          .where(eq(recurringInvoices.id, input))
          .limit(1);

        if (!recurringInvoice.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Recurring invoice not found",
          });
        }

        const template = await db
          .select()
          .from(invoices)
          .where(eq(invoices.id, recurringInvoice[0].templateInvoiceId))
          .limit(1);

        if (!template.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Template invoice not found",
          });
        }

        // Fetch template line items
        const templateLineItems = await db
          .select()
          .from(lineItems)
          .where(
            and(
              eq(lineItems.documentId, template[0].id),
              eq(lineItems.documentType, "invoice")
            )
          );

        const newInvoiceId = nanoid();
        const newInvoiceNumber = generateInvoiceNumber(
          template[0].invoiceNumber
        );
        const now = new Date();
        const issueDate = now.toISOString();
        const dueDate = calculateNextDueDate(
          now,
          recurringInvoice[0].frequency
        ).toISOString();

        // Create new invoice from template
        await db.insert(invoices).values({
          id: newInvoiceId,
          invoiceNumber: newInvoiceNumber,
          clientId: recurringInvoice[0].clientId,
          recurringInvoiceId: input,
          title: template[0].title,
          status: "draft",
          issueDate,
          dueDate,
          subtotal: template[0].subtotal,
          taxAmount: template[0].taxAmount,
          discountAmount: template[0].discountAmount,
          total: template[0].total,
          paidAmount: 0,
          createdFromRecurring: 1,
          notes:
            (template[0].notes || "") +
            "\n\n--- Auto-generated from recurring invoice ---" +
            (recurringInvoice[0].noteToInvoice
              ? "\n" + recurringInvoice[0].noteToInvoice
              : ""),
          terms: template[0].terms,
          createdBy: ctx.user.id,
        });

        // Copy line items
        if (templateLineItems.length > 0) {
          await db.insert(lineItems).values(
            templateLineItems.map((item) => ({
              id: nanoid(),
              documentId: newInvoiceId,
              documentType: "invoice" as const,
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.amount,
              productId: item.productId,
              serviceId: item.serviceId,
              taxRate: item.taxRate,
              taxAmount: item.taxAmount,
              lineNumber: item.lineNumber,
              createdBy: ctx.user.id,
            }))
          );
        }

        // Update recurring invoice's nextDueDate and lastGeneratedDate
        const nextDueDate = calculateNextDueDate(now, recurringInvoice[0].frequency);
        await db
          .update(recurringInvoices)
          .set({
            nextDueDate: nextDueDate.toISOString(),
            lastGeneratedDate: now.toISOString(),
            updatedAt: now.toISOString(),
          })
          .where(eq(recurringInvoices.id, input));

        return {
          success: true,
          invoiceId: newInvoiceId,
          invoiceNumber: newInvoiceNumber,
        };
      } catch (error) {
        console.error("[RECURRING_INVOICES] TriggerGeneration error:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate invoice from recurring template",
        });
      }
    }),
});

export type RecurringInvoicesRouter = typeof recurringInvoicesRouter;
