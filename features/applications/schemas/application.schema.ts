import { z } from "zod";

export const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (value) => !value || z.url().safeParse(value).success,
    "Please enter a valid URL."
  );

export const requiredInstagramUrlSchema = z
  .string()
  .trim()
  .min(1, "Instagram is required.")
  .refine(
    (value) => z.url().safeParse(value).success,
    "Please enter a valid Instagram URL."
  );

export const baseApplicationSchema = z.object({
  firstName: z.string().trim().min(1, "First Name is required."),
  lastName: z.string().trim().min(1, "Last Name is required."),
  email: z.email("Please enter a valid email address."),
  phone: z.string().trim().min(1, "Phone / WhatsApp is required."),
  country: z.string().trim().min(1, "Country of Residence is required."),
  countryOther: z.string().optional(),
  stateProvince: z.string().optional(),
  city: z.string().trim().min(1, "City is required."),
  professionalTitle: z
    .string()
    .trim()
    .min(1, "Professional Title is required."),
  yearsExperience: z.coerce
    .number()
    .int("Years of Professional Experience must be a whole number.")
    .min(2, "A minimum of 2 years of professional experience is required."),
  categoryId: z.string().trim().min(1, "Category is required."),
  awardId: z.string().trim().min(1, "Nomination is required."),
  websiteUrl: requiredInstagramUrlSchema,
  socialUrl: optionalUrlSchema,
  reviewsUrl: optionalUrlSchema,
  heardAbout: z.string().optional(),
  heardAboutOther: z.string().optional(),
});
