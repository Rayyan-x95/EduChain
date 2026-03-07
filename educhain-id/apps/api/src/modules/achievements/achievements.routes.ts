import { FastifyInstance } from 'fastify';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import { authenticateToken } from '../../middleware/authenticateToken';
import { authorizeRole } from '../../middleware/authorizeRole';
import { validateBody } from '../../middleware/validateBody';
import { createAchievementSchema, updateAchievementSchema } from '@educhain/validators';
import { prisma } from '../../lib/prisma';

const achievementsService = new AchievementsService(prisma);
const achievementsController = new AchievementsController(achievementsService);

export async function achievementsRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/me', { preHandler: [authenticateToken] }, achievementsController.getMyAchievements);

  fastify.post(
    '/',
    { preHandler: [authenticateToken, authorizeRole(['student']), validateBody(createAchievementSchema)] },
    achievementsController.create,
  );

  fastify.patch(
    '/:achievementId',
    { preHandler: [authenticateToken, authorizeRole(['student']), validateBody(updateAchievementSchema)] },
    achievementsController.update,
  );

  fastify.delete(
    '/:achievementId',
    { preHandler: [authenticateToken, authorizeRole(['student'])] },
    achievementsController.delete,
  );
}
