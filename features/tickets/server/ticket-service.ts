import "server-only";
import type { TicketType } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import {
  reserveSpecialPacketForCheckout,
  reserveTicketForCheckout,
} from "./ticket-repository";
import {
  createSpecialPacketCheckoutSession,
  createTicketCheckoutSession,
} from "./ticket-checkout";
import { verifyIbpaMembership } from "./ibpa-membership";
import { getActiveTicketDiscount } from "./ticket-discount";
import { normalizeInstagramHandle } from "@/features/tickets/lib/instagram";
import { normalizeTicketEmail } from "@/features/tickets/lib/normalize-email";
import { computeTicketAmountCents } from "@/features/tickets/lib/pricing";
import {
  splitTicketTotalIntoTwoPayments,
  type TicketPaymentPlan,
} from "@/features/tickets/lib/payment-plan";
import { validatePromoCodeForFlow } from "@/features/promos/server/promo-service";
import { syncTicketOnChange } from "@/features/google-sheets";
import type { Language } from "@/lib/i18n/translations";
import { isSpecialPacketEnabled } from "./special-packet";
import {
  getSpecialPacketAmountFromStripe,
  getTicketPriceConfigFromStripe,
} from "@/features/pricing/server/stripe-pricing";

export class InvalidCertError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCertError";
  }
}

export class SpecialPacketUnavailableError extends Error {
  constructor() {
    super("The Special Packet is coming soon and is not available for checkout yet.");
    this.name = "SpecialPacketUnavailableError";
  }
}

export type InitiateTicketPurchaseInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  instagram?: string | null;
  type: TicketType | "SPECIAL_PACKET";
  galaDinner: boolean;
  isIbpaMember: boolean;
  ibpaCertNumber?: string | null;
  locale: Language;
  promoCode?: string | null;
  paymentPlan: TicketPaymentPlan;
  secondAttendee?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    instagram?: string | null;
  };
};

function paymentPlanSnapshot(totalAmountCents: number, paymentPlan: TicketPaymentPlan) {
  return paymentPlan === "TWO_INSTALLMENTS"
    ? {
        paymentPlan,
        installments: splitTicketTotalIntoTwoPayments(totalAmountCents),
      }
    : { paymentPlan };
}

function checkoutAmount(totalAmountCents: number, paymentPlan: TicketPaymentPlan) {
  return paymentPlan === "TWO_INSTALLMENTS"
    ? splitTicketTotalIntoTwoPayments(totalAmountCents).firstAmountCents
    : totalAmountCents;
}

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

  if (input.type === "SPECIAL_PACKET") {
    if (!(await isSpecialPacketEnabled())) {
      throw new SpecialPacketUnavailableError();
    }
    if (!input.secondAttendee) {
      throw new Error("Second attendee details are required for the Special Packet.");
    }

    const secondEmail = normalizeTicketEmail(input.secondAttendee.email);
    const reservation = await reserveSpecialPacketForCheckout({
      attendees: [
        {
          fullName,
          email,
          phone: input.phone.trim(),
          instagram: normalizeInstagramHandle(input.instagram),
          isIbpaMember: input.isIbpaMember,
          ibpaCertNumber: input.ibpaCertNumber?.trim() || null,
        },
        {
          fullName: `${input.secondAttendee.firstName.trim()} ${input.secondAttendee.lastName.trim()}`.trim(),
          email: secondEmail,
          phone: input.secondAttendee.phone.trim(),
          instagram: normalizeInstagramHandle(input.secondAttendee.instagram),
          isIbpaMember: input.isIbpaMember,
          ibpaCertNumber: input.ibpaCertNumber?.trim() || null,
        },
      ],
    });
    const ticketIds = reservation.tickets.map((ticket) => ticket.id) as [string, string];
    const paymentAmountCents = await getSpecialPacketAmountFromStripe(input.isIbpaMember);
    const payment = await prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          customerEmail: email,
          purchaseType: "TICKET",
          provider: "STRIPE",
          paymentPlan: input.paymentPlan,
          amount: paymentAmountCents,
          currency: "usd",
          pricingSnapshot: {
            specialPacketId: reservation.specialPacketId,
            ticketIds,
            ...paymentPlanSnapshot(paymentAmountCents, input.paymentPlan),
          },
          status: "PENDING",
        },
      });
      await tx.ticket.updateMany({
        where: { id: { in: ticketIds } },
        data: { paymentId: created.id },
      });
      return created;
    });
    const session = await createSpecialPacketCheckoutSession({
      ticketIds,
      paymentId: payment.id,
      paymentPlan: input.paymentPlan,
      email,
      isIbpaMember: input.isIbpaMember,
      locale: input.locale,
      orderAmountCents: paymentAmountCents,
    });

    if (session.amountTotalCents !== checkoutAmount(paymentAmountCents, input.paymentPlan)) {
      throw new Error("Stripe Special Packet checkout amount does not match the payment plan.");
    }
    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    ticketIds.forEach((ticketId) => syncTicketOnChange(ticketId));
    return { ticketId: ticketIds[0], ticketIds, checkoutUrl: session.url };
  }

  // Reserve the reusable unpaid checkout for this email. Paid tickets are left
  // intact, so the same email can buy another ticket.
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

  const ticketId = reservation.ticketId;

  const [activeTicketDiscount, pricing] = await Promise.all([
    getActiveTicketDiscount(),
    getTicketPriceConfigFromStripe(),
  ]);
  const automaticDiscountStacks = activeTicketDiscount?.kind === "permanent30";
  const promoBaseAmounts = computeTicketAmountCents({
    type: input.type,
    isIbpaMember: input.isIbpaMember,
    galaDinner: input.galaDinner,
    ticketDiscount: automaticDiscountStacks ? activeTicketDiscount?.discount ?? null : null,
    pricing,
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
        pricing,
      })
    : promoBaseAmounts;
  const paymentAmountCents = appliedPromo
    ? appliedPromo.finalAmountCents + amounts.galaCents
    : amounts.totalCents;

  const payment = await prisma.$transaction(async (tx) => {
    const created = await tx.payment.create({
      data: {
        customerEmail: email,
        purchaseType: "TICKET",
        provider: "STRIPE",
        paymentPlan: input.paymentPlan,
        amount: paymentAmountCents,
        currency: "usd",
        pricingSnapshot: {
          ticketId,
          type: input.type,
          galaDinner: input.galaDinner,
          ticketAmountCents: amounts.ticketCents,
          galaAmountCents: amounts.galaCents,
          ...paymentPlanSnapshot(paymentAmountCents, input.paymentPlan),
        },
        promotionSnapshot: appliedPromo
          ? {
              key: appliedPromo.key,
              keyword: appliedPromo.keyword,
              discountPercent: appliedPromo.discountPercent,
              discountAmountCents: appliedPromo.discountAmountCents,
            }
          : undefined,
        status: "PENDING",
      },
    });
    await tx.ticket.update({ where: { id: ticketId }, data: { paymentId: created.id } });
    return created;
  });

  const session = await createTicketCheckoutSession({
    ticketId,
    paymentId: payment.id,
    paymentPlan: input.paymentPlan,
    email,
    type: input.type,
    galaDinner: input.galaDinner,
    isIbpaMember: input.isIbpaMember,
    orderAmountCents: paymentAmountCents,
    ticketAmountCents:
      automaticDiscountApplies || appliedPromo ? appliedPromo?.finalAmountCents ?? amounts.ticketCents : null,
    ticketDiscountLabel: automaticDiscountApplies ? activeTicketDiscount?.kind ?? null : null,
    locale: input.locale,
  });

  const expectedCheckoutAmount = checkoutAmount(paymentAmountCents, input.paymentPlan);
  if (session.amountTotalCents !== expectedCheckoutAmount) {
    throw new Error(
      `Stripe ticket total mismatch: expected ${expectedCheckoutAmount}, received ${session.amountTotalCents}.`
    );
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  syncTicketOnChange(ticketId);

  return {
    ticketId,
    checkoutUrl: session.url,
  };
}
