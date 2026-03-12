
# Feature-Based Access Control (RBAC) Testing Guide

## Overview

This guide provides comprehensive instructions for testing the Melitech CRM's Feature-Based Access Control (RBAC) system to verify that:

1. **Authentication** is properly enforced
2. **Authorization** restricts access based on user role
3. **Permission mapping** is correct for all features
4. **Error responses** are appropriate and consistent
5. **Privilege escalation** is prevented
6. **Role-based restrictions** work across all endpoints

## Test Infrastructure

The testing framework includes multiple layers:

### 1. Unit Tests (`rbac.test.ts`)
- Validates permission matrices
- Tests role access patterns
- Verifies feature grouping logic
- No API calls needed - runs locally

### 2. Integration Tests (`rbac-integration.test.ts`)
- Tests actual API endpoints
- Validates authentication/authorization flows
- Tests permission enforcement at runtime
- Requires running API server

### 3. Automated Test Scripts
- **PowerShell** (`test-rbac.ps1`) - For Windows
- **Bash** (`test-rbac.sh`) - For Linux/Mac
- Tests all endpoints with different roles
- Provides colored output and summary reports

### 4. Manual Testing Guide (`RBAC_TESTING_GUIDE.ts`)
- curl commands for manual testing
- Expected responses documented
- Test matrix for quick reference

## Quick Start

### Prerequisites

1. **Application Running**
   ```bash
   docker-compose up -d
   # Verify: http://localhost:3000 is accessible
   ```

2. **Test Users in Database**
   - The test scripts expect users with these emails:
     - `test.superadmin@melitech.local`
     - `test.admin@melitech.local`
     - `test.accountant@melitech.local`
     - `test.pm@melitech.local`
     - `test.hr@melitech.local`
     - `test.staff@melitech.local`
   - All with password: `password123`

   Create users with SQL:
   ```sql
   INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES
     ('test-super-admin-01', 'Test Super Admin', 'test.superadmin@melitech.local', SHA2('password123', 256), 'super_admin', NOW(), NOW()),
     ('test-admin-01', 'Test Admin', 'test.admin@melitech.local', SHA2('password123', 256), 'admin', NOW(), NOW()),
     ('test-accountant-01', 'Test Accountant', 'test.accountant@melitech.local', SHA2('password123', 256), 'accountant', NOW(), NOW()),
     ('test-pm-01', 'Test Project Manager', 'test.pm@melitech.local', SHA2('password123', 256), 'project_manager', NOW(), NOW()),
     ('test-hr-01', 'Test HR', 'test.hr@melitech.local', SHA2('password123', 256), 'hr', NOW(), NOW()),
     ('test-staff-01', 'Test Staff', 'test.staff@melitech.local', SHA2('password123', 256), 'staff', NOW(), NOW());
   ```

### Run Automated Tests

#### Windows (PowerShell)
```powershell
# Simple test
.\tests\test-rbac.ps1

# With verbose output
.\tests\test-rbac.ps1 -Verbose

# Custom API URL
.\tests\test-rbac.ps1 -ApiUrl "http://my-server:3000"
```

#### Linux/Mac (Bash)
```bash
# Simple test
chmod +x tests/test-rbac.sh
./tests/test-rbac.sh

# With verbose output
VERBOSE=true ./tests/test-rbac.sh

# Custom API URL
API_URL="http://my-server:3000" ./tests/test-rbac.sh
```

#### Run Unit Tests
```bash
npm test -- rbac.test.ts
```

#### Run Integration Tests
```bash
npm test -- rbac-integration.test.ts
```

## Testing Features

### Feature Access Matrix

| Feature | Super Admin | Admin | Accountant | PM | HR | Staff |
|---------|:-----------:|:-----:|:----------:|:--:|:--:|:-----:|
| roles:read | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| permissions:read | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| settings:edit | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| reports:create | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| reports:view | ✓ | ✓ | ✓ | ✓ | ✓ | – |
| filters:create | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| workflows:create | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| hr:employees:edit | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| hr:payroll:view | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| payments:create | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| communications:send | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |

### What Gets Tested

1. **Authentication Enforcement**
   - Requests without token: 401 Unauthorized
   - Requests with invalid token: 401 Unauthorized
   - Requests with valid token: Appropriate status based on permissions

2. **Authorization Checks**
   - Authorized users: 200 OK
   - Unauthorized users: 403 Forbidden

3. **Feature-Based Access**
   - Each endpoint protected by specific feature
   - Only roles with feature access can proceed
   - Proper error messages indicate permission denial

4. **Role-Specific Access**
   - Super Admin: All features
   - Admin: Most but not super_admin-only features
   - Accountant: Accounting and reporting only
   - Project Manager: Projects and sales only
   - HR: HR management only
   - Staff: Communications and basic features only

5. **Error Handling**
   - 401 for authentication failures (no/invalid token)
   - 403 for authorization failures (insufficient permissions)
   - Consistent error message format

## Manual Testing with cURL

### 1. Get Authentication Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.admin@melitech.local",
    "password": "password123"
  }'

# Response:
# {
#   "success": true,
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": { "id": "...", "role": "admin", ... }
# }
```

### 2. Test Endpoint with Token

```bash
# Replace TOKEN with actual token from above

# Test 1: roles:read (admin should have access)
curl -X GET http://localhost:3000/api/trpc/roles.read \
  -H "Authorization: Bearer TOKEN"
# Expected: 200 OK with roles data

# Test 2: reports:create (accountant should be denied)
curl -X POST http://localhost:3000/api/trpc/reportExport.create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Report",
    "reportType": "financial"
  }'
# Expected for accountant: 403 Forbidden (missing required feature: reports:create)

# Test 3: filters:create (staff should have access)
curl -X POST http://localhost:3000/api/trpc/savedFilters.create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Filter",
    "filterConfig": {}
  }'
# Expected for staff: 200 OK with created filter
```

### 3. Test Without Token

```bash
# Should return 401 Unauthorized
curl -X GET http://localhost:3000/api/trpc/roles.read
```

## Test Execution Workflow

### Automated Approach (Recommended)

1. **Prepare Environment**
   ```bash
   # Ensure application is running
   docker-compose ps

   # Create test users if needed
   # (run SQL from Prerequisites section)
   ```

2. **Run Tests**
   ```powershell
   # Windows
   .\tests\test-rbac.ps1 -Verbose
   ```
   ```bash
   # Linux/Mac
   VERBOSE=true ./tests/test-rbac.sh
   ```

3. **Review Results**
   - Look for all tests marked as PASS (✓)
   - Check pass rate is 100%
   - If failures exist, investigate specific endpoints

### Manual Approach

1. **Get Token for Each Role**
   - Create 6 separate login requests (one per role)
   - Store the tokens

2. **Test Each Endpoint**
   - Use cURL commands from Manual Testing section
   - Verify expected status codes
   - Check response format

3. **Create Test Matrix**
   - Fill in actual results
   - Compare to expected matrix
   - Document any discrepancies

## Interpreting Test Results

### Success Indicators
- ✓ All tests pass (100% pass rate)
- 200 OK responses for authorized requests
- 403 Forbidden for unauthorized requests
- 401 Unauthorized for missing/invalid tokens
- Consistent error message format

### Common Issues

#### Issue: "Could not authenticate" messages
**Cause:** Test users don't exist in database
**Solution:** Run SQL INSERT statements from Prerequisites section

#### Issue: "Cannot reach API" error
**Cause:** Application not running
**Solution:** Run `docker-compose up -d` and verify with `docker-compose ps`

#### Issue: FAIL - Status 500 instead of expected 403
**Cause:** Server error, not permission error
**Solution:** Check application logs: `docker logs app 2>&1 | tail -50`

#### Issue: FAIL - Status 200 when expecting 403
**Cause:** Permission check not working for that endpoint
**Solution:** Verify feature name matches in FEATURE_ACCESS object and endpoint

#### Issue: Some tests pass, others skip
**Cause:** Some test users don't exist
**Solution:** Create all test users as listed in Prerequisites

## Understanding Feature-Based Access Control

### How It Works

1. **User authenticates** with email/password
2. **JWT token** is issued with user's role
3. **Request arrives** at protected endpoint with JWT
4. **Feature check** determines if user's role has access to that feature
5. **Response** is 200 OK (access granted) or 403 Forbidden (denied)

### Feature Access Mapping

Located in: `server/middleware/enhancedRbac.ts`

```typescript
const FEATURE_ACCESS = {
  'roles:read': ['super_admin', 'admin'],
  'permissions:read': ['super_admin', 'admin'],
  'settings:edit': ['super_admin', 'admin'],
  'reports:create': ['super_admin', 'admin'],
  'reports:view': ['super_admin', 'admin', 'accountant', 'project_manager', 'hr'],
  'filters:create': ['super_admin', 'admin', 'accountant', 'project_manager', 'hr', 'staff', ...],
  // ... more features
};
```

### Endpoint Protection

Each endpoint uses `createFeatureRestrictedProcedure` factory:

```typescript
// Example: roles router
const readProcedure = createFeatureRestrictedProcedure('roles:read');

export const rolesRouter = createTRPCRouter({
  read: readProcedure
    .query(async ({ ctx }) => {
      // Only users with 'roles:read' feature can reach here
      return await getRoles();
    }),
});
```

## Testing Checklist

Use this checklist to verify all aspects of RBAC are working:

- [ ] **Authentication Tests**
  - [ ] No token returns 401
  - [ ] Invalid token returns 401
  - [ ] Valid token accepted

- [ ] **Admin-Only Features**
  - [ ] Super Admin can access (roles:read, permissions:read, settings:edit, etc.)
  - [ ] Admin can access these features
  - [ ] Non-admins are denied (403)

- [ ] **Accountant Features**
  - [ ] Can view reports
  - [ ] Cannot create reports ✓(403)
  - [ ] Can create filters ✓(200)

- [ ] **Project Manager Features**
  - [ ] Can view projects
  - [ ] Can access project management
  - [ ] Cannot access HR features (403)

- [ ] **HR Features**
  - [ ] Can view/edit employees
  - [ ] Can view payroll
  - [ ] Cannot access accounting (403)

- [ ] **Staff Features**
  - [ ] Can send communications
  - [ ] Can create filters
  - [ ] Cannot access admin features (403)

- [ ] **Error Consistency**
  - [ ] 403 responses have permission error message
  - [ ] 401 responses have auth error message
  - [ ] Error messages are helpful and consistent

## Troubleshooting

### Check Application Logs
```bash
# View all logs
docker-compose logs app

# View last 50 lines
docker-compose logs app | tail -50

# Follow logs in real-time
docker-compose logs -f app
```

### Check Database Connectivity
```bash
# Connect to database
docker-compose exec db mysql -u root -proot melitech_crm

# Verify test users exist
SELECT id, email, role FROM users WHERE email LIKE 'test.%@melitech.local';

# Check
SELECT * FROM permissions WHERE feature LIKE 'roles:%';
```

### Verify RBAC Configuration
Check these files:
- `server/middleware/enhancedRbac.ts` - Feature access mapping
- `server/_core/trpc.ts` - Procedure definitions
- Individual router files - Use of feature-restricted procedures

### Test Single Endpoint
```bash
# For detailed testing of one endpoint
API_URL="http://localhost:3000" \
VERBOSE=true \
./tests/test-rbac.sh 2>&1 | grep -A5 "roles.read"
```

## Performance Testing

### Load Test Feature Access (Optional)
```bash
# Use a tool like Apache Bench to test under load
ab -n 1000 -c 10 -H "Authorization: Bearer TOKEN" \
   http://localhost:3000/api/trpc/roles.read
```

### Access Control Latency
The feature check should add minimal latency (~1-2ms):
- Token validation: ~0.5ms
- Feature lookup: ~0.5ms
- Permission check: ~0.5ms
- Total overhead: ~1.5ms

## Next Steps

After successful RBAC testing:

1. **Monitor in Production**
   - Check logs for 403 errors
   - Monitor permission denial rates
   - Track feature usage by role

2. **Adjust Permissions as Needed**
   - Update FEATURE_ACCESS as business requirements change
   - Add new features with appropriate role restrictions
   - Review and revoke unnecessary permissions

3. **Document Custom Rules**
   - If specific users need custom access, document it
   - Consider if it should be a new role or exception
   - Test custom scenarios

4. **Regular Audits**
   - Monthly review of permission matrix
   - Quarterly access control testing
   - Annual RBAC security review

## Support & Questions

For issues or questions:
1. Review the logs: `docker-compose logs app`
2. Check RBAC configuration: `server/middleware/enhancedRbac.ts`
3. Run automated tests: `./tests/test-rbac.ps1 -Verbose`
4. Test manually with cURL
5. Review test results and identify specific failures
