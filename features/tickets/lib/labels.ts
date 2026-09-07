import type { TicketType } from "@prisma/client";

// Single source of truth for human-readable ticket-type labels, shared by the
// public payment page, the confirmation email, and the admin tickets table.
export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  ONE_DAY: "1-Day Forum Pass",
  TWO_DAYS: "2-Day Forum Pass",
};

export function ticketTypeLabel(type: string): string {
  return (
    TICKET_TYPE_LABELS[type as TicketType] ?? type.replace("_", " ").toLowerCase()
  );
}

/**
 * True when the ticket grants the gala dinner only, with no forum-day access.
 *
 * A FORUM ticket must carry a `type` (the `Ticket_forum_type_required` database
 * constraint), so gala-only tickets store a placeholder type and mark their
 * access through `origin` — this is what the scanner, the admin table and the
 * confirmation email read.
 */
export function isGalaOnlyOrigin(origin: string): boolean {
  return origin === "GALA_ONLY" || origin === "JURY_GALA";
}
