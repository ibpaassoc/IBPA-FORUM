import "server-only";
import type { TicketType } from "@prisma/client";
import { createTicket, updateTicketCheckoutSession } from "./ticket-repository";
import { createTicketCheckoutSession } from "./ticket-checkout";

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

  await updateTicketCheckoutSession(ticket.id, {
    stripeSessionId: session.id,
    paymentLink: session.url,
  });

  return {
    ticketId: ticket.id,
    checkoutUrl: session.url,
  };
}
