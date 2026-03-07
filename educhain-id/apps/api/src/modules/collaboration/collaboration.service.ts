import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import { NotificationService } from '../notifications/notifications.service';
import { ActivityService } from './activity.service';

export class CollaborationService {
  private readonly notificationService: NotificationService;
  private readonly activityService: ActivityService;

  constructor(private readonly prisma: PrismaClient) {
    this.notificationService = new NotificationService(prisma);
    this.activityService = new ActivityService(prisma);
  }

  // ---------------------------------------------------------------------------
  // Follow System
  // ---------------------------------------------------------------------------

  async followStudent(followerStudentId: string, targetStudentId: string) {
    if (followerStudentId === targetStudentId) {
      throw new AppError(400, 'You cannot follow yourself');
    }

    const target = await this.prisma.student.findUnique({
      where: { id: targetStudentId },
      include: { user: { select: { id: true } } },
    });
    if (!target) {
      throw new AppError(404, 'Target student not found');
    }

    const existing = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerStudentId,
          followingId: targetStudentId,
        },
      },
    });
    if (existing) {
      throw new AppError(409, 'Already following this student');
    }

    const follow = await this.prisma.follow.create({
      data: { followerId: followerStudentId, followingId: targetStudentId },
    });

    // Notification for the target
    await this.notificationService.create(
      target.user.id,
      'new_follower',
      'New Follower',
      'You have a new follower',
    );

    // Activity log
    await this.activityService.log(followerStudentId, 'student_followed', targetStudentId);

    return follow;
  }

  async unfollowStudent(followerStudentId: string, targetStudentId: string) {
    const existing = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerStudentId,
          followingId: targetStudentId,
        },
      },
    });
    if (!existing) {
      throw new AppError(404, 'You are not following this student');
    }

    await this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: followerStudentId,
          followingId: targetStudentId,
        },
      },
    });
  }

  async getFollowers(studentId: string, page = 1, limit = 20) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const [followers, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followingId: studentId },
        include: {
          follower: {
            select: { id: true, fullName: true, degree: true, institution: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.follow.count({ where: { followingId: studentId } }),
    ]);

    return { followers: followers.map((f) => f.follower), total, page, limit: take };
  }

  async getFollowing(studentId: string, page = 1, limit = 20) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const [following, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: studentId },
        include: {
          following: {
            select: { id: true, fullName: true, degree: true, institution: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.follow.count({ where: { followerId: studentId } }),
    ]);

    return { following: following.map((f) => f.following), total, page, limit: take };
  }

  // ---------------------------------------------------------------------------
  // Collaboration Requests
  // ---------------------------------------------------------------------------

  async sendCollaborationRequest(senderStudentId: string, receiverId: string, message?: string) {
    if (senderStudentId === receiverId) {
      throw new AppError(400, 'You cannot send a collaboration request to yourself');
    }

    const receiver = await this.prisma.student.findUnique({
      where: { id: receiverId },
      include: { user: { select: { id: true } } },
    });
    if (!receiver) {
      throw new AppError(404, 'Receiver student not found');
    }

    // Check for existing pending request in either direction
    const existing = await this.prisma.collaborationRequest.findFirst({
      where: {
        OR: [
          { senderId: senderStudentId, receiverId, status: 'pending' },
          { senderId: receiverId, receiverId: senderStudentId, status: 'pending' },
        ],
      },
    });
    if (existing) {
      throw new AppError(409, 'A pending collaboration request already exists');
    }

    const request = await this.prisma.collaborationRequest.create({
      data: { senderId: senderStudentId, receiverId, message },
      include: {
        sender: { select: { id: true, fullName: true } },
        receiver: { select: { id: true, fullName: true } },
      },
    });

    // Notification
    await this.notificationService.create(
      receiver.user.id,
      'collaboration_request',
      'Collaboration Request',
      `You received a collaboration request`,
    );

    // Activity log
    await this.activityService.log(senderStudentId, 'collaboration_requested', receiverId);

    return request;
  }

  async acceptCollaborationRequest(requestId: string, receiverStudentId: string) {
    const request = await this.prisma.collaborationRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: { include: { user: { select: { id: true } } } },
      },
    });

    if (!request) {
      throw new AppError(404, 'Collaboration request not found');
    }
    if (request.receiverId !== receiverStudentId) {
      throw new AppError(403, 'Not authorized to accept this request');
    }
    if (request.status !== 'pending') {
      throw new AppError(400, 'Request is no longer pending');
    }

    const updated = await this.prisma.collaborationRequest.update({
      where: { id: requestId },
      data: { status: 'accepted' },
      include: {
        sender: { select: { id: true, fullName: true } },
        receiver: { select: { id: true, fullName: true } },
      },
    });

    // Notify sender
    await this.notificationService.create(
      request.sender.user.id,
      'collaboration_accepted',
      'Collaboration Accepted',
      'Your collaboration request was accepted',
    );

    return updated;
  }

  async rejectCollaborationRequest(requestId: string, receiverStudentId: string) {
    const request = await this.prisma.collaborationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new AppError(404, 'Collaboration request not found');
    }
    if (request.receiverId !== receiverStudentId) {
      throw new AppError(403, 'Not authorized to reject this request');
    }
    if (request.status !== 'pending') {
      throw new AppError(400, 'Request is no longer pending');
    }

    return this.prisma.collaborationRequest.update({
      where: { id: requestId },
      data: { status: 'rejected' },
      include: {
        sender: { select: { id: true, fullName: true } },
        receiver: { select: { id: true, fullName: true } },
      },
    });
  }

  async listCollaborationRequests(studentId: string) {
    const [incoming, outgoing] = await Promise.all([
      this.prisma.collaborationRequest.findMany({
        where: { receiverId: studentId },
        include: {
          sender: { select: { id: true, fullName: true, degree: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.collaborationRequest.findMany({
        where: { senderId: studentId },
        include: {
          receiver: { select: { id: true, fullName: true, degree: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { incoming_requests: incoming, outgoing_requests: outgoing };
  }

  // ---------------------------------------------------------------------------
  // Project Groups
  // ---------------------------------------------------------------------------

  async createGroup(creatorStudentId: string, name: string, description?: string) {
    const group = await this.prisma.group.create({
      data: {
        name,
        description,
        createdBy: creatorStudentId,
        members: {
          create: {
            studentId: creatorStudentId,
            role: 'owner',
          },
        },
      },
      include: {
        members: {
          include: { student: { select: { id: true, fullName: true } } },
        },
      },
    });

    // Activity log
    await this.activityService.log(creatorStudentId, 'group_created', group.id);

    return group;
  }

  async listGroups(studentId: string) {
    const memberships = await this.prisma.groupMember.findMany({
      where: { studentId },
      include: {
        group: {
          include: {
            members: {
              include: {
                student: { select: { id: true, fullName: true } },
              },
            },
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map((m) => ({
      ...m.group,
      myRole: m.role,
    }));
  }

  async addGroupMember(groupId: string, requestingStudentId: string, targetStudentId: string) {
    // Verify group exists
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      throw new AppError(404, 'Group not found');
    }

    // Check requester is owner
    const requesterMembership = await this.prisma.groupMember.findUnique({
      where: { groupId_studentId: { groupId, studentId: requestingStudentId } },
    });
    if (!requesterMembership || requesterMembership.role !== 'owner') {
      throw new AppError(403, 'Only group owners can add members');
    }

    // Verify target exists
    const target = await this.prisma.student.findUnique({
      where: { id: targetStudentId },
      include: { user: { select: { id: true } } },
    });
    if (!target) {
      throw new AppError(404, 'Target student not found');
    }

    // Check if already a member
    const existing = await this.prisma.groupMember.findUnique({
      where: { groupId_studentId: { groupId, studentId: targetStudentId } },
    });
    if (existing) {
      throw new AppError(409, 'Student is already a member of this group');
    }

    const member = await this.prisma.groupMember.create({
      data: { groupId, studentId: targetStudentId, role: 'member' },
      include: { student: { select: { id: true, fullName: true } } },
    });

    // Notify the added student
    await this.notificationService.create(
      target.user.id,
      'group_invitation',
      'Added to Group',
      `You were added to the group "${group.name}"`,
    );

    return member;
  }

  async removeGroupMember(groupId: string, requestingStudentId: string, targetStudentId: string) {
    // Verify group exists
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      throw new AppError(404, 'Group not found');
    }

    // Check requester is owner
    const requesterMembership = await this.prisma.groupMember.findUnique({
      where: { groupId_studentId: { groupId, studentId: requestingStudentId } },
    });
    if (!requesterMembership || requesterMembership.role !== 'owner') {
      throw new AppError(403, 'Only group owners can remove members');
    }

    // Cannot remove yourself (owner) — use delete group instead
    if (targetStudentId === requestingStudentId) {
      throw new AppError(400, 'Owners cannot remove themselves. Delete the group instead.');
    }

    const membership = await this.prisma.groupMember.findUnique({
      where: { groupId_studentId: { groupId, studentId: targetStudentId } },
    });
    if (!membership) {
      throw new AppError(404, 'Student is not a member of this group');
    }

    await this.prisma.groupMember.delete({
      where: { groupId_studentId: { groupId, studentId: targetStudentId } },
    });
  }

  // ---------------------------------------------------------------------------
  // Helper: resolve student ID from user ID
  // ---------------------------------------------------------------------------

  async getStudentIdByUserId(userId: string): Promise<string> {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!student) {
      throw new AppError(404, 'Student profile not found. Create a profile first.');
    }
    return student.id;
  }
}
