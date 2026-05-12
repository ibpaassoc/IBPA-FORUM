import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import type {
  ApplicationValues,
  CategoryOption,
} from "@/features/applications/types/application.types";

function isFilledFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
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
    categoryId: getTextValue(formData, "directionId"),
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
