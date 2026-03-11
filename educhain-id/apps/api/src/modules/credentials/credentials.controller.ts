import { FastifyRequest, FastifyReply } from 'fastify';
import { CredentialsService } from './credentials.service';
import { buildVerifiableCredential, buildJWTVC, buildOfflineVerificationPayload } from '../../lib/vc';
import type { CredentialExportFormat } from '@educhain/types';
import { prisma } from '../../lib/prisma';

export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  generateKeys = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { institutionId } = request.params as { institutionId: string };
    const result = await this.credentialsService.generateKeys(
      institutionId,
      request.user!.userId,
      request.user!.role,
    );

    reply.status(201).send({
      success: true,
      data: { publicKey: result.publicKey },
      message: 'Key pair generated successfully',
    });
  };

  issue = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const credential = await this.credentialsService.issueCredential(
      request.user!.userId,
      request.user!.role,
      request.body as any,
    );

    reply.status(201).send({
      success: true,
      data: credential,
      message: 'Credential issued successfully',
    });
  };

  verify = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { credentialId } = request.params as { credentialId: string };
    const result = await this.credentialsService.verifyCredential(credentialId);

    reply.status(200).send({ success: true, data: result });
  };

  revoke = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { credentialId, reason } = request.body as { credentialId: string; reason?: string };
    const credential = await this.credentialsService.revokeCredential(
      request.user!.userId,
      request.user!.role,
      credentialId,
      reason,
    );

    reply.status(200).send({
      success: true,
      data: credential,
      message: 'Credential revoked successfully',
    });
  };

  getStudentCredentials = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { studentId } = request.params as { studentId: string };
    const { page, limit } = request.query as { page?: string; limit?: string };
    const result = await this.credentialsService.getStudentCredentials(
      studentId,
      parseInt(page ?? '1') || 1,
      parseInt(limit ?? '20') || 20,
    );

    reply.status(200).send({ success: true, data: result });
  };

  getMyCredentials = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const student = await prisma.student.findUnique({
      where: { userId: request.user!.userId }
    });
    if (!student) {
      reply.status(404).send({ success: false, error: 'Student profile not found' });
      return;
    }
    const { page, limit } = request.query as { page?: string; limit?: string };
    const result = await this.credentialsService.getStudentCredentials(
      student.id,
      parseInt(page ?? '1') || 1,
      parseInt(limit ?? '20') || 20,
    );
    reply.status(200).send({ success: true, data: result });
  };

  getById = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { credentialId } = request.params as { credentialId: string };
    const credential = await this.credentialsService.getCredentialById(credentialId);
    reply.status(200).send({ success: true, data: credential });
  };

  getInstitutionCredentials = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { institutionId } = request.params as { institutionId: string };
    const { page, limit } = request.query as { page?: string; limit?: string };
    const result = await this.credentialsService.getInstitutionCredentials(
      institutionId,
      parseInt(page ?? '1') || 1,
      parseInt(limit ?? '20') || 20,
    );

    reply.status(200).send({ success: true, data: result });
  };

  attachCertificate = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { credentialId } = request.params as { credentialId: string };
    const { certificateUrl } = request.body as { certificateUrl?: string };

    if (!certificateUrl || typeof certificateUrl !== 'string') {
      reply.status(400).send({ success: false, error: 'certificateUrl is required' });
      return;
    }

    const credential = await this.credentialsService.attachCertificateUrl(
      request.user!.userId,
      credentialId,
      certificateUrl,
    );

    reply.status(200).send({ success: true, data: credential });
  };

  signPending = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { credentialId } = request.params as { credentialId: string };
    const credential = await this.credentialsService.signPendingCredential(credentialId);

    reply.status(200).send({
      success: true,
      data: credential,
      message: 'Credential signed successfully',
    });
  };

  rotateKeys = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { institutionId } = request.params as { institutionId: string };
    const result = await this.credentialsService.rotateKeys(
      institutionId,
      request.user!.userId,
      request.user!.role,
    );

    reply.status(200).send({
      success: true,
      data: result,
      message: 'Key pair rotated successfully',
    });
  };

  exportVC = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { credentialId } = request.params as { credentialId: string };
    const { format } = request.query as { format?: string };

    const credential = await this.credentialsService.getCredentialById(credentialId);
    const baseUrl = `${request.protocol}://${request.hostname}`;

    const issuer = {
      id: credential.institution?.id ?? credential.institutionId,
      name: (credential as any).institution?.name ?? 'Unknown Institution',
      domain: (credential as any).institution?.domain ?? '',
      publicKey: (credential as any).institution?.publicKey ?? null,
    };
    const student = {
      id: credential.studentId,
      fullName: (credential as any).student?.fullName ?? null,
    };

    // Build W3C Verifiable Credential (JSON-LD)
    const vc = buildVerifiableCredential({
      credentialId,
      baseUrl,
      issuer,
      student,
      credential: {
        credentialType: credential.credentialType,
        title: credential.title,
        description: credential.description,
        issuedDate: credential.issuedDate,
        status: credential.status,
        credentialHash: credential.credentialHash,
        signature: credential.signature,
        signedAt: (credential as any).signedAt ?? null,
        keyId: (credential as any).keyId ?? null,
      },
    });

    const exportFormat = (format ?? 'json-ld') as CredentialExportFormat;

    if (exportFormat === 'jwt-vc') {
      // JWT-VC requires private key — fetch it
      const privateKey = await this.credentialsService.getInstitutionPrivateKey(credential.institutionId);
      if (!privateKey) {
        reply.status(400).send({ success: false, error: 'Institution private key not available for JWT-VC export' });
        return;
      }

      const jwt = buildJWTVC({
        credentialId,
        baseUrl,
        issuer,
        student,
        credential: {
          credentialType: credential.credentialType,
          title: credential.title,
          description: credential.description,
          issuedDate: credential.issuedDate,
          status: credential.status,
          credentialHash: credential.credentialHash,
          keyId: (credential as any).keyId ?? null,
        },
        privateKey,
      });

      reply.status(200).send({
        success: true,
        data: {
          format: 'jwt-vc',
          data: jwt,
          mimeType: 'application/jwt',
          filename: `credential-${credentialId}.jwt`,
        },
      });
      return;
    }

    // Default: JSON-LD format
    reply.status(200).send({ success: true, data: { format: 'json-ld', vc } });
  };

  /**
   * Offline verification payload — self-contained data for verifying
   * a credential without calling the EduChain API.
   */
  getOfflineVerificationPayload = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { credentialId } = request.params as { credentialId: string };
    const baseUrl = `${request.protocol}://${request.hostname}`;

    const result = await this.credentialsService.buildOfflinePayload(credentialId, baseUrl);
    reply.status(200).send({ success: true, data: result });
  };

  /**
   * Public key registry — lists all institution public keys for offline verification.
   */
  getKeyRegistry = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const registry = await this.credentialsService.getKeyRegistry();
    reply.status(200).send({ success: true, data: registry });
  };

  /**
   * Public shareable credential — returns verification result + credential summary
   * for embedding in social shares, QR codes, and portfolio links.
   */
  getShareableCredential = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { credentialId } = request.params as { credentialId: string };
    const verification = await this.credentialsService.verifyCredential(credentialId);
    const baseUrl = `${request.protocol}://${request.hostname}`;

    reply.status(200).send({
      success: true,
      data: {
        ...verification,
        shareUrl: `${baseUrl}/api/v1/credentials/share/${credentialId}`,
        verifyUrl: `${baseUrl}/api/v1/credentials/verify/${credentialId}`,
      },
    });
  };
}
