/**
 * Tests for the share-token generation and verification logic.
 * We test the pure crypto functions directly without a database.
 */
import crypto from 'crypto';

// We replicate the pure share-token logic from identity.service.ts
// to test it in isolation without Prisma.

function generateShareToken(credentialId: string, secret: string, expiresInHours = 168): string {
  const expiresAt = Date.now() + expiresInHours * 60 * 60 * 1000;
  const data = `${credentialId}.${expiresAt}`;
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${Buffer.from(data).toString('base64url')}.${sig}`;
}

function verifyShareToken(token: string, secret: string): { credentialId: string; expiresAt: number } {
  const parts = token.split('.');
  if (parts.length !== 2) {
    throw new Error('Invalid share token format');
  }

  const data = Buffer.from(parts[0], 'base64url').toString();
  const sig = parts[1];

  const expectedSig = crypto.createHmac('sha256', secret).update(data).digest('base64url');

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    throw new Error('Invalid share token signature');
  }

  const [credentialId, expiresAtStr] = data.split('.');
  const expiresAt = parseInt(expiresAtStr, 10);

  if (Date.now() > expiresAt) {
    throw new Error('Share link has expired');
  }

  return { credentialId, expiresAt };
}

describe('Share token crypto', () => {
  const SECRET = 'test-secret-key-for-share-tokens-abc123';
  const CREDENTIAL_ID = 'cred-uuid-12345';

  it('should generate a non-empty token string', () => {
    const token = generateShareToken(CREDENTIAL_ID, SECRET);
    expect(token.length).toBeGreaterThan(0);
    expect(token.split('.')).toHaveLength(2);
  });

  it('should verify a valid token and return the credentialId', () => {
    const token = generateShareToken(CREDENTIAL_ID, SECRET);
    const result = verifyShareToken(token, SECRET);
    expect(result.credentialId).toBe(CREDENTIAL_ID);
    expect(result.expiresAt).toBeGreaterThan(Date.now());
  });

  it('should reject a token signed with a different secret', () => {
    const token = generateShareToken(CREDENTIAL_ID, SECRET);
    expect(() => verifyShareToken(token, 'wrong-secret')).toThrow('Invalid share token signature');
  });

  it('should reject a tampered token', () => {
    const token = generateShareToken(CREDENTIAL_ID, SECRET);
    const tampered = token.slice(0, -4) + 'XXXX';
    expect(() => verifyShareToken(tampered, SECRET)).toThrow();
  });

  it('should reject an expired token', () => {
    // Generate a token that expired 1 hour ago
    const expiresAt = Date.now() - 60 * 60 * 1000;
    const data = `${CREDENTIAL_ID}.${expiresAt}`;
    const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
    const token = `${Buffer.from(data).toString('base64url')}.${sig}`;

    expect(() => verifyShareToken(token, SECRET)).toThrow('Share link has expired');
  });

  it('should handle different credential IDs correctly', () => {
    const token1 = generateShareToken('cred-aaa', SECRET);
    const token2 = generateShareToken('cred-bbb', SECRET);

    expect(token1).not.toBe(token2);
    expect(verifyShareToken(token1, SECRET).credentialId).toBe('cred-aaa');
    expect(verifyShareToken(token2, SECRET).credentialId).toBe('cred-bbb');
  });
});
