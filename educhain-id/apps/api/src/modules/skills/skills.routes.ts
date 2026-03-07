import { FastifyInstance } from 'fastify';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { authenticateToken } from '../../middleware/authenticateToken';
import { authorizeRole } from '../../middleware/authorizeRole';
import { validateBody } from '../../middleware/validateBody';
import { addSkillSchema } from '@educhain/validators';
import { prisma } from '../../lib/prisma';

const skillsService = new SkillsService(prisma);
const skillsController = new SkillsController(skillsService);

export async function skillsRoutes(fastify: FastifyInstance): Promise<void> {
  // Public – browse all skills
  fastify.get('/', skillsController.listAll);

  // Authenticated student – manage own skills
  fastify.get('/me', { preHandler: [authenticateToken] }, skillsController.getMySkills);

  fastify.post(
    '/me',
    { preHandler: [authenticateToken, authorizeRole(['student']), validateBody(addSkillSchema)] },
    skillsController.addSkill,
  );

  fastify.delete(
    '/me/:skillId',
    { preHandler: [authenticateToken, authorizeRole(['student'])] },
    skillsController.removeSkill,
  );
}
