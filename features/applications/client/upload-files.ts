"use client";

import { upload } from "@vercel/blob/client";
import type { ApplicationFileRef } from "@/features/applications/types/application.types";

// Files are uploaded straight to Vercel Blob from the browser so the final
// POST /api/applications request stays small. Images are already compressed to
// JPEG by UploadField before they reach here, so these ceilings are generous
// fallbacks that also guard raw PDFs / uncompressed uploads.
export const ACCEPTED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export const MAX_UPLOAD_SIZE_MB = 15;

const UPLOAD_ENDPOINT = "/api/applications/upload";

export function sanitizeBlobName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Returns a human-readable problem string if the file fails client-side
 * checks, or `null` when it is acceptable to upload.
 */
export function validateUploadFile(
  file: File,
  acceptedTypes: readonly string[] = ACCEPTED_UPLOAD_TYPES,
  maxFileSizeMb = MAX_UPLOAD_SIZE_MB,
): string | null {
  if (!acceptedTypes.includes(file.type)) {
    return `"${file.name}" is an unsupported file type for this field.`;
  }

  if (file.size > maxFileSizeMb * 1024 * 1024) {
    return `"${file.name}" is too large. Maximum size is ${maxFileSizeMb} MB.`;
  }

  return null;
}

/**
 * Uploads a single file to Vercel Blob and returns the reference metadata that
 * the submit endpoint persists (no raw bytes leave in the final request).
 */
export async function uploadApplicationBlob(
  file: File,
  pathname: string,
  fieldKey: string,
  nominationId: string,
  onUploadProgress?: (progress: {
    loaded: number;
    total: number;
    percentage: number;
  }) => void,
): Promise<ApplicationFileRef> {
  const result = await upload(pathname, file, {
    access: "private",
    handleUploadUrl: UPLOAD_ENDPOINT,
    clientPayload: JSON.stringify({ nominationId, fieldKey }),
    contentType: file.type,
    multipart: true,
    onUploadProgress,
  });

  return {
    fieldKey,
    fileName: file.name,
    fileUrl: result.pathname,
    mimeType: file.type || "application/octet-stream",
    fileSize: file.size,
  };
}
