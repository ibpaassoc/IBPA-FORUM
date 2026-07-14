import { get } from "@vercel/blob";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import { prisma } from "@/shared/lib/prisma";
import { isPublicBlobUrl } from "@/features/jury/lib/profile-photo";
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

  const fileRecord = await prisma.juryApplicationFile.findUnique({
    where: { id: fileId },
    select: {
      fileName: true,
      mimeType: true,
      storageKey: true,
    },
  });

  if (!fileRecord?.storageKey) {
    return new Response(adminT.api.notFound, { status: 404 });
  }

  let result;
  try {
    result = await get(fileRecord.storageKey, {
      access: "private",
      ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
    });
  } catch (error) {
    // Don't let a blob-access error 500 the admin preview; log safe metadata
    // and return 404 so the editor shows its empty state instead of crashing.
    console.error("admin jury-file blob fetch failed", {
      fileId,
      hasStorageKey: true,
      status:
        typeof error === "object" && error && "status" in error
          ? (error as { status?: number }).status
          : undefined,
    });
    return new Response(adminT.api.notFound, { status: 404 });
  }

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

  const encodedFileName = encodeURIComponent(fileRecord.fileName);
  const asciiFallback = fileRecord.fileName.replace(/[^\x20-\x7E]/g, "_");

  return new Response(result.stream, {
    status: 200,
    headers: {
      "Content-Type": fileRecord.mimeType || result.blob.contentType,
      "Content-Disposition": `inline; filename="${asciiFallback}"; filename*=UTF-8''${encodedFileName}`,
      "X-Content-Type-Options": "nosniff",
      ETag: result.blob.etag,
      "Cache-Control": "private, no-cache",
    },
  });
}
