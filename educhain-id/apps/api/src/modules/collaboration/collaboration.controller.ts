import { FastifyRequest, FastifyReply } from 'fastify';
import { CollaborationService } from './collaboration.service';

export class CollaborationController {
  constructor(private readonly collaborationService: CollaborationService) {}

  followStudent = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { target_student_id } = request.body as { target_student_id: string };
    const studentId = await this.collaborationService.getStudentIdByUserId(request.user!.userId);
    const follow = await this.collaborationService.followStudent(studentId, target_student_id);
    reply.status(201).send({ success: true, data: follow });
  };

  unfollowStudent = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { student_id } = request.params as { student_id: string };
    const studentId = await this.collaborationService.getStudentIdByUserId(request.user!.userId);
    await this.collaborationService.unfollowStudent(studentId, student_id);
    reply.status(200).send({ success: true, data: { message: 'Unfollowed successfully' } });
  };

  getFollowers = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const { page, limit } = request.query as { page?: string; limit?: string };
    const result = await this.collaborationService.getFollowers(
      id,
      parseInt(page ?? '1') || 1,
      parseInt(limit ?? '20') || 20,
    );
    reply.status(200).send({ success: true, data: result });
  };

  getFollowing = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const { page, limit } = request.query as { page?: string; limit?: string };
    const result = await this.collaborationService.getFollowing(
      id,
      parseInt(page ?? '1') || 1,
      parseInt(limit ?? '20') || 20,
    );
    reply.status(200).send({ success: true, data: result });
  };

  sendCollaborationRequest = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { receiver_id, message } = request.body as { receiver_id: string; message?: string };
    const studentId = await this.collaborationService.getStudentIdByUserId(request.user!.userId);
    const collabRequest = await this.collaborationService.sendCollaborationRequest(
      studentId,
      receiver_id,
      message,
    );
    reply.status(201).send({ success: true, data: collabRequest });
  };

  acceptCollaborationRequest = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { request_id } = request.body as { request_id: string };
    const studentId = await this.collaborationService.getStudentIdByUserId(request.user!.userId);
    const result = await this.collaborationService.acceptCollaborationRequest(request_id, studentId);
    reply.status(200).send({ success: true, data: result });
  };

  rejectCollaborationRequest = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { request_id } = request.body as { request_id: string };
    const studentId = await this.collaborationService.getStudentIdByUserId(request.user!.userId);
    const result = await this.collaborationService.rejectCollaborationRequest(request_id, studentId);
    reply.status(200).send({ success: true, data: result });
  };

  listCollaborationRequests = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const studentId = await this.collaborationService.getStudentIdByUserId(request.user!.userId);
    const result = await this.collaborationService.listCollaborationRequests(studentId);
    reply.status(200).send({ success: true, data: result });
  };

  createGroup = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { name, description } = request.body as { name: string; description?: string };
    const studentId = await this.collaborationService.getStudentIdByUserId(request.user!.userId);
    const group = await this.collaborationService.createGroup(studentId, name, description);
    reply.status(201).send({ success: true, data: group });
  };

  listGroups = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const studentId = await this.collaborationService.getStudentIdByUserId(request.user!.userId);
    const groups = await this.collaborationService.listGroups(studentId);
    reply.status(200).send({ success: true, data: groups });
  };

  addGroupMember = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { group_id } = request.params as { group_id: string };
    const { student_id } = request.body as { student_id: string };
    const studentId = await this.collaborationService.getStudentIdByUserId(request.user!.userId);
    const member = await this.collaborationService.addGroupMember(group_id, studentId, student_id);
    reply.status(201).send({ success: true, data: member });
  };

  removeGroupMember = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { group_id, student_id } = request.params as { group_id: string; student_id: string };
    const requesterId = await this.collaborationService.getStudentIdByUserId(request.user!.userId);
    await this.collaborationService.removeGroupMember(group_id, requesterId, student_id);
    reply.status(200).send({ success: true, data: { message: 'Member removed successfully' } });
  };
}
