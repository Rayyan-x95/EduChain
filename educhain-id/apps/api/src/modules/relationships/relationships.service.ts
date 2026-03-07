import { PrismaClient, RelationshipType as PrismaRelType } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import type { CreateRelationshipInput } from '@educhain/validators';

export class RelationshipsService {
  constructor(private readonly prisma: PrismaClient) {}

  async createRelationship(userId: string, data: CreateRelationshipInput) {
    if (userId === data.targetUserId) {
      throw new AppError(400, 'Cannot create a relationship with yourself');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: data.targetUserId },
    });
    if (!targetUser) {
      throw new AppError(404, 'Target user not found');
    }

    const existing = await this.prisma.relationship.findUnique({
      where: {
        sourceUserId_targetUserId_relationshipType: {
          sourceUserId: userId,
          targetUserId: data.targetUserId,
          relationshipType: data.relationshipType as PrismaRelType,
        },
      },
    });

    if (existing) {
      throw new AppError(409, 'Relationship already exists');
    }

    return this.prisma.relationship.create({
      data: {
        sourceUserId: userId,
        targetUserId: data.targetUserId,
        relationshipType: data.relationshipType as PrismaRelType,
      },
    });
  }

  async getRelationshipsForUser(userId: string) {
    const [outgoing, incoming] = await Promise.all([
      this.prisma.relationship.findMany({
        where: { sourceUserId: userId },
        include: {
          targetUser: { select: { id: true, email: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.relationship.findMany({
        where: { targetUserId: userId },
        include: {
          sourceUser: { select: { id: true, email: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { outgoing, incoming };
  }

  async getReputationGraph(userId: string) {
    const relationships = await this.prisma.relationship.findMany({
      where: { OR: [{ sourceUserId: userId }, { targetUserId: userId }] },
      include: {
        sourceUser: { select: { id: true, username: true } },
        targetUser: { select: { id: true, username: true } },
      },
    });

    // Build adjacency data for graph visualisation
    const nodesMap = new Map<string, { id: string; username: string | null }>();
    const edges: Array<{
      source: string;
      target: string;
      type: string;
    }> = [];

    for (const r of relationships) {
      nodesMap.set(r.sourceUser.id, { id: r.sourceUser.id, username: r.sourceUser.username });
      nodesMap.set(r.targetUser.id, { id: r.targetUser.id, username: r.targetUser.username });
      edges.push({
        source: r.sourceUserId,
        target: r.targetUserId,
        type: r.relationshipType,
      });
    }

    return {
      nodes: Array.from(nodesMap.values()),
      edges,
    };
  }

  async removeRelationship(userId: string, relationshipId: string) {
    const rel = await this.prisma.relationship.findUnique({
      where: { id: relationshipId },
    });

    if (!rel) {
      throw new AppError(404, 'Relationship not found');
    }

    if (rel.sourceUserId !== userId) {
      throw new AppError(403, 'You can only remove relationships you created');
    }

    await this.prisma.relationship.delete({ where: { id: relationshipId } });
  }
}
