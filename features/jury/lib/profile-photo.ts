/**
 * Centralized resolution for jury profile photos.
 *
 * Jury profile photos are stored as **public** Vercel Blobs, and the public blob
 * `url` is persisted in `JuryApplicationFile.storageKey`. Older records were
 * stored as **private** blobs, where `storageKey` holds only the blob pathname.
 *
 * `resolveJuryPhotoSrc` normalizes both shapes into a single `<Image>` src:
 *  - public URL  -> used directly (served straight from Blob CDN)
 *  - legacy path -> served through the `/api/jury/profile-photo/[fileId]` proxy
 *
 * Keeping this logic in one place means the public grid, the active-members
 * carousel, and the proxy route all agree on how a photo is located.
 */

/** True when the value is a fully-qualified http(s) URL (a public blob URL). */
export function isPublicBlobUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^https?:\/\//i.test(value.trim());
}

/** Proxy route used for legacy private-blob records that have no public URL. */
export function juryPhotoProxyPath(fileId: string) {
  return `/api/jury/profile-photo/${fileId}`;
}

/**
 * Resolves the best image src for a jury profile photo, or `null` when there is
 * no usable photo. `storageKey` is the value persisted on the file record.
 */
export function resolveJuryPhotoSrc(
  fileId: string | null | undefined,
  storageKey: string | null | undefined
): string | null {
  if (isPublicBlobUrl(storageKey)) return storageKey;
  if (fileId) return juryPhotoProxyPath(fileId);
  return null;
}

/** Two-letter (or single-letter) initials for a name, for avatar placeholders. */
export function juryInitials(fullName: string | null | undefined) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
