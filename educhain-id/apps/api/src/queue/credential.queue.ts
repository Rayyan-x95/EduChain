import { Queue, Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { CredentialsService } from '../modules/credentials/credentials.service';
import { incrementQueueJobs } from '../lib/metrics';
import pino from 'pino';
import IORedis from 'ioredis';

const logger = pino({ name: 'credential-queue' });

const QUEUE_NAME = 'credential-signing';

// Build ioredis connection for BullMQ (Upstash compatible)
function createRedisConnection(): IORedis {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  return new IORedis(url, {
    tls: url.startsWith('rediss://') ? {} : undefined,
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false,
  });
}

export const credentialSigningQueue = new Queue(QUEUE_NAME, {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

/**
 * Enqueue a credential for async signing.
 */
export async function enqueueCredentialSigning(credentialId: string): Promise<void> {
  await credentialSigningQueue.add('sign', { credentialId }, {
    jobId: `sign-${credentialId}`,
  });
  logger.info({ credentialId }, 'Enqueued credential for signing');
}

/**
 * Start the worker that processes credential signing jobs.
 * Call this from server.ts after the app starts.
 */
export function startCredentialSigningWorker(prisma: PrismaClient): Worker {
  const service = new CredentialsService(prisma);

  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job<{ credentialId: string }>) => {
      const { credentialId } = job.data;
      logger.info({ credentialId, jobId: job.id }, 'Processing credential signing');

      await service.signPendingCredential(credentialId);

      logger.info({ credentialId, jobId: job.id }, 'Credential signed successfully');
    },
    {
      connection: createRedisConnection(),
      concurrency: 5,
    },
  );

  worker.on('failed', (job, err) => {
    incrementQueueJobs('failed');
    logger.error({ jobId: job?.id, error: err.message }, 'Credential signing job failed');
  });

  worker.on('completed', (job) => {
    incrementQueueJobs('processed');
    logger.info({ jobId: job.id }, 'Credential signing job completed');
  });

  return worker;
}
