import pino from 'pino';
const logger = pino({ name: 'server' });
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import { initSentry } from './lib/sentry';
initSentry();

// env must be imported after dotenv.config()
import { env } from './config/env';
import { buildApp } from './app';
import { prisma } from './lib/prisma';


async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected');

    // Build Fastify app with plugins
    const app = await buildApp();

    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'EduChain API running');
  } catch (error) {
    logger.error(error, 'Failed to start server');
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down gracefully...');

  const { app } = await import('./app');
  await app.close();
  logger.info('HTTP server closed');

  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled rejection');
});

process.on('uncaughtException', (error) => {
  logger.fatal(error, 'Uncaught exception â€” exiting');
  process.exit(1);
});

main();

