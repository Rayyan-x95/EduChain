import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';

export class SkillsService {
  constructor(private readonly prisma: PrismaClient) {}

  async listAll() {
    return this.prisma.skill.findMany({ orderBy: { name: 'asc' } });
  }

  async addSkillToStudent(userId: string, skillName: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new AppError(404, 'Student profile not found');
    }

    // Upsert the skill (find or create)
    const skill = await this.prisma.skill.upsert({
      where: { name: skillName.trim().toLowerCase() },
      update: {},
      create: { name: skillName.trim().toLowerCase() },
    });

    // Check if already linked
    const existing = await this.prisma.studentSkill.findUnique({
      where: { studentId_skillId: { studentId: student.id, skillId: skill.id } },
    });

    if (existing) {
      throw new AppError(409, 'Skill already added');
    }

    await this.prisma.studentSkill.create({
      data: { studentId: student.id, skillId: skill.id },
    });

    return skill;
  }

  async removeSkillFromStudent(userId: string, skillId: number) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new AppError(404, 'Student profile not found');
    }

    const link = await this.prisma.studentSkill.findUnique({
      where: { studentId_skillId: { studentId: student.id, skillId } },
    });

    if (!link) {
      throw new AppError(404, 'Skill not linked to this student');
    }

    await this.prisma.studentSkill.delete({
      where: { studentId_skillId: { studentId: student.id, skillId } },
    });
  }

  async getStudentSkills(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: { skills: { include: { skill: true } } },
    });

    if (!student) {
      throw new AppError(404, 'Student profile not found');
    }

    return student.skills.map((ss) => ss.skill);
  }
}
