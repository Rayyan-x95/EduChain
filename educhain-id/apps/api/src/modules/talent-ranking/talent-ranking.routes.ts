import { FastifyInstance } from 'fastify';
import { TalentRankingController } from './talent-ranking.controller';
import { TalentRankingService } from './talent-ranking.service';
import { authenticateToken } from '../../middleware/authenticateToken';
import { authorizeRole } from '../../middleware/authorizeRole';
import { prisma } from '../../lib/prisma';

const service = new TalentRankingService(prisma);
const controller = new TalentRankingController(service);

export async function talentRankingRoutes(fastify: FastifyInstance): Promise<void> {
  // Recruiter-only talent discovery endpoint
  fastify.get(
    '/',
    { preHandler: [authenticateToken, authorizeRole(['recruiter', 'platform_admin'])] },
    controller.search,
  );
}
