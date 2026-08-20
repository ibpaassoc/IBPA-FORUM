import type { TicketType } from "@prisma/client";
import type { Language } from "@/lib/i18n/translations";
import type { TicketPaymentPlan } from "@/features/tickets/lib/payment-plan";

/**
 * Discriminator written into every ticket Checkout Session's metadata. The
 * Stripe webhook dispatcher routes an event to the ticket handler when it sees
 * this value, so it must never change without updating the webhook.
 */
export const TICKET_FLOW_TYPE = "ticket" as const;

export type TicketCheckoutMetadata = {
  /** Webhook discriminator — see {@link TICKET_FLOW_TYPE}. */
  flowType: typeof TICKET_FLOW_TYPE;
  /** The ticket the webhook must mark paid. Primary lookup key. */
  ticketId: string;
  paymentId: string;
  paymentPlan: TicketPaymentPlan;
  installmentNumber?: "1";
  ticketIds?: string;
  specialPacket?: "true";
  specialOffer?: "true";
  notificationId?: string;
  email: string;
  ticketType: TicketType;
  galaDinner: string;
  quantity: string;
  locale: Language;
  /** Internal payment type, kept alongside flowType for downstream tooling. */
  checkoutType: "ticket";
};

/**
 * Build the Stripe metadata for a ticket Checkout Session.
 *
 * Both the initial purchase and the admin resend flow go through here so every
 * ticket session carries exactly the fields the webhook needs to identify and
 * update the correct ticket — and never carries `applicationId`/`juryApplicationId`,
 * which would misroute the event to the award or jury webhook branch.
 */
export function buildTicketCheckoutMetadata({
  ticketId,
  paymentId,
  paymentPlan,
  email,
  type,
  galaDinner,
  locale,
}: {
  ticketId: string;
  paymentId: string;
  paymentPlan: TicketPaymentPlan;
  email: string;
  type: TicketType;
  galaDinner: boolean;
  locale: Language;
}): Record<string, string> {
  // Returned as a plain string map (Stripe's metadata shape) while `satisfies`
  // keeps the field set validated against TicketCheckoutMetadata at build time.
  return {
    flowType: TICKET_FLOW_TYPE,
    ticketId,
    paymentId,
    paymentPlan,
    ...(paymentPlan === "TWO_INSTALLMENTS" ? { installmentNumber: "1" as const } : {}),
    email,
    ticketType: type,
    galaDinner: galaDinner ? "true" : "false",
    quantity: "1",
    locale,
    checkoutType: "ticket",
  } satisfies TicketCheckoutMetadata;
}

export function buildSpecialOfferCheckoutMetadata({
  ticketId,
  paymentId,
  notificationId,
  email,
  locale,
}: {
  ticketId: string;
  paymentId: string;
  notificationId: string;
  email: string;
  locale: Language;
}): Record<string, string> {
  return {
    flowType: TICKET_FLOW_TYPE,
    ticketId,
    paymentId,
    paymentPlan: "FULL",
    specialOffer: "true",
    notificationId,
    email,
    ticketType: "TWO_DAYS",
    galaDinner: "false",
    quantity: "1",
    locale,
    checkoutType: "ticket",
  } satisfies TicketCheckoutMetadata;
}

export function buildSpecialPacketCheckoutMetadata({
  ticketIds,
  paymentId,
  paymentPlan,
  email,
  locale,
}: {
  ticketIds: [string, string];
  paymentId: string;
  paymentPlan: TicketPaymentPlan;
  email: string;
  locale: Language;
}): Record<string, string> {
  return {
    flowType: TICKET_FLOW_TYPE,
    ticketId: ticketIds[0],
    paymentId,
    paymentPlan,
    ...(paymentPlan === "TWO_INSTALLMENTS" ? { installmentNumber: "1" as const } : {}),
    ticketIds: ticketIds.join(","),
    specialPacket: "true",
    email,
    ticketType: "TWO_DAYS",
    galaDinner: "true",
    quantity: "2",
    locale,
    checkoutType: "ticket",
  } satisfies TicketCheckoutMetadata;
}
