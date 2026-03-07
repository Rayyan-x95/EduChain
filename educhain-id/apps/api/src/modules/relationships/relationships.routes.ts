import { FastifyInstance } from 'fastify';
import { RelationshipsController } from './relationships.controller';
import { RelationshipsService } from './relationships.service';
import { authenticateToken } from '../../middleware/authenticateToken';
import { validateBody } from '../../middleware/validateBody';
import { createRelationshipSchema } from '@educhain/validators';
import { prisma } from '../../lib/prisma';

const service = new RelationshipsService(prisma);
const controller = new RelationshipsController(service);

export async function relationshipsRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post(
    '/',
    { preHandler: [authenticateToken, validateBody(createRelationshipSchema)] },
    controller.create,
  );

  fastify.get(
    '/me',
    { preHandler: [authenticateToken] },
    controller.getMine,
  );

  fastify.get('/user/:userId', controller.getForUser);

  // Reputation graph data (public)
  fastify.get('/graph/:userId', controller.getGraph);

  fastify.delete(
    '/:id',
    { preHandler: [authenticateToken] },
    controller.remove,
  );
}
