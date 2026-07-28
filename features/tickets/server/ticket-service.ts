import "server-only";
import type { TicketType } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { reserveTicketForCheckout } from "./ticket-repository";
import { createTicketCheckoutSession } from "./ticket-checkout";
import { verifyIbpaMembership } from "./ibpa-membership";
import { getActiveTicketDiscount } from "./ticket-discount";
import { normalizeInstagramHandle } from "@/features/tickets/lib/instagram";
import { normalizeTicketEmail } from "@/features/tickets/lib/normalize-email";
import { computeTicketAmountCents } from "@/features/tickets/lib/pricing";
import { validatePromoCodeForFlow } from "@/features/promos/server/promo-service";
import { syncTicketOnChange } from "@/features/google-sheets";
import type { Language } from "@/lib/i18n/translations";

export class TicketConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TicketConflictError";
  }
}

export class InvalidCertError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCertError";
  }
}

// Re-exported for backwards compatibility; the canonical definitions now live in
// the shared pricing calculator so the checkout and admin-resend flows agree.
export { TICKET_AMOUNTS_CENTS, GALA_DINNER_CENTS } from "@/features/tickets/lib/pricing";

export type InitiateTicketPurchaseInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  instagram?: string | null;
  type: TicketType;
  galaDinner: boolean;
  isIbpaMember: boolean;
  ibpaCertNumber?: string | null;
  locale: Language;
  promoCode?: string | null;
};

export async function initiateTicketPurchase(input: InitiateTicketPurchaseInput) {
  const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`.trim();
  const email = normalizeTicketEmail(input.email);

  if (input.isIbpaMember && input.ibpaCertNumber?.trim()) {
    const verification = await verifyIbpaMembership(input.ibpaCertNumber);
    if (!verification.verified && verification.reason === "invalid_cert") {
      throw new InvalidCertError(
        "This IBPA certificate number was not found or has expired. Please check your number and try again."
      );
    }
  }

  // Reserve the single active ticket for this email. If a paid ticket already
  // exists we refuse here; if an unpaid one exists it is safely replaced.
  const reservation = await reserveTicketForCheckout({
    fullName,
    email,
    phone: input.phone.trim(),
    instagram: normalizeInstagramHandle(input.instagram),
    type: input.type,
    galaDinner: input.galaDinner,
    isIbpaMember: input.isIbpaMember,
    ibpaCertNumber: input.ibpaCertNumber?.trim() || null,
  });

  if (!reservation.ok) {
    // Message is overridden with a localized string at the API boundary.
    throw new TicketConflictError(
      "A ticket has already been purchased for this email address."
    );
  }

  const ticketId = reservation.ticketId;

  const activeTicketDiscount = await getActiveTicketDiscount();
  const automaticDiscountStacks = activeTicketDiscount?.kind === "permanent30";
  const promoBaseAmounts = computeTicketAmountCents({
    type: input.type,
    isIbpaMember: input.isIbpaMember,
    galaDinner: input.galaDinner,
    ticketDiscount: automaticDiscountStacks ? activeTicketDiscount?.discount ?? null : null,
  });
  const appliedPromo = await validatePromoCodeForFlow({
    keyword: input.promoCode,
    paymentFlow: "TICKETS",
    amountCents: promoBaseAmounts.ticketCents,
  });
  const automaticDiscountApplies = Boolean(activeTicketDiscount) && (!appliedPromo || automaticDiscountStacks);
  const amounts = automaticDiscountApplies
    ? computeTicketAmountCents({
        type: input.type,
        isIbpaMember: input.isIbpaMember,
        galaDinner: input.galaDinner,
        ticketDiscount: activeTicketDiscount?.discount ?? null,
      })
    : promoBaseAmounts;
  const paymentAmountCents = appliedPromo
    ? appliedPromo.finalAmountCents + amounts.galaCents
    : amounts.totalCents;

  const session = await createTicketCheckoutSession({
    ticketId,
    email,
    type: input.type,
    galaDinner: input.galaDinner,
    isIbpaMember: input.isIbpaMember,
    ticketAmountCents:
      automaticDiscountApplies || appliedPromo ? appliedPromo?.finalAmountCents ?? amounts.ticketCents : null,
    ticketDiscountLabel: automaticDiscountApplies ? activeTicketDiscount?.kind ?? null : null,
    locale: input.locale,
  });

  if (session.amountTotalCents !== paymentAmountCents) {
    throw new Error(
      `Stripe ticket total mismatch: expected ${paymentAmountCents}, received ${session.amountTotalCents ?? "null"}.`
    );
  }

  await prisma.$transaction([
    prisma.ticket.update({
      where: { id: ticketId },
      data: {
        stripeSessionId: session.id,
        promoCodeKey: appliedPromo?.key,
        promoCodeKeyword: appliedPromo?.keyword,
        promoDiscountPercent: appliedPromo?.discountPercent,
        promoDiscountAmount: appliedPromo?.discountAmountCents,
      },
    }),
    prisma.payment.create({
      data: {
        source: "TICKET",
        ticketId,
        stripeSessionId: session.id,
        amount: paymentAmountCents,
        currency: "usd",
        promoCodeKey: appliedPromo?.key,
        promoCodeKeyword: appliedPromo?.keyword,
        promoDiscountPercent: appliedPromo?.discountPercent,
        promoDiscountAmount: appliedPromo?.discountAmountCents,
        status: "PENDING",
      },
    }),
  ]);

  syncTicketOnChange(ticketId);

  return {
    ticketId,
    checkoutUrl: session.url,
  };
}
