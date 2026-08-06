import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import { streamPrivateBlobFile } from "@/shared/lib/blob-file-response";
import { prisma } from "@/shared/lib/prisma";
import { adminT } from "@/lib/i18n/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    return new Response(adminT.api.unauthorized, { status: 401 });
  }

  const { fileId } = await params;

  const fileRecord = await prisma.nominationFile.findUnique({
    where: { id: fileId },
    select: {
      fileName: true,
      mimeType: true,
      fileUrl: true,
    },
  });

  if (!fileRecord?.fileUrl) {
    return new Response(adminT.api.notFound, { status: 404 });
  }

  const response = await streamPrivateBlobFile({
    request,
    pathname: fileRecord.fileUrl,
    fileName: fileRecord.fileName,
    mimeType: fileRecord.mimeType,
  });

  return response ?? new Response(adminT.api.notFound, { status: 404 });
}
