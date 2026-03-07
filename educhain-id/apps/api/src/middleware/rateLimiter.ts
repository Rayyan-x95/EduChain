import type { FastifyInstance } from 'fastify';
import Redis from 'ioredis';

/**
 * Build the Redis store for @fastify/rate-limit.
 * Falls back to the default in-memory store when REDIS_URL is unset.
 */
function buildRedisStore(): Redis | undefined {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return undefined;

  return new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 5) return null;
      return Math.min(times * 200, 2000);
    },
    tls: redisUrl.startsWith('rediss://') ? {} : undefined,
  });
}

const rateLimitError = () => ({
  success: false,
  error: 'Too many requests, please try again later',
});

/**
 * Route-specific rate limit configs used by per-route overrides.
 */
export const RATE_LIMITS = {
  /** General API — 100 req/min */
  general: { max: 100, timeWindow: 60_000 },
  /** Auth routes — 20 req/min (brute-force protection) */
  auth: { max: 20, timeWindow: 60_000 },
  /** Credential verification endpoint — 200 req/min */
  credentialVerify: { max: 200, timeWindow: 60_000 },
} as const;

/**
 * Register @fastify/rate-limit as a Fastify plugin with Redis-backed store.
 * Call once in `buildApp()` — replaces the old in-memory middleware.
 */
export async function registerRateLimiter(app: FastifyInstance): Promise<void> {
  const rateLimit = (await import('@fastify/rate-limit')).default;

  await app.register(rateLimit, {
    global: true,
    max: RATE_LIMITS.general.max,
    timeWindow: RATE_LIMITS.general.timeWindow,
    redis: buildRedisStore(),
    keyGenerator: (request) => request.user?.userId ?? request.ip ?? 'unknown',
    errorResponseBuilder: rateLimitError,
  });
}
