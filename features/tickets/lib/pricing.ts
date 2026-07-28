import type { TicketType } from "@prisma/client";
import { applyDiscountToCents, type TicketDiscount } from "@/features/tickets/types";

/**
 * Canonical server-side ticket pricing (in cents).
 *
 * This is the single source of truth for how much a ticket costs. Both the
 * public checkout flow and the admin "resend payment link" flow derive the
 * amount from here so an admin can never accidentally charge a client-supplied
 * price, and the two flows can never drift apart.
 */
export const TICKET_AMOUNTS_CENTS: Record<TicketType, { ibpa: number; standard: number }> = {
  ONE_DAY: { ibpa: 29500, standard: 39500 },
  TWO_DAYS: { ibpa: 59500, standard: 69500 },
};

export const GALA_DINNER_CENTS = 15000;

export type TicketAmountBreakdown = {
  /** Forum pass price after any active ticket discount. */
  ticketCents: number;
  /** Gala dinner add-on, or 0 when not selected. Never discounted. */
  galaCents: number;
  /** ticketCents + galaCents — the amount recorded on the Payment row. */
  totalCents: number;
  /** The discounted forum-pass price, or null when no discount applied. */
  discountedTicketCents: number | null;
};

/**
 * Compute the amount owed for a ticket from its selection and the canonical
 * price table. The active ticket discount (when present) applies to the forum pass
 * only — never to the gala dinner — matching the public checkout summary.
 */
export function computeTicketAmountCents({
  type,
  isIbpaMember,
  galaDinner,
  ticketDiscount,
}: {
  type: TicketType;
  isIbpaMember: boolean;
  galaDinner: boolean;
  ticketDiscount: TicketDiscount;
}): TicketAmountBreakdown {
  const memberKey = isIbpaMember ? "ibpa" : "standard";
  const baseTicketCents = TICKET_AMOUNTS_CENTS[type][memberKey];

  const discountedTicketCents = ticketDiscount
    ? applyDiscountToCents(baseTicketCents, ticketDiscount)
    : null;

  const ticketCents = discountedTicketCents ?? baseTicketCents;
  const galaCents = galaDinner ? GALA_DINNER_CENTS : 0;

  return {
    ticketCents,
    galaCents,
    totalCents: ticketCents + galaCents,
    discountedTicketCents,
  };
}
