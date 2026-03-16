import { FastifyInstance } from 'fastify';
import { CredentialsController } from './credentials.controller';
import { CredentialsService } from './credentials.service';
import { authenticateToken } from '../../middleware/authenticateToken';
import { authorizeRole } from '../../middleware/authorizeRole';
import { ownershipGuard } from '../../middleware/ownershipGuard';
import { validateBody } from '../../middleware/validateBody';
import { issueCredentialSchema, revokeCredentialSchema } from '@educhain/validators';
import { prisma } from '../../lib/prisma';

const credentialsService = new CredentialsService(prisma);
const credentialsController = new CredentialsController(credentialsService);

export async function credentialsRoutes(fastify: FastifyInstance): Promise<void> {
  // Institution key management
  fastify.post(
    '/institutions/:institutionId/keys',
    { preHandler: [authenticateToken, authorizeRole(['institution_admin', 'platform_admin'])] },
    credentialsController.generateKeys,
  );

  // Key rotation
  fastify.post(
    '/institutions/:institutionId/keys/rotate',
    { preHandler: [authenticateToken, authorizeRole(['institution_admin', 'platform_admin'])] },
    credentialsController.rotateKeys,
  );

  // Credential issuing
  fastify.post(
    '/issue',
    { preHandler: [authenticateToken, authorizeRole(['institution_admin']), validateBody(issueCredentialSchema)] },
    credentialsController.issue,
  );

  // Credential verification (public) — stricter rate limit: 20/min
  fastify.get('/verify/:credentialId', {
    config: { rateLimit: { max: 20, timeWindow: 60_000 } },
  }, credentialsController.verify);

  // Credential revocation
  fastify.post(
    '/revoke',
    { preHandler: [authenticateToken, authorizeRole(['institution_admin']), validateBody(revokeCredentialSchema)] },
    credentialsController.revoke,
  );

  // Manual sign trigger
  fastify.post(
    '/:credentialId/sign',
    { preHandler: [authenticateToken, authorizeRole(['institution_admin', 'platform_admin'])] },
    credentialsController.signPending,
  );

  // Certificate file attachment
  fastify.patch(
    '/:credentialId/certificate',
    { preHandler: [authenticateToken, authorizeRole(['institution_admin'])] },
    credentialsController.attachCertificate,
  );

  // W3C Verifiable Credential export
  fastify.get(
    '/:credentialId/export-vc',
    { preHandler: [authenticateToken] },
    credentialsController.exportVC,
  );

  // Offline verification payload (public, rate limited)
  fastify.get('/:credentialId/offline', {
    config: { rateLimit: { max: 20, timeWindow: 60_000 } },
  }, credentialsController.getOfflineVerificationPayload);

  // Public key registry (public)
  fastify.get('/key-registry', {
    config: { rateLimit: { max: 20, timeWindow: 60_000 } },
  }, credentialsController.getKeyRegistry);

  // Public shareable credential link — returns verification + credential summary
  fastify.get('/share/:credentialId', {
    config: { rateLimit: { max: 30, timeWindow: 60_000 } },
  }, credentialsController.getShareableCredential);

  // Credential queries – ownership enforced
  fastify.get(
    '/',
    { preHandler: [authenticateToken, authorizeRole(['institution_admin'])] },
    credentialsController.getMyInstitutionCredentials,
  );

  fastify.get(
    '/me',
    { preHandler: [authenticateToken] },
    credentialsController.getMyCredentials,
  );

  fastify.get(
    '/student/:studentId',
    { preHandler: [authenticateToken, ownershipGuard('studentId')] },
    credentialsController.getStudentCredentials,
  );

  fastify.get(
    '/institution/:institutionId',
    { preHandler: [authenticateToken, authorizeRole(['institution_admin', 'platform_admin'])] },
    credentialsController.getInstitutionCredentials,
  );

  fastify.get(
    '/:credentialId',
    { preHandler: [authenticateToken] },
    credentialsController.getById,
  );
}
