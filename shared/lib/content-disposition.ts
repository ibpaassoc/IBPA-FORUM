/**
 * Build an RFC 6266 / RFC 5987 `Content-Disposition` value for a user-supplied
 * filename.
 *
 * HTTP header values are ByteStrings: any code point above 255 makes the
 * `Response` constructor throw `TypeError: Cannot convert argument to a
 * ByteString`. Uploaded portfolio files routinely carry Cyrillic names, so
 * interpolating the raw filename turns the whole file route into a 500 and
 * every `<img src>` pointing at it renders broken.
 *
 * The ASCII fallback keeps legacy clients working; the `filename*` parameter
 * carries the real name for everything else.
 */
export function contentDisposition(fileName: string, type: "inline" | "attachment" = "inline") {
  const safeName = fileName.trim() || "file";
  const asciiFallback = safeName.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
  const encodedFileName = encodeURIComponent(safeName);

  return `${type}; filename="${asciiFallback}"; filename*=UTF-8''${encodedFileName}`;
}
