import { FastifyRequest, FastifyReply } from 'fastify';
import { VerificationsService } from './verifications.service';

export class VerificationsController {
  constructor(private readonly verificationsService: VerificationsService) {}

  requestVerification = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const result = await this.verificationsService.requestVerification(
      request.user!.userId,
      request.body as any,
    );
    reply.status(201).send({ success: true, data: result });
  };

  getMyVerifications = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const verifications = await this.verificationsService.getMyVerifications(request.user!.userId);
    reply.status(200).send({ success: true, data: verifications });
  };

  listByInstitution = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { institutionId } = request.params as { institutionId: string };
    const { status, page, limit } = request.query as { status?: string; page?: string; limit?: string };

    const result = await this.verificationsService.listByInstitution(
      request.user!.userId,
      request.user!.role,
      institutionId,
      status,
      parseInt(page ?? '1') || 1,
      parseInt(limit ?? '20') || 20,
    );
    reply.status(200).send({ success: true, data: result });
  };

  listByCurrentInstitution = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { status, page, limit } = request.query as { status?: string; page?: string; limit?: string };
    const result = await this.verificationsService.listByCurrentInstitution(
      request.user!.userId,
      status,
      parseInt(page ?? '1', 10) || 1,
      parseInt(limit ?? '20', 10) || 20,
    );
    reply.status(200).send({ success: true, data: result });
  };

  reviewVerification = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { verificationId } = request.params as { verificationId: string };
    const { decision } = request.body as { decision: string };

    if (!decision || !['approved', 'rejected'].includes(decision)) {
      reply.status(400).send({ success: false, error: 'Decision must be "approved" or "rejected"' });
      return;
    }

    const result = await this.verificationsService.reviewVerification(
      request.user!.userId,
      verificationId,
      decision as 'approved' | 'rejected',
    );
    reply.status(200).send({ success: true, data: result });
  };
}
