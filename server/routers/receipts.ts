import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { receipts, lineItems } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { generateNextDocumentNumber } from "../utils/document-numbering";
import { createFeatureRestrictedProcedure, createRoleRestrictedProcedure } from "../middleware/enhancedRbac";

// Permission-restricted procedure instances
const viewProcedure = createFeatureRestrictedProcedure("accounting:receipts:view");
const createProcedure = createFeatureRestrictedProcedure("accounting:receipts:create");
const deleteProcedure = createRoleRestrictedProcedure(["super_admin", "admin"]);

// Helper function to generate next receipt number in format REC-000000
async function generateNextReceiptNumber(db: any): Promise<string> {
  try {
    const result = await db.select({ recNum: receipts.receiptNumber })
      .from(receipts)
      .orderBy(desc(receipts.receiptNumber))
      .limit(1);
    
    let maxSequence = 0;
    
    if (result && result.length > 0 && result[0].recNum) {
      const match = result[0].recNum.match(/(\d+)$/);
      if (match) {
        maxSequence = parseInt(match[1]);
      }
    }

    const nextSequence = maxSequence + 1;
    return `REC-${String(nextSequence).padStart(6, '0')}`;
  } catch (err) {
    console.warn("Error generating receipt number, using default:", err);
    return `REC-000001`;
  }
}

export const receiptsRouter = router({
  list: viewProcedure
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      try {
        const limit = Math.min(input?.limit || 50, 1000); // Cap at 1000
        const offset = input?.offset || 0;
        const result = await db
          .select({
            id: receipts.id,
            receiptNumber: receipts.receiptNumber,
            clientId: receipts.clientId,
            paymentId: receipts.paymentId,
            amount: receipts.amount,
            paymentMethod: receipts.paymentMethod,
            receiptDate: receipts.receiptDate,
            notes: receipts.notes,
            createdBy: receipts.createdBy,
            createdAt: receipts.createdAt,
          })
          .from(receipts)
          .orderBy(desc(receipts.createdAt))
          .limit(limit)
          .offset(offset);
        return result || [];
      } catch (error) {
        console.error("Error fetching receipts:", error);
        return [];
      }
    }),

  getNextReceiptNumber: viewProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const nextNumber = await generateNextReceiptNumber(db);
      return { receiptNumber: nextNumber };
    }),

  getById: viewProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db
        .select({
          id: receipts.id,
          receiptNumber: receipts.receiptNumber,
          clientId: receipts.clientId,
          paymentId: receipts.paymentId,
          amount: receipts.amount,
          paymentMethod: receipts.paymentMethod,
          receiptDate: receipts.receiptDate,
          notes: receipts.notes,
          createdBy: receipts.createdBy,
          createdAt: receipts.createdAt,
        })
        .from(receipts)
        .where(eq(receipts.id, input))
        .limit(1);
      return result[0] || null;
    }),

  byClient: viewProcedure
    .input(z.object({ clientId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const result = await db
        .select({
          id: receipts.id,
          receiptNumber: receipts.receiptNumber,
          clientId: receipts.clientId,
          paymentId: receipts.paymentId,
          amount: receipts.amount,
          paymentMethod: receipts.paymentMethod,
          receiptDate: receipts.receiptDate,
          notes: receipts.notes,
          createdBy: receipts.createdBy,
          createdAt: receipts.createdAt,
        })
        .from(receipts)
        .where(eq(receipts.clientId, input.clientId));
      return result;
    }),

  getWithItems: viewProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const receiptResult = await db
        .select({
          id: receipts.id,
          receiptNumber: receipts.receiptNumber,
          clientId: receipts.clientId,
          paymentId: receipts.paymentId,
          amount: receipts.amount,
          paymentMethod: receipts.paymentMethod,
          receiptDate: receipts.receiptDate,
          notes: receipts.notes,
          createdBy: receipts.createdBy,
          createdAt: receipts.createdAt,
        })
        .from(receipts)
        .where(eq(receipts.id, input))
        .limit(1);
      if (!receiptResult.length) return null;
      
      const items = await db.select().from(lineItems).where(
        and(
          eq(lineItems.documentId, input),
          eq(lineItems.documentType, 'receipt')
        )
      );
      
      return {
        ...receiptResult[0],
        lineItems: items
      };
    }),

  create: createProcedure
    .input(z.object({
      receiptNumber: z.string().optional(),
      clientId: z.string(),
      paymentId: z.string().optional(),
      amount: z.number(),
      paymentMethod: z.enum(["cash", "bank_transfer", "cheque", "mpesa", "card", "other"]),
      receiptDate: z.date().or(z.string()),
      notes: z.string().optional(),
      lineItems: z.array(z.object({
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
        taxRate: z.number().optional(),
        total: z.number(),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Auto-generate receipt number if not provided
      let receiptNumber = input.receiptNumber;
      if (!receiptNumber) {
        receiptNumber = await generateNextReceiptNumber(db);
      }

      const id = uuidv4();
      const { lineItems: items, ...receiptData } = input;
      
      // Convert dates to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
      const convertToMySQLDateTime = (date?: Date | string | null): string => {
        if (!date) return new Date().toISOString().replace('T', ' ').substring(0, 19);
        if (typeof date === 'string') return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
        if (date instanceof Date) return date.toISOString().replace('T', ' ').substring(0, 19);
        return new Date().toISOString().replace('T', ' ').substring(0, 19);
      };

      const formattedDate = convertToMySQLDateTime(receiptData.receiptDate);
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

      await db.insert(receipts).values({
        id,
        receiptNumber,
        ...receiptData,
        receiptDate: formattedDate,
        createdBy: ctx.user.id,
        createdAt: now,
      } as any);

      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          await db.insert(lineItems).values({
            id: uuidv4(),
            documentId: id,
            documentType: 'receipt',
            description: item.description,
            quantity: item.quantity,
            rate: item.unitPrice,
            amount: item.total,
            taxRate: item.taxRate || 0,
            lineNumber: i + 1,
            createdBy: ctx.user.id,
          } as any);
        }
      }

      return { id };
    }),

  update: createProcedure
    .input(z.object({
      id: z.string(),
      receiptNumber: z.string().optional(),
      clientId: z.string().optional(),
      paymentId: z.string().optional(),
      amount: z.number().optional(),
      paymentMethod: z.enum(["cash", "bank_transfer", "cheque", "mpesa", "card", "other"]).optional(),
      receiptDate: z.date().or(z.string()).optional(),
      notes: z.string().optional(),
      lineItems: z.array(z.object({
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
        taxRate: z.number().optional(),
        total: z.number(),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, lineItems: items, ...data } = input;
      
      // Convert dates to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
      const convertToMySQLDateTime = (date?: Date | string | null): string | undefined => {
        if (!date) return undefined;
        if (typeof date === 'string') return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
        if (date instanceof Date) return date.toISOString().replace('T', ' ').substring(0, 19);
        return undefined;
      };

      const updateData: any = { ...data };
      if (data.receiptDate) {
        updateData.receiptDate = convertToMySQLDateTime(data.receiptDate);
      }

      await db.update(receipts).set(updateData).where(eq(receipts.id, id));

      if (items !== undefined) {
        await db.delete(lineItems).where(
          and(
            eq(lineItems.documentId, id),
            eq(lineItems.documentType, 'receipt')
          )
        );

        if (items && items.length > 0) {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            await db.insert(lineItems).values({
              id: uuidv4(),
              documentId: id,
              documentType: 'receipt',
              description: item.description,
              quantity: item.quantity,
              rate: item.unitPrice,
              amount: item.total,
              taxRate: item.taxRate || 0,
              lineNumber: i + 1,
              createdBy: ctx.user.id,
            } as any);
          }
        }
      }

      return { success: true };
    }),

  delete: deleteProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Delete associated line items first
      await db.delete(lineItems).where(
        and(
          eq(lineItems.documentId, input),
          eq(lineItems.documentType, 'receipt')
        )
      );

      await db.delete(receipts).where(eq(receipts.id, input));
      return { success: true };
    }),
});
