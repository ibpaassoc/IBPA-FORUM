import { Prisma } from "@prisma/client";
import { z } from "zod";

const idList = z.array(z.string().min(1)).default([]);

export const testCreatedRecordsSchema = z.object({
  schemaVersion: z.literal(1),
  accounts: idList,
  applicantProfiles: idList,
  juryApplications: idList,
  juryProfiles: idList,
  nominations: idList,
  reviews: idList,
  tickets: idList,
  payments: idList,
  webhookEvents: idList,
  blobKeys: idList,
});

export const testAuditEventSchema = z.object({
  id: z.string().min(1),
  action: z.string().min(1),
  targetType: z.string().min(1),
  targetId: z.string().nullable(),
  createdAt: z.string().datetime({ offset: true }),
  summary: z.unknown().optional(),
});

export const testAuditEventsSchema = z.object({ schemaVersion: z.literal(1), events: z.array(testAuditEventSchema) });

export const testEmailDeliverySchema = z.object({
  id: z.string().min(1),
  templateType: z.string().min(1),
  category: z.string().min(1),
  subject: z.string(),
  recipient: z.string(),
  intendedRecipient: z.string(),
  providerId: z.string().nullable(),
  delivered: z.boolean(),
  errorCode: z.string().nullable(),
  errorMessage: z.string().nullable(),
  providerResponse: z.unknown().nullable(),
  relatedEntityType: z.string().nullable(),
  relatedEntityId: z.string().nullable(),
  createdAt: z.string().datetime({ offset: true }),
});

export const testEmailDeliveriesSchema = z.object({ schemaVersion: z.literal(1), deliveries: z.array(testEmailDeliverySchema) });

export type TestCreatedRecords = z.infer<typeof testCreatedRecordsSchema>;
export type TestRecordKey = Exclude<keyof TestCreatedRecords, "schemaVersion">;
export type TestAuditEvent = z.infer<typeof testAuditEventSchema>;
export type TestEmailDelivery = z.infer<typeof testEmailDeliverySchema>;

export function emptyTestCreatedRecords(): TestCreatedRecords {
  return { schemaVersion: 1, accounts: [], applicantProfiles: [], juryApplications: [], juryProfiles: [], nominations: [], reviews: [], tickets: [], payments: [], webhookEvents: [], blobKeys: [] };
}

export function emptyTestAuditEvents() {
  return { schemaVersion: 1 as const, events: [] as TestAuditEvent[] };
}

export function emptyTestEmailDeliveries() {
  return { schemaVersion: 1 as const, deliveries: [] as TestEmailDelivery[] };
}

export const parseTestCreatedRecords = (value: unknown) => testCreatedRecordsSchema.parse(value);
export const parseTestAuditEvents = (value: unknown) => testAuditEventsSchema.parse(value);
export const parseTestEmailDeliveries = (value: unknown) => testEmailDeliveriesSchema.parse(value);
export const testJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;
