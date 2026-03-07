import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { authenticateToken } from '../../middleware/authenticateToken';
import { authorizeRole } from '../../middleware/authorizeRole';
import { validateBody } from '../../middleware/validateBody';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  assignRoleSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@educhain/validators';
import { prisma } from '../../lib/prisma';

const authService = new AuthService(prisma);
const authController = new AuthController(authService);

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/register', { preHandler: [validateBody(registerSchema)] }, authController.register);
  fastify.post('/login', { preHandler: [validateBody(loginSchema)] }, authController.login);
  fastify.post('/sync', { preHandler: [authenticateToken] }, authController.syncUser);
  fastify.post('/refresh', { preHandler: [validateBody(refreshTokenSchema)] }, authController.refresh);
  fastify.post('/logout', { preHandler: [authenticateToken] }, authController.logout);

  // Email verification — strict rate limit: 5 per hour per IP
  fastify.post('/verify-email', {
    preHandler: [validateBody(verifyEmailSchema)],
    config: { rateLimit: { max: 5, timeWindow: 3_600_000 } },
  }, authController.verifyEmail);

  // Password reset flow — strict rate limit: 5 per hour per IP
  fastify.post('/forgot-password', {
    preHandler: [validateBody(forgotPasswordSchema)],
    config: { rateLimit: { max: 5, timeWindow: 3_600_000 } },
  }, authController.forgotPassword);
  fastify.post('/reset-password', { preHandler: [validateBody(resetPasswordSchema)] }, authController.resetPassword);

  // Admin-only role assignment
  fastify.put(
    '/admin/users/:userId/role',
    { preHandler: [authenticateToken, authorizeRole(['platform_admin']), validateBody(assignRoleSchema)] },
    authController.assignRole,
  );
}
