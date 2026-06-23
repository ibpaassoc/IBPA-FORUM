import type {
  ApplicationValues,
  BlockBValuesByNomination,
  CategoryOption,
} from "@/features/applications/types/application.types";

const NOM_PREFIX = "__nom__";

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
  void categories;

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

  // No longer extract flat Block B fields — they come via extractNominationBlockBValues
  return values;
}

/**
 * Parses per-nomination Block B values from FormData.
 * Keys are encoded as __nom__<awardId>__<fieldKey>.
 * CUIDs have no underscores, so splitting on "__" after the prefix is unambiguous.
 */
export function extractNominationBlockBValues(
  formData: FormData,
  categories: CategoryOption[],
  selectedAwardIds: string[]
): BlockBValuesByNomination {
  const result: BlockBValuesByNomination = {};

  // Build a map of awardId → categorySlug for the selected awards
  const awardCategorySlug = new Map<string, string>();
  for (const awardId of selectedAwardIds) {
    for (const category of categories) {
      if (category.awards.some((a) => a.id === awardId)) {
        awardCategorySlug.set(awardId, category.slug);
        break;
      }
    }
  }

  // Collect all __nom__ prefixed keys
  const seenKeys = new Set<string>();
  for (const key of formData.keys()) {
    if (!key.startsWith(NOM_PREFIX) || seenKeys.has(key)) continue;
    seenKeys.add(key);

    const rest = key.slice(NOM_PREFIX.length);
    const sepIdx = rest.indexOf("__");
    if (sepIdx === -1) continue;

    const awardId = rest.slice(0, sepIdx);
    const fieldKey = rest.slice(sepIdx + 2);
    if (!awardId || !fieldKey) continue;
    if (!awardCategorySlug.has(awardId)) continue;

    if (!result[awardId]) {
      result[awardId] = {};
    }

    const allValues = formData.getAll(key);
    const files = allValues.filter((v): v is File => isFilledFile(v));

    if (files.length > 0) {
      result[awardId][fieldKey] = files;
      continue;
    }

    const texts = allValues.map((v) => String(v).trim()).filter(Boolean);
    if (texts.length > 1) {
      result[awardId][fieldKey] = texts;
    } else if (texts.length === 1) {
      result[awardId][fieldKey] = texts[0];
    }
  }

  return result;
}

export const NOMINATION_FORM_PREFIX = NOM_PREFIX;
