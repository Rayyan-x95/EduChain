import crypto from 'crypto';
import {
  buildVerifiableCredential,
  buildJWTVC,
  buildOfflineVerificationPayload,
  verifyJWTVC,
} from './vc';

// Generate a test RSA key pair
const { publicKey: testPublicKey, privateKey: testPrivateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const baseOpts = {
  credentialId: 'cred-001',
  baseUrl: 'https://educhain.com',
  issuer: { id: 'inst-001', name: 'Test University', domain: 'test-uni.edu', publicKey: testPublicKey },
  student: { id: 'student-001', fullName: 'Jane Doe' },
  credential: {
    credentialType: 'degree',
    title: 'BSc Computer Science',
    description: 'Bachelor of Science',
    issuedDate: new Date('2024-06-15'),
    status: 'active',
    credentialHash: 'abc123',
    signature: 'sig_base64',
    signedAt: new Date('2024-06-16'),
    keyId: 'key-1',
  },
};

describe('Verifiable Credential Library', () => {
  describe('buildVerifiableCredential', () => {
    it('builds a W3C JSON-LD Verifiable Credential', () => {
      const vc = buildVerifiableCredential(baseOpts);

      expect(vc['@context']).toContain('https://www.w3.org/2018/credentials/v1');
      expect(vc.type).toContain('VerifiableCredential');
      expect(vc.type).toContain('AcademicCredential');
      expect(vc.issuer.name).toBe('Test University');
      expect(vc.issuer.id).toMatch(/^did:web:/);
      expect(vc.credentialSubject.name).toBe('Jane Doe');
      expect(vc.credentialSubject.id).toMatch(/^did:web:/);
      expect(vc.credentialSubject.achievement!.name).toBe('BSc Computer Science');
      expect(vc.issuanceDate).toBe('2024-06-15T00:00:00.000Z');
    });

    it('includes proof when credential is signed', () => {
      const vc = buildVerifiableCredential(baseOpts);
      expect(vc.proof).toBeDefined();
      expect(vc.proof!.type).toBe('RsaSignature2018');
      expect(vc.proof!.signatureValue).toBe('sig_base64');
    });

    it('omits proof when credential is unsigned', () => {
      const unsignedOpts = {
        ...baseOpts,
        credential: {
          ...baseOpts.credential,
          signature: null,
          signedAt: null,
        },
      };
      const vc = buildVerifiableCredential(unsignedOpts);
      expect(vc.proof).toBeUndefined();
    });

    it('includes credentialStatus', () => {
      const vc = buildVerifiableCredential(baseOpts);
      expect(vc.credentialStatus).toBeDefined();
      expect(vc.credentialStatus!.type).toBe('RevocationList2020Status');
    });
  });

  describe('buildJWTVC', () => {
    it('produces a valid 3-part JWT', () => {
      const jwt = buildJWTVC({ ...baseOpts, privateKey: testPrivateKey });
      const parts = jwt.split('.');
      expect(parts).toHaveLength(3);
    });

    it('JWT header contains RS256 algorithm', () => {
      const jwt = buildJWTVC({ ...baseOpts, privateKey: testPrivateKey });
      const header = JSON.parse(Buffer.from(jwt.split('.')[0], 'base64url').toString());
      expect(header.alg).toBe('RS256');
      expect(header.typ).toBe('JWT');
    });

    it('JWT payload contains VC claims', () => {
      const jwt = buildJWTVC({ ...baseOpts, privateKey: testPrivateKey });
      const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString());
      expect(payload.iss).toMatch(/^did:web:/);
      expect(payload.sub).toMatch(/^did:web:/);
      expect(payload.jti).toContain('cred-001');
      expect(payload.vc).toBeDefined();
      expect(payload.vc.type).toContain('VerifiableCredential');
    });
  });

  describe('verifyJWTVC', () => {
    it('verifies a valid JWT-VC', () => {
      const jwt = buildJWTVC({ ...baseOpts, privateKey: testPrivateKey });
      const result = verifyJWTVC(jwt, testPublicKey);
      expect(result).not.toBeNull();
      expect(result!.payload.iss).toMatch(/^did:web:/);
    });

    it('rejects a tampered JWT-VC', () => {
      const jwt = buildJWTVC({ ...baseOpts, privateKey: testPrivateKey });
      // Tamper with the payload
      const parts = jwt.split('.');
      parts[1] = Buffer.from('{"tampered":true}').toString('base64url');
      const tamperedJwt = parts.join('.');
      const result = verifyJWTVC(tamperedJwt, testPublicKey);
      expect(result).toBeNull();
    });

    it('rejects invalid JWT format', () => {
      const result = verifyJWTVC('not.a.valid.jwt', testPublicKey);
      expect(result).toBeNull();
    });

    it('rejects JWT with wrong number of parts', () => {
      const result = verifyJWTVC('only.two', testPublicKey);
      expect(result).toBeNull();
    });
  });

  describe('buildOfflineVerificationPayload', () => {
    it('builds a complete offline verification payload', () => {
      const vc = buildVerifiableCredential(baseOpts);
      const payload = buildOfflineVerificationPayload({
        vc,
        issuerPublicKey: testPublicKey,
        revoked: false,
      });

      expect(payload.credential).toBe(vc);
      expect(payload.issuerPublicKey).toBe(testPublicKey);
      expect(payload.revocationStatus.revoked).toBe(false);
      expect(payload.revocationStatus.checkedAt).toBeDefined();
      expect(payload.verificationInstructions.algorithm).toBe('RSA-SHA256');
      expect(payload.verificationInstructions.steps.length).toBeGreaterThan(0);
    });

    it('reflects revoked status', () => {
      const vc = buildVerifiableCredential(baseOpts);
      const payload = buildOfflineVerificationPayload({
        vc,
        issuerPublicKey: testPublicKey,
        revoked: true,
      });
      expect(payload.revocationStatus.revoked).toBe(true);
    });
  });
});
