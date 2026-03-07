import { FastifyInstance } from 'fastify';
import { CollaborationController } from './collaboration.controller';
import { CollaborationService } from './collaboration.service';
import { authenticateToken } from '../../middleware/authenticateToken';
import { authorizeRole } from '../../middleware/authorizeRole';
import { validateBody } from '../../middleware/validateBody';
import {
  followStudentSchema,
  sendCollaborationRequestSchema,
  handleCollaborationRequestSchema,
  createGroupSchema,
  addGroupMemberSchema,
} from '@educhain/validators';
import { prisma } from '../../lib/prisma';

const collaborationService = new CollaborationService(prisma);
const collaborationController = new CollaborationController(collaborationService);

export async function collaborationRoutes(fastify: FastifyInstance): Promise<void> {
  // Follow
  fastify.post(
    '/follow',
    { preHandler: [authenticateToken, authorizeRole(['student']), validateBody(followStudentSchema)] },
    collaborationController.followStudent,
  );

  fastify.delete(
    '/follow/:student_id',
    { preHandler: [authenticateToken, authorizeRole(['student'])] },
    collaborationController.unfollowStudent,
  );

  fastify.get('/students/:id/followers', collaborationController.getFollowers);
  fastify.get('/students/:id/following', collaborationController.getFollowing);

  // Collaboration Requests
  fastify.post(
    '/collaboration/request',
    { preHandler: [authenticateToken, authorizeRole(['student']), validateBody(sendCollaborationRequestSchema)] },
    collaborationController.sendCollaborationRequest,
  );

  fastify.post(
    '/collaboration/accept',
    { preHandler: [authenticateToken, authorizeRole(['student']), validateBody(handleCollaborationRequestSchema)] },
    collaborationController.acceptCollaborationRequest,
  );

  fastify.post(
    '/collaboration/reject',
    { preHandler: [authenticateToken, authorizeRole(['student']), validateBody(handleCollaborationRequestSchema)] },
    collaborationController.rejectCollaborationRequest,
  );

  fastify.get(
    '/collaboration/list',
    { preHandler: [authenticateToken, authorizeRole(['student'])] },
    collaborationController.listCollaborationRequests,
  );

  // Groups
  fastify.post(
    '/groups',
    { preHandler: [authenticateToken, authorizeRole(['student']), validateBody(createGroupSchema)] },
    collaborationController.createGroup,
  );

  fastify.get(
    '/groups',
    { preHandler: [authenticateToken, authorizeRole(['student'])] },
    collaborationController.listGroups,
  );

  fastify.post(
    '/groups/:group_id/members',
    { preHandler: [authenticateToken, authorizeRole(['student']), validateBody(addGroupMemberSchema)] },
    collaborationController.addGroupMember,
  );

  fastify.delete(
    '/groups/:group_id/members/:student_id',
    { preHandler: [authenticateToken, authorizeRole(['student'])] },
    collaborationController.removeGroupMember,
  );
}
