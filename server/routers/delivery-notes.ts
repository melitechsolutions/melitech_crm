import { router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { v4 as uuidv4 } from "uuid";

// Permission-restricted procedures
const viewProcedure = createFeatureRestrictedProcedure("delivery_notes:view");
const createProcedure = createFeatureRestrictedProcedure("delivery_notes:create");
const editProcedure = createFeatureRestrictedProcedure("delivery_notes:edit");
const deleteProcedure = createFeatureRestrictedProcedure("delivery_notes:delete");

// In-memory storage
const deliveryNotesStore: Map<string, any> = new Map();

export const deliveryNotesRouter = router({
  list: viewProcedure
    .input(z.object({ 
      limit: z.number().optional(), 
      offset: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      try {
        const notes = Array.from(deliveryNotesStore.values());
        
        let filtered = notes;
        if (input?.status) {
          filtered = filtered.filter(n => n.status === input.status);
        }
        
        const offset = input?.offset || 0;
        const limit = input?.limit || 50;
        
        return {
          data: filtered.slice(offset, offset + limit),
          total: filtered.length,
        };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch delivery notes" });
      }
    }),

  getById: viewProcedure
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const note = deliveryNotesStore.get(input);
        if (!note) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Delivery note not found" });
        }
        return note;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch delivery note" });
      }
    }),

  create: createProcedure
    .input(z.object({
      dnNo: z.string().min(1),
      supplier: z.string().min(1),
      orderId: z.string().optional(),
      deliveryDate: z.string(),
      items: z.number().positive(),
      status: z.enum(["pending", "partial", "delivered", "cancelled"]).default("pending"),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const id = uuidv4();
        const note = {
          id,
          ...input,
          createdBy: ctx.user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        deliveryNotesStore.set(id, note);
        return note;
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create delivery note" });
      }
    }),

  update: editProcedure
    .input(z.object({
      id: z.string(),
      dnNo: z.string().optional(),
      supplier: z.string().optional(),
      deliveryDate: z.string().optional(),
      items: z.number().positive().optional(),
      status: z.enum(["pending", "partial", "delivered", "cancelled"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const note = deliveryNotesStore.get(input.id);
        if (!note) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Delivery note not found" });
        }

        const updated = {
          ...note,
          ...input,
          id: note.id,
          updatedBy: ctx.user.id,
          updatedAt: new Date().toISOString(),
        };
        
        deliveryNotesStore.set(input.id, updated);
        return updated;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update delivery note" });
      }
    }),

  delete: deleteProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      try {
        const exists = deliveryNotesStore.has(input);
        if (!exists) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Delivery note not found" });
        }
        deliveryNotesStore.delete(input);
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete delivery note" });
      }
    }),
});
