import type { CategoryOption } from "@/features/applications/types/application.types";
import { prisma } from "@/shared/lib/prisma";

/**
 * Reads the full category + award catalog straight from the database.
 *
 * The database is the single source of truth: any Award row added to a
 * category (including rows created manually in the DB) shows up here
 * automatically, with no code change or redeploy. Nothing is reconciled
 * against, filtered by, or overridden with the static seed catalog.
 *
 * Categories and their awards are ordered by `createdAt` so the ordering is
 * stable and driven by the DB. This is intentionally uncached; callers that
 * expose it (API routes / the apply page) run dynamically so newly added
 * nominations appear immediately in production.
 */
export async function getApplicationCategories(): Promise<CategoryOption[]> {
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
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    awards: category.awards.map((award) => ({
      id: award.id,
      name: award.name,
    })),
  }));
}
