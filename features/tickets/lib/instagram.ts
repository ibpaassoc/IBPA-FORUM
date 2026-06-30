// Shared, framework-agnostic helpers for Instagram handles on tickets.
// Used by the public form (client), the API validation schema, and the
// server-side ticket service, so this module must stay free of "server-only".

// Instagram usernames: letters, numbers, periods, and underscores, up to 30 chars.
const INSTAGRAM_USERNAME_RE = /^[A-Za-z0-9._]{1,30}$/;

/**
 * Normalise any accepted Instagram input into a bare handle (no leading "@",
 * no URL wrapper). Accepts:
 *   - "@username"
 *   - "username"
 *   - "https://instagram.com/username" (with/without protocol, www, trailing slash)
 * Returns null for empty/blank input.
 */
export function normalizeInstagramHandle(input: string | null | undefined): string | null {
  if (!input) return null;
  let value = input.trim();
  if (!value) return null;

  // Pull the handle out of a full/partial profile URL.
  const urlMatch = value.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^/?#\s]+)/i);
  if (urlMatch) {
    value = urlMatch[1];
  }

  // Strip leading "@" and any trailing slashes left over from a pasted link.
  value = value.replace(/^@+/, "").replace(/\/+$/, "").trim();

  return value || null;
}

/** True when a normalised handle is a syntactically valid Instagram username. */
export function isValidInstagramHandle(handle: string): boolean {
  return INSTAGRAM_USERNAME_RE.test(handle);
}

/**
 * Validate raw user input. Empty is allowed (the field is optional); non-empty
 * input must resolve to a valid handle. Returns an error message or null.
 */
export function validateInstagramInput(input: string | null | undefined): string | null {
  const trimmed = (input ?? "").trim();
  if (!trimmed) return null;
  const handle = normalizeInstagramHandle(trimmed);
  if (!handle || !isValidInstagramHandle(handle)) {
    return "Enter a valid Instagram username or profile link.";
  }
  return null;
}

/** Public profile URL for a bare handle. */
export function instagramProfileUrl(handle: string): string {
  return `https://instagram.com/${handle}`;
}
