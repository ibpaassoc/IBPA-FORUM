import { z } from "zod";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { isApplicationFileRef } from "@/features/applications/lib/file-ref";
import { baseApplicationSchema } from "@/features/applications/schemas/application.schema";
import type {
  ApplicationValues,
  ApplyFieldConfig,
  CategoryOption,
  ValidationErrors,
} from "@/features/applications/types/application.types";

function getWordCount(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function getFieldVisibility(
  field: ApplyFieldConfig,
  values: ApplicationValues
) {
  if (!field.visibleWhen) {
    return true;
  }

  return String(values[field.visibleWhen.fieldKey] ?? "") === field.visibleWhen.equals;
}

function getStringValue(values: ApplicationValues, key: string) {
  const value = values[key];
  return typeof value === "string" ? value.trim() : "";
}

function getNumberValue(values: ApplicationValues, key: string) {
  const value = values[key];
  if (typeof value === "string" && value.trim()) {
    return Number(value);
  }

  return Number.NaN;
}

function getStringArrayValue(values: ApplicationValues, key: string) {
  const value = values[key];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

// Normalizes attached files to a `{ type, size }` shape so validation works
// identically for raw File objects (client) and uploaded Blob references
// (server, where files are already in Blob and only metadata is present).
function getFileArrayValue(
  values: ApplicationValues,
  key: string
): Array<{ type: string; size: number }> {
  const value = values[key];
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (item instanceof File) {
      return [{ type: item.type, size: item.size }];
    }
    if (isApplicationFileRef(item)) {
      return [{ type: item.mimeType, size: item.fileSize }];
    }
    return [];
  });
}

function getUniqueCategoryFields(categories: CategoryOption[]) {
  const fieldMap = new Map<string, ApplyFieldConfig>();

  for (const category of categories) {
    const fields = categoryFieldConfigs[category.slug] ?? [];

    for (const field of fields) {
      if (!fieldMap.has(field.key)) {
        fieldMap.set(field.key, field);
      }
    }
  }

  return Array.from(fieldMap.values());
}

export function getSelectedAwards(
  values: ApplicationValues,
  categories: CategoryOption[]
) {
  const selectedAwardIds = Array.from(
    new Set(getStringArrayValue(values, "selectedAwardIds"))
  );

  const selectedAwards = selectedAwardIds
    .map((awardId) => {
      for (const category of categories) {
        const award = category.awards.find((item) => item.id === awardId);

        if (award) {
          return {
            category,
            award,
          };
        }
      }

      return null;
    })
    .filter(
      (
        item
      ): item is {
        category: CategoryOption;
        award: CategoryOption["awards"][number];
      } => item !== null
    );

  const selectedCategories = Array.from(
    new Map(selectedAwards.map((item) => [item.category.id, item.category])).values()
  );

  return {
    selectedAwardIds,
    selectedAwards,
    selectedCategories,
  };
}

export function getVisibleCategoryFields(
  selectedCategories: CategoryOption[],
  values: ApplicationValues
) {
  return getUniqueCategoryFields(selectedCategories).filter((field) =>
    getFieldVisibility(field, values)
  );
}

function validateConfigField(
  field: ApplyFieldConfig,
  values: ApplicationValues,
  errors: ValidationErrors
) {
  const visible = getFieldVisibility(field, values);

  if (!visible) {
    return;
  }

  if (field.type === "textarea") {
    const value = getStringValue(values, field.key);

    if (field.required && !value) {
      errors[field.key] = `${field.label} is required.`;
      return;
    }

    if (field.maxWords && value && getWordCount(value) > field.maxWords) {
      errors[field.key] = `${field.label} must be ${field.maxWords} words or fewer.`;
    }

    return;
  }

  if (
    field.type === "text" ||
    field.type === "email" ||
    field.type === "tel" ||
    field.type === "url" ||
    field.type === "select" ||
    field.type === "radio"
  ) {
    const value = getStringValue(values, field.key);

    if (field.required && !value) {
      errors[field.key] = `${field.label} is required.`;
      return;
    }

    if (field.type === "url" && value && !z.url().safeParse(value).success) {
      errors[field.key] = `${field.label} must be a valid URL.`;
    }

    return;
  }

  if (field.type === "number") {
    const raw = getStringValue(values, field.key);
    const value = getNumberValue(values, field.key);

    if (field.required && !raw) {
      errors[field.key] = `${field.label} is required.`;
      return;
    }

    if (raw && !Number.isFinite(value)) {
      errors[field.key] = `${field.label} must be a valid number.`;
      return;
    }

    if (raw && field.min !== undefined && value < field.min) {
      errors[field.key] = `${field.label} must be at least ${field.min}.`;
      return;
    }

    if (raw && field.max !== undefined && value > field.max) {
      errors[field.key] = `${field.label} must be ${field.max} or less.`;
    }

    return;
  }

  if (field.type === "checkbox-group") {
    const valuesArray = getStringArrayValue(values, field.key);

    if (field.required && valuesArray.length === 0) {
      errors[field.key] = `${field.label} is required.`;
    }

    return;
  }

  if (field.type === "file") {
    const files = getFileArrayValue(values, field.key);

    if (field.required && files.length === 0) {
      errors[field.key] = `${field.label} is required.`;
      return;
    }

    if (field.minFiles !== undefined && files.length > 0 && files.length < field.minFiles) {
      errors[field.key] = `${field.label} requires at least ${field.minFiles} file(s).`;
      return;
    }

    if (field.maxFiles !== undefined && files.length > field.maxFiles) {
      errors[field.key] = `${field.label} allows up to ${field.maxFiles} file(s).`;
      return;
    }

    const invalidType = files.find(
      (file) => field.accept?.length && !field.accept.includes(file.type)
    );

    if (invalidType) {
      errors[field.key] = `${field.label} contains an unsupported file type.`;
      return;
    }

  }
}

function validateNominationBlockB(
  categorySlug: string,
  nomValues: ApplicationValues
): ValidationErrors {
  const nomErrors: ValidationErrors = {};
  const fields = categoryFieldConfigs[categorySlug] ?? [];

  for (const field of fields) {
    validateConfigField(field, nomValues, nomErrors);
  }

  if (categorySlug === "education") {
    const testimonialText = getStringValue(nomValues, "studentTestimonialsText");
    const testimonialFiles = getFileArrayValue(nomValues, "studentTestimonialsFiles");

    if (!testimonialText && testimonialFiles.length === 0) {
      nomErrors.studentTestimonialsText =
        "Student Testimonials require written text or uploaded files.";
      nomErrors.studentTestimonialsFiles =
        "Student Testimonials require written text or uploaded files.";
    }
  }

  if (categorySlug === "salon") {
    const rating = getNumberValue(nomValues, "averageRating");
    if (Number.isFinite(rating) && (rating < 1 || rating > 5)) {
      nomErrors.averageRating = "Average Rating must be between 1.0 and 5.0.";
    }
  }

  return nomErrors;
}

function getNewValidationErrors(
  currentErrors: ValidationErrors,
  nextErrors: ValidationErrors,
): ValidationErrors {
  return Object.fromEntries(
    Object.entries(nextErrors).filter(([fieldKey]) => !(fieldKey in currentErrors)),
  );
}

export function validateApplicationValues({
  values,
  blockBValuesByNomination = {},
  categories,
}: {
  values: ApplicationValues;
  blockBValuesByNomination?: Record<string, ApplicationValues>;
  categories: CategoryOption[];
}) {
  const errors: ValidationErrors = {};
  const { selectedAwardIds, selectedAwards, selectedCategories } =
    getSelectedAwards(values, categories);
  const result = baseApplicationSchema.safeParse({
    firstName: getStringValue(values, "firstName"),
    lastName: getStringValue(values, "lastName"),
    email: getStringValue(values, "email"),
    phone: getStringValue(values, "phone"),
    country: getStringValue(values, "country"),
    countryOther: getStringValue(values, "countryOther"),
    stateProvince: getStringValue(values, "stateProvince"),
    city: getStringValue(values, "city"),
    professionalTitle: getStringValue(values, "professionalTitle"),
    yearsExperience: getStringValue(values, "yearsExperience"),
    categoryId: getStringValue(values, "categoryId"),
    awardId: getStringValue(values, "awardId"),
    websiteUrl: getStringValue(values, "websiteUrl"),
    socialUrl: getStringValue(values, "socialUrl"),
    reviewsUrl: getStringValue(values, "reviewsUrl"),
    heardAbout: getStringValue(values, "heardAbout"),
    heardAboutOther: getStringValue(values, "heardAboutOther"),
  });

  if (!result.success) {
    for (const issue of result.error.issues) {
      const path = issue.path[0];
      if (typeof path === "string") {
        errors[path] = issue.message;
      }
    }
  }

  if (getStringValue(values, "country") === "USA" && !getStringValue(values, "stateProvince")) {
    errors.stateProvince = "State / Province is required when country is USA.";
  }
  if (getStringValue(values, "country") === "Other" && !getStringValue(values, "countryOther")) {
    errors.countryOther = "Please enter your country.";
  }

  if (
    getStringValue(values, "heardAbout") === "other" &&
    !getStringValue(values, "heardAboutOther")
  ) {
    errors.heardAboutOther = "Please tell us how you heard about us.";
  }

  if (selectedAwardIds.length === 0) {
    errors.selectedAwardIds = "Please choose at least one nomination.";
  } else if (selectedAwardIds.length > 5) {
    errors.selectedAwardIds = "You can select up to five nominations.";
  }

  if (selectedAwards.length !== selectedAwardIds.length) {
    errors.selectedAwardIds = "One or more selected nominations are invalid.";
  }

  const selectedAward = selectedAwards[0]?.award;
  const activeCategory = selectedCategories[0];

  if (!activeCategory) {
    errors.categoryId = "Please select a valid category.";
  }

  if (!selectedAward) {
    errors.awardId = "Please select a valid specific nomination.";
  }

  validateConfigField(
    {
      key: "licenseCertification",
      label: "Professional License / Certification",
      type: "file",
      required: true,
      accept: ["image/jpeg", "image/png", "application/pdf"],
      minFiles: 1,
      maxFiles: 5,
    },
    values,
    errors
  );

  // Validate per-nomination Block B
  const blockBErrors: Record<string, ValidationErrors> = {};
  for (const { award, category } of selectedAwards) {
    const nomValues = blockBValuesByNomination[award.id] ?? {};
    const nomErrors = validateNominationBlockB(category.slug, nomValues);
    if (Object.keys(nomErrors).length > 0) {
      blockBErrors[award.id] = nomErrors;
    }
  }

  const allBlockBValid = Object.keys(blockBErrors).length === 0;

  return {
    success: Object.keys(errors).length === 0 && allBlockBValid,
    errors,
    blockBErrors,
    selectedCategory: activeCategory,
    selectedAward,
    selectedAwards,
    selectedCategories,
  };
}

// Export for use in server commands
export { getNewValidationErrors, validateNominationBlockB };
