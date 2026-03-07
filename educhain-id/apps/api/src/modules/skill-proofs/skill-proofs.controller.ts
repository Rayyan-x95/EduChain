import { FastifyRequest, FastifyReply } from 'fastify';
import { SkillProofsService } from './skill-proofs.service';
import type { SubmitSkillProofInput, EndorseSkillInput } from '@educhain/validators';

export class SkillProofsController {
  constructor(private readonly service: SkillProofsService) {}

  submitProof = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const data = request.body as SubmitSkillProofInput;
    const proof = await this.service.submitProof(request.user!.userId, data);
    reply.status(201).send({ success: true, data: proof });
  };

  getMyProofs = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const proofs = await this.service.getMyProofs(request.user!.userId);
    reply.status(200).send({ success: true, data: proofs });
  };

  getProofsByStudent = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { studentId } = request.params as { studentId: string };
    const proofs = await this.service.getProofsByStudent(studentId);
    reply.status(200).send({ success: true, data: proofs });
  };

  endorseSkill = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const data = request.body as EndorseSkillInput;
    const endorsement = await this.service.endorseSkill(request.user!.userId, data);
    reply.status(201).send({ success: true, data: endorsement });
  };

  getMyEndorsements = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const endorsements = await this.service.getMyEndorsements(request.user!.userId);
    reply.status(200).send({ success: true, data: endorsements });
  };

  getEndorsementsForStudent = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const { studentId } = request.params as { studentId: string };
    const endorsements = await this.service.getEndorsementsForStudent(studentId);
    reply.status(200).send({ success: true, data: endorsements });
  };
}
