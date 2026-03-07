import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import type { CreateProjectInput, UpdateProjectInput } from '@educhain/validators';

export class ProjectsService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: string, data: CreateProjectInput) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new AppError(404, 'Student profile not found');
    }

    return this.prisma.project.create({
      data: {
        studentId: student.id,
        title: data.title,
        description: data.description,
        repoLink: data.repoLink,
      },
    });
  }

  async getById(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { student: { select: { id: true, fullName: true, userId: true } } },
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    return project;
  }

  async getMyProjects(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new AppError(404, 'Student profile not found');
    }

    return this.prisma.project.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(userId: string, projectId: string, data: UpdateProjectInput) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { student: true },
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    if (project.student.userId !== userId) {
      throw new AppError(403, 'Not authorised to update this project');
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.repoLink !== undefined && { repoLink: data.repoLink }),
      },
    });
  }

  async delete(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { student: true },
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    if (project.student.userId !== userId) {
      throw new AppError(403, 'Not authorised to delete this project');
    }

    await this.prisma.project.delete({ where: { id: projectId } });
  }
}
