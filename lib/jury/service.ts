import { put } from "@vercel/blob";
import { Prisma, type JuryApplicationStatus, type StripeWebhookEvent } from "@prisma/client";
import { randomUUID } from "node:crypto";
import type Stripe from "stripe";
import {
  juryApplicationReceived,
  juryApprovedPaymentLink,
  juryPaymentConfirmed,
  juryRejected,
  sendEmail,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { createJuryCheckoutSession } from "@/lib/stripe";

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
      status: "SUBMITTED",
      paymentStatus: "PENDING",
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
    const template = juryApplicationReceived({ fullName });
    await sendEmail({
      to: normalizedEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
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

  await prisma.juryApplication.update({
    where: { id },
    data: {
      adminNotes: adminNotes || null,
    },
  });
}

export async function resetJuryApplicationToSubmitted({
  id,
  adminNotes,
}: {
  id: string;
  adminNotes?: string;
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

  if (application.status === "PAID") {
    throw new Error("Paid jury applications cannot be moved back to submitted.");
  }

  await prisma.juryApplication.update({
    where: { id },
    data: {
      status: "SUBMITTED",
      paymentStatus: "PENDING",
      approvedAt: null,
      rejectedAt: null,
      stripeCheckoutSessionId: null,
      paidAt: null,
      adminNotes: adminNotes?.trim() || undefined,
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
    },
  });

  if (!application) {
    throw new Error("Jury application not found.");
  }

  if (application.status === "PAID") {
    throw new Error("Paid jury applications cannot be approved again.");
  }

  const session = await createJuryCheckoutSession({
    juryApplicationId: application.id,
    email: application.email,
  });

  await prisma.juryApplication.update({
    where: { id },
    data: {
      status: "APPROVED",
      paymentStatus: "PENDING",
      approvedAt: new Date(),
      rejectedAt: null,
      paidAt: null,
      stripeCheckoutSessionId: session.id,
    },
  });

  let emailDelivered = false;
  let emailSkipReason: "dev_email_missing" | "resend_missing" | undefined;

  try {
    const template = juryApprovedPaymentLink({
      fullName: application.fullName,
      checkoutUrl: session.url,
    });
    const result = await sendEmail({
      to: application.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
    emailDelivered = result.delivered;
    emailSkipReason = result.reason;
  } catch (error) {
    console.error("Failed to send jury approval payment email", error);
  }

  return {
    emailDelivered,
    emailSkipReason,
  };
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

  if (application.status === "PAID") {
    throw new Error("Paid jury applications cannot be rejected.");
  }

  await prisma.juryApplication.update({
    where: { id },
    data: {
      status: "REJECTED",
      paymentStatus: "FAILED",
      adminNotes: adminNotes?.trim() || undefined,
      approvedAt: null,
      rejectedAt: new Date(),
      stripeCheckoutSessionId: null,
    },
  });

  try {
    const template = juryRejected({
      fullName: application.fullName,
    });
    await sendEmail({
      to: application.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (error) {
    console.error("Failed to send jury rejection email", error);
  }
}

export async function updateJuryApplicationStatus({
  id,
  status,
  adminNotes,
}: {
  id: string;
  status: JuryApplicationStatus;
  adminNotes?: string;
}) {
  if (status === "SUBMITTED") {
    await resetJuryApplicationToSubmitted({
      id,
      adminNotes,
    });
    return "Application moved back to submitted.";
  }

  if (status === "APPROVED") {
    await approveJuryApplication(id);
    return "Application approved and payment link sent.";
  }

  if (status === "REJECTED") {
    await rejectJuryApplication({
      id,
      adminNotes,
    });
    return "Application rejected successfully.";
  }

  throw new Error("Paid status can only be set by Stripe webhook confirmation.");
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
  if (!metadata) {
    return null;
  }

  return metadata.juryApplicationId ?? null;
}

type JuryPaymentConfirmedEmailPayload = {
  to: string;
  fullName: string;
};

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
          status: true,
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

  const confirmedEmailPayload: JuryPaymentConfirmedEmailPayload = emailPayload;

  try {
    const template = juryPaymentConfirmed({
      fullName: confirmedEmailPayload.fullName,
    });
    await sendEmail({
      to: confirmedEmailPayload.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
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

export async function getPublicJuryMembers() {
  try {
    return await prisma.juryApplication.findMany({
      where: {
        status: "PAID",
        paymentStatus: "PAID",
      },
      orderBy: {
        paidAt: "desc",
      },
      select: {
        id: true,
        fullName: true,
        professionalTitle: true,
        city: true,
        country: true,
        expertiseAreas: true,
        professionalBio: true,
        files: {
          where: {
            fieldKey: "profilePhoto",
          },
          select: {
            id: true,
          },
          take: 1,
        },
      },
    });
  } catch (error) {
    console.warn("Failed to load public jury members.", error);
    return [];
  }
}
