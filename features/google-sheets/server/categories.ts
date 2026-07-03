import "server-only";
import type { RgbColor } from "./formatting";

/**
 * Canonical competition categories, shared by the Applications and Jury tabs so
 * the same soft colour represents the same category everywhere.
 *
 * An application can belong to several categories (its primary category plus the
 * category of every nomination it enters) and a jury member can be qualified in
 * several (their areas of expertise). Both surface here as a set of these
 * canonical names, which drives:
 *   • the coloured category text (a "badge" per category inside one cell),
 *   • the hidden TRUE/FALSE helper columns that make multi-category filtering
 *     work through slicers (filtering by "Hair" must match "Hair, Education,
 *     Salon"), and
 *   • the paid-only category breakdowns on the statistics dashboard.
 *
 * The names match the values stored in the database verbatim (English, as the
 * product uses them) — user-entered data is never translated.
 */

/**
 * Fixed helper-column order (also the display order inside a category cell).
 * Keep in sync with the hidden helper columns declared in `schema.ts`.
 */
export const CATEGORY_ORDER = [
  "Hair",
  "Nail",
  "Lash",
  "Brow",
  "Education",
  "Salon",
  "Brand",
  "Makeup Artistry",
  "Skin Care, Cosmetology & Facial",
  "Permanent Makeup",
  "Body, Wellness & Nutrition",
] as const;

export type CanonicalCategory = (typeof CATEGORY_ORDER)[number];

/** Rank used to sort a row's categories into the canonical order above. */
const CATEGORY_RANK = new Map<string, number>(
  CATEGORY_ORDER.map((name, index) => [name, index])
);

/**
 * Soft, readable text colours — medium-dark tones that stay legible on the white
 * cell background and never turn into aggressive neon. One colour per category,
 * used identically on both the Applications and Jury tabs.
 */
export const CATEGORY_COLORS: Record<CanonicalCategory, RgbColor> = {
  Hair: { red: 0.55, green: 0.34, blue: 0.12 }, // amber-brown
  Nail: { red: 0.8, green: 0.24, blue: 0.44 }, // rose
  Lash: { red: 0.45, green: 0.3, blue: 0.7 }, // purple
  Brow: { red: 0.13, green: 0.47, blue: 0.51 }, // teal
  Education: { red: 0.16, green: 0.4, blue: 0.72 }, // blue
  Salon: { red: 0.2, green: 0.52, blue: 0.3 }, // green
  Brand: { red: 0.3, green: 0.3, blue: 0.66 }, // indigo
  "Makeup Artistry": { red: 0.72, green: 0.2, blue: 0.34 }, // crimson
  "Skin Care, Cosmetology & Facial": { red: 0.72, green: 0.42, blue: 0.13 }, // orange
  "Permanent Makeup": { red: 0.55, green: 0.24, blue: 0.55 }, // violet
  "Body, Wellness & Nutrition": { red: 0.36, green: 0.47, blue: 0.2 }, // olive
} as const;

/** Neutral ink for any category value outside the canonical set. */
const NEUTRAL_COLOR: RgbColor = { red: 0.25, green: 0.25, blue: 0.25 };

/** The colour for a category name (neutral for anything unrecognised). */
export function categoryColor(name: string): RgbColor {
  return CATEGORY_COLORS[name as CanonicalCategory] ?? NEUTRAL_COLOR;
}

/** How category names are joined inside a single cell. */
export const CATEGORY_SEPARATOR = ", ";

/**
 * Normalise an arbitrary collection of category names into a deduplicated list
 * sorted into the canonical order (unknown names kept, appended at the end in
 * first-seen order). This is what a row's category cell displays.
 */
export function orderCategories(names: Iterable<string>): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const raw of names) {
    const name = raw.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    unique.push(name);
  }
  return unique.sort((a, b) => {
    const ra = CATEGORY_RANK.get(a);
    const rb = CATEGORY_RANK.get(b);
    if (ra != null && rb != null) return ra - rb;
    if (ra != null) return -1;
    if (rb != null) return 1;
    return a.localeCompare(b);
  });
}

/**
 * TRUE/FALSE flags for the hidden helper columns, one per canonical category in
 * {@link CATEGORY_ORDER}. Multi-category rows light up several flags, which is
 * exactly what lets a single-category slicer include them.
 */
export function categoryFlags(names: Iterable<string>): boolean[] {
  const present = new Set<string>();
  for (const raw of names) present.add(raw.trim());
  return CATEGORY_ORDER.map((category) => present.has(category));
}
