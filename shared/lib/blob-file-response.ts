import "server-only";

import { get } from "@vercel/blob";
import { contentDisposition } from "@/shared/lib/content-disposition";

/**
 * Stream a private Blob to the browser as an inline preview, honouring byte
 * ranges.
 *
 * Video playback depends on ranges in a way image previews never did. Chromium
 * will progressively play a plain `200` but cannot seek inside it, and WebKit
 * refuses to start at all — the first request it makes for a media element is a
 * range request and it expects `206` back.
 *
 * The client's `Range` is forwarded upstream and whatever comes back is
 * mirrored, so a response is only ever promoted to `206` when the store really
 * did serve a partial body. If the store ignores the range, this degrades to
 * exactly the full-body `200` these routes have always returned.
 *
 * Returns `null` when the blob is missing, so each caller can answer 404 in its
 * own vocabulary.
 */
export async function streamPrivateBlobFile({
  request,
  pathname,
  fileName,
  mimeType,
}: {
  request: Request;
  pathname: string;
  fileName: string;
  mimeType?: string | null;
}): Promise<Response | null> {
  const range = request.headers.get("range");

  const result = await get(pathname, {
    access: "private",
    ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
    ...(range ? { headers: { Range: range } } : {}),
  });

  if (!result) return null;

  if (result.statusCode === 304) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: result.blob.etag,
        "Cache-Control": "private, no-cache",
      },
    });
  }

  const contentRange = result.headers.get("content-range");
  const contentLength = result.headers.get("content-length");
  // Only claim range support the store has demonstrated. Claiming `none` when
  // the client never asked for a range would talk WebKit out of even trying.
  const acceptRanges = result.headers.get("accept-ranges") ?? (contentRange ? "bytes" : null);

  const headers = new Headers({
    "Content-Type": mimeType || result.blob.contentType,
    "Content-Disposition": contentDisposition(fileName),
    "X-Content-Type-Options": "nosniff",
    ETag: result.blob.etag,
    "Cache-Control": "private, no-cache",
  });
  if (acceptRanges) headers.set("Accept-Ranges", acceptRanges);
  if (contentLength) headers.set("Content-Length", contentLength);
  if (contentRange) headers.set("Content-Range", contentRange);

  return new Response(result.stream, {
    status: contentRange ? 206 : 200,
    headers,
  });
}
