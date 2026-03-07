import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function buildDatasourceUrl(): string {
  const base = process.env.DATABASE_URL ?? '';
  const poolSize = process.env.DATABASE_POOL_SIZE ?? '25';
  const poolTimeout = process.env.DATABASE_POOL_TIMEOUT ?? '10';
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}connection_limit=${poolSize}&pool_timeout=${poolTimeout}`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasourceUrl: buildDatasourceUrl(),
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
