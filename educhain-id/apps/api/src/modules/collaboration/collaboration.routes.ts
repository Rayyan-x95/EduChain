import { FastifyInstance } from 'fastify';
import { CollaborationController } from './collaboration.controller';
import { CollaborationService } from './collaboration.service';
import { authenticateToken } from '../../middleware/authenticateToken';
import { authorizeRole } from '../../middleware/authorizeRole';
import { validateBody } from '../../middleware/validateBody';
import {
  followStudentSchema,
  sendCollaborationRequestSchema,
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
    '/collaborations/request',
    { preHandler: [authenticateToken, authorizeRole(['student']), validateBody(sendCollaborationRequestSchema)] },
    collaborationController.sendCollaborationRequest,
  );

  fastify.post(
    '/collaborations/:id/accept',
    { preHandler: [authenticateToken, authorizeRole(['student'])] },
    collaborationController.acceptCollaborationRequest,
  );

  fastify.post(
    '/collaborations/:id/reject',
    { preHandler: [authenticateToken, authorizeRole(['student'])] },
    collaborationController.rejectCollaborationRequest,
  );

  fastify.get(
    '/collaborations',
    { preHandler: [authenticateToken, authorizeRole(['student'])] },
    collaborationController.listCollaborationRequests,
  );

  fastify.get(
    '/collaborations/incoming',
    { preHandler: [authenticateToken, authorizeRole(['student'])] },
    collaborationController.listIncomingCollaborationRequests,
  );

  fastify.get(
    '/collaborations/outgoing',
    { preHandler: [authenticateToken, authorizeRole(['student'])] },
    collaborationController.listOutgoingCollaborationRequests,
  );

  fastify.get(
    '/collaborations/active',
    { preHandler: [authenticateToken, authorizeRole(['student'])] },
    collaborationController.listActiveCollaborators,
  );

  fastify.get(
    '/collaborations/activity',
    { preHandler: [authenticateToken, authorizeRole(['student'])] },
    collaborationController.getActivityFeed,
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

  fastify.get(
    '/groups/:group_id',
    { preHandler: [authenticateToken, authorizeRole(['student'])] },
    collaborationController.getGroupById,
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
