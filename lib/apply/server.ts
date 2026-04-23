import { put } from "@vercel/blob";
import { Prisma, type StripeWebhookEvent } from "@prisma/client";
import { unstable_cache } from "next/cache";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { categoryCatalog } from "@/lib/apply/catalog";
import { categoryFieldConfigs } from "@/lib/apply/categoryFieldConfigs";
import { validateApplicationValues } from "@/lib/apply/categorySchemas";
import { sendCompetitorApplicationConfirmedEmail } from "@/lib/email";
import { createCompetitorCheckoutSession } from "@/lib/stripe";
import type {
  ApplicationValues,
  CategoryOption,
  UploadedApplicationFile,
} from "@/lib/apply/types";

function isFilledFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function syncApplicationCatalog() {
  for (const definition of categoryCatalog) {
    const category = await prisma.category.upsert({
      where: {
        slug: definition.slug,
      },
      update: {
        name: definition.name,
      },
      create: {
        name: definition.name,
        slug: definition.slug,
      },
    });

    await reconcileCategoryAwards(category.id, definition.awards);
  }
}

async function readApplicationCategoriesFromDb(): Promise<CategoryOption[]> {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      awards: {
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      },
    },
  });

  const order = new Map(categoryCatalog.map((item, index) => [item.slug, index]));

  return categories
    .sort((left, right) => {
      const leftOrder = order.get(left.slug) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = order.get(right.slug) ?? Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder;
    })
    .map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      awards: category.awards.map((award) => ({
        id: award.id,
        name: award.name,
      })),
    }));
}

const getCachedApplicationCategories = unstable_cache(
  async () => readApplicationCategoriesFromDb(),
  ["application-categories"],
  {
    revalidate: 60 * 60 * 6,
  }
);

async function ensureAward(categoryId: string, name: string) {
  const existing = await prisma.award.findFirst({
    where: {
      categoryId,
      name,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.award.create({
    data: {
      categoryId,
      name,
    },
  });
}

async function moveApplicationsToAward(fromAwardId: string, toAwardId: string) {
  if (fromAwardId === toAwardId) {
    return;
  }

  await prisma.application.updateMany({
    where: {
      awardId: fromAwardId,
    },
    data: {
      awardId: toAwardId,
    },
  });
}

async function reconcileCategoryAwards(
  categoryId: string,
  desiredAwardNames: string[]
) {
  const desiredNameSet = new Set(desiredAwardNames);

  const awards = await prisma.award.findMany({
    where: {
      categoryId,
    },
    include: {
      _count: {
        select: {
          applications: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const awardsByName = new Map<string, typeof awards>();
  for (const award of awards) {
    const group = awardsByName.get(award.name) ?? [];
    group.push(award);
    awardsByName.set(award.name, group);
  }

  const canonicalByName = new Map<string, (typeof awards)[number]>();

  for (const desiredName of desiredAwardNames) {
    const duplicates = awardsByName.get(desiredName) ?? [];
    const canonical =
      duplicates.sort(
        (left, right) => right._count.applications - left._count.applications
      )[0] ?? (await ensureAward(categoryId, desiredName));

    canonicalByName.set(desiredName, canonical);

    const redundant = duplicates.filter((award) => award.id !== canonical.id);
    for (const duplicate of redundant) {
      await moveApplicationsToAward(duplicate.id, canonical.id);
      await prisma.award.deleteMany({
        where: {
          id: duplicate.id,
        },
      });
    }
  }

  const refreshedAwards = await prisma.award.findMany({
    where: {
      categoryId,
    },
    include: {
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  for (const award of refreshedAwards) {
    if (desiredNameSet.has(award.name)) {
      continue;
    }

    if (award._count.applications === 0) {
      await prisma.award.deleteMany({
        where: {
          id: award.id,
        },
      });
    }
  }
}

export async function getApplicationCategories(): Promise<CategoryOption[]> {
  return getCachedApplicationCategories();
}

function getTextValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function extractApplicationValues(
  formData: FormData,
  categories: CategoryOption[]
): ApplicationValues {
  const values: ApplicationValues = {
    fullName: getTextValue(formData, "fullName"),
    email: getTextValue(formData, "email"),
    phone: getTextValue(formData, "phone"),
    country: getTextValue(formData, "country"),
    stateProvince: getTextValue(formData, "stateProvince"),
    city: getTextValue(formData, "city"),
    professionalTitle: getTextValue(formData, "professionalTitle"),
    yearsExperience: getTextValue(formData, "yearsExperience"),
    categoryId: getTextValue(formData, "categoryId"),
    awardId: getTextValue(formData, "awardId"),
    websiteUrl: getTextValue(formData, "websiteUrl"),
    socialUrl: getTextValue(formData, "socialUrl"),
    reviewsUrl: getTextValue(formData, "reviewsUrl"),
    heardAbout: getTextValue(formData, "heardAbout"),
    heardAboutOther: getTextValue(formData, "heardAboutOther"),
    licenseCertification: formData
      .getAll("licenseCertification")
      .filter((entry): entry is File => isFilledFile(entry)),
  };

  const selectedCategory = categories.find(
    (category) => category.id === values.categoryId
  );
  const categoryFields = selectedCategory
    ? categoryFieldConfigs[selectedCategory.slug] ?? []
    : [];

  for (const field of categoryFields) {
    if (field.type === "checkbox-group") {
      values[field.key] = formData
        .getAll(field.key)
        .map((item) => String(item).trim())
        .filter(Boolean);
      continue;
    }

    if (field.type === "file") {
      values[field.key] = formData
        .getAll(field.key)
        .filter((item): item is File => isFilledFile(item));
      continue;
    }

    values[field.key] = getTextValue(formData, field.key);
  }

  return values;
}

async function uploadApplicationFile(
  file: File,
  applicationId: string,
  fieldKey: string,
  index = 0
) {
  const safeFileName = sanitizeFileName(file.name);
  const pathname = `applications/${applicationId}/${fieldKey}-${index + 1}-${safeFileName}`;

  const blob = await put(pathname, file, {
    access: "private",
    addRandomSuffix: true,
    contentType: file.type || "application/octet-stream",
  });

  return {
    fieldKey,
    fileName: file.name,
    fileUrl: blob.pathname,
    mimeType: file.type || "application/octet-stream",
    fileSize: file.size,
  } satisfies UploadedApplicationFile;
}

export async function saveApplicationSubmission(formData: FormData) {
  const categories = await getApplicationCategories();
  const values = extractApplicationValues(formData, categories);
  const validation = validateApplicationValues({
    values,
    categories,
  });

  if (!validation.success || !validation.selectedCategory || !validation.selectedAward) {
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

  const application = await prisma.application.create({
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

  const uploadedFiles = (
    await Promise.all(
      pendingFileUploads.flatMap(({ fieldKey, files }) =>
        files.map((file, index) =>
          uploadApplicationFile(file, application.id, fieldKey, index)
        )
      )
    )
  ).filter(Boolean);

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

  const checkoutSession = await createCompetitorCheckoutSession({
    applicationId: application.id,
    email: normalizedEmail,
    categoryId: validation.selectedCategory.id,
    awardId: validation.selectedAward.id,
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

export async function handleCompetitorStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      return handleCompetitorCheckoutCompleted(event);
    case "checkout.session.expired":
      return handleCompetitorCheckoutExpired(event);
    case "payment_intent.payment_failed":
      return handleCompetitorPaymentFailed(event);
    default:
      return false;
  }
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
  let emailPayload: {
    to: string;
    fullName: string;
    categoryName: string;
    awardName: string;
  } | null = null;

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
          status: true,
          paymentStatus: true,
          submittedAt: true,
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
      };
    });
  } catch (error) {
    if (isDuplicateStripeEventError(error)) {
      return true;
    }

    throw error;
  }

  if (!emailPayload) {
    return true;
  }

  try {
    await sendCompetitorApplicationConfirmedEmail(emailPayload);
  } catch (error) {
    console.error("Failed to send competitor payment confirmation email", error);
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

  return true;
}
