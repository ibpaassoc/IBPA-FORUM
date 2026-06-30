import "server-only";
import { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { prisma } from "@/shared/lib/prisma";
import { findTicketByStripeSessionId } from "./ticket-repository";
import { sendTicketConfirmationEmail } from "./ticket-email.workflow";
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

  const ticket = await findTicketByStripeSessionId(session.id);

  if (!ticket) {
    console.warn("Ticket webhook: no ticket found for Stripe session", {
      sessionId: session.id,
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

      if (ticket.status !== "PENDING") return;

      await tx.ticket.update({
        where: { id: ticket.id },
        data: {
          status: "PAID",
          paidAt,
          stripePaymentIntentId: paymentIntentId,
        },
      });

      await tx.payment.updateMany({
        where: { stripeSessionId: session.id },
        data: {
          status: "PAID",
          stripePaymentIntentId: paymentIntentId,
          paidAt,
        },
      });
    });
  } catch (error) {
    if (isDuplicateStripeEventError(error)) {
      return true;
    }
    throw error;
  }

  syncTicketOnChange(ticket.id);

  try {
    await sendTicketConfirmationEmail({
      to: ticket.email,
      fullName: ticket.fullName,
      type: ticket.type,
      galaDinner: ticket.galaDinner,
      secureToken: ticket.secureToken,
      instagram: ticket.instagram,
    });
  } catch (error) {
    console.error("Failed to send ticket confirmation email", {
      ticketId: ticket.id,
      error,
    });
  }

  return true;
}
