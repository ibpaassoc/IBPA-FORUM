import type { TicketStatus } from "@prisma/client";

/**
 * The set of ticket statuses that represent a genuinely completed purchase.
 *
 * A ticket is only ever moved into one of these states by the Stripe webhook
 * (`checkout.session.completed`) or by a subsequent check-in — never by merely
 * creating a Checkout Session. Everything else (PENDING, CANCELED) means the
 * customer has not paid.
 *
 * This is the single source of truth for "is this ticket paid?". Both the public
 * replacement flow and the admin resend flow rely on it so that a paid ticket is
 * never deleted, replaced, or issued a second payment session.
 */
export const TICKET_CONFIRMED_STATUSES = [
  "PAID",
  "CHECKED_ONE_DAY",
  "CHECKED_TWO_DAY",
  "CHECKED_GALA_DINNER",
] as const satisfies readonly TicketStatus[];

const CONFIRMED_SET = new Set<TicketStatus>(TICKET_CONFIRMED_STATUSES);

/**
 * Returns true only for a ticket whose payment has actually been confirmed by
 * Stripe (directly, or implicitly because the holder has already checked in).
 *
 * Pending, canceled, and any other non-completed status returns false.
 */
export function isTicketPaymentConfirmed(status: TicketStatus): boolean {
  return CONFIRMED_SET.has(status);
}
