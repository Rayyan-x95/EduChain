import { FastifyInstance } from 'fastify';
import { GDPRController } from './gdpr.controller';
import { GDPRService } from './gdpr.service';
import { authenticateToken } from '../../middleware/authenticateToken';
import { prisma } from '../../lib/prisma';

const gdprService = new GDPRService(prisma);
const gdprController = new GDPRController(gdprService);

export async function gdprRoutes(fastify: FastifyInstance): Promise<void> {
  // GDPR Article 15 — Data export
  fastify.get(
    '/export',
    { preHandler: [authenticateToken] },
    gdprController.exportData,
  );

  // GDPR Article 17 — Request account deletion
  fastify.post(
    '/delete-account',
    { preHandler: [authenticateToken] },
    gdprController.requestDeletion,
  );

  // Cancel pending deletion
  fastify.post(
    '/cancel-deletion',
    { preHandler: [authenticateToken] },
    gdprController.cancelDeletion,
  );

  // GDPR Article 7 — Record consent
  fastify.post(
    '/consent',
    { preHandler: [authenticateToken] },
    gdprController.recordConsent,
  );
}
