import { z } from 'zod';

const envSchema = z.object({
  // Database — Supabase PostgreSQL
  DATABASE_URL: z.string().min(1),

  // JWT
  JWT_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),

  // Upstash Redis
  REDIS_URL: z.string().min(1).optional().default('redis://localhost:6379'),

  // Server
  PORT: z.coerce.number().positive().default(8001),
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),

  // Sentry
  SENTRY_DSN: z.string().url().optional(),

  // CORS
  CORS_ORIGIN: z.string().optional(),

  // Supabase
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_KEY: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_JWT_SECRET: z.string().min(16),
  SUPABASE_STORAGE_BUCKET: z.string().optional().default('educhain-files'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  // Resend (transactional email)
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional().default('noreply@educhain.dev'),

  // Database pool
  DATABASE_POOL_SIZE: z.coerce.number().positive().default(25),
  DATABASE_POOL_TIMEOUT: z.coerce.number().positive().default(10),

  // Retention
  AUDIT_LOG_RETENTION_DAYS: z.coerce.number().positive().default(365),
  NOTIFICATION_ARCHIVE_DAYS: z.coerce.number().positive().default(90),

  // Ops: internal endpoints
  ADMIN_API_KEY: z.string().min(16).optional(),
  METRICS_API_KEY: z.string().min(16).optional(),
});

function loadEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.format();
    throw new Error(`❌ Invalid environment variables:\n${JSON.stringify(formatted, null, 2)}`);
  }

  return result.data;
}

export const env = loadEnv();
