import { z } from "zod";
import {
  isValidInstagramHandle,
  normalizeInstagramHandle,
} from "@/features/tickets/lib/instagram";

export const ticketApiSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required."),
    lastName: z.string().trim().min(1, "Last name is required."),
    email: z.email("Please enter a valid email address."),
    phone: z.string().trim().min(1, "Phone number is required."),
    instagram: z
      .string()
      .trim()
      .min(1, "Instagram is required.")
      .transform((value) => normalizeInstagramHandle(value))
      .refine((handle) => handle !== null && isValidInstagramHandle(handle), {
        message: "Enter a valid Instagram username or profile link.",
      }),
    type: z.enum(["ONE_DAY", "TWO_DAYS"] as const),
    galaDinner: z.boolean(),
    isIbpaMember: z.boolean(),
    ibpaCertNumber: z.string().optional(),
  })
  .refine(
    (data) =>
      !data.isIbpaMember ||
      (data.ibpaCertNumber && data.ibpaCertNumber.trim().length > 0),
    {
      message: "CERT number is required for IBPA members.",
      path: ["ibpaCertNumber"],
    }
  );

export type TicketApiInput = z.infer<typeof ticketApiSchema>;
