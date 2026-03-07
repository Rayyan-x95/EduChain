import { PrismaClient } from '@prisma/client';
import type { GDPRDataExport, AccountDeletionRequest } from '@educhain/types';
import { AppError } from '../../middleware/errorHandler';
import { AuditLogService } from '../audit/audit.service';

export class GDPRService {
  private prisma: PrismaClient;
  private auditLog: AuditLogService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.auditLog = new AuditLogService(prisma);
  }

  /**
   * GDPR Article 15 — Right of Access
   * Exports all personal data associated with a user.
   */
  async exportUserData(userId: string): Promise<GDPRDataExport> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new AppError(404, 'User not found');

    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        skills: { include: { skill: true } },
        projects: true,
        achievements: true,
        credentials: true,
      },
    });

    const auditLogs = await this.prisma.auditLog.findMany({
      where: { actorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    await this.auditLog.log({
      actorId: userId,
      actorRole: user.role,
      action: 'gdpr_data_export',
      entityType: 'user',
      entityId: userId,
      metadata: {},
    });

    return {
      exportedAt: new Date().toISOString(),
      userId: user.id,
      profile: {
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        student: student
          ? {
              id: student.id,
              fullName: student.fullName,
              degree: student.degree,
              bio: student.bio,
            }
          : null,
      },
      credentials: (student?.credentials ?? []).map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        status: c.status,
        issuedDate: c.issuedDate.toISOString(),
        institutionId: c.institutionId,
      })),
      skills: (student?.skills ?? []).map((s) => ({
        skillId: s.skillId,
        skillName: s.skill.name,
      })),
      projects: (student?.projects ?? []).map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        createdAt: p.createdAt.toISOString(),
      })),
      achievements: (student?.achievements ?? []).map((a) => ({
        id: a.id,
        title: a.title,
        issuer: a.issuedBy ?? '',
        dateEarned: a.date?.toISOString() ?? '',
      })),
      auditTrail: auditLogs.map((l) => ({
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        timestamp: l.createdAt.toISOString(),
      })),
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        createdAt: n.createdAt.toISOString(),
      })),
    };
  }

  /**
   * GDPR Article 17 — Right to Erasure
   * Initiates account deletion with a confirmation workflow.
   */
  async requestAccountDeletion(
    userId: string,
    request: AccountDeletionRequest,
  ): Promise<{ status: string; scheduledDeletionDate: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'User not found');

    if (request.confirmEmail !== user.email) {
      throw new AppError(400, 'Confirmation email does not match account email');
    }

    // Schedule deletion 30 days from now (grace period)
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 30);

    // Mark user for deletion
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletionScheduledAt: scheduledDate,
      },
    });

    await this.auditLog.log({
      actorId: userId,
      actorRole: user.role,
      action: 'gdpr_deletion_requested',
      entityType: 'user',
      entityId: userId,
      metadata: {
        reason: request.reason ?? 'not provided',
        scheduledDate: scheduledDate.toISOString(),
      },
    });

    return {
      status: 'scheduled',
      scheduledDeletionDate: scheduledDate.toISOString(),
    };
  }

  /**
   * Cancel a pending account deletion request.
   */
  async cancelAccountDeletion(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'User not found');

    if (!user.deletionScheduledAt) {
      throw new AppError(400, 'No pending deletion request');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { deletionScheduledAt: null },
    });

    await this.auditLog.log({
      actorId: userId,
      actorRole: user.role,
      action: 'gdpr_deletion_cancelled',
      entityType: 'user',
      entityId: userId,
      metadata: {},
    });
  }

  /**
   * Record user consent (GDPR Article 7).
   */
  async recordConsent(
    userId: string,
    consentType: string,
    granted: boolean,
    ipAddress?: string,
  ) {
    return this.prisma.$queryRawUnsafe(
      `INSERT INTO user_consents (id, user_id, consent_type, granted, ip_address, granted_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, consent_type)
       DO UPDATE SET granted = $3, ip_address = $4, revoked_at = CASE WHEN $3 THEN NULL ELSE NOW() END`,
      userId,
      consentType,
      granted,
      ipAddress ?? null,
    );
  }

  /**
   * Execute account deletion for accounts past the 30-day grace period.
   * Anonymizes credentials instead of deleting them (preserves institution records).
   */
  async executeScheduledDeletions(): Promise<number> {
    const now = new Date();
    const usersToDelete = await this.prisma.user.findMany({
      where: {
        deletionScheduledAt: { lte: now },
      },
      select: { id: true, email: true, role: true },
    });

    let deletedCount = 0;
    for (const user of usersToDelete) {
      try {
        // Anonymize credentials (keep record but remove PII)
        const student = await this.prisma.student.findUnique({
          where: { userId: user.id },
          select: { id: true },
        });

        if (student) {
          await this.prisma.credential.updateMany({
            where: { studentId: student.id },
            data: { description: null },
          });

          // Anonymize student record before cascade delete
          await this.prisma.student.update({
            where: { id: student.id },
            data: {
              fullName: '[Deleted User]',
              bio: null,
              degree: null,
            },
          });
        }

        // Delete user (cascades to student, tokens, notifications, etc.)
        await this.prisma.user.delete({ where: { id: user.id } });

        await this.auditLog.log({
          actorId: user.id,
          actorRole: 'system',
          action: 'gdpr_account_deleted',
          entityType: 'user',
          entityId: user.id,
          metadata: { reason: 'scheduled_deletion_executed' },
        });

        deletedCount++;
      } catch (err) {
        // Log but continue with other users
        console.error(`Failed to delete user ${user.id}:`, err);
      }
    }

    return deletedCount;
  }
}
