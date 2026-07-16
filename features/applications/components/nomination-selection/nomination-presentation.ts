import type { CategoryOption } from "@/features/applications/types/application.types";

export type NominationDirectionCopy = {
  slug: string;
  title: string;
  nominations: readonly string[];
};

export type PresentedNominationCategory = Omit<CategoryOption, "awards"> & {
  displayName: string;
  awards: Array<CategoryOption["awards"][number] & { displayName: string }>;
};

function normalizeLabel(value: string) {
  return value.trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ");
}

/**
 * Adds translated labels to the database catalog without changing its IDs,
 * ordering, or membership. English copy is only used to find the matching
 * translation; unknown database rows safely fall back to their stored names.
 */
export function presentNominationCategories(
  categories: CategoryOption[],
  canonicalDirections: readonly NominationDirectionCopy[],
  localizedDirections: readonly NominationDirectionCopy[],
): PresentedNominationCategory[] {
  const canonicalBySlug = new Map(canonicalDirections.map((direction) => [direction.slug, direction]));
  const localizedBySlug = new Map(localizedDirections.map((direction) => [direction.slug, direction]));

  return categories.map((category) => {
    const canonical = canonicalBySlug.get(category.slug);
    const localized = localizedBySlug.get(category.slug);

    return {
      ...category,
      displayName: localized?.title ?? category.name,
      awards: category.awards.map((award) => {
        const translatedIndex = canonical?.nominations.findIndex(
          (nomination) => normalizeLabel(nomination) === normalizeLabel(award.name),
        ) ?? -1;

        return {
          ...award,
          displayName:
            translatedIndex >= 0
              ? localized?.nominations[translatedIndex] ?? award.name
              : award.name,
        };
      }),
    };
  });
}
