import "dotenv/config";
import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { categoryCatalog } from "@/lib/apply/catalog";
import { PROMO_DEFINITIONS } from "@/features/promos/lib/promo-codes";
import { normalizeSslMode } from "@/shared/lib/db-url";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const pool = new Pool({
  connectionString: normalizeSslMode(connectionString),
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const now = new Date().toISOString();
  const codes = Object.values(PROMO_DEFINITIONS).map((definition) => ({
    id: crypto.randomUUID(),
    key: definition.key,
    keyword: definition.defaultKeyword,
    paymentFlow: definition.paymentFlow,
    discountPercent: definition.discountPercent,
    enabled: true,
    createdAt: now,
    updatedAt: now,
  }));
  await prisma.siteSetting.upsert({
    where: { key: "promocodes" },
    create: { key: "promocodes", value: { schemaVersion: 1, updatedAt: now, codes } as Prisma.InputJsonValue },
    update: { value: { schemaVersion: 1, updatedAt: now, codes } as Prisma.InputJsonValue },
  });

  for (const definition of categoryCatalog) {
    const category = await prisma.category.upsert({
      where: {
        slug: definition.slug,
      },
      update: {
        name: definition.name,
      },
      create: {
        name: definition.name,
        slug: definition.slug,
      },
    });

    const existingAwards = await prisma.award.findMany({
      where: {
        categoryId: category.id,
      },
      select: {
        name: true,
      },
    });

    const existingNames = new Set(existingAwards.map((award) => award.name));
    const missingAwards = definition.awards.filter(
      (awardName) => !existingNames.has(awardName)
    );

    if (missingAwards.length > 0) {
      await prisma.award.createMany({
        data: missingAwards.map((awardName) => ({
          name: awardName,
          categoryId: category.id,
        })),
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
