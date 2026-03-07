import { NotificationService } from './notifications.service';

function createMockPrisma() {
  return {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  } as any;
}

describe('NotificationService', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let service: NotificationService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new NotificationService(prisma);
  });

  describe('create', () => {
    it('should create a notification', async () => {
      prisma.notification.create.mockResolvedValue({
        id: 'notif-1',
        userId: 'user-1',
        type: 'new_follower',
        title: 'New Follower',
        body: 'You have a new follower',
        read: false,
      });

      const result = await service.create('user-1', 'new_follower', 'New Follower', 'You have a new follower');
      expect(result.type).toBe('new_follower');
      expect(result.read).toBe(false);
    });
  });

  describe('getByUser', () => {
    it('should return paginated notifications', async () => {
      prisma.notification.findMany.mockResolvedValue([
        { id: 'notif-1', type: 'new_follower' },
      ]);
      prisma.notification.count.mockResolvedValue(1);

      const result = await service.getByUser('user-1');
      expect(result.notifications).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      prisma.notification.findUnique.mockResolvedValue({
        id: 'notif-1',
        userId: 'user-1',
        read: false,
      });
      prisma.notification.update.mockResolvedValue({
        id: 'notif-1',
        userId: 'user-1',
        read: true,
      });

      const result = await service.markAsRead('notif-1', 'user-1');
      expect(result!.read).toBe(true);
    });

    it('should return null if notification not found', async () => {
      prisma.notification.findUnique.mockResolvedValue(null);

      const result = await service.markAsRead('notif-1', 'user-1');
      expect(result).toBeNull();
    });

    it('should return null if notification belongs to another user', async () => {
      prisma.notification.findUnique.mockResolvedValue({
        id: 'notif-1',
        userId: 'user-2',
        read: false,
      });

      const result = await service.markAsRead('notif-1', 'user-1');
      expect(result).toBeNull();
    });
  });
});
