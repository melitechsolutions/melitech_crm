import { router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { v4 as uuidv4 } from "uuid";

// Permission-restricted procedures
const viewProcedure = createFeatureRestrictedProcedure("contracts:view");
const createProcedure = createFeatureRestrictedProcedure("contracts:create");
const editProcedure = createFeatureRestrictedProcedure("contracts:edit");
const deleteProcedure = createFeatureRestrictedProcedure("contracts:delete");

// In-memory storage
const contractsStore: Map<string, any> = new Map();

export const contractsRouter = router({
  list: viewProcedure
    .input(z.object({ 
      limit: z.number().optional(), 
      offset: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      try {
        const contracts = Array.from(contractsStore.values());
        
        let filtered = contracts;
        if (input?.status) {
          filtered = filtered.filter(c => c.status === input.status);
        }
        
        const offset = input?.offset || 0;
        const limit = input?.limit || 50;
        
        return {
          data: filtered.slice(offset, offset + limit),
          total: filtered.length,
        };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch contracts" });
      }
    }),

  getById: viewProcedure
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const contract = contractsStore.get(input);
        if (!contract) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
        }
        return contract;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch contract" });
      }
    }),

  create: createProcedure
    .input(z.object({
      name: z.string().min(1),
      vendor: z.string().min(1),
      startDate: z.string(),
      endDate: z.string(),
      value: z.number().positive(),
      status: z.enum(["draft", "active", "expired", "terminated"]).default("draft"),
      contractType: z.string().optional(),
      description: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const id = uuidv4();
        const contract = {
          id,
          ...input,
          createdBy: ctx.user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        contractsStore.set(id, contract);
        return contract;
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create contract" });
      }
    }),

  update: editProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      vendor: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      value: z.number().positive().optional(),
      status: z.enum(["draft", "active", "expired", "terminated"]).optional(),
      contractType: z.string().optional(),
      description: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const contract = contractsStore.get(input.id);
        if (!contract) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
        }

        const updated = {
          ...contract,
          ...input,
          id: contract.id,
          updatedBy: ctx.user.id,
          updatedAt: new Date().toISOString(),
        };
        
        contractsStore.set(input.id, updated);
        return updated;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update contract" });
      }
    }),

  delete: deleteProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      try {
        const exists = contractsStore.has(input);
        if (!exists) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
        }
        contractsStore.delete(input);
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete contract" });
      }
    }),
});
