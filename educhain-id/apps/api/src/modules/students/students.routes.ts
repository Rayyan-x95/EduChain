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

const studentsService = new StudentsService(prisma);
const studentsController = new StudentsController(studentsService);

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

  fastify.patch(
    '/me',
    { preHandler: [authenticateToken, authorizeRole(['student']), validateBody(updateStudentProfileSchema)] },
    studentsController.updateProfile,
  );

  // Public or authenticated – view by id (privacy enforced in service)
  fastify.get('/:studentId', { preHandler: [optionalAuth], onSend: publicCacheControl(30) }, studentsController.getById);
}
