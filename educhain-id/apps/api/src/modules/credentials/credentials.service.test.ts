import { CredentialsService } from './credentials.service';
import { AppError } from '../../middleware/errorHandler';

// Mock the queue module so tests don't need Redis
jest.mock('../../queue/credential.queue', () => ({
  enqueueCredentialSigning: jest.fn(),
}));

// Mock the InstitutionKeyStore — use a local Map to simulate encrypted key storage
const mockKeyStoreMap = new Map<string, string>();
jest.mock('../../lib/keyStore', () => ({
  InstitutionKeyStore: jest.fn().mockImplementation(() => ({
    storePrivateKey: jest.fn(async (id: string, key: string) => { mockKeyStoreMap.set(id, key); }),
    getPrivateKey: jest.fn(async (id: string) => mockKeyStoreMap.get(id) ?? null),
    rotateKey: jest.fn(),
  })),
}));

function createMockPrisma() {
  return {
    institution: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
    },
    credential: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    keyVersion: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((args: any[]) => Promise.all(args)),
  } as any;
}

// Deterministic test key pair
import { generateInstitutionKeyPair } from '../../lib/credential.crypto';
const testKeyPair = generateInstitutionKeyPair();

describe('CredentialsService', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let service: CredentialsService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new CredentialsService(prisma);
    mockKeyStoreMap.clear();
    prisma.auditLog.create.mockResolvedValue({});
  });

  // -----------------------------------------------------------------------
  // Key generation
  // -----------------------------------------------------------------------
  describe('generateKeys', () => {
    it('should generate and store a key pair for an institution', async () => {
      prisma.institution.findUnique.mockResolvedValue({ id: 'inst-1', publicKey: null });
      prisma.institution.update.mockResolvedValue({ id: 'inst-1', publicKey: 'PEM...' });

      const result = await service.generateKeys('inst-1', 'admin-1', 'institution_admin');

      expect(result.publicKey).toContain('-----BEGIN PUBLIC KEY-----');
      expect(prisma.institution.update).toHaveBeenCalledTimes(1);
      expect(mockKeyStoreMap.has('inst-1')).toBe(true);
    });

    it('should throw 404 if institution not found', async () => {
      prisma.institution.findUnique.mockResolvedValue(null);

      await expect(
        service.generateKeys('bad-id', 'admin-1', 'institution_admin'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw 409 if institution already has keys', async () => {
      prisma.institution.findUnique.mockResolvedValue({ id: 'inst-1', publicKey: 'existing' });

      await expect(
        service.generateKeys('inst-1', 'admin-1', 'institution_admin'),
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  // -----------------------------------------------------------------------
  // Issue credential
  // -----------------------------------------------------------------------
  describe('issueCredential', () => {
    const issueData = {
      studentId: 'student-1',
      credentialType: 'degree',
      title: 'BSc Computer Science',
      issuedDate: '2024-06-15',
    };

    const mockInstitution = { id: 'inst-1', name: 'MIT', domain: 'mit.edu', publicKey: testKeyPair.publicKey };
    const mockStudent = { id: 'student-1', institutionId: 'inst-1' };

    beforeEach(() => {
      prisma.user.findUnique.mockResolvedValue({ id: 'admin-1', email: 'admin@mit.edu', role: 'institution_admin' });
      prisma.institution.findUnique.mockResolvedValue(mockInstitution);
      prisma.student.findUnique.mockResolvedValue(mockStudent);
      prisma.credential.create.mockImplementation(({ data }: any) => Promise.resolve({
        id: 'cred-1',
        ...data,
        student: { id: 'student-1', fullName: 'John Doe' },
        institution: { id: 'inst-1', name: 'MIT', domain: 'mit.edu' },
      }));
    });

    it('should issue a credential and sign it when private key is available', async () => {
      mockKeyStoreMap.set('inst-1', testKeyPair.privateKey);

      const result = await service.issueCredential('admin-1', 'institution_admin', issueData);

      expect(result.id).toBe('cred-1');
      expect(result.credentialHash).toBeDefined();
      expect(result.signature).toBeDefined();
      expect(prisma.credential.create).toHaveBeenCalledTimes(1);
    });

    it('should issue credential without signature and enqueue signing if no key', async () => {
      const { enqueueCredentialSigning } = require('../../queue/credential.queue');

      const result = await service.issueCredential('admin-1', 'institution_admin', issueData);

      expect(result.signature).toBeNull();
      expect(enqueueCredentialSigning).toHaveBeenCalledWith('cred-1');
    });

    it('should throw 404 if student not found', async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(
        service.issueCredential('admin-1', 'institution_admin', issueData),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw 403 if student does not belong to institution', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 'student-1', institutionId: 'other-inst' });

      await expect(
        service.issueCredential('admin-1', 'institution_admin', issueData),
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  // -----------------------------------------------------------------------
  // Sign pending
  // -----------------------------------------------------------------------
  describe('signPendingCredential', () => {
    it('should sign an unsigned credential', async () => {
      mockKeyStoreMap.set('inst-1', testKeyPair.privateKey);
      prisma.credential.findUnique.mockResolvedValue({
        id: 'cred-1',
        institutionId: 'inst-1',
        credentialHash: 'abc123',
        signature: null,
        institution: { id: 'inst-1' },
      });
      prisma.credential.update.mockResolvedValue({ id: 'cred-1', signature: 'sig' });

      const result = await service.signPendingCredential('cred-1');
      expect(result.signature).toBe('sig');
      expect(prisma.credential.update).toHaveBeenCalledTimes(1);
    });

    it('should return credential if already signed', async () => {
      prisma.credential.findUnique.mockResolvedValue({
        id: 'cred-1',
        signature: 'already-signed',
        institution: {},
      });

      const result = await service.signPendingCredential('cred-1');
      expect(result.signature).toBe('already-signed');
      expect(prisma.credential.update).not.toHaveBeenCalled();
    });

    it('should throw 404 if credential not found', async () => {
      prisma.credential.findUnique.mockResolvedValue(null);

      await expect(
        service.signPendingCredential('bad-id'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw 500 if private key not available', async () => {
      prisma.credential.findUnique.mockResolvedValue({
        id: 'cred-1',
        institutionId: 'inst-1',
        credentialHash: 'abc',
        signature: null,
        institution: { id: 'inst-1' },
      });

      await expect(
        service.signPendingCredential('cred-1'),
      ).rejects.toMatchObject({ statusCode: 500 });
    });
  });

  // -----------------------------------------------------------------------
  // Verify credential
  // -----------------------------------------------------------------------
  describe('verifyCredential', () => {
    it('should return verified=true for a valid signed credential', async () => {
      const { generateCredentialHash, signCredential } = require('../../lib/credential.crypto');
      const payload = {
        studentId: 'student-1',
        institutionId: 'inst-1',
        credentialType: 'degree',
        title: 'BSc CS',
        description: '',
        issuedDate: '2024-06-15',
      };
      const hash = generateCredentialHash(payload);
      const sig = signCredential(hash, testKeyPair.privateKey);

      prisma.credential.findUnique.mockResolvedValue({
        id: 'cred-1',
        studentId: 'student-1',
        institutionId: 'inst-1',
        credentialType: 'degree',
        title: 'BSc CS',
        description: null,
        issuedDate: new Date('2024-06-15'),
        credentialHash: hash,
        signature: sig,
        status: 'active',
        institution: { id: 'inst-1', name: 'MIT', domain: 'mit.edu', publicKey: testKeyPair.publicKey },
      });

      const result = await service.verifyCredential('cred-1');
      expect(result.verified).toBe(true);
    });

    it('should return verified=false for a revoked credential', async () => {
      prisma.credential.findUnique.mockResolvedValue({
        id: 'cred-1',
        status: 'revoked',
        title: 'BSc CS',
        credentialType: 'degree',
        issuedDate: new Date(),
        institution: { id: 'inst-1', name: 'MIT', domain: 'mit.edu' },
      });

      const result = await service.verifyCredential('cred-1');
      expect(result.verified).toBe(false);
      expect(result.reason).toContain('revoked');
    });

    it('should return verified=false when credential not found', async () => {
      prisma.credential.findUnique.mockResolvedValue(null);

      const result = await service.verifyCredential('bad-id');
      expect(result.verified).toBe(false);
      expect(result.reason).toContain('not found');
    });

    it('should return verified=false when not yet signed', async () => {
      prisma.credential.findUnique.mockResolvedValue({
        id: 'cred-1',
        credentialHash: 'abc',
        signature: null,
        status: 'active',
        institution: { id: 'inst-1', name: 'MIT', domain: 'mit.edu', publicKey: testKeyPair.publicKey },
      });

      const result = await service.verifyCredential('cred-1');
      expect(result.verified).toBe(false);
      expect(result.reason).toContain('not yet signed');
    });
  });

  // -----------------------------------------------------------------------
  // Revoke credential
  // -----------------------------------------------------------------------
  describe('revokeCredential', () => {
    beforeEach(() => {
      prisma.user.findUnique.mockResolvedValue({ id: 'admin-1', email: 'admin@mit.edu', role: 'institution_admin' });
      prisma.institution.findUnique.mockResolvedValue({ id: 'inst-1', domain: 'mit.edu' });
    });

    it('should revoke an active credential', async () => {
      prisma.credential.findUnique.mockResolvedValue({
        id: 'cred-1',
        institutionId: 'inst-1',
        status: 'active',
      });
      prisma.credential.update.mockResolvedValue({
        id: 'cred-1',
        status: 'revoked',
        student: { id: 'student-1', fullName: 'John' },
        institution: { id: 'inst-1', name: 'MIT' },
      });

      const result = await service.revokeCredential('admin-1', 'institution_admin', 'cred-1', 'fraud');
      expect(result.status).toBe('revoked');
    });

    it('should throw 404 if credential not found for revocation', async () => {
      prisma.credential.findUnique.mockResolvedValue(null);

      await expect(
        service.revokeCredential('admin-1', 'institution_admin', 'bad-id'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw 403 if credential belongs to another institution', async () => {
      prisma.credential.findUnique.mockResolvedValue({
        id: 'cred-1',
        institutionId: 'other-inst',
        status: 'active',
      });

      await expect(
        service.revokeCredential('admin-1', 'institution_admin', 'cred-1'),
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('should throw 400 if credential already revoked', async () => {
      prisma.credential.findUnique.mockResolvedValue({
        id: 'cred-1',
        institutionId: 'inst-1',
        status: 'revoked',
      });

      await expect(
        service.revokeCredential('admin-1', 'institution_admin', 'cred-1'),
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  // -----------------------------------------------------------------------
  // Queries
  // -----------------------------------------------------------------------
  describe('getStudentCredentials', () => {
    it('should return paginated results', async () => {
      prisma.credential.findMany.mockResolvedValue([{ id: 'cred-1' }]);
      prisma.credential.count.mockResolvedValue(1);

      const result = await service.getStudentCredentials('student-1', 1, 20);
      expect(result.credentials).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('getCredentialById', () => {
    it('should return a credential by id', async () => {
      prisma.credential.findUnique.mockResolvedValue({ id: 'cred-1', title: 'BSc CS' });
      const result = await service.getCredentialById('cred-1');
      expect(result.title).toBe('BSc CS');
    });

    it('should throw 404 if not found', async () => {
      prisma.credential.findUnique.mockResolvedValue(null);
      await expect(service.getCredentialById('bad-id')).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('getInstitutionCredentials', () => {
    it('should return paginated institution credentials', async () => {
      prisma.credential.findMany.mockResolvedValue([{ id: 'cred-1' }, { id: 'cred-2' }]);
      prisma.credential.count.mockResolvedValue(2);

      const result = await service.getInstitutionCredentials('inst-1');
      expect(result.credentials).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  // -----------------------------------------------------------------------
  // Certificate URL attachment
  // -----------------------------------------------------------------------
  describe('attachCertificateUrl', () => {
    beforeEach(() => {
      prisma.user.findUnique.mockResolvedValue({ id: 'admin-1', email: 'admin@mit.edu', role: 'institution_admin' });
      prisma.institution.findUnique.mockResolvedValue({ id: 'inst-1', domain: 'mit.edu' });
    });

    it('should attach a certificate URL', async () => {
      prisma.credential.findUnique.mockResolvedValue({ id: 'cred-1', institutionId: 'inst-1' });
      prisma.credential.update.mockResolvedValue({ id: 'cred-1', certificateUrl: 'https://s3.example.com/cert.pdf' });

      const result = await service.attachCertificateUrl('admin-1', 'cred-1', 'https://s3.example.com/cert.pdf');
      expect(result.certificateUrl).toBe('https://s3.example.com/cert.pdf');
    });

    it('should throw 403 if credential belongs to another institution', async () => {
      prisma.credential.findUnique.mockResolvedValue({ id: 'cred-1', institutionId: 'other-inst' });

      await expect(
        service.attachCertificateUrl('admin-1', 'cred-1', 'https://url.com'),
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });
});
