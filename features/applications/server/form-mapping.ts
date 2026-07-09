import { isApplicationFileRef } from "@/features/applications/lib/file-ref";
import type {
  ApplicationFileRef,
  ApplicationValues,
  BlockBValuesByNomination,
  CategoryOption,
} from "@/features/applications/types/application.types";

const NOM_PREFIX = "__nom__";
const NOM_BLOB_PREFIX = "__nomblob__";

function getTextValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

/**
 * Parses uploaded-file metadata that the browser attached as JSON strings.
 * Malformed entries are skipped so a bad payload can never crash submission.
 */
function parseBlobRefs(
  entries: FormDataEntryValue[],
  fallbackFieldKey: string
): ApplicationFileRef[] {
  const refs: ApplicationFileRef[] = [];

  for (const entry of entries) {
    if (typeof entry !== "string") continue;

    try {
      const parsed = JSON.parse(entry) as unknown;
      if (!isApplicationFileRef(parsed)) continue;

      refs.push({
        fieldKey:
          typeof parsed.fieldKey === "string" && parsed.fieldKey
            ? parsed.fieldKey
            : fallbackFieldKey,
        fileName: String(parsed.fileName ?? "file"),
        fileUrl: parsed.fileUrl,
        mimeType: parsed.mimeType || "application/octet-stream",
        fileSize: Number.isFinite(parsed.fileSize) ? parsed.fileSize : 0,
      });
    } catch {
      // Ignore malformed metadata.
    }
  }

  return refs;
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
    // Files are uploaded to Blob client-side; only references arrive here.
    licenseCertification: parseBlobRefs(
      formData.getAll("licenseCertificationBlob"),
      "licenseCertification"
    ),
  };

  // No longer extract flat Block B fields — they come via extractNominationBlockBValues
  return values;
}

/**
 * Parses per-nomination Block B values from FormData.
 * Text values are encoded as __nom__<awardId>__<fieldKey>; uploaded-file
 * references as __nomblob__<awardId>__<fieldKey> (JSON metadata).
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

  const seenKeys = new Set<string>();
  for (const key of formData.keys()) {
    if (seenKeys.has(key)) continue;

    const isBlob = key.startsWith(NOM_BLOB_PREFIX);
    const isText = !isBlob && key.startsWith(NOM_PREFIX);
    if (!isBlob && !isText) continue;
    seenKeys.add(key);

    const rest = key.slice((isBlob ? NOM_BLOB_PREFIX : NOM_PREFIX).length);
    const sepIdx = rest.indexOf("__");
    if (sepIdx === -1) continue;

    const awardId = rest.slice(0, sepIdx);
    const fieldKey = rest.slice(sepIdx + 2);
    if (!awardId || !fieldKey) continue;
    if (!awardCategorySlug.has(awardId)) continue;

    if (!result[awardId]) {
      result[awardId] = {};
    }

    if (isBlob) {
      const refs = parseBlobRefs(formData.getAll(key), fieldKey);
      if (refs.length > 0) {
        result[awardId][fieldKey] = refs;
      }
      continue;
    }

    const texts = formData
      .getAll(key)
      .map((v) => String(v).trim())
      .filter(Boolean);
    if (texts.length > 1) {
      result[awardId][fieldKey] = texts;
    } else if (texts.length === 1) {
      result[awardId][fieldKey] = texts[0];
    }
  }

  return result;
}

export const NOMINATION_FORM_PREFIX = NOM_PREFIX;
export const NOMINATION_BLOB_PREFIX = NOM_BLOB_PREFIX;
