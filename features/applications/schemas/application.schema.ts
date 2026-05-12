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

export const baseApplicationSchema = z.object({
  fullName: z.string().trim().min(1, "Full Legal Name is required."),
  email: z.email("Please enter a valid email address."),
  phone: z.string().trim().min(1, "Phone / WhatsApp is required."),
  country: z.string().trim().min(1, "Country of Residence is required."),
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
  categoryId: z.string().trim().min(1, "Award Direction is required."),
  awardId: z.string().trim().min(1, "Specific Award is required."),
  websiteUrl: optionalUrlSchema,
  socialUrl: optionalUrlSchema,
  reviewsUrl: optionalUrlSchema,
  heardAbout: z.string().optional(),
  heardAboutOther: z.string().optional(),
});
