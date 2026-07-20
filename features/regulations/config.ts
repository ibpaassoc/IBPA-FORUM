import type { RegulationLanguage } from "@/features/regulations/types";

const SAFE_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const MAX_REGULATION_PDF_BYTES = 25 * 1024 * 1024;

export function regulationBlobPath(scope: "general" | string, language: RegulationLanguage) {
  if (scope !== "general" && !SAFE_SEGMENT.test(scope)) {
    throw new Error("Invalid regulation storage scope.");
  }

  return `regulations/${scope}/${language}.pdf`;
}
