import { FastifyInstance } from 'fastify';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { authenticateToken } from '../../middleware/authenticateToken';
import { authorizeRole } from '../../middleware/authorizeRole';
import { validateBody } from '../../middleware/validateBody';
import { createProjectSchema, updateProjectSchema } from '@educhain/validators';
import { prisma } from '../../lib/prisma';

const projectsService = new ProjectsService(prisma);
const projectsController = new ProjectsController(projectsService);

export async function projectsRoutes(fastify: FastifyInstance): Promise<void> {
  // Authenticated student – own projects
  fastify.get('/me', { preHandler: [authenticateToken] }, projectsController.getMyProjects);

  fastify.post(
    '/',
    { preHandler: [authenticateToken, authorizeRole(['student']), validateBody(createProjectSchema)] },
    projectsController.create,
  );

  fastify.patch(
    '/:projectId',
    { preHandler: [authenticateToken, authorizeRole(['student']), validateBody(updateProjectSchema)] },
    projectsController.update,
  );

  fastify.delete(
    '/:projectId',
    { preHandler: [authenticateToken, authorizeRole(['student'])] },
    projectsController.delete,
  );

  // Public – view a single project
  fastify.get('/:projectId', projectsController.getById);
}
