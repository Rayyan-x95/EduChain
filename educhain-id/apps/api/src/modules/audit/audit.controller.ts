import { FastifyRequest, FastifyReply } from 'fastify';
import { AuditLogService } from './audit.service';

export class AuditController {
  constructor(private readonly auditLogService: AuditLogService) {}

  getByEntity = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { entityType, entityId } = request.params as { entityType: string; entityId: string };
    const logs = await this.auditLogService.getByEntity(entityType, entityId);
    reply.status(200).send({ success: true, data: logs });
  };

  getMyAuditLogs = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { page, limit } = request.query as { page?: string; limit?: string };
    const result = await this.auditLogService.getByActor(
      request.user!.userId,
      parseInt(page ?? '1') || 1,
      parseInt(limit ?? '50') || 50,
    );
    reply.status(200).send({ success: true, data: result });
  };
}
