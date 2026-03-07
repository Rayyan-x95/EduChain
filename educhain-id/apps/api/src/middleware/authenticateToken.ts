import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { cacheGet, cacheSet } from '../lib/cache';
import type { TokenPayload, UserRole } from '@educhain/types';

declare module 'fastify' {
  interface FastifyRequest {
    user?: TokenPayload;
  }
}

const AUTH_CACHE_TTL = 120; // 2 minutes — short enough for role changes to propagate

/**
 * Authenticate a Supabase-issued JWT.
 *
 * Flow:
 *  1. Extract Bearer token from Authorization header
 *  2. Verify with SUPABASE_JWT_SECRET
 *  3. Extract `sub` (Supabase user ID) and `email`
 *  4. Look up the application user by email (cached) to get the role
 *  5. Attach `request.user` with { userId, email, role }
 */
export async function authenticateToken(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    reply.status(401).send({ success: false, error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET) as {
      sub: string;
      email?: string;
      role?: string;
      [key: string]: unknown;
    };

    const email = decoded.email;
    if (!email) {
      reply.status(401).send({ success: false, error: 'Token missing email claim' });
      return;
    }

    // Try cache first to avoid DB round-trip on every request
    const cacheKey = `auth:user:${email}`;
    const cached = await cacheGet<{ id: string; email: string; role: string }>(cacheKey);

    if (cached) {
      request.user = {
        userId: cached.id,
        email: cached.email,
        role: cached.role as UserRole,
      };
      return;
    }

    // Cache miss — look up application user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      reply.status(401).send({ success: false, error: 'User not found — please complete registration' });
      return;
    }

    // Cache the user identity for subsequent requests
    await cacheSet(cacheKey, { id: user.id, email: user.email, role: user.role }, AUTH_CACHE_TTL);

    request.user = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    };
  } catch {
    reply.status(401).send({ success: false, error: 'Invalid or expired access token' });
  }
}
