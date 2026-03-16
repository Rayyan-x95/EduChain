import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';
import { GDPRService } from '../modules/gdpr/gdpr.service';

/**
 * Maintenance jobs for data retention and housekeeping.
 * Run via a cron scheduler (e.g., node scripts, BullMQ repeatable jobs).
 */

/**
 * Prune old notifications.
 *
 * Note: We previously attempted to archive to a `notifications_archive` table,
 * but the MVP schema doesn't include it. For production readiness, we keep
 * retention simple and delete old read notifications.
 */
export async function archiveOldNotifications(prisma: PrismaClient): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - env.NOTIFICATION_ARCHIVE_DAYS);

  const result = await prisma.notification.deleteMany({
    where: { read: true, createdAt: { lt: cutoff } },
  });

  return result.count;
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
    prisma.emailVerification.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
    prisma.passwordReset.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
  ]);

  return { verifications: verifications.count, resets: resets.count };
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
