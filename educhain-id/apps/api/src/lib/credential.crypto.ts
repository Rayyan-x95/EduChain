import crypto from 'crypto';

/**
 * Generate an RSA-2048 key pair for an institution.
 * Returns PEM-encoded public and private keys.
 */
export function generateInstitutionKeyPair(): {
  publicKey: string;
  privateKey: string;
} {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  return { publicKey, privateKey };
}

/**
 * Canonical JSON serializer: recursively sorts all keys at every level
 * for deterministic hashing of nested objects (RFC 8785 compatible approach).
 */
function canonicalize(obj: unknown): string {
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj === 'boolean' || typeof obj === 'number') return JSON.stringify(obj);
  if (typeof obj === 'string') return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalize).join(',') + ']';
  }
  if (typeof obj === 'object') {
    const sorted = Object.keys(obj as Record<string, unknown>).sort();
    const pairs = sorted.map(
      (key) => JSON.stringify(key) + ':' + canonicalize((obj as Record<string, unknown>)[key]),
    );
    return '{' + pairs.join(',') + '}';
  }
  return JSON.stringify(obj);
}

/**
 * Generate a SHA-256 hash of a credential JSON payload.
 * Uses canonical JSON (RFC 8785) for deterministic hashing of nested objects.
 */
export function generateCredentialHash(payload: Record<string, unknown>): string {
  const canonical = canonicalize(payload);
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

/**
 * Generate a SHA-256 fingerprint of a public key (for key_id tracking).
 */
export function generateKeyFingerprint(publicKeyPem: string): string {
  return crypto.createHash('sha256').update(publicKeyPem).digest('hex').slice(0, 16);
}

/**
 * Sign a hash string using an RSA private key (SHA-256).
 * Returns a base64-encoded signature.
 */
export function signCredential(hash: string, privateKeyPem: string): string {
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(hash);
  signer.end();
  return signer.sign(privateKeyPem, 'base64');
}

/**
 * Verify a credential signature using the institution's public key.
 * Returns true if the signature is valid.
 */
export function verifyCredentialSignature(
  hash: string,
  signature: string,
  publicKeyPem: string,
): boolean {
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(hash);
  verifier.end();
  return verifier.verify(publicKeyPem, signature, 'base64');
}
