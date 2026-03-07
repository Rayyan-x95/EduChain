import { CollaborationService } from './collaboration.service';

function createMockPrisma() {
  return {
    student: {
      findUnique: jest.fn(),
    },
    follow: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    collaborationRequest: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    group: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    groupMember: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    activityLog: {
      create: jest.fn(),
    },
  } as any;
}

describe('CollaborationService', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let service: CollaborationService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new CollaborationService(prisma);
  });

  // =========================================================================
  // Follow System
  // =========================================================================

  describe('followStudent', () => {
    it('should follow a student successfully', async () => {
      prisma.student.findUnique.mockResolvedValue({
        id: 'student-2',
        user: { id: 'user-2' },
      });
      prisma.follow.findUnique.mockResolvedValue(null);
      prisma.follow.create.mockResolvedValue({
        followerId: 'student-1',
        followingId: 'student-2',
        createdAt: new Date(),
      });
      prisma.notification.create.mockResolvedValue({});
      prisma.activityLog.create.mockResolvedValue({});

      const result = await service.followStudent('student-1', 'student-2');
      expect(result.followerId).toBe('student-1');
      expect(result.followingId).toBe('student-2');
      expect(prisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ type: 'new_follower' }),
        }),
      );
    });

    it('should throw 400 if trying to self-follow', async () => {
      await expect(
        service.followStudent('student-1', 'student-1'),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('should throw 404 if target student not found', async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(
        service.followStudent('student-1', 'student-2'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw 409 if already following', async () => {
      prisma.student.findUnique.mockResolvedValue({
        id: 'student-2',
        user: { id: 'user-2' },
      });
      prisma.follow.findUnique.mockResolvedValue({
        followerId: 'student-1',
        followingId: 'student-2',
      });

      await expect(
        service.followStudent('student-1', 'student-2'),
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe('unfollowStudent', () => {
    it('should unfollow successfully', async () => {
      prisma.follow.findUnique.mockResolvedValue({
        followerId: 'student-1',
        followingId: 'student-2',
      });
      prisma.follow.delete.mockResolvedValue({});

      await expect(
        service.unfollowStudent('student-1', 'student-2'),
      ).resolves.not.toThrow();
    });

    it('should throw 404 if not following', async () => {
      prisma.follow.findUnique.mockResolvedValue(null);

      await expect(
        service.unfollowStudent('student-1', 'student-2'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('getFollowers', () => {
    it('should return paginated followers', async () => {
      prisma.follow.findMany.mockResolvedValue([
        {
          follower: { id: 'student-2', fullName: 'Alice', degree: 'CS', institution: { name: 'MIT' } },
        },
      ]);
      prisma.follow.count.mockResolvedValue(1);

      const result = await service.getFollowers('student-1');
      expect(result.followers).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('getFollowing', () => {
    it('should return paginated following list', async () => {
      prisma.follow.findMany.mockResolvedValue([
        {
          following: { id: 'student-3', fullName: 'Bob', degree: 'EE', institution: { name: 'Stanford' } },
        },
      ]);
      prisma.follow.count.mockResolvedValue(1);

      const result = await service.getFollowing('student-1');
      expect(result.following).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  // =========================================================================
  // Collaboration Requests
  // =========================================================================

  describe('sendCollaborationRequest', () => {
    it('should send a request successfully', async () => {
      prisma.student.findUnique.mockResolvedValue({
        id: 'student-2',
        user: { id: 'user-2' },
      });
      prisma.collaborationRequest.findFirst.mockResolvedValue(null);
      prisma.collaborationRequest.create.mockResolvedValue({
        id: 'req-1',
        senderId: 'student-1',
        receiverId: 'student-2',
        message: 'Let us collaborate',
        status: 'pending',
        sender: { id: 'student-1', fullName: 'Alice' },
        receiver: { id: 'student-2', fullName: 'Bob' },
      });
      prisma.notification.create.mockResolvedValue({});
      prisma.activityLog.create.mockResolvedValue({});

      const result = await service.sendCollaborationRequest(
        'student-1',
        'student-2',
        'Let us collaborate',
      );
      expect(result.id).toBe('req-1');
      expect(result.status).toBe('pending');
    });

    it('should throw 400 on self-request', async () => {
      await expect(
        service.sendCollaborationRequest('student-1', 'student-1'),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('should throw 404 if receiver not found', async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(
        service.sendCollaborationRequest('student-1', 'student-2'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw 409 if duplicate pending request exists', async () => {
      prisma.student.findUnique.mockResolvedValue({
        id: 'student-2',
        user: { id: 'user-2' },
      });
      prisma.collaborationRequest.findFirst.mockResolvedValue({
        id: 'req-existing',
        status: 'pending',
      });

      await expect(
        service.sendCollaborationRequest('student-1', 'student-2'),
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe('acceptCollaborationRequest', () => {
    it('should accept a pending request', async () => {
      prisma.collaborationRequest.findUnique.mockResolvedValue({
        id: 'req-1',
        senderId: 'student-1',
        receiverId: 'student-2',
        status: 'pending',
        sender: { user: { id: 'user-1' } },
      });
      prisma.collaborationRequest.update.mockResolvedValue({
        id: 'req-1',
        status: 'accepted',
        sender: { id: 'student-1', fullName: 'Alice' },
        receiver: { id: 'student-2', fullName: 'Bob' },
      });
      prisma.notification.create.mockResolvedValue({});

      const result = await service.acceptCollaborationRequest('req-1', 'student-2');
      expect(result.status).toBe('accepted');
    });

    it('should throw 404 if request not found', async () => {
      prisma.collaborationRequest.findUnique.mockResolvedValue(null);

      await expect(
        service.acceptCollaborationRequest('req-1', 'student-2'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw 403 if not the receiver', async () => {
      prisma.collaborationRequest.findUnique.mockResolvedValue({
        id: 'req-1',
        senderId: 'student-1',
        receiverId: 'student-2',
        status: 'pending',
        sender: { user: { id: 'user-1' } },
      });

      await expect(
        service.acceptCollaborationRequest('req-1', 'student-3'),
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('should throw 400 if request is not pending', async () => {
      prisma.collaborationRequest.findUnique.mockResolvedValue({
        id: 'req-1',
        senderId: 'student-1',
        receiverId: 'student-2',
        status: 'accepted',
        sender: { user: { id: 'user-1' } },
      });

      await expect(
        service.acceptCollaborationRequest('req-1', 'student-2'),
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe('rejectCollaborationRequest', () => {
    it('should reject a pending request', async () => {
      prisma.collaborationRequest.findUnique.mockResolvedValue({
        id: 'req-1',
        senderId: 'student-1',
        receiverId: 'student-2',
        status: 'pending',
      });
      prisma.collaborationRequest.update.mockResolvedValue({
        id: 'req-1',
        status: 'rejected',
        sender: { id: 'student-1', fullName: 'Alice' },
        receiver: { id: 'student-2', fullName: 'Bob' },
      });

      const result = await service.rejectCollaborationRequest('req-1', 'student-2');
      expect(result.status).toBe('rejected');
    });

    it('should throw 403 if not the receiver', async () => {
      prisma.collaborationRequest.findUnique.mockResolvedValue({
        id: 'req-1',
        receiverId: 'student-2',
        status: 'pending',
      });

      await expect(
        service.rejectCollaborationRequest('req-1', 'student-3'),
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe('listCollaborationRequests', () => {
    it('should return incoming and outgoing requests', async () => {
      prisma.collaborationRequest.findMany
        .mockResolvedValueOnce([{ id: 'req-1', sender: { id: 's1', fullName: 'A', degree: 'CS' } }])
        .mockResolvedValueOnce([{ id: 'req-2', receiver: { id: 's2', fullName: 'B', degree: 'EE' } }]);

      const result = await service.listCollaborationRequests('student-1');
      expect(result.incoming_requests).toHaveLength(1);
      expect(result.outgoing_requests).toHaveLength(1);
    });
  });

  // =========================================================================
  // Groups
  // =========================================================================

  describe('createGroup', () => {
    it('should create a group with creator as owner', async () => {
      prisma.group.create.mockResolvedValue({
        id: 'group-1',
        name: 'AI Project',
        description: 'Working on AI',
        createdBy: 'student-1',
        members: [
          { studentId: 'student-1', role: 'owner', student: { id: 'student-1', fullName: 'Alice' } },
        ],
      });
      prisma.activityLog.create.mockResolvedValue({});

      const result = await service.createGroup('student-1', 'AI Project', 'Working on AI');
      expect(result.name).toBe('AI Project');
      expect(result.members[0].role).toBe('owner');
    });
  });

  describe('addGroupMember', () => {
    it('should add a member when requester is owner', async () => {
      prisma.group.findUnique.mockResolvedValue({ id: 'group-1', name: 'AI Project' });
      prisma.groupMember.findUnique
        .mockResolvedValueOnce({ groupId: 'group-1', studentId: 'student-1', role: 'owner' })
        .mockResolvedValueOnce(null); // target not yet a member
      prisma.student.findUnique.mockResolvedValue({
        id: 'student-2',
        user: { id: 'user-2' },
      });
      prisma.groupMember.create.mockResolvedValue({
        groupId: 'group-1',
        studentId: 'student-2',
        role: 'member',
        student: { id: 'student-2', fullName: 'Bob' },
      });
      prisma.notification.create.mockResolvedValue({});

      const result = await service.addGroupMember('group-1', 'student-1', 'student-2');
      expect(result.role).toBe('member');
    });

    it('should throw 403 if requester is not owner', async () => {
      prisma.group.findUnique.mockResolvedValue({ id: 'group-1' });
      prisma.groupMember.findUnique.mockResolvedValue({
        groupId: 'group-1',
        studentId: 'student-1',
        role: 'member',
      });

      await expect(
        service.addGroupMember('group-1', 'student-1', 'student-2'),
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('should throw 404 if group not found', async () => {
      prisma.group.findUnique.mockResolvedValue(null);

      await expect(
        service.addGroupMember('group-1', 'student-1', 'student-2'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw 409 if student already a member', async () => {
      prisma.group.findUnique.mockResolvedValue({ id: 'group-1', name: 'AI' });
      prisma.groupMember.findUnique
        .mockResolvedValueOnce({ groupId: 'group-1', studentId: 'student-1', role: 'owner' })
        .mockResolvedValueOnce({ groupId: 'group-1', studentId: 'student-2', role: 'member' });
      prisma.student.findUnique.mockResolvedValue({
        id: 'student-2',
        user: { id: 'user-2' },
      });

      await expect(
        service.addGroupMember('group-1', 'student-1', 'student-2'),
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe('removeGroupMember', () => {
    it('should remove a member when requester is owner', async () => {
      prisma.group.findUnique.mockResolvedValue({ id: 'group-1' });
      prisma.groupMember.findUnique
        .mockResolvedValueOnce({ groupId: 'group-1', studentId: 'student-1', role: 'owner' })
        .mockResolvedValueOnce({ groupId: 'group-1', studentId: 'student-2', role: 'member' });
      prisma.groupMember.delete.mockResolvedValue({});

      await expect(
        service.removeGroupMember('group-1', 'student-1', 'student-2'),
      ).resolves.not.toThrow();
    });

    it('should throw 403 if requester is not owner', async () => {
      prisma.group.findUnique.mockResolvedValue({ id: 'group-1' });
      prisma.groupMember.findUnique.mockResolvedValue({
        groupId: 'group-1',
        studentId: 'student-2',
        role: 'member',
      });

      await expect(
        service.removeGroupMember('group-1', 'student-2', 'student-3'),
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('should throw 400 if owner tries to remove self', async () => {
      prisma.group.findUnique.mockResolvedValue({ id: 'group-1' });
      prisma.groupMember.findUnique.mockResolvedValue({
        groupId: 'group-1',
        studentId: 'student-1',
        role: 'owner',
      });

      await expect(
        service.removeGroupMember('group-1', 'student-1', 'student-1'),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('should throw 404 if target is not a member', async () => {
      prisma.group.findUnique.mockResolvedValue({ id: 'group-1' });
      prisma.groupMember.findUnique
        .mockResolvedValueOnce({ groupId: 'group-1', studentId: 'student-1', role: 'owner' })
        .mockResolvedValueOnce(null);

      await expect(
        service.removeGroupMember('group-1', 'student-1', 'student-3'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // =========================================================================
  // Helper
  // =========================================================================

  describe('getStudentIdByUserId', () => {
    it('should return student ID for given user ID', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 'student-1' });

      const result = await service.getStudentIdByUserId('user-1');
      expect(result).toBe('student-1');
    });

    it('should throw 404 if no student profile', async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(
        service.getStudentIdByUserId('user-1'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
