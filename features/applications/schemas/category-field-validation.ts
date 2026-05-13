import { z } from "zod";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
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

function getFileArrayValue(values: ApplicationValues, key: string) {
  const value = values[key];
  return Array.isArray(value)
    ? value.filter((item): item is File => item instanceof File)
    : [];
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

    const maxFileSizeBytes = (field.maxFileSizeMb ?? 5) * 1024 * 1024;
    const oversizedFile = files.find((file) => file.size > maxFileSizeBytes);

    if (oversizedFile) {
      errors[field.key] = `${field.label} files must be ${(maxFileSizeBytes / 1024 / 1024).toFixed(0)}MB or smaller.`;
    }
  }
}

export function validateApplicationValues({
  values,
  categories,
}: {
  values: ApplicationValues;
  categories: CategoryOption[];
}) {
  const errors: ValidationErrors = {};
  const result = baseApplicationSchema.safeParse({
    fullName: getStringValue(values, "fullName"),
    email: getStringValue(values, "email"),
    phone: getStringValue(values, "phone"),
    country: getStringValue(values, "country"),
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

  if (
    getStringValue(values, "heardAbout") === "other" &&
    !getStringValue(values, "heardAboutOther")
  ) {
    errors.heardAboutOther = "Please tell us how you heard about us.";
  }

  const selectedCategory = categories.find(
    (category) => category.id === getStringValue(values, "categoryId")
  );

  if (!selectedCategory) {
    errors.categoryId = "Please select a valid direction.";
  }

  const selectedAward = selectedCategory?.awards.find(
    (award) => award.id === getStringValue(values, "awardId")
  );

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
      maxFiles: 1,
      maxFileSizeMb: 5,
    },
    values,
    errors
  );

  if (selectedCategory) {
    const categoryFields = categoryFieldConfigs[selectedCategory.slug] ?? [];

    for (const field of categoryFields) {
      validateConfigField(field, values, errors);
    }

    if (selectedCategory.slug === "education") {
      const testimonialText = getStringValue(values, "studentTestimonialsText");
      const testimonialFiles = getFileArrayValue(values, "studentTestimonialsFiles");

      if (!testimonialText && testimonialFiles.length === 0) {
        errors.studentTestimonialsText =
          "Student Testimonials require written text or uploaded files.";
        errors.studentTestimonialsFiles =
          "Student Testimonials require written text or uploaded files.";
      }
    }

    if (selectedCategory.slug === "salon") {
      const rating = getNumberValue(values, "averageRating");
      if (Number.isFinite(rating) && (rating < 1 || rating > 5)) {
        errors.averageRating = "Average Rating must be between 1.0 and 5.0.";
      }
    }
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
    selectedCategory,
    selectedAward,
  };
}

export function getVisibleCategoryFields(
  categorySlug: string | null,
  values: ApplicationValues
) {
  if (!categorySlug) {
    return [];
  }

  return (categoryFieldConfigs[categorySlug] ?? []).filter((field) =>
    getFieldVisibility(field, values)
  );
}
