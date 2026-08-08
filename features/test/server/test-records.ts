import "server-only";

import crypto from "node:crypto";
import { unscopedPrisma } from "@/shared/lib/prisma";
import {
  emptyTestAuditEvents,
  emptyTestCreatedRecords,
  emptyTestEmailDeliveries,
  parseTestAuditEvents,
  parseTestCreatedRecords,
  parseTestEmailDeliveries,
  testJson,
  type TestAuditEvent,
  type TestEmailDelivery,
  type TestRecordKey,
} from "@/features/test/lib/test-records";

export * from "@/features/test/lib/test-records";

function mergeIds(existing: string[], incoming: readonly string[]) {
  return [...new Set([...existing, ...incoming])];
}

export async function registerTestRecords(testId: string, patch: Partial<Record<TestRecordKey, readonly string[]>>) {
  return unscopedPrisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`test:${testId}`}))`;
    const test = await tx.test.findUniqueOrThrow({ where: { id: testId } });
    const records = parseTestCreatedRecords(test.createdRecords);
    for (const [key, ids] of Object.entries(patch) as Array<[TestRecordKey, readonly string[] | undefined]>) {
      if (ids?.length) records[key] = mergeIds(records[key], ids);
    }
    return tx.test.update({ where: { id: testId }, data: { createdRecords: testJson(records) } });
  });
}

export async function appendTestAudit(testId: string, input: Omit<TestAuditEvent, "id" | "createdAt">) {
  return unscopedPrisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`test:${testId}`}))`;
    const test = await tx.test.findUniqueOrThrow({ where: { id: testId } });
    const audit = parseTestAuditEvents(test.auditEvents);
    audit.events.push({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...input });
    return tx.test.update({ where: { id: testId }, data: { auditEvents: testJson(audit) } });
  });
}

export async function appendTestEmailDelivery(testId: string, delivery: TestEmailDelivery) {
  return unscopedPrisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`test:${testId}`}))`;
    const test = await tx.test.findUniqueOrThrow({ where: { id: testId } });
    const document = parseTestEmailDeliveries(test.emailDeliveries);
    document.deliveries.push(delivery);
    return tx.test.update({ where: { id: testId }, data: { emailDeliveries: testJson(document) } });
  });
}

export async function createTestRun(input: { name: string; kind: string; description?: string; configuration?: unknown }) {
  return unscopedPrisma.test.create({
    data: {
      name: input.name,
      kind: input.kind,
      description: input.description,
      configuration: testJson({ schemaVersion: 1, input: input.configuration ?? {} }),
      createdRecords: testJson(emptyTestCreatedRecords()),
      auditEvents: testJson(emptyTestAuditEvents()),
      emailDeliveries: testJson(emptyTestEmailDeliveries()),
    },
  });
}

export async function findTestOwningRecord(key: TestRecordKey, id: string) {
  const tests = await unscopedPrisma.test.findMany({ where: { status: { in: ["ACTIVE", "COMPLETED", "FAILED"] } }, orderBy: { createdAt: "desc" } });
  return tests.find((test) => parseTestCreatedRecords(test.createdRecords)[key].includes(id)) ?? null;
}

export async function listTestEmailDeliveries(limit = 50) {
  const tests = await unscopedPrisma.test.findMany({ orderBy: { createdAt: "desc" } });
  return tests.flatMap((test) => parseTestEmailDeliveries(test.emailDeliveries).deliveries.map((delivery) => ({ ...delivery, testId: test.id, createdAt: new Date(delivery.createdAt) }))).sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime()).slice(0, limit);
}
