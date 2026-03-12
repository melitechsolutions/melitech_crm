# CRM Authentication & Role-Based Dashboard Implementation Guide

## Overview

This guide provides step-by-step instructions to implement the fixed authentication system, role-based routing, and dashboard components for the Melitech CRM application.

## Issues Fixed

### 1. **Cookie/Secure Mismatch in Docker**
- **Problem**: Backend set `sameSite: "none"` which requires `secure: true`, but Docker HTTP doesn't have secure connections
- **Solution**: Updated `cookies.ts` to use `sameSite: "lax"` and `secure: false` for HTTP environments, and `sameSite: "none"` with `secure: true` for HTTPS production

### 2. **Missing localStorage Fallback**
- **Problem**: Auth system didn't persist to localStorage when cookies failed
- **Solution**: Enhanced `useAuthWithPersistence` hook to store both user data and JWT token in localStorage

### 3. **No Redirect After Login**
- **Problem**: Login component didn't properly redirect to role-based dashboards
- **Solution**: Updated Login component to store auth data and redirect based on user role

### 4. **No Role-Based Routing**
- **Problem**: App.tsx didn't route users to appropriate dashboards based on roles
- **Solution**: Created role-based dashboard routing with dedicated dashboard components for each role

## Files to Update

### Backend Files

#### 1. `/server/_core/cookies.ts`
Replace with: `cookies-fixed.ts`

**Key Changes**:
- Proper handling of HTTP vs HTTPS environments
- Correct sameSite and secure flag configuration for Docker

```typescript
// For Docker HTTP: sameSite: "lax", secure: false
// For Production HTTPS: sameSite: "none", secure: true
```

#### 2. `/server/routes/auth.ts`
Replace with: `auth-fixed.ts`

**Key Changes**:
- Returns JWT token in login/register response for localStorage fallback
- Proper cookie options using updated `getSessionCookieOptions`

```typescript
return {
  success: true,
  user: { ... },
  token, // Added for localStorage fallback
};
```

### Frontend Files

#### 3. `/src/pages/Login.tsx`
Replace with: `Login-fixed.tsx`

**Key Changes**:
- Stores token and user data in localStorage
- Redirects to role-specific dashboards
- Proper error handling

```typescript
// Store in localStorage for fallback
localStorage.setItem("auth-token", data.token);
localStorage.setItem("auth-user", JSON.stringify(data.user));

// Redirect based on role
switch (userRole) {
  case "super_admin":
    setLocation("/dashboard/super-admin");
    break;
  // ... other roles
}
```

#### 4. `/src/_core/hooks/useAuthWithPersistence.ts`
Replace with: `useAuthWithPersistence-fixed.ts`

**Key Changes**:
- Loads persisted user and token from localStorage on mount
- Stores both user data and token in localStorage
- Proper hydration handling

```typescript
// Load from localStorage on mount
const storedUser = localStorage.getItem("auth-user");
const storedToken = localStorage.getItem("auth-token");

// Use backend user if available, otherwise use persisted user
const user = meQuery.data || persistedUser;
```

#### 5. `/src/App.tsx`
Replace with: `App-fixed.tsx`

**Key Changes**:
- Added role-based dashboard routes
- Imported RoleBasedDashboard component
- Proper route organization

```typescript
<Route path={"/dashboard"} component={RoleBasedDashboard} />
<Route path={"/dashboard/super-admin"} component={SuperAdminDashboard} />
<Route path={"/dashboard/admin"} component={AdminDashboard} />
<Route path={"/dashboard/hr"} component={HRDashboard} />
<Route path={"/dashboard/accountant"} component={AccountantDashboard} />
<Route path={"/dashboard/staff"} component={StaffDashboard} />
```

#### 6. `/src/components/RoleBasedDashboard.tsx`
Replace with: `RoleBasedDashboard-fixed.tsx`

**Key Changes**:
- Routes users to role-specific dashboards
- Handles authentication state persistence
- Proper loading and redirect logic

### New Dashboard Components

Create these new files in `/src/pages/dashboards/`:

#### 7. `/src/pages/dashboards/SuperAdminDashboard.tsx`
- System-wide administration
- User management
- Role management
- System settings

#### 8. `/src/pages/dashboards/AdminDashboard.tsx`
- Organization management
- Department management
- Staff oversight
- Reports and analytics

#### 9. `/src/pages/dashboards/HRDashboard.tsx`
- Employee management
- Attendance tracking
- Leave management
- Payroll overview

#### 10. `/src/pages/dashboards/AccountantDashboard.tsx`
- Financial overview
- Invoice management
- Expense tracking
- Bank reconciliation

#### 11. `/src/pages/dashboards/StaffDashboard.tsx`
- Attendance tracking
- Leave requests
- Task management
- Performance overview

### Client Portal

#### 12. `/src/pages/ClientPortal.tsx`
Replace with: `ClientPortal-fixed.tsx`

**Key Changes**:
- Integrated with backend API using tRPC
- Fetches real client data instead of mock data
- Proper authentication verification
- Loading states and error handling

```typescript
// Fetch from backend
const clientQuery = trpc.clients.getClientByUserId.useQuery();
const projectsQuery = trpc.projects.getClientProjects.useQuery();
const invoicesQuery = trpc.invoices.getClientInvoices.useQuery();
const documentsQuery = trpc.documents.getClientDocuments.useQuery();
```

## Implementation Steps

### Step 1: Update Backend Files

1. Replace `/server/_core/cookies.ts` with `cookies-fixed.ts`
2. Replace `/server/routes/auth.ts` with `auth-fixed.ts`
3. Restart backend server

### Step 2: Update Frontend Files

1. Replace `/src/pages/Login.tsx` with `Login-fixed.tsx`
2. Replace `/src/_core/hooks/useAuthWithPersistence.ts` with `useAuthWithPersistence-fixed.ts`
3. Replace `/src/components/RoleBasedDashboard.tsx` with `RoleBasedDashboard-fixed.tsx`
4. Replace `/src/App.tsx` with `App-fixed.tsx`

### Step 3: Add New Dashboard Components

Create `/src/pages/dashboards/` directory and add:
- `SuperAdminDashboard.tsx`
- `AdminDashboard.tsx`
- `HRDashboard.tsx`
- `AccountantDashboard.tsx`
- `StaffDashboard.tsx`

### Step 4: Update Client Portal

Replace `/src/pages/ClientPortal.tsx` with `ClientPortal-fixed.tsx`

### Step 5: Verify Backend API Routes

Ensure the following tRPC routes exist in your backend:

```typescript
// Auth routes
trpc.auth.login
trpc.auth.logout
trpc.auth.me

// Client routes
trpc.clients.getClientByUserId
trpc.projects.getClientProjects
trpc.invoices.getClientInvoices
trpc.documents.getClientDocuments
```

## Testing Checklist

### Authentication Flow
- [ ] User can login with valid credentials
- [ ] Login stores token in localStorage
- [ ] Login stores user data in localStorage
- [ ] User is redirected to correct dashboard based on role
- [ ] Page refresh maintains login state
- [ ] User can logout successfully
- [ ] Logout clears localStorage
- [ ] Logout redirects to login page

### Role-Based Routing
- [ ] Super Admin user redirects to `/dashboard/super-admin`
- [ ] Admin user redirects to `/dashboard/admin`
- [ ] HR user redirects to `/dashboard/hr`
- [ ] Accountant user redirects to `/dashboard/accountant`
- [ ] Staff user redirects to `/dashboard/staff`
- [ ] Client user redirects to `/client-portal`
- [ ] Unauthenticated user redirects to `/login`
- [ ] User accessing wrong dashboard is redirected

### Client Portal
- [ ] Client can access portal after login
- [ ] Client data loads from backend
- [ ] Projects display correctly
- [ ] Invoices display correctly
- [ ] Documents display correctly
- [ ] Search functionality works
- [ ] Download functionality works
- [ ] Logout works from portal

### Cookie/localStorage Fallback
- [ ] Cookie is set on login (if HTTPS)
- [ ] localStorage is set on login (HTTP and HTTPS)
- [ ] Session persists after page refresh
- [ ] Session persists after browser restart
- [ ] User data is accessible from localStorage
- [ ] Token is accessible from localStorage

### Error Handling
- [ ] Invalid credentials show error message
- [ ] Network errors are handled gracefully
- [ ] Loading states display correctly
- [ ] 404 errors redirect to not found page
- [ ] Unauthorized access redirects to login

## Docker Environment Configuration

For Docker HTTP environments, ensure:

1. **Backend Environment Variables**:
```bash
JWT_SECRET=your-secret-key
NODE_ENV=development
```

2. **Cookie Configuration**:
- `sameSite: "lax"` (not "none")
- `secure: false` (HTTP only)
- `httpOnly: true`

3. **Frontend Configuration**:
- localStorage is primary storage
- Cookies are secondary (if available)
- Automatic fallback to localStorage

## Production HTTPS Configuration

For production HTTPS environments:

1. **Cookie Configuration**:
- `sameSite: "none"` (cross-domain)
- `secure: true` (HTTPS only)
- `httpOnly: true`

2. **Frontend Configuration**:
- Cookies are primary storage
- localStorage as fallback
- Automatic fallback mechanism

## Troubleshooting

### Issue: Login redirects but page shows loading
**Solution**: Check if user data is being fetched correctly. Ensure `useAuthWithPersistence` is loading from localStorage.

### Issue: Page refresh loses login state
**Solution**: Verify localStorage is being set correctly. Check browser's Application > Storage > Local Storage.

### Issue: Cookie not being set in Docker
**Solution**: Ensure `sameSite: "lax"` and `secure: false` are set. Check browser console for cookie warnings.

### Issue: User redirected to wrong dashboard
**Solution**: Verify user role is set correctly in database. Check `user.role` value in browser console.

### Issue: Client portal shows no data
**Solution**: Verify backend API routes exist and return correct data. Check network tab for API errors.

## Security Considerations

1. **Token Storage**: JWT tokens are stored in localStorage (vulnerable to XSS). Consider using httpOnly cookies in production.
2. **CORS**: Ensure CORS is properly configured for cross-domain requests.
3. **HTTPS**: Always use HTTPS in production.
4. **Token Expiration**: Implement token refresh mechanism for long-lived sessions.
5. **Role Validation**: Always validate user role on backend before returning sensitive data.

## Next Steps

1. Implement backend API routes for client data fetching
2. Add role-based permission checks on backend
3. Implement token refresh mechanism
4. Add audit logging for authentication events
5. Implement 2FA/MFA for enhanced security
6. Add email verification for new accounts
7. Implement password reset flow
8. Add session management and device tracking

## Support

For issues or questions, refer to:
- Backend logs: Check server console for errors
- Frontend logs: Check browser console for errors
- Network tab: Check API requests and responses
- Application storage: Check localStorage and cookies

