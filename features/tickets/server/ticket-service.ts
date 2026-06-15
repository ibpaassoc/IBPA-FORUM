import "server-only";
import type { TicketType } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { createTicket, findActiveTicketByEmail } from "./ticket-repository";
import { createTicketCheckoutSession } from "./ticket-checkout";
import { verifyIbpaMembership } from "./ibpa-membership";

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

const TICKET_AMOUNTS_CENTS: Record<TicketType, { ibpa: number; standard: number }> = {
  ONE_DAY:  { ibpa: 29500, standard: 39500 },
  TWO_DAYS: { ibpa: 59500, standard: 69500 },
};
const GALA_DINNER_CENTS = 15000;

export type InitiateTicketPurchaseInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: TicketType;
  galaDinner: boolean;
  isIbpaMember: boolean;
  ibpaCertNumber?: string | null;
};

export async function initiateTicketPurchase(input: InitiateTicketPurchaseInput) {
  const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`.trim();
  const email = input.email.trim().toLowerCase();

  if (input.isIbpaMember && input.ibpaCertNumber?.trim()) {
    const verification = await verifyIbpaMembership(input.ibpaCertNumber);
    if (!verification.verified && verification.reason === "invalid_cert") {
      throw new InvalidCertError(
        "This IBPA certificate number was not found or has expired. Please check your number and try again."
      );
    }
  }

  const existing = await findActiveTicketByEmail(email);
  if (existing) {
    const isPaid = existing.status !== "PENDING";
    throw new TicketConflictError(
      isPaid
        ? "A ticket has already been purchased for this email address. Check your inbox for your confirmation."
        : "A checkout session is already in progress for this email. Please complete your payment or wait a few minutes before trying again."
    );
  }

  const ticket = await createTicket({
    fullName,
    email,
    phone: input.phone.trim(),
    type: input.type,
    galaDinner: input.galaDinner,
    isIbpaMember: input.isIbpaMember,
    ibpaCertNumber: input.ibpaCertNumber?.trim() || null,
  });

  const session = await createTicketCheckoutSession({
    ticketId: ticket.id,
    email,
    type: ticket.type,
    galaDinner: ticket.galaDinner,
    isIbpaMember: ticket.isIbpaMember,
  });

  const ticketAmountCents =
    TICKET_AMOUNTS_CENTS[input.type][input.isIbpaMember ? "ibpa" : "standard"] +
    (input.galaDinner ? GALA_DINNER_CENTS : 0);

  await prisma.$transaction([
    prisma.ticket.update({
      where: { id: ticket.id },
      data: { stripeSessionId: session.id },
    }),
    prisma.payment.create({
      data: {
        source: "TICKET",
        ticketId: ticket.id,
        stripeSessionId: session.id,
        amount: ticketAmountCents,
        currency: "usd",
        status: "PENDING",
      },
    }),
  ]);

  return {
    ticketId: ticket.id,
    checkoutUrl: session.url,
  };
}
