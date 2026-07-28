import type { TicketStatus } from "@prisma/client";
import { isTicketPaymentConfirmed } from "./ticket-status";

export type ExistingTicket = {
  id: string;
  status: TicketStatus;
};

/**
 * The action the reservation step should take given the tickets that already
 * exist for a normalized email address.
 *
 *  - `reuse` — one or more unpaid tickets exist. The newest is refreshed in
 *    place (`reuseId`) and any older unpaid duplicates are removed (`deleteIds`),
 *    so at most one unpaid checkout remains for the email.
 *  - `create` — no reusable unpaid ticket exists; a brand-new one should be
 *    created. Paid tickets do not block another purchase for the same email.
 */
export type ReplacementDecision =
  | { kind: "reuse"; reuseId: string; deleteIds: string[] }
  | { kind: "create"; deleteIds: string[] };

/**
 * Decide how to reconcile a new ticket submission with the caller's existing,
 * non-canceled tickets for the same email.
 *
 * Paid tickets are historical purchases and are never touched or treated as
 * blockers. The caller may safely replace only the unpaid checkout row(s).
 *
 * `existing` should already exclude CANCELED tickets. Order is not assumed —
 * the newest reusable ticket is chosen deterministically by the caller-supplied
 * ordering when statuses tie, so callers should pass newest-first for stability.
 */
export function decideTicketReplacement(existing: ExistingTicket[]): ReplacementDecision {
  const unpaid = existing.filter((ticket) => !isTicketPaymentConfirmed(ticket.status));

  if (unpaid.length === 0) {
    return { kind: "create", deleteIds: [] };
  }

  const [reuse, ...rest] = unpaid;
  return {
    kind: "reuse",
    reuseId: reuse.id,
    deleteIds: rest.map((ticket) => ticket.id),
  };
}
