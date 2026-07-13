import type { TicketType } from "@prisma/client";
import { z } from "zod";

export const ADMIN_EDITABLE_TICKET_TYPES = ["ONE_DAY", "TWO_DAYS"] as const;

export const adminTicketUpdateSchema = z.object({
  ticketId: z.string().trim().min(1, "Ticket ID is required."),
  updatedAt: z.string().datetime("Ticket version is required."),
  fullName: z.string().trim().min(1, "Customer name is required."),
  email: z.email("Enter a valid email address.").transform((value) => value.trim().toLowerCase()),
  phone: z.string().trim().min(1, "Phone number is required."),
  instagram: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  type: z.enum(ADMIN_EDITABLE_TICKET_TYPES),
  galaDinner: z.boolean(),
});

export type AdminTicketUpdateInput = z.infer<typeof adminTicketUpdateSchema>;

export type EditableTicketSnapshot = {
  fullName: string;
  email: string;
  phone: string;
  instagram: string | null;
  type: TicketType;
  galaDinner: boolean;
};

export type TicketChange = {
  field: keyof EditableTicketSnapshot;
  before: string | boolean | null;
  after: string | boolean | null;
  qrRelevant: boolean;
};

const QR_RELEVANT_FIELDS = new Set<keyof EditableTicketSnapshot>(["type", "galaDinner"]);

export function getEditableTicketSnapshot(ticket: EditableTicketSnapshot): EditableTicketSnapshot {
  return {
    fullName: ticket.fullName,
    email: ticket.email,
    phone: ticket.phone,
    instagram: ticket.instagram,
    type: ticket.type,
    galaDinner: ticket.galaDinner,
  };
}

export function compareEditableTicketChanges(
  previous: EditableTicketSnapshot,
  next: EditableTicketSnapshot
): TicketChange[] {
  const fields: Array<keyof EditableTicketSnapshot> = [
    "fullName",
    "email",
    "phone",
    "instagram",
    "type",
    "galaDinner",
  ];

  return fields.flatMap((field) => {
    const before = previous[field];
    const after = next[field];
    if (before === after) return [];
    return [{ field, before, after, qrRelevant: QR_RELEVANT_FIELDS.has(field) }];
  });
}

export function hasQrRelevantChanges(changes: TicketChange[]) {
  return changes.some((change) => change.qrRelevant);
}

export function ticketCanReceiveQr(status: string) {
  return status !== "PENDING" && status !== "CANCELED";
}

