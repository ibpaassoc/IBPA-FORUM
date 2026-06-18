import { Prisma, type StripeWebhookEvent } from "@prisma/client";
import type Stripe from "stripe";
import { sendCompetitorApplicationConfirmedEmail } from "@/features/email/server/competitor-email.workflow";
import { sendPaymentAdminNotificationEmail } from "@/features/email/server/payment-email.workflow";
import { prisma } from "@/shared/lib/prisma";

type CompetitorPaymentEmailPayload = {
  to: string;
  fullName: string;
  categoryName: string;
  awardName: string;
  amount: number;
  currency: string;
};

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

async function recordStripeEvent(
  tx: Prisma.TransactionClient,
  event: Stripe.Event
): Promise<StripeWebhookEvent> {
  return tx.stripeWebhookEvent.create({
    data: {
      stripeEventId: event.id,
      eventType: event.type,
      payloadJson: serializeStripeEvent(event),
    },
  });
}

function getPaymentIntentId(value: string | Stripe.PaymentIntent | null) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

function getCompetitorApplicationId(
  metadata: Record<string, string> | null | undefined
) {
  if (!metadata || metadata.flowType !== "competitor") {
    return null;
  }

  return metadata.applicationId ?? null;
}

export async function handleCompetitorStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      return handleCompetitorCheckoutCompleted(event);
    case "checkout.session.expired":
      return handleCompetitorCheckoutExpired(event);
    case "payment_intent.payment_failed":
      return handleCompetitorPaymentFailed(event);
    default:
      return false;
  }
}

async function handleCompetitorCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const applicationId =
    getCompetitorApplicationId(session.metadata) ??
    (await prisma.application
      .findFirst({
        where: {
          stripeCheckoutSessionId: session.id,
        },
        select: {
          id: true,
        },
      })
      .then((application) => application?.id ?? null));

  if (!applicationId) {
    return false;
  }

  const paymentIntentId = getPaymentIntentId(session.payment_intent);
  let emailPayload: CompetitorPaymentEmailPayload | null = null;

  try {
    await prisma.$transaction(async (tx) => {
      await recordStripeEvent(tx, event);

      const application = await tx.application.findUnique({
        where: {
          id: applicationId,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          amount: true,
          currency: true,
          paymentStatus: true,
          submittedAt: true,
          category: {
            select: {
              name: true,
            },
          },
          award: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!application || application.paymentStatus === "PAID") {
        return;
      }

      const paidAt = new Date();

      await tx.application.update({
        where: {
          id: application.id,
        },
        data: {
          status: "SUBMITTED",
          paymentStatus: "PAID",
          paidAt,
          submittedAt: application.submittedAt ?? paidAt,
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
        },
      });

      await tx.payment.updateMany({
        where: {
          stripeSessionId: session.id,
        },
        data: {
          status: "PAID",
          stripePaymentIntentId: paymentIntentId,
          paidAt,
        },
      });

      emailPayload = {
        to: application.email,
        fullName: application.fullName,
        categoryName: application.category.name,
        awardName: application.award.name,
        amount: application.amount,
        currency: application.currency,
      };
    });
  } catch (error) {
    if (isDuplicateStripeEventError(error)) {
      return true;
    }

    throw error;
  }

  if (!emailPayload) {
    return true;
  }

  const confirmedEmailPayload =
    emailPayload as CompetitorPaymentEmailPayload;

  try {
    await sendCompetitorApplicationConfirmedEmail({
      to: confirmedEmailPayload.to,
      fullName: confirmedEmailPayload.fullName,
      categoryName: confirmedEmailPayload.categoryName,
      awardName: confirmedEmailPayload.awardName,
      amount: confirmedEmailPayload.amount,
      currency: confirmedEmailPayload.currency,
    });
  } catch (error) {
    console.error("Failed to send competitor payment confirmation email", error);
  }

  try {
    await sendPaymentAdminNotificationEmail({
      flowLabel: "Competitor application",
      applicantName: confirmedEmailPayload.fullName,
      applicantEmail: confirmedEmailPayload.to,
      amount: confirmedEmailPayload.amount,
      currency: confirmedEmailPayload.currency,
      stripeSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
    });
  } catch (error) {
    console.error("Failed to send competitor payment admin notification email", error);
  }

  return true;
}

async function handleCompetitorCheckoutExpired(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const applicationId = getCompetitorApplicationId(session.metadata);

  if (!applicationId) {
    return false;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await recordStripeEvent(tx, event);

      const application = await tx.application.findUnique({
        where: {
          id: applicationId,
        },
        select: {
          stripeCheckoutSessionId: true,
          paymentStatus: true,
        },
      });

      if (!application || application.paymentStatus === "PAID") {
        return;
      }

      if (application.stripeCheckoutSessionId === session.id) {
        await tx.application.update({
          where: {
            id: applicationId,
          },
          data: {
            paymentStatus: "EXPIRED",
          },
        });
      }

      await tx.payment.updateMany({
        where: {
          stripeSessionId: session.id,
        },
        data: {
          status: "EXPIRED",
        },
      });
    });
  } catch (error) {
    if (isDuplicateStripeEventError(error)) {
      return true;
    }

    throw error;
  }

  return true;
}

async function handleCompetitorPaymentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const applicationId = getCompetitorApplicationId(paymentIntent.metadata);

  if (!applicationId) {
    return false;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await recordStripeEvent(tx, event);

      const application = await tx.application.findUnique({
        where: {
          id: applicationId,
        },
        select: {
          paymentStatus: true,
        },
      });

      if (!application || application.paymentStatus === "PAID") {
        return;
      }

      await tx.application.update({
        where: {
          id: applicationId,
        },
        data: {
          paymentStatus: "FAILED",
          stripePaymentIntentId: paymentIntent.id,
        },
      });

      await tx.payment.updateMany({
        where: {
          applicationId,
          status: "PENDING",
        },
        data: {
          status: "FAILED",
          stripePaymentIntentId: paymentIntent.id,
        },
      });
    });
  } catch (error) {
    if (isDuplicateStripeEventError(error)) {
      return true;
    }

    throw error;
  }

  return true;
}
