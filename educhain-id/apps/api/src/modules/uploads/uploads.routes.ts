import { FastifyInstance } from 'fastify';
import { UploadsController } from './uploads.controller';
import { authenticateToken } from '../../middleware/authenticateToken';
import { authorizeRole } from '../../middleware/authorizeRole';
import { validateBody } from '../../middleware/validateBody';
import { uploadCertificateSchema } from '@educhain/validators';

const uploadsController = new UploadsController();

export async function uploadsRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post(
    '/certificate',
    { preHandler: [authenticateToken, authorizeRole(['institution_admin']), validateBody(uploadCertificateSchema)] },
    uploadsController.uploadCertificate,
  );
}
