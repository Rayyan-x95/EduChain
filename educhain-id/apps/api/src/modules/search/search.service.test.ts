import { SearchService } from './search.service';
import { getCachedSearch, setCachedSearch } from '../../lib/search.cache';

// Mock the search cache so tests don't need Redis
jest.mock('../../lib/search.cache', () => ({
  buildCacheKey: jest.fn().mockReturnValue('search:students:mock'),
  getCachedSearch: jest.fn().mockResolvedValue(null),
  setCachedSearch: jest.fn().mockResolvedValue(undefined),
}));

const mockedGetCachedSearch = getCachedSearch as unknown as jest.MockedFunction<typeof getCachedSearch>;
const mockedSetCachedSearch = setCachedSearch as unknown as jest.MockedFunction<typeof setCachedSearch>;

function createMockPrisma() {
  return {
    student: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    skill: {
      findMany: jest.fn(),
    },
  } as any;
}

// Helpers
const makeStudent = (overrides: Record<string, any> = {}) => ({
  id: 'student-1',
  fullName: 'Jane Doe',
  degree: 'Computer Science',
  graduationYear: 2026,
  profileVisibility: 'public',
  createdAt: new Date('2024-01-01'),
  institution: { name: 'Stanford University' },
  skills: [
    { skill: { name: 'React' } },
    { skill: { name: 'TypeScript' } },
  ],
  _count: { credentials: 2 },
  ...overrides,
});

describe('SearchService', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let service: SearchService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new SearchService(prisma);
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // Student search
  // -----------------------------------------------------------------------
  describe('searchStudents', () => {
    beforeEach(() => {
      prisma.student.findMany.mockResolvedValue([makeStudent()]);
      prisma.student.count.mockResolvedValue(1);
    });

    it('should return student search results', async () => {
      const result = await service.searchStudents({ limit: 20, sort: 'recent' });

      expect(result.results).toHaveLength(1);
      expect(result.results[0].full_name).toBe('Jane Doe');
      expect(result.results[0].institution).toBe('Stanford University');
      expect(result.results[0].top_skills).toEqual(['React', 'TypeScript']);
      expect(result.results[0].verified_credential_count).toBe(2);
      expect(result.total).toBe(1);
      expect(result.next_cursor).toBeNull();
    });

    it('should filter by name query', async () => {
      await service.searchStudents({ q: 'jane', limit: 20, sort: 'recent' });

      const call = prisma.student.findMany.mock.calls[0][0];
      expect(call.where.fullName).toEqual({ contains: 'jane', mode: 'insensitive' });
    });

    it('should filter by skill', async () => {
      await service.searchStudents({ skill: 'typescript', limit: 20, sort: 'recent' });

      const call = prisma.student.findMany.mock.calls[0][0];
      expect(call.where.skills.some.skill.name).toEqual({
        equals: 'typescript',
        mode: 'insensitive',
      });
    });

    it('should filter by institution', async () => {
      await service.searchStudents({ institution: 'Stanford', limit: 20, sort: 'recent' });

      const call = prisma.student.findMany.mock.calls[0][0];
      expect(call.where.institution.name).toEqual({
        contains: 'Stanford',
        mode: 'insensitive',
      });
    });

    it('should filter by graduation year', async () => {
      await service.searchStudents({ graduation_year: 2026, limit: 20, sort: 'recent' });

      const call = prisma.student.findMany.mock.calls[0][0];
      expect(call.where.graduationYear).toBe(2026);
    });

    it('should filter by verified credentials', async () => {
      await service.searchStudents({
        verified_credentials: 'true',
        limit: 20,
        sort: 'recent',
      });

      const call = prisma.student.findMany.mock.calls[0][0];
      expect(call.where.credentials).toEqual({
        some: { status: 'active', signature: { not: null } },
      });
    });

    // -------------------------------------------------------------------
    // Pagination
    // -------------------------------------------------------------------
    it('should support cursor-based pagination', async () => {
      const cursor = '00000000-0000-0000-0000-000000000001';
      await service.searchStudents({ cursor, limit: 20, sort: 'recent' });

      const call = prisma.student.findMany.mock.calls[0][0];
      expect(call.where.id).toEqual({ lt: cursor });
    });

    it('should set next_cursor when there are more results', async () => {
      // Return limit+1 items to trigger hasMore
      const students = Array.from({ length: 3 }, (_, i) =>
        makeStudent({ id: `student-${i}` }),
      );
      prisma.student.findMany.mockResolvedValue(students);
      prisma.student.count.mockResolvedValue(5);

      const result = await service.searchStudents({ limit: 2, sort: 'recent' });

      expect(result.results).toHaveLength(2);
      expect(result.next_cursor).toBe('student-1');
    });

    // -------------------------------------------------------------------
    // Privacy filtering
    // -------------------------------------------------------------------
    it('should only show public profiles to unauthenticated users', async () => {
      await service.searchStudents({ limit: 20, sort: 'recent' });

      const call = prisma.student.findMany.mock.calls[0][0];
      expect(call.where.profileVisibility).toEqual({ in: ['public'] });
    });

    it('should show public+recruiter_only to recruiters', async () => {
      await service.searchStudents({ limit: 20, sort: 'recent' }, {
        userId: 'r-1',
        email: 'r@corp.com',
        role: 'recruiter',
      });

      const call = prisma.student.findMany.mock.calls[0][0];
      expect(call.where.profileVisibility).toEqual({
        in: ['public', 'recruiter_only'],
      });
    });

    it('should show public+recruiter_only to institution admins', async () => {
      await service.searchStudents({ limit: 20, sort: 'recent' }, {
        userId: 'a-1',
        email: 'a@mit.edu',
        role: 'institution_admin',
      });

      const call = prisma.student.findMany.mock.calls[0][0];
      expect(call.where.profileVisibility).toEqual({
        in: ['public', 'recruiter_only'],
      });
    });

    it('should show only public profiles to students', async () => {
      await service.searchStudents({ limit: 20, sort: 'recent' }, {
        userId: 's-1',
        email: 's@mail.com',
        role: 'student',
      });

      const call = prisma.student.findMany.mock.calls[0][0];
      expect(call.where.profileVisibility).toEqual({ in: ['public'] });
    });

    // -------------------------------------------------------------------
    // Sorting
    // -------------------------------------------------------------------
    it('should sort by recent by default', async () => {
      await service.searchStudents({ limit: 20, sort: 'recent' });

      const call = prisma.student.findMany.mock.calls[0][0];
      expect(call.orderBy).toEqual([{ createdAt: 'desc' }]);
    });

    it('should sort by graduation_year', async () => {
      await service.searchStudents({ limit: 20, sort: 'graduation_year' });

      const call = prisma.student.findMany.mock.calls[0][0];
      expect(call.orderBy).toEqual([
        { graduationYear: 'asc' },
        { createdAt: 'desc' },
      ]);
    });

    it('should sort by profile_popularity', async () => {
      await service.searchStudents({ limit: 20, sort: 'profile_popularity' });

      const call = prisma.student.findMany.mock.calls[0][0];
      expect(call.orderBy).toEqual([
        { credentials: { _count: 'desc' } },
        { createdAt: 'desc' },
      ]);
    });

    // -------------------------------------------------------------------
    // Caching
    // -------------------------------------------------------------------
    it('should return cached results when available', async () => {
      const cachedData = {
        results: [{ student_id: 'cached-1', full_name: 'Cached' }],
        next_cursor: null,
        total: 1,
      };
      mockedGetCachedSearch.mockResolvedValueOnce(JSON.stringify(cachedData));

      const result = await service.searchStudents({ limit: 20, sort: 'recent' });

      expect(result.results[0].student_id).toBe('cached-1');
      expect(prisma.student.findMany).not.toHaveBeenCalled();
    });

    it('should cache results after a fresh query', async () => {
      await service.searchStudents({ limit: 20, sort: 'recent' });

      expect(mockedSetCachedSearch).toHaveBeenCalledWith(
        'search:students:mock',
        expect.any(String),
      );
    });
  });

  // -----------------------------------------------------------------------
  // Skill autocomplete
  // -----------------------------------------------------------------------
  describe('autocompleteSkills', () => {
    it('should return matching skills', async () => {
      prisma.skill.findMany.mockResolvedValue([
        { id: 1, name: 'python' },
        { id: 2, name: 'pytorch' },
      ]);

      const result = await service.autocompleteSkills({ q: 'py', limit: 10 });

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('python');
      expect(result[1].name).toBe('pytorch');
    });

    it('should pass query with case-insensitive filter', async () => {
      prisma.skill.findMany.mockResolvedValue([]);

      await service.autocompleteSkills({ q: 'Re', limit: 10 });

      const call = prisma.skill.findMany.mock.calls[0][0];
      expect(call.where.name).toEqual({ contains: 'Re', mode: 'insensitive' });
    });

    it('should respect the limit parameter', async () => {
      prisma.skill.findMany.mockResolvedValue([]);

      await service.autocompleteSkills({ q: 'j', limit: 5 });

      const call = prisma.skill.findMany.mock.calls[0][0];
      expect(call.take).toBe(5);
    });
  });
});
