import { get } from "@vercel/blob";
import { prisma } from "@/shared/lib/prisma";
import { isPublicBlobUrl } from "@/features/jury/lib/profile-photo";

/**
 * Serves an approved jury member's profile photo.
 *
 * New photos are stored as public blobs; `storageKey` holds the public URL and
 * we simply redirect to it. Legacy photos are private blobs (`storageKey` holds
 * a pathname) and are streamed through this route using the read/write token.
 *
 * The route never throws and never returns an empty/`null` body: any failure
 * (missing record, missing token, blob 403/404, unexpected error) resolves to a
 * clean `404` so the client image `onError` fallback can render a placeholder.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  const fileRecord = await prisma.juryApplicationFile.findUnique({
    where: { id: fileId },
    select: {
      fileName: true,
      mimeType: true,
      storageKey: true,
      fieldKey: true,
      juryApplication: {
        select: {
          status: true,
          paymentStatus: true,
        },
      },
    },
  });

  if (
    !fileRecord?.storageKey ||
    fileRecord.fieldKey !== "profilePhoto" ||
    fileRecord.juryApplication.status !== "PAID" ||
    fileRecord.juryApplication.paymentStatus !== "PAID"
  ) {
    return new Response("Not found", { status: 404 });
  }

  // New records store a public blob URL — redirect straight to the CDN.
  if (isPublicBlobUrl(fileRecord.storageKey)) {
    return Response.redirect(fileRecord.storageKey, 308);
  }

  // Legacy records store a private blob pathname — stream it via the token.
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error(
      "[jury/profile-photo] BLOB_READ_WRITE_TOKEN is not configured; cannot serve private jury photo.",
      { fileId }
    );
    return new Response("Not found", { status: 404 });
  }

  let result;
  try {
    result = await get(fileRecord.storageKey, {
      access: "private",
      ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
    });
  } catch (error) {
    // Blob may reject private reads with 403 (e.g. access mismatch). Log
    // context without leaking the token, and fall back to a 404 placeholder.
    console.error("[jury/profile-photo] Failed to read private jury photo blob.", {
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
        "Cache-Control": "public, max-age=300",
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
      "Cache-Control": "public, max-age=300",
    },
  });
}
