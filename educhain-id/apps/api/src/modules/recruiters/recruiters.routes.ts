import { FastifyInstance } from 'fastify';
import { RecruitersController } from './recruiters.controller';
import { RecruitersService } from './recruiters.service';
import { authenticateToken } from '../../middleware/authenticateToken';
import { authorizeRole } from '../../middleware/authorizeRole';
import { validateBody } from '../../middleware/validateBody';
import { createRecruiterProfileSchema, updateRecruiterProfileSchema, addToShortlistSchema } from '@educhain/validators';
import { prisma } from '../../lib/prisma';

const recruitersService = new RecruitersService(prisma);
const recruitersController = new RecruitersController(recruitersService);

export async function recruitersRoutes(fastify: FastifyInstance): Promise<void> {
  // Profile Management
  fastify.post(
    '/me',
    { preHandler: [authenticateToken, authorizeRole(['recruiter']), validateBody(createRecruiterProfileSchema)] },
    recruitersController.createProfile,
  );

  fastify.get(
    '/me',
    { preHandler: [authenticateToken, authorizeRole(['recruiter'])] },
    recruitersController.getMyProfile,
  );

  fastify.patch(
    '/me',
    { preHandler: [authenticateToken, authorizeRole(['recruiter']), validateBody(updateRecruiterProfileSchema)] },
    recruitersController.updateProfile,
  );

  // Browse Students
  fastify.get(
    '/students',
    { preHandler: [authenticateToken, authorizeRole(['recruiter'])] },
    recruitersController.browseStudents,
  );

  fastify.get(
    '/profile/:id',
    { preHandler: [authenticateToken, authorizeRole(['recruiter'])] },
    recruitersController.viewStudentProfile,
  );

  // Shortlist
  fastify.post(
    '/shortlist',
    { preHandler: [authenticateToken, authorizeRole(['recruiter']), validateBody(addToShortlistSchema)] },
    recruitersController.addToShortlist,
  );

  fastify.get(
    '/shortlist',
    { preHandler: [authenticateToken, authorizeRole(['recruiter'])] },
    recruitersController.getShortlist,
  );

  fastify.delete(
    '/shortlist/:id',
    { preHandler: [authenticateToken, authorizeRole(['recruiter'])] },
    recruitersController.removeFromShortlist,
  );
}
