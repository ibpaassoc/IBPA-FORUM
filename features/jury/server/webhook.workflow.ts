import { Prisma, type StripeWebhookEvent } from "@prisma/client";
import type Stripe from "stripe";
import { sendJuryPaymentConfirmedEmail } from "@/features/email/server/jury-email.workflow";
import { sendPaymentAdminNotificationEmail } from "@/features/email/server/payment-email.workflow";
import {
  sendSetupEmailForAccount,
  upsertJuryAccountForApplication,
} from "@/features/account/server/accounts";
import { syncJuryOnChange } from "@/features/google-sheets";
import { revalidatePublicJuryMembers } from "@/features/jury/server/queries";
import { prisma } from "@/shared/lib/prisma";

type JuryPaymentEmailPayload = {
  to: string;
  fullName: string;
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

function getApplicationIdFromMetadata(
  metadata: Record<string, string> | null | undefined
) {
  if (!metadata) {
    return null;
  }

  return metadata.juryApplicationId ?? null;
}

function getPaymentIntentId(value: string | Stripe.PaymentIntent | null) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

export async function handleJuryStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      return handleCheckoutCompleted(event);
    case "payment_intent.payment_failed":
      return handlePaymentFailed(event);
    default:
      return false;
  }
}

async function handleCheckoutCompleted(event: Stripe.Event): Promise<boolean> {
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
    return false;
  }

  const paymentIntentId = getPaymentIntentId(session.payment_intent);
  let emailPayload: JuryPaymentEmailPayload | null = null;
  let setupAccountId: string | null = null;

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
          phone: true,
          country: true,
          city: true,
          professionalTitle: true,
          yearsExperience: true,
          employerAffiliation: true,
          expertiseAreas: true,
          professionalBio: true,
          professionalWebsite: true,
          status: true,
          paymentStatus: true,
        },
      });

      if (!application || application.paymentStatus === "PAID") {
        return;
      }

      const paidAt = new Date();
      const paidStatus = "PAID" as const;

      await tx.juryApplication.update({
        where: { id: application.id },
        data: {
          status: "PAID",
          paymentStatus: "PAID",
          paidAt,
          stripeCheckoutSessionId: session.id,
        },
      });

      const { account } = await upsertJuryAccountForApplication(tx, {
        ...application,
        status: paidStatus,
      });

      await tx.payment.updateMany({
        where: { stripeSessionId: session.id },
        data: {
          status: "PAID",
          stripePaymentIntentId: paymentIntentId,
          paidAt,
        },
      });

      emailPayload = {
        to: application.email,
        fullName: application.fullName,
        amount: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
      };
      if (account.status !== "ACTIVE" || !account.passwordHash) {
        setupAccountId = account.id;
      }
    });
  } catch (error) {
    if (isDuplicateStripeEventError(error)) {
      return true;
    }

    throw error;
  }

  syncJuryOnChange(applicationId);

  // A newly paid member becomes visible on the public /jury listing — refresh
  // the cached listing so the "active" section reflects them immediately.
  revalidatePublicJuryMembers();

  if (!emailPayload) {
    return true;
  }

  if (setupAccountId) {
    try {
      await sendSetupEmailForAccount(setupAccountId);
    } catch (error) {
      console.error("Failed to send jury account setup email", error);
    }
  }

  const confirmedEmailPayload = emailPayload as JuryPaymentEmailPayload;

  try {
    await sendJuryPaymentConfirmedEmail(confirmedEmailPayload);
  } catch (error) {
    console.error("Failed to send jury payment confirmed email", error);
  }

  try {
    await sendPaymentAdminNotificationEmail({
      flowLabel: "Jury registration",
      applicantName: confirmedEmailPayload.fullName,
      applicantEmail: confirmedEmailPayload.to,
      amount: confirmedEmailPayload.amount,
      currency: confirmedEmailPayload.currency,
      stripeSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
    });
  } catch (error) {
    console.error("Failed to send jury payment admin notification email", error);
  }

  return true;
}

async function handlePaymentFailed(event: Stripe.Event): Promise<boolean> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const applicationId = getApplicationIdFromMetadata(paymentIntent.metadata);

  if (!applicationId) {
    return false;
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
      return true;
    }

    throw error;
  }

  syncJuryOnChange(applicationId);

  return true;
}
