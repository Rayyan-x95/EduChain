import { FastifyInstance } from 'fastify';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { authenticateToken } from '../../middleware/authenticateToken';
import { validateBody } from '../../middleware/validateBody';
import { setUsernameSchema, updateIdentityVisibilitySchema } from '@educhain/validators';
import { prisma } from '../../lib/prisma';
import { publicCacheControl } from '../../middleware/cacheControl';

const identityService = new IdentityService(prisma);
const identityController = new IdentityController(identityService);

export async function identityRoutes(fastify: FastifyInstance): Promise<void> {
  // Public — resolve identity by slug
  fastify.get('/:slug', { onSend: publicCacheControl(60) }, identityController.getPublicProfile);

  // Public — DID Document for user (W3C standard)
  fastify.get('/:slug/did.json', { onSend: publicCacheControl(300) }, identityController.getDIDDocument);

  // Public — DID Document for institution
  fastify.get('/institutions/:institutionId/did.json', { onSend: publicCacheControl(300) }, identityController.getInstitutionDIDDocument);

  // Public — resolve shared credential link
  fastify.get('/shared/:token', identityController.resolveShareLink);

  // Public — embeddable credential badge (SVG)
  fastify.get('/badge/:credentialId', identityController.getBadge);

  // Authenticated — set username
  fastify.put(
    '/username',
    { preHandler: [authenticateToken, validateBody(setUsernameSchema)] },
    identityController.setUsername,
  );

  // Authenticated — update visibility
  fastify.put(
    '/visibility',
    { preHandler: [authenticateToken, validateBody(updateIdentityVisibilitySchema)] },
    identityController.updateVisibility,
  );

  // Authenticated — generate credential share link
  fastify.post(
    '/share',
    { preHandler: [authenticateToken] },
    identityController.createShareLink,
  );
}
