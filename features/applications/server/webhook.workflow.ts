import { Prisma, type StripeWebhook } from "@prisma/client";
import type Stripe from "stripe";
import { issueApplicantRegistrationLink } from "@/features/account/server/applicant-registration";
import { accountIdentity } from "@/features/account/server/accounts";
import {
  emptyNominationAnswers,
  emptyStoredFiles,
} from "@/features/database/json-fields";
import { sendCompetitorApplicationConfirmedEmail } from "@/features/email/server/competitor-email.workflow";
import { sendPaymentAdminNotificationEmail } from "@/features/email/server/payment-email.workflow";
import {
  APPLICANT_NOMINATION_PURCHASE_FLOW,
  parseApplicantPurchaseManifest,
  type ApplicantPurchaseManifest,
} from "@/features/applications/server/purchase-workflow";
import { syncApplicationOnChange } from "@/features/google-sheets";
import { getCategoryScoringDefinition } from "@/features/jury/scoring/category-scoring";
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
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

async function recordStripeEvent(
  tx: Prisma.TransactionClient,
  event: Stripe.Event
): Promise<StripeWebhook> {
  return tx.stripeWebhook.create({
    data: {
      eventId: event.id,
      eventType: event.type,
      payload: serializeStripeEvent(event),
      state: "PROCESSING",
      attempts: 1,
      lastAttemptAt: new Date(),
    },
  });
}

async function markStripeEventProcessed(
  tx: Prisma.TransactionClient,
  eventId: string,
  paymentId: string | null
) {
  await tx.stripeWebhook.update({
    where: { eventId },
    data: { state: "PROCESSED", processedAt: new Date(), paymentId },
  });
}

function getPaymentIntentId(value: string | Stripe.PaymentIntent | null) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function getApplicantPurchasePaymentId(metadata: Record<string, string> | null | undefined) {
  if (!metadata || metadata.flowType !== APPLICANT_NOMINATION_PURCHASE_FLOW) return null;
  return metadata.paymentId ?? null;
}

export async function handleCompetitorStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      return handleApplicantNominationCheckoutCompleted(event);
    case "checkout.session.expired":
      return handleApplicantNominationCheckoutExpired(event);
    case "payment_intent.payment_failed":
      return handleApplicantNominationPaymentFailed(event);
    default:
      return false;
  }
}

async function upsertApplicantAccountForPurchase(
  tx: Prisma.TransactionClient,
  manifest: ApplicantPurchaseManifest
) {
  const email = manifest.personalInfo.email.trim().toLowerCase();
  const existing = await tx.account.findUnique({
    where: accountIdentity(email, "APPLICANT"),
    include: { applicantProfile: true },
  });
  const account =
    existing ??
    (await tx.account.create({
      data: { email, normalizedEmail: email, role: "APPLICANT", status: "INVITED" },
      include: { applicantProfile: true },
    }));

  const canUpdateProfile = !existing || !existing.passwordHash || existing.status !== "ACTIVE";
  const profileData = {
    fullName: manifest.personalInfo.fullName,
    phone: manifest.personalInfo.phone,
    country: manifest.personalInfo.country,
    stateProvince: manifest.personalInfo.stateProvince,
    city: manifest.personalInfo.city,
    professionalTitle: manifest.personalInfo.professionalTitle,
    yearsExperience: manifest.personalInfo.yearsExperience,
    membershipNumber: manifest.membership.membershipNumber,
    membershipLevel: manifest.membership.membershipLevel,
    preferredLocale: manifest.locale,
    websiteUrl: manifest.personalInfo.websiteUrl,
    socialUrl: manifest.personalInfo.socialUrl,
    reviewsUrl: manifest.personalInfo.reviewsUrl,
  };
  const profile = account.applicantProfile
    ? canUpdateProfile
      ? await tx.applicantProfile.update({ where: { accountId: account.id }, data: profileData })
      : account.applicantProfile
    : await tx.applicantProfile.create({ data: { accountId: account.id, ...profileData } });

  return { account, profile };
}

async function handleApplicantNominationCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const paymentId =
    getApplicantPurchasePaymentId(session.metadata) ??
    (await prisma.payment
      .findFirst({
        where: { stripeCheckoutSessionId: session.id, purchaseType: "NOMINATION" },
        select: { id: true },
      })
      .then((payment) => payment?.id ?? null));
  if (!paymentId) return false;

  const paymentIntentId = getPaymentIntentId(session.payment_intent);
  let setupAccountId: string | null = null;
  let fulfilledProfileId: string | null = null;
  let emailPayload: CompetitorPaymentEmailPayload | null = null;

  try {
    await prisma.$transaction(async (tx) => {
      await recordStripeEvent(tx, event);
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          fulfilledAt: true,
          pricingSnapshot: true,
        },
      });
      if (!payment) throw new Error("Applicant nomination payment was not found.");

      if (!payment.fulfilledAt && payment.status !== "PAID") {
        const manifest = parseApplicantPurchaseManifest(payment.pricingSnapshot);
        if (!manifest) throw new Error("Applicant nomination purchase manifest is missing or invalid.");
        const amountTotal = session.amount_total ?? 0;
        const currency = (session.currency ?? "").toLowerCase();
        if (amountTotal !== payment.amount || currency !== payment.currency.toLowerCase()) {
          throw new Error("Stripe checkout amount does not match the stored applicant purchase.");
        }

        const paidAt = new Date();
        const { account, profile } = await upsertApplicantAccountForPurchase(tx, manifest);
        fulfilledProfileId = profile.id;
        for (const selectedAward of manifest.selectedAwards) {
          const existingNomination = await tx.nomination.findFirst({
            where: {
              applicantProfileId: profile.id,
              awardId: selectedAward.awardId,
              status: { not: "ARCHIVED" },
            },
            select: { id: true },
          });
          if (!existingNomination) {
            await tx.nomination.create({
              data: {
                applicantProfileId: profile.id,
                paymentId: payment.id,
                awardId: selectedAward.awardId,
                categoryId: selectedAward.categoryId,
                status: "DRAFT",
                answers: emptyNominationAnswers() as unknown as Prisma.InputJsonValue,
                files: emptyStoredFiles() as unknown as Prisma.InputJsonValue,
                scoringSchema: getCategoryScoringDefinition(
                  selectedAward.categorySlug
                ) as Prisma.InputJsonValue,
              },
            });
          }
        }
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            accountId: account.id,
            status: "PAID",
            paidAt,
            fulfilledAt: paidAt,
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: paymentIntentId,
          },
        });
        if (!account.passwordHash && account.status !== "ACTIVE" && !account.lastSetupEmailSentAt) {
          setupAccountId = account.id;
        }
        const firstNomination = manifest.selectedAwards[0];
        emailPayload = {
          to: manifest.personalInfo.email,
          fullName: manifest.personalInfo.fullName,
          categoryName: firstNomination?.categoryName ?? "IBPA Beauty Award",
          awardName:
            manifest.selectedAwards.length === 1
              ? firstNomination?.awardName ?? "Nomination"
              : `${manifest.selectedAwards.length} nominations`,
          amount: payment.amount,
          currency: payment.currency,
        };
      }
      await markStripeEventProcessed(tx, event.id, payment.id);
    });
  } catch (error) {
    if (isDuplicateStripeEventError(error)) return true;
    throw error;
  }

  if (setupAccountId) await issueApplicantRegistrationLink({ accountId: setupAccountId });
  if (fulfilledProfileId) syncApplicationOnChange(fulfilledProfileId);
  if (emailPayload) {
    const confirmed = emailPayload as CompetitorPaymentEmailPayload;
    try {
      await sendCompetitorApplicationConfirmedEmail(confirmed);
    } catch (error) {
      console.error("Failed to send competitor payment confirmation email", error);
    }
    try {
      await sendPaymentAdminNotificationEmail({
        flowLabel: "Competitor nominations",
        applicantName: confirmed.fullName,
        applicantEmail: confirmed.to,
        amount: confirmed.amount,
        currency: confirmed.currency,
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
      });
    } catch (error) {
      console.error("Failed to send competitor payment admin notification email", error);
    }
  }
  return true;
}

async function handleApplicantNominationCheckoutExpired(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const paymentId =
    getApplicantPurchasePaymentId(session.metadata) ??
    (await prisma.payment
      .findFirst({
        where: { stripeCheckoutSessionId: session.id, purchaseType: "NOMINATION" },
        select: { id: true },
      })
      .then((payment) => payment?.id ?? null));
  if (!paymentId) return false;
  try {
    await prisma.$transaction(async (tx) => {
      await recordStripeEvent(tx, event);
      await tx.payment.updateMany({
        where: { id: paymentId, status: "PENDING", stripeCheckoutSessionId: session.id },
        data: { status: "EXPIRED" },
      });
      await markStripeEventProcessed(tx, event.id, paymentId);
    });
  } catch (error) {
    if (isDuplicateStripeEventError(error)) return true;
    throw error;
  }
  return true;
}

async function handleApplicantNominationPaymentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const paymentId =
    getApplicantPurchasePaymentId(paymentIntent.metadata) ??
    (await prisma.payment
      .findUnique({ where: { stripePaymentIntentId: paymentIntent.id }, select: { id: true } })
      .then((payment) => payment?.id ?? null));
  if (!paymentId) return false;
  try {
    await prisma.$transaction(async (tx) => {
      await recordStripeEvent(tx, event);
      await tx.payment.updateMany({
        where: { id: paymentId, status: "PENDING" },
        data: { status: "FAILED", stripePaymentIntentId: paymentIntent.id },
      });
      await markStripeEventProcessed(tx, event.id, paymentId);
    });
  } catch (error) {
    if (isDuplicateStripeEventError(error)) return true;
    throw error;
  }
  return true;
}
