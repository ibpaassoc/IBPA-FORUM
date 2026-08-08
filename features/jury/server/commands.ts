import { randomBytes, randomUUID } from "node:crypto";
import { del } from "@vercel/blob";
import type { JuryApplicationStatus } from "@prisma/client";
import { accountIdentity, sendSetupEmailForAccount, upsertJuryAccountForApplication } from "@/features/account/server/accounts";
import { hashAccountToken } from "@/features/account/server/tokens";
import {
  emptyJuryInformationRequests,
  parseJuryInformationRequests,
  parseStoredFiles,
  type JuryInformationRequests,
  type StoredFile,
  type StoredFiles,
} from "@/features/database/json-fields";
import { sendApplicationReceivedNotificationEmail } from "@/features/email/server/application-email.workflow";
import {
  sendJuryAdditionalInfoRequestedEmail,
  sendJuryApplicationReceivedEmail,
  sendJuryApprovedPaymentLinkEmail,
  sendJuryRejectedEmail,
  sendJuryResubmittedAdminNotificationEmail,
} from "@/features/email/server/jury-email.workflow";
import {
  getInitialApprovedCategories,
  normalizeApprovedCategories,
  requireApprovedCategories,
} from "@/features/jury/lib/approved-categories";
import { buildJuryFieldErrors } from "@/features/jury/schemas/jury-application.schema";
import { revalidatePublicJuryMembers } from "@/features/jury/server/queries";
import { type BlobFileInfo, getText, toOptionalText } from "@/features/jury/server/uploads";
import { createJuryCheckoutSession } from "@/features/payments/server/checkout-sessions";
import { syncJuryOnChange } from "@/features/google-sheets";
import { readEnv } from "@/lib/env";
import { prisma } from "@/shared/lib/prisma";

const INFORMATION_REQUEST_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getAppUrl() {
  return readEnv(["APP_URL", "FRONTEND_URL", "NEXT_PUBLIC_APP_URL"]).replace(/\/+$/, "");
}

function storedFile(fieldId: string, blob: BlobFileInfo): StoredFile {
  return {
    id: randomUUID(),
    fieldId,
    blobKey: blob.storageKey,
    filename: blob.fileName,
    mimeType: blob.mimeType,
    size: blob.fileSize,
    uploadedAt: new Date().toISOString(),
  };
}

export async function submitJuryApplication(formData: FormData) {
  const fieldErrors = buildJuryFieldErrors(formData);
  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 400,
      body: {
        message: "Please complete all required jury application fields before submitting.",
        fieldErrors,
      },
    };
  }

  const firstName = getText(formData, "firstName");
  const lastName = getText(formData, "lastName");
  const fullName = `${firstName} ${lastName}`.trim();
  const normalizedEmail = getText(formData, "email").toLowerCase();
  const phone = getText(formData, "phone");
  const countryValue = getText(formData, "country");
  const country = countryValue === "Other" ? getText(formData, "countryOther") : countryValue;
  const city = getText(formData, "city");
  const professionalTitle = getText(formData, "professionalTitle");
  const employerAffiliation = getText(formData, "employerAffiliation");
  const previousJudgingExperience = getText(formData, "previousJudgingExperience") === "yes";
  const previousJudgingDetails = toOptionalText(getText(formData, "previousJudgingDetails"));
  const professionalBio = getText(formData, "professionalBio");
  const professionalWebsite = toOptionalText(getText(formData, "professionalWebsite"));
  const conflictDisclosure = getText(formData, "conflictDisclosure");
  const motivation = getText(formData, "motivation");
  const yearsExperience = Number(getText(formData, "yearsExperience"));
  const expertiseAreas = formData.getAll("expertise").map(String).map((value) => value.trim()).filter(Boolean);
  const approvedCategories = getInitialApprovedCategories(expertiseAreas);
  const ibpaAssociationMember = getText(formData, "ibpaAssociationMember") === "yes";
  const ibpaNumber = toOptionalText(getText(formData, "ibpaNumber"));
  const profilePhotoBlob = JSON.parse(getText(formData, "profilePhotoBlob") || "null") as BlobFileInfo | null;
  const certificationBlobs = formData
    .getAll("certificationsBlob")
    .map((value) => JSON.parse(String(value)) as BlobFileInfo);

  if (!profilePhotoBlob) {
    return { status: 400, body: { message: "Profile photo is required." } };
  }
  const existingApplication = await prisma.juryApplication.findFirst({
    where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    select: { id: true },
  });
  if (existingApplication) {
    return { status: 409, body: { message: "You already submitted the application." } };
  }

  const applicationId = randomUUID();
  const files: StoredFiles = {
    schemaVersion: 1,
    items: [
      storedFile("profilePhoto", profilePhotoBlob),
      ...certificationBlobs.map((blob) => storedFile("certifications", blob)),
    ],
  };
  const juryApplication = await prisma.$transaction(async (tx) => {
    const existingAccount = await tx.account.findUnique({
      where: accountIdentity(normalizedEmail, "JURY"),
      select: { id: true, status: true },
    });
    if (existingAccount?.status === "DISABLED") throw new Error("This jury account is disabled.");
    const account =
      existingAccount ??
      (await tx.account.create({
        data: {
          email: normalizedEmail,
          normalizedEmail,
          role: "JURY",
          status: "INVITED",
        },
        select: { id: true },
      }));
    const application = await tx.juryApplication.create({
      data: {
        id: applicationId,
        accountId: account.id,
        fullName,
        email: normalizedEmail,
        phone,
        country,
        city,
        professionalTitle,
        yearsExperience,
        employerAffiliation,
        previousJudgingExperience,
        previousJudgingDetails,
        expertiseAreas,
        professionalBio,
        professionalWebsite,
        conflictDisclosure,
        motivation,
        ibpaAssociationMember,
        ibpaNumber: ibpaAssociationMember ? ibpaNumber : null,
        status: "SUBMITTED",
        submittedAt: new Date(),
        informationRequests: emptyJuryInformationRequests(),
        files,
      },
    });
    await tx.juryProfile.create({
      data: {
        accountId: account.id,
        juryApplicationId: application.id,
        fullName,
        phone,
        country,
        city,
        professionalTitle,
        yearsExperience,
        employerAffiliation,
        expertiseAreas,
        approvedCategories,
        professionalBio,
        professionalWebsite,
      },
    });
    return application;
  });

  try {
    await sendJuryApplicationReceivedEmail({ to: normalizedEmail, fullName });
  } catch (error) {
    console.error("Failed to send jury application received email", error);
  }
  try {
    await sendApplicationReceivedNotificationEmail({
      applicationType: "Jury",
      applicantName: fullName,
      applicantEmail: normalizedEmail,
      details: [`Location: ${city}, ${country}`, `Professional title: ${professionalTitle}`],
    });
  } catch (error) {
    console.error("Failed to send jury application admin notification email", error);
  }
  syncJuryOnChange(juryApplication.id);
  return {
    status: 201,
    body: {
      message: "Your jury application has been received. IBPA review may take up to 14 business days.",
      id: juryApplication.id,
      status: juryApplication.status,
      summary: { name: fullName, location: `${city}, ${country}`, expertise: expertiseAreas },
    },
  };
}

export async function saveJuryApplicationNotes({ id, adminNotes }: { id: string; adminNotes: string }) {
  const result = await prisma.juryApplication.updateMany({
    where: { id },
    data: { adminNotes: adminNotes || null },
  });
  if (result.count === 0) throw new Error("Jury application not found.");
  syncJuryOnChange(id, { refreshStats: false });
}

export async function resetJuryApplicationToSubmitted({ id, adminNotes }: { id: string; adminNotes?: string }) {
  const application = await prisma.juryApplication.findUnique({
    where: { id },
    select: { id: true, payments: { where: { status: "PAID" }, select: { id: true }, take: 1 } },
  });
  if (!application) throw new Error("Jury application not found.");
  if (application.payments.length > 0) throw new Error("Paid jury applications cannot be moved back to submitted.");
  await prisma.$transaction([
    prisma.payment.updateMany({ where: { juryApplicationId: id, status: "PENDING" }, data: { status: "EXPIRED" } }),
    prisma.juryApplication.update({
      where: { id },
      data: { status: "SUBMITTED", approvedAt: null, rejectedAt: null, adminNotes: adminNotes?.trim() || undefined },
    }),
  ]);
  syncJuryOnChange(id);
}

export async function approveJuryApplication(id: string, isIbpaMemberOverride?: boolean) {
  const application = await prisma.juryApplication.findUnique({
    where: { id },
    include: { profile: true, payments: { where: { status: "PAID" }, select: { id: true }, take: 1 } },
  });
  if (!application) throw new Error("Jury application not found.");
  if (application.payments.length > 0) throw new Error("Paid jury applications cannot be approved again.");
  const approvedCategories = requireApprovedCategories(
    application.profile?.approvedCategories ?? [],
    application.expertiseAreas
  );
  const isIbpaMember = isIbpaMemberOverride ?? application.ibpaAssociationMember;
  const session = await createJuryCheckoutSession({
    juryApplicationId: application.id,
    email: application.email,
    isIbpaMember,
  });
  const juryAmountCents = isIbpaMember ? 10000 : 25000;
  await prisma.$transaction([
    prisma.payment.updateMany({ where: { juryApplicationId: id, status: "PENDING" }, data: { status: "EXPIRED" } }),
    prisma.juryApplication.update({
      where: { id },
      data: { status: "APPROVED", approvedAt: new Date(), rejectedAt: null },
    }),
    prisma.juryProfile.update({ where: { juryApplicationId: id }, data: { approvedCategories } }),
    prisma.payment.create({
      data: {
        accountId: application.accountId,
        juryApplicationId: id,
        customerEmail: application.email,
        amount: juryAmountCents,
        currency: "usd",
        status: "PENDING",
        purchaseType: "JURY",
        provider: "STRIPE",
        stripeCheckoutSessionId: session.id,
        pricingSnapshot: { isIbpaMember, approvedCategories },
      },
    }),
  ]);
  syncJuryOnChange(id);
  try {
    const result = await sendJuryApprovedPaymentLinkEmail({
      to: application.email,
      fullName: application.fullName,
      checkoutUrl: session.url,
    });
    return { emailDelivered: result.delivered, emailSkipReason: result.reason };
  } catch (error) {
    console.error("Failed to send jury approval payment email", error);
    return { emailDelivered: false, emailSkipReason: undefined };
  }
}

export async function rejectJuryApplication({ id, adminNotes }: { id: string; adminNotes?: string }) {
  const application = await prisma.juryApplication.findUnique({
    where: { id },
    include: { payments: { where: { status: "PAID" }, select: { id: true }, take: 1 } },
  });
  if (!application) throw new Error("Jury application not found.");
  if (application.payments.length > 0) throw new Error("Paid jury applications cannot be rejected.");
  await prisma.$transaction([
    prisma.payment.updateMany({ where: { juryApplicationId: id, status: "PENDING" }, data: { status: "FAILED" } }),
    prisma.juryApplication.update({
      where: { id },
      data: { status: "REJECTED", adminNotes: adminNotes?.trim() || undefined, approvedAt: null, rejectedAt: new Date() },
    }),
  ]);
  syncJuryOnChange(id);
  try {
    await sendJuryRejectedEmail({ to: application.email, fullName: application.fullName });
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
    await resetJuryApplicationToSubmitted({ id, adminNotes });
    return "Заявка возвращена в статус «Отправлено».";
  }
  if (status === "APPROVED") {
    await approveJuryApplication(id);
    return "Заявка одобрена, ссылка на оплату отправлена.";
  }
  if (status === "REJECTED") {
    await rejectJuryApplication({ id, adminNotes });
    return "Заявка отклонена.";
  }
  throw new Error("Paid status can only be set by payment confirmation.");
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
    include: { payments: { where: { status: "PAID" }, select: { id: true }, take: 1 } },
  });
  if (!application) throw new Error("Jury application not found.");
  if (application.payments.length > 0) throw new Error("Cannot request additional information from a paid application.");

  const token = randomBytes(32).toString("hex");
  const requestedAt = new Date();
  const requests = parseJuryInformationRequests(application.informationRequests);
  const next: JuryInformationRequests = {
    ...requests,
    requests: [
      ...requests.requests,
      { message: infoRequestDetails.trim(), requestedAt: requestedAt.toISOString(), resolvedAt: null, response: null },
    ],
  };
  await prisma.juryApplication.update({
    where: { id },
    data: {
      status: "ADDITIONAL_INFO_REQUIRED",
      informationRequestTokenHash: hashAccountToken(token),
      informationRequestTokenExpiresAt: new Date(requestedAt.getTime() + INFORMATION_REQUEST_TTL_MS),
      informationRequests: next,
    },
  });
  syncJuryOnChange(id);
  const actionUrl = `${getAppUrl()}/jury-update/${token}`;
  try {
    const result = await sendJuryAdditionalInfoRequestedEmail({
      to: application.email,
      fullName: application.fullName,
      details: infoRequestDetails,
      actionUrl,
    });
    return { emailDelivered: result.delivered, emailSkipReason: result.reason };
  } catch (error) {
    console.error("Failed to send additional info request email", error);
    return { emailDelivered: false, emailSkipReason: undefined };
  }
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
    where: { informationRequestTokenHash: hashAccountToken(token) },
  });
  if (!application || !application.informationRequestTokenExpiresAt || application.informationRequestTokenExpiresAt < new Date()) {
    throw new Error("Invalid or expired link.");
  }
  if (application.status !== "ADDITIONAL_INFO_REQUIRED") {
    throw new Error("This link has already been used or is no longer valid.");
  }
  const currentFiles = parseStoredFiles(application.files);
  const oldProfilePhotos = currentFiles.items.filter((file) => file.fieldId === "profilePhoto");
  const retained = profilePhotoBlob
    ? currentFiles.items.filter((file) => file.fieldId !== "profilePhoto")
    : currentFiles.items;
  const nextFiles: StoredFiles = {
    ...currentFiles,
    items: [
      ...retained,
      ...(profilePhotoBlob ? [storedFile("profilePhoto", profilePhotoBlob)] : []),
      ...(certificationBlobs ?? []).map((blob) => storedFile("certifications", blob)),
    ],
  };
  const info = parseJuryInformationRequests(application.informationRequests);
  const now = new Date();
  let resolved = false;
  const nextInfo: JuryInformationRequests = {
    ...info,
    requests: info.requests.map((request, index) => {
      if (resolved || request.resolvedAt || index !== info.requests.length - 1) return request;
      resolved = true;
      return {
        ...request,
        resolvedAt: now.toISOString(),
        response: "Applicant resubmitted updated application information and files.",
      };
    }),
  };
  await prisma.$transaction([
    prisma.juryApplication.update({
      where: { id: application.id },
      data: {
        status: "SUBMITTED",
        professionalBio,
        motivation,
        conflictDisclosure,
        professionalWebsite: professionalWebsite?.trim() || null,
        informationRequestTokenHash: null,
        informationRequestTokenExpiresAt: null,
        informationRequests: nextInfo,
        files: nextFiles,
        submittedAt: now,
      },
    }),
    prisma.juryProfile.update({
      where: { juryApplicationId: application.id },
      data: { professionalBio, professionalWebsite: professionalWebsite?.trim() || null },
    }),
  ]);
  if (profilePhotoBlob) {
    const keys = oldProfilePhotos.flatMap((file) => (file.blobKey ? [file.blobKey] : []));
    if (keys.length > 0) {
      try { await del(keys); } catch (error) { console.error("Failed to delete replaced jury profile photo blobs", error); }
    }
  }
  syncJuryOnChange(application.id);
  try {
    await sendJuryResubmittedAdminNotificationEmail({
      fullName: application.fullName,
      applicantEmail: application.email,
      adminReviewUrl: `${getAppUrl()}/admin/jury-applications/${application.id}`,
    });
  } catch (error) {
    console.error("Failed to send resubmission admin notification", error);
  }
  return { applicationId: application.id };
}

export async function replaceJuryProfilePhoto(id: string, profilePhotoBlob: BlobFileInfo) {
  const application = await prisma.juryApplication.findUnique({ where: { id }, select: { files: true } });
  if (!application) throw new Error("Jury application not found.");
  const files = parseStoredFiles(application.files);
  const old = files.items.filter((file) => file.fieldId === "profilePhoto");
  const next: StoredFiles = {
    ...files,
    items: [...files.items.filter((file) => file.fieldId !== "profilePhoto"), storedFile("profilePhoto", profilePhotoBlob)],
  };
  await prisma.juryApplication.update({ where: { id }, data: { files: next } });
  const keys = old.flatMap((file) => (file.blobKey ? [file.blobKey] : []));
  if (keys.length > 0) {
    try { await del(keys); } catch (error) { console.error("Failed to delete old profile photo blobs", error); }
  }
  syncJuryOnChange(id, { refreshStats: false });
  revalidatePublicJuryMembers();
}

export async function deleteJuryApplication(id: string) {
  const application = await prisma.juryApplication.findUnique({
    where: { id },
    include: {
      profile: { select: { id: true, reviews: { select: { id: true }, take: 1 } } },
      payments: { select: { id: true, status: true } },
      account: { select: { id: true } },
    },
  });
  if (!application) throw new Error("Jury application not found.");
  if (application.payments.some((payment) => payment.status === "PAID") || application.profile?.reviews.length) {
    throw new Error("A paid or reviewed jury application cannot be deleted.");
  }
  const keys = parseStoredFiles(application.files).items.flatMap((file) => (file.blobKey ? [file.blobKey] : []));
  await prisma.$transaction(async (tx) => {
    await tx.ticket.deleteMany({ where: { kind: "JURY", accountId: application.accountId } });
    await tx.payment.deleteMany({ where: { juryApplicationId: id } });
    if (application.profile) await tx.juryProfile.delete({ where: { id: application.profile.id } });
    await tx.juryApplication.delete({ where: { id } });
    await tx.account.delete({ where: { id: application.accountId } });
  });
  if (keys.length > 0) {
    try { await del(keys); } catch (error) { console.error("Failed to delete jury application blobs", error); }
  }
  revalidatePublicJuryMembers();
}

export async function approveJuryApplicationWithoutPayment(id: string) {
  const application = await prisma.juryApplication.findUnique({ where: { id }, include: { profile: true } });
  if (!application) throw new Error("Jury application not found.");
  const approvedCategories = requireApprovedCategories(
    application.profile?.approvedCategories ?? [],
    application.expertiseAreas
  );
  const now = new Date();
  let setupAccountId: string | null = null;
  await prisma.$transaction(async (tx) => {
    await tx.payment.updateMany({ where: { juryApplicationId: id, status: "PENDING" }, data: { status: "EXPIRED" } });
    await tx.juryApplication.update({
      where: { id },
      data: { status: "PAID", approvedAt: application.approvedAt ?? now, rejectedAt: null },
    });
    const paidPayment = await tx.payment.findFirst({
      where: { juryApplicationId: id, status: "PAID" },
      select: { id: true },
    });
    if (!paidPayment) {
      await tx.payment.create({
        data: {
          accountId: application.accountId,
          juryApplicationId: id,
          customerEmail: application.email,
          amount: 0,
          currency: "usd",
          status: "PAID",
          purchaseType: "JURY",
          provider: "MANUAL",
          paidAt: now,
          fulfilledAt: now,
          pricingSnapshot: { reason: "ADMIN_WAIVER" },
        },
      });
    }
    const { account } = await upsertJuryAccountForApplication(tx, {
      ...application,
      approvedCategories,
      status: "PAID",
    });
    if (account.status !== "ACTIVE" || !account.passwordHash) setupAccountId = account.id;
  });
  syncJuryOnChange(id);
  revalidatePublicJuryMembers();
  if (setupAccountId) {
    try { await sendSetupEmailForAccount(setupAccountId); } catch (error) { console.error("Failed to send jury account setup email", error); }
  }
}

export async function resendJuryRegistrationLink(id: string) {
  const application = await prisma.juryApplication.findUnique({
    where: { id },
    include: { account: true, payments: { where: { status: "PAID" }, select: { id: true }, take: 1 } },
  });
  if (!application || application.status !== "PAID" || application.payments.length === 0) {
    return { status: "ineligible" as const };
  }
  if (application.account.status === "DISABLED") return { status: "ineligible" as const };
  if (application.account.passwordHash) return { status: "registered" as const };
  const result = await sendSetupEmailForAccount(application.account.id);
  return result?.delivered ? { status: "sent" as const } : { status: "delivery_failed" as const };
}

export async function setJuryApplicationStatusDirectly(id: string, status: JuryApplicationStatus) {
  const application = await prisma.juryApplication.findUnique({ where: { id }, include: { profile: true } });
  if (!application) throw new Error("Jury application not found.");
  if (status === "APPROVED" || status === "PAID") {
    requireApprovedCategories(application.profile?.approvedCategories ?? [], application.expertiseAreas);
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
  }
) {
  const application = await prisma.juryApplication.findUnique({ where: { id }, include: { profile: true } });
  if (!application) throw new Error("Jury application not found.");
  const normalizedEmail = data.email.trim().toLowerCase();
  const conflict = await prisma.account.findFirst({
    where: { normalizedEmail, role: "JURY", NOT: { id: application.accountId } },
    select: { id: true },
  });
  if (conflict) throw new Error("This email is already registered with another application.");
  const approvedCategories = normalizeApprovedCategories(
    application.profile?.approvedCategories ?? [],
    data.expertiseAreas
  );
  const nextApproved = approvedCategories.length > 0 ? approvedCategories : getInitialApprovedCategories(data.expertiseAreas);
  await prisma.$transaction([
    prisma.account.update({
      where: { id: application.accountId },
      data: { email: normalizedEmail, normalizedEmail },
    }),
    prisma.juryApplication.update({ where: { id }, data: { ...data, email: normalizedEmail } }),
    prisma.juryProfile.update({
      where: { juryApplicationId: id },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        country: data.country,
        city: data.city,
        professionalTitle: data.professionalTitle,
        employerAffiliation: data.employerAffiliation,
        yearsExperience: data.yearsExperience,
        expertiseAreas: data.expertiseAreas,
        approvedCategories: nextApproved,
        professionalBio: data.professionalBio,
        professionalWebsite: data.professionalWebsite,
      },
    }),
  ]);
  syncJuryOnChange(id);
  revalidatePublicJuryMembers();
}

export async function updateJuryApprovedCategories(id: string, approvedCategories: string[]) {
  const application = await prisma.juryApplication.findUnique({ where: { id }, select: { expertiseAreas: true } });
  if (!application) throw new Error("Jury application not found.");
  const normalized = requireApprovedCategories(approvedCategories, application.expertiseAreas);
  await prisma.juryProfile.update({ where: { juryApplicationId: id }, data: { approvedCategories: normalized } });
  syncJuryOnChange(id);
  revalidatePublicJuryMembers();
  return normalized;
}
