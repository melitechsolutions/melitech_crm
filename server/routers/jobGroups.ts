import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { jobGroups } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const jobGroupsRouter = router({
  list: createFeatureRestrictedProcedure("jobGroups:read")
    .input(z.object({ 
      limit: z.number().optional(), 
      offset: z.number().optional(),
      isActive: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        let query = db.select().from(jobGroups);
        
        if (input?.isActive !== undefined) {
          query = query.where(eq(jobGroups.isActive, input.isActive ? 1 : 0));
        }
        
        return query.limit(input?.limit || 50).offset(input?.offset || 0);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch job groups" });
      }
    }),

  getById: createFeatureRestrictedProcedure("jobGroups:read")
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const result = await db.select().from(jobGroups).where(eq(jobGroups.id, input)).limit(1);
        return result[0] || null;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch job group" });
      }
    }),

  create: createFeatureRestrictedProcedure("jobGroups:create")
    .input(z.object({
      name: z.string().min(1),
      minimumGrossSalary: z.number().positive(),
      maximumGrossSalary: z.number().positive(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        if (input.minimumGrossSalary > input.maximumGrossSalary) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Minimum salary cannot be greater than maximum salary" });
        }

        const id = uuidv4();
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        
        await db.insert(jobGroups).values({
          id,
          name: input.name,
          minimumGrossSalary: input.minimumGrossSalary,
          maximumGrossSalary: input.maximumGrossSalary,
          description: input.description || null,
          isActive: 1,
          createdAt: now,
          updatedAt: now,
        } as any);
        
        return { id };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create job group" });
      }
    }),

  update: createFeatureRestrictedProcedure("jobGroups:edit")
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      minimumGrossSalary: z.number().positive().optional(),
      maximumGrossSalary: z.number().positive().optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { id, ...data } = input;
        
        // Validate salary ranges if both are provided
        if (data.minimumGrossSalary && data.maximumGrossSalary) {
          if (data.minimumGrossSalary > data.maximumGrossSalary) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Minimum salary cannot be greater than maximum salary" });
          }
        }

        const updateData: any = {
          ...data,
          isActive: data.isActive !== undefined ? (data.isActive ? 1 : 0) : undefined,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };

        await db.update(jobGroups)
          .set(updateData)
          .where(eq(jobGroups.id, id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update job group" });
      }
    }),

  delete: createFeatureRestrictedProcedure("jobGroups:delete")
    .input(z.string())
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        // Check if any employees belong to this job group
        const { employees } = await import("../../drizzle/schema");
        const employeeCount = await db.select({ count: employees.id })
          .from(employees)
          .where(eq(employees.jobGroupId, input));
        
        if (employeeCount && employeeCount.length > 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot delete job group that has employees assigned to it" });
        }

        await db.delete(jobGroups).where(eq(jobGroups.id, input));
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete job group" });
      }
    }),
});
