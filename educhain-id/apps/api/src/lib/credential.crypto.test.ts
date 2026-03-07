import {
  generateInstitutionKeyPair,
  generateCredentialHash,
  generateKeyFingerprint,
  signCredential,
  verifyCredentialSignature,
} from './credential.crypto';

describe('credential.crypto', () => {
  // -----------------------------------------------------------------------
  // Key pair generation
  // -----------------------------------------------------------------------
  describe('generateInstitutionKeyPair', () => {
    it('should return PEM-encoded RSA public and private keys', () => {
      const { publicKey, privateKey } = generateInstitutionKeyPair();

      expect(publicKey).toContain('-----BEGIN PUBLIC KEY-----');
      expect(publicKey).toContain('-----END PUBLIC KEY-----');
      expect(privateKey).toContain('-----BEGIN PRIVATE KEY-----');
      expect(privateKey).toContain('-----END PRIVATE KEY-----');
    });

    it('should produce unique key pairs on each call', () => {
      const kp1 = generateInstitutionKeyPair();
      const kp2 = generateInstitutionKeyPair();

      expect(kp1.publicKey).not.toBe(kp2.publicKey);
      expect(kp1.privateKey).not.toBe(kp2.privateKey);
    });
  });

  // -----------------------------------------------------------------------
  // Credential hashing
  // -----------------------------------------------------------------------
  describe('generateCredentialHash', () => {
    const payload = {
      studentId: 'student-1',
      institutionId: 'inst-1',
      credentialType: 'degree',
      title: 'BSc Computer Science',
      description: '',
      issuedDate: '2024-06-15',
    };

    it('should return a hex-encoded SHA-256 hash', () => {
      const hash = generateCredentialHash(payload);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should produce deterministic hashes for same input', () => {
      const h1 = generateCredentialHash(payload);
      const h2 = generateCredentialHash(payload);
      expect(h1).toBe(h2);
    });

    it('should produce the same hash regardless of key order', () => {
      const reversed = {
        issuedDate: '2024-06-15',
        title: 'BSc Computer Science',
        studentId: 'student-1',
        description: '',
        credentialType: 'degree',
        institutionId: 'inst-1',
      };

      expect(generateCredentialHash(payload)).toBe(
        generateCredentialHash(reversed),
      );
    });

    it('should produce different hashes for different payloads', () => {
      const h1 = generateCredentialHash(payload);
      const h2 = generateCredentialHash({ ...payload, title: 'BA History' });
      expect(h1).not.toBe(h2);
    });

    it('should produce deterministic hashes for nested objects regardless of key order', () => {
      const nested1 = {
        student: { name: 'Alice', id: '1' },
        metadata: { version: 2, tags: ['a', 'b'] },
      };
      const nested2 = {
        metadata: { tags: ['a', 'b'], version: 2 },
        student: { id: '1', name: 'Alice' },
      };
      expect(generateCredentialHash(nested1)).toBe(generateCredentialHash(nested2));
    });

    it('should handle deeply nested objects canonically', () => {
      const deep1 = { a: { b: { c: 1, d: 2 } } };
      const deep2 = { a: { b: { d: 2, c: 1 } } };
      expect(generateCredentialHash(deep1)).toBe(generateCredentialHash(deep2));
    });
  });

  // -----------------------------------------------------------------------
  // Key fingerprint
  // -----------------------------------------------------------------------
  describe('generateKeyFingerprint', () => {
    it('should return a 16-char hex fingerprint', () => {
      const { publicKey } = generateInstitutionKeyPair();
      const fp = generateKeyFingerprint(publicKey);
      expect(fp).toMatch(/^[0-9a-f]{16}$/);
    });

    it('should produce consistent fingerprints for the same key', () => {
      const { publicKey } = generateInstitutionKeyPair();
      expect(generateKeyFingerprint(publicKey)).toBe(generateKeyFingerprint(publicKey));
    });

    it('should produce different fingerprints for different keys', () => {
      const kp1 = generateInstitutionKeyPair();
      const kp2 = generateInstitutionKeyPair();
      expect(generateKeyFingerprint(kp1.publicKey)).not.toBe(generateKeyFingerprint(kp2.publicKey));
    });
  });

  // -----------------------------------------------------------------------
  // Signing & verification round-trip
  // -----------------------------------------------------------------------
  describe('signCredential / verifyCredentialSignature', () => {
    const { publicKey, privateKey } = generateInstitutionKeyPair();
    const hash = generateCredentialHash({ test: 'data' });

    it('should produce a non-empty base64 signature', () => {
      const sig = signCredential(hash, privateKey);
      expect(sig.length).toBeGreaterThan(0);
      // base64 characters only
      expect(sig).toMatch(/^[A-Za-z0-9+/=]+$/);
    });

    it('should verify a valid signature', () => {
      const sig = signCredential(hash, privateKey);
      const valid = verifyCredentialSignature(hash, sig, publicKey);
      expect(valid).toBe(true);
    });

    it('should reject a tampered hash', () => {
      const sig = signCredential(hash, privateKey);
      const valid = verifyCredentialSignature('tampered-hash', sig, publicKey);
      expect(valid).toBe(false);
    });

    it('should reject a tampered signature', () => {
      const valid = verifyCredentialSignature(hash, 'badsig', publicKey);
      expect(valid).toBe(false);
    });

    it('should reject verification with the wrong public key', () => {
      const otherKp = generateInstitutionKeyPair();
      const sig = signCredential(hash, privateKey);
      const valid = verifyCredentialSignature(hash, sig, otherKp.publicKey);
      expect(valid).toBe(false);
    });
  });
});
