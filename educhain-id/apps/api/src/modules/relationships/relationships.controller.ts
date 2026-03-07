import { FastifyRequest, FastifyReply } from 'fastify';
import { RelationshipsService } from './relationships.service';
import type { CreateRelationshipInput } from '@educhain/validators';

export class RelationshipsController {
  constructor(private readonly service: RelationshipsService) {}

  create = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const data = request.body as CreateRelationshipInput;
    const rel = await this.service.createRelationship(request.user!.userId, data);
    reply.status(201).send({ success: true, data: rel });
  };

  getMine = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const data = await this.service.getRelationshipsForUser(request.user!.userId);
    reply.status(200).send({ success: true, data });
  };

  getForUser = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { userId } = request.params as { userId: string };
    const data = await this.service.getRelationshipsForUser(userId);
    reply.status(200).send({ success: true, data });
  };

  getGraph = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { userId } = request.params as { userId: string };
    const graph = await this.service.getReputationGraph(userId);
    reply.status(200).send({ success: true, data: graph });
  };

  remove = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = request.params as { id: string };
    await this.service.removeRelationship(request.user!.userId, id);
    reply.status(200).send({ success: true });
  };
}
