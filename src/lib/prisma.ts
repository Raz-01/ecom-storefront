import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client. Next.js dev mode hot-reloads modules, which
 * would otherwise create a new PrismaClient (and a new DB connection) on
 * every edit — this caches the instance on `globalThis` in development.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
