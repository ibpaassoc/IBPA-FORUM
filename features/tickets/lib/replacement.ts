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
 *  - `blocked-paid` — at least one confirmed-paid ticket exists. Nothing is
 *    created, modified, or deleted; the caller surfaces "already purchased".
 *  - `reuse` — one or more unpaid tickets exist. The newest is refreshed in
 *    place (`reuseId`) and any older unpaid duplicates are removed (`deleteIds`),
 *    so at most one active ticket ever remains for the email.
 *  - `create` — no reusable ticket exists; a brand-new one should be created.
 *    (`deleteIds` may still list stale unpaid rows to clean up.)
 */
export type ReplacementDecision =
  | { kind: "blocked-paid"; paidTicketId: string }
  | { kind: "reuse"; reuseId: string; deleteIds: string[] }
  | { kind: "create"; deleteIds: string[] };

/**
 * Decide how to reconcile a new ticket submission with the caller's existing,
 * non-canceled tickets for the same email.
 *
 * A paid ticket is authoritative: if any exists we refuse and never touch it.
 * Otherwise the caller may safely replace the unpaid application(s).
 *
 * `existing` should already exclude CANCELED tickets. Order is not assumed —
 * the newest reusable ticket is chosen deterministically by the caller-supplied
 * ordering when statuses tie, so callers should pass newest-first for stability.
 */
export function decideTicketReplacement(existing: ExistingTicket[]): ReplacementDecision {
  const paid = existing.find((ticket) => isTicketPaymentConfirmed(ticket.status));
  if (paid) {
    return { kind: "blocked-paid", paidTicketId: paid.id };
  }

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
