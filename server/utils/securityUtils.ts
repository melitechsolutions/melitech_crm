import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db";
import * as crypto from "crypto";

const LOCKOUT_THRESHOLD = 5; // Failed attempts before lockout
const LOCKOUT_DURATION_MINUTES = 30;

/**
 * Record a login attempt (success or failure)
 */
export async function recordLoginAttempt(
  email: string,
  userId: string,
  success: boolean,
  ipAddress: string,
  userAgent?: string
) {
  try {
    const database = await getDb();
    if (!database) return;

    const id = uuidv4();
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);

    await database.raw(
      `
      INSERT INTO login_attempts (id, userId, email, ipAddress, userAgent, success, attemptedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [id, userId, email, ipAddress, userAgent || null, success ? 1 : 0, now]
    );
  } catch (error) {
    console.error("Error recording login attempt:", error);
  }
}

/**
 * Check if user account is locked
 */
export async function isAccountLocked(email: string): Promise<boolean> {
  try {
    const database = await getDb();
    if (!database) return false;

    const now = new Date().toISOString().replace("T", " ").substring(0, 19);

    // Check recent failed login attempts
    const result = await database.raw<Array<{ failCount: number }>>(
      `
      SELECT COUNT(*) as failCount FROM login_attempts
      WHERE email = ? AND success = 0 AND attemptedAt > DATE_SUB(?, INTERVAL ? MINUTE)
      `,
      [email, now, LOCKOUT_DURATION_MINUTES]
    );

    const failCount = result?.[0]?.failCount || 0;
    return failCount >= LOCKOUT_THRESHOLD;
  } catch (error) {
    console.error("Error checking account lock:", error);
    return false;
  }
}

/**
 * Get account lockout info
 */
export async function getAccountLockoutInfo(email: string) {
  try {
    const database = await getDb();
    if (!database) return null;

    const now = new Date().toISOString().replace("T", " ").substring(0, 19);

    const result = await database.raw<Array<{ failCount: number; oldestAttempt: string }>>(
      `
      SELECT 
        COUNT(*) as failCount,
        MIN(attemptedAt) as oldestAttempt
      FROM login_attempts
      WHERE email = ? AND success = 0 AND attemptedAt > DATE_SUB(?, INTERVAL ? MINUTE)
      `,
      [email, now, LOCKOUT_DURATION_MINUTES]
    );

    if (!result?.[0]?.failCount) return null;

    const failCount = result[0].failCount;
    const oldestAttempt = new Date(result[0].oldestAttempt);
    const lockoutExpiresAt = new Date(oldestAttempt.getTime() + LOCKOUT_DURATION_MINUTES * 60000);

    return {
      failCount,
      isLocked: failCount >= LOCKOUT_THRESHOLD,
      lockoutExpiresAt,
      minutesRemaining: Math.ceil((lockoutExpiresAt.getTime() - Date.now()) / 60000),
    };
  } catch (error) {
    console.error("Error getting lockout info:", error);
    return null;
  }
}

/**
 * Clear failed login attempts for user
 */
export async function clearFailedAttempts(email: string) {
  try {
    const database = await getDb();
    if (!database) return;

    await database.raw(`DELETE FROM login_attempts WHERE email = ? AND success = 0`, [email]);
  } catch (error) {
    console.error("Error clearing failed attempts:", error);
  }
}

/**
 * Log security audit event
 */
export async function logSecurityEvent(
  userId: string | undefined,
  eventType: string,
  severity: "info" | "warning" | "critical",
  description: string,
  options?: {
    ipAddress?: string;
    userAgent?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    status?: "success" | "failed" | "warning";
    metadata?: Record<string, any>;
  }
) {
  try {
    const database = await getDb();
    if (!database) return;

    const id = uuidv4();
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    const metadata = options?.metadata ? JSON.stringify(options.metadata) : null;

    await database.raw(
      `
      INSERT INTO security_audit_log 
      (id, userId, eventType, severity, ipAddress, userAgent, description, relatedEntityType, relatedEntityId, status, metadata, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        userId || null,
        eventType,
        severity,
        options?.ipAddress || null,
        options?.userAgent || null,
        description,
        options?.relatedEntityType || null,
        options?.relatedEntityId || null,
        options?.status || "success",
        metadata,
        now,
      ]
    );
  } catch (error) {
    console.error("Error logging security event:", error);
  }
}

/**
 * Generate email verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create email verification request
 */
export async function createEmailVerificationToken(
  userId: string,
  newEmail: string
): Promise<string | null> {
  try {
    const database = await getDb();
    if (!database) return null;

    const id = uuidv4();
    const token = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    const expiresAtStr = expiresAt.toISOString().replace("T", " ").substring(0, 19);

    await database.raw(
      `
      INSERT INTO email_verification_tokens (id, userId, newEmail, token, expiresAt, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [id, userId, newEmail, token, expiresAtStr, now]
    );

    return token;
  } catch (error) {
    console.error("Error creating email verification token:", error);
    return null;
  }
}

/**
 * Verify email change token
 */
export async function verifyEmailChangeToken(token: string): Promise<string | null> {
  try {
    const database = await getDb();
    if (!database) return null;

    const now = new Date().toISOString().replace("T", " ").substring(0, 19);

    const result = await database.raw<Array<{ userId: string; newEmail: string }>>(
      `
      SELECT userId, newEmail FROM email_verification_tokens
      WHERE token = ? AND expiresAt > ? AND verifiedAt IS NULL
      `,
      [token, now]
    );

    if (!result?.[0]) return null;

    // Mark as verified
    const verifiedAtStr = now;
    await database.raw(
      `UPDATE email_verification_tokens SET verifiedAt = ? WHERE token = ?`,
      [verifiedAtStr, token]
    );

    return result[0].newEmail;
  } catch (error) {
    console.error("Error verifying email token:", error);
    return null;
  }
}

/**
 * Add IP to user's whitelist
 */
export async function whitelistIP(
  userId: string,
  ipAddress: string,
  description?: string
): Promise<boolean> {
  try {
    const database = await getDb();
    if (!database) return false;

    const id = uuidv4();
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);

    await database.raw(
      `
      INSERT INTO ip_whitelist (id, userId, ipAddress, description, isActive, createdAt)
      VALUES (?, ?, ?, ?, 1, ?)
      `,
      [id, userId, ipAddress, description || null, now]
    );

    return true;
  } catch (error) {
    console.error("Error whitelisting IP:", error);
    return false;
  }
}

/**
 * Check if IP is whitelisted for user
 */
export async function isIPWhitelisted(userId: string, ipAddress: string): Promise<boolean> {
  try {
    const database = await getDb();
    if (!database) return false;

    const result = await database.raw<Array<{ id: string }>>(
      `
      SELECT id FROM ip_whitelist
      WHERE userId = ? AND ipAddress = ? AND isActive = 1
      `,
      [userId, ipAddress]
    );

    return (result?.length || 0) > 0;
  } catch (error) {
    console.error("Error checking IP whitelist:", error);
    return false;
  }
}

/**
 * Get security audit logs for user
 */
export async function getUserSecurityLogs(userId: string, limit: number = 50) {
  try {
    const database = await getDb();
    if (!database) return [];

    const result = await database.raw<
      Array<{
        id: string;
        eventType: string;
        severity: string;
        description: string;
        ipAddress: string;
        status: string;
        createdAt: string;
      }>
    >(
      `
      SELECT id, eventType, severity, description, ipAddress, status, createdAt
      FROM security_audit_log
      WHERE userId = ?
      ORDER BY createdAt DESC
      LIMIT ?
      `,
      [userId, limit]
    );

    return result || [];
  } catch (error) {
    console.error("Error fetching security logs:", error);
    return [];
  }
}

/**
 * Get security stats
 */
export async function getSecurityStats() {
  try {
    const database = await getDb();
    if (!database) return null;

    const now = new Date().toISOString().replace("T", " ").substring(0, 19);

    // Failed logins in last 24h
    const failedLogins = await database.raw<Array<{ count: number }>>(
      `
      SELECT COUNT(*) as count FROM login_attempts
      WHERE success = 0 AND attemptedAt > DATE_SUB(?, INTERVAL 24 HOUR)
      `,
      [now]
    );

    // Critical security events in last 24h
    const criticalEvents = await database.raw<Array<{ count: number }>>(
      `
      SELECT COUNT(*) as count FROM security_audit_log
      WHERE severity = 'critical' AND createdAt > DATE_SUB(?, INTERVAL 24 HOUR)
      `,
      [now]
    );

    // Locked accounts
    const lockedAccounts = await database.raw<Array<{ count: number }>>(
      `
      SELECT COUNT(DISTINCT email) as count FROM login_attempts
      WHERE success = 0 AND attemptedAt > DATE_SUB(?, INTERVAL ? MINUTE)
      GROUP BY email
      HAVING COUNT(*) >= ?
      `,
      [now, LOCKOUT_DURATION_MINUTES, LOCKOUT_THRESHOLD]
    );

    return {
      failedLoginsLast24h: failedLogins?.[0]?.count || 0,
      criticalEventsLast24h: criticalEvents?.[0]?.count || 0,
      lockedAccountsCount: lockedAccounts?.length || 0,
    };
  } catch (error) {
    console.error("Error getting security stats:", error);
    return null;
  }
}
