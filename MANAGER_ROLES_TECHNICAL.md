# Manager Roles Implementation - Technical Details

## Overview
This document provides detailed technical information about how manager roles are implemented in the Melitech CRM system.

## Architecture

### Three-Layer Permission System

```
┌─────────────────────────────────────────────────┐
│ 1. CLIENT LAYER (React)                         │
│    - Displays/hides UI based on permissions      │
│    - client/src/lib/permissions.ts               │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│ 2. API LAYER (TRPC Procedures)                  │
│    - Enforces permissions on procedures          │
│    - server/middleware/enhancedRbac.ts           │
│    - createFeatureRestrictedProcedure            │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│ 3. DATABASE LAYER (MySQL)                       │
│    - Stores user roles and enforces at DB level  │
│    - users.role ENUM field                       │
│    - Migrations: 0031_add_manager_roles.sql      │
└─────────────────────────────────────────────────┘
```

## File Structure

```
melitech_crm/
├── client/
│   └── src/
│       └── lib/
│           └── permissions.ts              ← CLIENT PERMISSIONS
├── server/
│   ├── middleware/
│   │   ├── rbac.ts                        ← BASIC RBAC
│   │   └── enhancedRbac.ts                ← ENHANCED RBAC
│   └── routers/
│       ├── permissions.ts
│       ├── roles.ts
│       └── userManagement.ts
├── drizzle/
│   └── migrations/
│       └── 0031_add_manager_roles.sql     ← DB SCHEMA
└── MANAGER_ROLES_*.md                    ← DOCUMENTATION
```

## Client-Side Implementation

### Location: `client/src/lib/permissions.ts`

#### 1. Role Type Definition
```typescript
export type UserRole = 
  | "super_admin" 
  | "admin" 
  | "staff" 
  | "accountant" 
  | "user" 
  | "client" 
  | "project_manager" 
  | "hr" 
  | "procurement_manager" 
  | "ict_manager" 
  | "sales_manager";
```

#### 2. Navigation Items
```typescript
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    label: "Accounting",
    href: "/accounting",
    icon: "DollarSign",
    // Roles that can see this section
    roles: ["super_admin", "admin", "accountant", "user", 
            "project_manager", "sales_manager", "procurement_manager"],
    children: [
      {
        label: "Invoices",
        href: "/invoices",
        roles: ["super_admin", "admin", "accountant", "user", 
                "client", "sales_manager"],
      },
      // ... more children
    ],
  },
  // ... more nav items
];
```

#### 3. Feature Access Mapping
```typescript
export const FEATURE_ACCESS: Record<string, UserRole[]> = {
  "sales:opportunities": [
    "super_admin", 
    "admin", 
    "project_manager", 
    "sales_manager"        ← NEW
  ],
  "accounting:invoices:create": [
    "super_admin", 
    "admin", 
    "accountant", 
    "sales_manager"        ← NEW
  ],
  // ... more features
};
```

#### 4. Helper Functions
```typescript
export function canAccessFeature(userRole: UserRole | string, 
                                  feature: string): boolean {
  const allowedRoles = FEATURE_ACCESS[feature];
  if (!allowedRoles) return false;
  return allowedRoles.includes(userRole as UserRole);
}

export function getDashboardUrl(userRole: UserRole | string): string {
  return ROLE_DASHBOARDS[userRole as UserRole] || "/";
}
```

### Usage in Components

```typescript
import { canAccessFeature, hasRole, getDashboardUrl } from "@/lib/permissions";

function SalesComponent() {
  const user = useAuth().user;
  
  // Check if user can access feature
  if (!canAccessFeature(user.role, "sales:opportunities")) {
    return <AccessDenied />;
  }

  // Check if user has specific role
  if (hasRole(user.role, ["sales_manager", "project_manager"])) {
    return <ManagerView />;
  }

  return <StandardView />;
}
```

## Server-Side Implementation

### Location: `server/middleware/rbac.ts`

#### Basic RBAC Structure
```typescript
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  ACCOUNTANT: "accountant",
  HR: "hr",
  STAFF: "staff",
  CLIENT: "client",
  PROJECT_MANAGER: "project_manager",
  SALES_MANAGER: "sales_manager",           ← NEW
  PROCUREMENT_MANAGER: "procurement_manager", ← NEW
  ICT_MANAGER: "ict_manager",                ← NEW
} as const;
```

#### Permission Definitions
```typescript
export const PERMISSIONS = {
  APPROVE_EXPENSE: [
    "super_admin", 
    "admin", 
    "accountant", 
    "project_manager"
  ],
  APPROVE_INVOICE: [
    "super_admin", 
    "admin", 
    "accountant"
  ],
  MANAGE_USERS: ["super_admin", "admin"],
  // ... more permissions
} as const;
```

#### Middleware Functions
```typescript
export function requirePermission(permission: keyof typeof PERMISSIONS) {
  return (ctx: any) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in"
      });
    }

    if (!hasPermission(ctx.user.role, permission)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `You do not have permission: ${permission}`
      });
    }

    return ctx;
  };
}

export function requireRole(allowedRoles: string[]) {
  return (ctx: any) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in"
      });
    }

    if (!allowedRoles.includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`
      });
    }

    return ctx;
  };
}
```

### Location: `server/middleware/enhancedRbac.ts`

#### Enhanced RBAC with Feature Controls
```typescript
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ["admin:*", "accounting:*", "hr:*", "sales:*", "projects:*", 
                "clients:*", "procurement:*"],
  admin: ["accounting:*", "hr:manage_staff", "sales:*", "projects:*", 
          "clients:*", "procurement:*"],
  sales_manager: [                           ← NEW
    "sales:*",                                  // All sales features
    "clients:*",                                // All client management
    "projects:view",                            // View only
    "accounting:invoices:view",                 // View invoices
    "accounting:invoices:create",               // Create invoices
    "accounting:payments:view",                 // View payments
    "accounting:expenses:view",
    "accounting:reports:view",
    "estimates:*",                              // All estimate features
    "opportunities:*",                          // All opportunity features
    "receipts:view",
    "analytics:view"
  ],
  procurement_manager: [                    ← NEW
    "procurement:*",
    "accounting:view",
    "accounting:expenses:view",
    "accounting:payments:view",
    "clients:view",
    "products:view",
    "suppliers:*"
  ],
  ict_manager: [                            ← NEW
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
    "admin:system",
    "admin:settings",
    "communications:email_queue"
  ]
};
```

#### Feature Access Mappings
```typescript
export const FEATURE_ACCESS: Record<string, UserRole[]> = {
  "sales:estimates": [
    "super_admin", 
    "admin", 
    "project_manager", 
    "sales_manager"           ← NEW
  ],
  "accounting:invoices:create": [
    "super_admin", 
    "admin", 
    "accountant", 
    "sales_manager"           ← NEW
  ],
  "estimates:approve": [
    "super_admin", 
    "admin", 
    "project_manager", 
    "sales_manager"           ← NEW
  ],
  "clients:manage_relationships": [
    "super_admin", 
    "admin", 
    "project_manager", 
    "sales_manager"           ← NEW
  ],
  // ... many more features
};
```

### Usage in Router Procedures

```typescript
import { router, createFeatureRestrictedProcedure } from "../_core/trpc";

export const salesRouter = router({
  // Create estimate - requires feature permission
  createEstimate: createFeatureRestrictedProcedure("sales:estimates:create")
    .input(estimateSchema)
    .mutation(async ({ input, ctx }) => {
      // ctx.user.role is guaranteed to be allowed
      // Roles with "sales:estimates:create" permission:
      // - super_admin, admin, project_manager, sales_manager
      
      const estimate = await db.createEstimate({
        ...input,
        createdBy: ctx.user.id
      });
      
      return estimate;
    }),

  // View estimate - requires feature permission
  listEstimates: createFeatureRestrictedProcedure("estimates:read")
    .query(async ({ ctx }) => {
      // Roles with "estimates:read" permission:
      // - super_admin, admin, project_manager, accountant, sales_manager
      
      return await db.getEstimates();
    }),

  // Delete estimate - requires specific permission
  deleteEstimate: createFeatureRestrictedProcedure("estimates:delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      // Only super_admin and admin allowed
      
      await db.deleteEstimate(input);
      return { success: true };
    }),
});
```

## Database Schema

### Location: `migrations/0031_add_manager_roles.sql`

```sql
ALTER TABLE `users`
MODIFY COLUMN `role` ENUM(
  'user',
  'admin',
  'staff',
  'accountant',
  'client',
  'super_admin',
  'project_manager',
  'hr',
  'sales_manager',              ← NEW
  'procurement_manager',         ← NEW
  'ict_manager'                 ← NEW
) NOT NULL DEFAULT 'user';
```

### User Table Structure
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  role ENUM(...),              -- Now includes manager roles
  department VARCHAR(100),
  isActive BOOLEAN DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- ... other fields
);
```

## Authentication Flow

```
┌─────────────────────────────────────────────────┐
│ User Logs In                                    │
│ email: sales.manager@company.com                │
│ password: ****                                  │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ Database Query                                  │
│ SELECT * FROM users WHERE email = ...           │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ User Object                                     │
│ {                                               │
│   id: "uuid",                                   │
│   name: "John Sales",                           │
│   role: "sales_manager",  ← KEY!                │
│   department: "Sales"                           │
│ }                                               │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ JWT Token Created                               │
│ payload: { userId, role: "sales_manager" }      │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ Client Stores Token                             │
│ localStorage.setItem("token", jwt)              │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ Dashboard Redirect                              │
│ getDashboardUrl("sales_manager")                │
│ → "/crm/sales"                                  │
└─────────────────────────────────────────────────┘
```

## Permission Enforcement Points

### 1. Client-Side (UI Layer)
```typescript
// Hide/show menu items
if (canAccessFeature(user.role, "sales:opportunities")) {
  // Show Opportunities menu
}
```

### 2. API Route Authorization
```typescript
// TRPC procedure protection
createFeatureRestrictedProcedure("sales:opportunities:create")
  .mutation(async ({ input, ctx }) => {
    // Code only executes if user has this permission
  })
```

### 3. Database Level
```typescript
// Optional: Add row-level security (RLS)
SELECT * FROM invoices 
WHERE (
  created_by = ? OR 
  ? IN ("super_admin", "admin", "accountant")
)
```

## Testing Checklist

- [ ] User login with sales_manager role
- [ ] User login with procurement_manager role
- [ ] User login with ict_manager role
- [ ] Navigation shows correct menu items
- [ ] Cannot access restricted features
- [ ] API calls properly authorized
- [ ] Feature flags working correctly
- [ ] Dashboard redirects to correct URL
- [ ] Logout/re-login maintains permissions
- [ ] Permissions match documentation

## Common Patterns

### Check Multiple Roles
```typescript
if (hasRole(user.role, ["sales_manager", "project_manager"])) {
  // Allow both roles to access feature
}
```

### Conditional Display
```typescript
return (
  <>
    {canAccessFeature(user.role, "sales:opportunities") && (
      <OpportunitiesSection />
    )}
    
    {canAccessFeature(user.role, "sales:estimates") && (
      <EstimatesSection />
    )}
  </>
);
```

### API Error Handling
```typescript
try {
  const result = await trpc.sales.createEstimate.mutate(data);
} catch (error) {
  if (error.code === "FORBIDDEN") {
    // Show permission denied message
    toast("You don't have permission to create estimates");
  }
}
```

## Performance Considerations

### Memoization
The `FEATURE_ACCESS` object is a static constant computed once at startup, so permission checks are O(1) operations.

### Caching
User role is stored in JWT token to avoid database queries for every permission check.

### Optimization
Permission checks happen before database queries to fail fast on unauthorized requests.

## Security Notes

1. **Server Trust**: Client-side checks are UX only; server always validates
2. **Token Validation**: JWT token is validated on every API request
3. **Role Immutability**: User role can only be changed by system admin
4. **Audit Logging**: All permission denials are logged for security review

---

**Last Updated**: 2024  
**Version**: 1.0  
**Audience**: Developers
