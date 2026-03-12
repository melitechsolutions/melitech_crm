# Authentication Fix Guide

## Problem Identified

Your Melitech CRM application has a login authentication issue caused by a **mismatch between two authentication systems**:

1. **Local Authentication** (Email/Password) - Used by your login form
2. **OAuth Authentication** (Manus OAuth) - Expected by the authentication middleware

### Root Cause

When users log in with email and password:
- The `auth.login` mutation creates a JWT token using `jose` library
- This token is stored in a cookie named according to `COOKIE_NAME`
- However, the `authenticateRequest()` function in `server/_core/sdk.ts` only knows how to verify OAuth tokens
- This causes the authentication to fail with "Missing session cookie" or "Invalid session cookie" errors

## Solution Applied

I've modified the `server/_core/sdk.ts` file to support **both authentication methods**:

### Changes Made

1. **Added `verifyLocalJWT()` method** - Verifies JWT tokens created by local email/password authentication
2. **Modified `authenticateRequest()` method** - Now tries local JWT verification first, then falls back to OAuth

### Code Changes

The `authenticateRequest()` function now:

```typescript
async authenticateRequest(req: Request): Promise<User> {
  const cookies = this.parseCookies(req.headers.cookie);
  const sessionCookie = cookies.get(COOKIE_NAME);

  if (!sessionCookie) {
    throw ForbiddenError("No session cookie found");
  }

  // Try local JWT authentication first
  const localUser = await this.verifyLocalJWT(sessionCookie);
  if (localUser) {
    return localUser;
  }

  // Fall back to OAuth authentication
  // ... (existing OAuth logic)
}
```

New private method added:

```typescript
private async verifyLocalJWT(token: string): Promise<User | null> {
  try {
    const JWT_SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET || "default-secret-key"
    );
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
    
    const userId = payload.userId as string;
    if (!userId) {
      return null;
    }

    const user = await db.getUser(userId);
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    // Not a local JWT token, return null to try OAuth
    return null;
  }
}
```

## How to Apply the Fix

### Option 1: Replace the File (Recommended)

1. Stop your Docker containers:
   ```powershell
   docker-compose down
   ```

2. Replace the file in your project:
   ```powershell
   # Backup the original file
   Copy-Item server\_core\sdk.ts server\_core\sdk.ts.backup
   
   # Copy the fixed file from this package
   Copy-Item server\_core\sdk.ts.fixed server\_core\sdk.ts
   ```

3. Restart the containers:
   ```powershell
   docker-compose up -d --build
   ```

### Option 2: Manual Edit

1. Open `server/_core/sdk.ts` in your code editor

2. Find the `authenticateRequest` method (around line 259)

3. Replace the entire method with the version shown above

4. Add the new `verifyLocalJWT` method before the closing brace of the `SDKServer` class

5. Rebuild and restart:
   ```powershell
   docker-compose up -d --build
   ```

## Testing the Fix

After applying the fix:

1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - Email: `admin@melitech.com`
   - Password: `password123`
3. Click "Sign In"
4. You should be redirected to the dashboard successfully

## Environment Variables

Make sure you have the `JWT_SECRET` environment variable set in your `.env` file:

```env
JWT_SECRET=your-secure-secret-key-here
```

If not set, it will use the default value "default-secret-key" (not recommended for production).

## Additional Notes

- This fix maintains backward compatibility with OAuth authentication
- Users can now log in using either method (local or OAuth)
- The authentication middleware will automatically detect which token type is being used
- No changes are needed to the frontend code

## Verification

After the fix is applied, check the Docker logs:

```powershell
docker-compose logs app
```

You should no longer see "[Auth] Missing session cookie" errors after successful login.

## Support

If you encounter any issues after applying this fix:

1. Check that the file was properly updated
2. Ensure Docker containers were rebuilt with `--build` flag
3. Clear browser cookies and try logging in again
4. Check the Docker logs for any error messages
