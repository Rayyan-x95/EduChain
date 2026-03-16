import { PrismaClient, ProfileVisibility as PrismaVisibility, Prisma } from '@prisma/client';
import type { TokenPayload } from '@educhain/types';
import type { SearchStudentsInput, SkillAutocompleteInput } from '@educhain/validators';
import type { StudentSearchResult, SearchResponse, SkillAutocompleteResult } from '@educhain/types';
import {
  buildCacheKey,
  getCachedSearch,
  setCachedSearch,
} from '../../lib/search.cache';

export class SearchService {
  constructor(private readonly prisma: PrismaClient) {}

  // ---------------------------------------------------------------------------
  // Student search
  // ---------------------------------------------------------------------------

  async searchStudents(
    params: SearchStudentsInput,
    requester?: TokenPayload,
  ): Promise<SearchResponse> {
    // Build a cache key that includes the requester role for privacy scoping
    const cacheParams = { ...params, _role: requester?.role ?? 'public' };
    const cacheKey = buildCacheKey(cacheParams);

    const cached = await getCachedSearch(cacheKey);
    if (cached) {
      return JSON.parse(cached) as SearchResponse;
    }

    const take = Math.min(params.limit ?? 20, 100);

    // --- Build WHERE conditions ---
    const where: Prisma.StudentWhereInput = {};

    // Privacy: determine which visibilities this requester can see
    const visibilities: PrismaVisibility[] = ['public'];
    if (requester) {
      const role = requester.role;
      if (['recruiter', 'institution_admin', 'platform_admin'].includes(role)) {
        visibilities.push('recruiter_only');
      }
    }
    where.profileVisibility = { in: visibilities };

    // Full-text name search (trigram ILIKE for pg_trgm compatibility)
    if (params.q) {
      where.fullName = { contains: params.q, mode: 'insensitive' };
    }

    // Institution filter (name match)
    if (params.institution) {
      where.institution = { name: { contains: params.institution, mode: 'insensitive' } };
    }

    // Graduation year filter
    if (params.graduation_year) {
      where.graduationYear = params.graduation_year;
    }

    // Skill filter
    if (params.skills?.length) {
      where.skills = {
        some: {
          OR: params.skills.map((skill) => ({
            skill: { name: { equals: skill, mode: 'insensitive' } },
          })),
        },
      };
    }

    // Verified credentials filter
    if (params.verified_credentials) {
      where.credentials = {
        some: {
          status: 'active',
          signature: { not: null },
        },
      };
    }

    // Cursor-based pagination
    if (params.cursor) {
      where.id = { lt: params.cursor };
    }

    // --- Build ORDER BY ---
    const orderBy = this.buildOrderBy(params.sort ?? 'recent');

    // --- Query ---
    const students = await this.prisma.student.findMany({
      where,
      include: {
        institution: { select: { name: true } },
        skills: {
          include: { skill: { select: { name: true } } },
          take: 5,
        },
        _count: {
          select: {
            credentials: {
              where: { status: 'active', signature: { not: null } },
            },
          },
        },
      },
      orderBy,
      take: take + 1, // fetch one extra to determine next_cursor
    });

    const hasMore = students.length > take;
    const results = students.slice(0, take);

    const nextCursor = hasMore ? results[results.length - 1].id : null;

    const mapped: StudentSearchResult[] = results.map((s) => ({
      student_id: s.id,
      full_name: s.fullName,
      institution: s.institution?.name ?? null,
      degree: s.degree ?? null,
      graduation_year: s.graduationYear ?? null,
      top_skills: s.skills.map((ss) => ss.skill.name),
      verified_credential_count: (s as any)._count.credentials,
      profile_visibility: s.profileVisibility as any,
    }));

    // Count total matching records (without cursor) for info
    const countWhere = { ...where };
    delete countWhere.id; // remove cursor for total count
    const total = await this.prisma.student.count({ where: countWhere });

    const response: SearchResponse = { results: mapped, next_cursor: nextCursor, total };

    // Cache the result
    await setCachedSearch(cacheKey, JSON.stringify(response));

    return response;
  }

  // ---------------------------------------------------------------------------
  // Skill autocomplete
  // ---------------------------------------------------------------------------

  async autocompleteSkills(params: SkillAutocompleteInput): Promise<SkillAutocompleteResult[]> {
    const take = Math.min(params.limit ?? 10, 50);

    const skills = await this.prisma.skill.findMany({
      where: {
        name: { contains: params.q, mode: 'insensitive' },
      },
      select: { id: true, name: true },
      take,
      orderBy: { name: 'asc' },
    });

    return skills;
  }

  // ---------------------------------------------------------------------------
  // Institution autocomplete
  // ---------------------------------------------------------------------------

  async autocompleteInstitutions(q?: string, limit = 20) {
    const take = Math.min(limit, 50);
    return this.prisma.institution.findMany({
      where: q ? { name: { contains: q, mode: 'insensitive' } } : undefined,
      select: { id: true, name: true, verificationStatus: true },
      take,
      orderBy: { name: 'asc' },
    });
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private buildOrderBy(sort: string): Prisma.StudentOrderByWithRelationInput[] {
    switch (sort) {
      case 'graduation_year':
        return [{ graduationYear: 'asc' }, { createdAt: 'desc' }];
      case 'profile_popularity':
        // Proxy popularity by credential count direction — students with more
        // credentials surface first. True popularity scoring would require a
        // materialized view; this is a reasonable V1 approximation.
        return [{ credentials: { _count: 'desc' } }, { createdAt: 'desc' }];
      case 'recent':
      default:
        return [{ createdAt: 'desc' }];
    }
  }
}
