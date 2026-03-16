import { AchievementsService } from './achievements.service';

function createMockPrisma() {
  return {
    student: {
      findUnique: jest.fn(),
    },
    achievement: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as any;
}

describe('AchievementsService', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let service: AchievementsService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new AchievementsService(prisma);
  });

  it('should create an achievement', async () => {
    prisma.student.findUnique.mockResolvedValue({ id: 'student-1' });
    prisma.achievement.create.mockResolvedValue({
      id: 'ach-1',
      title: 'Dean\'s List',
      studentId: 'student-1',
    });

    const result = await service.create('user-1', { title: "Dean's List" });
    expect(result.title).toBe("Dean's List");
  });

  it('should throw 404 on create if student not found', async () => {
    prisma.student.findUnique.mockResolvedValue(null);
    await expect(
      service.create('user-1', { title: 'Test' }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('should deny deleting another user\'s achievement', async () => {
    prisma.achievement.findUnique.mockResolvedValue({
      id: 'ach-1',
      student: { userId: 'user-2' },
    });

    await expect(
      service.delete('user-1', 'ach-1'),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('should delete own achievement', async () => {
    prisma.achievement.findUnique.mockResolvedValue({
      id: 'ach-1',
      student: { userId: 'user-1' },
    });
    prisma.achievement.delete.mockResolvedValue({});

    await expect(service.delete('user-1', 'ach-1')).resolves.not.toThrow();
  });
});
