import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { categoryCatalog } from "@/lib/apply/catalog";
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
  await prisma.promoCode.upsert({
    where: { key: "APPLICATION20" },
    update: {
      paymentFlow: "APPLICATIONS",
      discountPercent: 20,
    },
    create: {
      key: "APPLICATION20",
      keyword: "APPLICATION20",
      paymentFlow: "APPLICATIONS",
      discountPercent: 20,
      enabled: true,
    },
  });

  await prisma.promoCode.upsert({
    where: { key: "TICKETS30" },
    update: {
      paymentFlow: "TICKETS",
      discountPercent: 30,
    },
    create: {
      key: "TICKETS30",
      keyword: "TICKETS30",
      paymentFlow: "TICKETS",
      discountPercent: 30,
      enabled: true,
    },
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
