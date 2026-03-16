import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import crypto from 'crypto';

import { authRoutes } from './modules/auth/auth.routes';
import { studentsRoutes } from './modules/students/students.routes';
import { skillsRoutes } from './modules/skills/skills.routes';
import { projectsRoutes } from './modules/projects/projects.routes';
import { achievementsRoutes } from './modules/achievements/achievements.routes';
import { verificationsRoutes } from './modules/verifications/verifications.routes';
import { credentialsRoutes } from './modules/credentials/credentials.routes';
import { auditRoutes } from './modules/audit/audit.routes';
import { uploadsRoutes } from './modules/uploads/uploads.routes';
import { searchRoutes } from './modules/search/search.routes';
import { collaborationRoutes } from './modules/collaboration/collaboration.routes';
import { notificationsRoutes } from './modules/notifications/notifications.routes';
import { recruitersRoutes } from './modules/recruiters/recruiters.routes';
import { identityRoutes } from './modules/identity/identity.routes';
import { gdprRoutes } from './modules/gdpr/gdpr.routes';
import { skillProofsRoutes } from './modules/skill-proofs/skill-proofs.routes';
import { relationshipsRoutes } from './modules/relationships/relationships.routes';
import { talentRankingRoutes } from './modules/talent-ranking/talent-ranking.routes';
import { verifyRoutes } from './modules/verify/verify.routes';
import { errorHandler } from './middleware/errorHandler';
import { registerRateLimiter, RATE_LIMITS } from './middleware/rateLimiter';
import { csrfProtection } from './middleware/csrfProtection';
import { metricsHook, getMetrics, getPrometheusMetrics } from './lib/metrics';
import { captureException } from './lib/sentry';
import { buildPlatformDIDDocument } from './lib/did';
import { prisma } from './lib/prisma';
import { runAllMaintenance } from './lib/maintenance';
import { env } from './config/env';

const startedAt = Date.now();

const app = Fastify({
  logger: {
    name: 'educhain-api',
    level: process.env.LOG_LEVEL ?? 'info',
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
          requestId: request.id,
          remoteAddress: request.ip,
        };
      },
      res(reply) {
        return {
          statusCode: reply.statusCode,
        };
      },
    },
  },
  trustProxy: true,
  genReqId: (req) => (req.headers['x-request-id'] as string) ?? crypto.randomUUID(),
  bodyLimit: 10240, // 10 KB
});

// ---------------------------------------------------------------------------
// Plugins
// ---------------------------------------------------------------------------
export async function buildApp() {
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  });
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : process.env.NODE_ENV === 'production'
        ? ['https://educhain.com']
        : true,
    credentials: true,
  });
  await registerRateLimiter(app);

  // ---------------------------------------------------------------------------
  // CSRF Origin validation (defense-in-depth for production)
  // ---------------------------------------------------------------------------
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['https://educhain.com'];
  app.addHook('onRequest', csrfProtection(allowedOrigins));

  // ---------------------------------------------------------------------------
  // Metrics hook
  // ---------------------------------------------------------------------------
  app.addHook('onResponse', metricsHook);

  // ---------------------------------------------------------------------------
  // Request ID propagation — include in every response for tracing
  // ---------------------------------------------------------------------------
  app.addHook('onSend', async (request, reply) => {
    reply.header('x-request-id', request.id);
  });

  // ---------------------------------------------------------------------------
  // Error handler (with Sentry capture)
  // ---------------------------------------------------------------------------
  app.setErrorHandler((error, request, reply) => {
    captureException(error as Error, {
      userId: request.user?.userId,
      endpoint: `${request.method} ${request.url}`,
    });
    errorHandler(error as Error, request, reply);
  });

  // ---------------------------------------------------------------------------
  // Health check
  // ---------------------------------------------------------------------------
  app.get('/api/v1/health', async (_request, reply) => {
    let dbStatus: 'connected' | 'disconnected' = 'disconnected';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'disconnected';
    }

    const status = dbStatus === 'connected' ? 200 : 503;
    reply.status(status).send({
      success: dbStatus === 'connected',
      data: {
        status: dbStatus === 'connected' ? 'OK' : 'DEGRADED',
        database: dbStatus,
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - startedAt) / 1000),
        version: process.env.npm_package_version ?? '0.1.0',
      },
    });
  });

  // ---------------------------------------------------------------------------
  // Internal metrics endpoint
  // ---------------------------------------------------------------------------
  app.get('/metrics', async (request, reply) => {
    // In production, require an API key to prevent leaking internal metrics.
    if (env.NODE_ENV === 'production' && env.METRICS_API_KEY) {
      const key = request.headers['x-metrics-key'];
      if (key !== env.METRICS_API_KEY) {
        return reply.status(403).send({ success: false, error: { message: 'Forbidden', code: 'FORBIDDEN' } });
      }
    }

    const accept = request.headers.accept ?? '';
    if (accept.includes('text/plain') || accept.includes('text/plain; version=0.0.4')) {
      reply.header('content-type', 'text/plain; version=0.0.4; charset=utf-8');
      return reply.status(200).send(getPrometheusMetrics());
    }
    reply.status(200).send(getMetrics());
  });

  // ---------------------------------------------------------------------------
  // Maintenance endpoint (admin/cron only)
  // ---------------------------------------------------------------------------
  app.post('/api/v1/admin/maintenance', async (request, reply) => {
    const authHeader = request.headers['x-admin-key'];
    if (!env.ADMIN_API_KEY || authHeader !== env.ADMIN_API_KEY) {
      return reply.status(403).send({ success: false, error: { message: 'Forbidden', code: 'FORBIDDEN' } });
    }
    const results = await runAllMaintenance(prisma);
    reply.status(200).send({ success: true, data: results });
  });

  // ---------------------------------------------------------------------------
  // DID Document (.well-known endpoint for did:web resolution)
  // ---------------------------------------------------------------------------
  app.get('/.well-known/did.json', async (_request, reply) => {
    const baseUrl = process.env.BASE_URL ?? 'https://educhain.com';
    const didDoc = buildPlatformDIDDocument(baseUrl);
    reply
      .header('content-type', 'application/did+json')
      .header('cache-control', 'public, max-age=3600')
      .status(200)
      .send(didDoc);
  });

  // ---------------------------------------------------------------------------
  // API routes
  // ---------------------------------------------------------------------------
  await app.register(authRoutes, {
    prefix: '/api/v1/auth',
    config: { rateLimit: RATE_LIMITS.auth },
  });
  await app.register(studentsRoutes, { prefix: '/api/v1/students' });
  await app.register(skillsRoutes, { prefix: '/api/v1/skills' });
  await app.register(projectsRoutes, { prefix: '/api/v1/projects' });
  await app.register(achievementsRoutes, { prefix: '/api/v1/achievements' });
  await app.register(verificationsRoutes, { prefix: '/api/v1/verifications' });
  await app.register(credentialsRoutes, {
    prefix: '/api/v1/credentials',
    config: { rateLimit: RATE_LIMITS.credentialVerify },
  });
  await app.register(auditRoutes, { prefix: '/api/v1/audit' });
  await app.register(uploadsRoutes, { prefix: '/api/v1/uploads' });
  await app.register(searchRoutes, { prefix: '/api/v1/search' });
  await app.register(collaborationRoutes, { prefix: '/api/v1' });
  await app.register(notificationsRoutes, { prefix: '/api/v1/notifications' });
  await app.register(recruitersRoutes, { prefix: '/api/v1/recruiters' });
  await app.register(identityRoutes, { prefix: '/api/v1/identity' });
  await app.register(gdprRoutes, { prefix: '/api/v1/gdpr' });
  await app.register(skillProofsRoutes, { prefix: '/api/v1/skill-proofs' });
  await app.register(relationshipsRoutes, { prefix: '/api/v1/relationships' });
  await app.register(talentRankingRoutes, { prefix: '/api/v1/talent-search' });
  await app.register(verifyRoutes, { prefix: '/api/v1/verify' });

  return app;
}

export { app };
