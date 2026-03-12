import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { leaveRequests, employees } from "../../drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Define typed procedures
const readProcedure = protectedProcedure;

export const leaveRouter = router({
  list: readProcedure
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const leaves = await db
        .select()
        .from(leaveRequests)
        .limit(input?.limit || 50)
        .offset(input?.offset || 0);

      // enrich with employee name/email if available
      const ids = leaves.map((l: any) => l.employeeId);
      if (ids.length === 0) return leaves;
      const employeesData = await db
        .select()
        .from(employees)
        .where(inArray(employees.id, ids));
      const empMap = new Map(employeesData.map((e: any) => [e.id, e]));

      return leaves.map((l: any) => {
        const emp = empMap.get(l.employeeId);
        return {
          ...l,
          employeeName: emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : undefined,
          employeeEmail: emp ? emp.email : undefined,
        };
      });
    }),

  getById: readProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(leaveRequests).where(eq(leaveRequests.id, input)).limit(1);
      return result[0] || null;
    }),

  byEmployee: readProcedure
    .input(z.object({ employeeId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const result = await db.select().from(leaveRequests).where(eq(leaveRequests.employeeId, input.employeeId));
      return result;
    }),

  create: createFeatureRestrictedProcedure("leave:create")
    .input(z.object({
      employeeId: z.string(),
      leaveType: z.enum(["annual", "sick", "maternity", "paternity", "unpaid", "other"]),
      startDate: z.date(),
      endDate: z.date(),
      days: z.number().min(0, "Days must be zero or positive"),
      reason: z.string().optional(),
      notes: z.string().optional(),
      status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const id = uuidv4();
      const insertData: any = {
        ...input,
        startDate: input.startDate ? input.startDate.toISOString() : undefined,
        endDate: input.endDate ? input.endDate.toISOString() : undefined,
        approvalDate: (input as any).approvalDate ? (input as any).approvalDate.toISOString() : undefined,
      };

      await db.insert(leaveRequests).values({
        id,
        ...insertData,
      });
      return { id };
    }),

  update: createFeatureRestrictedProcedure("leave:edit")
    .input(z.object({
      id: z.string(),
      employeeId: z.string().optional(),
      leaveType: z.enum(["annual", "sick", "maternity", "paternity", "unpaid", "other"]).optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      days: z.number().min(0, "Days must be zero or positive").optional(),
      reason: z.string().optional(),
      notes: z.string().optional(),
      status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
      approvedBy: z.string().optional(),
      approvalDate: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      const updateData: any = {
        ...data,
        startDate: (data as any).startDate ? (data as any).startDate.toISOString() : undefined,
        endDate: (data as any).endDate ? (data as any).endDate.toISOString() : undefined,
        approvalDate: (data as any).approvalDate ? (data as any).approvalDate.toISOString() : undefined,
      };

      await db.update(leaveRequests).set(updateData as any).where(eq(leaveRequests.id, id));
      return { success: true };
    }),

  delete: createFeatureRestrictedProcedure("leave:delete")
    .input(z.string())
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.delete(leaveRequests).where(eq(leaveRequests.id, input));
      return { success: true };
    }),

  byStatus: readProcedure
    .input(z.object({ status: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const result = await db.select().from(leaveRequests).where(eq(leaveRequests.status, input.status as any));
      return result;
    }),
});

