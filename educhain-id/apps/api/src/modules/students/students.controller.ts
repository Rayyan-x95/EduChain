import { FastifyRequest, FastifyReply } from 'fastify';
import { StudentsService } from './students.service';

export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  createProfile = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.user!.userId;
    const student = await this.studentsService.createProfile(userId, request.body as any);

    reply.status(201).send({ success: true, data: student });
  };

  getMyProfile = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.user!.userId;
    const student = await this.studentsService.getMyProfile(userId);

    reply.status(200).send({ success: true, data: student });
  };

  getById = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { studentId } = request.params as { studentId: string };
    const student = await this.studentsService.getById(studentId, request.user);

    reply.status(200).send({ success: true, data: student });
  };

  updateProfile = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.user!.userId;
    const student = await this.studentsService.updateProfile(userId, request.body as any);

    reply.status(200).send({ success: true, data: student });
  };

  listStudents = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { page, limit } = request.query as { page?: string; limit?: string };
    const result = await this.studentsService.listStudents(
      parseInt(page ?? '1') || 1,
      parseInt(limit ?? '20') || 20,
      request.user?.role,
    );

    reply.status(200).send({ success: true, data: result });
  };

  getProfileCompletion = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.user!.userId;
    const result = await this.studentsService.getProfileCompletion(userId);
    reply.status(200).send({ success: true, data: result });
  };
}
