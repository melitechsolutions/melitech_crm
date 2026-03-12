/**
 * Enhanced Role-Based Access Control (RBAC) Middleware
 * 
 * This module provides factory functions to create TRPC procedures
 * with built-in permission enforcement at the API level.
 */

import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../_core/trpc";

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  ACCOUNTANT: "accountant",
  HR: "hr",
  STAFF: "staff",
  CLIENT: "client",
  PROJECT_MANAGER: "project_manager",
  PROCUREMENT_MANAGER: "procurement_manager",
  ICT_MANAGER: "ict_manager",
  SALES_MANAGER: "sales_manager",
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

/**
 * Role-based access permissions mapping
 * Defines which roles can access which features
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: [
    "admin:manage_users",
    "admin:manage_roles",
    "admin:settings",
    "admin:system",
    "accounting:*",
    "hr:*",
    "sales:*",
    "projects:*",
    "clients:*",
    "procurement:*",
  ],
  admin: [
    "accounting:*",
    "hr:manage_staff",
    "sales:*",
    "projects:*",
    "clients:*",
    "procurement:*",
  ],
  accountant: [
    "accounting:invoices",
    "accounting:payments",
    "accounting:expenses",
    "accounting:reports",
    "accounting:chart_of_accounts",
    "accounting:reconciliation",
  ],
  hr: [
    "hr:employees",
    "hr:payroll",
    "hr:leave",
    "hr:attendance",
    "hr:departments",
  ],
  project_manager: [
    "projects:*",
    "clients:view",
    "sales:view",
    "accounting:view_invoices",
  ],
  staff: [
    "projects:view_own",
    "clients:view",
    "hr:view_own_records",
  ],
  client: [
    "client_portal:dashboard",
    "client_portal:invoices",
    "client_portal:projects",
    "client_portal:payments",
  ],
  procurement_manager: [
    "procurement:*",
    "accounting:view",
    "accounting:expenses:view",
    "accounting:payments:view",
    "clients:view",
    "products:view",
    "suppliers:*",
  ],
  ict_manager: [
    // views only for core data, plus system/technical access
    "accounting:invoices:view",
    "accounting:payments:view",
    "accounting:expenses:view",
    "accounting:reports:view",
    "hr:employees:view",
    "hr:departments:view",
    "projects:view",
    "clients:view",
    "procurement:lpo:view",
    "procurement:imprest:view",
    "analytics:view",
    // technical features
    "admin:system",
    "admin:settings",
    "communications:email_queue",
  ],
  sales_manager: [
    "sales:*",
    "clients:*",
    "projects:view",
    "accounting:invoices:view",
    "accounting:invoices:create",
    "accounting:payments:view",
    "accounting:expenses:view",
    "accounting:reports:view",
    "estimates:*",
    "opportunities:*",
    "receipts:view",
    "analytics:view",
  ],
};

/**
 * Feature-based access mapping
 * Maps features and modules to required roles
 */
export const FEATURE_ACCESS: Record<string, UserRole[]> = {
  // Admin Features
  "admin:manage_users": ["super_admin"],
  "admin:manage_roles": ["super_admin"],
  "admin:settings": ["super_admin", "admin", "ict_manager"],
  "admin:system": ["super_admin", "admin", "ict_manager"],

  // User Management & Permissions
  "users:edit": ["super_admin", "admin"],
  "users:view": ["super_admin", "admin"],
  "users:create": ["super_admin", "admin"],
  "users:delete": ["super_admin", "admin"],
  "users:update": ["super_admin", "admin"],
  "users:permissions": ["super_admin"],
  "users:permissions:edit": ["super_admin"],
  "users:permissions:view": ["super_admin"],
  "users:roles": ["super_admin"],
  "users:roles:edit": ["super_admin"],
  "users:read": ["super_admin", "admin"],

  // Accounting Features
  "accounting:invoices": ["super_admin", "admin", "accountant", "project_manager", "sales_manager"],
  "accounting:invoices:view": ["super_admin", "admin", "accountant", "project_manager", "sales_manager"],
  "accounting:invoices:create": ["super_admin", "admin", "accountant", "sales_manager"],
  "accounting:invoices:edit": ["super_admin", "admin", "accountant"],
  "accounting:invoices:delete": ["super_admin", "admin"],
  "accounting:invoices:approve": ["super_admin", "admin", "accountant"],
  
  // Generic accounting permissions (used by bankReconciliation)
  "accounting:read": ["super_admin", "admin", "accountant", "project_manager"],
  "accounting:create": ["super_admin", "admin", "accountant"],
  "accounting:edit": ["super_admin", "admin", "accountant"],
  "accounting:delete": ["super_admin", "admin"],

  "accounting:receipts": ["super_admin", "admin", "accountant", "project_manager"],
  "accounting:receipts:view": ["super_admin", "admin", "accountant", "project_manager"],
  "accounting:receipts:create": ["super_admin", "admin", "accountant"],
  "accounting:receipts:edit": ["super_admin", "admin", "accountant"],
  "accounting:receipts:delete": ["super_admin", "admin"],

  "accounting:payments": ["super_admin", "admin", "accountant"],
  "accounting:payments:view": ["super_admin", "admin", "accountant", "project_manager", "sales_manager"],
  "accounting:payments:record": ["super_admin", "admin", "accountant"],
  "accounting:payments:create": ["super_admin", "admin", "accountant"],
  "accounting:payments:edit": ["super_admin", "admin", "accountant"],
  "accounting:payments:delete": ["super_admin", "admin"],
  "accounting:payments:approve": ["super_admin", "admin", "accountant"],
  "accounting:payments:reconcile": ["super_admin", "admin", "accountant"],
  "accounting:payments:refund": ["super_admin", "admin"],

  "accounting:expenses": ["super_admin", "admin", "accountant", "project_manager"],
  "accounting:expenses:view": ["super_admin", "admin", "accountant", "project_manager"],
  "accounting:expenses:create": ["super_admin", "admin", "accountant", "staff"],
  "accounting:expenses:edit": ["super_admin", "admin", "accountant"],
  "accounting:expenses:approve": ["super_admin", "admin", "accountant"],
  "accounting:expenses:reject": ["super_admin", "admin", "accountant"],
  "accounting:expenses:delete": ["super_admin", "admin"],
  "accounting:expenses:budget": ["super_admin", "admin", "accountant"],

  "accounting:reports": ["super_admin", "admin", "accountant"],
  "accounting:reports:view": ["super_admin", "admin", "accountant"],
  "accounting:chart_of_accounts": ["super_admin", "admin", "accountant"],
  "accounting:chart_of_accounts:view": ["super_admin", "admin", "accountant"],
  "accounting:reconciliation": ["super_admin", "admin", "accountant"],
  "accounting:reconciliation:view": ["super_admin", "admin", "accountant"],

  // HR Features
  "hr:view": ["super_admin", "admin", "hr"],
  "hr:employees": ["super_admin", "admin", "hr"],
  "hr:employees:view": ["super_admin", "admin", "hr", "project_manager"],
  "hr:employees:create": ["super_admin", "admin", "hr"],
  "hr:employees:edit": ["super_admin", "admin", "hr"],
  "hr:employees:delete": ["super_admin", "admin"],

  // Standalone employee read/write features (used by employees router directly)
  "employees:read": ["super_admin", "admin", "hr", "project_manager", "ict_manager"],
  "employees:create": ["super_admin", "admin", "hr"],
  "employees:update": ["super_admin", "admin", "hr"],
  "employees:delete": ["super_admin", "admin"],

  "hr:departments": ["super_admin", "admin", "hr"],
  "hr:departments:view": ["super_admin", "admin", "hr"],
  "hr:departments:create": ["super_admin", "admin", "hr"],
  "hr:departments:edit": ["super_admin", "admin", "hr"],
  "hr:departments:delete": ["super_admin", "admin"],

  "hr:jobGroups": ["super_admin", "admin", "hr"],
  "hr:jobGroups:view": ["super_admin", "admin", "hr"],
  "hr:jobGroups:create": ["super_admin", "admin", "hr"],
  "hr:jobGroups:edit": ["super_admin", "admin", "hr"],
  "hr:jobGroups:delete": ["super_admin", "admin"],

  // Standalone job groups (used by jobGroups router)
  "jobGroups:read": ["super_admin", "admin", "hr"],
  "jobGroups:create": ["super_admin", "admin", "hr"],
  "jobGroups:edit": ["super_admin", "admin", "hr"],
  "jobGroups:delete": ["super_admin", "admin"],

  "hr:payroll": ["super_admin", "admin", "hr"],
  "hr:payroll:view": ["super_admin", "admin", "hr"],
  "hr:payroll:create": ["super_admin", "admin", "hr"],
  "hr:payroll:approve": ["super_admin", "admin", "hr"],

  "hr:leave": ["super_admin", "admin", "hr"],
  "hr:leave:approve": ["super_admin", "admin", "hr"],

  "hr:attendance": ["super_admin", "admin", "hr"],

  // Generic HR attendance permissions
  "attendance:read": ["super_admin", "admin", "hr"],
  "attendance:create": ["super_admin", "admin", "hr"],
  "attendance:edit": ["super_admin", "admin", "hr"],
  "attendance:delete": ["super_admin", "admin"],

  // Standalone estimate features (used by estimates router)
  "estimates:read": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],
  "estimates:create": ["super_admin", "admin", "project_manager", "sales_manager"],
  "estimates:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
  "estimates:delete": ["super_admin", "admin"],
  "estimates:approve": ["super_admin", "admin", "project_manager", "sales_manager"],
  "estimates:send": ["super_admin", "admin", "project_manager", "sales_manager"],
  "estimates:view": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],

  // Estimates to Approvals (route estimates through approval system)
  "estimates:submit_for_approval": ["super_admin", "admin", "project_manager", "sales_manager"],
  "estimates:approvals": ["super_admin", "admin", "accountant"],

  "sales:receipts": ["super_admin", "admin", "accountant", "project_manager", "sales_manager"],


  // Procurement
  "procurement:view": ["super_admin", "admin", "procurement_manager"],
  "procurement:suppliers": ["super_admin", "admin"],
  "procurement:suppliers:view": ["super_admin", "admin"],
  "procurement:suppliers:create": ["super_admin", "admin"],
  "procurement:suppliers:edit": ["super_admin", "admin"],
  "procurement:suppliers:delete": ["super_admin", "admin"],

  "procurement:lpo": ["super_admin", "admin"],
  "procurement:lpo:view": ["super_admin", "admin", "accountant", "project_manager"],
  "procurement:lpo:create": ["super_admin", "admin", "project_manager"],
  "procurement:lpo:edit": ["super_admin", "admin", "project_manager"],
  "procurement:lpo:delete": ["super_admin", "admin"],
  "procurement:lpo:approve": ["super_admin", "admin"],

  "procurement:imprest": ["super_admin", "admin"],
  "procurement:imprest:view": ["super_admin", "admin", "accountant"],
  "procurement:imprest:create": ["super_admin", "admin", "staff"],
  "procurement:imprest:edit": ["super_admin", "admin"],
  "procurement:imprest:delete": ["super_admin", "admin"],
  "procurement:imprest:approve": ["super_admin", "admin"],

  "procurement:orders": ["super_admin", "admin"],
  "procurement:orders:view": ["super_admin", "admin", "procurement_manager"],
  "procurement:orders:create": ["super_admin", "admin", "procurement_manager"],
  "procurement:orders:edit": ["super_admin", "admin", "procurement_manager"],
  "procurement:orders:delete": ["super_admin", "admin"],
  // Analytics view permission used by dashboard and reports
  "analytics:view": ["super_admin", "admin", "accountant", "project_manager", "ict_manager", "sales_manager"],

  // Communications / email queue management
  "communications:email_queue": ["super_admin", "admin", "ict_manager"],

  // Authentication utilities
  "auth:sessions": ["super_admin", "admin", "ict_manager"],
  "auth:export_user_data": ["super_admin", "admin", "ict_manager"],

  // Clients Features
  "clients:view": ["super_admin", "admin", "accountant", "project_manager", "procurement_manager", "sales_manager"],
  "clients:create": ["super_admin", "admin", "project_manager", "sales_manager"],
  "clients:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
  "clients:delete": ["super_admin", "admin"],
  "clients:manage_relationships": ["super_admin", "admin", "project_manager", "sales_manager"],

  // Products & Services
  "products:view": ["super_admin", "admin", "accountant", "project_manager", "staff", "procurement_manager"],
  "products:create": ["super_admin", "admin"],
  "products:edit": ["super_admin", "admin"],
  "products:delete": ["super_admin", "admin"],
  "products:manage_inventory": ["super_admin", "admin", "procurement_manager"],

  "services:view": ["super_admin", "admin", "project_manager", "staff"],
  "services:create": ["super_admin", "admin"],
  "services:edit": ["super_admin", "admin"],
  "services:delete": ["super_admin", "admin"],

  // Projects Features
  "projects:view": ["super_admin", "admin", "project_manager", "staff"],
  "projects:create": ["super_admin", "admin", "project_manager"],
  "projects:edit": ["super_admin", "admin", "project_manager"],
  "projects:delete": ["super_admin", "admin"],
  "projects:manage_team": ["super_admin", "admin", "project_manager"],
  "projects:manage_milestones": ["super_admin", "admin", "project_manager"],
  "projects:manage_budget": ["super_admin", "admin", "accountant", "project_manager"],

  // Sales Features
  "sales:view": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],
  "sales:create": ["super_admin", "admin", "project_manager", "sales_manager"],
  "sales:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
  "sales:delete": ["super_admin", "admin"],
  "sales:pipeline": ["super_admin", "admin", "project_manager", "sales_manager"],
  "sales:opportunities": ["super_admin", "admin", "project_manager", "sales_manager"],
  "sales:opportunities:create": ["super_admin", "admin", "project_manager", "sales_manager"],
  "sales:opportunities:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
  "sales:opportunities:delete": ["super_admin", "admin"],

  // Dashboard Features
  "dashboard:view": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "sales_manager"],
  "dashboard:customize": ["super_admin", "admin", "project_manager", "sales_manager"],
  "dashboard:edit": ["super_admin", "admin"],

  // Departments Features
  "departments:view": ["super_admin", "admin", "hr", "project_manager"],
  "departments:create": ["super_admin", "admin", "hr"],
  "departments:edit": ["super_admin", "admin", "hr"],
  "departments:delete": ["super_admin", "admin"],
  "departments:read": ["super_admin", "admin", "hr", "project_manager"],

  // Reports Features (with department access)
  "reports:view": ["super_admin", "admin", "accountant", "project_manager", "hr", "sales_manager", "ict_manager"],
  "reports:create": ["super_admin", "admin"],
  "reports:financial": ["super_admin", "admin", "accountant"],
  "reports:sales": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],
  "reports:projects": ["super_admin", "admin", "project_manager"],
  "reports:hr": ["super_admin", "admin", "hr"],
  "reports:procurement": ["super_admin", "admin", "procurement_manager"],
  "reports:export": ["super_admin", "admin", "accountant", "project_manager", "hr"],
  "reports:departments": ["super_admin", "admin", "hr"],

  // AI Features - Chat & Assistance
  "ai:access": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff"],
  "ai:summarize": ["super_admin", "admin", "project_manager", "sales_manager"],
  "ai:generateEmail": ["super_admin", "admin", "project_manager", "sales_manager"],
  "ai:chat": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff"],
  "ai:financial": ["super_admin", "admin", "project_manager", "sales_manager"],
  "ai:modal": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff"],

  // Chat/IntraChat Features
  "communications:chat": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager"],
  "communications:intrachat": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager"],
  "communications:ai_assistant": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager"],

  // Support & Communications
  "communications:view": ["super_admin", "admin", "staff", "project_manager", "hr"],
  "communications:manage": ["super_admin", "admin"],

  // Notifications
  "notifications:read": ["super_admin", "admin", "staff", "project_manager", "hr"],
  "notifications:create": ["super_admin", "admin", "staff", "project_manager", "hr"],
  "communications:email": ["super_admin", "admin"],
  "communications:notifications": ["super_admin", "admin"],
  "communications:tickets": ["super_admin", "admin", "staff"],
  "communications:tickets:create": ["super_admin", "admin", "staff"],
  "communications:tickets:resolve": ["super_admin", "admin"],

  // System Settings
  "settings:view": ["super_admin", "admin"],
  "settings:edit": ["super_admin", "admin"],
  "settings:company": ["super_admin", "admin"],
  "settings:billing": ["super_admin", "admin"],
  "settings:integrations": ["super_admin", "admin"],
  "settings:security": ["super_admin"],
  "settings:roles": ["super_admin"],
  "settings:audit": ["super_admin", "admin"],

  // Tools & Utilities
  "tools:import_export": ["super_admin", "admin"],
  "import:create": ["super_admin", "admin"],
  "import:read": ["super_admin", "admin"],
  "import:restore": ["super_admin", "admin"],
  "export:create": ["super_admin", "admin"],
  "data:import": ["super_admin", "admin"],
  "data:export": ["super_admin", "admin"],
  "tools:data_backup": ["super_admin", "admin"],
  "tools:system_health": ["super_admin", "admin"],
  "tools:api_management": ["super_admin", "admin"],
  "tools:automation": ["super_admin", "admin"],
  "tools:workflows": ["super_admin", "admin"],

  // Client Portal
  "client_portal:dashboard": ["client"],
  "client_portal:invoices": ["client"],
  "client_portal:projects": ["client"],
  "client_portal:payments": ["client"],

  // Approvals Features
  "approvals:view": ["super_admin", "admin", "accountant", "hr"],
  "approvals:read": ["super_admin", "admin", "accountant", "hr"],
  "approvals:approve": ["super_admin", "admin", "accountant", "hr"],
  "approvals:reject": ["super_admin", "admin", "accountant", "hr"],
  "approvals:delete": ["super_admin", "admin"],

  // Chart of Accounts Features
  "chartOfAccounts:read": ["super_admin", "admin", "accountant"],
  "chartOfAccounts:create": ["super_admin", "admin", "accountant"],
  "chartOfAccounts:edit": ["super_admin", "admin", "accountant"],
  "chartOfAccounts:delete": ["super_admin", "admin"],

  // Budgets Features (prefix: budgets)
  "budgets:view": ["super_admin", "admin", "accountant", "project_manager"],
  "budgets:create": ["super_admin", "admin", "accountant"],
  "budgets:edit": ["super_admin", "admin", "accountant"],
  "budgets:delete": ["super_admin", "admin"],

  // Budget Features (prefix: budget - used by budget router)
  "budget:read": ["super_admin", "admin", "accountant", "project_manager"],
  "budget:edit": ["super_admin", "admin", "accountant"],

  // Invoice Features
  "invoices:view": ["super_admin", "admin", "accountant", "project_manager"],
  "invoices:create": ["super_admin", "admin", "accountant"],
  "invoices:edit": ["super_admin", "admin", "accountant"],
  "invoices:delete": ["super_admin", "admin"],
  "invoices:read": ["super_admin", "admin", "accountant", "project_manager"],

  // Expense Features
  "expenses:view": ["super_admin", "admin", "accountant", "project_manager"],
  "expenses:create": ["super_admin", "admin", "accountant", "staff"],
  "expenses:edit": ["super_admin", "admin", "accountant"],
  "expenses:delete": ["super_admin", "admin"],
  "expenses:read": ["super_admin", "admin", "accountant", "project_manager"],

  // Payment Features
  "payments:view": ["super_admin", "admin", "accountant", "project_manager"],
  "payments:create": ["super_admin", "admin", "accountant"],
  "payments:edit": ["super_admin", "admin", "accountant"],
  "payments:delete": ["super_admin", "admin"],
  "payments:read": ["super_admin", "admin", "accountant", "project_manager"],
  "payments:reconcile": ["super_admin", "admin", "accountant"],

  // Client Features (ensure all CRUD operations exist)
  "clients:read": ["super_admin", "admin", "project_manager", "accountant", "procurement_manager"],

  // Communications Features
  "communications:read": ["super_admin", "admin", "staff", "project_manager", "hr"],
  "communications:messaging": ["super_admin", "admin", "staff", "project_manager", "hr"],
  "communications:send": ["super_admin", "admin", "staff", "project_manager", "hr"],

  // Filters & Saved Views
  "filters:create": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "procurement_manager", "sales_manager"],
  "filters:read": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "procurement_manager", "sales_manager"],
  "filters:update": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "procurement_manager", "sales_manager"],
  "filters:delete": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "procurement_manager", "sales_manager"],

  // Phase 20 - Business Intelligence & Analytics
  "analytics:reports": ["super_admin", "admin", "accountant", "project_manager", "hr", "sales_manager"],
  "analytics:dashboards": ["super_admin", "admin", "project_manager", "accountant"],
  "analytics:export": ["super_admin", "admin", "accountant"],

  // Phase 20 - Supplier Management
  "suppliers:view": ["super_admin", "admin", "procurement_manager"],
  "suppliers:create": ["super_admin", "admin", "procurement_manager"],
  "suppliers:edit": ["super_admin", "admin", "procurement_manager"],
  "suppliers:delete": ["super_admin", "admin"],
  "suppliers:read": ["super_admin", "admin", "procurement_manager"],

  // Phase 20 - Quotations/RFQs
  "quotations:view": ["super_admin", "admin", "procurement_manager", "accountant"],
  "quotations:create": ["super_admin", "admin", "procurement_manager"],
  "quotations:edit": ["super_admin", "admin", "procurement_manager"],
  "quotations:delete": ["super_admin", "admin"],
  "quotations:approve": ["super_admin", "admin"],

  // Phase 20 - Delivery Notes  
  "delivery_notes:view": ["super_admin", "admin", "procurement_manager", "accountant", "staff"],
  "delivery_notes:create": ["super_admin", "admin", "procurement_manager", "staff"],
  "delivery_notes:edit": ["super_admin", "admin", "procurement_manager"],
  "delivery_notes:delete": ["super_admin", "admin"],

  // Phase 20 - Goods Received Notes
  "grn:view": ["super_admin", "admin", "procurement_manager", "accountant", "staff"],
  "grn:create": ["super_admin", "admin", "procurement_manager", "staff"],
  "grn:edit": ["super_admin", "admin", "procurement_manager"],
  "grn:delete": ["super_admin", "admin"],

  // Phase 20 - Warranty Management
  "warranty:view": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "warranty:create": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "warranty:edit": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "warranty:delete": ["super_admin", "admin"],

  // Phase 20 - Asset Management
  "assets:view": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "assets:create": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "assets:edit": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "assets:delete": ["super_admin", "admin"],

  // Phase 20 - Document Management
  "documents:view": ["super_admin", "admin", "staff", "project_manager"],
  "documents:create": ["super_admin", "admin", "staff", "project_manager"],
  "documents:edit": ["super_admin", "admin", "project_manager"],
  "documents:delete": ["super_admin", "admin"],
  "documents:upload": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant"],

  // Phase 20 - Contract Management
  "contracts:view": ["super_admin", "admin", "procurement_manager", "accountant"],
  "contracts:create": ["super_admin", "admin", "procurement_manager"],
  "contracts:edit": ["super_admin", "admin", "procurement_manager"],
  "contracts:delete": ["super_admin", "admin"],
  "contracts:approve": ["super_admin", "admin"],

  // Remaining missing features
  "leave:read": ["super_admin", "admin", "hr"],
  "leave:approve": ["super_admin", "admin", "hr"],
  "leave:create": ["super_admin", "admin", "hr", "staff"],
  "leave:delete": ["super_admin", "admin", "hr"]
};

/**
 * Check if user has permission for a feature
 * Supports both explicit features and wildcard permissions
 * 
 * Examples:
 * - canAccessFeature("super_admin", "clients:read")
 * - With ROLE_PERMISSIONS["super_admin"] = ["clients:*"], this returns true
 */
export function canAccessFeature(userRole: UserRole, feature: string): boolean {
  // First, check if the exact feature is in FEATURE_ACCESS
  const allowedRoles = FEATURE_ACCESS[feature];
  if (allowedRoles && allowedRoles.includes(userRole)) {
    return true;
  }

  // Second, check if user has wildcard permission for this feature
  // Example: feature="clients:read", userRole has "clients:*" in ROLE_PERMISSIONS
  const userPermissions = ROLE_PERMISSIONS[userRole];
  if (!userPermissions) return false;

  // Extract the module prefix from the feature (e.g., "clients" from "clients:read")
  const modulePrefix = feature.split(":")[0];

  // Check if user has wildcard permission for this module
  return userPermissions.includes(`${modulePrefix}:*`);
}

/**
 * Create a role-restricted procedure
 */
export function createRoleRestrictedProcedure(allowedRoles: UserRole[]) {
  return protectedProcedure.use(({ ctx, next }) => {
    if (!allowedRoles.includes(ctx.user.role as UserRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}. Your role: ${ctx.user.role}`,
      });
    }
    return next({ ctx });
  });
}

/**
 * Create a feature-restricted procedure
 */
export function createFeatureRestrictedProcedure(feature: string) {
  return protectedProcedure.use(({ ctx, next }) => {
    const userRole = ctx.user.role as UserRole;
    if (!canAccessFeature(userRole, feature)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Access denied. You don't have permission to access: ${feature}`,
      });
    }
    return next({ ctx });
  });
}

/**
 * Get all accessible features for a user role
 */
export function getAccessibleFeatures(userRole: UserRole): string[] {
  return Object.entries(FEATURE_ACCESS)
    .filter(([_, roles]) => roles.includes(userRole))
    .map(([feature]) => feature);
}

/**
 * Check if organization scopes match (for multi-org systems)
 */
export function checkOrgScopeAccess(ctx: any, targetOrgId: string): boolean {
  // If user is super admin, they can access any org
  if (ctx.user.role === "super_admin") return true;
  
  // Otherwise, user can only access their own org
  return ctx.user.organizationId === targetOrgId;
}

/**
 * Create an org-scoped procedure
 */
export function createOrgScopedProcedure() {
  return protectedProcedure.use(({ ctx, next }) => {
    if (!ctx.user.organizationId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User must be part of an organization to access this resource",
      });
    }
    return next({ ctx });
  });
}
