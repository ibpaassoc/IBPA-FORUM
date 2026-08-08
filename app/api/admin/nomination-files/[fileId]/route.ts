import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import { streamPrivateBlobFile } from "@/shared/lib/blob-file-response";
import { prisma } from "@/shared/lib/prisma";
import { adminT } from "@/lib/i18n/admin";
import { parseStoredFiles } from "@/features/database/json-fields";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    return new Response(adminT.api.unauthorized, { status: 401 });
  }

  const { fileId } = await params;

  const nominations = await prisma.nomination.findMany({ select: { files: true } });
  const fileRecord = nominations.flatMap((nomination) => parseStoredFiles(nomination.files).items).find((file) => file.id === fileId);
  const pathname = fileRecord?.blobKey ?? fileRecord?.url;

  if (!fileRecord || !pathname) {
    return new Response(adminT.api.notFound, { status: 404 });
  }

  const response = await streamPrivateBlobFile({
    request,
    pathname,
    fileName: fileRecord.filename,
    mimeType: fileRecord.mimeType,
  });

  return response ?? new Response(adminT.api.notFound, { status: 404 });
}
