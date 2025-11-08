/**
 * Audit Logging Service
 * 
 * Writes audit logs to database for security and compliance
 */

import { prisma } from '../db/client';

/**
 * Write audit log to database
 * 
 * @param userId - User ID (null for system actions)
 * @param action - Action identifier (e.g., 'SIGN_TRANSACTION_REQUEST')
 * @param details - Action details as JSON object
 * @param ipAddress - Optional IP address
 * @param userAgent - Optional user agent string
 */
export async function auditLog(
  userId: string | null,
  action: string,
  details: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
        ipAddress,
        userAgent
      }
    });
  } catch (error) {
    // Fallback to console if database write fails
    // This ensures audit trail is not lost even if DB is down
    console.error('[AUDIT] Failed to write to database:', error);
    console.log('[AUDIT]', {
      userId,
      action,
      details,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString()
    });
  }
}

