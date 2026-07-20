import "server-only";

import { del, get } from "@vercel/blob";
import type { RegulationLanguage } from "@/features/regulations/types";

const SAFE_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const MAX_REGULATION_PDF_BYTES = 25 * 1024 * 1024;

export function regulationBlobPath(scope: "general" | string, language: RegulationLanguage) {
  if (scope !== "general" && !SAFE_SEGMENT.test(scope)) {
    throw new Error("Invalid regulation storage scope.");
  }

  return `regulations/${scope}/${language}.pdf`;
}

export async function readRegulationBlob(url: string, requestHeaders?: Headers) {
  return get(url, {
    access: "private",
    headers: requestHeaders,
  });
}

export async function deleteRegulationBlob(url: string) {
  await del(url);
}
