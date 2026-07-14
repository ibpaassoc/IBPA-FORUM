import { Prisma, type StripeWebhookEvent } from "@prisma/client";
import type Stripe from "stripe";
import { sendCompetitorApplicationConfirmedEmail } from "@/features/email/server/competitor-email.workflow";
import { sendPaymentAdminNotificationEmail } from "@/features/email/server/payment-email.workflow";
import {
  upsertApplicantAccountForApplication,
} from "@/features/account/server/accounts";
import { issueApplicantRegistrationLink } from "@/features/account/server/applicant-registration";
import { allocateApplicantNominationAmounts } from "@/features/applications/lib/pricing";
import {
  APPLICANT_NOMINATION_PURCHASE_FLOW,
  parseApplicantPurchaseManifest,
  type ApplicantPurchaseManifest,
} from "@/features/applications/server/purchase-workflow";
import { syncApplicationOnChange } from "@/features/google-sheets";
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

function getApplicantPurchasePaymentId(metadata: Record<string, string> | null | undefined) {
  if (!metadata || metadata.flowType !== APPLICANT_NOMINATION_PURCHASE_FLOW) {
    return null;
  }

  return metadata.paymentId ?? null;
}

function isApplicantPurchaseEvent(event: Stripe.Event) {
  const object = event.data.object as {
    metadata?: Record<string, string> | null;
  };
  return object.metadata?.flowType === APPLICANT_NOMINATION_PURCHASE_FLOW;
}

export async function handleCompetitorStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      if (isApplicantPurchaseEvent(event)) {
        return handleApplicantNominationCheckoutCompleted(event);
      }
      return handleCompetitorCheckoutCompleted(event);
    case "checkout.session.expired":
      if (isApplicantPurchaseEvent(event)) {
        return handleApplicantNominationCheckoutExpired(event);
      }
      return handleCompetitorCheckoutExpired(event);
    case "payment_intent.payment_failed":
      if (isApplicantPurchaseEvent(event)) {
        return handleApplicantNominationPaymentFailed(event);
      }
      return handleCompetitorPaymentFailed(event);
    default:
      return false;
  }
}

async function upsertApplicantAccountForPurchase(
  tx: Prisma.TransactionClient,
  manifest: ApplicantPurchaseManifest
) {
  const email = manifest.personalInfo.email;
  const existing = await tx.account.findUnique({
    where: { email },
    include: { applicantProfile: true },
  });

  if (existing && existing.role !== "APPLICANT") {
    throw new Error("Account role conflict for applicant purchase.");
  }

  const account =
    existing ??
    (await tx.account.create({
      data: {
        email,
        role: "APPLICANT",
        status: "INVITED",
      },
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
    membershipVerifiedAt: manifest.membership.verifiedAt
      ? new Date(manifest.membership.verifiedAt)
      : null,
    membershipVerificationSource: manifest.membership.verificationSource,
    preferredLocale: manifest.locale,
    websiteUrl: manifest.personalInfo.websiteUrl,
    socialUrl: manifest.personalInfo.socialUrl,
    reviewsUrl: manifest.personalInfo.reviewsUrl,
  };

  const profile = account.applicantProfile
    ? canUpdateProfile
      ? await tx.applicantProfile.update({
          where: { accountId: account.id },
          data: profileData,
        })
      : account.applicantProfile
    : await tx.applicantProfile.create({
        data: {
      accountId: account.id,
      ...profileData,
        },
      });

  return { account, profile, isNewAccount: !existing };
}

async function handleApplicantNominationCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const paymentId =
    getApplicantPurchasePaymentId(session.metadata) ??
    (await prisma.payment
      .findFirst({
        where: { stripeSessionId: session.id, source: "COMPETITOR" },
        select: { id: true },
      })
      .then((payment) => payment?.id ?? null));

  if (!paymentId) {
    return false;
  }

  const paymentIntentId = getPaymentIntentId(session.payment_intent);
  const setupAccountIds: string[] = [];

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
          purchaseManifest: true,
        },
      });

      if (!payment || payment.fulfilledAt || payment.status === "PAID") {
        return;
      }

      const manifest = parseApplicantPurchaseManifest(payment.purchaseManifest);
      if (!manifest) {
        throw new Error("Applicant nomination purchase manifest is missing or invalid.");
      }

      const amountTotal = session.amount_total ?? 0;
      const currency = (session.currency ?? "").toLowerCase();
      if (amountTotal !== payment.amount || currency !== payment.currency.toLowerCase()) {
        throw new Error("Stripe checkout amount does not match the stored applicant purchase.");
      }

      const paidAt = new Date();
      const { account, profile } = await upsertApplicantAccountForPurchase(tx, manifest);
      const amountAllocations = allocateApplicantNominationAmounts(
        payment.amount,
        manifest.selectedAwards.length
      );

      for (const [index, selectedAward] of manifest.selectedAwards.entries()) {
        await tx.nominationApplication.upsert({
          where: {
            applicantProfileId_awardId: {
              applicantProfileId: profile.id,
              awardId: selectedAward.awardId,
            },
          },
          create: {
            applicantProfileId: profile.id,
            purchasePaymentId: payment.id,
            awardId: selectedAward.awardId,
            categoryId: selectedAward.categoryId,
            status: "PURCHASED",
            paymentStatus: "PAID",
            amount: amountAllocations[index] ?? 0,
            currency: payment.currency,
            paidAt,
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: paymentIntentId,
          },
          update: {
            purchasePaymentId: payment.id,
            paymentStatus: "PAID",
            paidAt,
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: paymentIntentId,
          },
        });
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          applicantProfileId: profile.id,
          status: "PAID",
          paidAt,
          fulfilledAt: paidAt,
          stripeSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
        },
      });

      if (!account.passwordHash && account.status !== "ACTIVE" && !account.lastSetupEmailSentAt) {
        setupAccountIds.push(account.id);
      }
    });
  } catch (error) {
    if (isDuplicateStripeEventError(error)) {
      return true;
    }

    throw error;
  }

  const setupAccountId = setupAccountIds[0] ?? null;
  if (setupAccountId) {
    await issueApplicantRegistrationLink({ accountId: setupAccountId });
  }

  return true;
}

async function handleApplicantNominationCheckoutExpired(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const paymentId = getApplicantPurchasePaymentId(session.metadata);

  if (!paymentId) {
    return false;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await recordStripeEvent(tx, event);

      await tx.payment.updateMany({
        where: {
          id: paymentId,
          status: "PENDING",
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

async function handleApplicantNominationPaymentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const paymentId = getApplicantPurchasePaymentId(paymentIntent.metadata);

  if (!paymentId) {
    return false;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await recordStripeEvent(tx, event);

      await tx.payment.updateMany({
        where: {
          id: paymentId,
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
  let setupAccountId: string | null = null;

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
          phone: true,
          country: true,
          stateProvince: true,
          city: true,
          professionalTitle: true,
          yearsExperience: true,
          membershipNumber: true,
          membershipLevel: true,
          websiteUrl: true,
          socialUrl: true,
          reviewsUrl: true,
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
      const { account, profile } = await upsertApplicantAccountForApplication(tx, application);

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

      await tx.nominationApplication.updateMany({
        where: { applicationId: application.id },
        data: {
          applicantProfileId: profile.id,
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

  // Payment status / application status changed — mirror into Google Sheets.
  syncApplicationOnChange(applicationId);

  if (!emailPayload) {
    return true;
  }

  if (setupAccountId) {
    try {
      await issueApplicantRegistrationLink({ accountId: setupAccountId });
    } catch (error) {
      console.error("Failed to send applicant account setup email", error);
    }
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

  syncApplicationOnChange(applicationId);

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

  syncApplicationOnChange(applicationId);

  return true;
}
