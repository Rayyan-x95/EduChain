import {
  pemToJwk,
  generateDIDKey,
  generateDIDWeb,
  buildDIDDocument,
  buildPlatformDIDDocument,
} from './did';
import crypto from 'crypto';

// Generate a test RSA key pair
const { publicKey: testPublicKeyPem, privateKey: testPrivateKeyPem } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

describe('DID Library', () => {
  describe('pemToJwk', () => {
    it('converts a PEM public key to JWK format', () => {
      const jwk = pemToJwk(testPublicKeyPem);
      expect(jwk.kty).toBe('RSA');
      expect(jwk.n).toBeDefined();
      expect(jwk.e).toBeDefined();
      expect(typeof jwk.n).toBe('string');
      expect(typeof jwk.e).toBe('string');
    });
  });

  describe('generateDIDKey', () => {
    it('generates a did:key identifier', () => {
      const did = generateDIDKey(testPublicKeyPem);
      expect(did).toMatch(/^did:key:z[A-Za-z0-9_\-+/=]+$/);
    });

    it('is deterministic for the same key', () => {
      const did1 = generateDIDKey(testPublicKeyPem);
      const did2 = generateDIDKey(testPublicKeyPem);
      expect(did1).toBe(did2);
    });
  });

  describe('generateDIDWeb', () => {
    it('generates a did:web identifier from host', () => {
      const did = generateDIDWeb('example.com');
      expect(did).toBe('did:web:example.com');
    });

    it('generates a did:web with path segments', () => {
      const did = generateDIDWeb('example.com', 'institutions', 'abc-123');
      expect(did).toBe('did:web:example.com:institutions:abc-123');
    });
  });

  describe('buildDIDDocument', () => {
    it('builds a valid DID document with verification methods', () => {
      const did = 'did:web:example.com:users:test-id';
      const doc = buildDIDDocument({
        did,
        publicKeyPem: testPublicKeyPem,
        serviceEndpoints: [
          { id: `${did}#profile`, type: 'ProfilePage', endpoint: 'https://example.com/profile' },
        ],
      });

      expect(doc['@context']).toContain('https://www.w3.org/ns/did/v1');
      expect(doc.id).toBe(did);
      expect(doc.verificationMethod).toHaveLength(1);
      expect(doc.verificationMethod[0].type).toBe('JsonWebKey2020');
      expect(doc.verificationMethod[0].publicKeyJwk).toBeDefined();
      expect(doc.verificationMethod[0].publicKeyJwk!.kty).toBe('RSA');
      expect(doc.authentication).toEqual([`${did}#key-1`]);
      expect(doc.assertionMethod).toEqual([`${did}#key-1`]);
      expect(doc.service).toHaveLength(1);
    });

    it('works without service endpoints', () => {
      const did = 'did:web:example.com';
      const doc = buildDIDDocument({ did, publicKeyPem: testPublicKeyPem });
      expect(doc.service).toBeUndefined();
    });
  });

  describe('buildPlatformDIDDocument', () => {
    it('builds a platform DID document from base URL', () => {
      const doc = buildPlatformDIDDocument('https://educhain.com');
      expect(doc.id).toBe('did:web:educhain.com');
      expect(doc.verificationMethod).toBeDefined();
      expect(doc.service).toBeDefined();
      const serviceIds = doc.service?.map((s) => s.id);
      expect(serviceIds).toContain('did:web:educhain.com#credential-api');
      expect(serviceIds).toContain('did:web:educhain.com#key-registry');
    });
  });
});
