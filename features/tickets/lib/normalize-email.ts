/**
 * Canonical form used for storing and comparing ticket-holder email addresses.
 *
 * Leading/trailing whitespace is trimmed and the address is lower-cased so that
 * "  Jane@Example.com " and "jane@example.com" are treated as the same person.
 * Storing the normalized value keeps the replacement/duplicate logic reliable.
 */
export function normalizeTicketEmail(email: string): string {
  return email.trim().toLowerCase();
}
