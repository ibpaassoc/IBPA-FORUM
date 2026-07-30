export class ApprovedCategoriesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApprovedCategoriesError";
  }
}

export function normalizeApprovedCategories(
  approvedCategories: readonly string[],
  expertiseAreas: readonly string[],
) {
  const allowedCategories = new Set(expertiseAreas);

  return [...new Set(
    approvedCategories
      .map((category) => category.trim())
      .filter((category) => category.length > 0 && allowedCategories.has(category)),
  )];
}

export function requireApprovedCategories(
  approvedCategories: readonly string[],
  expertiseAreas: readonly string[],
) {
  const normalized = normalizeApprovedCategories(approvedCategories, expertiseAreas);

  if (normalized.length === 0) {
    throw new ApprovedCategoriesError("Выберите хотя бы одну одобренную категорию.");
  }

  return normalized;
}

export function getInitialApprovedCategories(expertiseAreas: readonly string[]) {
  return requireApprovedCategories(expertiseAreas, expertiseAreas);
}
