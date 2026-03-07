import { PrismaClient, ProofType as PrismaProofType } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import type { SubmitSkillProofInput, EndorseSkillInput } from '@educhain/validators';

export class SkillProofsService {
  constructor(private readonly prisma: PrismaClient) {}

  // ---------------------------------------------------------------------------
  // Skill Proofs
  // ---------------------------------------------------------------------------

  async submitProof(userId: string, data: SubmitSkillProofInput) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new AppError(404, 'Student profile not found');
    }

    // Upsert skill
    const skill = await this.prisma.skill.upsert({
      where: { name: data.skillName.trim().toLowerCase() },
      update: {},
      create: { name: data.skillName.trim().toLowerCase() },
    });

    const proof = await this.prisma.skillProof.create({
      data: {
        studentId: student.id,
        skillId: skill.id,
        proofType: data.proofType as PrismaProofType,
        referenceUrl: data.referenceUrl,
        description: data.description,
      },
      include: { skill: { select: { name: true } } },
    });

    return proof;
  }

  async getProofsByStudent(studentId: string) {
    return this.prisma.skillProof.findMany({
      where: { studentId },
      include: { skill: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyProofs(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new AppError(404, 'Student profile not found');
    }
    return this.getProofsByStudent(student.id);
  }

  // ---------------------------------------------------------------------------
  // Endorsements
  // ---------------------------------------------------------------------------

  async endorseSkill(userId: string, data: EndorseSkillInput) {
    const endorser = await this.prisma.student.findUnique({ where: { userId } });
    if (!endorser) {
      throw new AppError(404, 'Your student profile not found');
    }

    if (endorser.id === data.endorseeId) {
      throw new AppError(400, 'Cannot endorse yourself');
    }

    const endorsee = await this.prisma.student.findUnique({
      where: { id: data.endorseeId },
    });
    if (!endorsee) {
      throw new AppError(404, 'Target student not found');
    }

    const skill = await this.prisma.skill.findUnique({ where: { id: data.skillId } });
    if (!skill) {
      throw new AppError(404, 'Skill not found');
    }

    // Unique constraint: one endorsement per endorser-endorsee-skill triple
    const existing = await this.prisma.endorsement.findUnique({
      where: {
        endorserId_endorseeId_skillId: {
          endorserId: endorser.id,
          endorseeId: data.endorseeId,
          skillId: data.skillId,
        },
      },
    });

    if (existing) {
      throw new AppError(409, 'You have already endorsed this skill for this student');
    }

    const endorsement = await this.prisma.endorsement.create({
      data: {
        endorserId: endorser.id,
        endorseeId: data.endorseeId,
        skillId: data.skillId,
        message: data.message,
      },
      include: {
        skill: { select: { name: true } },
        endorser: { select: { fullName: true } },
        endorsee: { select: { fullName: true } },
      },
    });

    return endorsement;
  }

  async getEndorsementsForStudent(studentId: string) {
    return this.prisma.endorsement.findMany({
      where: { endorseeId: studentId },
      include: {
        skill: { select: { name: true } },
        endorser: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyEndorsements(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new AppError(404, 'Student profile not found');
    }
    return this.getEndorsementsForStudent(student.id);
  }
}
