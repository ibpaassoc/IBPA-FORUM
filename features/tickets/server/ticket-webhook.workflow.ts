import "server-only";
import { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { prisma } from "@/shared/lib/prisma";
import {
  findTicketById,
  findTicketByStripeSessionId,
  findTicketsByIds,
} from "./ticket-repository";
import { sendTicketConfirmationEmail } from "./ticket-email.workflow";
import { ensureActiveTicketQr } from "./ticket-admin-service";
import { syncTicketOnChange } from "@/features/google-sheets";

function getPaymentIntentId(value: string | Stripe.PaymentIntent | null): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function serializeStripeEvent(event: Stripe.Event): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(event)) as Prisma.InputJsonValue;
}

function isDuplicateStripeEventError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function handleTicketStripeEvent(event: Stripe.Event): Promise<boolean> {
  switch (event.type) {
    case "checkout.session.completed":
      return handleTicketCheckoutCompleted(event);
    default:
      return false;
  }
}

async function handleTicketCheckoutCompleted(event: Stripe.Event): Promise<boolean> {
  const session = event.data.object as Stripe.Checkout.Session;

  if (session.metadata?.flowType !== "ticket") {
    return false;
  }

  // Resolve by the ticket id carried in metadata first: it stays correct even
  // after an unpaid ticket was replaced or an admin issued a fresh session
  // (which supersedes the stripeSessionId stored on the row). Fall back to the
  // session id for any older sessions created before metadata.ticketId existed.
  const metadataTicketId = session.metadata?.ticketId;
  const metadataTicketIds = session.metadata?.ticketIds
    ?.split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const tickets = metadataTicketIds?.length
    ? await findTicketsByIds(metadataTicketIds)
    : [
        metadataTicketId
          ? await findTicketById(metadataTicketId)
          : await findTicketByStripeSessionId(session.id),
      ].filter((ticket) => ticket !== null);
  const ticket = tickets[0];

  if (!ticket) {
    console.warn("Ticket webhook: no ticket found for Stripe session", {
      sessionId: session.id,
      metadataTicketId,
    });
    return true;
  }

  const paymentIntentId = getPaymentIntentId(session.payment_intent);
  const paidAt = new Date();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.stripeWebhookEvent.create({
        data: {
          stripeEventId: event.id,
          eventType: event.type,
          payloadJson: serializeStripeEvent(event),
        },
      });

      const pendingTickets = tickets.filter((item) => item.status === "PENDING");
      if (pendingTickets.length === 0) return;

      await tx.ticket.updateMany({
        where: { id: { in: pendingTickets.map((item) => item.id) } },
        data: { status: "PAID", paidAt },
      });

      await tx.ticket.update({
        where: { id: ticket.id },
        data: {
          stripePaymentIntentId: paymentIntentId,
        },
      });

      await tx.payment.updateMany({
        where: { stripeSessionId: session.id },
        data: {
          status: "PAID",
          ...(session.amount_total !== null ? { amount: session.amount_total } : {}),
          stripePaymentIntentId: paymentIntentId,
          paidAt,
        },
      });

      for (const pendingTicket of pendingTickets) {
        await ensureActiveTicketQr(pendingTicket.id, tx);
      }
    });
  } catch (error) {
    if (isDuplicateStripeEventError(error)) {
      return true;
    }
    throw error;
  }

  for (const fulfilledTicket of tickets) {
    syncTicketOnChange(fulfilledTicket.id);

    try {
      await sendTicketConfirmationEmail({
        to: fulfilledTicket.email,
        fullName: fulfilledTicket.fullName,
        type: fulfilledTicket.type,
        galaDinner: fulfilledTicket.galaDinner,
        secureToken: fulfilledTicket.secureToken,
        instagram: fulfilledTicket.instagram,
        specialPacket: Boolean(fulfilledTicket.specialPacketId),
      });
    } catch (error) {
      console.error("Failed to send ticket confirmation email", {
        ticketId: fulfilledTicket.id,
        error,
      });
    }
  }

  return true;
}
