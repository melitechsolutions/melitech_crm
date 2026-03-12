import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { clients, projects, invoices } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import * as db from "../db";
import * as bcrypt from "bcryptjs";

/**
 * Generate a random password
 * @param length - Password length (default 12)
 * @returns Random password string
 */
function generatePassword(length: number = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  
  const allChars = uppercase + lowercase + numbers + symbols;
  let password = "";
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export const clientsRouter = router({
  list: createFeatureRestrictedProcedure("clients:read")
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(async ({ input }) => {
      try {
        const database = await getDb();
        if (!database) return [];
        
        const clientsList = await database.select().from(clients).limit(input?.limit || 50).offset(input?.offset || 0);
        
        // Fetch revenue data for each client
        const clientsWithRevenue = await Promise.all(
          clientsList.map(async (client: any) => {
            const clientInvoices = await database.select().from(invoices).where(eq(invoices.clientId, client.id));
            
            const totalRevenue = clientInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
            const paidRevenue = clientInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
            const outstandingRevenue = totalRevenue - paidRevenue;
            
            return {
              ...client,
              name: client.companyName || undefined,
              accountManager: client.assignedTo || undefined,
              revenue: {
                totalRevenue,
                paidRevenue,
                outstandingRevenue,
                invoiceCount: clientInvoices.length,
              },
            };
          })
        );
        
        return clientsWithRevenue;
      } catch (error) {
        console.error("[Clients List Error]", error);
        return [];
      }
    }),

  getById: createFeatureRestrictedProcedure("clients:read")
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const database = await getDb();
        if (!database) return null;
        const result = await database.select().from(clients).where(eq(clients.id, input)).limit(1);
        if (!result.length) return null;
        const r = result[0] as any;
        return {
          ...r,
          name: r.companyName || undefined,
          accountManager: r.assignedTo || undefined,
        };
      } catch (error) {
        console.error("[Clients GetById Error]", error);
        return null;
      }
    }),

  create: createFeatureRestrictedProcedure("clients:create")
    .input(z.object({
      companyName: z.string(),
      contactPerson: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
      taxId: z.string().optional(),
      website: z.string().optional(),
      industry: z.string().optional(),
      status: z.enum(["active", "inactive", "prospect", "archived"]).optional(),
      notes: z.string().optional(),
      createClientLogin: z.boolean().optional().default(false),
      clientPassword: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const id = uuidv4();
        const { createClientLogin, clientPassword, ...clientData } = input;
        
        // Create client record
        await database.insert(clients).values({
          id,
          ...clientData,
          createdBy: ctx.user.id,
        });
        
        let generatedPassword = null;
        
        // If client login should be created
        if (createClientLogin && input.email) {
          // Generate password if not provided
          generatedPassword = clientPassword || generatePassword(12);
          
          // Hash the password
          const salt = await bcrypt.genSalt(10);
          const passwordHash = await bcrypt.hash(generatedPassword, salt);
          
          // Create user account for client
          const userId = `client_${id}`;
          await db.upsertUser({
            id: userId,
            email: input.email,
            name: input.contactPerson || input.companyName,
            role: "client",
            loginMethod: "local",
            lastSignedIn: new Date(),
          });
          
          // Store password hash
          await db.setUserPassword(userId, passwordHash);
        }
        
        return { 
          id,
          clientLoginCreated: createClientLogin && !!input.email,
          generatedPassword: generatedPassword,
          message: generatedPassword ? `Client account created. Password: ${generatedPassword}` : "Client created successfully"
        };
      } catch (error) {
        console.error("[Clients Create Error]", error);
        throw error;
      }
    }),

  update: createFeatureRestrictedProcedure("clients:edit")
    .input(z.object({
      id: z.string(),
      companyName: z.string().optional(),
      contactPerson: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
      taxId: z.string().optional(),
      website: z.string().optional(),
      industry: z.string().optional(),
      status: z.enum(["active", "inactive", "prospect", "archived"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const { id, ...data } = input;
        await database.update(clients).set(data).where(eq(clients.id, id));
        return { success: true };
      } catch (error) {
        console.error("[Clients Update Error]", error);
        throw error;
      }
    }),

  delete: createFeatureRestrictedProcedure("clients:delete")
    .input(z.string())
    .mutation(async ({ input }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        await database.delete(clients).where(eq(clients.id, input));
        return { success: true };
      } catch (error) {
        console.error("[Clients Delete Error]", error);
        throw error;
      }
    }),

  // Get client projects
  getProjects: createFeatureRestrictedProcedure("clients:read")
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const database = await getDb();
        if (!database) return [];
        const result = await database.select().from(projects).where(eq(projects.clientId, input));
        return result;
      } catch (error) {
        console.error("[Clients GetProjects Error]", error);
        return [];
      }
    }),

  // Get client revenue
  getRevenue: createFeatureRestrictedProcedure("clients:read")
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const database = await getDb();
        if (!database) return { totalRevenue: 0, paidRevenue: 0, outstandingRevenue: 0, invoices: [] };

        const clientInvoices = await database.select().from(invoices).where(eq(invoices.clientId, input));

        const totalRevenue = clientInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const paidRevenue = clientInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
        const outstandingRevenue = totalRevenue - paidRevenue;

        return {
          totalRevenue,
          paidRevenue,
          outstandingRevenue,
          invoices: clientInvoices,
        };
      } catch (error) {
        console.error("[Clients GetRevenue Error]", error);
        return { totalRevenue: 0, paidRevenue: 0, outstandingRevenue: 0, invoices: [] };
      }
    }),

  // Get top clients by revenue
  getTopClients: createFeatureRestrictedProcedure("clients:read")
    .input(z.object({ limit: z.number().default(10) }).optional())
    .query(async ({ input }) => {
      try {
        const database = await getDb();
        if (!database) return [];

        const allClients = await database.select().from(clients);

        const clientsWithRevenue = await Promise.all(
          allClients.map(async (client) => {
            const clientInvoices = await database.select().from(invoices).where(eq(invoices.clientId, client.id));
            const totalRevenue = clientInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
            return { ...client, totalRevenue } as any;
          })
        );

        return clientsWithRevenue
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, input?.limit || 10)
          .map((c: any) => ({
            ...c,
            name: c.companyName || undefined,
            accountManager: c.assignedTo || undefined,
          }));
      } catch (error) {
        console.error("[Clients GetTopClients Error]", error);
        return [];
      }
    }),

  // Get client by user ID (for client portal)
  getClientByUserId: protectedProcedure.query(async ({ ctx }) => {
    try {
      const database = await getDb();
      if (!database) return null;

      const result = await database.select().from(clients).where(eq(clients.createdBy, ctx.user.id)).limit(1);
      if (!result.length) return null;
      const r = result[0] as any;
      return {
        ...r,
        name: r.companyName || undefined,
        accountManager: r.assignedTo || undefined,
      };
    } catch (error) {
      console.error("[Clients GetClientByUserId Error]", error);
      return null;
    }
  }),

  // Create or update client login
  createClientLogin: createFeatureRestrictedProcedure("clients:create")
    .input(z.object({
      clientId: z.string(),
      email: z.string().email(),
      password: z.string().optional(),
      autoGenerate: z.boolean().optional().default(true),
    }))
    .mutation(async ({ input }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        // Verify client exists
        const clientRecord = await database.select().from(clients).where(eq(clients.id, input.clientId)).limit(1);
        if (!clientRecord.length) {
          throw new Error("Client not found");
        }

        // Generate password if not provided
        const password = input.password || (input.autoGenerate ? generatePassword(12) : null);
        if (!password) {
          throw new Error("Password required when autoGenerate is false");
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create or update user account
        const userId = `client_${input.clientId}`;
        const clientName = clientRecord[0].contactPerson || clientRecord[0].companyName;
        
        await db.upsertUser({
          id: userId,
          email: input.email,
          name: clientName,
          role: "client",
          loginMethod: "local",
          lastSignedIn: new Date(),
        });

        // Store password hash
        await db.setUserPassword(userId, passwordHash);

        return {
          success: true,
          userId,
          email: input.email,
          password: input.autoGenerate ? password : undefined,
          message: input.autoGenerate ? `Client login created. Password: ${password}` : "Client login updated successfully"
        };
      } catch (error) {
        console.error("[Clients CreateClientLogin Error]", error);
        throw error;
      }
    }),
});
