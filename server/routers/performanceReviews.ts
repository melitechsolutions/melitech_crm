import { router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { performanceReviews } from "../../drizzle/schema-extended";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import * as db from "../db";

const readProcedure = createFeatureRestrictedProcedure("hr:read");
const writeProcedure = createFeatureRestrictedProcedure("hr:edit");

export const performanceReviewsRouter = router({
  list: readProcedure
    .input(z.object({ employeeId: z.string().optional(), reviewerId: z.string().optional(), status: z.string().optional(), limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];
      try {
        let q: any = database.select().from(performanceReviews);
        if (input?.employeeId) q = database.select().from(performanceReviews).where(eq(performanceReviews.employeeId, input.employeeId));
        if (input?.reviewerId) q = q.where(eq(performanceReviews.reviewerId, input.reviewerId));
        if (input?.status) q = q.where(eq(performanceReviews.status, input.status as any));
        const rows = await (q as any).limit(input?.limit || 100).offset(input?.offset || 0);
        return rows;
      } catch (err) {
        console.error('Error listing performance reviews', err);
        return [];
      }
    }),

  getById: readProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return null;
      const r = await database.select().from(performanceReviews).where(eq(performanceReviews.id, input)).limit(1);
      return r[0] || null;
    }),

  create: writeProcedure
    .input(z.object({ employeeId: z.string(), reviewerId: z.string(), rating: z.number().min(1).max(5), comments: z.string().optional(), goals: z.string().optional(), status: z.enum(["pending","in_progress","completed"]).optional(), reviewDate: z.date().optional() }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error('DB not available');
      const id = uuidv4();
      try {
        await database.insert(performanceReviews).values({
          id,
          employeeId: input.employeeId,
          reviewerId: input.reviewerId,
          rating: input.rating,
          comments: input.comments,
          goals: input.goals,
          status: input.status || 'pending',
          reviewDate: input.reviewDate ? input.reviewDate.toISOString().replace('T',' ').substring(0,19) : new Date().toISOString().replace('T',' ').substring(0,19),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any);

        await db.logActivity({ userId: ctx.user.id, action: 'performance_review_created', entityType: 'performanceReview', entityId: id, description: `Created performance review for ${input.employeeId}` });
        return { id };
      } catch (err: any) {
        console.error('Error creating performance review', err);
        throw err;
      }
    }),

  update: writeProcedure
    .input(z.object({ id: z.string(), rating: z.number().min(1).max(5).optional(), comments: z.string().optional(), goals: z.string().optional(), status: z.enum(["pending","in_progress","completed"]).optional(), reviewDate: z.date().optional() }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error('DB not available');
      const exists = await database.select().from(performanceReviews).where(eq(performanceReviews.id, input.id)).limit(1);
      if (!exists.length) throw new Error('Not found');
      const updateData: any = { updatedAt: new Date().toISOString() };
      if (input.rating !== undefined) updateData.rating = input.rating;
      if (input.comments !== undefined) updateData.comments = input.comments;
      if (input.goals !== undefined) updateData.goals = input.goals;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.reviewDate !== undefined) updateData.reviewDate = input.reviewDate.toISOString().replace('T',' ').substring(0,19);
      await database.update(performanceReviews).set(updateData).where(eq(performanceReviews.id, input.id));
      await db.logActivity({ userId: ctx.user.id, action: 'performance_review_updated', entityType: 'performanceReview', entityId: input.id, description: `Updated performance review ${input.id}` });
      return { success: true };
    }),

  delete: writeProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error('DB not available');
      await database.delete(performanceReviews).where(eq(performanceReviews.id, input));
      await db.logActivity({ userId: ctx.user.id, action: 'performance_review_deleted', entityType: 'performanceReview', entityId: input, description: `Deleted performance review ${input}` });
      return { success: true };
    }),
});
