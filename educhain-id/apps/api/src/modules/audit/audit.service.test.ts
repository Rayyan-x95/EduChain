import { AuditLogService } from './audit.service';

function createMockPrisma() {
  return {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  } as any;
}

describe('AuditLogService', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let service: AuditLogService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new AuditLogService(prisma);
  });

  describe('log', () => {
    it('should create an audit log entry', async () => {
      const entry = {
        actorId: 'user-1',
        actorRole: 'institution_admin',
        action: 'credential_issued',
        entityType: 'credential',
        entityId: 'cred-1',
        metadata: { credentialType: 'degree' },
      };

      prisma.auditLog.create.mockResolvedValue({ id: 'log-1', ...entry });

      const result = await service.log(entry);
      expect(result.action).toBe('credential_issued');
      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          actorId: 'user-1',
          actorRole: 'institution_admin',
          action: 'credential_issued',
          entityType: 'credential',
          entityId: 'cred-1',
          metadata: { credentialType: 'degree' },
        },
      });
    });

    it('should create an entry without metadata', async () => {
      const entry = {
        actorId: 'user-1',
        actorRole: 'platform_admin',
        action: 'institution_registered',
        entityType: 'institution',
        entityId: 'inst-1',
      };

      prisma.auditLog.create.mockResolvedValue({ id: 'log-2', ...entry });

      const result = await service.log(entry);
      expect(result.id).toBe('log-2');
      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          actorId: 'user-1',
          actorRole: 'platform_admin',
          action: 'institution_registered',
          entityType: 'institution',
          entityId: 'inst-1',
          metadata: undefined,
        },
      });
    });
  });

  describe('getByEntity', () => {
    it('should return logs for a given entity', async () => {
      const logs = [
        { id: 'log-1', entityType: 'credential', entityId: 'cred-1', action: 'credential_issued' },
        { id: 'log-2', entityType: 'credential', entityId: 'cred-1', action: 'credential_revoked' },
      ];
      prisma.auditLog.findMany.mockResolvedValue(logs);

      const result = await service.getByEntity('credential', 'cred-1');
      expect(result).toHaveLength(2);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { entityType: 'credential', entityId: 'cred-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getByActor', () => {
    it('should return paginated logs for an actor', async () => {
      prisma.auditLog.findMany.mockResolvedValue([{ id: 'log-1' }]);
      prisma.auditLog.count.mockResolvedValue(1);

      const result = await service.getByActor('user-1', 1, 50);

      expect(result.logs).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });

    it('should cap limit at 100', async () => {
      prisma.auditLog.findMany.mockResolvedValue([]);
      prisma.auditLog.count.mockResolvedValue(0);

      const result = await service.getByActor('user-1', 1, 500);
      expect(result.limit).toBe(100);
    });
  });
});
