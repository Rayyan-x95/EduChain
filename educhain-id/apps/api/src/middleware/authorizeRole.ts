import { FastifyRequest, FastifyReply } from 'fastify';
import type { UserRole } from '@educhain/types';

export function authorizeRole(allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user;

    if (!user) {
      reply.status(401).send({ success: false, error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      reply.status(403).send({ success: false, error: 'Insufficient permissions' });
      return;
    }
  };
}
