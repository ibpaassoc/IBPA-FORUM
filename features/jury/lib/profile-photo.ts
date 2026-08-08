/**
 * Centralized resolution for jury profile photos.
 *
 * Jury profile photos are stored as **private** Vercel Blobs (the store only
 * allows private access), where `storageKey` holds the blob pathname. Some early
 * records may instead hold a fully-qualified public blob `url`.
 *
 * `resolveJuryPhotoSrc` normalizes both shapes into a single `<Image>` src:
 *  - public URL   -> used directly (served straight from Blob CDN)
 *  - private path -> served through the `/api/jury/profile-photo/[fileId]` proxy
 *
 * Keeping this logic in one place means the public grid, the active-members
 * carousel, and the proxy route all agree on how a photo is located.
 */

/** True when the value is a fully-qualified http(s) URL (a public blob URL). */
export function isPublicBlobUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^https?:\/\//i.test(value.trim());
}

/** Proxy route used for migrated private-blob records that have no public URL. */
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

// Shared jury profile-photo validation rules. Kept free of any server-only
// imports so both the admin API route and client components can use them.

export const ALLOWED_PROFILE_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

// Matches the enforced ceiling in /api/jury/upload (handleUpload).
export const MAX_PROFILE_PHOTO_BYTES = 25 * 1024 * 1024;

export const PROFILE_PHOTO_ACCEPT_ATTR = ".jpg,.jpeg,.png,.webp";

type PhotoLike = { mimeType?: string | null; fileSize?: number | null };

/**
 * Returns a translation-key-agnostic reason code when the photo is invalid,
 * or null when it passes. Callers map the code to a localized message.
 */
export function getProfilePhotoRejectReason(
  photo: PhotoLike,
): "type" | "size" | null {
  if (!photo.mimeType || !ALLOWED_PROFILE_PHOTO_TYPES.includes(photo.mimeType as (typeof ALLOWED_PROFILE_PHOTO_TYPES)[number])) {
    return "type";
  }
  if (typeof photo.fileSize === "number" && photo.fileSize > MAX_PROFILE_PHOTO_BYTES) {
    return "size";
  }
  return null;
}
