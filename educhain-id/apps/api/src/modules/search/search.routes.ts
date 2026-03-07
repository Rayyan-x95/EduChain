import { FastifyInstance } from 'fastify';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { optionalAuth } from '../../middleware/optionalAuth';
import { prisma } from '../../lib/prisma';

const searchService = new SearchService(prisma);
const searchController = new SearchController(searchService);

export async function searchRoutes(fastify: FastifyInstance): Promise<void> {
  // Student search (public, with optional auth for privacy)
  fastify.get(
    '/students',
    { preHandler: [optionalAuth] },
    searchController.searchStudents,
  );

  // Skill autocomplete (public)
  fastify.get(
    '/skills',
    { preHandler: [optionalAuth] },
    searchController.autocompleteSkills,
  );

  // Institution autocomplete (public)
  fastify.get(
    '/institutions',
    { preHandler: [optionalAuth] },
    searchController.autocompleteInstitutions,
  );
}
