import { ProjectsService } from './projects.service';

function createMockPrisma() {
  return {
    student: {
      findUnique: jest.fn(),
    },
    project: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  } as any;
}

describe('ProjectsService', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let service: ProjectsService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new ProjectsService(prisma);
  });

  describe('create', () => {
    it('should create a project', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 'student-1' });
      prisma.project.create.mockResolvedValue({
        id: 'proj-1',
        title: 'My App',
        studentId: 'student-1',
      });

      const result = await service.create('user-1', { title: 'My App' });
      expect(result.title).toBe('My App');
    });

    it('should throw 404 if student not found', async () => {
      prisma.student.findUnique.mockResolvedValue(null);
      await expect(
        service.create('user-1', { title: 'My App' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('update', () => {
    it('should update own project', async () => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        student: { userId: 'user-1' },
      });
      prisma.project.update.mockResolvedValue({
        id: 'proj-1',
        title: 'Updated',
      });

      const result = await service.update('user-1', 'proj-1', { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });

    it('should deny updating another user\'s project', async () => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        student: { userId: 'user-2' },
      });

      await expect(
        service.update('user-1', 'proj-1', { title: 'hack' }),
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe('delete', () => {
    it('should delete own project', async () => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        student: { userId: 'user-1' },
      });
      prisma.project.delete.mockResolvedValue({});

      await expect(service.delete('user-1', 'proj-1')).resolves.not.toThrow();
    });

    it('should deny deleting another user\'s project', async () => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        student: { userId: 'user-2' },
      });

      await expect(
        service.delete('user-1', 'proj-1'),
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });
});
