import { FastifyInstance } from 'fastify';
import { VerificationsController } from './verifications.controller';
import { VerificationsService } from './verifications.service';
import { authenticateToken } from '../../middleware/authenticateToken';
import { authorizeRole } from '../../middleware/authorizeRole';
import { validateBody } from '../../middleware/validateBody';
import { requestVerificationSchema, reviewVerificationSchema } from '@educhain/validators';
import { prisma } from '../../lib/prisma';

const verificationsService = new VerificationsService(prisma);
const verificationsController = new VerificationsController(verificationsService);

export async function verificationsRoutes(fastify: FastifyInstance): Promise<void> {
  // Student – request verification
  fastify.post(
    '/',
    { preHandler: [authenticateToken, authorizeRole(['student']), validateBody(requestVerificationSchema)] },
    verificationsController.requestVerification,
  );

  // Student – view own verification requests
  fastify.get('/me', { preHandler: [authenticateToken] }, verificationsController.getMyVerifications);

  // Institution admin – list requests for their institution
  fastify.get(
    '/institution/:institutionId',
    { preHandler: [authenticateToken, authorizeRole(['institution_admin', 'platform_admin'])] },
    verificationsController.listByInstitution,
  );

  // Institution admin – approve/reject
  fastify.patch(
    '/:verificationId/review',
    { preHandler: [authenticateToken, authorizeRole(['institution_admin', 'platform_admin']), validateBody(reviewVerificationSchema)] },
    verificationsController.reviewVerification,
  );
}
