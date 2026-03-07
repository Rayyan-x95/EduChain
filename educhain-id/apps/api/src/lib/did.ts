import crypto from 'crypto';
import type { DIDDocument, DIDVerificationMethod, DIDService, JsonWebKey } from '@educhain/types';

/**
 * Convert an RSA PEM public key to JWK format for DID documents.
 */
export function pemToJwk(publicKeyPem: string): JsonWebKey {
  const keyObject = crypto.createPublicKey(publicKeyPem);
  const jwk = keyObject.export({ format: 'jwk' });
  return {
    kty: jwk.kty as string,
    n: jwk.n as string,
    e: jwk.e as string,
    alg: 'RS256',
    use: 'sig',
  };
}

/**
 * Generate a did:key identifier from a public key PEM.
 * Uses the multicodec prefix for RSA (0x1205) with multibase base58btc encoding.
 * Simplified: we use SHA-256 fingerprint as the key identifier.
 */
export function generateDIDKey(publicKeyPem: string): string {
  const fingerprint = crypto
    .createHash('sha256')
    .update(publicKeyPem)
    .digest('base64url');
  return `did:key:z${fingerprint}`;
}

/**
 * Generate a did:web identifier from a hostname and path segments.
 * did:web encodes colons in host as %3A and uses : as path separator.
 */
export function generateDIDWeb(host: string, ...pathSegments: string[]): string {
  const encodedHost = host.replace(/:/g, '%3A');
  if (pathSegments.length === 0) return `did:web:${encodedHost}`;
  return `did:web:${encodedHost}:${pathSegments.join(':')}`;
}

/**
 * Build a complete W3C DID Document for a user or institution.
 */
export function buildDIDDocument(opts: {
  did: string;
  publicKeyPem?: string | null;
  serviceEndpoints?: Array<{ id: string; type: string; endpoint: string }>;
}): DIDDocument {
  const { did, publicKeyPem, serviceEndpoints } = opts;

  const verificationMethod: DIDVerificationMethod[] = [];
  const authentication: string[] = [];
  const assertionMethod: string[] = [];

  if (publicKeyPem) {
    const keyId = `${did}#key-1`;
    verificationMethod.push({
      id: keyId,
      type: 'JsonWebKey2020',
      controller: did,
      publicKeyJwk: pemToJwk(publicKeyPem),
    });
    authentication.push(keyId);
    assertionMethod.push(keyId);
  }

  const service: DIDService[] | undefined = serviceEndpoints?.map((s) => ({
    id: `${did}#${s.id}`,
    type: s.type,
    serviceEndpoint: s.endpoint,
  }));

  return {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/jws-2020/v1',
    ],
    id: did,
    controller: did,
    verificationMethod,
    authentication,
    assertionMethod,
    ...(service && service.length > 0 ? { service } : {}),
  };
}

/**
 * Build a .well-known/did.json document for the platform itself.
 * This is the root DID for the EduChain platform.
 */
export function buildPlatformDIDDocument(baseUrl: string): DIDDocument {
  const host = new URL(baseUrl).host.replace(/:/g, '%3A');
  const did = `did:web:${host}`;

  return {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/jws-2020/v1',
    ],
    id: did,
    controller: did,
    verificationMethod: [],
    authentication: [],
    assertionMethod: [],
    service: [
      {
        id: `${did}#credential-api`,
        type: 'CredentialService',
        serviceEndpoint: `${baseUrl}/api/v1/credentials`,
      },
      {
        id: `${did}#identity-api`,
        type: 'IdentityService',
        serviceEndpoint: `${baseUrl}/api/v1/identity`,
      },
      {
        id: `${did}#verification-api`,
        type: 'VerificationService',
        serviceEndpoint: `${baseUrl}/api/v1/verify`,
      },
      {
        id: `${did}#key-registry`,
        type: 'KeyRegistry',
        serviceEndpoint: `${baseUrl}/api/v1/credentials/key-registry`,
      },
    ],
  };
}
