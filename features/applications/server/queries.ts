import { unstable_cache } from "next/cache";
import { categoryCatalog } from "@/features/applications/config/category-catalog";
import { syncApplicationCatalog } from "@/features/applications/server/catalog-sync";
import type { CategoryOption } from "@/features/applications/types/application.types";
import { prisma } from "@/shared/lib/prisma";

async function readApplicationCategoriesFromDb(): Promise<CategoryOption[]> {
  await syncApplicationCatalog();

  const categories = await prisma.category.findMany({
    where: {
      slug: {
        in: categoryCatalog.map((item) => item.slug),
      },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      awards: {
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  const order = new Map(categoryCatalog.map((item, index) => [item.slug, index]));
  const categoryDefinitionBySlug = new Map(
    categoryCatalog.map((item) => [item.slug, item])
  );

  return categories
    .sort((left, right) => {
      const leftOrder = order.get(left.slug) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = order.get(right.slug) ?? Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder;
    })
    .map((category) => {
      const categoryDefinition = categoryDefinitionBySlug.get(category.slug);
      const awardOrder = new Map(
        (categoryDefinition?.awards ?? []).map((award, index) => [award, index])
      );

      return {
        id: category.id,
        slug: category.slug,
        name: category.name,
        awards: category.awards
          .filter((award) => awardOrder.has(award.name))
          .sort((left, right) => {
            const leftOrder = awardOrder.get(left.name) ?? Number.MAX_SAFE_INTEGER;
            const rightOrder = awardOrder.get(right.name) ?? Number.MAX_SAFE_INTEGER;
            return leftOrder - rightOrder;
          })
          .map((award) => ({
            id: award.id,
            name: award.name,
          })),
      };
    });
}

const getCachedApplicationCategories = unstable_cache(
  async () => readApplicationCategoriesFromDb(),
  ["application-categories"],
  {
    revalidate: 60 * 60 * 6,
  }
);

export async function getApplicationCategories(): Promise<CategoryOption[]> {
  return getCachedApplicationCategories();
}
