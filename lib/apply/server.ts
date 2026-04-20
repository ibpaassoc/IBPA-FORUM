import { put } from "@vercel/blob";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { categoryCatalog } from "@/lib/apply/catalog";
import { categoryFieldConfigs } from "@/lib/apply/categoryFieldConfigs";
import { validateApplicationValues } from "@/lib/apply/categorySchemas";
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

  const application = await prisma.application.create({
    data: {
      fullName: String(values.fullName),
      email: String(values.email),
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
      status: "SUBMITTED",
      paymentStatus: "PENDING",
      submittedAt: new Date(),
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

  return {
    ok: true as const,
    status: 201,
    body: {
      message:
        "Your participant application has been submitted successfully. The IBPA review team will contact you with the next steps.",
      applicationId: application.id,
    },
  };
}
