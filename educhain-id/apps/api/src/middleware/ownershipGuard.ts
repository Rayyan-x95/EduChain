import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';

/**
 * Ownership middleware: ensures the authenticated user owns the student resource.
 * Platform admins bypass this check.
 *
 * Extracts `studentId` from route params, looks up the student's userId,
 * and compares it to the requesting user's ID.
 */
export function ownershipGuard(paramName = 'studentId') {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user;
    if (!user) {
      reply.status(401).send({ success: false, error: 'Authentication required' });
      return;
    }

    // Platform admins bypass ownership checks
    if (user.role === 'platform_admin') {
      return;
    }

    const params = request.params as Record<string, string>;
    const studentId = params[paramName];

    if (!studentId) {
      reply.status(400).send({ success: false, error: `Missing parameter: ${paramName}` });
      return;
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { userId: true },
    });

    if (!student) {
      reply.status(404).send({ success: false, error: 'Student not found' });
      return;
    }

    if (student.userId !== user.userId) {
      reply.status(403).send({ success: false, error: 'You can only access your own data' });
      return;
    }
  };
}
