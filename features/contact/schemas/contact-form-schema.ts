import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.email("Please enter a valid email address.").max(200),
  subject: z.string().trim().max(200).optional().default(""),
  message: z
    .string()
    .trim()
    .min(10, "Please tell us a little more about your request.")
    .max(4000),
  // Honeypot: real users never fill this hidden field. Bots usually do.
  company: z.string().max(0).optional().default(""),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
