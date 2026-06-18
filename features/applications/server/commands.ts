import { sendApplicationReceivedNotificationEmail } from "@/features/email/server/application-email.workflow";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { validateApplicationValues } from "@/features/applications/schemas/category-field-validation";
import {
  extractApplicationValues,
  extractNominationBlockBValues,
} from "@/features/applications/server/form-mapping";
import { getApplicationCategories } from "@/features/applications/server/queries";
import { uploadApplicationFile, uploadNominationFile } from "@/features/applications/server/uploads";
import { createCompetitorCheckoutSession } from "@/features/payments/server/checkout-sessions";
import { prisma } from "@/shared/lib/prisma";
import { Prisma } from "@prisma/client";
import type { ApplicationValues } from "@/features/applications/types/application.types";

// Tiered pricing in cents: index = nomination count (1–5)
const MEMBER_PRICES_CENTS = [0, 5000, 10000, 13000, 18000, 20000] as const;
const NON_MEMBER_PRICES_CENTS = [0, 7000, 14000, 19000, 26000, 30000] as const;

function computeApplicationAmountCents(count: number, isMember: boolean): number {
  const prices = isMember ? MEMBER_PRICES_CENTS : NON_MEMBER_PRICES_CENTS;
  const idx = Math.min(5, Math.max(1, count)) as 1 | 2 | 3 | 4 | 5;
  return prices[idx];
}

async function createNominationApplication({
  applicationId,
  awardId,
  categoryId,
  categorySlug,
  nomValues,
}: {
  applicationId: string;
  awardId: string;
  categoryId: string;
  categorySlug: string;
  nomValues: ApplicationValues;
}) {
  const fields = categoryFieldConfigs[categorySlug] ?? [];

  const answerEntries: Array<{
    fieldKey: string;
    valueText?: string;
    valueNumber?: number;
    valueJson?: Prisma.InputJsonValue;
  }> = [];

  const pendingFileUploads: Array<{ fieldKey: string; files: File[] }> = [];

  for (const field of fields) {
    const rawValue = nomValues[field.key];

    if (field.type === "file") {
      const files = Array.isArray(rawValue)
        ? rawValue.filter((f): f is File => f instanceof File)
        : [];
      if (files.length > 0) {
        pendingFileUploads.push({ fieldKey: field.key, files });
      }
      continue;
    }

    if (field.type === "checkbox-group") {
      const list = Array.isArray(rawValue)
        ? rawValue.filter((item): item is string => typeof item === "string")
        : [];
      if (list.length > 0) {
        answerEntries.push({ fieldKey: field.key, valueJson: list });
      }
      continue;
    }

    if (field.type === "number") {
      const rawText = typeof rawValue === "string" ? rawValue.trim() : "";
      if (rawText) {
        answerEntries.push({
          fieldKey: field.key,
          valueNumber: Number(rawText),
          valueText: rawText,
        });
      }
      continue;
    }

    const textValue = typeof rawValue === "string" ? rawValue.trim() : "";
    if (textValue) {
      answerEntries.push({ fieldKey: field.key, valueText: textValue });
    }
  }

  const nominationApplication = await prisma.nominationApplication.create({
    data: {
      applicationId,
      awardId,
      categoryId,
    },
    select: { id: true },
  });

  const uploadedFiles = (
    await Promise.all(
      pendingFileUploads.flatMap(({ fieldKey, files }) =>
        files.map((file, index) =>
          uploadNominationFile(file, applicationId, nominationApplication.id, fieldKey, index)
        )
      )
    )
  ).filter(Boolean);

  if (answerEntries.length > 0 || uploadedFiles.length > 0) {
    await prisma.nominationApplication.update({
      where: { id: nominationApplication.id },
      data: {
        answers: answerEntries.length
          ? { create: answerEntries }
          : undefined,
        files: uploadedFiles.length
          ? { create: uploadedFiles }
          : undefined,
      },
    });
  }

  return nominationApplication;
}

export async function saveApplicationSubmission(formData: FormData) {
  console.info("saveApplicationSubmission started");
  const categories = await getApplicationCategories();
  const values = extractApplicationValues(formData, categories);

  const selectedAwardIds = Array.isArray(values.selectedAwardIds)
    ? values.selectedAwardIds.filter((id): id is string => typeof id === "string")
    : [];

  const blockBValuesByNomination = extractNominationBlockBValues(formData, categories, selectedAwardIds);

  const validation = validateApplicationValues({
    values,
    blockBValuesByNomination,
    categories,
  });

  if (!validation.success || !validation.selectedCategory || !validation.selectedAward) {
    console.warn("Application submission validation failed", {
      errors: validation.errors,
      blockBErrors: validation.blockBErrors,
      categoryId: String(values.categoryId ?? ""),
      awardId: String(values.awardId ?? ""),
    });
    return {
      ok: false as const,
      status: 400,
      body: {
        message:
          "Please review the participant application form and correct the highlighted fields.",
        fieldErrors: validation.errors,
        blockBErrors: validation.blockBErrors,
      },
    };
  }

  // Membership data from form
  const isIbpaMember = formData.get("isIbpaMember") === "true";
  const ibpaMemberNumber = String(formData.get("ibpaMemberNumber") ?? "").trim();

  const licenseFiles = Array.isArray(values.licenseCertification)
    ? values.licenseCertification.filter((file): file is File => file instanceof File)
    : [];

  const selectedNominations = validation.selectedAwards.map((item) => ({
    categoryId: item.category.id,
    categoryName: item.category.name,
    categorySlug: item.category.slug,
    awardId: item.award.id,
    awardName: item.award.name,
  }));

  const nominationCount = Math.max(1, selectedNominations.length);
  const applicationAmount = computeApplicationAmountCents(nominationCount, isIbpaMember);

  const normalizedEmail = String(values.email).trim().toLowerCase();
  const fullName = `${String(values.firstName ?? "").trim()} ${String(
    values.lastName ?? ""
  ).trim()}`.trim();
  const country =
    String(values.country ?? "") === "Other"
      ? String(values.countryOther ?? "").trim()
      : String(values.country ?? "").trim();

  let application: { id: string };

  try {
    application = await prisma.application.create({
      data: {
        fullName,
        email: normalizedEmail,
        phone: String(values.phone),
        country,
        stateProvince: String(values.stateProvince || "") || null,
        city: String(values.city),
        professionalTitle: String(values.professionalTitle),
        yearsExperience: Number(values.yearsExperience),
        membershipNumber: isIbpaMember && ibpaMemberNumber ? ibpaMemberNumber : null,
        membershipLevel: isIbpaMember ? "member" : null,
        websiteUrl: String(values.websiteUrl || "") || null,
        socialUrl: String(values.socialUrl || "") || null,
        reviewsUrl: String(values.reviewsUrl || "") || null,
        heardAbout: String(values.heardAbout || "") || null,
        categoryId: validation.selectedCategory.id,
        awardId: validation.selectedAward.id,
        status: "PAYMENT_PENDING",
        paymentStatus: "PENDING",
        amount: applicationAmount,
        currency: "usd",
      },
      select: { id: true },
    });
    console.info("Application database record created", { applicationId: application.id });
  } catch (error) {
    console.error("Application database insert failed", { error });
    throw error;
  }

  let uploadedLicenseFiles: Array<NonNullable<Awaited<ReturnType<typeof uploadApplicationFile>>>>;

  try {
    uploadedLicenseFiles = (
      await Promise.all(
        licenseFiles.map((file, index) =>
          uploadApplicationFile(file, application.id, "licenseCertification", index)
        )
      )
    ).filter(Boolean);
    console.info("License files uploaded", {
      applicationId: application.id,
      fileCount: uploadedLicenseFiles.length,
    });
  } catch (error) {
    console.error("License file upload failed", { applicationId: application.id, error });
    throw error;
  }

  try {
    const heardAboutOtherText =
      typeof values.heardAboutOther === "string" ? values.heardAboutOther.trim() : "";
    const blockAAnswers: Array<{ fieldKey: string; valueText?: string; valueJson?: Prisma.InputJsonValue }> = [
      {
        fieldKey: "selectedAwards",
        valueJson: selectedNominations.map(({ categoryId, categoryName, awardId, awardName }) => ({
          categoryId,
          categoryName,
          awardId,
          awardName,
        })),
      },
    ];
    if (heardAboutOtherText) {
      blockAAnswers.push({ fieldKey: "heardAboutOther", valueText: heardAboutOtherText });
    }

    await prisma.application.update({
      where: { id: application.id },
      data: {
        answers: blockAAnswers.length ? { create: blockAAnswers } : undefined,
        files: uploadedLicenseFiles.length ? { create: uploadedLicenseFiles } : undefined,
      },
    });
    console.info("Block A answers/files saved", { applicationId: application.id });
  } catch (error) {
    console.error("Block A answers/files save failed", { applicationId: application.id, error });
    throw error;
  }

  try {
    for (const nom of selectedNominations) {
      await createNominationApplication({
        applicationId: application.id,
        awardId: nom.awardId,
        categoryId: nom.categoryId,
        categorySlug: nom.categorySlug,
        nomValues: blockBValuesByNomination[nom.awardId] ?? {},
      });
    }
    console.info("NominationApplication records created", {
      applicationId: application.id,
      nominationCount: selectedNominations.length,
    });
  } catch (error) {
    console.error("NominationApplication creation failed", { applicationId: application.id, error });
    throw error;
  }

  let checkoutSession: { id: string; url: string };

  try {
    checkoutSession = await createCompetitorCheckoutSession({
      applicationId: application.id,
      email: normalizedEmail,
      categoryId: validation.selectedCategory.id,
      awardId: validation.selectedAward.id,
      nominationCount,
      isIbpaMember,
    });
    console.info("Stripe competitor checkout session created", {
      applicationId: application.id,
      checkoutSessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Stripe checkout session creation failed", { applicationId: application.id, error });
    throw error;
  }

  try {
    await prisma.$transaction([
      prisma.payment.updateMany({
        where: { applicationId: application.id, status: "PENDING" },
        data: { status: "EXPIRED" },
      }),
      prisma.application.update({
        where: { id: application.id },
        data: { stripeCheckoutSessionId: checkoutSession.id },
      }),
      prisma.payment.create({
        data: {
          source: "COMPETITOR",
          applicationId: application.id,
          stripeSessionId: checkoutSession.id,
          amount: applicationAmount,
          currency: "usd",
          status: "PENDING",
        },
      }),
    ]);
    console.info("Payment database transaction completed", {
      applicationId: application.id,
      checkoutSessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Payment database transaction failed", { applicationId: application.id, error });
    throw error;
  }

  try {
    await sendApplicationReceivedNotificationEmail({
      applicationType: "Competitor",
      applicantName: fullName,
      applicantEmail: normalizedEmail,
      details: [
        `Category: ${validation.selectedCategory.name}`,
        `Award: ${validation.selectedAward.name}`,
        `Selected nominations: ${selectedNominations.map((n) => `${n.categoryName} - ${n.awardName}`).join("; ")}`,
        `IBPA Member: ${isIbpaMember ? "Yes" : "No"}`,
        `Entry fee: $${applicationAmount / 100}`,
        "Payment status: Pending checkout",
      ],
    });
  } catch (error) {
    console.error("Failed to send competitor application admin notification email", {
      applicationId: application.id,
      error,
    });
  }

  return {
    ok: true as const,
    status: 201,
    body: {
      message: "Redirecting to secure Stripe Checkout.",
      applicationId: application.id,
      checkoutUrl: checkoutSession.url,
    },
  };
}

export async function retryCompetitorApplicationPayment(applicationId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      email: true,
      categoryId: true,
      awardId: true,
      amount: true,
      status: true,
      paymentStatus: true,
      membershipNumber: true,
      _count: { select: { nominationApplications: true } },
    },
  });

  if (!application) {
    return {
      status: 404,
      body: { message: "Application not found." },
    };
  }

  if (application.paymentStatus === "PAID" || application.status === "SUBMITTED") {
    return {
      status: 409,
      body: { message: "This application has already been paid and submitted." },
    };
  }

  const isIbpaMember = !!application.membershipNumber;
  const nominationCount = Math.max(1, application._count.nominationApplications);
  const applicationAmount = computeApplicationAmountCents(nominationCount, isIbpaMember);

  const checkoutSession = await createCompetitorCheckoutSession({
    applicationId: application.id,
    email: application.email,
    categoryId: application.categoryId,
    awardId: application.awardId,
    nominationCount,
    isIbpaMember,
  });

  await prisma.$transaction([
    prisma.payment.updateMany({
      where: { applicationId: application.id, status: "PENDING" },
      data: { status: "EXPIRED" },
    }),
    prisma.application.update({
      where: { id: application.id },
      data: {
        status: "PAYMENT_PENDING",
        paymentStatus: "PENDING",
        stripeCheckoutSessionId: checkoutSession.id,
        stripePaymentIntentId: null,
        paidAt: null,
        amount: applicationAmount,
      },
    }),
    prisma.payment.create({
      data: {
        source: "COMPETITOR",
        applicationId: application.id,
        stripeSessionId: checkoutSession.id,
        amount: applicationAmount,
        currency: "usd",
        status: "PENDING",
      },
    }),
  ]);

  return {
    status: 200,
    body: { checkoutUrl: checkoutSession.url },
  };
}
