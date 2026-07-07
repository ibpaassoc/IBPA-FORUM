import { get } from "@vercel/blob";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import { prisma } from "@/shared/lib/prisma";
import { isPublicBlobUrl } from "@/features/jury/lib/profile-photo";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    return new Response("Unauthorized", { status: 401 });
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
    return new Response("Not found", { status: 404 });
  }

  // Profile photos are stored as public blobs (storageKey is a URL) — redirect.
  if (isPublicBlobUrl(fileRecord.storageKey)) {
    return Response.redirect(fileRecord.storageKey, 308);
  }

  let result;
  try {
    result = await get(fileRecord.storageKey, {
      access: "private",
      ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
    });
  } catch (error) {
    console.error("[admin/jury-files] Failed to read private jury file blob.", {
      fileId,
      pathname: fileRecord.storageKey,
      message: error instanceof Error ? error.message : String(error),
    });
    return new Response("Not found", { status: 404 });
  }

  if (!result) {
    return new Response("Not found", { status: 404 });
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
