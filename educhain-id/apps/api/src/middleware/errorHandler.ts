import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (error instanceof AppError) {
    request.log.warn({ err: error, statusCode: error.statusCode }, error.message);
    reply.status(error.statusCode).send({
      success: false,
      error: error.message,
    });
    return;
  }

  if (error instanceof ZodError) {
    const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    request.log.warn({ validationErrors: messages }, 'Validation failed');
    reply.status(400).send({
      success: false,
      error: 'Validation failed',
      details: messages,
    });
    return;
  }

  request.log.error(error, 'Unhandled error');

  reply.status(500).send({
    success: false,
    error: 'Internal server error',
  });
}
