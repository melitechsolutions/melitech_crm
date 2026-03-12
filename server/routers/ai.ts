/**
 * Claude AI Router (Phase 1 Implementation)
 * 
 * Features:
 * - Document Summarization & Intelligence
 * - Email Generation Assistant
 * - Financial Analytics & Insights
 * - Conversational Chat Interface
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import Anthropic from "@anthropic-ai/sdk";
import { router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  aiDocuments, 
  emailGenerationHistory, 
  financialAnalytics,
  aiChatSessions,
  aiChatMessages 
} from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import * as db from "../db";
import { router } from "../_core/trpc";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const aiRouter = router({
  // ============================================
  // Document Summarization
  // ============================================
  
  summarizeDocument: createFeatureRestrictedProcedure("ai:summarize")
    .input(
      z.object({
        text: z.string().min(50).max(50000),
        focus: z.enum(['key_points', 'action_items', 'financial', 'general']).optional().default('general'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const prompt = `Summarize the following document focusing on ${input.focus}. Be concise and actionable:\n\n${input.text}`;
        
        const message = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const summary =
          message.content[0].type === "text" ? message.content[0].text : "";

        // Log activity
        await db.logActivity({
          userId: ctx.user.id,
          action: 'ai_document_summarized',
          entityType: 'ai_request',
          entityId: `summary_${Date.now()}`,
          description: `Summarized document (${input.focus})`,
        });

        return { summary, tokensUsed: message.usage.output_tokens };
      } catch (error: any) {
        console.error('Claude summarization error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to summarize document: ${error.message}`,
        });
      }
    }),

  // ============================================
  // Email Generation
  // ============================================

  generateEmail: createFeatureRestrictedProcedure("ai:generateEmail")
    .input(
      z.object({
        context: z.string().min(20).max(5000),
        tone: z.enum(['professional', 'friendly', 'formal', 'casual']).default('professional'),
        type: z.enum(['invoice', 'proposal', 'follow_up', 'general']).default('general'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const systemPrompt = `You are a professional business email writer. Generate a concise, ${input.tone} email. Return only the email content without subject line.`;
        const userPrompt = `Generate a ${input.tone} ${input.type} email based on this context:\n\n${input.context}`;
        
        const message = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 800,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: userPrompt,
            },
          ],
        });

        const emailContent =
          message.content[0].type === "text" ? message.content[0].text : "";

        await db.logActivity({
          userId: ctx.user.id,
          action: 'ai_email_generated',
          entityType: 'ai_request',
          entityId: `email_${Date.now()}`,
          description: `Generated ${input.type} email (${input.tone})`,
        });

        return { emailContent, tokensUsed: message.usage.output_tokens };
      } catch (error: any) {
        console.error('Claude email generation error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to generate email: ${error.message}`,
        });
      }
    }),

  // ============================================
  // Financial Analytics
  // ============================================

  analyzeFinancials: createFeatureRestrictedProcedure("ai:financial")
    .input(
      z.object({
        dataDescription: z.string().min(20),
        metricType: z.enum(['expense_trends', 'revenue_analysis', 'cash_flow', 'profitability']).default('revenue_analysis'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const prompt = `As a financial analyst, provide insights on the following financial data. Focus on ${input.metricType}:\n\n${input.dataDescription}\n\nProvide 3-5 actionable insights.`;
        
        const message = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const insights =
          message.content[0].type === "text" ? message.content[0].text : "";

        await db.logActivity({
          userId: ctx.user.id,
          action: 'ai_financial_analysis',
          entityType: 'ai_request',
          entityId: `financial_${Date.now()}`,
          description: `Analyzed ${input.metricType}`,
        });

        return { insights, tokensUsed: message.usage.output_tokens };
      } catch (error: any) {
        console.error('Claude financial analysis error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to analyze financials: ${error.message}`,
        });
      }
    }),

  // ============================================
  // Conversational AI Chat
  // ============================================

  createChatSession: createFeatureRestrictedProcedure("ai:chat")
    .input(
      z.object({
        title: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const id = uuidv4();

        await database.insert(aiChatSessions).values({
          id,
          userId: ctx.user.id,
          title: input.title || `Chat ${new Date().toLocaleDateString()}`,
        });

        return { id };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create chat session: ${error.message}`,
        });
      }
    }),

  chat: createFeatureRestrictedProcedure("ai:chat")
    .input(
      z.object({
        message: z.string().min(1).max(5000),
        context: z.string().optional(),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        let systemPrompt = 'You are a helpful CRM assistant providing guidance on business processes, invoicing, payments, projects, and customer management. Keep responses concise and actionable.';

        if (input.context) {
          systemPrompt += `\n\nUser Context: ${input.context}`;
        }

        const message = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1024,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: input.message,
            },
          ],
        });

        const assistantMessage =
          message.content[0].type === "text" ? message.content[0].text : "";

        await db.logActivity({
          userId: ctx.user.id,
          action: 'ai_chat_interaction',
          entityType: 'ai_request',
          entityId: input.sessionId || `chat_${Date.now()}`,
          description: `Chat message: ${input.message.substring(0, 100)}`,
        });

        return {
          message: assistantMessage,
          tokensUsed: message.usage.output_tokens,
          sessionId: input.sessionId,
        };
      } catch (error: any) {
        console.error('Claude chat error:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to process chat message: ${error.message}`,
        });
      }
    }),

  /**
   * Check if Claude AI is available
   */
  checkAvailability: createFeatureRestrictedProcedure("ai:access").query(async () => {
    const isAvailable = !!process.env.ANTHROPIC_API_KEY;
    return {
      available: isAvailable,
      model: "claude-3-5-sonnet-20241022",
      provider: "anthropic",
      features: ['summarization', 'email_generation', 'chat', 'financial_analysis'],
    };
  }),
});
