import { get } from "@vercel/blob";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
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

  const result = await get(fileRecord.fileUrl, {
    access: "private",
    ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
  });

  if (!result) {
    return new Response(adminT.api.notFound, { status: 404 });
  }

  if (result.statusCode === 304) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: result.blob.etag,
        "Cache-Control": "private, no-cache",
      },
    });
  }

  return new Response(result.stream, {
    status: 200,
    headers: {
      "Content-Type": fileRecord.mimeType || result.blob.contentType,
      "Content-Disposition": `inline; filename="${fileRecord.fileName}"`,
      "X-Content-Type-Options": "nosniff",
      ETag: result.blob.etag,
      "Cache-Control": "private, no-cache",
    },
  });
}
