// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return databaseUrl;

  try {
    const url = new URL(databaseUrl);
    if (url.hostname.includes("pooler") && url.port === "5432") {
      url.port = "6543";
      url.searchParams.set("pgbouncer", "true");
      url.searchParams.set("connection_limit", "1");
      return url.toString();
    }
  } catch {
    return databaseUrl;
  }

  return databaseUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: getDatabaseUrl(),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;