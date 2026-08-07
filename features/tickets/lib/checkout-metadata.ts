import type { TicketType } from "@prisma/client";
import type { Language } from "@/lib/i18n/translations";

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
  ticketIds?: string;
  specialPacket?: "true";
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
  email,
  type,
  galaDinner,
  locale,
}: {
  ticketId: string;
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
    email,
    ticketType: type,
    galaDinner: galaDinner ? "true" : "false",
    quantity: "1",
    locale,
    checkoutType: "ticket",
  } satisfies TicketCheckoutMetadata;
}

export function buildSpecialPacketCheckoutMetadata({
  ticketIds,
  email,
  locale,
}: {
  ticketIds: [string, string];
  email: string;
  locale: Language;
}): Record<string, string> {
  return {
    flowType: TICKET_FLOW_TYPE,
    ticketId: ticketIds[0],
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
