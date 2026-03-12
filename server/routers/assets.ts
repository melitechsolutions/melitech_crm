import { router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { v4 as uuidv4 } from "uuid";

// Permission-restricted procedures
const viewProcedure = createFeatureRestrictedProcedure("assets:view");
const createProcedure = createFeatureRestrictedProcedure("assets:create");
const editProcedure = createFeatureRestrictedProcedure("assets:edit");
const deleteProcedure = createFeatureRestrictedProcedure("assets:delete");

// In-memory storage
const assetsStore: Map<string, any> = new Map();

export const assetsRouter = router({
  list: viewProcedure
    .input(z.object({ 
      limit: z.number().optional(), 
      offset: z.number().optional(),
      category: z.string().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      try {
        const assets = Array.from(assetsStore.values());
        
        let filtered = assets;
        if (input?.category) {
          filtered = filtered.filter(a => a.category === input.category);
        }
        if (input?.status) {
          filtered = filtered.filter(a => a.status === input.status);
        }
        
        const offset = input?.offset || 0;
        const limit = input?.limit || 50;
        
        return {
          data: filtered.slice(offset, offset + limit),
          total: filtered.length,
        };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch assets" });
      }
    }),

  getById: viewProcedure
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const asset = assetsStore.get(input);
        if (!asset) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Asset not found" });
        }
        return asset;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch asset" });
      }
    }),

  create: createProcedure
    .input(z.object({
      name: z.string().min(1),
      category: z.string().min(1),
      location: z.string().min(1),
      value: z.number().positive(),
      assignedTo: z.string().optional(),
      serialNumber: z.string().optional(),
      purchaseDate: z.string().optional(),
      status: z.enum(["active", "inactive", "maintenance", "disposed"]).default("active"),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const id = uuidv4();
        const asset = {
          id,
          ...input,
          createdBy: ctx.user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        assetsStore.set(id, asset);
        return asset;
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create asset" });
      }
    }),

  update: editProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      category: z.string().optional(),
      location: z.string().optional(),
      value: z.number().positive().optional(),
      assignedTo: z.string().optional(),
      serialNumber: z.string().optional(),
      purchaseDate: z.string().optional(),
      status: z.enum(["active", "inactive", "maintenance", "disposed"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const asset = assetsStore.get(input.id);
        if (!asset) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Asset not found" });
        }

        const updated = {
          ...asset,
          ...input,
          id: asset.id,
          updatedBy: ctx.user.id,
          updatedAt: new Date().toISOString(),
        };
        
        assetsStore.set(input.id, updated);
        return updated;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update asset" });
      }
    }),

  delete: deleteProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      try {
        const exists = assetsStore.has(input);
        if (!exists) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Asset not found" });
        }
        assetsStore.delete(input);
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete asset" });
      }
    }),
});
