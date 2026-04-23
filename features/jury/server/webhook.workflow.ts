import { Prisma, type StripeWebhookEvent } from "@prisma/client";
import type Stripe from "stripe";
import { sendJuryPaymentConfirmedEmail } from "@/features/email/server/jury-email.workflow";
import { prisma } from "@/shared/lib/prisma";

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

function getApplicationIdFromMetadata(
  metadata: Record<string, string> | null | undefined
) {
  if (!metadata) {
    return null;
  }

  return metadata.juryApplicationId ?? null;
}

export async function handleJuryStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event);
      return true;
    case "payment_intent.payment_failed":
      await handlePaymentFailed(event);
      return true;
    default:
      return false;
  }
}

async function handleCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const applicationId =
    getApplicationIdFromMetadata(session.metadata) ??
    (await prisma.juryApplication
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
    return;
  }

  let emailPayload: { to: string; fullName: string } | null = null;

  try {
    await prisma.$transaction(async (tx) => {
      await recordStripeEvent(tx, event);

      const application = await tx.juryApplication.findUnique({
        where: {
          id: applicationId,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          paymentStatus: true,
        },
      });

      if (!application || application.paymentStatus === "PAID") {
        return;
      }

      await tx.juryApplication.update({
        where: { id: application.id },
        data: {
          status: "PAID",
          paymentStatus: "PAID",
          paidAt: new Date(),
          stripeCheckoutSessionId: session.id,
        },
      });

      emailPayload = {
        to: application.email,
        fullName: application.fullName,
      };
    });
  } catch (error) {
    if (isDuplicateStripeEventError(error)) {
      return;
    }

    throw error;
  }

  if (!emailPayload) {
    return;
  }

  try {
    await sendJuryPaymentConfirmedEmail(emailPayload);
  } catch (error) {
    console.error("Failed to send jury payment confirmed email", error);
  }
}

async function handlePaymentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const applicationId = getApplicationIdFromMetadata(paymentIntent.metadata);

  if (!applicationId) {
    return;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await recordStripeEvent(tx, event);

      const application = await tx.juryApplication.findUnique({
        where: { id: applicationId },
        select: {
          paymentStatus: true,
        },
      });

      if (application && application.paymentStatus !== "PAID") {
        await tx.juryApplication.update({
          where: { id: applicationId },
          data: {
            paymentStatus: "FAILED",
          },
        });
      }
    });
  } catch (error) {
    if (isDuplicateStripeEventError(error)) {
      return;
    }

    throw error;
  }
}
