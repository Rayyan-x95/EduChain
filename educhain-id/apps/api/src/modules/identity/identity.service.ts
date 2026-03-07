import { PrismaClient, IdentityVisibility as PrismaVisibility } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import crypto from 'crypto';
import { buildDIDDocument, generateDIDWeb } from '../../lib/did';
import type { DIDDocument } from '@educhain/types';

export class IdentityService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Set (or update) the unique username for the authenticated user.
   * Generates a URL-safe slug from the username.
   */
  async setUsername(userId: string, username: string) {
    const slug = username.toLowerCase().replace(/[^a-z0-9_-]/g, '');

    const conflict = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { publicIdentitySlug: slug }],
        NOT: { id: userId },
      },
    });

    if (conflict) {
      throw new AppError(409, 'Username is already taken');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { username, publicIdentitySlug: slug },
      select: { id: true, username: true, publicIdentitySlug: true },
    });
  }

  /**
   * Update the identity visibility preference.
   */
  async updateVisibility(userId: string, visibility: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { identityVisibility: visibility as PrismaVisibility },
      select: { id: true, identityVisibility: true },
    });
  }

  /**
   * Resolve a public identity profile by slug. Only returns data when
   * the user's identity visibility is "public".
   */
  async getPublicProfile(slug: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicIdentitySlug: slug },
      include: {
        student: {
          include: {
            institution: { select: { name: true } },
            skills: { include: { skill: { select: { name: true } } } },
            receivedEndorsements: true,
            credentials: {
              where: { status: 'active', signature: { not: null } },
              select: { id: true },
            },
          },
        },
        outgoingRelationships: true,
        incomingRelationships: true,
      },
    });

    if (!user || !user.student) {
      throw new AppError(404, 'Identity not found');
    }

    if (user.identityVisibility !== 'public') {
      throw new AppError(403, 'This identity is not public');
    }

    const s = user.student;

    return {
      userId: user.id,
      username: user.username,
      slug: user.publicIdentitySlug,
      fullName: s.fullName,
      bio: s.bio,
      institution: s.institution?.name ?? null,
      degree: s.degree,
      graduationYear: s.graduationYear,
      skills: s.skills.map((ss) => ss.skill.name),
      verifiedCredentialCount: s.credentials.length,
      endorsementCount: s.receivedEndorsements.length,
      relationshipCount:
        user.outgoingRelationships.length + user.incomingRelationships.length,
    };
  }

  // ---------------------------------------------------------------------------
  // DID Document (did:web method)
  // ---------------------------------------------------------------------------

  /**
   * Generate a DID Document for a public identity.
   * Uses the did:web method which resolves via HTTPS.
   * Exposes real institution verification keys from the database.
   * Reference: https://w3c-ccg.github.io/did-method-web/
   */
  async getDIDDocument(slug: string, baseUrl: string): Promise<DIDDocument> {
    const user = await this.prisma.user.findUnique({
      where: { publicIdentitySlug: slug },
      include: {
        student: {
          include: {
            institution: { select: { id: true, name: true, publicKey: true } },
          },
        },
      },
    });

    if (!user || !user.student) {
      throw new AppError(404, 'Identity not found');
    }

    if (user.identityVisibility !== 'public') {
      throw new AppError(403, 'This identity is not public');
    }

    const host = new URL(baseUrl).host;
    const did = generateDIDWeb(host, 'users', slug);

    return buildDIDDocument({
      did,
      publicKeyPem: user.student.institution?.publicKey ?? null,
      serviceEndpoints: [
        { id: 'educhain-profile', type: 'LinkedDomains', endpoint: `${baseUrl}/api/v1/identity/${slug}` },
        { id: 'credential-verification', type: 'CredentialVerification', endpoint: `${baseUrl}/api/v1/verify` },
        { id: 'credential-export', type: 'CredentialExport', endpoint: `${baseUrl}/api/v1/credentials` },
      ],
    });
  }

  /**
   * Generate a DID Document for an institution.
   * Exposes the institution's real RSA public key for credential verification.
   */
  async getInstitutionDIDDocument(institutionId: string, baseUrl: string): Promise<DIDDocument> {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
      select: { id: true, name: true, domain: true, publicKey: true },
    });

    if (!institution) {
      throw new AppError(404, 'Institution not found');
    }

    const host = new URL(baseUrl).host;
    const did = generateDIDWeb(host, 'institutions', institution.id);

    return buildDIDDocument({
      did,
      publicKeyPem: institution.publicKey,
      serviceEndpoints: [
        { id: 'credential-issuer', type: 'CredentialIssuer', endpoint: `${baseUrl}/api/v1/credentials/issue` },
        { id: 'key-registry', type: 'KeyRegistry', endpoint: `${baseUrl}/api/v1/credentials/key-registry` },
      ],
    });
  }

  // ---------------------------------------------------------------------------
  // Credential sharing link
  // ---------------------------------------------------------------------------

  /**
   * Generate a time-limited sharing token for a credential.
   * The token encodes credentialId + expiry and is HMAC-signed.
   */
  generateShareToken(credentialId: string, expiresInHours = 168): string {
    const expiresAt = Date.now() + expiresInHours * 60 * 60 * 1000;
    const data = `${credentialId}.${expiresAt}`;
    const secret = process.env.JWT_SECRET ?? '';
    const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
    return `${Buffer.from(data).toString('base64url')}.${sig}`;
  }

  /**
   * Verify and decode a sharing token.
   * Returns the credentialId if valid, throws otherwise.
   */
  verifyShareToken(token: string): string {
    const parts = token.split('.');
    if (parts.length !== 2) {
      throw new AppError(400, 'Invalid share token format');
    }

    const data = Buffer.from(parts[0], 'base64url').toString();
    const sig = parts[1];

    const secret = process.env.JWT_SECRET ?? '';
    const expectedSig = crypto.createHmac('sha256', secret).update(data).digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      throw new AppError(403, 'Invalid share token signature');
    }

    const [credentialId, expiresAtStr] = data.split('.');
    const expiresAt = parseInt(expiresAtStr, 10);

    if (Date.now() > expiresAt) {
      throw new AppError(410, 'Share link has expired');
    }

    return credentialId;
  }

  // ---------------------------------------------------------------------------
  // Embeddable badge
  // ---------------------------------------------------------------------------

  /**
   * Generate an SVG badge showing credential verification status.
   */
  async generateBadgeSVG(credentialId: string): Promise<string> {
    const credential = await this.prisma.credential.findUnique({
      where: { id: credentialId },
      include: {
        institution: { select: { name: true } },
        student: { select: { fullName: true } },
      },
    });

    if (!credential) {
      throw new AppError(404, 'Credential not found');
    }

    const verified = credential.status === 'active' && !!credential.signature;
    const statusText = verified ? 'Verified' : 'Unverified';
    const statusColor = verified ? '#22c55e' : '#ef4444';
    const titleText = this.escapeXml(credential.title);
    const instText = this.escapeXml(credential.institution?.name ?? 'Unknown');

    // Calculate widths based on text
    const leftWidth = Math.max(instText.length * 7 + 20, 80);
    const rightWidth = Math.max(statusText.length * 7 + 20, 80);
    const totalWidth = leftWidth + rightWidth;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${titleText}: ${statusText}">
  <title>${titleText} — ${instText}: ${statusText}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${leftWidth}" height="20" fill="#555"/>
    <rect x="${leftWidth}" width="${rightWidth}" height="20" fill="${statusColor}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text aria-hidden="true" x="${leftWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${instText}</text>
    <text x="${leftWidth / 2}" y="14">${instText}</text>
    <text aria-hidden="true" x="${leftWidth + rightWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${statusText}</text>
    <text x="${leftWidth + rightWidth / 2}" y="14">${statusText}</text>
  </g>
</svg>`;
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
