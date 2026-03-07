import { PrismaClient, Prisma } from '@prisma/client';

export interface AuditLogEntry {
  actorId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

export class AuditLogService {
  constructor(private readonly prisma: PrismaClient) {}

  async log(entry: AuditLogEntry) {
    return this.prisma.auditLog.create({
      data: {
        actorId: entry.actorId,
        actorRole: entry.actorRole,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        metadata: (entry.metadata as Prisma.InputJsonValue) ?? undefined,
      },
    });
  }

  async getByEntity(entityType: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getByActor(actorId: string, page = 1, limit = 50) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { actorId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.auditLog.count({ where: { actorId } }),
    ]);

    return { logs, total, page, limit: take };
  }
}
