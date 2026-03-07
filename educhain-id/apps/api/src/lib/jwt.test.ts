import jwt from 'jsonwebtoken';

// For unit testing we set env vars directly before importing
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-jwt-secret-at-least-16-chars';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-16c';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.PORT = '3000';
process.env.SUPABASE_JWT_SECRET = 'test-supabase-jwt-secret-16ch';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';

import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from './jwt';
import type { TokenPayload } from '@educhain/types';

describe('JWT utilities', () => {
  const payload: TokenPayload = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    role: 'student',
  };

  describe('Access Token', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should verify a valid access token', () => {
      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should reject a token signed with wrong secret', () => {
      const badToken = jwt.sign(payload, 'wrong-secret');
      expect(() => verifyAccessToken(badToken)).toThrow();
    });
  });

  describe('Refresh Token', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(payload);
      const decoded = verifyRefreshToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should reject access token when verified as refresh token', () => {
      const accessToken = generateAccessToken(payload);
      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
  });
});
