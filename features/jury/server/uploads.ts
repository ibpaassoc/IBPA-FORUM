import { put } from "@vercel/blob";

export type BlobFileInfo = {
  fileName: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
};

export function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function isFilledFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

export function toOptionalText(value: string) {
  return value || null;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function saveUploadedJuryFile(
  file: File,
  applicationId: string,
  fieldKey: string,
  index = 0
) {
  const safeFileName = sanitizeFileName(file.name);
  const pathname = `jury/${applicationId}/${fieldKey}-${index + 1}-${safeFileName}`;

  const blob = await put(pathname, file, {
    access: "private",
    addRandomSuffix: true,
    contentType: file.type || "application/octet-stream",
  });

  return {
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    fileSize: file.size,
    storageKey: blob.pathname,
  };
}
