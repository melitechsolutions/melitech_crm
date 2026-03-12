import { router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { v4 as uuidv4 } from "uuid";

// Permission-restricted procedures
const viewProcedure = createFeatureRestrictedProcedure("grn:view");
const createProcedure = createFeatureRestrictedProcedure("grn:create");
const editProcedure = createFeatureRestrictedProcedure("grn:edit");
const deleteProcedure = createFeatureRestrictedProcedure("grn:delete");

// In-memory storage
const grnStore: Map<string, any> = new Map();

export const grnRouter = router({
  list: viewProcedure
    .input(z.object({ 
      limit: z.number().optional(), 
      offset: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      try {
        const grns = Array.from(grnStore.values());
        
        let filtered = grns;
        if (input?.status) {
          filtered = filtered.filter(g => g.status === input.status);
        }
        
        const offset = input?.offset || 0;
        const limit = input?.limit || 50;
        
        return {
          data: filtered.slice(offset, offset + limit),
          total: filtered.length,
        };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch GRNs" });
      }
    }),

  getById: viewProcedure
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const grn = grnStore.get(input);
        if (!grn) {
          throw new TRPCError({ code: "NOT_FOUND", message: "GRN not found" });
        }
        return grn;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch GRN" });
      }
    }),

  create: createProcedure
    .input(z.object({
      grnNo: z.string().min(1),
      supplier: z.string().min(1),
      invNo: z.string().optional(),
      receivedDate: z.string(),
      items: z.number().positive(),
      value: z.number().positive(),
      status: z.enum(["accepted", "partial", "rejected", "pending"]).default("pending"),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const id = uuidv4();
        const grn = {
          id,
          ...input,
          createdBy: ctx.user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        grnStore.set(id, grn);
        return grn;
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create GRN" });
      }
    }),

  update: editProcedure
    .input(z.object({
      id: z.string(),
      grnNo: z.string().optional(),
      supplier: z.string().optional(),
      invNo: z.string().optional(),
      receivedDate: z.string().optional(),
      items: z.number().positive().optional(),
      value: z.number().positive().optional(),
      status: z.enum(["accepted", "partial", "rejected", "pending"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const grn = grnStore.get(input.id);
        if (!grn) {
          throw new TRPCError({ code: "NOT_FOUND", message: "GRN not found" });
        }

        const updated = {
          ...grn,
          ...input,
          id: grn.id,
          updatedBy: ctx.user.id,
          updatedAt: new Date().toISOString(),
        };
        
        grnStore.set(input.id, updated);
        return updated;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update GRN" });
      }
    }),

  delete: deleteProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      try {
        const exists = grnStore.has(input);
        if (!exists) {
          throw new TRPCError({ code: "NOT_FOUND", message: "GRN not found" });
        }
        grnStore.delete(input);
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete GRN" });
      }
    }),
});
