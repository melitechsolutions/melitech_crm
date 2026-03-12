import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { opportunities } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const opportunitiesRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db.select().from(opportunities).limit(input?.limit || 50).offset(input?.offset || 0);
      return rows.map((r: any) => ({
        ...r,
        // Back-compat aliases expected by frontend
        proposalNumber: (r as any).proposalNumber || r.id,
        amount: (r as any).value ?? (r as any).total ?? 0,
        validUntil: (r as any).expectedCloseDate || (r as any).expiryDate || null,
        status: (r as any).stage || (r as any).status,
      }));
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(opportunities).where(eq(opportunities.id, input)).limit(1);
      const row = result[0] || null;
      if (!row) return null;
      return {
        ...row,
        proposalNumber: (row as any).proposalNumber || row.id,
        amount: (row as any).value ?? (row as any).total ?? 0,
        validUntil: (row as any).expectedCloseDate || (row as any).expiryDate || null,
        status: (row as any).stage || (row as any).status,
      };
    }),

  byClient: protectedProcedure
    .input(z.object({ clientId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const result = await db.select().from(opportunities).where(eq(opportunities.clientId, input.clientId));
      return result;
    }),

  create: createFeatureRestrictedProcedure("opportunities:create")
    .input(z.object({
      // Accept frontend-friendly fields and map them to DB columns
      proposalNumber: z.string().optional(),
      clientId: z.string(),
      title: z.string(),
      description: z.string().optional(),
      amount: z.number().optional(),
      value: z.number().optional(),
      validUntil: z.string().optional(),
      stage: z.enum(["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]).optional(),
      // Accept status for frontend compatibility and map to stage
      status: z.string().optional(),
      probability: z.number().optional(),
      expectedCloseDate: z.date().optional(),
      assignedTo: z.string().optional(),
      source: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const id = uuidv4();
      const insertData: any = {
        ...input,
        // Map frontend-friendly fields to DB columns
        value: input.amount ?? input.value,
        expectedCloseDate: input.expectedCloseDate ? input.expectedCloseDate.toISOString() : (input.validUntil || undefined),
      };

      if (input.status) {
        insertData.stage = input.status;
        delete insertData.status;
      }

      await db.insert(opportunities).values({
        id,
        ...insertData,
        createdBy: ctx.user.id,
      });
      return { id };
    }),

  update: createFeatureRestrictedProcedure("opportunities:edit")
    .input(z.object({
      id: z.string(),
      proposalNumber: z.string().optional(),
      clientId: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      // Accept frontend-friendly fields
      amount: z.number().optional(),
      value: z.number().optional(),
      validUntil: z.string().optional(),
      // Accept frontend `status` (maps to stage)
      status: z.string().optional(),
      stage: z.enum(["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]).optional(),
      probability: z.number().optional(),
      expectedCloseDate: z.date().optional(),
      actualCloseDate: z.date().optional(),
      assignedTo: z.string().optional(),
      source: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      // fetch current opportunity to detect stage changes
      const existing = await db.select().from(opportunities).where(eq(opportunities.id, id)).limit(1);
      const oldStage = existing[0]?.stage;
      const updateData: any = {
        ...data,
        // Map frontend-friendly fields
        value: (data as any).amount ?? (data as any).value,
        expectedCloseDate: (data as any).expectedCloseDate ? (data as any).expectedCloseDate.toISOString() : (data as any).validUntil || undefined,
        actualCloseDate: (data as any).actualCloseDate ? (data as any).actualCloseDate.toISOString() : undefined,
      };

      if ((data as any).status !== undefined) {
        updateData.stage = (data as any).status;
        delete updateData.status;
      }

      if ((data as any).proposalNumber !== undefined) updateData.proposalNumber = (data as any).proposalNumber;

      // Remove frontend-only keys to avoid DB errors
      delete updateData.amount;
      delete updateData.validUntil;

      await db.update(opportunities).set(updateData).where(eq(opportunities.id, id));

      // If stage changed, trigger workflows
      const newStage = updateData.stage;
      if (newStage && oldStage !== newStage) {
        try {
          await (await import('../workflows/triggerEngine')).workflowTriggerEngine.trigger({
            triggerType: 'opportunity_moved',
            entityType: 'opportunity',
            entityId: id,
            data: { oldStage, newStage },
            userId: ctx.user?.id,
          });
        } catch (err) {
          console.error('Workflow trigger (opportunity_moved) failed:', err);
        }
      }

      return { success: true };
    }),

  delete: createFeatureRestrictedProcedure("opportunities:delete")
    .input(z.string())
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.delete(opportunities).where(eq(opportunities.id, input));
      return { success: true };
    }),

  byStage: protectedProcedure
    .input(z.object({ stage: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const result = await db.select().from(opportunities).where(eq(opportunities.stage, input.stage as any));
      return result;
    }),
});

