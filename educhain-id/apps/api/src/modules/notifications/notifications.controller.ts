import { FastifyRequest, FastifyReply } from 'fastify';
import { NotificationService } from './notifications.service';

export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  getNotifications = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.user!.userId;
    const { page, limit } = request.query as { page?: string; limit?: string };

    const result = await this.notificationService.getByUser(
      userId,
      parseInt(page ?? '1') || 1,
      parseInt(limit ?? '20') || 20,
    );

    reply.status(200).send({ success: true, data: result });
  };

  markAsRead = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.user!.userId;
    const { id } = request.params as { id: string };

    const notification = await this.notificationService.markAsRead(id, userId);

    if (!notification) {
      reply.status(404).send({ success: false, error: 'Notification not found' });
      return;
    }

    reply.status(200).send({ success: true, data: notification });
  };
}
