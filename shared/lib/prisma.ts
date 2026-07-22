import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { normalizeSslMode } from "@/shared/lib/db-url";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new Pool({
  connectionString: normalizeSslMode(process.env.DATABASE_URL),
});

const adapter = new PrismaPg(
  pool,
  process.env.DATABASE_SCHEMA ? { schema: process.env.DATABASE_SCHEMA } : undefined
);

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
