import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';
import { GDPRService } from '../modules/gdpr/gdpr.service';

/**
 * Maintenance jobs for data retention and housekeeping.
 * Run via a cron scheduler (e.g., node scripts, BullMQ repeatable jobs).
 */

/**
 * Archive old notifications by moving them to notifications_archive
 * and deleting from the primary table.
 */
export async function archiveOldNotifications(prisma: PrismaClient): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - env.NOTIFICATION_ARCHIVE_DAYS);

  // Move read notifications older than the cutoff to the archive table
  const result = await prisma.$executeRaw`
    WITH moved AS (
      DELETE FROM notifications
      WHERE read = true AND created_at < ${cutoff}
      RETURNING id, user_id, type, title, message, data, read, created_at
    )
    INSERT INTO notifications_archive (id, user_id, type, title, message, data, read, created_at, archived_at)
    SELECT id, user_id, type, title, message, data, read, created_at, NOW()
    FROM moved
  `;

  return result;
}

/**
 * Delete audit log entries older than the retention period.
 * Default: 365 days.
 */
export async function pruneAuditLogs(prisma: PrismaClient): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - env.AUDIT_LOG_RETENTION_DAYS);

  const result = await prisma.$executeRaw`
    DELETE FROM audit_logs WHERE created_at < ${cutoff}
  `;

  return result;
}

/**
 * Clean expired email verifications and password reset tokens.
 */
export async function cleanExpiredTokens(prisma: PrismaClient): Promise<{ verifications: number; resets: number }> {
  const [verifications, resets] = await Promise.all([
    prisma.$executeRaw`DELETE FROM email_verifications WHERE expires_at < NOW()`,
    prisma.$executeRaw`DELETE FROM password_resets WHERE expires_at < NOW()`,
  ]);

  return { verifications, resets };
}

/**
 * Run all maintenance tasks. Suitable for a daily cron job.
 */
export async function runAllMaintenance(prisma: PrismaClient) {
  const gdprService = new GDPRService(prisma);

  const results = {
    archivedNotifications: await archiveOldNotifications(prisma),
    prunedAuditLogs: await pruneAuditLogs(prisma),
    cleanedTokens: await cleanExpiredTokens(prisma),
    gdprDeletions: await gdprService.executeScheduledDeletions(),
  };

  return results;
}
