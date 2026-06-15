import "server-only";
import crypto from "crypto";
import { prisma } from "@/shared/lib/prisma";
import type { TicketStatus, TicketType } from "@prisma/client";

export type CreateTicketInput = {
  fullName: string;
  email: string;
  phone: string;
  type: TicketType;
  galaDinner: boolean;
  isIbpaMember: boolean;
  ibpaCertNumber?: string | null;
};

export async function createTicket(input: CreateTicketInput) {
  const secureToken = crypto.randomBytes(32).toString("hex");

  return prisma.ticket.create({
    data: {
      secureToken,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      type: input.type,
      galaDinner: input.galaDinner,
      isIbpaMember: input.isIbpaMember,
      ibpaCertNumber: input.ibpaCertNumber ?? null,
      status: "PENDING",
    },
  });
}

export async function findTicketByStripeSessionId(stripeSessionId: string) {
  return prisma.ticket.findUnique({
    where: { stripeSessionId },
  });
}

export async function findTicketByToken(secureToken: string) {
  return prisma.ticket.findUnique({
    where: { secureToken },
  });
}

export async function updateTicketCheckoutSession(
  ticketId: string,
  { stripeSessionId, paymentLink }: { stripeSessionId: string; paymentLink: string }
) {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: { stripeSessionId, paymentLink },
  });
}

export async function checkInTicket(
  ticketId: string,
  status: Extract<TicketStatus, "CHECKED_ONE_DAY" | "CHECKED_TWO_DAY" | "CHECKED_GALA_DINNER">
) {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: { status, lastCheckIn: new Date() },
  });
}
