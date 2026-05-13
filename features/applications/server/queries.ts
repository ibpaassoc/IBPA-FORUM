import { unstable_cache } from "next/cache";
import { categoryCatalog } from "@/features/applications/config/category-catalog";
import type { CategoryOption } from "@/features/applications/types/application.types";
import { prisma } from "@/shared/lib/prisma";

async function readApplicationCategoriesFromDb(): Promise<CategoryOption[]> {
  const categories = await prisma.category.findMany({
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
          name: "asc",
        },
      },
    },
  });

  const order = new Map(categoryCatalog.map((item, index) => [item.slug, index]));

  return categories
    .sort((left, right) => {
      const leftOrder = order.get(left.slug) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = order.get(right.slug) ?? Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder;
    })
    .map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      awards: category.awards.map((award) => ({
        id: award.id,
        name: award.name,
      })),
    }));
}

const getCachedApplicationCategories = unstable_cache(
  async () => readApplicationCategoriesFromDb(),
  ["application-directions"],
  {
    revalidate: 60 * 60 * 6,
  }
);

export async function getApplicationCategories(): Promise<CategoryOption[]> {
  return getCachedApplicationCategories();
}
