import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as dbHelpers from "../db";
import { lpos } from "../../drizzle/schema-extended";
import { journalEntries, journalEntryLines } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { createFeatureRestrictedProcedure, createRoleRestrictedProcedure } from "../middleware/enhancedRbac";

// Permission-restricted procedure instances
const viewProcedure = createFeatureRestrictedProcedure("procurement:lpo:view");
const createProcedure = createFeatureRestrictedProcedure("procurement:lpo:create");
const approveProcedure = createFeatureRestrictedProcedure("procurement:lpo:approve");
const deleteProcedure = createRoleRestrictedProcedure(["super_admin", "admin"]);

// simple lpo number generator
async function generateNextLPONumber(db: any): Promise<string> {
  try {
    const result = await db.select({ num: lpos.lpoNumber })
      .from(lpos)
      .orderBy(desc(lpos.createdAt))
      .limit(1);
    let seq = 0;
    if (result && result.length > 0 && result[0].num) {
      const match = result[0].num.match(/(\d+)$/);
      if (match) seq = parseInt(match[1]);
    }
    seq++;
    return `LPO-${String(seq).padStart(6,'0')}`;
  } catch (err) {
    console.warn("lpogenerator error", err);
    return `LPO-000001`;
  }
}

export const lpoRouter = router({
  list: viewProcedure
    .query(async () => {
      try {
        const db = await dbHelpers.getDb();
        if (!db) {
          console.error("[LPO] Database connection not available");
          return [];
        }
        console.log("[LPO] Attempting to fetch LPOs");
        const result = await db.select().from(lpos).orderBy(desc(lpos.createdAt));
        console.log("[LPO] Successfully fetched", result?.length || 0, "LPOs");
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("[LPO] Error fetching LPOs - Database Error:", errorMessage);
        console.error("[LPO] Full error details:", error);
        return [];
      }
    }),

  getById: viewProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const db = await dbHelpers.getDb();
      if (!db) return null;

      const rows = await db.select().from(lpos).where(eq(lpos.id, input)).limit(1);
      return rows[0] || null;
    }),

  create: createProcedure
    .input(z.object({
      vendorId: z.string(),
      description: z.string().optional(),
      amount: z.number().positive(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await dbHelpers.getDb();
      if (!db) throw new Error("DB not available");
      const id = uuidv4();
      const lpoNumber = await generateNextLPONumber(db);
      await db.insert(lpos).values({
        id,
        lpoNumber,
        vendorId: input.vendorId,
        description: input.description || null,
        amount: input.amount,
        status: 'draft',
        createdBy: ctx.user.id,
      });
      return { id };
    }),

  update: createProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(["draft","submitted","approved","rejected","received"]).optional(),
      description: z.string().optional(),
      amount: z.number().positive().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await dbHelpers.getDb();
      if (!db) throw new Error("DB not available");
      // fetch existing row to check current status
      const existing = await db.select().from(lpos).where(eq(lpos.id, input.id)).limit(1);
      if (input.status) {
        // only allow approving a submitted LPO
        if (input.status === 'approved' && existing.length && existing[0].status !== 'submitted') {
          throw new Error('Can only approve submitted LPOs');
        }
      }
      const upd: any = { updatedAt: new Date().toISOString().replace('T',' ').substring(0,19) };
      if (input.status) {
        // log status change actions
        await db.logActivity({ userId: ctx.user.id, action: `lpo_status_${input.status}`, entityType: 'lpo', entityId: input.id, description: `LPO ${input.id} marked ${input.status}` });
        upd.status = input.status;
        // when approving, create a minimal journal entry to record the transaction
        if (input.status === 'approved') {
          try {
            const jeId = uuidv4();
            let entryNumber = `JE-${Date.now()}`;
            // prepare accounts with defaults; declared outside inner try so available later
            let expenseAccountId = 'expense:unallocated';
            let payableAccountId = 'liability:accounts_payable';
              try {
                // use imported helpers directly (static import at top)
                if (typeof dbHelpers.getNextDocumentNumber === 'function') {
                  try { entryNumber = await dbHelpers.getNextDocumentNumber('journalEntry'); } catch (e) { }
                }
                if (typeof dbHelpers.getDefaultSetting === 'function') {
                  try {
                    const expenseDefault = await dbHelpers.getDefaultSetting('accounting', 'defaultExpenseAccount');
                    const payableDefault = await dbHelpers.getDefaultSetting('accounting', 'accountsPayableAccount');
                    if (expenseDefault && (expenseDefault as any).value) expenseAccountId = (expenseDefault as any).value;
                    if (payableDefault && (payableDefault as any).value) payableAccountId = (payableDefault as any).value;
                  } catch (e) {
                    // ignore and use fallback ids
                  }
                }
                // check for vendor-specific overrides stored in settings
                if (typeof dbHelpers.getSetting === 'function' && existing[0]?.vendorId) {
                  try {
                    const vendorKeyExp = `vendor_${existing[0].vendorId}_expenseAccount`;
                    const vendorKeyPay = `vendor_${existing[0].vendorId}_payableAccount`;
                    const vexp = await dbHelpers.getSetting(vendorKeyExp);
                    const vpay = await dbHelpers.getSetting(vendorKeyPay);
                    if (vexp && (vexp as any).value) expenseAccountId = (vexp as any).value;
                    if (vpay && (vpay as any).value) payableAccountId = (vpay as any).value;
                  } catch (e) {
                    // ignore
                  }
                }
              } catch (e) {
                // ignore failures and use defaults
              }

            await db.insert(journalEntries).values({
              id: jeId,
              entryNumber,
              entryDate: new Date().toISOString().replace('T',' ').substring(0,19),
              description: `LPO ${input.id} approved - ${existing[0]?.lpoNumber || ''}`,
              referenceType: 'lpo',
              referenceId: input.id,
              createdBy: ctx.user.id,
              createdAt: new Date().toISOString(),
            } as any);

            // create two balancing lines: debit expense, credit accounts_payable
            await db.insert(journalEntryLines).values({
              id: uuidv4(),
              journalEntryId: jeId,
              accountId: expenseAccountId,
              debit: existing[0]?.amount || 0,
              credit: 0,
              description: `Expense for LPO ${input.id}`,
              createdAt: new Date().toISOString(),
            } as any);

            await db.insert(journalEntryLines).values({
              id: uuidv4(),
              journalEntryId: jeId,
              accountId: payableAccountId,
              debit: 0,
              credit: existing[0]?.amount || 0,
              description: `Accounts payable for LPO ${input.id}`,
              createdAt: new Date().toISOString(),
            } as any);

            // trigger auto-post in finance module for downstream processes
            try {
              const { financeRouter } = await import('./finance');
              await financeRouter.createCaller({ user: ctx.user } as any).autoPostFromModule({ module: 'lpo', recordId: input.id });
            } catch (e) {
              console.debug('autoPostFromModule failed', e);
            }
          } catch (err) {
            console.warn('Failed to create journal entry for approved LPO', err);
          }
        }
      }
      if (input.description !== undefined) upd.description = input.description;
      if (input.amount !== undefined) upd.amount = input.amount;
      await db.update(lpos).set(upd).where(eq(lpos.id, input.id));
      return { success: true };
    }),

  delete: deleteProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      const db = await dbHelpers.getDb();
      if (!db) throw new Error("DB not available");
      await db.delete(lpos).where(eq(lpos.id, input));
      return { success: true };
    }),
});
