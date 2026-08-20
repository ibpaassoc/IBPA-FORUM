import "server-only";

import { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { syncTicketOnChange } from "@/features/google-sheets";
import { getStripe } from "@/features/payments/server/stripe-client";
import {
  SECOND_INSTALLMENT_DELAY_SECONDS,
  splitTicketTotalIntoTwoPayments,
} from "@/features/tickets/lib/payment-plan";
import { prisma } from "@/shared/lib/prisma";
import { ensureActiveTicketQr } from "./ticket-admin-service";
import {
  cancelSecondInstallmentSchedule,
  createSecondInstallmentSchedule,
} from "./ticket-checkout";
import { sendTicketConfirmationEmail } from "./ticket-email.workflow";
import { sendTicketPaymentAdminNotificationEmail } from "@/features/email/server/payment-email.workflow";
import {
  findTicketById,
  findTicketByStripeSessionId,
  findTicketsByIds,
} from "./ticket-repository";
import { parseNotificationContent } from "@/features/notifications/lib/content";

function stripeId(value: { id: string } | string | null): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function serializeStripeEvent(event: Stripe.Event): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(event)) as Prisma.InputJsonValue;
}

function isDuplicateStripeEventError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

function jsonRecord(value: Prisma.JsonValue | null): Record<string, Prisma.JsonValue> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, Prisma.JsonValue>)
    : {};
}

function subscriptionDetails(invoice: Stripe.Invoice) {
  return invoice.parent?.type === "subscription_details"
    ? invoice.parent.subscription_details
    : null;
}

async function stripePaymentFailureMessage(invoice: Stripe.Invoice) {
  const invoiceWithPaymentIntent = invoice as Stripe.Invoice & {
    payment_intent?: string | Stripe.PaymentIntent | null;
  };
  let paymentIntent = invoiceWithPaymentIntent.payment_intent;
  if (typeof paymentIntent === "string") {
    try {
      paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntent);
    } catch (error) {
      console.warn("Unable to retrieve the failed Stripe invoice payment intent", { error });
      paymentIntent = null;
    }
  }
  if (paymentIntent && paymentIntent.last_payment_error) {
    const error = paymentIntent.last_payment_error;
    return [error.code, error.message].filter(Boolean).join(": ") || "Stripe could not collect the payment.";
  }

  return invoice.last_finalization_error?.message ?? "Stripe could not collect the payment.";
}

function stripeIntentFailureMessage(paymentIntent: Stripe.PaymentIntent) {
  const error = paymentIntent.last_payment_error;
  return error
    ? [error.code, error.message].filter(Boolean).join(": ") || "Stripe could not collect the payment."
    : "Stripe could not collect the payment.";
}

async function resolveInstallmentInvoice(invoice: Stripe.Invoice) {
  const details = subscriptionDetails(invoice);
  const subscriptionId = stripeId(details?.subscription ?? null);
  let metadata = details?.metadata ?? null;

  if (metadata?.flowType !== "ticket_installment" && subscriptionId) {
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
    metadata = subscription.metadata;
  }

  if (
    metadata?.flowType !== "ticket_installment" ||
    metadata.installmentNumber !== "2" ||
    !metadata.paymentId
  ) {
    return null;
  }

  return { paymentId: metadata.paymentId, subscriptionId };
}

async function handleInitialCheckout(event: Stripe.Event, session: Stripe.Checkout.Session) {
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

  const payment = await prisma.payment.findFirst({
    where: {
      purchaseType: "TICKET",
      OR: [
        { id: session.metadata?.paymentId ?? "__missing__" },
        { stripeCheckoutSessionId: session.id },
        { id: primary.paymentId ?? "__missing__" },
      ],
    },
  });
  if (!payment) throw new Error("Ticket payment was not found for the Stripe event.");

  const ticketIds = tickets.map((ticket) => ticket.id);
  const paymentIntentId = stripeId(session.payment_intent);
  const customerId = stripeId(session.customer);
  const firstPaidAt = new Date(event.created * 1000);
  const installmentAmounts = splitTicketTotalIntoTwoPayments(payment.amount);
  const isInstallment = payment.paymentPlan === "TWO_INSTALLMENTS";
  const expectedCheckoutAmount = isInstallment
    ? installmentAmounts.firstAmountCents
    : payment.amount;

  if (isInstallment && session.payment_status !== "paid") {
    throw new Error("Ticket payment #1 has not been paid.");
  }
  if (session.amount_total !== expectedCheckoutAmount) {
    throw new Error("Stripe ticket amount does not match the stored payment plan.");
  }

  const schedule = isInstallment
    ? payment.stripeSubscriptionScheduleId
      ? {
          scheduleId: payment.stripeSubscriptionScheduleId,
          subscriptionId: payment.stripeSubscriptionId,
          secondPaymentDueAt: new Date(
            (event.created + SECOND_INSTALLMENT_DELAY_SECONDS) * 1000
          ),
        }
      : await createSecondInstallmentSchedule({
          session,
          paymentId: payment.id,
          ticketIds,
          secondAmountCents: installmentAmounts.secondAmountCents,
          firstPaidAtUnix: event.created,
        })
    : null;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.stripeWebhook.create({
        data: {
          eventId: event.id,
          eventType: event.type,
          payload: serializeStripeEvent(event),
          state: "PROCESSING",
          attempts: 1,
          lastAttemptAt: firstPaidAt,
        },
      });
      const currentPayment = await tx.payment.findUnique({ where: { id: payment.id } });
      if (!currentPayment) throw new Error("Ticket payment disappeared during webhook processing.");

      await tx.ticket.updateMany({
        where: { id: { in: ticketIds }, status: "PENDING" },
        data: {
          status: "PAID",
          paidAt: firstPaidAt,
          paymentId: payment.id,
          revision: { increment: 1 },
        },
      });

      const pricingSnapshot = isInstallment
        ? {
            ...jsonRecord(currentPayment.pricingSnapshot),
            installments: {
              ...installmentAmounts,
              firstPaidAt: firstPaidAt.toISOString(),
              secondPaymentDueAt: schedule!.secondPaymentDueAt.toISOString(),
            },
          }
        : currentPayment.pricingSnapshot ?? Prisma.JsonNull;
      const alreadyFullyPaid = currentPayment.status === "PAID";

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: alreadyFullyPaid
            ? "PAID"
            : isInstallment
              ? "PARTIALLY_PAID"
              : "PAID",
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
          stripeCustomerId: customerId,
          stripeSubscriptionScheduleId: schedule?.scheduleId ?? null,
          stripeSubscriptionId: schedule?.subscriptionId ?? currentPayment.stripeSubscriptionId,
          pricingSnapshot,
          paidAt: isInstallment ? currentPayment.paidAt : firstPaidAt,
          nextPaymentAt: schedule?.secondPaymentDueAt ?? null,
          lastPaymentError: null,
          lastPaymentFailedAt: null,
          fulfilledAt: currentPayment.fulfilledAt ?? firstPaidAt,
        },
      });

      const notificationId = jsonRecord(currentPayment.pricingSnapshot).notificationId;
      if (typeof notificationId === "string") {
        const notification = await tx.notification.findUnique({ where: { id: notificationId } });
        if (notification) {
          const content = parseNotificationContent(notification.content);
          if (content.kind === "SPECIAL_OFFER_2_DAYS") {
            await tx.notification.update({
              where: { id: notification.id },
              data: {
                isViewed: true,
                dateViewed: notification.dateViewed ?? firstPaidAt,
                content: {
                  ...content,
                  state: {
                    ...content.state,
                    status: "PURCHASED",
                    purchasedAt: firstPaidAt.toISOString(),
                  },
                },
              },
            });
          }
        }
      }

      for (const ticketId of ticketIds) await ensureActiveTicketQr(ticketId, tx);
      await tx.stripeWebhook.update({
        where: { eventId: event.id },
        data: { state: "PROCESSED", processedAt: firstPaidAt, paymentId: payment.id },
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
        specialOffer: ticket.origin === "SPECIAL_OFFER",
      });
    } catch (error) {
      console.error("Failed to send ticket confirmation email", { ticketId: ticket.id, error });
    }
  }
  try {
    await sendTicketPaymentAdminNotificationEmail({
      attendeeNames: tickets.map((ticket) => ticket.fullName).join(", "),
      attendeeEmails: tickets.map((ticket) => ticket.email).join(", "),
      ticketSummary: tickets
        .map((ticket) => `${ticket.type === "ONE_DAY" ? "1-Day Forum Pass" : "2-Day Forum Pass"}${ticket.galaDinner ? " + Gala Dinner" : ""}`)
        .join("; "),
      totalAmount: payment.amount,
      paidAmount: isInstallment ? installmentAmounts.firstAmountCents : payment.amount,
      nextAmount: isInstallment ? installmentAmounts.secondAmountCents : null,
      currency: payment.currency,
      paymentStatus: isInstallment ? "PARTIALLY_PAID" : "PAID",
      nextPaymentAt: schedule?.secondPaymentDueAt ?? null,
      stripeSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
    });
  } catch (error) {
    console.error("Failed to send ticket payment admin notification email", { paymentId: payment.id, error });
  }
  return true;
}

async function handleSecondInstallmentInvoice(event: Stripe.Event, invoice: Stripe.Invoice) {
  const resolved = await resolveInstallmentInvoice(invoice);
  if (!resolved) return false;

  const payment = await prisma.payment.findUnique({ where: { id: resolved.paymentId } });
  if (!payment || payment.purchaseType !== "TICKET" || payment.paymentPlan !== "TWO_INSTALLMENTS") {
    throw new Error("The ticket installment invoice does not match a two-payment order.");
  }
  const { secondAmountCents } = splitTicketTotalIntoTwoPayments(payment.amount);
  if (invoice.amount_due !== secondAmountCents) {
    throw new Error("Stripe invoice amount does not match ticket payment #2.");
  }

  const processedAt = new Date(event.created * 1000);
  if (event.type === "invoice.paid" && payment.stripeSubscriptionScheduleId) {
    await cancelSecondInstallmentSchedule({
      scheduleId: payment.stripeSubscriptionScheduleId,
      paymentId: payment.id,
    });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.stripeWebhook.create({
        data: {
          eventId: event.id,
          eventType: event.type,
          payload: serializeStripeEvent(event),
          state: "PROCESSING",
          attempts: 1,
          lastAttemptAt: processedAt,
          paymentId: payment.id,
        },
      });

      if (event.type === "invoice.paid") {
        const paidAtUnix = invoice.status_transitions.paid_at ?? event.created;
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            paidAt: new Date(paidAtUnix * 1000),
            nextPaymentAt: null,
            lastPaymentError: null,
            lastPaymentFailedAt: null,
            stripeSubscriptionId: resolved.subscriptionId,
          },
        });
      } else {
        await tx.payment.updateMany({
          where: { id: payment.id, status: { not: "PAID" } },
          data: {
            status: "PAST_DUE",
            lastPaymentError: await stripePaymentFailureMessage(invoice),
            lastPaymentFailedAt: processedAt,
            stripeSubscriptionId: resolved.subscriptionId,
          },
        });
      }

      await tx.stripeWebhook.update({
        where: { eventId: event.id },
        data: { state: "PROCESSED", processedAt, paymentId: payment.id },
      });
    });
  } catch (error) {
    if (isDuplicateStripeEventError(error)) return true;
    throw error;
  }

  return true;
}

async function handleTicketPaymentIntentFailed(event: Stripe.Event, paymentIntent: Stripe.PaymentIntent) {
  if (paymentIntent.metadata?.flowType !== "ticket" || !paymentIntent.metadata.paymentId) return false;

  const paymentId = paymentIntent.metadata.paymentId;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.stripeWebhook.create({
        data: {
          eventId: event.id,
          eventType: event.type,
          payload: serializeStripeEvent(event),
          state: "PROCESSING",
          attempts: 1,
          lastAttemptAt: new Date(event.created * 1000),
          paymentId,
        },
      });
      await tx.payment.updateMany({
        where: { id: paymentId, status: { not: "PAID" } },
        data: {
          status: "FAILED",
          lastPaymentError: stripeIntentFailureMessage(paymentIntent),
          lastPaymentFailedAt: new Date(event.created * 1000),
        },
      });
      await tx.stripeWebhook.update({
        where: { eventId: event.id },
        data: { state: "PROCESSED", processedAt: new Date(event.created * 1000), paymentId },
      });
    });
  } catch (error) {
    if (isDuplicateStripeEventError(error)) return true;
    throw error;
  }

  return true;
}

export async function handleTicketStripeEvent(event: Stripe.Event): Promise<boolean> {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.flowType !== "ticket") return false;
    return handleInitialCheckout(event, session);
  }

  if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
    return handleSecondInstallmentInvoice(event, event.data.object as Stripe.Invoice);
  }

  if (event.type === "payment_intent.payment_failed") {
    return handleTicketPaymentIntentFailed(event, event.data.object as Stripe.PaymentIntent);
  }

  return false;
}
