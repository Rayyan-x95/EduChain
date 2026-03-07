import { FastifyRequest, FastifyReply } from 'fastify';
import { RecruitersService } from './recruiters.service';
import { browseStudentsSchema } from '@educhain/validators';

export class RecruitersController {
  constructor(private readonly recruitersService: RecruitersService) {}

  createProfile = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const recruiter = await this.recruitersService.createProfile(request.user!.userId, request.body as any);
    reply.status(201).send({ success: true, data: recruiter });
  };

  getMyProfile = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const recruiter = await this.recruitersService.getMyProfile(request.user!.userId);
    reply.status(200).send({ success: true, data: recruiter });
  };

  updateProfile = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const recruiter = await this.recruitersService.updateProfile(request.user!.userId, request.body as any);
    reply.status(200).send({ success: true, data: recruiter });
  };

  browseStudents = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const parsed = browseStudentsSchema.parse(request.query);
    const result = await this.recruitersService.browseStudents(parsed);
    reply.status(200).send({ success: true, data: result });
  };

  viewStudentProfile = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    const student = await this.recruitersService.viewStudentProfile(id);
    reply.status(200).send({ success: true, data: student });
  };

  addToShortlist = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const entry = await this.recruitersService.addToShortlist(request.user!.userId, request.body as any);
    reply.status(201).send({ success: true, data: entry });
  };

  getShortlist = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { page, limit } = request.query as { page?: string; limit?: string };
    const result = await this.recruitersService.getShortlist(
      request.user!.userId,
      parseInt(page ?? '1') || 1,
      parseInt(limit ?? '20') || 20,
    );
    reply.status(200).send({ success: true, data: result });
  };

  removeFromShortlist = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    await this.recruitersService.removeFromShortlist(request.user!.userId, id);
    reply.status(200).send({ success: true, data: { message: 'Removed from shortlist' } });
  };
}
