import "server-only";

import { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { syncTicketOnChange } from "@/features/google-sheets";
import { prisma } from "@/shared/lib/prisma";
import { ensureActiveTicketQr } from "./ticket-admin-service";
import { sendTicketConfirmationEmail } from "./ticket-email.workflow";
import {
  findTicketById,
  findTicketByStripeSessionId,
  findTicketsByIds,
} from "./ticket-repository";

function getPaymentIntentId(value: string | Stripe.PaymentIntent | null): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function serializeStripeEvent(event: Stripe.Event): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(event)) as Prisma.InputJsonValue;
}

function isDuplicateStripeEventError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function handleTicketStripeEvent(event: Stripe.Event): Promise<boolean> {
  if (event.type !== "checkout.session.completed") return false;
  const session = event.data.object as Stripe.Checkout.Session;
  if (session.metadata?.flowType !== "ticket") return false;

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
  const primary = tickets[0];
  if (!primary) {
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
      await tx.stripeWebhook.create({
        data: {
          eventId: event.id,
          eventType: event.type,
          payload: serializeStripeEvent(event),
          state: "PROCESSING",
          attempts: 1,
          lastAttemptAt: paidAt,
        },
      });
      const payment = await tx.payment.findFirst({
        where: {
          purchaseType: "TICKET",
          OR: [
            { stripeCheckoutSessionId: session.id },
            { id: primary.paymentId ?? "__missing__" },
          ],
        },
      });
      if (!payment) throw new Error("Ticket payment was not found for the Stripe event.");
      if (session.amount_total !== null && payment.amount !== session.amount_total) {
        throw new Error("Stripe ticket amount does not match the stored payment.");
      }
      const ticketIds = tickets.map((ticket) => ticket.id);
      await tx.ticket.updateMany({
        where: { id: { in: ticketIds }, status: "PENDING" },
        data: { status: "PAID", paidAt, paymentId: payment.id, revision: { increment: 1 } },
      });
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
          paidAt,
          fulfilledAt: paidAt,
        },
      });
      for (const ticketId of ticketIds) await ensureActiveTicketQr(ticketId, tx);
      await tx.stripeWebhook.update({
        where: { eventId: event.id },
        data: { state: "PROCESSED", processedAt: paidAt, paymentId: payment.id },
      });
    });
  } catch (error) {
    if (isDuplicateStripeEventError(error)) return true;
    throw error;
  }

  for (const ticket of tickets) {
    syncTicketOnChange(ticket.id);
    if (!ticket.type) continue;
    try {
      await sendTicketConfirmationEmail({
        to: ticket.email,
        fullName: ticket.fullName,
        type: ticket.type,
        galaDinner: ticket.galaDinner,
        secureToken: ticket.secureToken,
        instagram: ticket.instagram,
        specialPacket: Boolean(ticket.specialPacketId),
      });
    } catch (error) {
      console.error("Failed to send ticket confirmation email", { ticketId: ticket.id, error });
    }
  }
  return true;
}
