import { FastifyRequest, FastifyReply } from 'fastify';
import { AchievementsService } from './achievements.service';

export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  create = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const achievement = await this.achievementsService.create(request.user!.userId, request.body as any);
    reply.status(201).send({ success: true, data: achievement });
  };

  getMyAchievements = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const achievements = await this.achievementsService.getMyAchievements(request.user!.userId);
    reply.status(200).send({ success: true, data: achievements });
  };

  update = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { achievementId } = request.params as { achievementId: string };
    const achievement = await this.achievementsService.update(
      request.user!.userId,
      achievementId,
      request.body as any,
    );
    reply.status(200).send({ success: true, data: achievement });
  };

  delete = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { achievementId } = request.params as { achievementId: string };
    await this.achievementsService.delete(request.user!.userId, achievementId);
    reply.status(200).send({ success: true });
  };
}
