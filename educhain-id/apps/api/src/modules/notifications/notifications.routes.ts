import { FastifyInstance } from 'fastify';
import { NotificationsController } from './notifications.controller';
import { NotificationService } from './notifications.service';
import { authenticateToken } from '../../middleware/authenticateToken';
import { prisma } from '../../lib/prisma';

const notificationService = new NotificationService(prisma);
const notificationsController = new NotificationsController(notificationService);

export async function notificationsRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', { preHandler: [authenticateToken] }, notificationsController.getNotifications);
  fastify.put('/:id', { preHandler: [authenticateToken] }, notificationsController.markAsRead);
}
