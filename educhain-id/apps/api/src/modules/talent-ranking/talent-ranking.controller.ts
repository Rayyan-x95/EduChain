import { FastifyRequest, FastifyReply } from 'fastify';
import { TalentRankingService } from './talent-ranking.service';

export class TalentRankingController {
  constructor(private readonly service: TalentRankingService) {}

  search = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = request.query as Record<string, string | undefined>;

    const skills = query.skills
      ? query.skills.split(',').map((s) => s.trim())
      : undefined;

    const result = await this.service.search({
      skills,
      institution: query.institution,
      graduation_year: query.graduation_year
        ? parseInt(query.graduation_year, 10)
        : undefined,
      min_score: query.min_score ? parseInt(query.min_score, 10) : undefined,
      page: Math.max(1, parseInt(query.page ?? '1', 10) || 1),
      limit: Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10) || 20)),
    });

    reply.status(200).send({ success: true, data: result });
  };
}
