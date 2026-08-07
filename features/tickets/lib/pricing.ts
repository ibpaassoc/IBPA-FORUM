import type { TicketType } from "@prisma/client";
import { applyDiscountToCents, type TicketDiscount } from "@/features/tickets/types";

/** Stripe-backed server-side ticket pricing, normalized to cents. */
export type TicketPriceConfig = {
  ticketAmountsCents: Record<TicketType, { ibpa: number; standard: number }>;
  galaDinnerCents: number;
};

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
 * Compute the amount owed for a ticket from its selection and Stripe price
 * configuration. The active ticket discount (when present) applies to the forum pass
 * only — never to the gala dinner — matching the public checkout summary.
 */
export function computeTicketAmountCents({
  type,
  isIbpaMember,
  galaDinner,
  ticketDiscount,
  pricing,
}: {
  type: TicketType;
  isIbpaMember: boolean;
  galaDinner: boolean;
  ticketDiscount: TicketDiscount;
  pricing: TicketPriceConfig;
}): TicketAmountBreakdown {
  const memberKey = isIbpaMember ? "ibpa" : "standard";
  const baseTicketCents = pricing.ticketAmountsCents[type][memberKey];

  const discountedTicketCents = ticketDiscount
    ? applyDiscountToCents(baseTicketCents, ticketDiscount)
    : null;

  const ticketCents = discountedTicketCents ?? baseTicketCents;
  const galaCents = galaDinner ? pricing.galaDinnerCents : 0;

  return {
    ticketCents,
    galaCents,
    totalCents: ticketCents + galaCents,
    discountedTicketCents,
  };
}
