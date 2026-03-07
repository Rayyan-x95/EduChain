import { FastifyInstance } from 'fastify';
import { AuditController } from './audit.controller';
import { AuditLogService } from './audit.service';
import { authenticateToken } from '../../middleware/authenticateToken';
import { authorizeRole } from '../../middleware/authorizeRole';
import { prisma } from '../../lib/prisma';

const auditLogService = new AuditLogService(prisma);
const auditController = new AuditController(auditLogService);

export async function auditRoutes(fastify: FastifyInstance): Promise<void> {
  // Own audit trail
  fastify.get('/me', { preHandler: [authenticateToken] }, auditController.getMyAuditLogs);

  // Admin – view audit logs for any entity
  fastify.get(
    '/:entityType/:entityId',
    { preHandler: [authenticateToken, authorizeRole(['platform_admin', 'institution_admin'])] },
    auditController.getByEntity,
  );
}
