export const SCORING_SCHEMA_VERSION = 1;

export const SCORING_CRITERION_KEYS = [
  "professionalQualification",
  "professionalAchievements",
  "portfolioQuality",
  "professionalDevelopment",
  "industryContribution",
  "professionalStandards",
  "ibpaLevelAlignment",
] as const;

export type ScoringCriterionKey = (typeof SCORING_CRITERION_KEYS)[number];

export type ScoringCriterion = {
  key: ScoringCriterionKey;
  label: string;
  description: string;
  maxScore: number;
};

export type NominationScoringDefinition = {
  version: typeof SCORING_SCHEMA_VERSION;
  categorySlug: string;
  categoryName: string;
  sourceDocument: string;
  maximumTotal: number;
  criteria: ScoringCriterion[];
};

export type ReviewScores = Record<ScoringCriterionKey, number | null>;

type CategoryScoringContext = {
  name: string;
  sourceDocument: string;
  practiceFocus: string;
  portfolioFocus: string;
  standardsFocus: string;
};

const CATEGORY_CONTEXTS: Record<string, CategoryScoringContext> = {
  hair: {
    name: "Hair",
    sourceDocument: "IBPA_Rules_01_Hair1.pdf",
    practiceFocus: "haircutting and barbering, hair restoration, color technique, and hair extensions",
    portfolioFocus: "cuts, styling, color, restoration, and extension work across relevant hair types and techniques",
    standardsFocus: "hair and scalp services, chemical processes, tools, and professional hair products",
  },
  nail: {
    name: "Nail",
    sourceDocument: "IBPA_Rules_02_Nail.pdf",
    practiceFocus: "manicure, nail extension, and podology",
    portfolioFocus: "manicure, extension, and podology results with consistent structure, finish, and client suitability",
    standardsFocus: "nail and podology services, tool sterilization, skin integrity, and professional products",
  },
  brow: {
    name: "Brow",
    sourceDocument: "IBPA_Rules_03_Brow.pdf",
    practiceFocus: "brow lamination, styling, shaping, and design",
    portfolioFocus: "brow lamination and styling results across different facial features, hair patterns, and design goals",
    standardsFocus: "brow services, skin safety, product use, hygiene, and responsible client consultation",
  },
  lash: {
    name: "Lash",
    sourceDocument: "IBPA_Rules_04_Lash.pdf",
    practiceFocus: "classic, volume, and creative lash extensions, plus lash lifting",
    portfolioFocus: "classic, volume, creative, and lift results showing isolation, direction, symmetry, and finish",
    standardsFocus: "eye-area services, adhesive and product safety, hygiene, and protection of natural lashes",
  },
  "makeup-artistry": {
    name: "Makeup Artistry",
    sourceDocument: "IBPA_Rules_05_Makeup_Artistry.pdf",
    practiceFocus: "bridal, creative, mature, and daytime makeup artistry",
    portfolioFocus: "bridal, creative, mature, and daytime looks across varied clients, briefs, and lighting conditions",
    standardsFocus: "makeup services, cosmetic hygiene, brush and product sanitation, skin preparation, and client safety",
  },
  "permanent-makeup": {
    name: "Permanent Makeup",
    sourceDocument: "IBPA_Rules_06_Permanent_Makeup.pdf",
    practiceFocus: "PMU brows, eyeliner, lips, camouflage, and correction",
    portfolioFocus: "healed and fresh PMU results for brows, eyeliner, lips, camouflage, and corrective work",
    standardsFocus: "invasive PMU procedures, infection control, pigment and device safety, consent, and aftercare",
  },
  education: {
    name: "Education",
    sourceDocument: "IBPA_Rules_07_Education.pdf",
    practiceFocus: "professional beauty training and online beauty education",
    portfolioFocus: "curricula, teaching demonstrations, student work, outcomes, and evidence from in-person or online programs",
    standardsFocus: "accurate instruction, student safety, ethical assessment, current curricula, and responsible educational claims",
  },
  salon: {
    name: "Salon",
    sourceDocument: "IBPA_Rules_08_Salon.pdf",
    practiceFocus: "beauty salon innovation and beauty business development",
    portfolioFocus: "salon operations, service delivery, team development, client experience, innovation, and business results",
    standardsFocus: "salon-wide hygiene, staff practice, client safety, ethical operations, and responsible business management",
  },
  brand: {
    name: "Brand",
    sourceDocument: "IBPA_Rules_09_Brand.pdf",
    practiceFocus: "professional beauty product development, beauty brand development, and innovation",
    portfolioFocus: "products, brand systems, market evidence, innovation, and consistent professional presentation",
    standardsFocus: "product safety, substantiated claims, ethical brand conduct, professional quality controls, and consumer responsibility",
  },
  "skin-cosmetology-facial": {
    name: "Skin Care, Cosmetology & Facial",
    sourceDocument: "IBPA_Rules_10_Skin_Care.pdf",
    practiceFocus: "non-invasive rejuvenation, anti-aging facial treatment, and acne treatment",
    portfolioFocus: "skin-care and facial treatment plans, before-and-after evidence, progress, and outcomes across skin concerns",
    standardsFocus: "skin assessment, contraindications, sanitation, device and product safety, informed consent, and aftercare",
  },
  "body-wellness-nutrition": {
    name: "Body, Wellness & Nutrition",
    sourceDocument: "IBPA_Rules_11_Body_Wellness.pdf",
    practiceFocus: "body transformation, sculpting massage, nutrition correction, and anti-cellulite treatment",
    portfolioFocus: "body and wellness programs, client progress, treatment or nutrition plans, and documented outcomes",
    standardsFocus: "body and wellness services, client screening, hygiene, scope of practice, safe techniques, and responsible claims",
  },
};

function buildDefinition(categorySlug: string, context: CategoryScoringContext): NominationScoringDefinition {
  const criteria: ScoringCriterion[] = [
    {
      key: "professionalQualification",
      label: "Professional qualification",
      description: `Overall mastery, experience, specialization, and professional competence in ${context.practiceFocus}, including fit with the entered nomination.`,
      maxScore: 20,
    },
    {
      key: "professionalAchievements",
      label: "Professional achievements and recognition",
      description: `Awards, championships, teaching, judging, publications, speaking, and other recognition relevant to ${context.name}.`,
      maxScore: 10,
    },
    {
      key: "portfolioQuality",
      label: "Portfolio and material quality",
      description: `Quality, consistency, range of techniques, aesthetics, and professional presentation across ${context.portfolioFocus}.`,
      maxScore: 10,
    },
    {
      key: "professionalDevelopment",
      label: "Professional activity and development",
      description: `Continuing education, new technologies, professional events, and sustained development in ${context.practiceFocus}.`,
      maxScore: 15,
    },
    {
      key: "industryContribution",
      label: "Contribution to industry development",
      description: `Original methods, education, community leadership, industry projects, and demonstrable influence advancing ${context.name}.`,
      maxScore: 20,
    },
    {
      key: "professionalStandards",
      label: "Compliance with professional standards",
      description: `Sanitation, ethics, professional materials and equipment, safety, and responsibility appropriate to ${context.standardsFocus}.`,
      maxScore: 10,
    },
    {
      key: "ibpaLevelAlignment",
      label: "Alignment with the IBPA Beauty Awards level",
      description: `Holistic assessment of whether the nominee's professional journey and evidence meet the international IBPA Beauty Awards standard for ${context.name}.`,
      maxScore: 15,
    },
  ];

  return {
    version: SCORING_SCHEMA_VERSION,
    categorySlug,
    categoryName: context.name,
    sourceDocument: context.sourceDocument,
    maximumTotal: criteria.reduce((total, criterion) => total + criterion.maxScore, 0),
    criteria,
  };
}

export const categoryScoringDefinitions: Record<string, NominationScoringDefinition> = Object.fromEntries(
  Object.entries(CATEGORY_CONTEXTS).map(([slug, context]) => [slug, buildDefinition(slug, context)])
);

export function getCategoryScoringDefinition(categorySlug: string): NominationScoringDefinition {
  const definition = categoryScoringDefinitions[categorySlug];
  if (!definition) {
    throw new Error(`No regulation scoring definition exists for category '${categorySlug}'.`);
  }

  return structuredClone(definition);
}

export function isNominationScoringDefinition(value: unknown): value is NominationScoringDefinition {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const definition = value as Partial<NominationScoringDefinition>;
  if (
    definition.version !== SCORING_SCHEMA_VERSION ||
    typeof definition.categorySlug !== "string" ||
    typeof definition.categoryName !== "string" ||
    typeof definition.sourceDocument !== "string" ||
    typeof definition.maximumTotal !== "number" ||
    !Array.isArray(definition.criteria)
  ) {
    return false;
  }

  const keys = new Set<string>();
  let total = 0;
  for (const item of definition.criteria) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return false;
    const criterion = item as Partial<ScoringCriterion>;
    if (
      !SCORING_CRITERION_KEYS.includes(criterion.key as ScoringCriterionKey) ||
      typeof criterion.label !== "string" ||
      typeof criterion.description !== "string" ||
      typeof criterion.maxScore !== "number" ||
      !Number.isInteger(criterion.maxScore) ||
      criterion.maxScore <= 0 ||
      keys.has(criterion.key as string)
    ) {
      return false;
    }
    keys.add(criterion.key as string);
    total += criterion.maxScore;
  }

  return keys.size === SCORING_CRITERION_KEYS.length && total === definition.maximumTotal;
}

export function resolveNominationScoringDefinition(
  value: unknown,
  categorySlug: string
): NominationScoringDefinition {
  if (isNominationScoringDefinition(value) && value.categorySlug === categorySlug) {
    return structuredClone(value);
  }

  return getCategoryScoringDefinition(categorySlug);
}

export function emptyReviewScores(definition: NominationScoringDefinition): ReviewScores {
  return Object.fromEntries(definition.criteria.map((criterion) => [criterion.key, null])) as ReviewScores;
}

export function validateReviewScores({
  scores,
  definition,
  requireComplete,
}: {
  scores: Record<string, number | null | undefined>;
  definition: NominationScoringDefinition;
  requireComplete: boolean;
}): ReviewScores {
  const allowedKeys = new Set(definition.criteria.map((criterion) => criterion.key));
  const unknownKey = Object.keys(scores).find((key) => !allowedKeys.has(key as ScoringCriterionKey));
  if (unknownKey) {
    throw new Error(`Unknown scoring criterion '${unknownKey}'.`);
  }

  const validated = emptyReviewScores(definition);
  for (const criterion of definition.criteria) {
    const value = scores[criterion.key];
    if (value === null || value === undefined) {
      if (requireComplete) {
        throw new Error(`A score is required for '${criterion.label}'.`);
      }
      continue;
    }
    if (!Number.isInteger(value) || value < 0 || value > criterion.maxScore) {
      throw new Error(`'${criterion.label}' must be a whole number from 0 to ${criterion.maxScore}.`);
    }
    validated[criterion.key] = value;
  }

  return validated;
}

export function calculateReviewTotal(scores: Record<string, number | null | undefined>) {
  const presentScores = Object.values(scores).filter((value): value is number => typeof value === "number");
  return presentScores.length === 0 ? null : presentScores.reduce((sum, value) => sum + value, 0);
}

export function buildReviewScoreData(
  definition: NominationScoringDefinition,
  scores: ReviewScores
) {
  return {
    version: SCORING_SCHEMA_VERSION,
    categorySlug: definition.categorySlug,
    scores,
  };
}

export function readReviewScores(
  value: unknown,
  definition: NominationScoringDefinition
): ReviewScores {
  const empty = emptyReviewScores(definition);
  if (!value || typeof value !== "object" || Array.isArray(value)) return empty;
  const scoreData = value as { scores?: unknown };
  if (!scoreData.scores || typeof scoreData.scores !== "object" || Array.isArray(scoreData.scores)) {
    return empty;
  }

  const rawScores = scoreData.scores as Record<string, unknown>;
  for (const criterion of definition.criteria) {
    const score = rawScores[criterion.key];
    empty[criterion.key] = typeof score === "number" ? score : null;
  }
  return empty;
}
