# RBAC Feature-Based Access Control Testing - Quick Start Guide

## What is Being Tested?

The Melitech CRM uses a **Feature-Based Role-Based Access Control (RBAC)** system to ensure users can only access features appropriate for their role:

- ✅ **Authentication**: Users must have valid JWT token
- ✅ **Authorization**: Token includes user's role
- ✅ **Feature Access**: Role determines which features user can access
- ✅ **Endpoint Protection**: Each API endpoint checks feature permissions
- ✅ **Error Handling**: Clear distinction between auth (401) and permission (403) errors

## Quick Setup (5 minutes)

### 1. Prepare Application
```powershell
# Start the application
docker-compose up -d

# Verify it's running
docker-compose ps
# Should show all 4 containers as "UP"
```

### 2. Create Test Users
Run this SQL in your database to create test users for different roles:

```bash
# Option A: Using database directly
docker-compose exec db mysql -u root -proot melitech_crm < tests/setup-test-users.sql

# Option B: Run SQL file manually
# Copy contents of tests/setup-test-users.sql into your database client
```

Test users created:
- `test.superadmin@melitech.local` (super_admin)
- `test.admin@melitech.local` (admin)
- `test.accountant@melitech.local` (accountant)
- `test.pm@melitech.local` (project_manager)
- `test.hr@melitech.local` (hr)
- `test.staff@melitech.local` (staff)

All with password: `password123`

### 3. Run Tests
```powershell
# Windows (PowerShell)
.\tests\test-rbac.ps1

# For detailed output:
.\tests\test-rbac.ps1 -Verbose
```

```bash
# Linux/Mac
chmod +x tests/test-rbac.sh
./tests/test-rbac.sh

# For detailed output:
VERBOSE=true ./tests/test-rbac.sh
```

## What Gets Tested?

The automated test suite verifies:

| Feature | Super Admin | Admin | Accountant | PM | HR | Staff |
|---------|:-----------:|:-----:|:----------:|:--:|:--:|:-----:|
| **roles:read** | ✓ (200) | ✓ (200) | ✗ (403) | ✗ (403) | ✗ (403) | ✗ (403) |
| **filters:create** | ✓ (200) | ✓ (200) | ✓ (200) | ✓ (200) | ✓ (200) | ✓ (200) |
| **reports:create** | ✓ (200) | ✓ (200) | ✗ (403) | ✗ (403) | ✗ (403) | ✗ (403) |
| **workflows:create** | ✓ (200) | ✓ (200) | ✗ (403) | ✗ (403) | ✗ (403) | ✗ (403) |
| **No Token** | ✗ (401) | ✗ (401) | ✗ (401) | ✗ (401) | ✗ (401) | ✗ (401) |

✓ = Request succeeds with 200 OK
✗ = Request denied with expected status code

## Understanding Test Results

### Success - All Tests Pass ✓
```
Total Tests:   24
Passed Tests:  24  ← All passed
Failed Tests:  0   ← None failed
Pass Rate:     100%

✓ All tests passed! RBAC is working correctly.
```

**What this means**: 
- Access control is working correctly
- All authorized users can access permitted features
- All unauthorized users are properly denied
- Authentication is enforced

### Failure - Some Tests Failed ✗
```
Total Tests:   24
Passed Tests:  22
Failed Tests:  2   ← Investigation needed
Pass Rate:     91.67%

✗ Some tests failed. Review the results above.
```

**What to do**:
1. Look for tests marked `✗ FAIL`
2. Check the expected vs actual status code
3. Review application logs: `docker-compose logs app`
4. Verify feature access mapping in `server/middleware/enhancedRbac.ts`
5. Check endpoint uses correct procedure

## Manual Testing with cURL

### Get a Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.admin@melitech.local",
    "password": "password123"
  }'
```

Response contains `"token": "eyJhbGci..."`

### Test an Endpoint (Authorized)
```bash
curl -X GET http://localhost:3000/api/trpc/roles.read \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
# Expected: 200 OK with roles data
```

### Test an Endpoint (Unauthorized)
```bash
curl -X GET http://localhost:3000/api/trpc/roles.read \
  -H "Authorization: Bearer STAFF_TOKEN_HERE"
# Expected: 403 Forbidden - insufficient permissions
```

### Test Without Token
```bash
curl -X GET http://localhost:3000/api/trpc/roles.read
# Expected: 401 Unauthorized
```

## Test Files Reference

Located in `tests/` directory:

| File | Purpose | When to Use |
|------|---------|------------|
| `test-rbac.ps1` | **Automated test script (Windows)** | Quick testing on Windows |
| `test-rbac.sh` | **Automated test script (Linux/Mac)** | Quick testing on Linux/Mac |
| `rbac.test.ts` | Unit tests for permission logic | `npm test -- rbac.test.ts` |
| `rbac-integration.test.ts` | API endpoint tests | `npm test -- rbac-integration.test.ts` |
| `setup-test-users.sql` | Creates test users | One-time setup |
| `RBAC_TESTING_README.md` | Comprehensive testing guide | Deep dive into RBAC |
| `RBAC_TESTING_GUIDE.ts` | Manual testing reference | Manual curl commands |
| `FEATURE_ACCESS_REFERENCE.ts` | Feature definitions | Understanding permissions |

## Common Issues & Solutions

### Problem: "Could not authenticate" errors
```
⚠ Could not authenticate Super Admin - User may not exist in database
```

**Solution**: Create test users
```bash
docker-compose exec db mysql -u root -proot melitech_crm < tests/setup-test-users.sql
```

### Problem: "Cannot reach API" error
```
✗ Cannot reach API at http://localhost:3000
```

**Solution**: Start the application
```bash
docker-compose up -d
docker-compose logs app | tail -20  # Check for errors
```

### Problem: FAIL - Getting 500 instead of 403
```
✗ FAIL: TestName (Status: 500, Expected: 403)
```

**Solution**: Check application logs
```bash
docker-compose logs app 2>&1 | grep -A5 "error\|Error\|ERROR"
```

### Problem: Some tests skipped
```
Skipped Tests: 2  ← Some didn't run
```

**Solution**: Verify all 6 test users were created
```bash
docker-compose exec db mysql -u root -proot -e \
  "SELECT email, role FROM melitech_crm.users WHERE email LIKE 'test.%';"
```

## Verification Checklist

Use this checklist to ensure RBAC is working:

```
□ Application running on http://localhost:3000
□ Can access http://localhost:3000/api/health
□ Test users created in database (6 users)
□ Test script runs without errors
□ 0 failed tests in final report
□ Pass rate is 100%
□ No 401 errors when using valid token
□ 403 errors received when unauthorized
□ 401 errors received when no token
□ Feature access matches expected matrix
```

## Understanding Feature-Based Access Control

### How Authorization Works

1. **User Logs In**
   ```
   POST /api/auth/login
   requests: {email, password}
   response: {token, user{id, name, role, ...}}
   ```

2. **User Makes Request**
   ```
   GET /api/trpc/roles.read
   headers: {Authorization: Bearer TOKEN}
   ```

3. **Server Checks Permission**
   - Extract role from JWT token
   - Get feature required by endpoint (e.g., "roles:read")
   - Lookup if role has access to that feature
   - Feature mapping: `{roles:read: [super_admin, admin]}`

4. **Decision**
   - ✓ Role in list → 200 OK (request proceeds)
   - ✗ Role not in list → 403 Forbidden (request rejected)

### Feature Names Follow Pattern
```
module:action

Examples:
- roles:read        (read-only access)
- reports:create    (create/write access)
- workflows:edit    (modify access)
- admin:manage_users (admin-level access)
- hr:employees:edit (nested module:action:action)
```

### Role Hierarchy
```
super_admin
    ↓
    admin
    ↓
specialized roles (accountant, hr, project_manager, etc.)
    ↓
staff (limited access)
    ↓
client (external, minimal access)
```

Each lower level has fewer permissions than above.

## Next Steps After Testing

✅ **If All Tests Pass**:
1. Access control is working correctly
2. Monitor permission denials: `docker-compose logs app | grep "403"`
3. Test in staging environment if not done
4. Deploy to production with confidence

❌ **If Tests Fail**:
1. Identify which specific tests failed
2. Check the endpoint in the failing test
3. Verify feature name in endpoint procedure definition
4. Verify feature access mapping in `server/middleware/enhancedRbac.ts`
5. Ensure role is listed for the feature
6. Rerun test after fixing

## Real-World Testing Scenarios

### Test 1: Accountant Tries to Create Report
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test.accountant@melitech.local","password":"password123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

curl -X POST http://localhost:3000/api/trpc/reportExport.create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Sales Report"}'

# Expected: 403 Forbidden
# Error: Missing required feature: reports:create
```

### Test 2: HR Tries to Edit Invoices
```bash
# Would test payments:create endpoint with HR token
# Expected: 403 Forbidden
```

### Test 3: Staff Creates Filter (Should Work)
```bash
# Would test savedFilters.create with staff token
# Expected: 200 OK (staff has access to filters:create)
```

## Advanced Testing

### Test with Specific API URL
```powershell
.\tests\test-rbac.ps1 -ApiUrl "http://staging-api.company.com:3000"
```

### Run Unit Tests Only
```bash
npm test -- tests/rbac.test.ts
```

### Run Integration Tests Only
```bash
npm test -- tests/rbac-integration.test.ts
```

### View Full Test Output
```bash
npm test -- tests/rbac.test.ts --reporter=verbose
```

## Support & Documentation

- **Full Testing Guide**: `RBAC_TESTING_README.md`
- **Manual Test Commands**: `RBAC_TESTING_GUIDE.ts` line 100+
- **Feature Reference**: `FEATURE_ACCESS_REFERENCE.ts`
- **Application Logs**: `docker-compose logs app`
- **Database Access**: `docker-compose exec db mysql -u root -proot melitech_crm`

## Summary

✅ **Test Infrastructure**: Comprehensive automated and manual testing framework
✅ **Multiple Roles**: Tests all 6 user roles with different access levels
✅ **Error Scenarios**: Tests authentication, authorization, and error handling
✅ **Quick Setup**: Can be running tests in 5 minutes
✅ **Clear Results**: Pass/fail indicators with detailed failure information

**Start testing now**: Run `.\tests\test-rbac.ps1` (Windows) or `./tests/test-rbac.sh` (Linux)
