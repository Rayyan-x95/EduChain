import crypto from 'crypto';
import type {
  VerifiableCredential,
  OfflineVerificationPayload,
} from '@educhain/types';
import { generateDIDWeb } from './did';

/**
 * Build a W3C Verifiable Credential in JSON-LD format from an EduChain credential.
 */
export function buildVerifiableCredential(opts: {
  credentialId: string;
  baseUrl: string;
  issuer: { id: string; name: string; domain: string; publicKey?: string | null };
  student: { id: string; fullName?: string | null };
  credential: {
    credentialType: string;
    title: string;
    description?: string | null;
    issuedDate: Date;
    status: string;
    credentialHash?: string | null;
    signature?: string | null;
    signedAt?: Date | null;
    keyId?: string | null;
    expirationDate?: Date | null;
  };
}): VerifiableCredential {
  const { credentialId, baseUrl, issuer, student, credential: cred } = opts;
  const host = new URL(baseUrl).host;

  const issuerDid = generateDIDWeb(host, 'institutions', issuer.id);
  const subjectDid = generateDIDWeb(host, 'users', student.id);

  const vc: VerifiableCredential = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://www.w3.org/2018/credentials/examples/v1',
      'https://w3id.org/security/suites/jws-2020/v1',
      'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.2.json',
    ],
    id: `${baseUrl}/api/v1/credentials/${credentialId}/export-vc`,
    type: ['VerifiableCredential', 'AcademicCredential', 'OpenBadgeCredential'],
    issuer: {
      id: issuerDid,
      name: issuer.name,
      url: `https://${issuer.domain}`,
    },
    issuanceDate: cred.issuedDate.toISOString(),
    credentialSubject: {
      id: subjectDid,
      name: student.fullName ?? undefined,
      achievement: {
        type: cred.credentialType,
        name: cred.title,
        description: cred.description ?? undefined,
      },
    },
    credentialStatus: {
      id: `${baseUrl}/api/v1/credentials/verify/${credentialId}`,
      type: 'RevocationList2020Status',
    },
    credentialSchema: {
      id: 'https://purl.imsglobal.org/spec/ob/v3p0/schema/json/ob_v3p0_achievementcredential_schema.json',
      type: 'JsonSchema',
    },
  };

  // W3C VC expirationDate — default 5 years from issuance if not specified
  if (cred.expirationDate) {
    vc.expirationDate = cred.expirationDate.toISOString();
  } else {
    const defaultExpiry = new Date(cred.issuedDate);
    defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 5);
    vc.expirationDate = defaultExpiry.toISOString();
  }

  // Evidence: link back to the platform verification endpoint
  vc.evidence = [{
    id: `${baseUrl}/api/v1/credentials/verify/${credentialId}`,
    type: ['Evidence'],
    verifier: issuerDid,
    evidenceDocument: 'EduChain Credential Verification',
    subjectPresence: 'digital',
  }];

  // Add cryptographic proof if credential is signed
  if (cred.signature && cred.signedAt) {
    vc.proof = {
      type: 'RsaSignature2018',
      created: cred.signedAt.toISOString(),
      proofPurpose: 'assertionMethod',
      verificationMethod: `${issuerDid}#key-1`,
      signatureValue: cred.signature,
    };
  }

  return vc;
}

/**
 * Build a JWT-encoded Verifiable Credential (JWT-VC).
 * Self-contained: can be verified by any party with the issuer's public key.
 */
export function buildJWTVC(opts: {
  credentialId: string;
  baseUrl: string;
  issuer: { id: string; name: string; domain: string; publicKey?: string | null };
  student: { id: string; fullName?: string | null };
  credential: {
    credentialType: string;
    title: string;
    description?: string | null;
    issuedDate: Date;
    status: string;
    credentialHash?: string | null;
    keyId?: string | null;
    expirationDate?: Date | null;
  };
  privateKey: string;
}): string {
  const { credentialId, baseUrl, issuer, student, credential: cred, privateKey } = opts;
  const host = new URL(baseUrl).host;
  const issuerDid = generateDIDWeb(host, 'institutions', issuer.id);
  const subjectDid = generateDIDWeb(host, 'users', student.id);

  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: `${issuerDid}#key-1`,
  };

  const now = Math.floor(Date.now() / 1000);

  // Default expiry: 5 years from issuance
  const expDate = cred.expirationDate ?? new Date(new Date(cred.issuedDate).setFullYear(cred.issuedDate.getFullYear() + 5));
  const exp = Math.floor(new Date(expDate).getTime() / 1000);

  const payload = {
    iss: issuerDid,
    sub: subjectDid,
    iat: now,
    exp,
    jti: `urn:uuid:${credentialId}`,
    vc: {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1',
        'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.2.json',
      ],
      id: `${baseUrl}/api/v1/credentials/${credentialId}/export-vc`,
      type: ['VerifiableCredential', 'AcademicCredential', 'OpenBadgeCredential'],
      issuer: { id: issuerDid, name: issuer.name },
      issuanceDate: cred.issuedDate.toISOString(),
      expirationDate: new Date(expDate).toISOString(),
      credentialSubject: {
        id: subjectDid,
        name: student.fullName ?? undefined,
        achievement: {
          type: cred.credentialType,
          name: cred.title,
          description: cred.description ?? undefined,
        },
      },
      credentialStatus: {
        id: `${baseUrl}/api/v1/credentials/verify/${credentialId}`,
        type: 'RevocationList2020Status',
      },
      credentialSchema: {
        id: 'https://purl.imsglobal.org/spec/ob/v3p0/schema/json/ob_v3p0_achievementcredential_schema.json',
        type: 'JsonSchema',
      },
    },
  };

  // Build JWT: base64url(header).base64url(payload).signature
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signingInput = `${headerB64}.${payloadB64}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(privateKey, 'base64url');

  return `${signingInput}.${signature}`;
}

/**
 * Build a self-contained offline verification payload.
 * Contains everything needed to verify the credential without calling any API.
 */
export function buildOfflineVerificationPayload(opts: {
  vc: VerifiableCredential;
  issuerPublicKey: string;
  revoked: boolean;
}): OfflineVerificationPayload {
  return {
    credential: opts.vc,
    issuerPublicKey: opts.issuerPublicKey,
    revocationStatus: {
      revoked: opts.revoked,
      checkedAt: new Date().toISOString(),
    },
    verificationInstructions: {
      algorithm: 'RSA-SHA256',
      hashFunction: 'SHA-256 (canonical JSON)',
      steps: [
        '1. Extract credentialSubject and issuanceDate from the credential',
        '2. Build canonical JSON of the credential payload (RFC 8785 sorted keys)',
        '3. Compute SHA-256 hash of the canonical JSON string',
        '4. Verify the proof.signatureValue against the hash using the issuerPublicKey',
        '5. Check revocationStatus.revoked === false',
        '6. Optionally resolve the issuer DID to confirm the public key matches',
      ],
    },
  };
}

/**
 * Verify a JWT-VC token using a PEM public key.
 * Returns the decoded payload if valid, null if invalid.
 */
export function verifyJWTVC(
  jwtToken: string,
  publicKeyPem: string,
): { header: Record<string, unknown>; payload: Record<string, unknown> } | null {
  const parts = jwtToken.split('.');
  if (parts.length !== 3) return null;

  const signingInput = `${parts[0]}.${parts[1]}`;
  const signature = parts[2];

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(signingInput);
  verifier.end();

  const valid = verifier.verify(publicKeyPem, signature, 'base64url');
  if (!valid) return null;

  try {
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return { header, payload };
  } catch {
    return null;
  }
}
