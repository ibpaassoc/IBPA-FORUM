import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hair = await prisma.category.create({
    data: {
      name: "Hair",
      slug: "hair",
    },
  });

  const nail = await prisma.category.create({
    data: {
      name: "Nail",
      slug: "nail",
    },
  });

  await prisma.award.createMany({
    data: [
      { name: "Best Hair Restoration", categoryId: hair.id },
      { name: "Best Hair Color Transformation", categoryId: hair.id },
      { name: "Best Nail Extension", categoryId: nail.id },
      { name: "Best Nail Design", categoryId: nail.id },
    ],
  });
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
