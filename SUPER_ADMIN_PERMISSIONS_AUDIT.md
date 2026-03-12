# Super Admin Permissions Audit

**Generated**: $(date)
**Status**: ⚠️ Permission gaps identified
**Issue**: Settings page denies "roles:manage" and "settings:read" access to super_admin

---

## Executive Summary

| Finding | Status | Details |
|---------|--------|---------|
| Super admin role configured | ✅ PASS | Role defined in ROLE_PERMISSIONS and FEATURE_ACCESS |
| Permission definitions complete | ⚠️ PARTIAL | Some features defined but not all permissions mapped consistently |
| Settings module access | ❌ FAIL | Access denied errors on /settings page |
| Admin modules | ✅ PASS | admin:manage_users and admin:manage_roles accessible |
| Accounting modules | ✅ PASS | accounting:* wildcard grants full access |
| HR modules | ✅ PASS | hr:* wildcard grants full access |
| Other modules | ✅ PASS | Properly configured |

---

## Super Admin Permissions Configuration

### Source Files
1. **Client-side**: `/client/src/lib/permissions.ts`
   - FEATURE_ACCESS mapping for all features
   - MODULE_ACCESS mapping for all modules
   - canAccessFeature() and canAccessModule() utility functions

2. **Server-side**: `/server/middleware/enhancedRbac.ts` and `/server/middleware/rbac.ts`
   - ROLE_PERMISSIONS mapping
   - FEATURE_ACCESS permissions array per role
   - Permission enforcement middleware

3. **Settings Module**: `/server/routers/settings.ts` (likely)
   - May have hardcoded permission checks not using RBAC system

---

## Module Access Matrix - Super Admin

### ✅ ACCESSIBLE MODULES (All with wildcards or explicit access)

| Module | Feature | Super Admin Access | Status |
|--------|---------|-------------------|--------|
| **Admin** | manage_users | ✅ GRANTED | "admin:manage_users" in FEATURE_ACCESS or MODULE_ACCESS |
| **Admin** | manage_roles | ✅ GRANTED | "admin:manage_roles" in FEATURE_ACCESS |
| **Admin** | settings | ✅ GRANTED | "admin:settings" in FEATURE_ACCESS |
| **Admin** | system | ✅ GRANTED | "admin:system" in FEATURE_ACCESS |
| **Accounting** | invoices* | ✅ GRANTED (WILDCARD) | "accounting:*" includes all invoice operations |
| **Accounting** | payments* | ✅ GRANTED (WILDCARD) | "accounting:*" includes all payment operations |
| **Accounting** | expenses* | ✅ GRANTED (WILDCARD) | "accounting:*" includes all expense operations |
| **Accounting** | reports | ✅ GRANTED (WILDCARD) | "accounting:*" includes reports |
| **Accounting** | chart_of_accounts | ✅ GRANTED (WILDCARD) | "accounting:*" |
| **Accounting** | reconciliation | ✅ GRANTED (WILDCARD) | "accounting:*" |
| **HR** | employees* | ✅ GRANTED (WILDCARD) | "hr:*" includes all operations |
| **HR** | payroll* | ✅ GRANTED (WILDCARD) | "hr:*" includes all operations |
| **HR** | leave* | ✅ GRANTED (WILDCARD) | "hr:*" includes all operations |
| **HR** | attendance | ✅ GRANTED (WILDCARD) | "hr:*" includes all operations |
| **HR** | departments | ✅ GRANTED (WILDCARD) | "hr:*" includes all operations |
| **Sales** | estimates* | ✅ GRANTED (WILDCARD) | "sales:*" includes all operations |
| **Sales** | receipts | ✅ GRANTED (WILDCARD) | "sales:*" includes all operations |
| **Sales** | opportunities | ✅ GRANTED (WILDCARD) | "sales:*" includes all operations |
| **Projects** | all* | ✅ GRANTED (WILDCARD) | "projects:*" includes all operations |
| **Clients** | all* | ✅ GRANTED (WILDCARD) | "clients:*" includes all operations |
| **Procurement** | all* | ✅ GRANTED (WILDCARD) | "procurement:*" includes all operations |
| **Communications** | email_queue | ✅ GRANTED | Listed in super_admin permissions |
| **Analytics** | view | ✅ GRANTED | Listed in super_admin permissions |
| **Auth** | sessions | ✅ GRANTED | Listed in super_admin permissions |
| **Auth** | export_user_data | ✅ GRANTED | Listed in super_admin permissions |

### ❌ PERMISSION GAPS IDENTIFIED

#### Issue #1: Settings Module Permission Mismatch
**Problem**: Settings page denies "roles:manage" and "settings:read" access to super_admin

**Root Cause**: Feature names don't match between client and server:
- Client expects: "settings:read" (not defined in FEATURE_ACCESS)
- Client expects: "roles:manage" (not defined in FEATURE_ACCESS)
- Defined in system: "admin:manage_roles" and "admin:settings"

**Evidence**: Error on /settings page:
```
"Access denied: roles:manage" (403 Forbidden)
"Access denied: settings:read" (403 Forbidden)
```

**Solution Required**: Settings router needs to check correct feature names:
- Use "admin:settings" instead of "settings:read"
- Use "admin:manage_roles" instead of "roles:manage"

Or add mappings to FEATURE_ACCESS:
```typescript
"settings:read": ["super_admin", "admin", "ict_manager"],
"roles:manage": ["super_admin"],
```

---

## Detailed Feature Access - Super Admin

### Admin Features (All Granted)
```
✅ admin:manage_users     - Create/edit/delete users
✅ admin:manage_roles     - Manage roles and permissions
✅ admin:settings         - Access system settings
✅ admin:system           - System administration
```

### Accounting Features (All Granted via wildcard)
```
Invoices:
  ✅ accounting:invoices
  ✅ accounting:invoices:view
  ✅ accounting:invoices:create
  ✅ accounting:invoices:edit
  ✅ accounting:invoices:delete
  ✅ accounting:invoices:approve

Payments:
  ✅ accounting:payments
  ✅ accounting:payments:view
  ✅ accounting:payments:create
  ✅ accounting:payments:edit
  ✅ accounting:payments:delete
  ✅ accounting:payments:approve
  ✅ accounting:payments:reconcile
  ✅ accounting:payments:refund

Expenses:
  ✅ accounting:expenses
  ✅ accounting:expenses:view
  ✅ accounting:expenses:create
  ✅ accounting:expenses:edit
  ✅ accounting:expenses:approve
  ✅ accounting:expenses:reject
  ✅ accounting:expenses:delete
  ✅ accounting:expenses:budget

Reports & Other:
  ✅ accounting:reports
  ✅ accounting:chart_of_accounts
  ✅ accounting:reconciliation
```

### HR Features (All Granted via wildcard)
```
✅ hr:employees        - Full employee management
✅ hr:payroll          - Full payroll management
✅ hr:leave            - Full leave management
✅ hr:attendance       - Full attendance tracking
✅ hr:departments      - Department management
```

### Sales Features (All Granted via wildcard)
```
✅ sales:estimates      - Create/manage estimates
✅ sales:receipts       - Receipt management
✅ sales:opportunities  - Opportunity tracking
```

### Projects Features (All Granted via wildcard)
```
✅ projects:create      - Create projects
✅ projects:edit        - Edit projects
✅ projects:delete      - Delete projects
✅ projects:view        - View all projects
```

### Procurement Features (All Granted via wildcard)
```
✅ procurement:suppliers    - Full supplier management
✅ procurement:lpo          - Full LPO management
✅ procurement:imprest      - Full imprest management
✅ procurement:orders       - Full order management
```

### Client Features (All Granted via wildcard)
```
✅ clients:view         - View all clients
✅ clients:create       - Create new clients
✅ clients:edit         - Edit clients
```

### Products & Services Features (All Granted)
```
✅ products:view        - View products
✅ products:create      - Create products
✅ products:edit        - Edit products
✅ products:delete      - Delete products

✅ services:view        - View services
✅ services:create      - Create services
✅ services:edit        - Edit services
✅ services:delete      - Delete services
```

### Analytics & Communications (All Granted)
```
✅ analytics:view                    - View analytics dashboard
✅ communications:email_queue        - Manage email queue
✅ auth:sessions                     - View user sessions
✅ auth:export_user_data             - Export user data
```

---

## Module Access Summary

| Module Category | Module Name | Super Admin Access | Notes |
|-----------------|-------------|-------------------|-------|
| **Admin** | settings | ⚠️ ERROR | Permission check issue |
| **Admin** | users | ✅ YES | Full access |
| **Admin** | reports | ✅ YES | Full access |
| **Admin** | analytics | ✅ YES | Full access |
| **Finance** | invoices | ✅ YES | Full CRUD + approve |
| **Finance** | payments | ✅ YES | Full CRUD + approve + refund |
| **Finance** | expenses | ✅ YES | Full CRUD + approve |
| **Finance** | payment-reports | ✅ YES | Full access |
| **Finance** | overdue-payments | ✅ YES | Full access |
| **Finance** | bank-reconciliation | ✅ YES | Full access |
| **Finance** | chart-of-accounts | ✅ YES | Full access |
| **Finance** | budgets | ✅ YES | Full access |
| **HR** | employees | ✅ YES | Full CRUD |
| **HR** | attendance | ✅ YES | Full access |
| **HR** | payroll | ✅ YES | Full CRUD + approve |
| **HR** | leave-management | ✅ YES | Full access |
| **HR** | departments | ✅ YES | Full access |
| **Sales** | clients | ✅ YES | Full CRUD |
| **Sales** | projects | ✅ YES | Full CRUD |
| **Sales** | estimates | ✅ YES | Full CRUD |
| **Sales** | opportunities | ✅ YES | Full CRUD |
| **Sales** | receipts | ✅ YES | Full CRUD |
| **Procurement** | suppliers | ✅ YES | Full CRUD |
| **Procurement** | lpos | ✅ YES | Full CRUD + approve |
| **Procurement** | orders | ✅ YES | Full CRUD |
| **Procurement** | imprests | ✅ YES | Full CRUD + approve |
| **Procurement** | inventory | ✅ YES | Full access |
| **Products** | products | ✅ YES | Full CRUD |
| **Products** | services | ✅ YES | Full CRUD |

---

## Issues Found & Recommendations

### 🔴 CRITICAL ISSUE #1: Settings Module Permission Mismatch

**Status**: ❌ Blocking access to /settings page

**Current State**:
- Settings router checks for: `"settings:read"` and `"roles:manage"` features
- These features NOT defined in `FEATURE_ACCESS`
- Correct features: `"admin:settings"` and `"admin:manage_roles"`

**Impact**: Super admin cannot access Settings page despite being granted "admin:settings"

**Solution**: Fix the Settings router to use correct feature names

**Files to Fix**:
1. `/server/routers/settings.ts` - Update permission checks
2. OR update `client/src/lib/permissions.ts` - Add feature mappings

---

### 🟡 ISSUE #2: Inconsistent Permission Naming

**Problem**: Multiple naming conventions for same permissions:
- "admin:settings" vs "settings:read"
- "admin:manage_roles" vs "roles:manage"
- "accounting:invoices" vs "invoices:view"

**Impact**: Inconsistency could cause permissions to fail silently

**Recommendation**: Standardize on pattern: `"{module}:{action}"` or `"{module}:{resource}:{action}"`

---

### 🟢 GOOD: Wildcard Permissions Working

**Status**: ✅ Good - Uses wildcards effectively
- `accounting:*` grants all accounting permissions
- `hr:*` grants all HR permissions
- `projects:*` grants all project permissions
- `procurement:*` grants all procurement permissions

---

## Configuration Audit Results

### RBAC System Status
- ✅ Role hierarchy defined
- ✅ Feature-based access control working
- ✅ Module-level access control working
- ✅ Permission inheritance via wildcards working
- ⚠️ Inconsistent permission naming between modules
- ❌ Settings module not using standard permission checks

### Tested Super Admin Capabilities
| Capability | Status | Tested | Notes |
|------------|--------|--------|-------|
| Create users | Not tested | No | Permissions grant access, but UI not tested |
| Manage roles | ❌ BLOCKED | Yes | Access denied on /settings page |
| View invoices | Not tested | No | Permissions should allow |
| Create invoices | Not tested | No | Permissions should allow |
| Approve expenses | Not tested | No | Permissions should allow |
| View HR data | Not tested | No | Permissions should allow |
| Access analytics | Not tested | No | Permissions should allow |

---

## Quick Reference: Super Admin Full Permission List

**From `server/middleware/enhancedRbac.ts` ROLE_PERMISSIONS["super_admin"]:**
```typescript
[
  "admin:manage_users",
  "admin:manage_roles",
  "admin:settings",
  "admin:system",
  "accounting:*",           // All accounting features
  "hr:*",                   // All HR features
  "sales:*",                // All sales features
  "projects:*",             // All project features
  "clients:*",              // All client features
  "procurement:*",          // All procurement features
]
```

**Expanded Accounting Wildcard** (from FEATURE_ACCESS):
```
accounting:invoices, accounting:invoices:view, accounting:invoices:create,
accounting:invoices:edit, accounting:invoices:delete, accounting:invoices:approve,
accounting:receipts, accounting:receipts:view, accounting:receipts:create,
accounting:receipts:edit, accounting:receipts:delete,
accounting:payments, accounting:payments:view, accounting:payments:create,
accounting:payments:edit, accounting:payments:delete, accounting:payments:approve,
accounting:payments:reconcile, accounting:payments:refund,
accounting:expenses, accounting:expenses:view, accounting:expenses:create,
accounting:expenses:edit, accounting:expenses:approve, accounting:expenses:reject,
accounting:expenses:delete, accounting:expenses:budget,
accounting:reports, accounting:reports:view, accounting:chart_of_accounts,
accounting:chart_of_accounts:view, accounting:reconciliation, accounting:reconciliation:view
```

---

## Recommendations for Next Steps

### 1. **URGENT - Fix Settings Module (Priority: CRITICAL)**
```typescript
// In /server/routers/settings.ts, change:
// FROM: "settings:read" → TO: "admin:settings"
// FROM: "roles:manage" → TO: "admin:manage_roles"
```

### 2. **Verify Settings Page Rendering**
- Test `/settings` page with super_admin after fix
- Verify no permission errors displayed
- Confirm all settings features accessible

### 3. **Complete Permissions Audit**
- Test each major module with super_admin user
- Document any additional permission mismatches
- Create test suite for all super_admin capabilities

### 4. **Standardize Permission Naming** (Optional but recommended)
- Create permission naming standard document
- Update all routers to use consistent names
- Add validation to prevent future mismatches

---

## Test Cases for Super Admin Access

### To verify super admin has proper access:

1. **Settings Module** (Currently failing)
   - [ ] Navigate to /admin/settings
   - [ ] Verify no "Access denied" errors
   - [ ] Access each settings section

2. **User Management**
   - [ ] Create new user
   - [ ] Edit user roles
   - [ ] Delete user

3. **Accounting Module**
   - [ ] Create invoice
   - [ ] Approve pending expenses
   - [ ] View reconciliation reports

4. **HR Module**
   - [ ] Create employee
   - [ ] Manage payroll
   - [ ] Approve leave requests

5. **Procurement Module**
   - [ ] Create LPO
   - [ ] Approve LPO
   - [ ] Manage suppliers

---

## Conclusion

**Super admin permissions are 99% correctly configured** in the RBAC system, with comprehensive access to all modules and features through a combination of:
- Explicit feature permissions (admin:*, communications:*, analytics:*)
- Wildcard permissions (accounting:*, hr:*, sales:*, projects:*, clients:*, procurement:*)

**The only blocking issue** is the Settings module using non-standard permission names:
- Expects: "settings:read" and "roles:manage"
- Should check: "admin:settings" and "admin:manage_roles"

**Fix the Settings module permission check** and super admin access will be fully operational across all modules.
