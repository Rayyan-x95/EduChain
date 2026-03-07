// Set env vars before any imports that trigger env validation
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-jwt-secret-at-least-16-chars';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-16c';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.PORT = '3000';
process.env.SUPABASE_JWT_SECRET = 'test-supabase-jwt-secret-16ch';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';

import { AuthService } from './auth.service';
import { AppError } from '../../middleware/errorHandler';

// ---------- mocks ----------
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: 'hashed-password',
  role: 'student' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
} as any;

jest.mock('../../lib/password', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
  verifyPassword: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../lib/jwt', () => ({
  generateAccessToken: jest.fn().mockReturnValue('access-token'),
  generateRefreshToken: jest.fn().mockReturnValue('refresh-token'),
  verifyRefreshToken: jest.fn().mockReturnValue({
    userId: 'user-1',
    email: 'test@example.com',
    role: 'student',
  }),
}));

import { verifyPassword } from '../../lib/password';
import { verifyRefreshToken } from '../../lib/jwt';

// ---------- suite ----------
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(mockPrisma);
  });

  // ---- register ----
  describe('register', () => {
    it('creates a new user and returns userId + accessToken', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register('test@example.com', 'P@ssw0rd');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result).toEqual({ userId: 'user-1', accessToken: 'access-token' });
    });

    it('throws 409 when email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register('test@example.com', 'P@ssw0rd')).rejects.toThrow(AppError);
      await expect(service.register('test@example.com', 'P@ssw0rd')).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  // ---- login ----
  describe('login', () => {
    it('returns access + refresh tokens on valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login('test@example.com', 'P@ssw0rd');

      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
      expect(mockPrisma.refreshToken.create).toHaveBeenCalled();
    });

    it('throws 401 when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login('nope@example.com', 'P@ssw0rd')).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('throws 401 when password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (verifyPassword as jest.Mock).mockResolvedValueOnce(false);

      await expect(service.login('test@example.com', 'wrong')).rejects.toMatchObject({
        statusCode: 401,
      });
    });
  });

  // ---- syncUser ----
  describe('syncUser', () => {
    it('returns existing user without creating', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.syncUser('test@example.com');

      expect(result).toMatchObject({ userId: 'user-1', isNew: false });
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('creates new user when not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await service.syncUser('test@example.com');

      expect(result).toMatchObject({ userId: 'user-1', isNew: true });
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });
  });

  // ---- refresh ----
  describe('refresh', () => {
    it('rotates tokens and returns new pair', async () => {
      const storedToken = {
        id: 'rt-1',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 86400000),
      };

      mockPrisma.refreshToken.findUnique.mockResolvedValue(storedToken);
      mockPrisma.refreshToken.delete.mockResolvedValue({});
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.refresh('valid-refresh-token');

      expect(mockPrisma.refreshToken.delete).toHaveBeenCalledWith({ where: { id: 'rt-1' } });
      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    });

    it('throws 401 when refresh token is invalid', async () => {
      (verifyRefreshToken as jest.Mock).mockImplementationOnce(() => {
        throw new Error('expired');
      });

      await expect(service.refresh('expired-token')).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('throws 401 and revokes all tokens when stored token is expired', async () => {
      const expiredToken = {
        id: 'rt-1',
        userId: 'user-1',
        expiresAt: new Date(Date.now() - 86400000),
      };

      mockPrisma.refreshToken.findUnique.mockResolvedValue(expiredToken);

      await expect(service.refresh('stale-token')).rejects.toMatchObject({ statusCode: 401 });
      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });
  });

  // ---- logout ----
  describe('logout', () => {
    it('deletes all refresh tokens for the user', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 2 });

      await service.logout('user-1');

      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });
  });
});
