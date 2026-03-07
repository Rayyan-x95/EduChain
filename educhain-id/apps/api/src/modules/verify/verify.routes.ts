import { FastifyInstance } from 'fastify';
import { VerifyController } from './verify.controller';
import { VerifyService } from './verify.service';
import { prisma } from '../../lib/prisma';

const service = new VerifyService(prisma);
const controller = new VerifyController(service);

export async function verifyRoutes(fastify: FastifyInstance): Promise<void> {
  // Public — no authentication required (used by QR code scans)
  fastify.get('/:studentId', {
    config: { rateLimit: { max: 30, timeWindow: 60_000 } },
  }, controller.verifyStudent);
}
