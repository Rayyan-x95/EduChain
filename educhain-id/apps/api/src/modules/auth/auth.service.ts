import { PrismaClient, UserRole as PrismaUserRole } from '@prisma/client';
import { hashPassword, verifyPassword } from '../../lib/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../lib/jwt';
import { AppError } from '../../middleware/errorHandler';
import { sendEmail } from '../../lib/email';
import type { TokenPayload, AuthTokens, UserRole } from '@educhain/types';
import crypto from 'crypto';

export class AuthService {
  constructor(private readonly prisma: PrismaClient) {}

  /** Roles that can only be assigned by platform admins */
  private static readonly ADMIN_ROLES: string[] = ['institution_admin', 'recruiter', 'platform_admin'];

  async register(
    email: string,
    password: string,
  ): Promise<{ userId: string; accessToken: string }> {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new AppError(409, 'Email already registered');
    }

    const passwordHash = await hashPassword(password);

    // Public registration always creates student accounts
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'student' as PrismaUserRole,
      },
    });

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    };

    const accessToken = generateAccessToken(payload);

    return { userId: user.id, accessToken };
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const valid = await verifyPassword(user.passwordHash, password);

    if (!valid) {
      throw new AppError(401, 'Invalid email or password');
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: this.hashToken(refreshToken),
        userId: user.id,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  /**
   * Supabase OAuth sync:
   * Called after Supabase handles Google OAuth on the frontend.
   * The request is authenticated via Supabase JWT (middleware verifies it).
   * This endpoint ensures the user exists in our database with the correct role.
   */
  async syncUser(email: string): Promise<{ userId: string; email: string; role: string; isNew: boolean }> {
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    let isNew = false;

    if (!user) {
      // OAuth sync always creates student accounts — privileged roles are admin-assigned only
      const randomHash = await hashPassword(crypto.randomUUID());

      user = await this.prisma.user.create({
        data: {
          email,
          passwordHash: randomHash,
          role: 'student' as PrismaUserRole,
        },
      });
      isNew = true;
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      isNew,
    };
  }

  /**
   * Admin-only: assign a role to a user.
   * Only platform_admin can call this.
   */
  async assignRole(userId: string, role: string): Promise<{ userId: string; role: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role: role as PrismaUserRole },
    });

    // Invalidate auth cache so the new role takes effect immediately
    const { cacheDelete } = await import('../../lib/cache');
    await cacheDelete(`auth:user:${updated.email}`);

    return { userId: updated.id, role: updated.role };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: TokenPayload;

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(401, 'Invalid or expired refresh token');
    }

    // Verify refresh token exists in database
    const hashedToken = this.hashToken(refreshToken);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: hashedToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        // Token reuse detected or expired — revoke all tokens for this user
        await this.prisma.refreshToken.deleteMany({ where: { userId: storedToken.userId } });
      }
      throw new AppError(401, 'Invalid or expired refresh token');
    }

    // Rotate: delete old token, issue new pair
    await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const newPayload: TokenPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    const accessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: this.hashToken(newRefreshToken),
        userId: payload.userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string): Promise<void> {
    // Revoke all refresh tokens for this user
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  // ---------------------------------------------------------------------------
  // Email verification
  // ---------------------------------------------------------------------------

  async sendEmailVerification(userId: string, email: string): Promise<void> {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = this.hashToken(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.$executeRaw`
      INSERT INTO email_verifications (id, user_id, token, expires_at)
      VALUES (gen_random_uuid(), ${userId}::uuid, ${hashedToken}, ${expiresAt})
      ON CONFLICT (user_id) DO UPDATE SET token = ${hashedToken}, expires_at = ${expiresAt}
    `;

    const verifyUrl = `${process.env.CORS_ORIGIN ?? 'http://localhost:3000'}/auth/verify-email?token=${token}`;

    await sendEmail({
      to: email,
      subject: 'EduChain — Verify Your Email',
      html: `
        <h2>Welcome to EduChain</h2>
        <p>Please verify your email by clicking the link below:</p>
        <p><a href="${verifyUrl}">Verify Email</a></p>
        <p>This link expires in 24 hours.</p>
        <br/><p>— The EduChain Team</p>
      `,
    });
  }

  async verifyEmail(token: string): Promise<{ verified: boolean }> {
    const hashedToken = this.hashToken(token);

    const rows = await this.prisma.$queryRaw<Array<{ user_id: string; expires_at: Date }>>`
      SELECT user_id, expires_at FROM email_verifications WHERE token = ${hashedToken}
    `;

    if (!rows || rows.length === 0) {
      throw new AppError(400, 'Invalid verification token');
    }

    if (new Date(rows[0].expires_at) < new Date()) {
      throw new AppError(400, 'Verification token has expired');
    }

    await this.prisma.$executeRaw`
      UPDATE users SET email_verified = true WHERE id = ${rows[0].user_id}::uuid
    `;

    await this.prisma.$executeRaw`
      DELETE FROM email_verifications WHERE user_id = ${rows[0].user_id}::uuid
    `;

    return { verified: true };
  }

  // ---------------------------------------------------------------------------
  // Forgot / Reset password
  // ---------------------------------------------------------------------------

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) return;

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = this.hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.$executeRaw`
      INSERT INTO password_resets (id, user_id, token, expires_at)
      VALUES (gen_random_uuid(), ${user.id}::uuid, ${hashedToken}, ${expiresAt})
      ON CONFLICT (user_id) DO UPDATE SET token = ${hashedToken}, expires_at = ${expiresAt}
    `;

    const resetUrl = `${process.env.CORS_ORIGIN ?? 'http://localhost:3000'}/auth/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: 'EduChain — Reset Your Password',
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>This link expires in 1 hour.</p>
        <br/><p>— The EduChain Team</p>
      `,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = this.hashToken(token);

    const rows = await this.prisma.$queryRaw<Array<{ user_id: string; expires_at: Date }>>`
      SELECT user_id, expires_at FROM password_resets WHERE token = ${hashedToken}
    `;

    if (!rows || rows.length === 0) {
      throw new AppError(400, 'Invalid or expired reset token');
    }

    if (new Date(rows[0].expires_at) < new Date()) {
      throw new AppError(400, 'Reset token has expired');
    }

    const passwordHash = await hashPassword(newPassword);

    await this.prisma.$executeRaw`
      UPDATE users SET password_hash = ${passwordHash} WHERE id = ${rows[0].user_id}::uuid
    `;

    // Clean up the reset token and revoke all refresh tokens
    await this.prisma.$executeRaw`
      DELETE FROM password_resets WHERE user_id = ${rows[0].user_id}::uuid
    `;
    await this.prisma.refreshToken.deleteMany({ where: { userId: rows[0].user_id } });

    // Clear Redis auth cache so old sessions are invalidated immediately
    const user = await this.prisma.user.findUnique({ where: { id: rows[0].user_id } });
    if (user) {
      const { cacheDelete } = await import('../../lib/cache');
      await cacheDelete(`auth:user:${user.email}`);
    }
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
