import { put } from "@vercel/blob";
import type { UploadedApplicationFile } from "@/features/applications/types/application.types";

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadApplicationFile(
  file: File,
  applicationId: string,
  fieldKey: string,
  index = 0
) {
  const safeFileName = sanitizeFileName(file.name);
  const pathname = `applications/${applicationId}/${fieldKey}-${index + 1}-${safeFileName}`;

  const blob = await put(pathname, file, {
    access: "private",
    addRandomSuffix: true,
    contentType: file.type || "application/octet-stream",
  });

  return {
    fieldKey,
    fileName: file.name,
    fileUrl: blob.pathname,
    mimeType: file.type || "application/octet-stream",
    fileSize: file.size,
  } satisfies UploadedApplicationFile;
}
