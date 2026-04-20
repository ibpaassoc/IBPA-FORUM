import { put } from "@vercel/blob";
import {
  Prisma,
  type JuryApplicationStatus,
  type StripeWebhookEvent,
} from "@prisma/client";
import { randomUUID } from "node:crypto";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
  sendJuryApplicationReceivedEmail,
  sendJuryApprovalPaymentEmail,
  sendJuryPaymentConfirmedEmail,
  sendJuryRejectionEmail,
} from "@/lib/email";
import { constructStripeEvent, createJuryCheckoutSession, getAppUrl } from "@/lib/stripe/server";
import { createRegistrationToken, hashRegistrationToken } from "@/lib/jury/tokens";

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function isFilledFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

function toOptionalText(value: string) {
  return value || null;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function saveUploadedFile(
  file: File,
  applicationId: string,
  fieldKey: string,
  index = 0
) {
  const safeFileName = sanitizeFileName(file.name);
  const pathname = `jury/${applicationId}/${fieldKey}-${index + 1}-${safeFileName}`;

  const blob = await put(pathname, file, {
    access: "private",
    addRandomSuffix: true,
    contentType: file.type || "application/octet-stream",
  });

  return {
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    fileSize: file.size,
    storageKey: blob.pathname,
  };
}

function buildJuryFieldErrors(formData: FormData) {
  const fullName = getText(formData, "fullName");
  const email = getText(formData, "email");
  const phone = getText(formData, "phone");
  const country = getText(formData, "country");
  const city = getText(formData, "city");
  const professionalTitle = getText(formData, "professionalTitle");
  const employerAffiliation = getText(formData, "employerAffiliation");
  const previousJudgingExperience = getText(formData, "previousJudgingExperience");
  const previousJudgingDetails = getText(formData, "previousJudgingDetails");
  const professionalBio = getText(formData, "professionalBio");
  const conflictDisclosure = getText(formData, "conflictDisclosure");
  const motivation = getText(formData, "motivation");
  const confidentialityAgreement = getText(formData, "confidentialityAgreement");
  const yearsExperience = Number(getText(formData, "yearsExperience"));
  const expertise = formData
    .getAll("expertise")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const profilePhoto = formData.get("profilePhoto");
  const certifications = formData
    .getAll("certifications")
    .filter((value): value is File => isFilledFile(value));

  const fieldErrors: Record<string, string> = {};

  if (!fullName) fieldErrors.fullName = "Full legal name is required.";
  if (!email || !isValidEmail(email)) {
    fieldErrors.email = "A valid email address is required.";
  }
  if (!phone) fieldErrors.phone = "Phone or WhatsApp is required.";
  if (!country) fieldErrors.country = "Country is required.";
  if (!city) fieldErrors.city = "City is required.";
  if (!professionalTitle) {
    fieldErrors.professionalTitle = "Professional title is required.";
  }
  if (!Number.isFinite(yearsExperience) || yearsExperience < 5) {
    fieldErrors.yearsExperience =
      "Jury candidates must have at least 5 years of experience.";
  }
  if (!employerAffiliation) {
    fieldErrors.employerAffiliation =
      "Current employer or affiliation is required.";
  }
  if (!previousJudgingExperience) {
    fieldErrors.previousJudgingExperience =
      "Please tell us whether you have previous judging experience.";
  }
  if (previousJudgingExperience === "yes" && !previousJudgingDetails) {
    fieldErrors.previousJudgingDetails =
      "Please describe your previous judging experience.";
  }
  if (expertise.length === 0) {
    fieldErrors.expertise = "Select at least one area of expertise.";
  }
  if (certifications.length === 0) {
    fieldErrors.certifications =
      "Upload at least one professional certification.";
  }
  if (!professionalBio) {
    fieldErrors.professionalBio = "Professional bio is required.";
  }
  if (!isFilledFile(profilePhoto)) {
    fieldErrors.profilePhoto = "Profile photo is required.";
  }
  if (!conflictDisclosure) {
    fieldErrors.conflictDisclosure =
      "Conflict of interest disclosure is required.";
  }
  if (confidentialityAgreement !== "yes") {
    fieldErrors.confidentialityAgreement =
      "You must accept the confidentiality agreement.";
  }
  if (!motivation) {
    fieldErrors.motivation =
      "Please tell us why you want to serve as a judge.";
  }

  return fieldErrors;
}

export async function submitJuryApplication(formData: FormData) {
  const fieldErrors = buildJuryFieldErrors(formData);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 400,
      body: {
        message:
          "Please complete all required jury application fields before submitting.",
        fieldErrors,
      },
    };
  }

  const fullName = getText(formData, "fullName");
  const email = getText(formData, "email");
  const normalizedEmail = email.toLowerCase();
  const phone = getText(formData, "phone");
  const country = getText(formData, "country");
  const city = getText(formData, "city");
  const professionalTitle = getText(formData, "professionalTitle");
  const employerAffiliation = getText(formData, "employerAffiliation");
  const previousJudgingExperience = getText(formData, "previousJudgingExperience");
  const previousJudgingDetails = getText(formData, "previousJudgingDetails");
  const pastWinner = getText(formData, "pastWinner");
  const pastWinnerYear = getText(formData, "pastWinnerYear");
  const professionalBio = getText(formData, "professionalBio");
  const professionalWebsite = getText(formData, "professionalWebsite");
  const conflictDisclosure = getText(formData, "conflictDisclosure");
  const motivation = getText(formData, "motivation");
  const yearsExperience = Number(getText(formData, "yearsExperience"));
  const expertise = formData
    .getAll("expertise")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const profilePhoto = formData.get("profilePhoto");
  const certifications = formData
    .getAll("certifications")
    .filter((value): value is File => isFilledFile(value));

  const existingApplication = await prisma.juryApplication.findFirst({
    where: {
      email: normalizedEmail,
    },
    select: {
      id: true,
    },
  });

  if (existingApplication) {
    return {
      status: 409,
      body: {
        message: "You already submitted the application.",
      },
    };
  }

  if (!isFilledFile(profilePhoto)) {
    return {
      status: 400,
      body: {
        message: "Profile photo is required.",
      },
    };
  }

  const applicationId = randomUUID();
  const savedProfilePhoto = await saveUploadedFile(
    profilePhoto,
    applicationId,
    "profilePhoto"
  );
  const savedCertifications = await Promise.all(
    certifications.map((file, index) =>
      saveUploadedFile(file, applicationId, "certifications", index)
    )
  );

  const juryApplication = await prisma.juryApplication.create({
    data: {
      id: applicationId,
      fullName,
      email: normalizedEmail,
      phone,
      country,
      city,
      professionalTitle,
      yearsExperience,
      employerAffiliation,
      previousJudgingExperience: previousJudgingExperience === "yes",
      previousJudgingDetails: toOptionalText(previousJudgingDetails),
      pastWinner: pastWinner === "yes",
      pastWinnerYear: pastWinnerYear ? Number(pastWinnerYear) : null,
      expertiseAreas: expertise,
      professionalBio,
      professionalWebsite: toOptionalText(professionalWebsite),
      conflictDisclosure,
      confidentialityAgreementAccepted: true,
      motivation,
      status: "PENDING_REVIEW",
      paymentStatus: "NOT_REQUIRED",
      submittedAt: new Date(),
      files: {
        create: [
          {
            fieldKey: "profilePhoto",
            ...savedProfilePhoto,
          },
          ...savedCertifications.map((file) => ({
            fieldKey: "certifications",
            ...file,
          })),
        ],
      },
    },
    select: {
      id: true,
      fullName: true,
      city: true,
      country: true,
      expertiseAreas: true,
      status: true,
    },
  });

  try {
    await sendJuryApplicationReceivedEmail({
      to: normalizedEmail,
      fullName,
    });
  } catch (error) {
    console.error("Failed to send jury application received email", error);
  }

  return {
    status: 201,
    body: {
      message:
        "Your jury application has been received. IBPA review may take up to 14 business days.",
      id: juryApplication.id,
      status: juryApplication.status,
      summary: {
        name: juryApplication.fullName,
        location: `${juryApplication.city}, ${juryApplication.country}`,
        expertise: juryApplication.expertiseAreas,
      },
    },
  };
}

export async function saveJuryApplicationNotes({
  id,
  adminNotes,
}: {
  id: string;
  adminNotes: string;
}) {
  const application = await prisma.juryApplication.findUnique({
    where: { id },
    select: {
      status: true,
    },
  });

  if (!application) {
    throw new Error("Jury application not found.");
  }

  const nextStatus: JuryApplicationStatus =
    application.status === "PENDING_REVIEW" ? "UNDER_REVIEW" : application.status;

  await prisma.juryApplication.update({
    where: { id },
    data: {
      status: nextStatus,
      adminNotes: adminNotes || null,
      reviewedAt: new Date(),
    },
  });
}

export async function approveJuryApplication(id: string) {
  const application = await prisma.juryApplication.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
      paymentStatus: true,
    },
  });

  if (!application) {
    throw new Error("Jury application not found.");
  }

  if (application.status === "REJECTED" || application.status === "ACTIVE_JUDGE") {
    throw new Error("This jury application cannot be approved from its current status.");
  }

  const session = await createJuryCheckoutSession({
    applicationId: application.id,
    applicantEmail: application.email,
  });

  await prisma.juryApplication.update({
    where: { id },
    data: {
      status: "APPROVED",
      paymentStatus: "PENDING",
      approvedAt: new Date(),
      reviewedAt: new Date(),
      stripeCheckoutSessionId: session.id,
    },
  });

  try {
    await sendJuryApprovalPaymentEmail({
      to: application.email,
      fullName: application.fullName,
      checkoutUrl: session.url!,
    });
  } catch (error) {
    console.error("Failed to send jury approval payment email", error);
  }
}

export async function rejectJuryApplication({
  id,
  adminNotes,
}: {
  id: string;
  adminNotes?: string;
}) {
  const application = await prisma.juryApplication.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
    },
  });

  if (!application) {
    throw new Error("Jury application not found.");
  }

  if (application.status === "ACTIVE_JUDGE") {
    throw new Error("Active judges cannot be rejected from this action.");
  }

  await prisma.juryApplication.update({
    where: { id },
    data: {
      status: "REJECTED",
      paymentStatus: "NOT_REQUIRED",
      adminNotes: adminNotes?.trim() || undefined,
      rejectedAt: new Date(),
      reviewedAt: new Date(),
      registrationTokenHash: null,
      registrationTokenExpiresAt: null,
      registrationEmailSentAt: null,
    },
  });

  try {
    await sendJuryRejectionEmail({
      to: application.email,
      fullName: application.fullName,
    });
  } catch (error) {
    console.error("Failed to send jury rejection email", error);
  }
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
  if (!metadata || metadata.flowType !== "jury") {
    return null;
  }

  return metadata.applicationId ?? null;
}

type JuryPaymentConfirmedEmailPayload = {
  to: string;
  fullName: string;
  registrationUrl: string;
  applicationId: string;
};

async function handleCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const applicationId = getApplicationIdFromMetadata(session.metadata);

  if (!applicationId) {
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : null;
  const registration = createRegistrationToken();
  let emailPayload: JuryPaymentConfirmedEmailPayload | null = null;

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

      emailPayload = {
        to: application.email,
        fullName: application.fullName,
        registrationUrl: `${getAppUrl()}/jury/register?token=${registration.rawToken}`,
        applicationId: application.id,
      };

      await tx.juryApplication.update({
        where: { id: application.id },
        data: {
          status: "ACTIVE_JUDGE",
          paymentStatus: "PAID",
          paidAt: new Date(),
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
          registrationTokenHash: registration.tokenHash,
          registrationTokenExpiresAt: registration.expiresAt,
        },
      });
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

  const confirmedEmailPayload: JuryPaymentConfirmedEmailPayload = emailPayload;

  try {
    const result = await sendJuryPaymentConfirmedEmail(confirmedEmailPayload);

    if (result.delivered) {
      await prisma.juryApplication.update({
        where: {
          id: confirmedEmailPayload.applicationId,
        },
        data: {
          registrationEmailSentAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error("Failed to send jury payment confirmed email", error);
  }
}

async function handleCheckoutExpired(event: Stripe.Event) {
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

  try {
    await prisma.$transaction(async (tx) => {
      await recordStripeEvent(tx, event);

      const application = await tx.juryApplication.findUnique({
        where: { id: applicationId },
        select: {
          status: true,
          paymentStatus: true,
        },
      });

      if (
        application &&
        application.status === "APPROVED" &&
        application.paymentStatus !== "PAID"
      ) {
        await tx.juryApplication.update({
          where: { id: applicationId },
          data: {
            paymentStatus: "EXPIRED",
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
            stripePaymentIntentId: paymentIntent.id,
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

export async function processStripeWebhook({
  payload,
  signature,
}: {
  payload: string;
  signature: string | null;
}) {
  if (!signature) {
    return {
      status: 400,
      body: {
        message: "Missing Stripe signature.",
      },
    };
  }

  let event: Stripe.Event;

  try {
    event = constructStripeEvent(payload, signature);
  } catch (error) {
    console.error("Failed to verify Stripe webhook signature", error);
    return {
      status: 400,
      body: {
        message: "Invalid Stripe signature.",
      },
    };
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event);
      break;
    case "checkout.session.expired":
      await handleCheckoutExpired(event);
      break;
    case "payment_intent.payment_failed":
      await handlePaymentFailed(event);
      break;
    default:
      break;
  }

  return {
    status: 200,
    body: {
      received: true,
    },
  };
}

export async function validateJuryRegistrationToken(token: string) {
  if (!token) {
    return {
      status: "missing" as const,
    };
  }

  const tokenHash = hashRegistrationToken(token);
  const application = await prisma.juryApplication.findFirst({
    where: {
      registrationTokenHash: tokenHash,
    },
    select: {
      fullName: true,
      registrationTokenExpiresAt: true,
      status: true,
    },
  });

  if (!application) {
    return {
      status: "invalid" as const,
    };
  }

  if (
    !application.registrationTokenExpiresAt ||
    application.registrationTokenExpiresAt.getTime() < Date.now()
  ) {
    return {
      status: "expired" as const,
    };
  }

  return {
    status: "valid" as const,
    fullName: application.fullName,
    juryStatus: application.status,
  };
}
