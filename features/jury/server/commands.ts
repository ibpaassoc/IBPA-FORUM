import { randomUUID } from "node:crypto";
import type { JuryApplicationStatus } from "@prisma/client";
import { sendApplicationReceivedNotificationEmail } from "@/features/email/server/application-email.workflow";
import {
  sendJuryApplicationReceivedEmail,
  sendJuryApprovedPaymentLinkEmail,
  sendJuryRejectedEmail,
} from "@/features/email/server/jury-email.workflow";
import { createJuryCheckoutSession } from "@/features/payments/server/checkout-sessions";
import { buildJuryFieldErrors } from "@/features/jury/schemas/jury-application.schema";
import {
  getText,
  isFilledFile,
  saveUploadedJuryFile,
  toOptionalText,
} from "@/features/jury/server/uploads";
import { prisma } from "@/shared/lib/prisma";

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

  const firstName = getText(formData, "firstName");
  const lastName = getText(formData, "lastName");
  const fullName = `${firstName} ${lastName}`.trim();
  const email = getText(formData, "email");
  const normalizedEmail = email.toLowerCase();
  const phone = getText(formData, "phone");
  const countryValue = getText(formData, "country");
  const countryOther = getText(formData, "countryOther");
  const country = countryValue === "Other" ? countryOther : countryValue;
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
  const savedProfilePhoto = await saveUploadedJuryFile(
    profilePhoto,
    applicationId,
    "profilePhoto"
  );
  const savedCertifications = await Promise.all(
    certifications.map((file, index) =>
      saveUploadedJuryFile(file, applicationId, "certifications", index)
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
    await sendJuryApplicationReceivedEmail({
      to: normalizedEmail,
      fullName,
    });
  } catch (error) {
    console.error("Failed to send jury application received email", error);
  }

  try {
    await sendApplicationReceivedNotificationEmail({
      applicationType: "Jury",
      applicantName: fullName,
      applicantEmail: normalizedEmail,
      details: [
        `Location: ${city}, ${country}`,
        `Professional title: ${professionalTitle}`,
      ],
    });
  } catch (error) {
    console.error("Failed to send jury application admin notification email", error);
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
  let emailSkipReason:
    | "email_sender_missing"
    | "email_recipient_missing"
    | "email_test_missing"
    | "resend_invalid_key"
    | "resend_missing"
    | "resend_error"
    | undefined;

  try {
    const result = await sendJuryApprovedPaymentLinkEmail({
      to: application.email,
      fullName: application.fullName,
      checkoutUrl: session.url,
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
    await sendJuryRejectedEmail({
      to: application.email,
      fullName: application.fullName,
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
