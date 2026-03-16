import { FastifyInstance } from 'fastify';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { authenticateToken } from '../../middleware/authenticateToken';
import { optionalAuth } from '../../middleware/optionalAuth';
import { authorizeRole } from '../../middleware/authorizeRole';
import { validateBody } from '../../middleware/validateBody';
import { createStudentProfileSchema, updateStudentProfileSchema } from '@educhain/validators';
import { prisma } from '../../lib/prisma';
import { publicCacheControl } from '../../middleware/cacheControl';
import { SearchService } from '../search/search.service';
import { searchStudentsSchema } from '@educhain/validators';

const studentsService = new StudentsService(prisma);
const studentsController = new StudentsController(studentsService);
const searchService = new SearchService(prisma);

export async function studentsRoutes(fastify: FastifyInstance): Promise<void> {
  // Public – list visible students (optionally authenticated for expanded visibility)
  fastify.get('/', { preHandler: [optionalAuth], onSend: publicCacheControl(60) }, studentsController.listStudents);

  // Authenticated – student CRUD on own profile
  fastify.post(
    '/me',
    { preHandler: [authenticateToken, authorizeRole(['student']), validateBody(createStudentProfileSchema)] },
    studentsController.createProfile,
  );

  fastify.get('/me', { preHandler: [authenticateToken] }, studentsController.getMyProfile);

  fastify.get('/me/completion', { preHandler: [authenticateToken] }, studentsController.getProfileCompletion);

  fastify.get('/me/stats', { preHandler: [authenticateToken] }, studentsController.getMyStats);

  fastify.get(
    '/stats',
    { preHandler: [authenticateToken, authorizeRole(['institution_admin'])] },
    studentsController.getInstitutionStats,
  );

  fastify.patch(
    '/me',
    { preHandler: [authenticateToken, authorizeRole(['student']), validateBody(updateStudentProfileSchema)] },
    studentsController.updateProfile,
  );

  // Spec compatibility alias – mirrors /api/v1/search/students
  fastify.get('/search', { preHandler: [optionalAuth], onSend: publicCacheControl(30) }, async (request, reply) => {
    const parsed = searchStudentsSchema.parse(request.query);
    const result = await searchService.searchStudents(parsed, request.user);
    reply.status(200).send({ success: true, data: result });
  });

  // Public or authenticated – view by id (privacy enforced in service)
  fastify.get('/:studentId', { preHandler: [optionalAuth], onSend: publicCacheControl(30) }, studentsController.getById);
}
