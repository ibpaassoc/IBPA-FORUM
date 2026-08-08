import { z } from "zod";

const isoDateTime = z.string().datetime({ offset: true });

export const nominationAnswerFieldSchema = z.object({
  fieldId: z.string().min(1),
  label: z.string(),
  type: z.string().min(1),
  value: z.unknown(),
  updatedAt: isoDateTime,
});

export const nominationAnswersSchema = z.object({
  schemaVersion: z.literal(1),
  fields: z.array(nominationAnswerFieldSchema),
});

export const storedFileSchema = z.object({
  id: z.string().min(1),
  fieldId: z.string().min(1),
  blobKey: z.string().min(1).nullable().optional(),
  url: z.string().min(1).nullable().optional(),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().nonnegative(),
  originalSize: z.number().int().nonnegative().nullable().optional(),
  uploadedAt: isoDateTime,
}).refine((file) => Boolean(file.blobKey || file.url), {
  message: "A stored file must include an explicit Blob key or URL.",
});

export const storedFilesSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(storedFileSchema),
});

export const juryInformationRequestsSchema = z.object({
  schemaVersion: z.literal(1),
  requests: z.array(z.object({
    message: z.string().min(1),
    requestedAt: isoDateTime,
    resolvedAt: isoDateTime.nullable(),
    response: z.string().nullable(),
  })),
});

export const ticketCredentialSchema = z.object({
  schemaVersion: z.literal(1),
  active: z.object({
    token: z.string().min(8),
    status: z.literal("ACTIVE"),
    generatedAt: isoDateTime.optional(),
    lastSentAt: isoDateTime.nullable().optional(),
    lastDeliveryStatus: z.string().nullable().optional(),
    lastDeliveryProviderId: z.string().nullable().optional(),
    lastDeliveryError: z.string().nullable().optional(),
  }).nullable(),
  history: z.array(z.object({
    id: z.string().min(1),
    token: z.string().min(8),
    status: z.enum(["ACTIVE", "REPLACED", "REVOKED"]),
    generatedAt: isoDateTime,
    replacedAt: isoDateTime.nullable().optional(),
    revokedAt: isoDateTime.nullable().optional(),
    lastSentAt: isoDateTime.nullable().optional(),
    lastDeliveryStatus: z.string().nullable().optional(),
    lastDeliveryProviderId: z.string().nullable().optional(),
    lastDeliveryError: z.string().nullable().optional(),
  })),
});

export const ticketActivitySchema = z.object({
  schemaVersion: z.literal(1),
  events: z.array(z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    createdAt: isoDateTime,
  }).passthrough()),
});

export const regulationsSettingSchema = z.object({
  schemaVersion: z.literal(1),
  updatedAt: isoDateTime,
  general: z.object({ en: z.record(z.string(), z.unknown()), ru: z.record(z.string(), z.unknown()), ua: z.record(z.string(), z.unknown()) }).passthrough(),
  categories: z.record(z.string(), z.object({
    en: z.record(z.string(), z.unknown()),
    ru: z.record(z.string(), z.unknown()),
    ua: z.record(z.string(), z.unknown()),
  }).passthrough()),
});

export const promoCodesSettingSchema = z.object({
  schemaVersion: z.literal(1),
  updatedAt: isoDateTime,
  codes: z.array(z.object({
    id: z.string(),
    key: z.string(),
    keyword: z.string(),
    paymentFlow: z.enum(["APPLICATIONS", "TICKETS"]),
    discountPercent: z.number().int().min(0).max(100),
    enabled: z.boolean(),
    createdAt: isoDateTime,
    updatedAt: isoDateTime,
  })),
});

export type NominationAnswers = z.infer<typeof nominationAnswersSchema>;
export type StoredFiles = z.infer<typeof storedFilesSchema>;
export type StoredFile = z.infer<typeof storedFileSchema>;
export type JuryInformationRequests = z.infer<typeof juryInformationRequestsSchema>;
export type TicketCredential = z.infer<typeof ticketCredentialSchema>;
export type TicketActivity = z.infer<typeof ticketActivitySchema>;

export const emptyNominationAnswers = (): NominationAnswers => ({ schemaVersion: 1, fields: [] });
export const emptyStoredFiles = (): StoredFiles => ({ schemaVersion: 1, items: [] });
export const emptyJuryInformationRequests = (): JuryInformationRequests => ({ schemaVersion: 1, requests: [] });
export const emptyTicketCredential = (): TicketCredential => ({ schemaVersion: 1, active: null, history: [] });
export const emptyTicketActivity = (): TicketActivity => ({ schemaVersion: 1, events: [] });

export function parseNominationAnswers(value: unknown) {
  return nominationAnswersSchema.parse(value);
}

export function parseStoredFiles(value: unknown) {
  return storedFilesSchema.parse(value);
}

export function parseJuryInformationRequests(value: unknown) {
  return juryInformationRequestsSchema.parse(value);
}

export function parseTicketCredential(value: unknown) {
  return ticketCredentialSchema.parse(value);
}

export function parseTicketActivity(value: unknown) {
  return ticketActivitySchema.parse(value);
}

export function nominationAnswerViewRows(value: unknown) {
  return parseNominationAnswers(value).fields.map((field) => ({
    id: field.fieldId,
    fieldKey: field.fieldId,
    valueText: typeof field.value === "string" ? field.value : null,
    valueNumber: typeof field.value === "number" && Number.isInteger(field.value) ? field.value : null,
    valueBoolean: typeof field.value === "boolean" ? field.value : null,
    valueJson:
      typeof field.value === "string" || typeof field.value === "number" || typeof field.value === "boolean"
        ? null
        : field.value,
    createdAt: new Date(field.updatedAt),
  }));
}

export function nominationFileViewRows(value: unknown) {
  return parseStoredFiles(value).items.map((file) => ({
    id: file.id,
    fieldKey: file.fieldId,
    fileName: file.filename,
    fileUrl: file.url ?? "",
    originalFileName: file.filename,
    displayFileName: file.filename,
    mimeType: file.mimeType,
    fileSize: file.size,
    originalFileSize: file.originalSize ?? null,
    compressedFileSize: file.size,
    storageKey: file.blobKey ?? null,
    deletedAt: null,
    createdAt: new Date(file.uploadedAt),
  }));
}
