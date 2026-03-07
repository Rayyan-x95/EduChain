import { getRedisClient } from './search.cache';
import pino from 'pino';

const logger = pino({ name: 'cache' });

const DEFAULT_TTL = 300; // 5 minutes

/**
 * Get a cached value by key. Returns null on miss or error.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    if (!client) return null;
    const raw = await client.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    logger.warn({ key, error: (err as Error).message }, 'Cache get error');
    return null;
  }
}

/**
 * Set a value in cache with a TTL in seconds.
 */
export async function cacheSet(key: string, value: unknown, ttl = DEFAULT_TTL): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;
    await client.set(key, JSON.stringify(value), 'EX', ttl);
  } catch (err) {
    logger.warn({ key, error: (err as Error).message }, 'Cache set error');
  }
}

/**
 * Invalidate a cache key.
 */
export async function cacheDelete(key: string): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;
    await client.del(key);
  } catch (err) {
    logger.warn({ key, error: (err as Error).message }, 'Cache delete error');
  }
}

/**
 * Invalidate all keys matching a prefix.
 */
export async function cacheDeleteByPrefix(prefix: string): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;
    let cursor = '0';
    do {
      const [nextCursor, keys] = await client.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } while (cursor !== '0');
  } catch (err) {
    logger.warn({ prefix, error: (err as Error).message }, 'Cache prefix delete error');
  }
}
