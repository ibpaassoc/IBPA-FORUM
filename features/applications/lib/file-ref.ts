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
    typeof candidate.fileUrl === "string" &&
    typeof candidate.mimeType === "string" &&
    typeof candidate.fileSize === "number"
  );
}
