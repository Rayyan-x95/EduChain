import { RecruitersService } from './recruiters.service';
import { AppError } from '../../middleware/errorHandler';

function createMockPrisma() {
  return {
    recruiter: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    shortlist: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  } as any;
}

describe('RecruitersService', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let service: RecruitersService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new RecruitersService(prisma);
  });

  // =========================================================================
  // Profile
  // =========================================================================

  describe('createProfile', () => {
    it('should create a recruiter profile', async () => {
      prisma.recruiter.findUnique.mockResolvedValue(null);
      prisma.recruiter.create.mockResolvedValue({
        id: 'rec-1',
        userId: 'user-1',
        companyName: 'Acme Corp',
        position: 'HR Manager',
        bio: 'Recruiting talent',
        createdAt: new Date(),
      });

      const result = await service.createProfile('user-1', {
        companyName: 'Acme Corp',
        position: 'HR Manager',
        bio: 'Recruiting talent',
      });

      expect(result.id).toBe('rec-1');
      expect(result.companyName).toBe('Acme Corp');
      expect(prisma.recruiter.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          companyName: 'Acme Corp',
          position: 'HR Manager',
          bio: 'Recruiting talent',
        },
      });
    });

    it('should reject if profile already exists', async () => {
      prisma.recruiter.findUnique.mockResolvedValue({ id: 'rec-1', userId: 'user-1' });

      await expect(
        service.createProfile('user-1', { companyName: 'X', position: 'Y' }),
      ).rejects.toThrow(AppError);

      await expect(
        service.createProfile('user-1', { companyName: 'X', position: 'Y' }),
      ).rejects.toThrow('Recruiter profile already exists');
    });
  });

  describe('getMyProfile', () => {
    it('should return the recruiter profile', async () => {
      const profile = { id: 'rec-1', userId: 'user-1', companyName: 'Acme Corp' };
      prisma.recruiter.findUnique.mockResolvedValue(profile);

      const result = await service.getMyProfile('user-1');
      expect(result).toEqual(profile);
    });

    it('should throw 404 if no profile', async () => {
      prisma.recruiter.findUnique.mockResolvedValue(null);

      await expect(service.getMyProfile('user-1')).rejects.toThrow(AppError);
      await expect(service.getMyProfile('user-1')).rejects.toThrow('Recruiter profile not found');
    });
  });

  describe('updateProfile', () => {
    it('should update recruiter profile fields', async () => {
      prisma.recruiter.findUnique.mockResolvedValue({ id: 'rec-1', userId: 'user-1' });
      prisma.recruiter.update.mockResolvedValue({
        id: 'rec-1',
        userId: 'user-1',
        companyName: 'New Corp',
        position: 'CTO',
        bio: null,
      });

      const result = await service.updateProfile('user-1', {
        companyName: 'New Corp',
        position: 'CTO',
      });

      expect(result.companyName).toBe('New Corp');
      expect(prisma.recruiter.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { companyName: 'New Corp', position: 'CTO' },
      });
    });

    it('should throw 404 if profile not found', async () => {
      prisma.recruiter.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile('user-1', { companyName: 'X' }),
      ).rejects.toThrow('Recruiter profile not found');
    });
  });

  // =========================================================================
  // Browse Students
  // =========================================================================

  describe('browseStudents', () => {
    it('should return paginated students visible to recruiters', async () => {
      const mockStudents = [
        {
          id: 's-1',
          fullName: 'Alice Smith',
          bio: 'Engineering student',
          degree: 'BSc CS',
          graduationYear: 2025,
          institution: { name: 'MIT' },
          skills: [{ skill: { name: 'TypeScript' } }],
          _count: { credentials: 2 },
        },
      ];
      prisma.student.findMany.mockResolvedValue(mockStudents);
      prisma.student.count.mockResolvedValue(1);

      const result = await service.browseStudents({ page: 1, limit: 20 });

      expect(result.students).toHaveLength(1);
      expect(result.students[0].full_name).toBe('Alice Smith');
      expect(result.students[0].top_skills).toEqual(['TypeScript']);
      expect(result.students[0].verified_credential_count).toBe(2);
      expect(result.total).toBe(1);
    });

    it('should apply skill filter', async () => {
      prisma.student.findMany.mockResolvedValue([]);
      prisma.student.count.mockResolvedValue(0);

      await service.browseStudents({ skill: 'React', page: 1, limit: 20 });

      expect(prisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            skills: {
              some: { skill: { name: { equals: 'React', mode: 'insensitive' } } },
            },
          }),
        }),
      );
    });

    it('should apply text search filter', async () => {
      prisma.student.findMany.mockResolvedValue([]);
      prisma.student.count.mockResolvedValue(0);

      await service.browseStudents({ q: 'Alice', page: 1, limit: 20 });

      expect(prisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            fullName: { contains: 'Alice', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('should apply graduation year filter', async () => {
      prisma.student.findMany.mockResolvedValue([]);
      prisma.student.count.mockResolvedValue(0);

      await service.browseStudents({ graduation_year: 2025, page: 1, limit: 20 });

      expect(prisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            graduationYear: 2025,
          }),
        }),
      );
    });

    it('should cap limit at 100', async () => {
      prisma.student.findMany.mockResolvedValue([]);
      prisma.student.count.mockResolvedValue(0);

      const result = await service.browseStudents({ limit: 500, page: 1 });

      expect(result.limit).toBe(100);
    });
  });

  // =========================================================================
  // View Student Profile
  // =========================================================================

  describe('viewStudentProfile', () => {
    it('should return a public student profile', async () => {
      const student = {
        id: 's-1',
        fullName: 'Alice',
        profileVisibility: 'public',
        institution: { name: 'MIT' },
        skills: [],
        projects: [],
        achievements: [],
        credentials: [],
      };
      prisma.student.findUnique.mockResolvedValue(student);

      const result = await service.viewStudentProfile('s-1');
      expect(result.id).toBe('s-1');
    });

    it('should allow recruiter_only visibility', async () => {
      prisma.student.findUnique.mockResolvedValue({
        id: 's-1',
        profileVisibility: 'recruiter_only',
      });

      const result = await service.viewStudentProfile('s-1');
      expect(result.id).toBe('s-1');
    });

    it('should block private profiles', async () => {
      prisma.student.findUnique.mockResolvedValue({
        id: 's-1',
        profileVisibility: 'private',
      });

      await expect(service.viewStudentProfile('s-1')).rejects.toThrow('This profile is private');
    });

    it('should throw 404 for non-existent student', async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(service.viewStudentProfile('s-999')).rejects.toThrow('Student not found');
    });
  });

  // =========================================================================
  // Shortlist
  // =========================================================================

  describe('addToShortlist', () => {
    it('should add a student to shortlist', async () => {
      prisma.recruiter.findUnique.mockResolvedValue({ id: 'rec-1', userId: 'user-1' });
      prisma.student.findUnique.mockResolvedValue({ id: 's-1' });
      prisma.shortlist.findUnique.mockResolvedValue(null);
      prisma.shortlist.create.mockResolvedValue({
        recruiterId: 'rec-1',
        studentId: 's-1',
        note: 'Great candidate',
        createdAt: new Date(),
        student: { id: 's-1', fullName: 'Alice', degree: 'BSc', institution: { name: 'MIT' } },
      });

      const result = await service.addToShortlist('user-1', {
        student_id: 's-1',
        note: 'Great candidate',
      });

      expect(result.studentId).toBe('s-1');
      expect(result.note).toBe('Great candidate');
    });

    it('should reject if recruiter profile missing', async () => {
      prisma.recruiter.findUnique.mockResolvedValue(null);

      await expect(
        service.addToShortlist('user-1', { student_id: 's-1' }),
      ).rejects.toThrow('Recruiter profile not found');
    });

    it('should reject if student not found', async () => {
      prisma.recruiter.findUnique.mockResolvedValue({ id: 'rec-1', userId: 'user-1' });
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(
        service.addToShortlist('user-1', { student_id: 's-999' }),
      ).rejects.toThrow('Student not found');
    });

    it('should reject duplicate shortlist entry', async () => {
      prisma.recruiter.findUnique.mockResolvedValue({ id: 'rec-1', userId: 'user-1' });
      prisma.student.findUnique.mockResolvedValue({ id: 's-1' });
      prisma.shortlist.findUnique.mockResolvedValue({ recruiterId: 'rec-1', studentId: 's-1' });

      await expect(
        service.addToShortlist('user-1', { student_id: 's-1' }),
      ).rejects.toThrow('Student already in shortlist');
    });
  });

  describe('getShortlist', () => {
    it('should return paginated shortlist entries', async () => {
      prisma.recruiter.findUnique.mockResolvedValue({ id: 'rec-1', userId: 'user-1' });
      prisma.shortlist.findMany.mockResolvedValue([
        {
          recruiterId: 'rec-1',
          studentId: 's-1',
          note: 'Strong',
          createdAt: new Date(),
          student: {
            id: 's-1',
            fullName: 'Alice',
            degree: 'BSc',
            graduationYear: 2025,
            institution: { name: 'MIT' },
            skills: [{ skill: { name: 'TypeScript' } }],
          },
        },
      ]);
      prisma.shortlist.count.mockResolvedValue(1);

      const result = await service.getShortlist('user-1', 1, 20);

      expect(result.shortlist).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.shortlist[0].student.fullName).toBe('Alice');
    });

    it('should throw 404 if recruiter profile missing', async () => {
      prisma.recruiter.findUnique.mockResolvedValue(null);

      await expect(service.getShortlist('user-1')).rejects.toThrow('Recruiter profile not found');
    });
  });

  describe('removeFromShortlist', () => {
    it('should remove a student from shortlist', async () => {
      prisma.recruiter.findUnique.mockResolvedValue({ id: 'rec-1', userId: 'user-1' });
      prisma.shortlist.findUnique.mockResolvedValue({
        recruiterId: 'rec-1',
        studentId: 's-1',
      });
      prisma.shortlist.delete.mockResolvedValue({});

      await service.removeFromShortlist('user-1', 's-1');

      expect(prisma.shortlist.delete).toHaveBeenCalledWith({
        where: {
          recruiterId_studentId: { recruiterId: 'rec-1', studentId: 's-1' },
        },
      });
    });

    it('should throw 404 if recruiter profile missing', async () => {
      prisma.recruiter.findUnique.mockResolvedValue(null);

      await expect(service.removeFromShortlist('user-1', 's-1')).rejects.toThrow(
        'Recruiter profile not found',
      );
    });

    it('should throw 404 if shortlist entry not found', async () => {
      prisma.recruiter.findUnique.mockResolvedValue({ id: 'rec-1', userId: 'user-1' });
      prisma.shortlist.findUnique.mockResolvedValue(null);

      await expect(service.removeFromShortlist('user-1', 's-1')).rejects.toThrow(
        'Student not in shortlist',
      );
    });
  });
});
