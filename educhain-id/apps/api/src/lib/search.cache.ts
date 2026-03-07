import Redis from 'ioredis';
import crypto from 'crypto';
import pino from 'pino';

const logger = pino({ name: 'search-cache' });

const CACHE_PREFIX = 'search:students:';
const DEFAULT_TTL = 300; // 5 minutes

let client: Redis | null = null;

/**
 * Get or create the Redis client singleton (ioredis — Upstash compatible).
 * Returns null if Redis is unavailable (graceful degradation).
 */
export function getRedisClient(): Redis | null {
  if (client) return client;

  const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

  try {
    client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) return null; // stop retrying
        return Math.min(times * 200, 2000);
      },
      tls: redisUrl.startsWith('rediss://') ? {} : undefined,
    });

    client.on('error', (err) => {
      logger.warn({ error: err.message }, 'Redis client error — cache degraded');
    });

    client.on('connect', () => {
      logger.info('Redis cache connected');
    });

    return client;
  } catch {
    logger.warn('Redis unavailable — search cache disabled');
    client = null;
    return null;
  }
}

/**
 * Produce a deterministic hash for a set of search params to use as cache key.
 */
export function buildCacheKey(params: Record<string, unknown>): string {
  const sorted = JSON.stringify(params, Object.keys(params).sort());
  const hash = crypto.createHash('sha256').update(sorted).digest('hex').slice(0, 16);
  return `${CACHE_PREFIX}${hash}`;
}

/**
 * Get cached search result.
 */
export async function getCachedSearch(key: string): Promise<string | null> {
  const redis = getRedisClient();
  if (!redis) return null;
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
}

/**
 * Set search result in cache.
 */
export async function setCachedSearch(key: string, value: string, ttl = DEFAULT_TTL): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  try {
    await redis.set(key, value, 'EX', ttl);
  } catch {
    // non-fatal
  }
}

/**
 * Invalidate all search caches.
 * Called when student profiles, skills, or credentials change.
 */
export async function invalidateSearchCache(): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  try {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        'MATCH',
        `${CACHE_PREFIX}*`,
        'COUNT',
        100,
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info({ count: keys.length }, 'Search cache invalidated');
      }
    } while (cursor !== '0');
  } catch {
    // non-fatal
  }
}

/**
 * Disconnect Redis client. Called on graceful shutdown.
 */
export async function disconnectRedisCache(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
  }
}
