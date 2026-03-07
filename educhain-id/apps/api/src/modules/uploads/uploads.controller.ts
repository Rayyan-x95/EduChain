import { FastifyRequest, FastifyReply } from 'fastify';
import { generatePresignedUploadUrl } from './uploads.service';

export class UploadsController {
  uploadCertificate = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { fileName, mimeType, fileSize } = request.body as {
      fileName?: string;
      mimeType?: string;
      fileSize?: number;
    };

    if (!fileName || !mimeType) {
      reply.status(400).send({
        success: false,
        error: 'fileName and mimeType are required',
      });
      return;
    }

    const result = await generatePresignedUploadUrl(fileName, mimeType, fileSize);

    reply.status(200).send({
      success: true,
      data: result,
      message: 'Upload URL generated. PUT your file to uploadUrl.',
    });
  };
}
