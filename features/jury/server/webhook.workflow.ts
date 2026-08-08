import { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { sendSetupEmailForAccount, upsertJuryAccountForApplication } from "@/features/account/server/accounts";
import { sendJuryPaymentConfirmedEmail } from "@/features/email/server/jury-email.workflow";
import { sendPaymentAdminNotificationEmail } from "@/features/email/server/payment-email.workflow";
import { syncJuryOnChange } from "@/features/google-sheets";
import { revalidatePublicJuryMembers } from "@/features/jury/server/queries";
import { prisma } from "@/shared/lib/prisma";

function serializeStripeEvent(event: Stripe.Event): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(event)) as Prisma.InputJsonValue;
}

function isDuplicateStripeEventError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

function applicationId(metadata: Record<string, string> | null | undefined) {
  return metadata?.juryApplicationId ?? null;
}

function paymentIntentId(value: string | Stripe.PaymentIntent | null) {
  if (!value) return null;
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
  const id =
    applicationId(session.metadata) ??
    (await prisma.payment
      .findUnique({ where: { stripeCheckoutSessionId: session.id }, select: { juryApplicationId: true } })
      .then((payment) => payment?.juryApplicationId ?? null));
  if (!id) return false;

  const intentId = paymentIntentId(session.payment_intent);
  let setupAccountId: string | null = null;
  let emailPayload: { to: string; fullName: string; amount: number; currency: string } | null = null;
  try {
    await prisma.$transaction(async (tx) => {
      const now = new Date();
      await tx.stripeWebhook.create({
        data: {
          eventId: event.id,
          eventType: event.type,
          payload: serializeStripeEvent(event),
          state: "PROCESSING",
          attempts: 1,
          lastAttemptAt: now,
        },
      });
      const payment = await tx.payment.findFirst({
        where: {
          juryApplicationId: id,
          purchaseType: "JURY",
          OR: [{ stripeCheckoutSessionId: session.id }, { status: "PENDING" }],
        },
        orderBy: { createdAt: "desc" },
      });
      if (!payment) throw new Error("Jury payment was not found for the Stripe event.");
      if (session.amount_total !== null && session.amount_total !== payment.amount) {
        throw new Error("Stripe jury amount does not match the stored payment.");
      }
      const application = await tx.juryApplication.findUnique({
        where: { id },
        include: { profile: true },
      });
      if (!application) throw new Error("Jury application was not found.");

      if (payment.status !== "PAID") {
        await tx.juryApplication.update({
          where: { id },
          data: { status: "PAID", approvedAt: application.approvedAt ?? now, rejectedAt: null },
        });
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            accountId: application.accountId,
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: intentId,
            paidAt: now,
            fulfilledAt: now,
          },
        });
        const { account } = await upsertJuryAccountForApplication(tx, {
          ...application,
          approvedCategories: application.profile?.approvedCategories ?? [],
          status: "PAID",
        });
        if (account.status !== "ACTIVE" || !account.passwordHash) setupAccountId = account.id;
        emailPayload = {
          to: application.email,
          fullName: application.fullName,
          amount: payment.amount,
          currency: payment.currency,
        };
      }
      await tx.stripeWebhook.update({
        where: { eventId: event.id },
        data: { state: "PROCESSED", processedAt: now, paymentId: payment.id },
      });
    });
  } catch (error) {
    if (isDuplicateStripeEventError(error)) return true;
    throw error;
  }

  syncJuryOnChange(id);
  revalidatePublicJuryMembers();
  if (setupAccountId) {
    try { await sendSetupEmailForAccount(setupAccountId); } catch (error) { console.error("Failed to send jury account setup email", error); }
  }
  if (emailPayload) {
    const payload = emailPayload as { to: string; fullName: string; amount: number; currency: string };
    try { await sendJuryPaymentConfirmedEmail(payload); } catch (error) { console.error("Failed to send jury payment confirmed email", error); }
    try {
      await sendPaymentAdminNotificationEmail({
        flowLabel: "Jury registration",
        applicantName: payload.fullName,
        applicantEmail: payload.to,
        amount: payload.amount,
        currency: payload.currency,
        stripeSessionId: session.id,
        stripePaymentIntentId: intentId,
      });
    } catch (error) {
      console.error("Failed to send jury payment admin notification email", error);
    }
  }
  return true;
}

async function handlePaymentFailed(event: Stripe.Event): Promise<boolean> {
  const intent = event.data.object as Stripe.PaymentIntent;
  const id = applicationId(intent.metadata);
  if (!id) return false;
  try {
    await prisma.$transaction(async (tx) => {
      const now = new Date();
      await tx.stripeWebhook.create({
        data: {
          eventId: event.id,
          eventType: event.type,
          payload: serializeStripeEvent(event),
          state: "PROCESSING",
          attempts: 1,
          lastAttemptAt: now,
        },
      });
      const payment = await tx.payment.findFirst({
        where: { juryApplicationId: id, purchaseType: "JURY", status: "PENDING" },
        orderBy: { createdAt: "desc" },
      });
      if (payment) {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED", stripePaymentIntentId: intent.id },
        });
      }
      await tx.stripeWebhook.update({
        where: { eventId: event.id },
        data: { state: "PROCESSED", processedAt: now, paymentId: payment?.id ?? null },
      });
    });
  } catch (error) {
    if (isDuplicateStripeEventError(error)) return true;
    throw error;
  }
  syncJuryOnChange(id);
  return true;
}
