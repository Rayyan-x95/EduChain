import { FastifyRequest, FastifyReply } from 'fastify';
import { SearchService } from './search.service';
import { searchStudentsSchema, skillAutocompleteSchema } from '@educhain/validators';

export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  searchStudents = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const parsed = searchStudentsSchema.parse(request.query);
    const result = await this.searchService.searchStudents(parsed, request.user);

    reply.status(200).send({ success: true, data: result });
  };

  autocompleteSkills = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const parsed = skillAutocompleteSchema.parse(request.query);
    const results = await this.searchService.autocompleteSkills(parsed);

    reply.status(200).send({ success: true, data: results });
  };

  autocompleteInstitutions = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { q, limit } = request.query as { q?: string; limit?: string };
    const results = await this.searchService.autocompleteInstitutions(q, limit ? parseInt(limit, 10) : undefined);

    reply.status(200).send({ success: true, data: results });
  };
}
