import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import { verifyCredentialSignature } from '../../lib/credential.crypto';
import type { QRVerificationResult } from '@educhain/types';

export class VerifyService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Public verification by student ID — used by the QR verify page.
   * Returns identity profile + credential verification status.
   */
  async verifyStudentIdentity(studentId: string): Promise<QRVerificationResult> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            publicIdentitySlug: true,
            identityVisibility: true,
            outgoingRelationships: { select: { id: true } },
            incomingRelationships: { select: { id: true } },
          },
        },
        institution: { select: { name: true } },
        skills: { include: { skill: { select: { name: true } } } },
        receivedEndorsements: { select: { id: true } },
        credentials: {
          where: { status: 'active' },
          include: {
            institution: { select: { id: true, name: true, publicKey: true } },
          },
          orderBy: { issuedDate: 'desc' },
        },
      },
    });

    if (!student) {
      throw new AppError(404, 'Student not found');
    }

    // Privacy enforcement for public verification:
    // - Only publicly visible profiles can be verified by arbitrary scanners.
    // - Avoid leaking whether a private/recruiter-only student exists.
    if (student.profileVisibility !== 'public' || student.user.identityVisibility !== 'public') {
      throw new AppError(404, 'Student not found');
    }

    // Verify each credential's cryptographic signature
    const verifiedCredentials = student.credentials.map((c) => {
      let signatureValid = false;
      if (c.signature && c.credentialHash && c.institution.publicKey) {
        try {
          signatureValid = verifyCredentialSignature(
            c.credentialHash,
            c.signature,
            c.institution.publicKey,
          );
        } catch {
          signatureValid = false;
        }
      }

      return {
        id: c.id,
        title: c.title,
        credentialType: c.credentialType,
        issuedDate: c.issuedDate,
        status: c.status as 'active' | 'revoked',
        institutionName: c.institution.name,
        signatureValid,
      };
    });

    const user = student.user;

    return {
      verified: true,
      identity: {
        userId: user.id,
        username: user.username ?? '',
        slug: user.publicIdentitySlug ?? '',
        fullName: student.fullName,
        bio: student.bio,
        institution: student.institution?.name ?? null,
        degree: student.degree,
        graduationYear: student.graduationYear,
        skills: student.skills.map((ss) => ss.skill.name),
        verifiedCredentialCount: verifiedCredentials.filter((c) => c.signatureValid).length,
        endorsementCount: student.receivedEndorsements.length,
        relationshipCount:
          (user.outgoingRelationships?.length ?? 0) +
          (user.incomingRelationships?.length ?? 0),
      },
      credentials: verifiedCredentials,
      verifiedAt: new Date().toISOString(),
    };
  }
}
