import { PrismaClient, Prisma, ProfileVisibility as PrismaVisibility } from '@prisma/client';
import type { TalentSearchResult } from '@educhain/types';

// ---------------------------------------------------------------------------
// Scoring weights for the talent ranking algorithm
// ---------------------------------------------------------------------------
const WEIGHTS = {
  VERIFIED_CREDENTIAL: 20,
  SKILL_PROOF_VERIFIED: 10,
  SKILL_PROOF_PENDING: 3,
  ENDORSEMENT: 5,
  RELATIONSHIP: 2,
  PROJECT: 4,
  ACHIEVEMENT: 3,
} as const;

export class TalentRankingService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Search and rank students for recruiter talent discovery.
   */
  async search(params: {
    skills?: string[];
    institution?: string;
    graduation_year?: number;
    min_score?: number;
    page: number;
    limit: number;
  }): Promise<{ results: TalentSearchResult[]; total: number; page: number; limit: number }> {
    const take = Math.min(params.limit, 100);
    const skip = (params.page - 1) * take;

    const where: Prisma.StudentWhereInput = {
      profileVisibility: { in: ['public', 'recruiter_only'] as PrismaVisibility[] },
    };

    if (params.institution) {
      where.institution = { name: { contains: params.institution, mode: 'insensitive' } };
    }

    if (params.graduation_year) {
      where.graduationYear = params.graduation_year;
    }

    if (params.skills?.length) {
      where.skills = {
        some: {
          skill: {
            name: { in: params.skills.map((s) => s.toLowerCase()), mode: 'insensitive' },
          },
        },
      };
    }

    const students = await this.prisma.student.findMany({
      where,
      include: {
        institution: { select: { name: true } },
        skills: { include: { skill: { select: { name: true } } }, take: 10 },
        credentials: {
          where: { status: 'active', signature: { not: null } },
          select: { id: true },
        },
        skillProofs: { select: { verificationStatus: true } },
        receivedEndorsements: { select: { id: true } },
        projects: { select: { id: true } },
        achievements: { select: { id: true } },
        user: {
          select: {
            outgoingRelationships: { select: { id: true } },
            incomingRelationships: { select: { id: true } },
          },
        },
      },
    });

    // Compute talent score for each student
    const scored: TalentSearchResult[] = students.map((s) => {
      const verifiedCreds = s.credentials.length;
      const verifiedProofs = s.skillProofs.filter(
        (p) => p.verificationStatus === 'verified',
      ).length;
      const pendingProofs = s.skillProofs.filter(
        (p) => p.verificationStatus === 'pending',
      ).length;
      const endorsements = s.receivedEndorsements.length;
      const relationships =
        (s.user?.outgoingRelationships?.length ?? 0) +
        (s.user?.incomingRelationships?.length ?? 0);
      const projects = s.projects.length;
      const achievements = s.achievements.length;

      const rawScore =
        verifiedCreds * WEIGHTS.VERIFIED_CREDENTIAL +
        verifiedProofs * WEIGHTS.SKILL_PROOF_VERIFIED +
        pendingProofs * WEIGHTS.SKILL_PROOF_PENDING +
        endorsements * WEIGHTS.ENDORSEMENT +
        relationships * WEIGHTS.RELATIONSHIP +
        projects * WEIGHTS.PROJECT +
        achievements * WEIGHTS.ACHIEVEMENT;

      // Normalise to 0-100 (sigmoid-like capping)
      const talentScore = Math.min(100, Math.round((rawScore / (rawScore + 50)) * 100));

      return {
        studentId: s.id,
        fullName: s.fullName,
        institution: s.institution?.name ?? null,
        degree: s.degree ?? null,
        graduationYear: s.graduationYear ?? null,
        topSkills: s.skills.map((ss) => ss.skill.name),
        verifiedCredentialCount: verifiedCreds,
        endorsementCount: endorsements,
        talentScore,
      };
    });

    // Sort by talent score descending
    scored.sort((a, b) => b.talentScore - a.talentScore);

    // Apply min_score filter after scoring
    const filtered = params.min_score
      ? scored.filter((s) => s.talentScore >= params.min_score!)
      : scored;

    const paginated = filtered.slice(skip, skip + take);

    return {
      results: paginated,
      total: filtered.length,
      page: params.page,
      limit: take,
    };
  }
}
