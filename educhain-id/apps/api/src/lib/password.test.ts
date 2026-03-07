import { hashPassword, verifyPassword } from './password';

describe('Password utilities', () => {
  const testPassword = 'SecureP@ss1';

  it('should hash a password', async () => {
    const hash = await hashPassword(testPassword);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(testPassword);
    expect(hash.startsWith('$argon2')).toBe(true);
  });

  it('should verify a correct password', async () => {
    const hash = await hashPassword(testPassword);
    const isValid = await verifyPassword(hash, testPassword);
    expect(isValid).toBe(true);
  });

  it('should reject an incorrect password', async () => {
    const hash = await hashPassword(testPassword);
    const isValid = await verifyPassword(hash, 'WrongPassword1!');
    expect(isValid).toBe(false);
  });

  it('should produce different hashes for the same password', async () => {
    const hash1 = await hashPassword(testPassword);
    const hash2 = await hashPassword(testPassword);
    expect(hash1).not.toBe(hash2);
  });
});
