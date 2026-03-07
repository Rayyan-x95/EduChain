import { PrismaClient, ProfileVisibility as PrismaVisibility, Prisma } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import type { CreateRecruiterProfileInput, UpdateRecruiterProfileInput, BrowseStudentsInput, AddToShortlistInput } from '@educhain/validators';
import type { RecruiterStudentView } from '@educhain/types';

export class RecruitersService {
  constructor(private readonly prisma: PrismaClient) {}

  // ---------------------------------------------------------------------------
  // Profile
  // ---------------------------------------------------------------------------

  async createProfile(userId: string, data: CreateRecruiterProfileInput) {
    const existing = await this.prisma.recruiter.findUnique({ where: { userId } });
    if (existing) {
      throw new AppError(409, 'Recruiter profile already exists');
    }

    return this.prisma.recruiter.create({
      data: {
        userId,
        companyName: data.companyName,
        position: data.position,
        bio: data.bio,
      },
    });
  }

  async getMyProfile(userId: string) {
    const recruiter = await this.prisma.recruiter.findUnique({ where: { userId } });
    if (!recruiter) {
      throw new AppError(404, 'Recruiter profile not found');
    }
    return recruiter;
  }

  async updateProfile(userId: string, data: UpdateRecruiterProfileInput) {
    const recruiter = await this.prisma.recruiter.findUnique({ where: { userId } });
    if (!recruiter) {
      throw new AppError(404, 'Recruiter profile not found');
    }

    return this.prisma.recruiter.update({
      where: { userId },
      data: {
        ...(data.companyName !== undefined && { companyName: data.companyName }),
        ...(data.position !== undefined && { position: data.position }),
        ...(data.bio !== undefined && { bio: data.bio }),
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Browse Students
  // ---------------------------------------------------------------------------

  async browseStudents(params: BrowseStudentsInput): Promise<{ students: RecruiterStudentView[]; total: number; page: number; limit: number }> {
    const take = Math.min(params.limit ?? 20, 100);
    const skip = ((params.page ?? 1) - 1) * take;

    const where: Prisma.StudentWhereInput = {
      // Recruiters see public + recruiter_only profiles
      profileVisibility: { in: ['public', 'recruiter_only'] as PrismaVisibility[] },
    };

    if (params.q) {
      where.fullName = { contains: params.q, mode: 'insensitive' };
    }

    if (params.institution) {
      where.institution = { name: { contains: params.institution, mode: 'insensitive' } };
    }

    if (params.graduation_year) {
      where.graduationYear = params.graduation_year;
    }

    if (params.skill) {
      where.skills = {
        some: { skill: { name: { equals: params.skill, mode: 'insensitive' } } },
      };
    }

    if (params.verified_only === 'true') {
      where.credentials = {
        some: { status: 'active', signature: { not: null } },
      };
    }

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        include: {
          institution: { select: { name: true } },
          skills: { include: { skill: { select: { name: true } } }, take: 5 },
          _count: {
            select: {
              credentials: { where: { status: 'active', signature: { not: null } } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.student.count({ where }),
    ]);

    const mapped: RecruiterStudentView[] = students.map((s) => ({
      student_id: s.id,
      full_name: s.fullName,
      institution: s.institution?.name ?? null,
      degree: s.degree ?? null,
      graduation_year: s.graduationYear ?? null,
      top_skills: s.skills.map((ss) => ss.skill.name),
      verified_credential_count: (s as any)._count.credentials,
      bio: s.bio ?? null,
    }));

    return { students: mapped, total, page: params.page ?? 1, limit: take };
  }

  // ---------------------------------------------------------------------------
  // Student Profile View
  // ---------------------------------------------------------------------------

  async viewStudentProfile(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        institution: true,
        skills: { include: { skill: true } },
        projects: { orderBy: { createdAt: 'desc' } },
        achievements: true,
        credentials: {
          where: { status: 'active' },
          include: { institution: { select: { name: true } } },
          orderBy: { issuedDate: 'desc' },
        },
      },
    });

    if (!student) {
      throw new AppError(404, 'Student not found');
    }

    // Recruiters can see public and recruiter_only profiles
    if (student.profileVisibility === 'private') {
      throw new AppError(403, 'This profile is private');
    }

    return student;
  }

  // ---------------------------------------------------------------------------
  // Shortlist
  // ---------------------------------------------------------------------------

  async addToShortlist(userId: string, data: AddToShortlistInput) {
    const recruiter = await this.prisma.recruiter.findUnique({ where: { userId } });
    if (!recruiter) {
      throw new AppError(404, 'Recruiter profile not found. Create a profile first.');
    }

    const student = await this.prisma.student.findUnique({ where: { id: data.student_id } });
    if (!student) {
      throw new AppError(404, 'Student not found');
    }

    const existing = await this.prisma.shortlist.findUnique({
      where: {
        recruiterId_studentId: {
          recruiterId: recruiter.id,
          studentId: data.student_id,
        },
      },
    });
    if (existing) {
      throw new AppError(409, 'Student already in shortlist');
    }

    return this.prisma.shortlist.create({
      data: {
        recruiterId: recruiter.id,
        studentId: data.student_id,
        note: data.note,
      },
      include: {
        student: {
          select: { id: true, fullName: true, degree: true, institution: { select: { name: true } } },
        },
      },
    });
  }

  async getShortlist(userId: string, page = 1, limit = 20) {
    const recruiter = await this.prisma.recruiter.findUnique({ where: { userId } });
    if (!recruiter) {
      throw new AppError(404, 'Recruiter profile not found');
    }

    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const [entries, total] = await Promise.all([
      this.prisma.shortlist.findMany({
        where: { recruiterId: recruiter.id },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              degree: true,
              graduationYear: true,
              institution: { select: { name: true } },
              skills: { include: { skill: { select: { name: true } } }, take: 5 },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.shortlist.count({ where: { recruiterId: recruiter.id } }),
    ]);

    return { shortlist: entries, total, page, limit: take };
  }

  async removeFromShortlist(userId: string, studentId: string) {
    const recruiter = await this.prisma.recruiter.findUnique({ where: { userId } });
    if (!recruiter) {
      throw new AppError(404, 'Recruiter profile not found');
    }

    const entry = await this.prisma.shortlist.findUnique({
      where: {
        recruiterId_studentId: {
          recruiterId: recruiter.id,
          studentId,
        },
      },
    });
    if (!entry) {
      throw new AppError(404, 'Student not in shortlist');
    }

    await this.prisma.shortlist.delete({
      where: {
        recruiterId_studentId: {
          recruiterId: recruiter.id,
          studentId,
        },
      },
    });
  }
}
