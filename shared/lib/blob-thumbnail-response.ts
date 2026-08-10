import "server-only";

import { get } from "@vercel/blob";
import sharp from "sharp";

const THUMBNAIL_WIDTH = 720;
const THUMBNAIL_HEIGHT = 540;

/** Build a small authenticated JPEG for image grids without decoding originals in the browser. */
export async function privateBlobThumbnailResponse({
  request,
  pathname,
  mimeType,
}: {
  request: Request;
  pathname: string;
  mimeType?: string | null;
}): Promise<Response | null> {
  if (!mimeType?.startsWith("image/")) return null;

  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode === 304) return null;

    const etag = `"${result.blob.etag.replaceAll('"', "")}-thumb-${THUMBNAIL_WIDTH}"`;
    if (request.headers.get("if-none-match") === etag) {
      return new Response(null, {
        status: 304,
        headers: { ETag: etag, "Cache-Control": "private, max-age=3600" },
      });
    }

    const input = Buffer.from(await new Response(result.stream).arrayBuffer());
    const output = await sharp(input, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({
        width: THUMBNAIL_WIDTH,
        height: THUMBNAIL_HEIGHT,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 72, mozjpeg: true })
      .toBuffer();

    return new Response(new Uint8Array(output), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(output.byteLength),
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
        ETag: etag,
      },
    });
  } catch (error) {
    console.warn("Unable to create private image thumbnail.", {
      pathname,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return null;
  }
}
