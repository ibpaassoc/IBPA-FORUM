import "server-only";
import crypto from "crypto";
import cuid from "cuid";
import type { Prisma, TicketType } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
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
import type { Language } from "@/lib/i18n/translations";
import { isSpecialPacketEnabled } from "./special-packet";
import {
  getSpecialPacketAmountFromStripe,
  getTicketPriceConfigFromStripe,
} from "@/features/pricing/server/stripe-pricing";
import {
  TICKET_PURCHASE_MANIFEST_FLOW,
  TICKET_PURCHASE_MANIFEST_VERSION,
  type TicketPurchaseManifest,
  type TicketPurchaseManifestAttendee,
} from "./ticket-purchase-manifest";

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

function checkoutAmount(totalAmountCents: number, paymentPlan: TicketPaymentPlan) {
  return paymentPlan === "TWO_INSTALLMENTS"
    ? splitTicketTotalIntoTwoPayments(totalAmountCents).firstAmountCents
    : totalAmountCents;
}

function manifestAttendee(
  input: Omit<TicketPurchaseManifestAttendee, "ticketId" | "origin" | "specialPacketPosition">,
  options: Pick<TicketPurchaseManifestAttendee, "origin" | "specialPacketPosition">
): TicketPurchaseManifestAttendee {
  return { ticketId: cuid(), ...input, ...options };
}

async function removeUnfulfilledPayment(paymentId: string) {
  await prisma.payment.deleteMany({
    where: { id: paymentId, fulfilledAt: null, tickets: { none: {} } },
  });
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
    const paymentAmountCents = await getSpecialPacketAmountFromStripe(input.isIbpaMember);
    const specialPacketId = crypto.randomUUID();
    const attendees: TicketPurchaseManifestAttendee[] = [
      manifestAttendee(
        {
          fullName,
          email,
          phone: input.phone.trim(),
          instagram: normalizeInstagramHandle(input.instagram),
          type: "TWO_DAYS",
          galaDinner: true,
          isIbpaMember: input.isIbpaMember,
          ibpaCertNumber: input.ibpaCertNumber?.trim() || null,
        },
        { origin: "SPECIAL_PACKET", specialPacketPosition: 1 }
      ),
      manifestAttendee(
        {
          fullName: `${input.secondAttendee.firstName.trim()} ${input.secondAttendee.lastName.trim()}`.trim(),
          email: secondEmail,
          phone: input.secondAttendee.phone.trim(),
          instagram: normalizeInstagramHandle(input.secondAttendee.instagram),
          type: "TWO_DAYS",
          galaDinner: true,
          isIbpaMember: input.isIbpaMember,
          ibpaCertNumber: input.ibpaCertNumber?.trim() || null,
        },
        { origin: "SPECIAL_PACKET", specialPacketPosition: 2 }
      ),
    ];
    const ticketIds = attendees.map((attendee) => attendee.ticketId) as [string, string];
    const manifest: TicketPurchaseManifest = {
      version: TICKET_PURCHASE_MANIFEST_VERSION,
      flowType: TICKET_PURCHASE_MANIFEST_FLOW,
      locale: input.locale,
      createdAt: new Date().toISOString(),
      paymentPlan: input.paymentPlan,
      specialPacketId,
      attendees,
      pricing: { amountCents: paymentAmountCents },
    };
    const payment = await prisma.payment.create({
      data: {
        customerEmail: email,
        purchaseType: "TICKET",
        provider: "STRIPE",
        paymentPlan: input.paymentPlan,
        amount: paymentAmountCents,
        currency: "usd",
        pricingSnapshot: manifest as unknown as Prisma.InputJsonValue,
        status: "PENDING",
      },
    });
    let session;
    try {
      session = await createSpecialPacketCheckoutSession({
        ticketIds,
        paymentId: payment.id,
        paymentPlan: input.paymentPlan,
        email,
        isIbpaMember: input.isIbpaMember,
        locale: input.locale,
        orderAmountCents: paymentAmountCents,
      });
    } catch (error) {
      await removeUnfulfilledPayment(payment.id);
      throw error;
    }

    if (session.amountTotalCents !== checkoutAmount(paymentAmountCents, input.paymentPlan)) {
      throw new Error("Stripe Special Packet checkout amount does not match the payment plan.");
    }
    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripeCheckoutSessionId: session.id },
    });
    return { ticketId: ticketIds[0], ticketIds, checkoutUrl: session.url };
  }

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

  const attendee = manifestAttendee(
    {
      fullName,
      email,
      phone: input.phone.trim(),
      instagram: normalizeInstagramHandle(input.instagram),
      type: input.type,
      galaDinner: input.galaDinner,
      isIbpaMember: input.isIbpaMember,
      ibpaCertNumber: input.ibpaCertNumber?.trim() || null,
    },
    { origin: "STANDARD", specialPacketPosition: null }
  );
  const ticketId = attendee.ticketId;
  const manifest: TicketPurchaseManifest = {
    version: TICKET_PURCHASE_MANIFEST_VERSION,
    flowType: TICKET_PURCHASE_MANIFEST_FLOW,
    locale: input.locale,
    createdAt: new Date().toISOString(),
    paymentPlan: input.paymentPlan,
    specialPacketId: null,
    attendees: [attendee],
    pricing: {
      amountCents: paymentAmountCents,
      ticketAmountCents: amounts.ticketCents,
      galaAmountCents: amounts.galaCents,
    },
  };
  const payment = await prisma.payment.create({
    data: {
      customerEmail: email,
      purchaseType: "TICKET",
      provider: "STRIPE",
      paymentPlan: input.paymentPlan,
      amount: paymentAmountCents,
      currency: "usd",
      pricingSnapshot: manifest as unknown as Prisma.InputJsonValue,
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

  let session;
  try {
    session = await createTicketCheckoutSession({
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
  } catch (error) {
    await removeUnfulfilledPayment(payment.id);
    throw error;
  }

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
  return {
    ticketId,
    checkoutUrl: session.url,
  };
}
