import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { sql } from "drizzle-orm";

// schema imports for type-safe query building
import { invoices, invoiceItems, clients, services } from "../../drizzle/schema";

const dateRangeSchema = z.object({
  from: z.date(),
  to: z.date(),
});

export const salesReportsRouter = router({
  /**
   * Revenue grouped by client for the specified period
   */
  getRevenueByClient: createFeatureRestrictedProcedure("reporting:view")
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      const { from, to } = input;
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new Error("Database unavailable");
      const rows: any[] = await dbInstance
        .select({
          clientId: invoices.clientId,
          clientName: clients.companyName,
          total: sql`SUM(${invoices.total})`,
        })
        .from(invoices)
        .leftJoin(clients, sql`${invoices.clientId} = ${clients.id}`)
        .where(sql`${invoices.createdAt} BETWEEN ${from} AND ${to}`)
        .groupBy(invoices.clientId, clients.companyName)
        .orderBy(sql`total DESC`);

      return rows.map((r) => ({
        clientId: r.clientId,
        clientName: r.clientName || "Unassigned",
        total: r.total,
      }));
    }),

  /**
   * Revenue grouped by service line items for period
   */
  getRevenueByService: createFeatureRestrictedProcedure("reporting:view")
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      const { from, to } = input;
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new Error("Database unavailable");
      const rows: any[] = await dbInstance
        .select({
          serviceId: invoiceItems.itemId,
          serviceName: services.serviceName,
          total: sql`SUM(${invoiceItems.total})`,
        })
        .from(invoiceItems)
        .leftJoin(services, sql`${invoiceItems.itemId} = ${services.id}`)
        .leftJoin(invoices, sql`${invoiceItems.invoiceId} = ${invoices.id}`)
        .where(sql`${invoices.createdAt} BETWEEN ${from} AND ${to}`)
        .and(sql`${invoiceItems.itemType} = 'service'`)
        .groupBy(invoiceItems.itemId, services.serviceName)
        .orderBy(sql`total DESC`);

      return rows.map((r) => ({
        serviceId: r.serviceId,
        serviceName: r.serviceName || "Unknown",
        total: r.total,
      }));
    }),

  /**
   * Monthly sales trends (invoiced amounts)
   */
  getSalesTrends: createFeatureRestrictedProcedure("reporting:view")
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      const { from, to } = input;
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new Error("Database unavailable");
      const rows: any[] = await dbInstance
        .select({
          month: sql`DATE_FORMAT(${invoices.createdAt}, '%Y-%m')`,
          total: sql`SUM(${invoices.total})`,
        })
        .from(invoices)
        .where(sql`${invoices.createdAt} BETWEEN ${from} AND ${to}`)
        .groupBy(sql`month`)
        .orderBy(sql`month`);

      return rows.map((r) => ({ month: r.month, total: r.total }));
    }),

  /**
   * Simple invoice aging buckets across all overdue/sent invoices
   */
  getInvoiceAging: createFeatureRestrictedProcedure("reporting:view")
    .query(async () => {
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new Error("Database unavailable");
      const allInv = await dbInstance
        .select()
        .from(invoices)
        .where(sql`${invoices.status} IN ('sent','partial','overdue')`);
      const today = new Date();
      const aged = {
        current: { count: 0, amount: 0 },
        days30: { count: 0, amount: 0 },
        days60: { count: 0, amount: 0 },
        days90: { count: 0, amount: 0 },
        daysOver90: { count: 0, amount: 0 },
      };
      for (const inv of allInv) {
        const daysOld = Math.floor((today.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        const outstanding = (inv.total || 0) - (inv.paidAmount || 0);
        if (daysOld <= 0) {
          aged.current.count++;
          aged.current.amount += outstanding;
        } else if (daysOld <= 30) {
          aged.days30.count++;
          aged.days30.amount += outstanding;
        } else if (daysOld <= 60) {
          aged.days60.count++;
          aged.days60.amount += outstanding;
        } else if (daysOld <= 90) {
          aged.days90.count++;
          aged.days90.amount += outstanding;
        } else {
          aged.daysOver90.count++;
          aged.daysOver90.amount += outstanding;
        }
      }
      return aged;
    }),

  /**
   * Payment collection summary within range
   */
  getPaymentCollection: createFeatureRestrictedProcedure("reporting:view")
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      const { from, to } = input;
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new Error("Database unavailable");
      const invs = await dbInstance
        .select()
        .from(invoices)
        .where(sql`${invoices.createdAt} BETWEEN ${from} AND ${to}`);
      const totalInvoiced = invs.reduce((s: number, inv: any) => s + (inv.total || 0), 0);
      const totalPaid = invs.reduce((s: number, inv: any) => s + (inv.paidAmount || 0), 0);
      const collectionRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0;
      return { totalInvoiced, totalPaid, collectionRate };
    }),
});
