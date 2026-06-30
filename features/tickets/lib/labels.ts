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
