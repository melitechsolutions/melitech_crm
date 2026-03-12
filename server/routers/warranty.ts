import { router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { v4 as uuidv4 } from "uuid";

// Permission-restricted procedures
const viewProcedure = createFeatureRestrictedProcedure("warranty:view");
const createProcedure = createFeatureRestrictedProcedure("warranty:create");
const editProcedure = createFeatureRestrictedProcedure("warranty:edit");
const deleteProcedure = createFeatureRestrictedProcedure("warranty:delete");

// In-memory storage
const warrantyStore: Map<string, any> = new Map();

export const warrantyRouter = router({
  list: viewProcedure
    .input(z.object({ 
      limit: z.number().optional(), 
      offset: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      try {
        const warranties = Array.from(warrantyStore.values());
        
        let filtered = warranties;
        if (input?.status) {
          filtered = filtered.filter(w => w.status === input.status);
        }
        
        const offset = input?.offset || 0;
        const limit = input?.limit || 50;
        
        return {
          data: filtered.slice(offset, offset + limit),
          total: filtered.length,
        };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch warranties" });
      }
    }),

  getById: viewProcedure
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const warranty = warrantyStore.get(input);
        if (!warranty) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Warranty not found" });
        }
        return warranty;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch warranty" });
      }
    }),

  create: createProcedure
    .input(z.object({
      product: z.string().min(1),
      vendor: z.string().min(1),
      expiryDate: z.string(),
      coverage: z.string(),
      status: z.enum(["active", "expiring_soon", "expired"]).default("active"),
      serialNumber: z.string().optional(),
      claimTerms: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const id = uuidv4();
        const warranty = {
          id,
          ...input,
          createdBy: ctx.user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        warrantyStore.set(id, warranty);
        return warranty;
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create warranty" });
      }
    }),

  update: editProcedure
    .input(z.object({
      id: z.string(),
      product: z.string().optional(),
      vendor: z.string().optional(),
      expiryDate: z.string().optional(),
      coverage: z.string().optional(),
      status: z.enum(["active", "expiring_soon", "expired"]).optional(),
      serialNumber: z.string().optional(),
      claimTerms: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const warranty = warrantyStore.get(input.id);
        if (!warranty) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Warranty not found" });
        }

        const updated = {
          ...warranty,
          ...input,
          id: warranty.id,
          updatedBy: ctx.user.id,
          updatedAt: new Date().toISOString(),
        };
        
        warrantyStore.set(input.id, updated);
        return updated;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update warranty" });
      }
    }),

  delete: deleteProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      try {
        const exists = warrantyStore.has(input);
        if (!exists) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Warranty not found" });
        }
        warrantyStore.delete(input);
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete warranty" });
      }
    }),
});
