import type {
  ApplicationFileRef,
  ApplicationValues,
} from "@/features/applications/types/application.types";

export type StoredAnswerRow = {
  fieldKey: string;
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  valueJson: unknown;
};

export type StoredFileRow = {
  fieldKey: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
};

/**
 * Rebuilds the `ApplicationValues` map a nomination was last saved with, so the
 * stored nomination can be measured against exactly the rules that gate a
 * submission. Progress panels and the submit endpoint must agree on what
 * "complete" means, otherwise the editor reports a nomination as ready and the
 * endpoint rejects it.
 */
export function nominationValuesFromStorage(
  answers: StoredAnswerRow[],
  files: StoredFileRow[],
): ApplicationValues {
  const values: ApplicationValues = {};
  for (const answer of answers) {
    if (Array.isArray(answer.valueJson)) {
      values[answer.fieldKey] = answer.valueJson.filter(
        (item): item is string => typeof item === "string",
      );
    } else if (answer.valueNumber !== null) {
      values[answer.fieldKey] = String(answer.valueNumber);
    } else if (answer.valueBoolean !== null) {
      values[answer.fieldKey] = answer.valueBoolean ? "yes" : "no";
    } else {
      values[answer.fieldKey] = answer.valueText ?? "";
    }
  }

  const filesByField = new Map<string, ApplicationFileRef[]>();
  for (const file of files) {
    const refs = filesByField.get(file.fieldKey) ?? [];
    refs.push({
      fieldKey: file.fieldKey,
      fileName: file.fileName,
      fileUrl: file.fileUrl,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
    });
    filesByField.set(file.fieldKey, refs);
  }
  for (const [fieldKey, refs] of filesByField) values[fieldKey] = refs;
  return values;
}
