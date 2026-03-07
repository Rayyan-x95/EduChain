import { PrismaClient, VerificationStatus as PrismaVerificationStatus } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import type { RequestVerificationInput } from '@educhain/validators';

export class VerificationsService {
  constructor(private readonly prisma: PrismaClient) {}

  async requestVerification(userId: string, data: RequestVerificationInput) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new AppError(404, 'Student profile not found');
    }

    const institution = await this.prisma.institution.findUnique({
      where: { id: data.institutionId },
    });
    if (!institution) {
      throw new AppError(404, 'Institution not found');
    }

    // Prevent duplicate pending requests
    const existing = await this.prisma.studentVerification.findFirst({
      where: {
        studentId: student.id,
        institutionId: data.institutionId,
        status: 'pending',
      },
    });
    if (existing) {
      throw new AppError(409, 'A pending verification request already exists');
    }

    return this.prisma.studentVerification.create({
      data: {
        studentId: student.id,
        institutionId: data.institutionId,
        studentEmail: data.studentEmail,
        studentIdNumber: data.studentIdNumber,
      },
      include: { institution: true },
    });
  }

  async getMyVerifications(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new AppError(404, 'Student profile not found');
    }

    return this.prisma.studentVerification.findMany({
      where: { studentId: student.id },
      include: { institution: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listByInstitution(institutionId: string, status?: string, page = 1, limit = 20) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const where: { institutionId: string; status?: PrismaVerificationStatus } = { institutionId };
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      where.status = status as PrismaVerificationStatus;
    }

    const [requests, total] = await Promise.all([
      this.prisma.studentVerification.findMany({
        where,
        include: { student: { select: { id: true, fullName: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.studentVerification.count({ where }),
    ]);

    return { requests, total, page, limit: take };
  }

  async reviewVerification(
    adminUserId: string,
    verificationId: string,
    decision: 'approved' | 'rejected',
  ) {
    const verification = await this.prisma.studentVerification.findUnique({
      where: { id: verificationId },
      include: { institution: true },
    });

    if (!verification) {
      throw new AppError(404, 'Verification request not found');
    }

    if (verification.status !== 'pending') {
      throw new AppError(400, 'This request has already been reviewed');
    }

    const updated = await this.prisma.studentVerification.update({
      where: { id: verificationId },
      data: { status: decision as PrismaVerificationStatus },
      include: { institution: true, student: true },
    });

    // If approved, link student to the institution
    if (decision === 'approved') {
      await this.prisma.student.update({
        where: { id: verification.studentId },
        data: { institutionId: verification.institutionId },
      });
    }

    return updated;
  }
}
