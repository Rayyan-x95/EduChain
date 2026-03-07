import { FastifyRequest, FastifyReply } from 'fastify';
import { IdentityService } from './identity.service';

export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  setUsername = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { username } = request.body as { username: string };
    const result = await this.identityService.setUsername(request.user!.userId, username);
    reply.status(200).send({ success: true, data: result });
  };

  updateVisibility = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { visibility } = request.body as { visibility: string };
    const result = await this.identityService.updateVisibility(
      request.user!.userId,
      visibility,
    );
    reply.status(200).send({ success: true, data: result });
  };

  getPublicProfile = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { slug } = request.params as { slug: string };
    const profile = await this.identityService.getPublicProfile(slug);
    reply.status(200).send({ success: true, data: profile });
  };

  // DID Document endpoint
  getDIDDocument = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { slug } = request.params as { slug: string };
    const baseUrl = `${request.protocol}://${request.hostname}`;
    const didDocument = await this.identityService.getDIDDocument(slug, baseUrl);
    reply.header('content-type', 'application/did+json');
    reply.status(200).send(didDocument);
  };

  // Institution DID Document endpoint
  getInstitutionDIDDocument = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { institutionId } = request.params as { institutionId: string };
    const baseUrl = `${request.protocol}://${request.hostname}`;
    const didDocument = await this.identityService.getInstitutionDIDDocument(institutionId, baseUrl);
    reply.header('content-type', 'application/did+json');
    reply.status(200).send(didDocument);
  };

  // Generate credential sharing link
  createShareLink = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { credentialId, expiresInHours } = request.body as {
      credentialId: string;
      expiresInHours?: number;
    };
    const token = this.identityService.generateShareToken(credentialId, expiresInHours);
    const baseUrl = `${request.protocol}://${request.hostname}`;
    reply.status(200).send({
      success: true,
      data: {
        token,
        shareUrl: `${baseUrl}/api/v1/identity/shared/${token}`,
        expiresInHours: expiresInHours ?? 168,
      },
    });
  };

  // Resolve a shared credential
  resolveShareLink = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { token } = request.params as { token: string };
    const credentialId = this.identityService.verifyShareToken(token);
    // Redirect to the credential verification endpoint
    reply.redirect(`/api/v1/credentials/${credentialId}`);
  };

  // Embeddable badge SVG
  getBadge = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { credentialId } = request.params as { credentialId: string };
    const svg = await this.identityService.generateBadgeSVG(credentialId);
    reply.header('content-type', 'image/svg+xml');
    reply.header('cache-control', 'public, max-age=300, s-maxage=300');
    reply.status(200).send(svg);
  };
}
