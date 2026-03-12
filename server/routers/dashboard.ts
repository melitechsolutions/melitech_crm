import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { z } from "zod";
import { 
  projects, 
  clients, 
  invoices, 
  payments, 
  expenses, 
  products, 
  services, 
  employees,
  activityLog 
} from "../../drizzle/schema";

export const dashboardRouter = router({
  // Get dashboard stats for Quick Actions sidebar
  stats: createFeatureRestrictedProcedure("dashboard:view").query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return {
        totalRevenue: 0,
        revenueGrowth: 0,
        activeProjects: 0,
        newProjects: 0,
        totalClients: 0,
        newClients: 0,
      };
    }

    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const monthStartStr = monthStart.toISOString();
      const lastMonthStartStr = lastMonthStart.toISOString();
      const lastMonthEndStr = lastMonthEnd.toISOString();

      // Get total revenue (all payments)
      const allPayments = await db.select({ amount: payments.amount, status: payments.status }).from(payments).limit(10000);
      const totalRevenue = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      // Get this month's revenue
      const thisMonthPayments = await db
        .select({ amount: payments.amount, paymentDate: payments.paymentDate })
        .from(payments)
        .where(gte(payments.paymentDate, monthStartStr))
        .limit(1000);
      const thisMonthRevenue = thisMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      // Get last month's revenue
      const lastMonthPayments = await db
        .select({ amount: payments.amount, paymentDate: payments.paymentDate })
        .from(payments)
        .where(
          and(
            gte(payments.paymentDate, lastMonthStartStr),
            lte(payments.paymentDate, lastMonthEndStr)
          )
        )
        .limit(1000);
      const lastMonthRevenue = lastMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      // Calculate revenue growth
      const revenueGrowth = lastMonthRevenue > 0 
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : 0;

      // Get active projects
      const activeProjectsData = await db
        .select()
        .from(projects)
        .where(eq(projects.status, "active"))
        .limit(1000);
      const activeProjects = activeProjectsData.length;

      // Get new projects this month
      const newProjectsData = await db
        .select()
        .from(projects)
        .where(gte(projects.createdAt, monthStartStr))
        .limit(1000);
      const newProjects = newProjectsData.length;

      // Get total clients
      const allClients = await db.select().from(clients).limit(10000);
      const totalClients = allClients.length;

      // Get new clients this month
      const newClientsData = await db
        .select()
        .from(clients)
        .where(gte(clients.createdAt, monthStartStr))
        .limit(1000);
      const newClients = newClientsData.length;

      return {
        totalRevenue,
        revenueGrowth,
        activeProjects,
        newProjects,
        totalClients,
        newClients,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        totalRevenue: 0,
        revenueGrowth: 0,
        activeProjects: 0,
        newProjects: 0,
        totalClients: 0,
        newClients: 0,
      };
    }
  }),

  // Get recent activity for Quick Actions sidebar
  recentActivity: createFeatureRestrictedProcedure("dashboard:view")
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const limit = input?.limit || 10;
        const activities = await db
          .select()
          .from(activityLog)
          .orderBy(desc(activityLog.createdAt))
          .limit(limit);

        // Convert frozen objects to mutable objects to avoid React error #306
        return activities.map(activity => ({
          id: activity.id || '',
          userId: activity.userId || '',
          action: activity.action || '',
          entityType: activity.entityType || '',
          entityId: activity.entityId || '',
          description: activity.description || '',
          createdAt: activity.createdAt,
          updatedAt: activity.updatedAt,
        }));
      } catch (error) {
        console.error("Error fetching recent activity:", error);
        return [];
      }
    }),

  // Get dashboard metrics
  metrics: createFeatureRestrictedProcedure("dashboard:view").query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return {
        totalProjects: 0,
        activeClients: 0,
        pendingInvoices: 0,
        monthlyRevenue: 0,
        totalProducts: 0,
        totalServices: 0,
        totalEmployees: 0,
        totalAccounts: 0,
      };
    }

    try {
      // Get total projects
      const projectsData = await db.select().from(projects).limit(1000);
      const totalProjects = projectsData.length;

      // Get active clients
      const clientsData = await db.select().from(clients).where(eq(clients.status, "active")).limit(1000);
      const activeClients = clientsData.length;

      // Get pending invoices
      const invoicesData = await db.select().from(invoices).where(eq(invoices.status, "sent")).limit(1000);
      const pendingInvoices = invoicesData.length;

      // Get monthly revenue (payments from this month)
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const monthStartStr = monthStart.toISOString();
      const monthEndStr = monthEnd.toISOString();

      const paymentsData = await db
        .select()
        .from(payments)
        .where(
          and(
            gte(payments.paymentDate, monthStartStr),
            lte(payments.paymentDate, monthEndStr)
          )
        )
        .limit(1000);

      const monthlyRevenue = paymentsData.reduce((sum, p) => sum + (p.amount || 0), 0);

      // Get total products
      const productsData = await db.select().from(products).limit(1000);
      const totalProducts = productsData.length;

      // Get total services
      const servicesData = await db.select().from(services).limit(1000);
      const totalServices = servicesData.length;

      // Get total employees
      const employeesData = await db.select().from(employees).limit(1000);
      const totalEmployees = employeesData.length;

      return {
        totalProjects,
        activeClients,
        pendingInvoices,
        monthlyRevenue,
        totalProducts,
        totalServices,
        totalEmployees,
        totalAccounts: 0, // Placeholder
      };
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      return {
        totalProjects: 0,
        activeClients: 0,
        pendingInvoices: 0,
        monthlyRevenue: 0,
        totalProducts: 0,
        totalServices: 0,
        totalEmployees: 0,
        totalAccounts: 0,
      };
    }
  }),

  // Get accounting metrics
  accountingMetrics: createFeatureRestrictedProcedure("dashboard:view").query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return {
        totalInvoices: 0,
        totalPayments: 0,
        totalExpenses: 0,
        totalRevenue: 0,
      };
    }

    try {
      // Get total invoices
      const invoicesData = await db.select({ total: invoices.total }).from(invoices).limit(1000);
      const totalInvoices = invoicesData.length;

      // Get total payments
      const paymentsData = await db.select({ amount: payments.amount }).from(payments).limit(1000);
      const totalPayments = paymentsData.reduce((sum, p) => sum + (p.amount || 0), 0);

      // Get total expenses
      const expensesData = await db.select({ amount: expenses.amount }).from(expenses).limit(1000);
      const totalExpenses = expensesData.reduce((sum, e) => sum + (e.amount || 0), 0);

      // Get total revenue (from invoices)
      const totalRevenue = invoicesData.reduce((sum, i) => sum + (i.total || 0), 0);

      return {
        totalInvoices,
        totalPayments,
        totalExpenses,
        totalRevenue,
      };
    } catch (error) {
      console.error("Error fetching accounting metrics:", error);
      return {
        totalInvoices: 0,
        totalPayments: 0,
        totalExpenses: 0,
        totalRevenue: 0,
      };
    }
  }),

  // Get HR metrics
  hrMetrics: createFeatureRestrictedProcedure("dashboard:view").query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return {
        totalEmployees: 0,
        activeEmployees: 0,
        totalDepartments: 0,
      };
    }

    try {
      // Get total employees
      const employeesData = await db.select().from(employees).limit(1000);
      const totalEmployees = employeesData.length;

      // Get active employees
      const activeEmployees = employeesData.filter((e) => e.status === "active").length;

      // Get total departments (placeholder)
      const totalDepartments = 0;

      return {
        totalEmployees,
        activeEmployees,
        totalDepartments,
      };
    } catch (error) {
      console.error("Error fetching HR metrics:", error);
      return {
        totalEmployees: 0,
        activeEmployees: 0,
        totalDepartments: 0,
      };
    }
  }),
});
