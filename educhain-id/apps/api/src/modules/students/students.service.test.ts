import { StudentsService } from './students.service';
import { AppError } from '../../middleware/errorHandler';

// Minimal mock Prisma client factory
function createMockPrisma() {
  return {
    student: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    institution: {
      findUnique: jest.fn(),
    },
  } as any;
}

describe('StudentsService', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let service: StudentsService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new StudentsService(prisma);
  });

  describe('createProfile', () => {
    it('should create a new student profile', async () => {
      prisma.student.findUnique.mockResolvedValue(null);
      prisma.student.create.mockResolvedValue({
        id: 'student-1',
        userId: 'user-1',
        fullName: 'John Doe',
        profileVisibility: 'public',
      });

      const result = await service.createProfile('user-1', {
        fullName: 'John Doe',
      });

      expect(result.fullName).toBe('John Doe');
      expect(prisma.student.create).toHaveBeenCalledTimes(1);
    });

    it('should throw 409 if profile already exists', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.createProfile('user-1', { fullName: 'John' }),
      ).rejects.toThrow(AppError);

      await expect(
        service.createProfile('user-1', { fullName: 'John' }),
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('should throw 404 if institution not found', async () => {
      prisma.student.findUnique.mockResolvedValue(null);
      prisma.institution.findUnique.mockResolvedValue(null);

      await expect(
        service.createProfile('user-1', {
          fullName: 'John',
          institutionId: 'bad-id',
        }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('getById – privacy', () => {
    const publicStudent = {
      id: 'student-1',
      userId: 'user-1',
      fullName: 'Jane',
      profileVisibility: 'public',
    };

    const privateStudent = {
      ...publicStudent,
      profileVisibility: 'private',
    };

    const recruiterOnlyStudent = {
      ...publicStudent,
      profileVisibility: 'recruiter_only',
    };

    it('should return public profile to anyone', async () => {
      prisma.student.findUnique.mockResolvedValue(publicStudent);
      const result = await service.getById('student-1');
      expect(result.fullName).toBe('Jane');
    });

    it('should return private profile to owner', async () => {
      prisma.student.findUnique.mockResolvedValue(privateStudent);
      const result = await service.getById('student-1', {
        userId: 'user-1',
        email: 'a@b.com',
        role: 'student',
      });
      expect(result.fullName).toBe('Jane');
    });

    it('should deny private profile to non-owner', async () => {
      prisma.student.findUnique.mockResolvedValue(privateStudent);
      await expect(
        service.getById('student-1', {
          userId: 'user-2',
          email: 'b@b.com',
          role: 'student',
        }),
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('should allow recruiter to see recruiter_only profile', async () => {
      prisma.student.findUnique.mockResolvedValue(recruiterOnlyStudent);
      const result = await service.getById('student-1', {
        userId: 'user-2',
        email: 'b@b.com',
        role: 'recruiter',
      });
      expect(result.fullName).toBe('Jane');
    });

    it('should deny student access to recruiter_only profile', async () => {
      prisma.student.findUnique.mockResolvedValue(recruiterOnlyStudent);
      await expect(
        service.getById('student-1', {
          userId: 'user-2',
          email: 'b@b.com',
          role: 'student',
        }),
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('should throw 404 for non-existent student', async () => {
      prisma.student.findUnique.mockResolvedValue(null);
      await expect(service.getById('nope')).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('updateProfile', () => {
    it('should update fields', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 'student-1', userId: 'user-1' });
      prisma.student.update.mockResolvedValue({
        id: 'student-1',
        bio: 'updated bio',
      });

      const result = await service.updateProfile('user-1', { bio: 'updated bio' });
      expect(result.bio).toBe('updated bio');
    });

    it('should throw 404 for non-existent profile', async () => {
      prisma.student.findUnique.mockResolvedValue(null);
      await expect(
        service.updateProfile('user-1', { bio: 'test' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
