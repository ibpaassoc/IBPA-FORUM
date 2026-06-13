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

function getSelectedCategories(
  selectedAwardIds: string[],
  categories: CategoryOption[]
) {
  const selectedCategories: CategoryOption[] = [];
  const categoryIds = new Set<string>();

  for (const awardId of selectedAwardIds) {
    const category = categories.find((item) =>
      item.awards.some((award) => award.id === awardId)
    );

    if (category && !categoryIds.has(category.id)) {
      categoryIds.add(category.id);
      selectedCategories.push(category);
    }
  }

  return selectedCategories;
}

function getUniqueCategoryFields(selectedCategories: CategoryOption[]) {
  const fieldMap = new Map<string, (typeof categoryFieldConfigs)[string][number]>();

  for (const category of selectedCategories) {
    const fields = categoryFieldConfigs[category.slug] ?? [];

    for (const field of fields) {
      if (!fieldMap.has(field.key)) {
        fieldMap.set(field.key, field);
      }
    }
  }

  return Array.from(fieldMap.values());
}

export function extractApplicationValues(
  formData: FormData,
  categories: CategoryOption[]
): ApplicationValues {
  const selectedAwardIds = formData
    .getAll("selectedAwardIds")
    .map((item) => String(item).trim())
    .filter(Boolean);

  const values: ApplicationValues = {
    firstName: getTextValue(formData, "firstName"),
    lastName: getTextValue(formData, "lastName"),
    email: getTextValue(formData, "email"),
    phone: getTextValue(formData, "phone"),
    country: getTextValue(formData, "country"),
    countryOther: getTextValue(formData, "countryOther"),
    stateProvince: getTextValue(formData, "stateProvince"),
    city: getTextValue(formData, "city"),
    professionalTitle: getTextValue(formData, "professionalTitle"),
    yearsExperience: getTextValue(formData, "yearsExperience"),
    categoryId: getTextValue(formData, "categoryId"),
    awardId: getTextValue(formData, "awardId"),
    selectedAwardIds,
    websiteUrl: getTextValue(formData, "websiteUrl"),
    socialUrl: getTextValue(formData, "socialUrl"),
    reviewsUrl: getTextValue(formData, "reviewsUrl"),
    heardAbout: getTextValue(formData, "heardAbout"),
    heardAboutOther: getTextValue(formData, "heardAboutOther"),
    licenseCertification: formData
      .getAll("licenseCertification")
      .filter((entry): entry is File => isFilledFile(entry)),
  };

  const selectedCategories = getSelectedCategories(
    selectedAwardIds,
    categories
  );
  const categoryFields = getUniqueCategoryFields(selectedCategories);

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
