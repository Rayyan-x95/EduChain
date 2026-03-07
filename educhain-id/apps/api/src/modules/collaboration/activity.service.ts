import { PrismaClient, Prisma } from '@prisma/client';

export class ActivityService {
  constructor(private readonly prisma: PrismaClient) {}

  async log(actorId: string, action: string, targetId?: string, metadata?: Record<string, unknown>) {
    return this.prisma.activityLog.create({
      data: {
        actorId,
        action,
        targetId,
        metadata: metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
