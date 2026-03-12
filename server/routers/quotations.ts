import { router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { v4 as uuidv4 } from "uuid";

// Permission-restricted procedures
const viewProcedure = createFeatureRestrictedProcedure("quotations:view");
const createProcedure = createFeatureRestrictedProcedure("quotations:create");
const editProcedure = createFeatureRestrictedProcedure("quotations:edit");
const deleteProcedure = createFeatureRestrictedProcedure("quotations:delete");

// In-memory storage for demonstration (replace with database calls)
const quotationsStore: Map<string, any> = new Map();

export const quotationsRouter = router({
  list: viewProcedure
    .input(z.object({ 
      limit: z.number().optional(), 
      offset: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      try {
        const quotations = Array.from(quotationsStore.values());
        
        let filtered = quotations;
        if (input?.status) {
          filtered = filtered.filter(q => q.status === input.status);
        }
        
        const offset = input?.offset || 0;
        const limit = input?.limit || 50;
        
        return {
          data: filtered.slice(offset, offset + limit),
          total: filtered.length,
        };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch quotations" });
      }
    }),

  getById: viewProcedure
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const quotation = quotationsStore.get(input);
        if (!quotation) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Quotation not found" });
        }
        return quotation;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch quotation" });
      }
    }),

  create: createProcedure
    .input(z.object({
      rfqNo: z.string().min(1),
      supplier: z.string().min(1),
      description: z.string().optional(),
      amount: z.number().positive(),
      dueDate: z.string().optional(),
      status: z.enum(["draft", "submitted", "under_review", "approved", "rejected"]).default("draft"),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const id = uuidv4();
        const quotation = {
          id,
          ...input,
          createdBy: ctx.user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        quotationsStore.set(id, quotation);
        return quotation;
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create quotation" });
      }
    }),

  update: editProcedure
    .input(z.object({
      id: z.string(),
      rfqNo: z.string().optional(),
      supplier: z.string().optional(),
      description: z.string().optional(),
      amount: z.number().positive().optional(),
      dueDate: z.string().optional(),
      status: z.enum(["draft", "submitted", "under_review", "approved", "rejected"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const quotation = quotationsStore.get(input.id);
        if (!quotation) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Quotation not found" });
        }

        const updated = {
          ...quotation,
          ...input,
          id: quotation.id,
          updatedBy: ctx.user.id,
          updatedAt: new Date().toISOString(),
        };
        
        quotationsStore.set(input.id, updated);
        return updated;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update quotation" });
      }
    }),

  delete: deleteProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      try {
        const exists = quotationsStore.has(input);
        if (!exists) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Quotation not found" });
        }
        quotationsStore.delete(input);
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete quotation" });
      }
    }),
});
