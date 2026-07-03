import "server-only";
import type { RgbColor } from "./formatting";

/**
 * Canonical competition categories, shared by every place category data is shown
 * (Applications, Jury, the generated per-category tabs, and the stats dashboard)
 * so one category always looks the same everywhere.
 *
 * An application can belong to several categories (its primary category plus the
 * category of every nomination it enters) and a jury member can be qualified in
 * several (their areas of expertise). Both surface as a set of these canonical
 * names, which drives:
 *   • the coloured category text (a "badge" per category inside one cell),
 *   • which per-category tab a record is copied into (multi-category records
 *     appear in each of their categories' tabs), and
 *   • the paid-only category breakdowns on the statistics dashboard.
 *
 * `name` matches the value stored in the database verbatim (English, as the
 * product uses it) — user-entered data is never translated. `label` is the short
 * form used to name the generated category tabs. `color` is a strong, distinct,
 * readable text colour, unique per category.
 */
export type CategoryDef = {
  /** Full canonical name, exactly as stored in the database. */
  name: string;
  /** Short label used when naming the generated per-category tabs. */
  label: string;
  /** Unique badge/text colour (readable on white). */
  color: RgbColor;
};

export const CATEGORIES: CategoryDef[] = [
  { name: "Hair", label: "Hair", color: { red: 0.1, green: 0.4, blue: 0.85 } }, // Blue
  { name: "Nail", label: "Nail", color: { red: 0.86, green: 0.18, blue: 0.53 } }, // Pink
  { name: "Lash", label: "Lash", color: { red: 0.56, green: 0.22, blue: 0.83 } }, // Purple
  { name: "Brow", label: "Brow", color: { red: 0.45, green: 0.28, blue: 0.1 } }, // Brown
  { name: "Education", label: "Education", color: { red: 0.29, green: 0.2, blue: 0.72 } }, // Indigo
  { name: "Salon", label: "Salon", color: { red: 0.83, green: 0.42, blue: 0.04 } }, // Orange
  { name: "Brand", label: "Brand", color: { red: 0.0, green: 0.52, blue: 0.53 } }, // Teal
  { name: "Makeup Artistry", label: "Makeup Artistry", color: { red: 0.82, green: 0.11, blue: 0.12 } }, // Red
  { name: "Skin Care, Cosmetology & Facial", label: "Skin Care", color: { red: 0.16, green: 0.56, blue: 0.22 } }, // Green
  { name: "Permanent Makeup", label: "Permanent Makeup", color: { red: 0.38, green: 0.09, blue: 0.6 } }, // Deep Violet
  { name: "Body, Wellness & Nutrition", label: "Body Wellness", color: { red: 0.0, green: 0.57, blue: 0.36 } }, // Emerald
];

/** Canonical category names in display order (also the badge order in a cell). */
export const CATEGORY_ORDER: string[] = CATEGORIES.map((category) => category.name);

/** Rank used to sort a row's categories into the canonical order above. */
const CATEGORY_RANK = new Map<string, number>(
  CATEGORIES.map((category, index) => [category.name, index])
);

const CATEGORY_COLORS = new Map<string, RgbColor>(
  CATEGORIES.map((category) => [category.name, category.color])
);

/** Neutral ink for any category value outside the canonical set. */
const NEUTRAL_COLOR: RgbColor = { red: 0.25, green: 0.25, blue: 0.25 };

/** The colour for a category name (neutral for anything unrecognised). */
export function categoryColor(name: string): RgbColor {
  return CATEGORY_COLORS.get(name) ?? NEUTRAL_COLOR;
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
