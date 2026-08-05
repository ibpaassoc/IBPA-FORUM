import { z } from "zod";

/**
 * Validation for the applicant-editable part of their own profile.
 *
 * Issue messages are stable codes, not copy: the account UI is translated at
 * render time, so the client maps these onto `t.account.profile.errors`.
 * Membership fields stay out of this schema — they are verified by staff.
 */
const REQUIRED = "required";
const TOO_LONG = "tooLong";
const INVALID_URL = "invalidUrl";
const INVALID_YEARS = "invalidYears";

const requiredText = (max: number) => z.string().trim().min(1, REQUIRED).max(max, TOO_LONG);
const optionalText = (max: number) => z.string().trim().max(max, TOO_LONG);

const optionalUrl = z
  .string()
  .trim()
  .max(300, TOO_LONG)
  .refine((value) => !value || z.url().safeParse(value).success, INVALID_URL);

export const applicantProfileUpdateSchema = z.object({
  fullName: requiredText(160),
  phone: optionalText(60),
  professionalTitle: optionalText(160),
  // Kept as text so an empty field clears the column instead of coercing to 0.
  yearsExperience: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{1,2}$/.test(value), INVALID_YEARS),
  country: requiredText(120),
  stateProvince: optionalText(120),
  city: requiredText(120),
  websiteUrl: optionalUrl,
  socialUrl: optionalUrl,
  reviewsUrl: optionalUrl,
});

export type ApplicantProfileInput = z.infer<typeof applicantProfileUpdateSchema>;
export type ApplicantProfileField = keyof ApplicantProfileInput;

export const applicantProfileFields = [
  "fullName",
  "phone",
  "professionalTitle",
  "yearsExperience",
  "country",
  "stateProvince",
  "city",
  "websiteUrl",
  "socialUrl",
  "reviewsUrl",
] as const satisfies readonly ApplicantProfileField[];
