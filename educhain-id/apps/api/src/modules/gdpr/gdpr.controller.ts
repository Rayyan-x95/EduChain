import { FastifyRequest, FastifyReply } from 'fastify';
import { GDPRService } from './gdpr.service';

export class GDPRController {
  private gdprService: GDPRService;

  constructor(gdprService: GDPRService) {
    this.gdprService = gdprService;
    this.exportData = this.exportData.bind(this);
    this.requestDeletion = this.requestDeletion.bind(this);
    this.cancelDeletion = this.cancelDeletion.bind(this);
    this.recordConsent = this.recordConsent.bind(this);
  }

  async exportData(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const userId = request.user!.userId;
    const data = await this.gdprService.exportUserData(userId);

    reply
      .header('content-type', 'application/json')
      .header('content-disposition', `attachment; filename="gdpr-export-${userId}.json"`)
      .status(200)
      .send({ success: true, data });
  }

  async requestDeletion(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const userId = request.user!.userId;
    const { confirmEmail, reason } = request.body as { confirmEmail: string; reason?: string };

    const result = await this.gdprService.requestAccountDeletion(userId, {
      confirmEmail,
      reason,
    });

    reply.status(200).send({ success: true, data: result });
  }

  async cancelDeletion(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const userId = request.user!.userId;
    await this.gdprService.cancelAccountDeletion(userId);
    reply.status(200).send({ success: true, message: 'Deletion cancelled' });
  }

  async recordConsent(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const userId = request.user!.userId;
    const { consentType, granted } = request.body as { consentType: string; granted: boolean };
    const ip = request.ip;
    await this.gdprService.recordConsent(userId, consentType, granted, ip);
    reply.status(200).send({ success: true, message: 'Consent recorded' });
  }
}
