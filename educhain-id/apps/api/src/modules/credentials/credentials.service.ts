import crypto from "crypto";
import { PrismaClient, CredentialStatus as PrismaCredentialStatus } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import {
  generateCredentialHash,
  signCredential,
  verifyCredentialSignature,
  generateInstitutionKeyPair,
  generateKeyFingerprint,
} from '../../lib/credential.crypto';
import { InstitutionKeyStore } from '../../lib/keyStore';
import { AuditLogService } from '../audit/audit.service';
import type { IssueCredentialInput } from '@educhain/validators';
import type { CredentialVerificationResult, OfflineVerificationPayload, InstitutionKeyRegistryEntry } from '@educhain/types';
import { enqueueCredentialSigning } from '../../queue/credential.queue';
import { buildVerifiableCredential, buildOfflineVerificationPayload } from '../../lib/vc';
import { cacheGet, cacheSet, cacheDelete } from '../../lib/cache';

export class CredentialsService {
  private auditLog: AuditLogService;
  private keyStore: InstitutionKeyStore;

  constructor(private readonly prisma: PrismaClient) {
    this.auditLog = new AuditLogService(prisma);
    this.keyStore = new InstitutionKeyStore(prisma);
  }

  private async assertInstitutionAccess(requesterUserId: string, requesterRole: string, institutionId: string) {
    if (requesterRole === 'platform_admin') return;
    if (requesterRole !== 'institution_admin') throw new AppError(403, 'Forbidden');

    const [user, institution] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: requesterUserId }, select: { email: true } }),
      this.prisma.institution.findUnique({ where: { id: institutionId }, select: { domain: true } }),
    ]);

    if (!user || !institution) throw new AppError(404, 'Institution not found');

    const emailDomain = user.email.split('@')[1] ?? '';
    if (emailDomain.toLowerCase() !== institution.domain.toLowerCase()) {
      throw new AppError(403, 'Forbidden');
    }
  }

  // ---------------------------------------------------------------------------
  // Institution key management
  // ---------------------------------------------------------------------------

  async generateKeys(institutionId: string, actorId: string, actorRole: string) {
    await this.assertInstitutionAccess(actorId, actorRole, institutionId);
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) {
      throw new AppError(404, 'Institution not found');
    }

    if (institution.publicKey) {
      throw new AppError(409, 'Institution already has a key pair');
    }

    const { publicKey, privateKey } = generateInstitutionKeyPair();

    // Store public key in DB, private key reference points to a local secret
    // In production this would be AWS Secrets Manager; here we store an
    // encrypted reference. For the MVP the private key is stored in an
    // env-based secrets map keyed by institution id.
    const privateKeyRef = `local:${institutionId}`;

    await this.prisma.institution.update({
      where: { id: institutionId },
      data: {
        publicKey,
        privateKeyRef,
      },
    });

    // Store the private key encrypted in the database
    await this.keyStore.storePrivateKey(institutionId, privateKey);

    // Track key version
    await this.prisma.institutionKey.create({ data: { institutionId, publicKey, status: "active" } });

    await this.auditLog.log({
      actorId,
      actorRole,
      action: 'institution_keys_generated',
      entityType: 'institution',
      entityId: institutionId,
      metadata: { publicKeyFingerprint: publicKey.slice(0, 64) },
    });

    return { publicKey, privateKeyRef };
  }

  // ---------------------------------------------------------------------------
  // Credential issuing
  // ---------------------------------------------------------------------------

  async issueCredential(
    adminUserId: string,
    adminRole: string,
    data: IssueCredentialInput,
  ) {
    // Look up the institution this admin belongs to
    const institution = await this.findAdminInstitution(adminUserId);

    // Resolve the student by UUID or verified email within the institution.
    const student = data.studentId
      ? await this.prisma.student.findUnique({
          where: { id: data.studentId },
        })
      : await this.prisma.student.findFirst({
          where: {
            institutionId: institution.id,
            user: {
              email: data.studentEmail,
            },
          },
        });

    if (!student) {
      throw new AppError(404, 'Student not found');
    }

    if (student.institutionId !== institution.id) {
      throw new AppError(403, 'Student does not belong to your institution');
    }

    // Build credential payload for hashing
    const credentialPayload = {
      studentId: student.id,
      institutionId: institution.id,
      credentialType: data.credentialType,
      title: data.title,
      description: data.description ?? '',
      issuedDate: data.issuedDate,
    };

    const credentialHash = generateCredentialHash(credentialPayload);

    // Try to sign immediately if we have the private key
    let signature: string | null = null;
    let signedAt: Date | null = null;
    let keyId: string | null = null;
    const privateKey = await this.getPrivateKey(institution.id);
    if (privateKey && institution.publicKey) {
      signature = signCredential(credentialHash, privateKey);
      signedAt = new Date();
      const activeKey = await this.prisma.institutionKey.findFirst({ where: { institutionId: institution.id, status: "active" }, orderBy: { createdAt: "desc" } }); if (activeKey) { keyId = activeKey.id; }
    }

    const credential = await this.prisma.credential.create({
      data: {
        studentId: student.id,
        institutionId: institution.id,
        credentialType: data.credentialType,
        title: data.title,
        description: data.description,
        issuedDate: new Date(data.issuedDate),
        credentialHash,
        signature,
        signedAt,
        keyId,
        nonce: crypto.randomBytes(16).toString('hex'),
          status: 'active',
        },
      include: {
        student: { select: { id: true, fullName: true } },
        institution: { select: { id: true, name: true, domain: true } },
      },
    });

    await this.auditLog.log({
      actorId: adminUserId,
      actorRole: adminRole,
      action: 'credential_issued',
      entityType: 'credential',
      entityId: credential.id,
      metadata: {
        studentId: student.id,
        studentEmail: data.studentEmail ?? null,
        credentialType: data.credentialType,
        signed: !!signature,
      },
    });

    // If not signed immediately, enqueue for async signing
    if (!signature) {
      await enqueueCredentialSigning(credential.id);
    }

    return credential;
  }

  // ---------------------------------------------------------------------------
  // Credential signing (for async queue or manual trigger)
  // ---------------------------------------------------------------------------

  async signPendingCredential(credentialId: string) {
    const credential = await this.prisma.credential.findUnique({
      where: { id: credentialId },
      include: { institution: true },
    });

    if (!credential) {
      throw new AppError(404, 'Credential not found');
    }

    if (credential.signature) {
      return credential; // Already signed
    }

    if (!credential.credentialHash) {
      throw new AppError(400, 'Credential has no hash to sign');
    }

    const privateKey = await this.getPrivateKey(credential.institutionId);
    if (!privateKey) {
      throw new AppError(500, 'Institution private key not available');
    }

    const signature = signCredential(credential.credentialHash, privateKey);
    const signedAt = new Date();
    const activeKey = await this.prisma.institutionKey.findFirst({
      where: { institutionId: credential.institutionId, status: 'active' },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    const keyId = activeKey?.id ?? null;

    const updated = await this.prisma.credential.update({
      where: { id: credentialId },
      data: { signature, signedAt, keyId },
    });

    await this.auditLog.log({
      actorId: credential.institutionId,
      actorRole: 'system',
      action: 'credential_signed',
      entityType: 'credential',
      entityId: credentialId,
      metadata: { keyId },
    });

    return updated;
  }

  // ---------------------------------------------------------------------------
  // Credential verification (public)
  // ---------------------------------------------------------------------------

  async verifyCredential(credentialId: string): Promise<CredentialVerificationResult> {
    // Check Redis cache first (10-min TTL for verified results)
    const cacheKey = `verify:credential:${credentialId}`;
    const cached = await cacheGet<CredentialVerificationResult>(cacheKey);
    if (cached) return cached;

    const credential = await this.prisma.credential.findUnique({
      where: { id: credentialId },
      include: {
        institution: { select: { id: true, name: true, domain: true, publicKey: true } },
      },
    });

    if (!credential) {
      return { verified: false, reason: 'Credential not found' };
    }

    if (credential.status === 'revoked') {
      return {
        verified: false,
        reason: 'Credential has been revoked',
        credential: {
          id: credential.id,
          title: credential.title,
          credentialType: credential.credentialType,
          issuedDate: credential.issuedDate,
          status: credential.status,
        },
        institution: {
          id: credential.institution.id,
          name: credential.institution.name,
          domain: credential.institution.domain,
        },
      };
    }

    if (!credential.credentialHash || !credential.signature) {
      return { verified: false, reason: 'Credential is not yet signed' };
    }

    // Look up the public key that was used to sign this credential via keyId.
    // This ensures credentials signed with old keys remain verifiable after rotation.
    let verificationKey: string | null = null;
    if (credential.keyId) {
      const keyVersion = await this.prisma.institutionKey.findFirst({
          where: { id: credential.keyId }
        });
        verificationKey = keyVersion?.publicKey ?? null;
    }

    // Fall back to the institution's current public key if no keyVersion match
    if (!verificationKey) {
      verificationKey = credential.institution.publicKey;
    }

    if (!verificationKey) {
      return { verified: false, reason: 'Institution public key not available' };
    }

    // Recompute the hash from the stored credential data
    const recomputedPayload = {
      studentId: credential.studentId,
      institutionId: credential.institutionId,
      credentialType: credential.credentialType,
      title: credential.title,
      description: credential.description ?? '',
      issuedDate: credential.issuedDate.toISOString().split('T')[0],
    };

    const recomputedHash = generateCredentialHash(recomputedPayload);

    if (recomputedHash !== credential.credentialHash) {
      return { verified: false, reason: 'Credential data has been tampered with' };
    }

    const signatureValid = verifyCredentialSignature(
      credential.credentialHash,
      credential.signature,
      verificationKey,
    );

    const result: CredentialVerificationResult = {
      verified: signatureValid,
      reason: signatureValid ? undefined : 'Signature verification failed',
      credential: {
        id: credential.id,
        title: credential.title,
        credentialType: credential.credentialType,
        issuedDate: credential.issuedDate,
        status: credential.status,
      },
      institution: {
        id: credential.institution.id,
        name: credential.institution.name,
        domain: credential.institution.domain,
      },
    };

    // Cache verified results for 10 minutes (don't cache failures due to signing)
    if (signatureValid) {
      await cacheSet(cacheKey, result, 600);
    }

    return result;
  }

  // ---------------------------------------------------------------------------
  // Credential revocation
  // ---------------------------------------------------------------------------

  async revokeCredential(
    adminUserId: string,
    adminRole: string,
    credentialId: string,
    reason?: string,
  ) {
    const institution = await this.findAdminInstitution(adminUserId);

    const credential = await this.prisma.credential.findUnique({
      where: { id: credentialId },
    });

    if (!credential) {
      throw new AppError(404, 'Credential not found');
    }

    if (credential.institutionId !== institution.id) {
      throw new AppError(403, 'Credential does not belong to your institution');
    }

    if (credential.status === 'revoked') {
      throw new AppError(400, 'Credential is already revoked');
    }

    const updated = await this.prisma.credential.update({
      where: { id: credentialId },
      data: { status: 'revoked' as PrismaCredentialStatus },
      include: {
        student: { select: { id: true, fullName: true } },
        institution: { select: { id: true, name: true } },
      },
    });

    // Invalidate cached verification result
    await cacheDelete(`verify:credential:${credentialId}`);

    await this.auditLog.log({
      actorId: adminUserId,
      actorRole: adminRole,
      action: 'credential_revoked',
      entityType: 'credential',
      entityId: credentialId,
      metadata: { reason },
    });

    return updated;
  }

  // ---------------------------------------------------------------------------
  // Student credential queries
  // ---------------------------------------------------------------------------

  async getStudentCredentials(studentId: string, page = 1, limit = 20) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const [credentials, total] = await Promise.all([
      this.prisma.credential.findMany({
        where: { studentId },
        include: {
          institution: { select: { id: true, name: true, domain: true } },
        },
        orderBy: { issuedDate: 'desc' },
        skip,
        take,
      }),
      this.prisma.credential.count({ where: { studentId } }),
    ]);

    return { credentials, total, page, limit: take };
  }

  async getCredentialById(credentialId: string) {
    const credential = await this.prisma.credential.findUnique({
      where: { id: credentialId },
      include: {
        student: { select: { id: true, fullName: true } },
        institution: { select: { id: true, name: true, domain: true } },
      },
    });

    if (!credential) {
      throw new AppError(404, 'Credential not found');
    }

    return credential;
  }

  async getInstitutionCredentials(institutionId: string, page = 1, limit = 20) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const [credentials, total] = await Promise.all([
      this.prisma.credential.findMany({
        where: { institutionId },
        include: {
          student: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.credential.count({ where: { institutionId } }),
    ]);

    return { credentials, total, page, limit: take };
  }

  async getCurrentInstitutionCredentials(
    requesterUserId: string,
    page = 1,
    limit = 20,
  ) {
    const institution = await this.findAdminInstitution(requesterUserId);
    return this.getInstitutionCredentials(institution.id, page, limit);
  }

  async getInstitutionCredentialsScoped(
    requesterUserId: string,
    requesterRole: string,
    institutionId: string,
    page = 1,
    limit = 20,
  ) {
    await this.assertInstitutionAccess(requesterUserId, requesterRole, institutionId);
    return this.getInstitutionCredentials(institutionId, page, limit);
  }

  // ---------------------------------------------------------------------------
  // Certificate URL attachment
  // ---------------------------------------------------------------------------

  async attachCertificateUrl(
    adminUserId: string,
    credentialId: string,
    certificateUrl: string,
  ) {
    const institution = await this.findAdminInstitution(adminUserId);

    const credential = await this.prisma.credential.findUnique({
      where: { id: credentialId },
    });

    if (!credential) {
      throw new AppError(404, 'Credential not found');
    }

    if (credential.institutionId !== institution.id) {
      throw new AppError(403, 'Credential does not belong to your institution');
    }

    return this.prisma.credential.update({
      where: { id: credentialId },
      data: { certificateUrl },
    });
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private async findAdminInstitution(adminUserId: string) {
    // Find the institution this admin is associated with.
    // Convention: the admin user's student profile links to the institution,
    // OR we look up directly by a separate institution_admin mapping.
    // For now, find institution where the admin registered a verification
    // that was approved, or fall back to platform_admin having access to all.
    const user = await this.prisma.user.findUnique({ where: { id: adminUserId } });
    if (!user) {
      throw new AppError(401, 'User not found');
    }

    if (user.role === 'platform_admin') {
      // Platform admins need to specify institution; handled in controller
      throw new AppError(400, 'Platform admin must specify institution context');
    }

    // For institution_admin, find the institution they belong to.
    // We'll look for an institution whose domain matches the admin's email domain.
    const emailDomain = user.email.split('@')[1];
    const institution = await this.prisma.institution.findUnique({
      where: { domain: emailDomain },
    });

    if (!institution) {
      throw new AppError(403, 'No institution found for your account');
    }

    return institution;
  }

  /**
   * Retrieve the private key for an institution.
   * Uses encrypted database storage with AES-256-GCM.
   */
  private async getPrivateKey(institutionId: string): Promise<string | null> {
    return this.keyStore.getPrivateKey(institutionId);
  }

  /**
   * Rotate an institution's key pair. Existing credentials remain valid
   * with the old signature; new credentials use the new key.
   */
  async rotateKeys(institutionId: string, actorId: string, actorRole: string) {
    await this.assertInstitutionAccess(actorId, actorRole, institutionId);
    const institution = await this.prisma.institution.findUnique({ where: { id: institutionId } });
    if (!institution) throw new AppError(404, 'Institution not found');
    if (!institution.publicKey) throw new AppError(400, 'Institution has no existing key pair to rotate');

    const { publicKey, privateKey } = generateInstitutionKeyPair();
    await this.keyStore.rotateKey(institutionId, privateKey, publicKey);

    // Deactivate current key version and create new one
    const latestVersion = await this.prisma.institutionKey.findFirst({
        where: { institutionId, status: 'active' },
        orderBy: { createdAt: 'desc' },
      });

      await this.prisma.$transaction([
        ...(latestVersion
          ? [this.prisma.institutionKey.update({
              where: { id: latestVersion.id },
              data: { status: 'revoked', revokedAt: new Date() },
            })]
          : []),
        this.prisma.institutionKey.create({
          data: {
            institutionId,
            publicKey: publicKey,
            status: 'active'
          },
        }),
      ]);

      await this.auditLog.log({
        actorId, actorRole, action: 'institution_keys_rotated',
        entityType: 'institution',
        entityId: institutionId,
        metadata: { publicKeyFingerprint: publicKey.slice(0, 64) },
      });

    return { publicKey };
  }

  // ---------------------------------------------------------------------------
  // Public key accessor (for JWT-VC signing in controllers)
  // ---------------------------------------------------------------------------

  async getInstitutionPrivateKey(institutionId: string): Promise<string | null> {
    return this.getPrivateKey(institutionId);
  }

  // ---------------------------------------------------------------------------
  // Offline verification payload
  // ---------------------------------------------------------------------------

  async buildOfflinePayload(credentialId: string, baseUrl: string): Promise<OfflineVerificationPayload> {
    const credential = await this.prisma.credential.findUnique({
      where: { id: credentialId },
      include: {
        student: { include: { user: true } },
        institution: true,
      },
    });

    if (!credential) throw new AppError(404, 'Credential not found');
    if (!credential.signature) throw new AppError(400, 'Credential must be signed for offline verification');
    if (!credential.institution.publicKey) throw new AppError(400, 'Institution has no public key');

    const vc = buildVerifiableCredential({
      credentialId: credential.id,
      baseUrl,
      issuer: credential.institution,
      student: { id: credential.studentId, fullName: credential.student.fullName },
      credential: {
        credentialType: credential.credentialType,
        title: credential.title,
        description: credential.description,
        issuedDate: credential.issuedDate,
        status: credential.status,
        credentialHash: credential.credentialHash,
        signature: credential.signature,
        signedAt: credential.signedAt,
        keyId: credential.keyId,
      },
    });

    return buildOfflineVerificationPayload({
      vc,
      issuerPublicKey: credential.institution.publicKey,
      revoked: credential.status === 'revoked',
    });
  }

  // ---------------------------------------------------------------------------
  // Key registry â€“ public keys of all participating institutions
  // ---------------------------------------------------------------------------

  async getKeyRegistry(): Promise<InstitutionKeyRegistryEntry[]> {
    const institutions = await this.prisma.institution.findMany({
      where: { publicKey: { not: null } },
      select: {
        id: true,
        name: true,
        domain: true,
        publicKey: true,
        createdAt: true,
      },
    });

    return institutions
      .filter((i): i is typeof i & { publicKey: string } => i.publicKey !== null)
      .map((inst) => ({
        institutionId: inst.id,
        institutionName: inst.name,
        publicKey: inst.publicKey,
        keyFingerprint: generateKeyFingerprint(inst.publicKey),
        algorithm: 'RS256',
        createdAt: inst.createdAt.toISOString(),
        status: 'active' as const,
      }));
  }
}

