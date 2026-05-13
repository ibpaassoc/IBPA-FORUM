import { sendApplicationReceivedNotificationEmail } from "@/features/email/server/application-email.workflow";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { validateApplicationValues } from "@/features/applications/schemas/category-field-validation";
import { extractApplicationValues } from "@/features/applications/server/form-mapping";
import { getApplicationCategories } from "@/features/applications/server/queries";
import { uploadApplicationFile } from "@/features/applications/server/uploads";
import { createCompetitorCheckoutSession } from "@/features/payments/server/checkout-sessions";
import { prisma } from "@/shared/lib/prisma";

export async function saveApplicationSubmission(formData: FormData) {
  console.info("saveApplicationSubmission started");
  const categories = await getApplicationCategories();
  const values = extractApplicationValues(formData, categories);
  const validation = validateApplicationValues({
    values,
    categories,
  });

  if (!validation.success || !validation.selectedCategory || !validation.selectedAward) {
    console.warn("Application submission validation failed", {
      errors: validation.errors,
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
      },
    };
  }

  const licenseFiles = Array.isArray(values.licenseCertification)
    ? values.licenseCertification.filter((file): file is File => file instanceof File)
    : [];

  const categoryFields = categoryFieldConfigs[validation.selectedCategory.slug] ?? [];
  const answerEntries = [];
  const pendingFileUploads: Array<{ fieldKey: string; files: File[] }> = [
    {
      fieldKey: "licenseCertification",
      files: licenseFiles,
    },
  ];

  for (const field of categoryFields) {
    const rawValue = values[field.key];

    if (field.type === "file") {
      const files = Array.isArray(rawValue)
        ? rawValue.filter((file): file is File => file instanceof File)
        : [];
      if (files.length > 0) {
        pendingFileUploads.push({
          fieldKey: field.key,
          files,
        });
      }
      continue;
    }

    if (field.type === "checkbox-group") {
      const list = Array.isArray(rawValue)
        ? rawValue.filter((item): item is string => typeof item === "string")
        : [];
      if (list.length > 0) {
        answerEntries.push({
          fieldKey: field.key,
          valueJson: list,
        });
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
      answerEntries.push({
        fieldKey: field.key,
        valueText: textValue,
      });
    }
  }

  if (typeof values.heardAboutOther === "string" && values.heardAboutOther.trim()) {
    answerEntries.push({
      fieldKey: "heardAboutOther",
      valueText: values.heardAboutOther.trim(),
    });
  }

  const normalizedEmail = String(values.email).trim().toLowerCase();

  let application: { id: string };

  try {
    application = await prisma.application.create({
      data: {
        fullName: String(values.fullName),
        email: normalizedEmail,
        phone: String(values.phone),
        country: String(values.country),
        stateProvince: String(values.stateProvince || "") || null,
        city: String(values.city),
        professionalTitle: String(values.professionalTitle),
        yearsExperience: Number(values.yearsExperience),
        membershipNumber: null,
        membershipLevel: null,
        websiteUrl: String(values.websiteUrl || "") || null,
        socialUrl: String(values.socialUrl || "") || null,
        reviewsUrl: String(values.reviewsUrl || "") || null,
        heardAbout: String(values.heardAbout || "") || null,
        categoryId: validation.selectedCategory.id,
        awardId: validation.selectedAward.id,
        status: "PAYMENT_PENDING",
        paymentStatus: "PENDING",
        amount: 5000,
        currency: "usd",
      },
      select: {
        id: true,
      },
    });
    console.info("Application database record created", {
      applicationId: application.id,
      categoryId: validation.selectedCategory.id,
      awardId: validation.selectedAward.id,
    });
  } catch (error) {
    console.error("Application database insert failed", {
      categoryId: validation.selectedCategory.id,
      awardId: validation.selectedAward.id,
      error,
    });
    throw error;
  }

  let uploadedFiles: Array<NonNullable<Awaited<ReturnType<typeof uploadApplicationFile>>>>;

  try {
    uploadedFiles = (
      await Promise.all(
        pendingFileUploads.flatMap(({ fieldKey, files }) =>
          files.map((file, index) =>
            uploadApplicationFile(file, application.id, fieldKey, index)
          )
        )
      )
    ).filter(Boolean);
    console.info("Application files uploaded", {
      applicationId: application.id,
      fileCount: uploadedFiles.length,
      fields: uploadedFiles.map((file) => file.fieldKey),
    });
  } catch (error) {
    console.error("Application file upload failed", {
      applicationId: application.id,
      uploadFields: pendingFileUploads.map(({ fieldKey, files }) => ({
        fieldKey,
        fileCount: files.length,
      })),
      error,
    });
    throw error;
  }

  try {
    await prisma.application.update({
      where: {
        id: application.id,
      },
      data: {
        answers: answerEntries.length
          ? {
              create: answerEntries,
            }
          : undefined,
        files: uploadedFiles.length
          ? {
              create: uploadedFiles,
            }
          : undefined,
      },
    });
    console.info("Application answers/files database update completed", {
      applicationId: application.id,
      answerCount: answerEntries.length,
      fileCount: uploadedFiles.length,
    });
  } catch (error) {
    console.error("Application answers/files database update failed", {
      applicationId: application.id,
      answerCount: answerEntries.length,
      fileCount: uploadedFiles.length,
      error,
    });
    throw error;
  }

  let checkoutSession: { id: string; url: string };

  try {
    checkoutSession = await createCompetitorCheckoutSession({
      applicationId: application.id,
      email: normalizedEmail,
      categoryId: validation.selectedCategory.id,
      awardId: validation.selectedAward.id,
    });
    console.info("Stripe competitor checkout session created", {
      applicationId: application.id,
      checkoutSessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Stripe competitor checkout session creation failed", {
      applicationId: application.id,
      categoryId: validation.selectedCategory.id,
      awardId: validation.selectedAward.id,
      error,
    });
    throw error;
  }

  try {
    await prisma.$transaction([
      prisma.payment.updateMany({
        where: {
          applicationId: application.id,
          status: "PENDING",
        },
        data: {
          status: "EXPIRED",
        },
      }),
      prisma.application.update({
        where: {
          id: application.id,
        },
        data: {
          stripeCheckoutSessionId: checkoutSession.id,
        },
      }),
      prisma.payment.create({
        data: {
          applicationId: application.id,
          stripeSessionId: checkoutSession.id,
          amount: 5000,
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
    console.error("Payment database transaction failed", {
      applicationId: application.id,
      checkoutSessionId: checkoutSession.id,
      error,
    });
    throw error;
  }

  try {
    await sendApplicationReceivedNotificationEmail({
      applicationType: "Competitor",
      applicantName: String(values.fullName),
      applicantEmail: normalizedEmail,
      details: [
        `Direction: ${validation.selectedCategory.name}`,
        `Award: ${validation.selectedAward.name}`,
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
    where: {
      id: applicationId,
    },
    select: {
      id: true,
      email: true,
      categoryId: true,
      awardId: true,
      status: true,
      paymentStatus: true,
    },
  });

  if (!application) {
    return {
      status: 404,
      body: {
        message: "Application not found.",
      },
    };
  }

  if (application.paymentStatus === "PAID" || application.status === "SUBMITTED") {
    return {
      status: 409,
      body: {
        message: "This application has already been paid and submitted.",
      },
    };
  }

  const checkoutSession = await createCompetitorCheckoutSession({
    applicationId: application.id,
    email: application.email,
    categoryId: application.categoryId,
    awardId: application.awardId,
  });

  await prisma.$transaction([
    prisma.payment.updateMany({
      where: {
        applicationId: application.id,
        status: "PENDING",
      },
      data: {
        status: "EXPIRED",
      },
    }),
    prisma.application.update({
      where: {
        id: application.id,
      },
      data: {
        status: "PAYMENT_PENDING",
        paymentStatus: "PENDING",
        stripeCheckoutSessionId: checkoutSession.id,
        stripePaymentIntentId: null,
        paidAt: null,
      },
    }),
    prisma.payment.create({
      data: {
        applicationId: application.id,
        stripeSessionId: checkoutSession.id,
        amount: 5000,
        currency: "usd",
        status: "PENDING",
      },
    }),
  ]);

  return {
    status: 200,
    body: {
      checkoutUrl: checkoutSession.url,
    },
  };
}
