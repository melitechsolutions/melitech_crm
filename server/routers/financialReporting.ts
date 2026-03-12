import { router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { startOfMonth, endOfMonth, subMonths, eachMonthOfInterval } from "date-fns";

const readProcedure = createFeatureRestrictedProcedure("reports:financial");

/**
 * Generate P&L (Profit & Loss) statement for given period
 */
async function generatePLStatement(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Get revenue from invoices
    const invoices = await db.getInvoicesByDateRange(startDate, endDate);
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);

    // Get expenses
    const expenses = await db.getExpensesByDateRange(startDate, endDate);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Get COGS (Cost of Goods/Services) from project costs
    const projects = await db.getProjectsByDateRange(startDate, endDate);
    const cogs = projects.reduce((sum, proj) => sum + (proj.cost || 0), 0);

    // Calculate gross profit
    const grossProfit = totalRevenue - cogs;
    const grossMargin = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 10000) / 100 : 0;

    // Calculate operating profit
    const operatingProfit = grossProfit - totalExpenses;
    const operatingMargin = totalRevenue > 0 ? Math.round((operatingProfit / totalRevenue) * 10000) / 100 : 0;

    // Get expenses by category
    const expensesByCategory = await db.getExpensesByCategory(startDate, endDate);

    return {
      period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      totalRevenue,
      cogs,
      grossProfit,
      grossMargin,
      expenses: expensesByCategory,
      totalExpenses,
      operatingProfit,
      operatingMargin,
      netProfit: operatingProfit, // Simplified, no taxes
    };
  } catch (error) {
    console.error("[FINANCIAL REPORTING] Error generating P&L:", error);
    return null;
  }
}

/**
 * Generate cash flow projection
 */
async function generateCashFlowProjection(months: number = 12) {
  const db = await getDb();
  if (!db) return null;

  try {
    const projection = [];
    const today = new Date();

    for (let i = 0; i < months; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      // Get invoices due this month
      const invoices = await db.getInvoicesByDateRange(monthStart, monthEnd);
      const expectedInflows = invoices.reduce((sum, inv) => sum + inv.total, 0);

      // Get expenses due this month
      const expenses = await db.getExpensesByDateRange(monthStart, monthEnd);
      const expectedOutflows = expenses.reduce((sum, exp) => sum + exp.amount, 0);

      const netCashFlow = expectedInflows - expectedOutflows;

      projection.push({
        month: month.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        inflows: expectedInflows,
        outflows: expectedOutflows,
        netCashFlow,
      });
    }

    return projection;
  } catch (error) {
    console.error("[FINANCIAL REPORTING] Error generating cash flow:", error);
    return null;
  }
}

/**
 * Generate receivables aging report
 */
async function generateReceivablesAging() {
  const db = await getDb();
  if (!db) return null;

  try {
    const invoices = await db.getInvoicesByStatus('sent', 'partial', 'overdue');
    const today = new Date();

    const aged = {
      current: { count: 0, amount: 0 },
      days30: { count: 0, amount: 0 },
      days60: { count: 0, amount: 0 },
      days90: { count: 0, amount: 0 },
      daysOver90: { count: 0, amount: 0 },
    };

    for (const invoice of invoices) {
      const daysOld = Math.floor((today.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      const outstandingAmount = invoice.total - invoice.paidAmount;

      if (daysOld <= 0) {
        aged.current.count++;
        aged.current.amount += outstandingAmount;
      } else if (daysOld <= 30) {
        aged.days30.count++;
        aged.days30.amount += outstandingAmount;
      } else if (daysOld <= 60) {
        aged.days60.count++;
        aged.days60.amount += outstandingAmount;
      } else if (daysOld <= 90) {
        aged.days90.count++;
        aged.days90.amount += outstandingAmount;
      } else {
        aged.daysOver90.count++;
        aged.daysOver90.amount += outstandingAmount;
      }
    }

    const totalOutstanding = aged.current.amount + aged.days30.amount + aged.days60.amount + aged.days90.amount + aged.daysOver90.amount;

    return {
      current: { ...aged.current, percentage: totalOutstanding > 0 ? Math.round((aged.current.amount / totalOutstanding) * 100) : 0 },
      days30: { ...aged.days30, percentage: totalOutstanding > 0 ? Math.round((aged.days30.amount / totalOutstanding) * 100) : 0 },
      days60: { ...aged.days60, percentage: totalOutstanding > 0 ? Math.round((aged.days60.amount / totalOutstanding) * 100) : 0 },
      days90: { ...aged.days90, percentage: totalOutstanding > 0 ? Math.round((aged.days90.amount / totalOutstanding) * 100) : 0 },
      daysOver90: { ...aged.daysOver90, percentage: totalOutstanding > 0 ? Math.round((aged.daysOver90.amount / totalOutstanding) * 100) : 0 },
      totalOutstanding,
    };
  } catch (error) {
    console.error("[FINANCIAL REPORTING] Error generating aging:", error);
    return null;
  }
}

export const financialReportingRouter = router({
  /**
   * Get P&L for specified period
   */
  getPLStatement: readProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const pl = await generatePLStatement(new Date(input.startDate), new Date(input.endDate));
        return pl || { error: 'Failed to generate P&L' };
      } catch (error) {
        console.error("[FINANCIAL REPORTING] Error:", error);
        return { error: String(error) };
      }
    }),

  /**
   * Get P&L for current year
   */
  getYearToDatePL: readProcedure.query(async () => {
    try {
      const startDate = new Date(new Date().getFullYear(), 0, 1);
      const endDate = new Date();
      const pl = await generatePLStatement(startDate, endDate);
      return pl || { error: 'Failed to generate P&L' };
    } catch (error) {
      console.error("[FINANCIAL REPORTING] Error:", error);
      return { error: String(error) };
    }
  }),

  /**
   * Get P&L for last 12 months
   */
  get12MonthsPL: readProcedure.query(async () => {
    try {
      const endDate = new Date();
      const startDate = subMonths(endDate, 12);
      const pl = await generatePLStatement(startDate, endDate);
      return pl || { error: 'Failed to generate P&L' };
    } catch (error) {
      console.error("[FINANCIAL REPORTING] Error:", error);
      return { error: String(error) };
    }
  }),

  /**
   * Get monthly P&L breakdown
   */
  getMonthlyPLBreakdown: readProcedure
    .input(z.object({ months: z.number().default(12) }))
    .query(async ({ input }) => {
      try {
        const breakdown = [];
        const today = new Date();

        for (let i = input.months - 1; i >= 0; i--) {
          const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const pl = await generatePLStatement(monthStart, monthEnd);
          if (pl) {
            breakdown.push({
              month: month.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
              ...pl,
            });
          }
        }

        return { breakdown };
      } catch (error) {
        console.error("[FINANCIAL REPORTING] Error:", error);
        return { breakdown: [], error: String(error) };
      }
    }),

  /**
   * Get cash flow projection
   */
  getCashFlowProjection: readProcedure
    .input(z.object({ months: z.number().default(12) }))
    .query(async ({ input }) => {
      try {
        const projection = await generateCashFlowProjection(input.months);
        return { projection } || { projection: [] };
      } catch (error) {
        console.error("[FINANCIAL REPORTING] Error:", error);
        return { projection: [], error: String(error) };
      }
    }),

  /**
   * Get receivables aging
   */
  getReceivablesAging: readProcedure.query(async () => {
    try {
      const aging = await generateReceivablesAging();
      return aging || { error: 'Failed to generate aging report' };
    } catch (error) {
      console.error("[FINANCIAL REPORTING] Error:", error);
      return { error: String(error) };
    }
  }),

  /**
   * Get accounts receivable summary
   */
  getARSummary: readProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return { totalAR: 0, overdue: 0, avgCollectionDays: 0, topDebtors: [] };
    }

    try {
      const invoices = await db.getInvoicesByStatus('sent', 'partial', 'overdue');
      const today = new Date();
      let totalAR = 0;
      let totalOverdue = 0;
      let totalDays = 0;
      const debtors: { clientId: string; amount: number }[] = [];

      for (const invoice of invoices) {
        const outstanding = invoice.total - invoice.paidAmount;
        totalAR += outstanding;
        totalDays += Math.floor((today.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));

        if (new Date(invoice.dueDate) < today) {
          totalOverdue += outstanding;
        }

        const debtorIndex = debtors.findIndex(d => d.clientId === invoice.clientId);
        if (debtorIndex >= 0) {
          debtors[debtorIndex].amount += outstanding;
        } else {
          debtors.push({ clientId: invoice.clientId, amount: outstanding });
        }
      }

      const topDebtors = debtors
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

      const avgCollectionDays = invoices.length > 0 ? Math.round(totalDays / invoices.length) : 0;

      return {
        totalAR,
        overdue: totalOverdue,
        avgCollectionDays,
        topDebtors,
      };
    } catch (error) {
      console.error("[FINANCIAL REPORTING] Error:", error);
      return { totalAR: 0, overdue: 0, avgCollectionDays: 0, topDebtors: [] };
    }
  }),

  /**
   * Get tax-deductible expenses
   */
  getTaxDeductibleExpenses: readProcedure
    .input(z.object({ year: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { expenses: [], total: 0 };

      try {
        const startDate = new Date(input.year, 0, 1);
        const endDate = new Date(input.year + 1, 0, 1);
        const expenses = await db.getTaxDeductibleExpenses(startDate, endDate);

        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        return { expenses, total };
      } catch (error) {
        console.error("[FINANCIAL REPORTING] Error:", error);
        return { expenses: [], total: 0, error: String(error) };
      }
    }),

  /**
   * Get revenue by client
   */
  getRevenueByClient: readProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { clients: [] };

      try {
        const revenue = await db.getRevenueByClient(input.limit);
        return { clients: revenue };
      } catch (error) {
        console.error("[FINANCIAL REPORTING] Error:", error);
        return { clients: [], error: String(error) };
      }
    }),

  /**
   * Get revenue by project
   */
  getRevenueByProject: readProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { projects: [] };

      try {
        const revenue = await db.getRevenueByProject(input.limit);
        return { projects: revenue };
      } catch (error) {
        console.error("[FINANCIAL REPORTING] Error:", error);
        return { projects: [], error: String(error) };
      }
    }),
});
