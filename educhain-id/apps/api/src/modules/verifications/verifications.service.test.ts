import { VerificationsService } from './verifications.service';

function createMockPrisma() {
  return {
    student: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    institution: {
      findUnique: jest.fn(),
    },
    studentVerification: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  } as any;
}

describe('VerificationsService', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let service: VerificationsService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new VerificationsService(prisma);
  });

  describe('requestVerification', () => {
    it('should create a verification request', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 'student-1' });
      prisma.institution.findUnique.mockResolvedValue({ id: 'inst-1' });
      prisma.studentVerification.findFirst.mockResolvedValue(null);
      prisma.studentVerification.create.mockResolvedValue({
        id: 'ver-1',
        status: 'pending',
      });

      const result = await service.requestVerification('user-1', {
        institutionId: 'inst-1',
        studentEmail: 'john@uni.edu',
        studentIdNumber: 'STU001',
      });

      expect(result.status).toBe('pending');
    });

    it('should throw 409 if pending request already exists', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 'student-1' });
      prisma.institution.findUnique.mockResolvedValue({ id: 'inst-1' });
      prisma.studentVerification.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.requestVerification('user-1', {
          institutionId: 'inst-1',
          studentEmail: 'john@uni.edu',
          studentIdNumber: 'STU001',
        }),
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('should throw 404 if institution not found', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 'student-1' });
      prisma.institution.findUnique.mockResolvedValue(null);

      await expect(
        service.requestVerification('user-1', {
          institutionId: 'bad-id',
          studentEmail: 'john@uni.edu',
          studentIdNumber: 'STU001',
        }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('reviewVerification', () => {
    it('should approve and link student to institution', async () => {
      prisma.studentVerification.findUnique.mockResolvedValue({
        id: 'ver-1',
        status: 'pending',
        studentId: 'student-1',
        institutionId: 'inst-1',
        institution: { id: 'inst-1' },
      });
      prisma.studentVerification.update.mockResolvedValue({
        id: 'ver-1',
        status: 'approved',
      });
      prisma.student.update.mockResolvedValue({});

      const result = await service.reviewVerification('admin-1', 'ver-1', 'approved');
      expect(result.status).toBe('approved');
      expect(prisma.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: { institutionId: 'inst-1' },
      });
    });

    it('should reject without linking', async () => {
      prisma.studentVerification.findUnique.mockResolvedValue({
        id: 'ver-1',
        status: 'pending',
        studentId: 'student-1',
        institutionId: 'inst-1',
        institution: { id: 'inst-1' },
      });
      prisma.studentVerification.update.mockResolvedValue({
        id: 'ver-1',
        status: 'rejected',
      });

      const result = await service.reviewVerification('admin-1', 'ver-1', 'rejected');
      expect(result.status).toBe('rejected');
      expect(prisma.student.update).not.toHaveBeenCalled();
    });

    it('should throw 400 if already reviewed', async () => {
      prisma.studentVerification.findUnique.mockResolvedValue({
        id: 'ver-1',
        status: 'approved',
      });

      await expect(
        service.reviewVerification('admin-1', 'ver-1', 'rejected'),
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });
});
