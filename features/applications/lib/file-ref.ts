import type { ApplicationFileRef } from "@/features/applications/types/application.types";

/**
 * Runtime guard for an already-uploaded Blob reference. Isomorphic (no Node
 * APIs) so it can be shared by client validation and server persistence.
 */
export function isApplicationFileRef(value: unknown): value is ApplicationFileRef {
  const isBrowserFile = typeof File !== "undefined" && value instanceof File;
  if (typeof value !== "object" || value === null || isBrowserFile) {
    return false;
  }

  const candidate = value as Partial<ApplicationFileRef>;
  return (
    typeof candidate.fieldKey === "string" &&
    candidate.fieldKey.length > 0 &&
    typeof candidate.fileName === "string" &&
    candidate.fileName.length > 0 &&
    typeof candidate.fileUrl === "string" &&
    candidate.fileUrl.length > 0 &&
    typeof candidate.mimeType === "string" &&
    candidate.mimeType.length > 0 &&
    typeof candidate.fileSize === "number" &&
    Number.isSafeInteger(candidate.fileSize) &&
    candidate.fileSize >= 0
  );
}
