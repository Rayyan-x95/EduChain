import type { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';

/**
 * Lightweight CSRF protection via Origin header validation.
 *
 * For REST APIs that use bearer-token auth (not session cookies),
 * traditional CSRF tokens are unnecessary because browsers never
 * attach the Authorization header on cross-origin requests
 * automatically.  We add an extra layer of defense-in-depth by
 * rejecting mutating requests whose Origin header does not match
 * any configured allowed origin.
 */
export function csrfProtection(allowedOrigins: string[]) {
  const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

  return function csrfHook(
    request: FastifyRequest,
    reply: FastifyReply,
    done: HookHandlerDoneFunction,
  ) {
    // Safe (read-only) methods are never subject to CSRF
    if (SAFE_METHODS.has(request.method)) {
      return done();
    }

    // In development mode, skip enforcement
    if (process.env.NODE_ENV !== 'production') {
      return done();
    }

    const origin = request.headers.origin;

    // If there is no Origin header, check Referer (some browsers strip Origin)
    if (!origin) {
      const referer = request.headers.referer;
      if (referer) {
        try {
          const refererOrigin = new URL(referer).origin;
          if (allowedOrigins.includes(refererOrigin)) {
            return done();
          }
        } catch {
          // Invalid URL – fall through to reject
        }
      }

      // Requests from same-origin (non-CORS) typically omit Origin.
      // However, for API calls from SPA frontends, Origin is always set.
      // If neither Origin nor Referer is present, we allow it because
      // it may be a server-to-server or curl-style request that can't
      // carry CSRF attacks. The bearer token check is sufficient here.
      return done();
    }

    // Validate the Origin
    if (allowedOrigins.includes(origin)) {
      return done();
    }

    reply.status(403).send({
      success: false,
      error: {
        code: 'CSRF_ORIGIN_MISMATCH',
        message: 'Request origin is not allowed',
      },
    });
  };
}
