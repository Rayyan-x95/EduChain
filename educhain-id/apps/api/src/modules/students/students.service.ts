import { PrismaClient, ProfileVisibility as PrismaVisibility } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import type { TokenPayload } from '@educhain/types';
import type { CreateStudentProfileInput, UpdateStudentProfileInput } from '@educhain/validators';

export class StudentsService {
  constructor(private readonly prisma: PrismaClient) {}

  async createProfile(userId: string, data: CreateStudentProfileInput) {
    const existing = await this.prisma.student.findUnique({ where: { userId } });
    if (existing) {
      throw new AppError(409, 'Student profile already exists');
    }

    if (data.institutionId) {
      const institution = await this.prisma.institution.findUnique({
        where: { id: data.institutionId },
      });
      if (!institution) {
        throw new AppError(404, 'Institution not found');
      }
    }

    const student = await this.prisma.student.create({
      data: {
        userId,
        fullName: data.fullName,
        institutionId: data.institutionId,
        degree: data.degree,
        graduationYear: data.graduationYear,
        bio: data.bio,
        profileVisibility: (data.profileVisibility ?? 'public') as PrismaVisibility,
      },
      include: { institution: true, skills: { include: { skill: true } } },
    });

    return student;
  }

  async getMyProfile(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            username: true,
            publicIdentitySlug: true,
            identityVisibility: true,
          },
        },
        institution: true,
        skills: { include: { skill: true } },
        projects: { orderBy: { createdAt: 'desc' } },
        achievements: true,
      },
    });

    if (!student) {
      throw new AppError(404, 'Student profile not found');
    }

    return student;
  }

  async getById(studentId: string, requester?: TokenPayload) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            username: true,
            publicIdentitySlug: true,
            identityVisibility: true,
          },
        },
        institution: true,
        skills: { include: { skill: true } },
        projects: { orderBy: { createdAt: 'desc' } },
        achievements: true,
      },
    });

    if (!student) {
      throw new AppError(404, 'Student profile not found');
    }

    // Privacy enforcement
    const isOwner = requester?.userId === student.userId;
    if (isOwner) return student;

    if (student.profileVisibility === 'private') {
      throw new AppError(403, 'This profile is private');
    }

    if (student.profileVisibility === 'recruiter_only') {
      const allowedRoles = ['recruiter', 'institution_admin', 'platform_admin'];
      if (!requester || !allowedRoles.includes(requester.role)) {
        throw new AppError(403, 'This profile is restricted to recruiters');
      }
    }

    return student;
  }

  async updateProfile(userId: string, data: UpdateStudentProfileInput) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new AppError(404, 'Student profile not found');
    }

    if (data.institutionId) {
      const institution = await this.prisma.institution.findUnique({
        where: { id: data.institutionId },
      });
      if (!institution) {
        throw new AppError(404, 'Institution not found');
      }
    }

    const updated = await this.prisma.student.update({
      where: { userId },
      data: {
        ...(data.fullName !== undefined && { fullName: data.fullName }),
        ...(data.institutionId !== undefined && { institutionId: data.institutionId }),
        ...(data.degree !== undefined && { degree: data.degree }),
        ...(data.graduationYear !== undefined && { graduationYear: data.graduationYear }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.profileVisibility !== undefined && {
          profileVisibility: data.profileVisibility as PrismaVisibility,
        }),
      },
      include: { institution: true, skills: { include: { skill: true } } },
    });

    return updated;
  }

  async listStudents(page = 1, limit = 20, requesterRole?: string) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    // Public profiles are visible to everyone. Recruiter-only to recruiters+admins.
    const visibilityFilter: PrismaVisibility[] = ['public'];
    if (requesterRole && ['recruiter', 'institution_admin', 'platform_admin'].includes(requesterRole)) {
      visibilityFilter.push('recruiter_only');
    }

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where: { profileVisibility: { in: visibilityFilter } },
        include: {
          institution: true,
          skills: { include: { skill: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.student.count({
        where: { profileVisibility: { in: visibilityFilter } },
      }),
    ]);

    return { students, total, page, limit: take };
  }

  // ---------------------------------------------------------------------------
  // Profile completion score
  // ---------------------------------------------------------------------------

  async getProfileCompletion(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        skills: true,
        projects: true,
        achievements: true,
        credentials: { where: { status: 'active' } },
      },
    });

    if (!student) {
      throw new AppError(404, 'Student profile not found');
    }

    const checks = [
      { field: 'fullName', done: !!student.fullName, weight: 15 },
      { field: 'bio', done: !!student.bio, weight: 10 },
      { field: 'degree', done: !!student.degree, weight: 10 },
      { field: 'graduationYear', done: !!student.graduationYear, weight: 5 },
      { field: 'institution', done: !!student.institutionId, weight: 15 },
      { field: 'skills', done: student.skills.length > 0, weight: 15 },
      { field: 'projects', done: student.projects.length > 0, weight: 10 },
      { field: 'achievements', done: student.achievements.length > 0, weight: 10 },
      { field: 'credentials', done: student.credentials.length > 0, weight: 10 },
    ];

    const score = checks.reduce((sum, c) => sum + (c.done ? c.weight : 0), 0);
    const missing = checks.filter((c) => !c.done).map((c) => c.field);

    return { score, maxScore: 100, missing };
  }

  // ---------------------------------------------------------------------------
  // Dashboard stats
  // ---------------------------------------------------------------------------

  async getStudentStats(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      select: {
        id: true,
        institutionId: true,
        institution: {
          select: {
            id: true,
            name: true,
            verificationStatus: true,
          },
        },
      },
    });

    if (!student) {
      throw new AppError(404, 'Student profile not found');
    }

    const [
      credentialCount,
      projectCount,
      achievementCount,
      followerCount,
      groupCount,
      collaboratorCount,
      completion,
    ] = await Promise.all([
      this.prisma.credential.count({
        where: {
          studentId: student.id,
          status: 'active',
        },
      }),
      this.prisma.project.count({ where: { studentId: student.id } }),
      this.prisma.achievement.count({ where: { studentId: student.id } }),
      this.prisma.follow.count({ where: { followingId: student.id } }),
      this.prisma.groupMember.count({ where: { studentId: student.id } }),
      this.prisma.collaborationRequest.count({
        where: {
          status: 'accepted',
          OR: [{ senderId: student.id }, { receiverId: student.id }],
        },
      }),
      this.getProfileCompletion(userId),
    ]);

    return {
      institution: student.institution,
      profileCompletion: completion,
      credentialCount,
      projectCount,
      achievementCount,
      followerCount,
      groupCount,
      collaboratorCount,
      institutionVerified: Boolean(student.institution?.verificationStatus),
    };
  }

  async getInstitutionStats(userId: string) {
    const institution = await this.findInstitutionForAdmin(userId);

    const [
      studentCount,
      credentialCount,
      signedCredentialCount,
      pendingRequests,
      approvedRequests,
      totalRequests,
      activeKey,
      keyCount,
    ] =
      await Promise.all([
        this.prisma.student.count({ where: { institutionId: institution.id } }),
        this.prisma.credential.count({ where: { institutionId: institution.id } }),
        this.prisma.credential.count({
          where: {
            institutionId: institution.id,
            signature: { not: null },
            status: 'active',
          },
        }),
        this.prisma.studentVerification.count({
          where: { institutionId: institution.id, status: 'pending' },
        }),
        this.prisma.studentVerification.count({
          where: { institutionId: institution.id, status: 'approved' },
        }),
        this.prisma.studentVerification.count({ where: { institutionId: institution.id } }),
        this.prisma.institutionKey.findFirst({
          where: { institutionId: institution.id, status: 'active' },
          select: { id: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.institutionKey.count({ where: { institutionId: institution.id } }),
      ]);

    return {
      institution,
      studentCount,
      credentialCount,
      signedCredentialCount,
      pendingRequests,
      approvedRequests,
      verificationRate: totalRequests === 0 ? 0 : Math.round((approvedRequests / totalRequests) * 100),
      keyManagement: {
        hasActiveKey: Boolean(institution.publicKey),
        activeKeyId: activeKey?.id ?? null,
        activeKeyCreatedAt: activeKey?.createdAt ?? null,
        keyCount,
      },
    };
  }

  private async findInstitutionForAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (user.role !== 'institution_admin') {
      throw new AppError(403, 'Only institution administrators can access institution stats');
    }

    const domain = user.email.split('@')[1] ?? '';
    const institution = await this.prisma.institution.findUnique({
      where: { domain },
      select: {
        id: true,
        name: true,
        domain: true,
        verificationStatus: true,
        publicKey: true,
      },
    });

    if (!institution) {
      throw new AppError(404, 'Institution not found for your account');
    }

    return institution;
  }
}
