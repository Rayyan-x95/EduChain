import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import type { UserRole } from '@educhain/types';

/**
 * Like authenticateToken, but doesn't reject requests without a token.
 * Attaches request.user if a valid Supabase JWT is provided, otherwise proceeds without it.
 */
export async function optionalAuth(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET) as {
        sub: string;
        email?: string;
        [key: string]: unknown;
      };

      if (decoded.email) {
        const user = await prisma.user.findUnique({ where: { email: decoded.email } });
        if (user) {
          request.user = {
            userId: user.id,
            email: user.email,
            role: user.role as UserRole,
          };
        }
      }
    } catch {
      // Invalid token is silently ignored for optional auth
    }
  }
}
