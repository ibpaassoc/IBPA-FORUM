import { z } from "zod";
import {
  isValidInstagramHandle,
  normalizeInstagramHandle,
} from "@/features/tickets/lib/instagram";
import { TICKET_PAYMENT_PLANS } from "@/features/tickets/lib/payment-plan";

const attendeeSchema = z.object({
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
});

const purchaseDetailsSchema = z.object({
    isIbpaMember: z.boolean(),
    ibpaCertNumber: z.string().optional(),
    promoCode: z.string().trim().optional(),
    paymentPlan: z.enum(TICKET_PAYMENT_PLANS).default("FULL"),
});

export const ticketApiSchema = z
  .discriminatedUnion("type", [
    attendeeSchema.extend({
      type: z.enum(["ONE_DAY", "TWO_DAYS"] as const),
      galaDinner: z.boolean(),
    }).merge(purchaseDetailsSchema),
    attendeeSchema.extend({
      type: z.literal("SPECIAL_PACKET"),
      galaDinner: z.literal(true),
      secondAttendee: attendeeSchema,
    }).merge(purchaseDetailsSchema),
  ])
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
