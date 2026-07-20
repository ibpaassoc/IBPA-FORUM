export const regulationLanguages = ["en", "ru", "ua"] as const;

export type RegulationLanguage = (typeof regulationLanguages)[number];

export type RegulationUrls = Record<RegulationLanguage, string | null>;

export type RegulationAvailability = Record<RegulationLanguage, boolean>;

export type RegulationKey = "general" | `category:${string}`;

export type RegulationSummary = {
  key: RegulationKey;
  categoryId: string | null;
  urls: RegulationUrls;
};

export function isRegulationLanguage(value: unknown): value is RegulationLanguage {
  return typeof value === "string" && regulationLanguages.includes(value as RegulationLanguage);
}

export function regulationAvailability(urls: RegulationUrls): RegulationAvailability {
  return {
    en: Boolean(urls.en),
    ru: Boolean(urls.ru),
    ua: Boolean(urls.ua),
  };
}

/** Requested language first, Russian second, then no available document. */
export function resolveRegulationLanguage(
  availability: RegulationAvailability,
  requestedLanguage: RegulationLanguage,
): RegulationLanguage | null {
  if (availability[requestedLanguage]) return requestedLanguage;
  if (requestedLanguage !== "ru" && availability.ru) return "ru";
  return null;
}
