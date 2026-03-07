import { FastifyInstance } from 'fastify';
import { SkillProofsController } from './skill-proofs.controller';
import { SkillProofsService } from './skill-proofs.service';
import { authenticateToken } from '../../middleware/authenticateToken';
import { authorizeRole } from '../../middleware/authorizeRole';
import { validateBody } from '../../middleware/validateBody';
import { submitSkillProofSchema, endorseSkillSchema } from '@educhain/validators';
import { prisma } from '../../lib/prisma';

const service = new SkillProofsService(prisma);
const controller = new SkillProofsController(service);

export async function skillProofsRoutes(fastify: FastifyInstance): Promise<void> {
  // Skill Proofs
  fastify.post(
    '/proofs',
    {
      preHandler: [
        authenticateToken,
        authorizeRole(['student']),
        validateBody(submitSkillProofSchema),
      ],
    },
    controller.submitProof,
  );

  fastify.get(
    '/proofs/me',
    { preHandler: [authenticateToken] },
    controller.getMyProofs,
  );

  fastify.get('/proofs/:studentId', controller.getProofsByStudent);

  // Endorsements
  fastify.post(
    '/endorsements',
    {
      preHandler: [
        authenticateToken,
        authorizeRole(['student']),
        validateBody(endorseSkillSchema),
      ],
    },
    controller.endorseSkill,
  );

  fastify.get(
    '/endorsements/me',
    { preHandler: [authenticateToken] },
    controller.getMyEndorsements,
  );

  fastify.get('/endorsements/:studentId', controller.getEndorsementsForStudent);
}
