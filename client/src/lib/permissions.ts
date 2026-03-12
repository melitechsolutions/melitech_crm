/**
 * Client-side Permission and Access Control Utilities
 * 
 * This module provides utilities for:
 * - Checking user permissions on the client side
 * - Protecting routes based on user role
 * - Filtering navigation based on permissions
 * - Providing role-aware UI rendering
 */

export type UserRole = "super_admin" | "admin" | "staff" | "accountant" | "user" | "client" | "project_manager" | "hr" | "procurement_manager" | "ict_manager" | "sales_manager";

export const ROLES = {
  SUPER_ADMIN: "super_admin" as const,
  ADMIN: "admin" as const,
  ACCOUNTANT: "accountant" as const,
  HR: "hr" as const,
  STAFF: "staff" as const,
  CLIENT: "client" as const,
  PROJECT_MANAGER: "project_manager" as const,
  ICT_MANAGER: "ict_manager" as const,
  PROCUREMENT_MANAGER: "procurement_manager" as const,
  SALES_MANAGER: "sales_manager" as const,
};

/**
 * Feature-based access control
 * Maps features to required roles
 */
export const FEATURE_ACCESS: Record<string, UserRole[]> = {
  // Admin Features
  "admin:manage_users": ["super_admin"],
  "admin:manage_roles": ["super_admin"],
  "admin:settings": ["super_admin", "admin"],
  "admin:system": ["super_admin", "admin"],

  // Accounting Features
  "accounting:invoices": ["super_admin", "admin", "accountant", "project_manager"],
  "accounting:invoices:view": ["super_admin", "admin", "accountant", "project_manager"],
  "accounting:invoices:create": ["super_admin", "admin", "accountant"],
  "accounting:invoices:edit": ["super_admin", "admin", "accountant"],
  "accounting:invoices:delete": ["super_admin", "admin"],
  "accounting:invoices:approve": ["super_admin", "admin", "accountant"],

  "accounting:payments": ["super_admin", "admin", "accountant"],
  "accounting:payments:view": ["super_admin", "admin", "accountant", "project_manager"],
  "accounting:payments:record": ["super_admin", "admin", "accountant"],
  "accounting:payments:create": ["super_admin", "admin", "accountant"],
  "accounting:payments:edit": ["super_admin", "admin", "accountant"],
  "accounting:payments:delete": ["super_admin", "admin"],

  "accounting:expenses": ["super_admin", "admin", "accountant", "project_manager"],
  "accounting:expenses:view": ["super_admin", "admin", "accountant", "project_manager"],
  "accounting:expenses:create": ["super_admin", "admin", "accountant", "staff"],
  "accounting:expenses:edit": ["super_admin", "admin", "accountant"],
  "accounting:expenses:approve": ["super_admin", "admin", "accountant"],
  "accounting:expenses:delete": ["super_admin", "admin"],

  "accounting:receipts": ["super_admin", "admin", "accountant", "project_manager"],
  "accounting:receipts:view": ["super_admin", "admin", "accountant", "project_manager"],
  "accounting:receipts:create": ["super_admin", "admin", "accountant"],
  "accounting:receipts:edit": ["super_admin", "admin", "accountant"],
  "accounting:receipts:delete": ["super_admin", "admin"],

  "accounting:reports": ["super_admin", "admin", "accountant"],
  "accounting:reports:view": ["super_admin", "admin", "accountant"],
  "accounting:chart_of_accounts": ["super_admin", "admin", "accountant"],
  "accounting:chart_of_accounts:view": ["super_admin", "admin", "accountant"],
  "accounting:reconciliation": ["super_admin", "admin", "accountant"],
  "accounting:reconciliation:view": ["super_admin", "admin", "accountant"],

  "accounting:budgets": ["super_admin", "admin", "accountant", "project_manager"],
  "accounting:budgets:view": ["super_admin", "admin", "accountant", "project_manager"],
  "accounting:budgets:create": ["super_admin", "admin", "accountant"],
  "accounting:budgets:edit": ["super_admin", "admin", "accountant"],
  "accounting:budgets:delete": ["super_admin", "admin"],

  // HR Features
  "hr:view": ["super_admin", "admin", "hr", "ict_manager"],
  "hr:employees": ["super_admin", "admin", "hr"],
  "hr:employees:view": ["super_admin", "admin", "hr", "staff", "project_manager", "ict_manager"],
  "hr:employees:create": ["super_admin", "admin", "hr"],
  "hr:employees:edit": ["super_admin", "admin", "hr"],
  "hr:employees:delete": ["super_admin", "admin"],

  // Standalone employee features (for employees router)
  "employees:read": ["super_admin", "admin", "hr", "project_manager", "ict_manager"],
  "employees:create": ["super_admin", "admin", "hr"],
  "employees:update": ["super_admin", "admin", "hr"],
  "employees:delete": ["super_admin", "admin"],

  "hr:payroll": ["super_admin", "admin", "hr"],
  "hr:payroll:view": ["super_admin", "admin", "hr", "accountant"],
  "hr:payroll:create": ["super_admin", "admin", "hr"],
  "hr:payroll:approve": ["super_admin", "admin", "hr"],

  "hr:leave": ["super_admin", "admin", "hr"],
  "hr:leave:approve": ["super_admin", "admin", "hr", "project_manager"],

  "hr:attendance": ["super_admin", "admin", "hr"],

  "hr:departments:view": ["super_admin", "admin", "hr"],
  "hr:departments:create": ["super_admin", "admin", "hr"],
  "hr:departments:edit": ["super_admin", "admin", "hr"],
  "hr:departments:delete": ["super_admin", "admin"],

  // Reports Features
  "reports:view": ["super_admin", "admin", "accountant", "project_manager", "hr", "sales_manager", "ict_manager"],
  "reports:create": ["super_admin", "admin", "accountant"],
  "reports:edit": ["super_admin", "admin", "accountant"],
  "reports:delete": ["super_admin", "admin"],

  // Phase 20 - Procurement & Assets
  "contracts:view": ["super_admin", "admin", "procurement_manager", "accountant"],
  "contracts:create": ["super_admin", "admin", "procurement_manager"],
  "contracts:edit": ["super_admin", "admin", "procurement_manager"],
  "contracts:delete": ["super_admin", "admin"],

  "assets:view": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "assets:create": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "assets:edit": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "assets:delete": ["super_admin", "admin"],

  "warranty:view": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "warranty:create": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "warranty:edit": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "warranty:delete": ["super_admin", "admin"],

  "quotations:view": ["super_admin", "admin", "procurement_manager", "accountant"],
  "quotations:create": ["super_admin", "admin", "procurement_manager"],
  "quotations:edit": ["super_admin", "admin", "procurement_manager"],
  "quotations:delete": ["super_admin", "admin"],

  "delivery_notes:view": ["super_admin", "admin", "procurement_manager", "accountant", "staff"],
  "delivery_notes:create": ["super_admin", "admin", "procurement_manager", "staff"],
  "delivery_notes:edit": ["super_admin", "admin", "procurement_manager"],
  "delivery_notes:delete": ["super_admin", "admin"],

  "grn:view": ["super_admin", "admin", "procurement_manager", "accountant", "staff"],
  "grn:create": ["super_admin", "admin", "procurement_manager", "staff"],
  "grn:edit": ["super_admin", "admin", "procurement_manager"],
  "grn:delete": ["super_admin", "admin"],

  // Sales Features
  "sales:estimates": ["super_admin", "admin", "project_manager", "sales_manager"],
  "sales:estimates:view": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],
  "sales:estimates:create": ["super_admin", "admin", "project_manager", "sales_manager"],
  "sales:estimates:send": ["super_admin", "admin", "project_manager", "sales_manager"],

  "sales:opportunities": ["super_admin", "admin", "project_manager", "sales_manager"],
  "sales:opportunities:view": ["super_admin", "admin", "project_manager", "sales_manager"],
  "sales:opportunities:create": ["super_admin", "admin", "project_manager", "sales_manager"],
  "sales:opportunities:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
  "sales:opportunities:delete": ["super_admin", "admin"],
  
  "sales:receipts": ["super_admin", "admin", "accountant", "project_manager", "sales_manager"],
  "sales:pipeline": ["super_admin", "admin", "project_manager", "sales_manager"],
  "sales:reports": ["super_admin", "admin", "project_manager", "sales_manager", "accountant"],

  // Project Features
  "projects:create": ["super_admin", "admin", "project_manager"],
  "projects:edit": ["super_admin", "admin", "project_manager"],
  "projects:delete": ["super_admin", "admin"],
  "projects:view": ["super_admin", "admin", "project_manager", "staff"],
  // Estimates features (align with backend)
  "estimates:read": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],
  "estimates:create": ["super_admin", "admin", "project_manager", "sales_manager"],
  "estimates:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
  "estimates:delete": ["super_admin", "admin"],
  "estimates:approve": ["super_admin", "admin", "project_manager"],

  // Procurement
  "procurement:view": ["super_admin", "admin", "accountant", "project_manager", "procurement_manager"],
  "procurement:suppliers": ["super_admin", "admin", "procurement_manager"],
  "procurement:suppliers:view": ["super_admin", "admin", "procurement_manager", "accountant"],
  "procurement:suppliers:create": ["super_admin", "admin", "procurement_manager"],
  "procurement:suppliers:edit": ["super_admin", "admin", "procurement_manager"],
  "procurement:suppliers:delete": ["super_admin", "admin"],

  "procurement:lpo": ["super_admin", "admin", "procurement_manager"],
  "procurement:lpo:view": ["super_admin", "admin", "procurement_manager", "accountant", "ict_manager"],
  "procurement:lpo:create": ["super_admin", "admin", "procurement_manager"],
  "procurement:lpo:edit": ["super_admin", "admin", "procurement_manager"],
  "procurement:lpo:delete": ["super_admin", "admin"],
  "procurement:lpo:approve": ["super_admin", "admin"],

  "procurement:lpos": ["super_admin", "admin", "procurement_manager"],

  "procurement:imprest": ["super_admin", "admin", "procurement_manager"],
  "procurement:imprest:view": ["super_admin", "admin", "accountant", "ict_manager", "procurement_manager"],
  "procurement:imprest:create": ["super_admin", "admin", "staff", "procurement_manager"],
  "procurement:imprest:approve": ["super_admin", "admin"],

  "procurement:orders": ["super_admin", "admin", "procurement_manager"],
  "procurement:orders:view": ["super_admin", "admin", "procurement_manager", "accountant"],
  "procurement:orders:create": ["super_admin", "admin", "procurement_manager"],
  "procurement:orders:edit": ["super_admin", "admin", "procurement_manager"],
  "procurement:orders:delete": ["super_admin", "admin"],

  // Analytics view permission
  "analytics:view": ["super_admin", "admin", "accountant", "project_manager", "ict_manager", "sales_manager", "procurement_manager"],

  // Communications/email management
  "communications:view": ["super_admin", "admin", "ict_manager"],
  "communications:read": ["super_admin", "admin", "staff", "project_manager", "hr", "ict_manager"],
  "communications:manage": ["super_admin", "admin", "ict_manager"],
  "communications:messaging": ["super_admin", "admin", "staff", "project_manager", "hr"],
  "communications:send": ["super_admin", "admin", "staff", "project_manager", "hr"],
  "communications:email": ["super_admin", "admin", "project_manager"],
  "communications:email_queue": ["super_admin", "admin", "ict_manager"],
  
  // ICT Manager specific features
  "ict:system_health": ["super_admin", "admin", "ict_manager"],
  "ict:users": ["super_admin", "admin", "ict_manager"],
  "ict:users:view": ["super_admin", "admin", "ict_manager"],
  "ict:security": ["super_admin", "admin", "ict_manager"],
  "ict:security:view": ["super_admin", "admin", "ict_manager"],
  "ict:backups": ["super_admin", "admin", "ict_manager"],
  "ict:logs": ["super_admin", "admin", "ict_manager"],
  "ict:database": ["super_admin", "admin", "ict_manager"],

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

  // Budgets Features
  "budgets:view": ["super_admin", "admin", "accountant", "project_manager"],
  "budgets:create": ["super_admin", "admin", "accountant"],
  "budgets:edit": ["super_admin", "admin", "accountant"],
  "budgets:delete": ["super_admin", "admin"],

  // Budget Features (generic)
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

  // Client Features
  "clients:read": ["super_admin", "admin", "project_manager", "accountant", "procurement_manager"],

  // Authentication utilities
  "auth:sessions": ["super_admin", "admin", "ict_manager"],
  "auth:export_user_data": ["super_admin", "admin", "user", "ict_manager"],


  // Clients
  "clients:view": ["super_admin", "admin", "project_manager", "accountant", "procurement_manager"],
  "clients:create": ["super_admin", "admin"],
  "clients:edit": ["super_admin", "admin"],

  // Services & Products
  "products:view": ["super_admin", "admin", "accountant", "project_manager"],
  "products:create": ["super_admin", "admin"],
  "products:edit": ["super_admin", "admin"],
  "products:delete": ["super_admin", "admin"],

  "services:view": ["super_admin", "admin", "accountant", "project_manager"],
  "services:create": ["super_admin", "admin"],
  "services:edit": ["super_admin", "admin"],
  "services:delete": ["super_admin", "admin"],

  // Client Portal
  "client_portal:dashboard": ["client"],
  "client_portal:invoices": ["client"],
  "client_portal:projects": ["client"],
  "client_portal:payments": ["client"],

  // AI Features (early entries kept at bottom for clarity)
  "ai:access": ["super_admin", "admin", "project_manager"],
  "ai:summarize": ["super_admin", "admin", "project_manager"],
  "ai:generateEmail": ["super_admin", "admin", "project_manager"],
  "ai:chat": ["super_admin", "admin", "project_manager"],
  "ai:financial": ["super_admin", "admin", "project_manager"],
};

/**
 * Module access control - defines which roles can access each module
 */
export const MODULE_ACCESS: Record<string, UserRole[]> = {
  // Admin modules
  settings: ["super_admin", "admin", "ict_manager"],
  users: ["super_admin", "admin"],
  reports: ["super_admin", "admin", "accountant", "staff", "project_manager", "ict_manager", "sales_manager", "procurement_manager"],
  analytics: ["super_admin", "admin", "accountant", "project_manager", "ict_manager", "sales_manager", "procurement_manager"],

  // HR modules
  employees: ["super_admin", "admin", "hr", "staff", "project_manager", "ict_manager"],
  attendance: ["super_admin", "admin", "hr", "staff", "project_manager"],
  payroll: ["super_admin", "admin", "hr", "staff", "accountant"],
  "leave-management": ["super_admin", "admin", "hr", "staff", "project_manager"],
  departments: ["super_admin", "admin", "hr", "staff"],

  // Finance modules
  invoices: ["super_admin", "admin", "accountant", "user", "client", "sales_manager"],
  payments: ["super_admin", "admin", "accountant", "user", "client"],
  "payment-reports": ["super_admin", "admin", "accountant", "project_manager"],
  "overdue-payments": ["super_admin", "admin", "accountant", "user"],
  expenses: ["super_admin", "admin", "accountant", "project_manager"],
  "bank-reconciliation": ["super_admin", "admin", "accountant"],
  "chart-of-accounts": ["super_admin", "admin", "accountant"],
  budgets: ["super_admin", "admin", "accountant", "project_manager"],
  
  // Procurement modules
  lpos: ["super_admin", "admin", "accountant", "project_manager", "procurement_manager"],
  orders: ["super_admin", "admin", "accountant", "project_manager", "procurement_manager"],
  imprests: ["super_admin", "admin", "accountant", "project_manager", "procurement_manager"],
  inventory: ["super_admin", "admin", "accountant", "staff", "project_manager"],

  // Sales and Projects modules
  clients: ["super_admin", "admin", "user", "project_manager", "sales_manager"],
  projects: ["super_admin", "admin", "user", "client", "project_manager"],
  opportunities: ["super_admin", "admin", "user", "project_manager", "sales_manager"],
  estimates: ["super_admin", "admin", "user", "project_manager", "sales_manager"],
  receipts: ["super_admin", "admin", "accountant", "user"],

  // Product/Service modules
  products: ["super_admin", "admin", "user", "project_manager"],
  services: ["super_admin", "admin", "user", "project_manager"],

  // Client portal
  "crm/client-portal": ["client"],
  "client-portal": ["client"],
};

/**
 * Role-based dashboard access
 * Determines which dashboard a user should access
 */
export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  super_admin: "/crm/super-admin",
  admin: "/crm/admin",
  accountant: "/crm/accountant",
  hr: "/crm/hr",
  project_manager: "/crm/project-manager",
  staff: "/crm/staff",
  user: "/crm",
  client: "/crm/client-portal",
  procurement_manager: "/crm/procurement",
  ict_manager: "/crm/ict",
  sales_manager: "/crm/sales",
};

/**
 * Check if user has access to a feature
 */
export function canAccessFeature(userRole: UserRole | string, feature: string): boolean {
  const allowedRoles = FEATURE_ACCESS[feature];
  if (!allowedRoles) return false;
  return allowedRoles.includes(userRole as UserRole);
}

/**
 * Check if user has access to a module
 */
export function canAccessModule(userRole: UserRole | string, module: string): boolean {
  const allowedRoles = MODULE_ACCESS[module];
  if (!allowedRoles) return false;
  return allowedRoles.includes(userRole as UserRole);
}

/**
 * Check if user is in one of the specified roles
 */
export function hasRole(userRole: UserRole | string, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole as UserRole);
}

/**
 * Get the appropriate dashboard URL for a user role
 */
export function getDashboardUrl(userRole: UserRole | string): string {
  return ROLE_DASHBOARDS[userRole as UserRole] || "/";
}

/**
 * Get all accessible features for a user role
 */
export function getAccessibleFeatures(userRole: UserRole | string): Set<string> {
  return new Set(
    Object.entries(FEATURE_ACCESS)
      .filter(([_, roles]) => roles.includes(userRole as UserRole))
      .map(([feature]) => feature)
  );
}

/**
 * Check if request is authorized for org scope
 * (useful for client-side validation before making API calls)
 */
export function canAccessOrganization(
  userRole: UserRole | string,
  userOrgId?: string,
  targetOrgId?: string
): boolean {
  // Super admin can access any org
  if (userRole === "super_admin") return true;

  // Everyone else can only access their own org
  return userOrgId === targetOrgId;
}

/**
 * Format user initials from name
 * Example: "Eliakim Mwaniki" => "ELMW"
 */
export function getInitials(name?: string): string {
  if (!name) return "N/A";
  
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

import type React from "react"
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthPersistent } from "@/_core/hooks/useAuthPersistent";
import { toast } from "sonner";

/**
 * Hook to require a specific feature permission
 * Automatically redirects unauthorized users
 */
export function useRequireFeature(feature: string) {
  const [, navigate] = useLocation();
  const { user, loading } = useAuthPersistent();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      toast.error("Please log in to access this page");
      navigate("/login");
      return;
    }

    if (!canAccessFeature(user.role, feature)) {
      toast.error(`Access denied: You don't have permission for this feature`);
      navigate(getDashboardUrl(user.role));
      return;
    }
  }, [user, loading, feature]); // Removed navigate - it's not stable

  return {
    allowed: !loading && user && canAccessFeature(user.role, feature),
    isLoading: loading,
    user,
  };
}

/**
 * Hook to require a specific module
 */
export function useRequireModule(module: string) {
  const [, navigate] = useLocation();
  const { user, loading } = useAuthPersistent();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      toast.error("Please log in to access this page");
      navigate("/login");
      return;
    }

    if (!canAccessModule(user.role, module)) {
      toast.error(`You don't have permission to access the ${module} module`);
      navigate(getDashboardUrl(user.role));
      return;
    }
  }, [user, loading, module]); // Removed navigate - it's not stable

  return {
    allowed: !loading && user && canAccessModule(user.role, module),
    isLoading: loading,
    user,
  };
}

/**
 * Hook to require specific role(s)
 */
export function useRequireRole(requiredRoles: UserRole[]) {
  const [, navigate] = useLocation();
  const { user, loading } = useAuthPersistent();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      toast.error("Please log in to access this page");
      navigate("/login");
      return;
    }

    if (!hasRole(user.role, requiredRoles)) {
      toast.error(`This page requires one of the following roles: ${requiredRoles.join(", ")}`);
      navigate(getDashboardUrl(user.role));
      return;
    }
  }, [user, loading, requiredRoles]);

  return {
    allowed: !loading && user && hasRole(user.role, requiredRoles),
    isLoading: loading,
    user,
  };
}

/**
 * Navigation items with permission requirements
 */
export interface NavItemWithPermissions {
  title: string;
  href?: string;
  icon?: React.ComponentType<any>;
  requiredFeatures?: string[];
  requiredRoles?: UserRole[];
  children?: NavItemWithPermissions[];
}

/**
 * Filter navigation items based on user permissions
 */
export function filterNavigationByRole(
  items: NavItemWithPermissions[],
  userRole: UserRole | string
): NavItemWithPermissions[] {
  return items
    .filter((item) => {
      // If no restrictions, show to everyone
      if (!item.requiredFeatures && !item.requiredRoles) return true;

      // Check feature-based access
      if (item.requiredFeatures) {
        const hasAccess = item.requiredFeatures.some((feature) =>
          canAccessFeature(userRole, feature)
        );
        if (!hasAccess) return false;
      }

      // Check role-based access
      if (item.requiredRoles) {
        if (!hasRole(userRole, item.requiredRoles)) return false;
      }

      return true;
    })
    .map((item) => ({
      ...item,
      // Recursively filter children
      children: item.children
        ? filterNavigationByRole(item.children, userRole)
        : undefined,
    }))
    .filter((item) => {
      // Remove items with no accessible children
      if (item.children && item.children.length === 0 && !item.href) {
        return false;
      }
      return true;
    });
}

/**
 * Navigation items for each role
 */
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  roles: UserRole[];
}

export const NAVIGATION_ITEMS: NavItem[] = [
  // HR Section
  {
    label: "HR Management",
    href: "/hr",
    icon: "Users",
    roles: ["super_admin", "admin", "staff", "project_manager"],
    children: [
      {
        label: "Employees",
        href: "/employees",
        roles: ["super_admin", "admin", "staff", "project_manager"],
      },
      {
        label: "Attendance",
        href: "/attendance",
        roles: ["super_admin", "admin", "staff", "project_manager"],
      },
      {
        label: "Payroll",
        href: "/payroll",
        roles: ["super_admin", "admin", "staff", "accountant"],
      },
      {
        label: "Leave Management",
        href: "/leave-management",
        roles: ["super_admin", "admin", "staff", "project_manager"],
      },
      {
        label: "Departments",
        href: "/departments",
        roles: ["super_admin", "admin", "staff"],
      },
    ],
  },

  // Sales & Projects Section
  {
    label: "Sales & Projects",
    href: "/sales",
    icon: "TrendingUp",
    roles: ["super_admin", "admin", "user", "project_manager", "sales_manager"],
    children: [
      {
        label: "Clients",
        href: "/clients",
        roles: ["super_admin", "admin", "user", "project_manager", "sales_manager"],
      },
      {
        label: "Projects",
        href: "/projects",
        roles: ["super_admin", "admin", "user", "client", "project_manager"],
      },
      {
        label: "Opportunities",
        href: "/opportunities",
        roles: ["super_admin", "admin", "user", "project_manager", "sales_manager"],
      },
      {
        label: "Estimates",
        href: "/estimates",
        roles: ["super_admin", "admin", "user", "project_manager", "sales_manager"],
      },
    ],
  },

  // Accounting Section
  {
    label: "Accounting",
    href: "/accounting",
    icon: "DollarSign",
    roles: ["super_admin", "admin", "accountant", "user", "project_manager", "sales_manager", "procurement_manager"],
    children: [
      {
        label: "Invoices",
        href: "/invoices",
        roles: ["super_admin", "admin", "accountant", "user", "client", "sales_manager"],
      },
      {
        label: "Payments",
        href: "/payments",
        roles: ["super_admin", "admin", "accountant", "user", "client"],
      },
      {
        label: "Payment Reports",
        href: "/payments/reports",
        roles: ["super_admin", "admin", "accountant", "project_manager", "sales_manager"],
      },
      {
        label: "Overdue Payments",
        href: "/payments/overdue",
        roles: ["super_admin", "admin", "accountant", "user"],
      },
      {
        label: "Expenses",
        href: "/expenses",
        roles: ["super_admin", "admin", "accountant", "project_manager"],
      },
      {
        label: "Bank Reconciliation",
        href: "/bank-reconciliation",
        roles: ["super_admin", "admin", "accountant"],
      },
      {
        label: "Chart of Accounts",
        href: "/chart-of-accounts",
        roles: ["super_admin", "admin", "accountant"],
      },
      {
        label: "Budgets",
        href: "/budgets",
        roles: ["super_admin", "admin", "accountant", "project_manager"],
      },
    ],
  },

  // Procurement Section
  {
    label: "Procurement",
    href: "/procurement",
    icon: "ShoppingCart",
    roles: ["super_admin", "admin", "accountant", "project_manager", "procurement_manager"],
    children: [
      {
        label: "Local Purchase Orders (LPO)",
        href: "/lpos",
        roles: ["super_admin", "admin", "accountant", "project_manager", "procurement_manager"],
      },
      {
        label: "Create LPO",
        href: "/create-lpo",
        roles: ["super_admin", "admin", "accountant", "project_manager", "procurement_manager"],
      },
      {
        label: "Purchase Orders",
        href: "/orders",
        roles: ["super_admin", "admin", "accountant", "project_manager", "procurement_manager"],
      },
      {
        label: "Create Purchase Order",
        href: "/create-purchase-order",
        roles: ["super_admin", "admin", "accountant", "project_manager", "procurement_manager"],
      },
      {
        label: "Imprests",
        href: "/imprests",
        roles: ["super_admin", "admin", "accountant", "project_manager", "procurement_manager"],
      },
      {
        label: "Request Imprest",
        href: "/create-imprest",
        roles: ["super_admin", "admin", "accountant", "project_manager", "procurement_manager"],
      },
      {
        label: "Inventory & Stocks",
        href: "/inventory",
        roles: ["super_admin", "admin", "accountant", "staff", "project_manager"],
      },
      {
        label: "Quotations & RFQs",
        href: "/quotations",
        roles: ["super_admin", "admin", "procurement_manager", "accountant"],
      },
      {
        label: "Delivery Notes",
        href: "/delivery-notes",
        roles: ["super_admin", "admin", "procurement_manager", "accountant", "staff"],
      },
      {
        label: "Goods Received Notes",
        href: "/grn",
        roles: ["super_admin", "admin", "procurement_manager", "accountant", "staff"],
      },
      {
        label: "Assets",
        href: "/assets",
        roles: ["super_admin", "admin", "ict_manager", "procurement_manager"],
      },
      {
        label: "Warranty Management",
        href: "/warranty",
        roles: ["super_admin", "admin", "ict_manager", "procurement_manager"],
      },
      {
        label: "Contracts",
        href: "/contracts",
        roles: ["super_admin", "admin", "procurement_manager", "accountant"],
      },
    ],
  },

  // Products & Services
  {
    label: "Products & Services",
    href: "#",
    icon: "Package",
    roles: ["super_admin", "admin", "user", "project_manager"],
    children: [
      {
        label: "Products",
        href: "/products",
        roles: ["super_admin", "admin", "user", "project_manager"],
      },
      {
        label: "Services",
        href: "/services",
        roles: ["super_admin", "admin", "user", "project_manager"],
      },
    ],
  },

  // Reports
  {
    label: "Reports",
    href: "/reports",
    icon: "BarChart3",
    roles: ["super_admin", "admin", "accountant", "staff", "project_manager"],
  },

  // Settings
  {
    label: "Settings",
    href: "/settings",
    icon: "Settings",
    roles: ["super_admin", "admin"],
  },

  // Account
  {
    label: "Account",
    href: "/account",
    icon: "User",
    roles: ["super_admin", "admin", "staff", "accountant", "user", "client", "project_manager"],
  },

  // Support & Communications
  {
    label: "Support & Communications",
    href: "#",
    icon: "MessageSquare",
    roles: ["super_admin", "admin", "staff", "accountant", "user", "project_manager"],
    children: [
      {
        label: "Tickets",
        href: "/tickets",
        roles: ["super_admin", "admin", "staff", "accountant", "user", "project_manager"],
      },
      {
        label: "Communications",
        href: "/communications",
        roles: ["super_admin", "admin", "staff", "accountant", "user", "project_manager"],
      },
      {
        label: "Messages",
        href: "/messages",
        roles: ["super_admin", "admin", "staff", "accountant", "user", "project_manager"],
      },
      {
        label: "Activity",
        href: "/activity",
        roles: ["super_admin", "admin", "staff", "accountant", "user", "project_manager"],
      },
      {
        label: "Documentation",
        href: "/documentation",
        roles: ["super_admin", "admin", "staff", "accountant", "user", "project_manager"],
      },
      {
        label: "User Guide",
        href: "/user-guide",
        roles: ["super_admin", "admin", "staff", "accountant", "user", "project_manager"],
      },
      {
        label: "Troubleshooting",
        href: "/troubleshooting",
        roles: ["super_admin", "admin", "staff", "accountant", "user", "project_manager"],
      },
    ],
  },

  // Time Tracking
  {
    label: "Time Tracking",
    href: "/time-tracking",
    icon: "Clock",
    roles: ["super_admin", "admin", "staff", "project_manager"],
  },

  // Workflow & Automation
  {
    label: "Workflow & Automation",
    href: "/workflow-automation",
    icon: "Zap",
    roles: ["super_admin", "admin", "project_manager"],
  },

  // Approvals
  {
    label: "Approvals",
    href: "/approvals",
    icon: "CheckCircle2",
    roles: ["super_admin", "admin", "staff", "accountant", "user", "project_manager"],
  },

  // Financial Dashboard
  {
    label: "Financial Dashboard",
    href: "/financial-dashboard",
    icon: "TrendingUp",
    roles: ["super_admin", "admin", "accountant"],
  }
];

/**
 * Check if a user role has access to a module
 */
export function hasModuleAccess(userRole: UserRole | undefined, module: string): boolean {
  if (!userRole) return false;
  const allowedRoles = MODULE_ACCESS[module];
  return allowedRoles ? allowedRoles.includes(userRole) : false;
}

/**
 * Get navigation items for a specific role
 */
export function getNavigationForRole(userRole: UserRole | undefined): NavItem[] {
  if (!userRole) return [];
  return NAVIGATION_ITEMS.filter((item) => item.roles.includes(userRole)).map((item) => ({
    ...item,
    children: item.children?.filter((child) => child.roles.includes(userRole)),
  }));
}

/**
 * Check if a user can access a specific route
 */
export function canAccessRoute(userRole: UserRole | undefined, route: string): boolean {
  if (!userRole) return false;

  // Extract module from route (e.g., /employees/create -> employees)
  const routeParts = route.split("/").filter(Boolean);
  if (routeParts.length === 0) return true; // Allow root

  const module = routeParts[0];
  return hasModuleAccess(userRole, module);
}

/**
 * Get all permissions for a specific role
 */
export function getRolePermissions(userRole: UserRole | undefined): string[] {
  if (!userRole) return [];

  const permissions: string[] = [];
  Object.entries(MODULE_ACCESS).forEach(([module, roles]) => {
    if (userRole && roles.includes(userRole)) {
      permissions.push(module);
    }
  });
  return permissions;
}
