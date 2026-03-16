import dotenv from 'dotenv';
dotenv.config({ path: '../../../.env' });

import { Worker, Job } from 'bullmq';
import { prisma } from '../../lib/prisma';
import pino from 'pino';
import IORedis from 'ioredis';
import { CredentialsService } from '../../modules/credentials/credentials.service';

const logger = pino({ name: 'credential-worker' });
const QUEUE_NAME = 'credential-signing';

function createRedisConnection(): IORedis {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  return new IORedis(url, {
    tls: url.startsWith('rediss://') ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}

async function main() {
  await prisma.$connect();
  logger.info('Database connected for standalone worker');

  const service = new CredentialsService(prisma);

  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job<{ credentialId: string, idempotencyKey?: string }>) => {
      const { credentialId, idempotencyKey } = job.data;
      logger.info({ credentialId, jobId: job.id, idempotencyKey }, 'Processing credential signing');
      
      // Idempotency check added for hardening
      if (idempotencyKey) {
        const existing = await prisma.credential.findFirst({
           where: { nonce: idempotencyKey }
        });
        if (existing && existing.status === 'active' && existing.signature) {
          logger.info({ credentialId, idempotencyKey }, 'Credential already signed (idempotency key hit)');
          return existing.id;
        }
      }

      await service.signPendingCredential(credentialId);

      logger.info({ credentialId, jobId: job.id }, 'Credential signed successfully');
      return credentialId;
    },
    {
      connection: createRedisConnection() as any,
      concurrency: 5,
      limiter: { max: 100, duration: 1000 },
    },
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, 'Credential signing job failed');
  });

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Credential signing job completed');
  });

  logger.info('Credential signing worker started and waiting for jobs...');
}

// Graceful shutdown
async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down worker gracefully...');
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Worker unhandled rejection');
});

process.on('uncaughtException', (error) => {
  logger.fatal(error, 'Worker uncaught exception - exiting');
  process.exit(1);
});

main();
