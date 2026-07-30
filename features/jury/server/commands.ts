import { randomUUID } from "node:crypto";
import { del } from "@vercel/blob";
import type { JuryApplicationStatus } from "@prisma/client";
import { sendApplicationReceivedNotificationEmail } from "@/features/email/server/application-email.workflow";
import {
  sendSetupEmailForAccount,
  upsertJuryAccountForApplication,
} from "@/features/account/server/accounts";
import {
  sendJuryAdditionalInfoRequestedEmail,
  sendJuryApplicationReceivedEmail,
  sendJuryApprovedPaymentLinkEmail,
  sendJuryRejectedEmail,
  sendJuryResubmittedAdminNotificationEmail,
} from "@/features/email/server/jury-email.workflow";
import { createJuryCheckoutSession } from "@/features/payments/server/checkout-sessions";
import { buildJuryFieldErrors } from "@/features/jury/schemas/jury-application.schema";
import {
  type BlobFileInfo,
  getText,
  toOptionalText,
} from "@/features/jury/server/uploads";
import { readEnv } from "@/lib/env";
import { prisma } from "@/shared/lib/prisma";
import { revalidatePublicJuryMembers } from "@/features/jury/server/queries";
import { syncJuryOnChange } from "@/features/google-sheets";
import {
  getInitialApprovedCategories,
  normalizeApprovedCategories,
  requireApprovedCategories,
} from "@/features/jury/lib/approved-categories";

function getAppUrl() {
  return readEnv(["APP_URL", "FRONTEND_URL", "NEXT_PUBLIC_APP_URL"]).replace(/\/+$/, "");
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

  const firstName = getText(formData, "firstName");
  const lastName = getText(formData, "lastName");
  const fullName = `${firstName} ${lastName}`.trim();
  const email = getText(formData, "email");
  const normalizedEmail = email.trim().toLowerCase();
  const phone = getText(formData, "phone");
  const countryValue = getText(formData, "country");
  const countryOther = getText(formData, "countryOther");
  const country = countryValue === "Other" ? countryOther : countryValue;
  const city = getText(formData, "city");
  const professionalTitle = getText(formData, "professionalTitle");
  const employerAffiliation = getText(formData, "employerAffiliation");
  const previousJudgingExperience = getText(formData, "previousJudgingExperience");
  const previousJudgingDetails = getText(formData, "previousJudgingDetails");
  const professionalBio = getText(formData, "professionalBio");
  const professionalWebsite = getText(formData, "professionalWebsite");
  const conflictDisclosure = getText(formData, "conflictDisclosure");
  const motivation = getText(formData, "motivation");
  const yearsExperience = Number(getText(formData, "yearsExperience"));
  const expertise = formData
    .getAll("expertise")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const ibpaAssociationMember = getText(formData, "ibpaAssociationMember") === "yes";
  const ibpaNumber = toOptionalText(getText(formData, "ibpaNumber"));

  const profilePhotoBlob = JSON.parse(
    getText(formData, "profilePhotoBlob") || "null"
  ) as BlobFileInfo | null;
  const certificationBlobs = formData
    .getAll("certificationsBlob")
    .map((v) => JSON.parse(String(v)) as BlobFileInfo);

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

  if (!profilePhotoBlob) {
    return {
      status: 400,
      body: {
        message: "Profile photo is required.",
      },
    };
  }

  const applicationId = randomUUID();

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
      expertiseAreas: expertise,
      approvedCategories: getInitialApprovedCategories(expertise),
      professionalBio,
      professionalWebsite: toOptionalText(professionalWebsite),
      conflictDisclosure,
      confidentialityAgreementAccepted: true,
      motivation,
      ibpaAssociationMember,
      ibpaNumber: ibpaAssociationMember ? ibpaNumber : null,
      status: "SUBMITTED",
      paymentStatus: "PENDING",
      submittedAt: new Date(),
      files: {
        create: [
          {
            fieldKey: "profilePhoto",
            ...profilePhotoBlob,
          },
          ...certificationBlobs.map((blob) => ({
            fieldKey: "certifications",
            ...blob,
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

  syncJuryOnChange(juryApplication.id);

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

  syncJuryOnChange(id, { refreshStats: false });
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

  syncJuryOnChange(id);
}

export async function approveJuryApplication(id: string, isIbpaMemberOverride?: boolean) {
  const application = await prisma.juryApplication.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
      ibpaAssociationMember: true,
      expertiseAreas: true,
      approvedCategories: true,
    },
  });

  if (!application) {
    throw new Error("Jury application not found.");
  }

  if (application.status === "PAID") {
    throw new Error("Paid jury applications cannot be approved again.");
  }

  requireApprovedCategories(application.approvedCategories, application.expertiseAreas);

  const isIbpaMember = isIbpaMemberOverride ?? application.ibpaAssociationMember;

  const session = await createJuryCheckoutSession({
    juryApplicationId: application.id,
    email: application.email,
    isIbpaMember,
  });

  const juryAmountCents = isIbpaMember ? 10000 : 25000;

  await prisma.$transaction([
    prisma.payment.updateMany({
      where: { juryApplicationId: application.id, status: "PENDING" },
      data: { status: "EXPIRED" },
    }),
    prisma.juryApplication.update({
      where: { id },
      data: {
        status: "APPROVED",
        paymentStatus: "PENDING",
        approvedAt: new Date(),
        rejectedAt: null,
        paidAt: null,
        stripeCheckoutSessionId: session.id,
      },
    }),
    prisma.payment.create({
      data: {
        source: "JURY",
        juryApplicationId: application.id,
        stripeSessionId: session.id,
        amount: juryAmountCents,
        currency: "usd",
        status: "PENDING",
      },
    }),
  ]);

  syncJuryOnChange(application.id);

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

  syncJuryOnChange(id);

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
  // Уведомления показываются в админ-панели, поэтому текст на русском.
  if (status === "SUBMITTED") {
    await resetJuryApplicationToSubmitted({
      id,
      adminNotes,
    });
    return "Заявка возвращена в статус «Отправлено».";
  }

  if (status === "APPROVED") {
    await approveJuryApplication(id);
    return "Заявка одобрена, ссылка на оплату отправлена.";
  }

  if (status === "REJECTED") {
    await rejectJuryApplication({
      id,
      adminNotes,
    });
    return "Заявка отклонена.";
  }

  throw new Error("Paid status can only be set by Stripe webhook confirmation.");
}

export async function requestAdditionalInfoFromJuryApplication({
  id,
  infoRequestDetails,
}: {
  id: string;
  infoRequestDetails: string;
}) {
  const application = await prisma.juryApplication.findUnique({
    where: { id },
    select: { id: true, fullName: true, email: true, status: true },
  });

  if (!application) throw new Error("Jury application not found.");
  if (application.status === "PAID") {
    throw new Error("Cannot request additional information from a paid application.");
  }

  const token = randomUUID();
  const appUrl = getAppUrl();
  const actionUrl = `${appUrl}/jury-update/${token}`;

  await prisma.juryApplication.update({
    where: { id },
    data: {
      status: "ADDITIONAL_INFO_REQUIRED",
      infoRequestToken: token,
      infoRequestDetails: infoRequestDetails.trim(),
      infoRequestedAt: new Date(),
      infoResubmittedAt: null,
    },
  });

  syncJuryOnChange(id);

  let emailDelivered = false;
  let emailSkipReason: string | undefined;

  try {
    const result = await sendJuryAdditionalInfoRequestedEmail({
      to: application.email,
      fullName: application.fullName,
      details: infoRequestDetails,
      actionUrl,
    });
    emailDelivered = result.delivered;
    emailSkipReason = result.reason;
  } catch (error) {
    console.error("Failed to send additional info request email", error);
  }

  return { emailDelivered, emailSkipReason };
}

export async function processJuryAdditionalInfoResubmission({
  token,
  professionalBio,
  motivation,
  conflictDisclosure,
  professionalWebsite,
  profilePhotoBlob,
  certificationBlobs,
}: {
  token: string;
  professionalBio: string;
  motivation: string;
  conflictDisclosure: string;
  professionalWebsite?: string;
  profilePhotoBlob?: BlobFileInfo | null;
  certificationBlobs?: BlobFileInfo[];
}) {
  const application = await prisma.juryApplication.findUnique({
    where: { infoRequestToken: token },
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
      files: { select: { id: true, fieldKey: true, storageKey: true } },
    },
  });

  if (!application) throw new Error("Invalid or expired link.");
  if (application.status !== "ADDITIONAL_INFO_REQUIRED") {
    throw new Error("This link has already been used or is no longer valid.");
  }

  const oldProfilePhotos = application.files.filter((f) => f.fieldKey === "profilePhoto");

  await prisma.$transaction(async (tx) => {
    if (profilePhotoBlob && oldProfilePhotos.length > 0) {
      await tx.juryApplicationFile.deleteMany({
        where: { juryApplicationId: application.id, fieldKey: "profilePhoto" },
      });
    }

    const newFiles: Array<{
      fieldKey: string;
      fileName: string;
      mimeType: string;
      fileSize: number;
      storageKey: string;
    }> = [];

    if (profilePhotoBlob) {
      newFiles.push({ fieldKey: "profilePhoto", ...profilePhotoBlob });
    }

    if (certificationBlobs && certificationBlobs.length > 0) {
      for (const blob of certificationBlobs) {
        newFiles.push({ fieldKey: "certifications", ...blob });
      }
    }

    await tx.juryApplication.update({
      where: { id: application.id },
      data: {
        status: "SUBMITTED",
        professionalBio,
        motivation,
        conflictDisclosure,
        professionalWebsite: professionalWebsite?.trim() || null,
        infoRequestToken: null,
        infoResubmittedAt: new Date(),
        files: newFiles.length > 0 ? { create: newFiles } : undefined,
      },
    });
  });

  if (profilePhotoBlob && oldProfilePhotos.length > 0) {
    const keysToDelete = oldProfilePhotos
      .map((f) => f.storageKey)
      .filter((k): k is string => Boolean(k));
    if (keysToDelete.length > 0) {
      try {
        await del(keysToDelete);
      } catch (error) {
        console.error("Failed to delete old profile photo blobs", error);
      }
    }
  }

  syncJuryOnChange(application.id);

  const appUrl = getAppUrl();
  const adminReviewUrl = `${appUrl}/admin/jury-applications/${application.id}`;

  try {
    await sendJuryResubmittedAdminNotificationEmail({
      fullName: application.fullName,
      applicantEmail: application.email,
      adminReviewUrl,
    });
  } catch (error) {
    console.error("Failed to send resubmission admin notification", error);
  }

  return { applicationId: application.id };
}

export async function replaceJuryProfilePhoto(
  id: string,
  profilePhotoBlob: BlobFileInfo,
) {
  const application = await prisma.juryApplication.findUnique({
    where: { id },
    select: {
      id: true,
      files: { select: { id: true, fieldKey: true, storageKey: true } },
    },
  });

  if (!application) {
    throw new Error("Jury application not found.");
  }

  const oldProfilePhotos = application.files.filter(
    (file) => file.fieldKey === "profilePhoto",
  );

  // Persist the new photo first; only remove the old blobs once the swap is
  // committed so a failure never leaves the application without a photo.
  await prisma.$transaction(async (tx) => {
    if (oldProfilePhotos.length > 0) {
      await tx.juryApplicationFile.deleteMany({
        where: { juryApplicationId: id, fieldKey: "profilePhoto" },
      });
    }

    await tx.juryApplicationFile.create({
      data: {
        juryApplicationId: id,
        fieldKey: "profilePhoto",
        ...profilePhotoBlob,
      },
    });
  });

  const keysToDelete = oldProfilePhotos
    .map((file) => file.storageKey)
    .filter((key): key is string => Boolean(key));

  if (keysToDelete.length > 0) {
    try {
      await del(keysToDelete);
    } catch (error) {
      console.error("Failed to delete old profile photo blobs", error);
    }
  }

  syncJuryOnChange(id, { refreshStats: false });
}

export async function deleteJuryApplication(id: string) {
  const application = await prisma.juryApplication.findUnique({
    where: { id },
    select: {
      files: {
        select: { storageKey: true },
      },
    },
  });

  if (!application) {
    throw new Error("Jury application not found.");
  }

  const storageKeys = application.files
    .map((f) => f.storageKey)
    .filter((key): key is string => Boolean(key));

  if (storageKeys.length > 0) {
    try {
      await del(storageKeys);
    } catch (error) {
      console.error("Failed to delete jury application blobs", error);
    }
  }

  await prisma.juryApplication.delete({ where: { id } });

  // A deleted member must drop off the public /jury listing.
  revalidatePublicJuryMembers();
}

export async function approveJuryApplicationWithoutPayment(id: string) {
  const application = await prisma.juryApplication.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      country: true,
      city: true,
      professionalTitle: true,
      yearsExperience: true,
      employerAffiliation: true,
      expertiseAreas: true,
      approvedCategories: true,
      professionalBio: true,
      professionalWebsite: true,
      status: true,
      approvedAt: true,
    },
  });

  if (!application) throw new Error("Jury application not found.");
  if (application.status === "PAID") throw new Error("Application is already marked as paid.");

  requireApprovedCategories(application.approvedCategories, application.expertiseAreas);

  const now = new Date();
  let setupAccountId: string | null = null;

  await prisma.$transaction(async (tx) => {
    await tx.payment.updateMany({
      where: { juryApplicationId: id, status: "PENDING" },
      data: { status: "EXPIRED" },
    });
    await tx.juryApplication.update({
      where: { id },
      data: {
        status: "PAID",
        paymentStatus: "PAID",
        approvedAt: application.approvedAt ?? now,
        paidAt: now,
        rejectedAt: null,
        stripeCheckoutSessionId: null,
      },
    });

    const { account } = await upsertJuryAccountForApplication(tx, {
      ...application,
      status: "PAID",
    });

    if (account.status !== "ACTIVE" || !account.passwordHash) {
      setupAccountId = account.id;
    }
  });

  syncJuryOnChange(id);
  revalidatePublicJuryMembers();

  if (setupAccountId) {
    try {
      await sendSetupEmailForAccount(setupAccountId);
    } catch (error) {
      console.error("Failed to send jury account setup email", error);
    }
  }
}

export async function resendJuryRegistrationLink(id: string) {
  const application = await prisma.juryApplication.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      country: true,
      city: true,
      professionalTitle: true,
      yearsExperience: true,
      employerAffiliation: true,
      expertiseAreas: true,
      approvedCategories: true,
      professionalBio: true,
      professionalWebsite: true,
      status: true,
      paymentStatus: true,
    },
  });

  if (!application) {
    return { status: "ineligible" as const };
  }

  if (application.status !== "PAID" || application.paymentStatus !== "PAID") {
    return { status: "ineligible" as const };
  }

  const { account } = await prisma.$transaction((tx) =>
    upsertJuryAccountForApplication(tx, {
      ...application,
      status: "PAID",
    }),
  );

  if (account.status === "DISABLED" || account.deletedAt) {
    return { status: "ineligible" as const };
  }

  if (account.passwordHash) {
    return { status: "registered" as const };
  }

  const result = await sendSetupEmailForAccount(account.id);

  if (!result?.delivered) {
    return { status: "delivery_failed" as const };
  }

  return { status: "sent" as const };
}

export async function setJuryApplicationStatusDirectly(
  id: string,
  status: JuryApplicationStatus,
) {
  const application = await prisma.juryApplication.findUnique({
    where: { id },
    select: {
      id: true,
      expertiseAreas: true,
      approvedCategories: true,
    },
  });
  if (!application) throw new Error("Jury application not found.");
  if (status === "APPROVED" || status === "PAID") {
    requireApprovedCategories(application.approvedCategories, application.expertiseAreas);
  }
  await prisma.juryApplication.update({ where: { id }, data: { status } });

  syncJuryOnChange(id);
  revalidatePublicJuryMembers();
}

export async function editJuryApplicationFields(
  id: string,
  data: {
    fullName: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    professionalTitle: string;
    employerAffiliation: string;
    yearsExperience: number;
    membershipStatus: string | null;
    membershipLevel: string | null;
    ibpaAssociationMember: boolean;
    ibpaNumber: string | null;
    previousJudgingExperience: boolean;
    previousJudgingDetails: string | null;
    expertiseAreas: string[];
    professionalBio: string;
    professionalWebsite: string | null;
    conflictDisclosure: string;
    motivation: string;
  },
) {
  const application = await prisma.juryApplication.findUnique({
    where: { id },
    select: {
      id: true,
      approvedCategories: true,
      profile: { select: { id: true } },
    },
  });
  if (!application) throw new Error("Jury application not found.");

  const normalizedEmail = data.email.trim().toLowerCase();
  const conflict = await prisma.juryApplication.findFirst({
    where: { email: normalizedEmail, NOT: { id } },
    select: { id: true },
  });
  if (conflict) throw new Error("This email is already registered with another application.");

  const retainedApprovedCategories = normalizeApprovedCategories(
    application.approvedCategories,
    data.expertiseAreas,
  );
  const approvedCategories =
    retainedApprovedCategories.length > 0
      ? retainedApprovedCategories
      : getInitialApprovedCategories(data.expertiseAreas);

  await prisma.$transaction(async (tx) => {
    await tx.juryApplication.update({
      where: { id },
      data: {
        ...data,
        email: normalizedEmail,
        approvedCategories: {
          set: approvedCategories,
        },
      },
    });

    if (application.profile) {
      await tx.juryProfile.update({
        where: { id: application.profile.id },
        data: {
          expertiseAreas: { set: data.expertiseAreas },
          approvedCategories: { set: approvedCategories },
        },
      });
    }
  });

  syncJuryOnChange(id);
  // Name / title / bio changes are surfaced on the public /jury listing.
  revalidatePublicJuryMembers();
}

export async function updateJuryApprovedCategories(
  id: string,
  approvedCategories: string[],
) {
  const application = await prisma.juryApplication.findUnique({
    where: { id },
    select: {
      id: true,
      expertiseAreas: true,
      profile: { select: { id: true } },
    },
  });

  if (!application) {
    throw new Error("Jury application not found.");
  }

  const normalized = requireApprovedCategories(
    approvedCategories,
    application.expertiseAreas,
  );

  await prisma.$transaction(async (tx) => {
    await tx.juryApplication.update({
      where: { id },
      data: { approvedCategories: { set: normalized } },
    });

    if (application.profile) {
      await tx.juryProfile.update({
        where: { id: application.profile.id },
        data: { approvedCategories: { set: normalized } },
      });
    }
  });

  syncJuryOnChange(id);
  revalidatePublicJuryMembers();

  return normalized;
}
