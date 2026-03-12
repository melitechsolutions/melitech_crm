import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { attendance } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const attendanceRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];
        const rows = await db.select().from(attendance).limit(input?.limit || 50).offset(input?.offset || 0);
        return rows.map((r: any) => ({
          ...r,
          checkIn: (r as any).checkIn || (r as any).checkInTime || null,
          checkOut: (r as any).checkOut || (r as any).checkOutTime || null,
        }));
      } catch (error: any) {
        console.error('Attendance list error:', error?.message || error);
        throw new Error('Failed to retrieve attendance records');
      }
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return null;
        const result = await db.select().from(attendance).where(eq(attendance.id, input)).limit(1);
        const row = result[0] || null;
        if (!row) return null;
        return {
          ...row,
          checkIn: (row as any).checkIn || (row as any).checkInTime || null,
          checkOut: (row as any).checkOut || (row as any).checkOutTime || null,
        };
      } catch (error) {
        console.error('Attendance getById error:', error);
        return null;
      }
    }),

  byEmployee: protectedProcedure
    .input(z.object({ employeeId: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];
        const result = await db.select().from(attendance).where(eq(attendance.employeeId, input.employeeId));
        return result.map((r: any) => ({
          ...r,
          checkIn: (r as any).checkIn || (r as any).checkInTime || null,
          checkOut: (r as any).checkOut || (r as any).checkOutTime || null,
        }));
      } catch (error: any) {
        console.error('Attendance byEmployee error:', error?.message || error);
        throw new Error('Failed to retrieve employee attendance');
      }
    }),

  create: createFeatureRestrictedProcedure("attendance:create")
    .input(z.object({
      employeeId: z.string(),
      date: z.date(),
      checkInTime: z.date().optional(),
      checkOutTime: z.date().optional(),
      status: z.enum(["present", "absent", "late", "leave"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const id = uuidv4();
      const insertData: any = {
        ...input,
        date: input.date ? input.date.toISOString() : undefined,
        checkInTime: input.checkInTime ? input.checkInTime.toISOString() : undefined,
        checkOutTime: input.checkOutTime ? input.checkOutTime.toISOString() : undefined,
      };

      await db.insert(attendance).values({
        id,
        ...insertData,
      });
      return { id };
    }),

  update: createFeatureRestrictedProcedure("attendance:edit")
    .input(z.object({
      id: z.string(),
      employeeId: z.string().optional(),
      date: z.date().optional(),
      checkInTime: z.date().optional(),
      checkOutTime: z.date().optional(),
      status: z.enum(["present", "absent", "late", "leave"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      const updateData: any = {
        ...data,
        date: (data as any).date ? (data as any).date.toISOString() : undefined,
        checkInTime: (data as any).checkInTime ? (data as any).checkInTime.toISOString() : undefined,
        checkOutTime: (data as any).checkOutTime ? (data as any).checkOutTime.toISOString() : undefined,
      };

      await db.update(attendance).set(updateData as any).where(eq(attendance.id, id));
      return { success: true };
    }),

  delete: createFeatureRestrictedProcedure("attendance:delete")
    .input(z.string())
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.delete(attendance).where(eq(attendance.id, input));
      return { success: true };
    }),
});

