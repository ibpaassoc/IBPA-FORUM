import "server-only";

/**
 * Presentation helpers shared by every row mapper so values land in the
 * spreadsheet consistently: USD currency, readable dates, Да/Нет booleans, and
 * comma-separated arrays (never raw JSON blobs).
 */

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format an integer amount of cents as a USD string, e.g. 5000 → "$50.00". */
export function formatUsd(amountCents: number | null | undefined): string {
  if (amountCents == null || Number.isNaN(amountCents)) {
    return usdFormatter.format(0);
  }
  return usdFormatter.format(amountCents / 100);
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

/**
 * Format a date as a consistent, sortable UTC timestamp: "YYYY-MM-DD HH:mm UTC".
 * Returns an empty string for null/undefined so empty cells stay empty.
 */
export function formatDateTime(date: Date | null | undefined): string {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`
  );
}

/** Render a boolean as a human-friendly "Да"/"Нет". */
export function yesNo(value: boolean | null | undefined): string {
  return value ? "Да" : "Нет";
}

/** Join an array into a readable comma-separated string (no JSON blobs). */
export function joinList(values: Array<string | null | undefined> | null | undefined): string {
  if (!values || values.length === 0) return "";
  return values
    .map((value) => (value ?? "").toString().trim())
    .filter(Boolean)
    .join(", ");
}
