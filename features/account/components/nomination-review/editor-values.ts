import { isApplicationFileRef } from "@/features/applications/lib/file-ref";
import type { ApplicationFileRef } from "@/features/applications/types/application.types";

export type EditorValue =
  | string
  | string[]
  | File[]
  | ApplicationFileRef[]
  | Array<File | ApplicationFileRef>
  | null
  | undefined;

export type EditorValues = Record<string, EditorValue>;

export type InitialAnswer = {
  fieldKey: string;
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  valueJson: unknown;
};

export type InitialFile = {
  id: string;
  fieldKey: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
};

export function answerToValue(answer: InitialAnswer): EditorValue {
  if (Array.isArray(answer.valueJson)) {
    return answer.valueJson.filter((item): item is string => typeof item === "string");
  }
  if (answer.valueNumber !== null) return String(answer.valueNumber);
  if (answer.valueBoolean !== null) return answer.valueBoolean ? "yes" : "no";
  return answer.valueText ?? "";
}

export function existingFileToRef(file: InitialFile): ApplicationFileRef {
  return {
    fieldKey: file.fieldKey,
    fileName: file.fileName,
    fileUrl: file.fileUrl,
    mimeType: file.mimeType,
    fileSize: file.fileSize,
  };
}

export function getStringArray(value: EditorValue) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function getFileValues(value: EditorValue): Array<File | ApplicationFileRef> {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is File | ApplicationFileRef =>
      item instanceof File || isApplicationFileRef(item),
  );
}

export function buildInitialValues(
  initialAnswers: InitialAnswer[],
  initialFiles: InitialFile[],
): EditorValues {
  const next: EditorValues = {};
  for (const answer of initialAnswers) {
    next[answer.fieldKey] = answerToValue(answer);
  }
  for (const file of initialFiles) {
    const refs = getFileValues(next[file.fieldKey]).filter(isApplicationFileRef);
    next[file.fieldKey] = [...refs, existingFileToRef(file)];
  }
  return next;
}
