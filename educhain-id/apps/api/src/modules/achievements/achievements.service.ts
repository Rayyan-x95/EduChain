import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import type { CreateAchievementInput, UpdateAchievementInput } from '@educhain/validators';

export class AchievementsService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: string, data: CreateAchievementInput) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new AppError(404, 'Student profile not found');
    }

    return this.prisma.achievement.create({
      data: {
        studentId: student.id,
        title: data.title,
        description: data.description,
        issuedBy: data.issuedBy,
        date: data.date ? new Date(data.date) : undefined,
      },
    });
  }

  async getMyAchievements(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new AppError(404, 'Student profile not found');
    }

    return this.prisma.achievement.findMany({
      where: { studentId: student.id },
      orderBy: { date: 'desc' },
    });
  }

  async update(userId: string, achievementId: string, data: UpdateAchievementInput) {
    const achievement = await this.prisma.achievement.findUnique({
      where: { id: achievementId },
      include: { student: true },
    });

    if (!achievement) {
      throw new AppError(404, 'Achievement not found');
    }

    if (achievement.student.userId !== userId) {
      throw new AppError(403, 'Not authorised to update this achievement');
    }

    return this.prisma.achievement.update({
      where: { id: achievementId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.issuedBy !== undefined && { issuedBy: data.issuedBy }),
        ...(data.date !== undefined && { date: data.date ? new Date(data.date) : null }),
      },
    });
  }

  async delete(userId: string, achievementId: string) {
    const achievement = await this.prisma.achievement.findUnique({
      where: { id: achievementId },
      include: { student: true },
    });

    if (!achievement) {
      throw new AppError(404, 'Achievement not found');
    }

    if (achievement.student.userId !== userId) {
      throw new AppError(403, 'Not authorised to delete this achievement');
    }

    await this.prisma.achievement.delete({ where: { id: achievementId } });
  }
}
