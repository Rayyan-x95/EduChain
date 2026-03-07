import { FastifyRequest, FastifyReply } from 'fastify';
import { VerifyService } from './verify.service';

export class VerifyController {
  constructor(private readonly service: VerifyService) {}

  verifyStudent = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { studentId } = request.params as { studentId: string };
    const result = await this.service.verifyStudentIdentity(studentId);
    reply.status(200).send({ success: true, data: result });
  };
}
