import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { salesReportsRouter } from "./routers/salesReports";
import { TRPCError } from "@trpc/server";
import { usersRouter } from "./routers/users";
import { clientsRouter } from "./routers/clients";
import { invoicesRouter } from "./routers/invoices";
import { projectsRouter } from "./routers/projects";
import { paymentsRouter } from "./routers/payments";
import { stripeRouter } from "./routers/stripe";
import { mpesaRouter } from "./routers/mpesa";
import { emailRouter as emailQueueRouter } from "./routers/emailRouter";
import { smsRouter as smsQueueRouter } from "./routers/smsRouter";
import { schedulerRouter as jobSchedulerRouter } from "./routers/schedulerRouter";
import { estimatesRouter } from "./routers/estimates";
import { productsRouter } from "./routers/products";
import { receiptsRouter } from "./routers/receipts";
import { servicesRouter } from "./routers/services";
import { expensesRouter } from "./routers/expenses";
import { opportunitiesRouter } from "./routers/opportunities";
import { employeesRouter } from "./routers/employees";
import { jobGroupsRouter } from "./routers/jobGroups";
import { departmentsRouter } from "./routers/departments";
import { attendanceRouter } from "./routers/attendance";
import { payrollRouter } from "./routers/payroll";
import { leaveRouter } from "./routers/leave";
import { settingsRouter } from "./routers/settings";
import { rolesRouter } from "./routers/roles";
import { dashboardRouter } from "./routers/dashboard";
import { authRouter } from "./routers/auth";
import { chartOfAccountsRouter } from "./routers/chartOfAccounts";
import { emailRouter } from "./routers/email";
import { reportsRouter } from "./routers/reports";
import { dataExportRouter } from "./routers/dataExport";
import { importExportRouter } from "./routers/importExport";
import { csvImportExportRouter } from "./routers/csvImportExport";
import { lineItemsRouter } from "./routers/lineItems";
import { approvalsRouter } from "./routers/approvals";
import { savedFiltersRouter } from "./routers/savedFilters";
import { documentManagementRouter } from "./routers/documentManagement";
import { analyticsRouter } from "./routers/analytics";
import { aiRouter } from "./routers/ai";
import { reportExportRouter } from "./routers/reportExport";
import { notificationsRouter } from "./routers/notifications";
import { recurringInvoicesRouter } from "./routers/recurringInvoices";
import { paymentPlansRouter } from "./routers/paymentPlans";
import { projectMilestonesRouter } from "./routers/projectMilestones";
import { timeEntriesRouter } from "./routers/timeEntries";
import { salesPipelineRouter } from "./routers/salesPipeline";
import { workflowsRouter } from "./routers/workflows";
import { enhancedPermissionsRouter } from "./routers/enhancedPermissions";
import { permissionsRouter } from "./routers/permissions";
import { enhancedDashboardRouter } from "./routers/enhancedDashboard";
import { serviceTemplatesRouter } from "./routers/serviceTemplates";
import { budgetRouter } from "./routers/budget";
import { budgetsRouter } from "./routers/budgets";
import { hrAnalyticsRouter } from "./routers/hrAnalytics";
import { payrollExportRouter } from "./routers/payrollExport";
import { taxComplianceRouter } from "./routers/taxCompliance";
import { lpoRouter } from "./routers/lpo";
import { procurementRouter } from "./routers/procurement";
import { ticketsRouter } from "./routers/tickets";
import { imprestRouter } from "./routers/imprest";
import { imprestSurrenderRouter } from "./routers/imprestSurrender";
import { financialReportsRouter } from "./routers/financialReports";
import { financeRouter } from "./routers/finance";
import { performanceReviewsRouter } from "./routers/performanceReviews";
import { importValidationRouter } from "./routers/importValidation";
import { healthRouter } from "./routers/health";
import { communicationsRouter } from "./routers/communications";
import { enhancedPaymentsRouter } from "./routers/enhancedPayments";
import { professionalBudgetingRouter } from "./routers/professionalBudgeting";
import { procurementRouter as procurementManagementRouter } from "./routers/procurementManagement";
import { inventoryRouter } from "./routers/inventory";
import { staffChatRouter } from "./routers/staffChat";
import { suppliersRouter } from "./routers/suppliers";
import { maintenanceRouter } from "./routers/maintenance";
import { bankReconciliationRouter } from "./routers/bankReconciliation";
import { automationJobsRouter } from "./routers/automationJobs";
import { brandCustomizationRouter } from "./routers/brandCustomization";
import { themeCustomizationRouter } from "./routers/themeCustomization";
import { customHomepageRouter } from "./routers/customHomepage";
import { quotationsRouter } from "./routers/quotations";
import { deliveryNotesRouter } from "./routers/delivery-notes";
import { grnRouter } from "./routers/grn";
import { assetsRouter } from "./routers/assets";
import { warrantyRouter } from "./routers/warranty";
import { contractsRouter } from "./routers/contracts";
import { projectManagementRouter } from "./routers/projectManagement";
import { advancedReportingRouter } from "./routers/advancedReporting";
import { automationRulesRouter } from "./routers/automationRulesEngine";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin' && ctx.user.role !== 'staff') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  health: healthRouter,
  system: systemRouter,
  users: usersRouter,
  clients: clientsRouter,
  invoices: invoicesRouter,
  projects: projectsRouter,
  payments: paymentsRouter,
  stripe: stripeRouter,
  mpesa: mpesaRouter,
  emailQueue: emailQueueRouter,
  smsQueue: smsQueueRouter,
  jobScheduler: jobSchedulerRouter,
  estimates: estimatesRouter,
  products: productsRouter,
  receipts: receiptsRouter,
  services: servicesRouter,
  expenses: expensesRouter,
  opportunities: opportunitiesRouter,
  employees: employeesRouter,
  jobGroups: jobGroupsRouter,
  departments: departmentsRouter,
  attendance: attendanceRouter,
  payroll: payrollRouter,
  leave: leaveRouter,
  settings: settingsRouter,
  dashboard: dashboardRouter,
  analytics: analyticsRouter,
  chartOfAccounts: chartOfAccountsRouter,
  email: emailRouter,
  reports: reportsRouter,
  reportExport: reportExportRouter,
  dataExport: dataExportRouter,
  documentManagement: documentManagementRouter,
  importExport: importExportRouter,
  csvImportExport: csvImportExportRouter,
  lineItems: lineItemsRouter,
  approvals: approvalsRouter,
  savedFilters: savedFiltersRouter,
  ai: aiRouter,
  // Aliases for legacy client callsites — keep mounted so existing client code works
  documents: documentManagementRouter,
  // Expose select settings-related procedures under legacy names used client-side
  roles: rolesRouter,
  permissions: permissionsRouter,
  enhancedPermissions: enhancedPermissionsRouter,
  enhancedDashboard: enhancedDashboardRouter,
  bankReconciliation: bankReconciliationRouter,

  // Use the complete authRouter with login, register, logout, etc.
  auth: authRouter,

  // ============= NOTIFICATIONS =============
  notifications: notificationsRouter,

  // ============= RECURRING INVOICES =============
  recurringInvoices: recurringInvoicesRouter,

  // ============= PAYMENT PLANS =============
  paymentPlans: paymentPlansRouter,
  // ============= CLIENT TICKETS =============
  tickets: ticketsRouter,

  // ============= PROJECT MILESTONES =============
  projectMilestones: projectMilestonesRouter,
  projectManagement: projectManagementRouter,

  // ============= TIME ENTRIES =============
  timeEntries: timeEntriesRouter,

  // ============= SALES PIPELINE =============
  salesPipeline: salesPipelineRouter,

  // ============= WORKFLOW AUTOMATION =============
  workflows: workflowsRouter,
  automationRules: automationRulesRouter,

  // ============= SERVICE TEMPLATES & USAGE TRACKING =============
  serviceTemplates: serviceTemplatesRouter,

  // ============= BUDGET MANAGEMENT =============
  budget: budgetRouter,
  budgets: budgetsRouter,

  // ============= HR ANALYTICS =============
  hrAnalytics: hrAnalyticsRouter,

    // ============= PAYROLL EXPORT =============
    payrollExport: payrollExportRouter,

    // ============= TAX COMPLIANCE REPORTS =============
  taxCompliance: taxComplianceRouter,

  // ============= LOCAL PURCHASE ORDERS =============
  lpo: lpoRouter,

  // ============= PROCUREMENT MANAGEMENT (Full CRUD) =============
  procurementMgmt: procurementManagementRouter,

  // ============= SUPPLIERS MANAGEMENT =============
  suppliers: suppliersRouter,

  // ============= PROCUREMENT REQUESTS =============
  procurement: procurementRouter,

  // ============= IMPRESTS =============
  imprest: imprestRouter,
  imprestSurrender: imprestSurrenderRouter,

  // ============= INVENTORY MANAGEMENT =============
  inventory: inventoryRouter,

  // ============= FINANCE UTILITIES =============
  finance: financeRouter,

  // ============= FINANCIAL REPORTS =============
  financialReports: financialReportsRouter,

  // ============= PERFORMANCE REVIEWS =============
  performanceReviews: performanceReviewsRouter,

  // ============= SALES REPORTS & ANALYTICS =============
  salesReports: salesReportsRouter,
  advancedReporting: advancedReportingRouter,

  // ============= COMMUNICATIONS =============
  communications: communicationsRouter,

  // ============= STAFF CHAT =============
  staffChat: staffChatRouter,

  // ============= ENHANCED PAYMENTS WITH COA =============
  enhancedPayments: enhancedPaymentsRouter,

  // ============= PROFESSIONAL BUDGETING =============
  professionalBudgeting: professionalBudgetingRouter,

  // ============= MAINTENANCE & UTILITIES =============
  maintenance: maintenanceRouter,

  // ============= AUTOMATION JOBS =============
  automationJobs: automationJobsRouter,

  // ============= BRAND CUSTOMIZATION =============
  brandCustomization: brandCustomizationRouter,

  // ============= THEME CUSTOMIZATION =============
  themeCustomization: themeCustomizationRouter,

  // ============= CUSTOM HOMEPAGE =============
  customHomepage: customHomepageRouter,

  // ============= PROCUREMENT - QUOTATIONS =============
  quotations: quotationsRouter,

  // ============= PROCUREMENT - DELIVERY NOTES =============
  deliveryNotes: deliveryNotesRouter,

  // ============= PROCUREMENT - GOODS RECEIVED NOTES =============
  grn: grnRouter,

  // ============= ASSET MANAGEMENT =============
  assets: assetsRouter,

  // ============= WARRANTY MANAGEMENT =============
  warranty: warrantyRouter,

  // ============= CONTRACT MANAGEMENT =============
  contracts: contractsRouter,
});

export type AppRouter = typeof appRouter;
