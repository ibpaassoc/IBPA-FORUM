import { categoryCatalog } from "@/features/applications/config/category-catalog";
import { prisma } from "@/shared/lib/prisma";

/**
 * SEED ONLY — do NOT call from request/runtime code paths.
 *
 * Bootstraps the categories and awards defined in the static `categoryCatalog`
 * into the database. It is purely additive: it upserts each category by slug
 * and creates any awards that are missing, but it NEVER deletes, renames, or
 * otherwise overrides Award rows that already exist in the DB.
 *
 * At runtime the database is the source of truth (see getApplicationCategories),
 * so awards added directly to the DB are preserved and surfaced automatically.
 */
export async function syncApplicationCatalog() {
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
