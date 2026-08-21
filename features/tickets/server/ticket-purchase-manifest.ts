import "server-only";

import type { Prisma, TicketOrigin, TicketType } from "@prisma/client";
import type { Language } from "@/lib/i18n/translations";
import type { TicketPaymentPlan } from "@/features/tickets/lib/payment-plan";

export const TICKET_PURCHASE_MANIFEST_VERSION = 1;
export const TICKET_PURCHASE_MANIFEST_FLOW = "ticket_purchase";

export type TicketPurchaseManifestAttendee = {
  ticketId: string;
  fullName: string;
  email: string;
  phone: string;
  instagram: string | null;
  type: TicketType;
  galaDinner: boolean;
  isIbpaMember: boolean;
  ibpaCertNumber: string | null;
  origin: Extract<TicketOrigin, "STANDARD" | "SPECIAL_PACKET">;
  specialPacketPosition: number | null;
};

export type TicketPurchaseManifest = {
  version: typeof TICKET_PURCHASE_MANIFEST_VERSION;
  flowType: typeof TICKET_PURCHASE_MANIFEST_FLOW;
  locale: Language;
  createdAt: string;
  paymentPlan: TicketPaymentPlan;
  specialPacketId: string | null;
  attendees: TicketPurchaseManifestAttendee[];
  pricing: {
    amountCents: number;
    ticketAmountCents?: number;
    galaAmountCents?: number;
  };
};

export function parseTicketPurchaseManifest(
  value: Prisma.JsonValue | null
): TicketPurchaseManifest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const manifest = value as Partial<TicketPurchaseManifest>;
  if (
    manifest.version !== TICKET_PURCHASE_MANIFEST_VERSION ||
    manifest.flowType !== TICKET_PURCHASE_MANIFEST_FLOW ||
    !manifest.locale ||
    !manifest.paymentPlan ||
    !manifest.pricing ||
    !Array.isArray(manifest.attendees) ||
    manifest.attendees.length === 0 ||
    manifest.attendees.some(
      (attendee) =>
        !attendee.ticketId ||
        !attendee.fullName ||
        !attendee.email ||
        !attendee.phone ||
        !attendee.type
    )
  ) {
    return null;
  }

  return manifest as TicketPurchaseManifest;
}
