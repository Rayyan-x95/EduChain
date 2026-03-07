import type { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';

/**
 * onSend hook that sets Cache-Control headers for public, CDN-cacheable responses.
 */
export function publicCacheControl(maxAge: number, staleWhileRevalidate = 60) {
  return function cacheHook(
    _request: FastifyRequest,
    reply: FastifyReply,
    _payload: unknown,
    done: HookHandlerDoneFunction,
  ) {
    if (reply.statusCode >= 200 && reply.statusCode < 300) {
      reply.header(
        'cache-control',
        `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
      );
    }
    done();
  };
}

/**
 * onSend hook that prevents any caching (for authenticated/private responses).
 */
export function noCacheControl(
  _request: FastifyRequest,
  reply: FastifyReply,
  _payload: unknown,
  done: HookHandlerDoneFunction,
) {
  reply.header('cache-control', 'no-store, no-cache, must-revalidate, private');
  done();
}
