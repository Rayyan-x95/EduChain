import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { email, password } = request.body as { email: string; password: string };
    const result = await this.authService.register(email, password);

    reply.status(201).send({
      success: true,
      data: {
        user_id: result.userId,
        token: result.accessToken,
      },
    });
  };

  login = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { email, password } = request.body as { email: string; password: string };
    const tokens = await this.authService.login(email, password);

    reply.status(200).send({
      success: true,
      data: {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      },
    });
  };

  /**
   * POST /auth/sync — called after Supabase Google OAuth.
   * The request is already authenticated via Supabase JWT (authenticateToken middleware).
   * Ensures the user record exists in our DB and returns their role.
   */
  syncUser = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const email = request.user!.email;
    const result = await this.authService.syncUser(email);

    reply.status(200).send({
      success: true,
      data: {
        user_id: result.userId,
        email: result.email,
        role: result.role,
        is_new: result.isNew,
      },
    });
  };

  assignRole = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { userId } = request.params as { userId: string };
    const { role } = request.body as { role: string };
    const result = await this.authService.assignRole(userId, role);

    reply.status(200).send({
      success: true,
      data: result,
      message: `Role updated to ${result.role}`,
    });
  };

  refresh = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { refreshToken } = request.body as { refreshToken: string };
    const result = await this.authService.refresh(refreshToken);

    reply.status(200).send({
      success: true,
      data: {
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
      },
    });
  };

  logout = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.user?.userId;
    if (!userId) {
      reply.status(401).send({ success: false, error: 'Authentication required' });
      return;
    }

    await this.authService.logout(userId);

    reply.status(200).send({ success: true });
  };

  verifyEmail = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { token } = request.body as { token: string };
    const result = await this.authService.verifyEmail(token);
    reply.status(200).send({ success: true, data: result });
  };

  forgotPassword = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { email } = request.body as { email: string };
    await this.authService.forgotPassword(email);
    // Always return success to prevent email enumeration
    reply.status(200).send({ success: true, message: 'If the email exists, a reset link has been sent.' });
  };

  resetPassword = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { token, password } = request.body as { token: string; password: string };
    await this.authService.resetPassword(token, password);
    reply.status(200).send({ success: true, message: 'Password reset successfully.' });
  };
}
