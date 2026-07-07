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
