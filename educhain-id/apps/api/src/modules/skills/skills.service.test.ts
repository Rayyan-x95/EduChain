import { SkillsService } from './skills.service';

function createMockPrisma() {
  return {
    student: {
      findUnique: jest.fn(),
    },
    skill: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    studentSkill: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  } as any;
}

describe('SkillsService', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let service: SkillsService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new SkillsService(prisma);
  });

  it('should list all skills', async () => {
    prisma.skill.findMany.mockResolvedValue([
      { id: 1, name: 'typescript' },
      { id: 2, name: 'react' },
    ]);

    const result = await service.listAll();
    expect(result).toHaveLength(2);
  });

  it('should add a skill to a student', async () => {
    prisma.student.findUnique.mockResolvedValue({ id: 'student-1' });
    prisma.skill.upsert.mockResolvedValue({ id: 1, name: 'typescript' });
    prisma.studentSkill.findUnique.mockResolvedValue(null);
    prisma.studentSkill.create.mockResolvedValue({});

    const result = await service.addSkillToStudent('user-1', 'TypeScript');
    expect(result.name).toBe('typescript');
  });

  it('should throw 409 if skill already linked', async () => {
    prisma.student.findUnique.mockResolvedValue({ id: 'student-1' });
    prisma.skill.upsert.mockResolvedValue({ id: 1, name: 'typescript' });
    prisma.studentSkill.findUnique.mockResolvedValue({ studentId: 'student-1', skillId: 1 });

    await expect(
      service.addSkillToStudent('user-1', 'TypeScript'),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('should throw 404 if student profile not found', async () => {
    prisma.student.findUnique.mockResolvedValue(null);

    await expect(
      service.addSkillToStudent('user-1', 'TypeScript'),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('should remove a skill from a student', async () => {
    prisma.student.findUnique.mockResolvedValue({ id: 'student-1' });
    prisma.studentSkill.findUnique.mockResolvedValue({ studentId: 'student-1', skillId: 1 });
    prisma.studentSkill.delete.mockResolvedValue({});

    await expect(service.removeSkillFromStudent('user-1', 1)).resolves.not.toThrow();
  });
});
