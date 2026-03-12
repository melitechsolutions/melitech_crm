import { z } from "zod";
import { protectedProcedure, router, createFeatureRestrictedProcedure } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

// Define typed procedures
const createProcedure = createFeatureRestrictedProcedure("chat:send");
const readProcedure = createFeatureRestrictedProcedure("chat:read");
const deleteProcedure = createFeatureRestrictedProcedure("chat:delete");

// In-memory storage for staff chat messages (replace with database table in production)
let chatMessages: Array<{
  id: string;
  userId: string;
  userName: string;
  content: string;
  emoji?: string;
  replyToId?: string;
  replyToUser?: string;
  createdAt: Date;
  updatedAt: Date;
}> = [];

export const staffChatRouter = router({
  // Send a new message
  sendMessage: createProcedure
    .input(
      z.object({
        content: z.string().min(1).max(1000),
        emoji: z.string().optional(),
        replyToId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Find user details for the reply
      const replyTo = input.replyToId 
        ? chatMessages.find(m => m.id === input.replyToId)
        : undefined;

      const message = {
        id: messageId,
        userId: ctx.user.id,
        userName: ctx.user.name || ctx.user.email || "Unknown",
        content: input.content,
        emoji: input.emoji,
        replyToId: input.replyToId,
        replyToUser: replyTo?.userName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      chatMessages.push(message);

      // Keep only last 500 messages
      if (chatMessages.length > 500) {
        chatMessages = chatMessages.slice(-500);
      }

      return message;
    }),

  // Get all messages with pagination
  getMessages: readProcedure
    .input(
      z.object({
        limit: z.number().max(100).default(50),
        offset: z.number().default(0),
      })
    )
    .query(({ input }) => {
      const start = Math.max(0, chatMessages.length - input.offset - input.limit);
      const end = Math.max(0, chatMessages.length - input.offset);
      
      return {
        messages: chatMessages.slice(start, end).reverse(),
        total: chatMessages.length,
        hasMore: start > 0,
      };
    }),

  // Delete a message (only by sender or admin)
  deleteMessage: deleteProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const messageIndex = chatMessages.findIndex(m => m.id === input.id);
      
      if (messageIndex === -1) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Message not found",
        });
      }

      const message = chatMessages[messageIndex];
      
      // Check if user is the message sender or admin
      if (message.userId !== ctx.user.id && ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own messages",
        });
      }

      chatMessages.splice(messageIndex, 1);
      
      return { success: true };
    }),

  // Edit a message (only by sender)
  editMessage: createProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(1).max(1000),
        emoji: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const message = chatMessages.find(m => m.id === input.id);
      
      if (!message) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Message not found",
        });
      }

      if (message.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own messages",
        });
      }

      message.content = input.content;
      message.emoji = input.emoji;
      message.updatedAt = new Date();

      return message;
    }),

  // Get members (online staff)
  getMembers: readProcedure.query(async ({ ctx }) => {
    // Get unique users from messages (simplified approach)
    const uniqueUsers = new Map<string, { userId: string; userName: string; lastSeen: Date }>();
    
    chatMessages.forEach(msg => {
      if (!uniqueUsers.has(msg.userId)) {
        uniqueUsers.set(msg.userId, {
          userId: msg.userId,
          userName: msg.userName,
          lastSeen: msg.createdAt,
        });
      } else {
        const user = uniqueUsers.get(msg.userId);
        if (user && msg.createdAt > user.lastSeen) {
          user.lastSeen = msg.createdAt;
        }
      }
    });

    return Array.from(uniqueUsers.values())
      .sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());
  }),

  // Search messages
  searchMessages: readProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(({ input }) => {
      const query = input.query.toLowerCase();
      return chatMessages.filter(
        msg => 
          msg.content.toLowerCase().includes(query) ||
          msg.userName.toLowerCase().includes(query)
      );
    }),

  // Clear chat history (admin only)
  clearHistory: deleteProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can clear chat history",
      });
    }
    
    chatMessages = [];
    return { success: true };
  }),
});
