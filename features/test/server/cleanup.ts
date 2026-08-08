import "server-only";

import { del } from "@vercel/blob";
import { parseStoredFiles } from "@/features/database/json-fields";
import { unscopedPrisma } from "@/shared/lib/prisma";
import {
  appendTestAudit,
  findTestOwningRecord,
  parseTestCreatedRecords,
  parseTestEmailDeliveries,
  testJson,
  type TestCreatedRecords,
  type TestRecordKey,
} from "@/features/test/server/test-records";

export type TestEntityType = "account" | "nomination" | "review" | "ticket" | "email";

export type DeletionSummary = {
  accounts: number;
  applicantProfiles: number;
  juryProfiles: number;
  juryApplications: number;
  nominations: number;
  reviews: number;
  tickets: number;
  qrCredentials: number;
  uploads: number;
  payments: number;
  emails: number;
  other: number;
  blobsDeleted: number;
  blobErrors: string[];
  total: number;
};

function emptySummary(): DeletionSummary {
  return {
    accounts: 0,
    applicantProfiles: 0,
    juryProfiles: 0,
    juryApplications: 0,
    nominations: 0,
    reviews: 0,
    tickets: 0,
    qrCredentials: 0,
    uploads: 0,
    payments: 0,
    emails: 0,
    other: 0,
    blobsDeleted: 0,
    blobErrors: [],
    total: 0,
  };
}

function idWhere(ids: string[]) {
  return { id: { in: ids }, dataScope: "TEST" as const };
}

async function loadScenario(testId: string) {
  const test = await unscopedPrisma.test.findUnique({ where: { id: testId } });
  if (!test) throw new Error("Test run not found.");
  return { test, records: parseTestCreatedRecords(test.createdRecords) };
}

async function assertRecordsAreOnlyTestScoped(records: TestCreatedRecords) {
  const checks = await Promise.all([
    unscopedPrisma.account.count({ where: { id: { in: records.accounts }, dataScope: { not: "TEST" } } }),
    unscopedPrisma.applicantProfile.count({ where: { id: { in: records.applicantProfiles }, dataScope: { not: "TEST" } } }),
    unscopedPrisma.juryApplication.count({ where: { id: { in: records.juryApplications }, dataScope: { not: "TEST" } } }),
    unscopedPrisma.juryProfile.count({ where: { id: { in: records.juryProfiles }, dataScope: { not: "TEST" } } }),
    unscopedPrisma.nomination.count({ where: { id: { in: records.nominations }, dataScope: { not: "TEST" } } }),
    unscopedPrisma.juryNominationReview.count({ where: { id: { in: records.reviews }, dataScope: { not: "TEST" } } }),
    unscopedPrisma.ticket.count({ where: { id: { in: records.tickets }, dataScope: { not: "TEST" } } }),
    unscopedPrisma.payment.count({ where: { id: { in: records.payments }, dataScope: { not: "TEST" } } }),
  ]);
  if (checks.some(Boolean)) {
    throw new Error("Cleanup refused: a Test record points at non-TEST business data.");
  }
}

async function scenarioCounts(testId: string): Promise<DeletionSummary> {
  const { test, records } = await loadScenario(testId);
  await assertRecordsAreOnlyTestScoped(records);
  const [accounts, applicantProfiles, juryApplications, juryProfiles, nominations, reviews, tickets, payments, webhooks, nominationRows, juryRows] =
    await Promise.all([
      unscopedPrisma.account.count({ where: idWhere(records.accounts) }),
      unscopedPrisma.applicantProfile.count({ where: idWhere(records.applicantProfiles) }),
      unscopedPrisma.juryApplication.count({ where: idWhere(records.juryApplications) }),
      unscopedPrisma.juryProfile.count({ where: idWhere(records.juryProfiles) }),
      unscopedPrisma.nomination.count({ where: idWhere(records.nominations) }),
      unscopedPrisma.juryNominationReview.count({ where: idWhere(records.reviews) }),
      unscopedPrisma.ticket.count({ where: idWhere(records.tickets) }),
      unscopedPrisma.payment.count({ where: idWhere(records.payments) }),
      unscopedPrisma.stripeWebhook.count({ where: { id: { in: records.webhookEvents } } }),
      unscopedPrisma.nomination.findMany({ where: idWhere(records.nominations), select: { files: true } }),
      unscopedPrisma.juryApplication.findMany({ where: idWhere(records.juryApplications), select: { files: true } }),
    ]);
  const uploads = [...nominationRows, ...juryRows].reduce(
    (total, row) => total + parseStoredFiles(row.files).items.length,
    0,
  );
  const qrCredentials = (await unscopedPrisma.ticket.findMany({
    where: idWhere(records.tickets),
    select: { credential: true },
  })).reduce((total, ticket) => {
    const value = ticket.credential as { history?: unknown[] };
    return total + (Array.isArray(value?.history) ? value.history.length : 0);
  }, 0);
  const emails = parseTestEmailDeliveries(test.emailDeliveries).deliveries.length;
  const summary = {
    ...emptySummary(),
    accounts,
    applicantProfiles,
    juryApplications,
    juryProfiles,
    nominations,
    reviews,
    tickets,
    qrCredentials,
    uploads,
    payments,
    emails,
    other: webhooks,
  };
  summary.total =
    accounts + applicantProfiles + juryApplications + juryProfiles + nominations + reviews +
    tickets + qrCredentials + uploads + payments + emails + webhooks;
  return summary;
}

export function getScenarioDeletionPreview(testId: string) {
  return scenarioCounts(testId);
}

async function activeBlobReferences(excludedNominationIds: string[], excludedJuryIds: string[]) {
  const [nominations, juryApplications] = await Promise.all([
    unscopedPrisma.nomination.findMany({
      where: { id: { notIn: excludedNominationIds }, status: { not: "ARCHIVED" } },
      select: { files: true },
    }),
    unscopedPrisma.juryApplication.findMany({
      where: { id: { notIn: excludedJuryIds } },
      select: { files: true },
    }),
  ]);
  return new Set(
    [...nominations, ...juryApplications]
      .flatMap((row) => parseStoredFiles(row.files).items)
      .flatMap((file) => (file.blobKey ? [file.blobKey] : [])),
  );
}

async function deleteBlobs(keys: string[], activeReferences: Set<string>) {
  const errors: string[] = [];
  let deleted = 0;
  for (const key of [...new Set(keys)]) {
    if (!key.startsWith("applications/") && !key.startsWith("jury/")) {
      errors.push(`${key}: refused because the key is outside an approved test prefix`);
      continue;
    }
    if (activeReferences.has(key)) {
      errors.push(`${key}: refused because an active record still references it`);
      continue;
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      errors.push(`${key}: Blob credentials are not configured; database cleanup continued`);
      continue;
    }
    try {
      await del(key);
      deleted += 1;
    } catch (error) {
      errors.push(`${key}: ${error instanceof Error ? error.message : "unknown deletion error"}`);
    }
  }
  return { deleted, errors };
}

async function deleteRecordedRows(records: TestCreatedRecords) {
  await assertRecordsAreOnlyTestScoped(records);
  await unscopedPrisma.$transaction(async (tx) => {
    await tx.stripeWebhook.deleteMany({ where: { id: { in: records.webhookEvents } } });
    await tx.juryNominationReview.deleteMany({ where: idWhere(records.reviews) });
    await tx.ticket.deleteMany({ where: idWhere(records.tickets) });
    await tx.nomination.deleteMany({ where: idWhere(records.nominations) });
    await tx.payment.deleteMany({ where: idWhere(records.payments) });
    await tx.juryProfile.deleteMany({ where: idWhere(records.juryProfiles) });
    await tx.applicantProfile.deleteMany({ where: idWhere(records.applicantProfiles) });
    await tx.juryApplication.deleteMany({ where: idWhere(records.juryApplications) });
    await tx.account.deleteMany({ where: idWhere(records.accounts) });
  });
}

export async function deleteTestScenario(testId: string) {
  const { test, records } = await loadScenario(testId);
  if (test.status === "CLEANED") return scenarioCounts(testId);
  const summary = await scenarioCounts(testId);
  const active = await activeBlobReferences(records.nominations, records.juryApplications);
  await deleteRecordedRows(records);
  const blobs = await deleteBlobs(records.blobKeys, active);
  const result = { ...summary, blobsDeleted: blobs.deleted, blobErrors: blobs.errors };
  await unscopedPrisma.test.update({
    where: { id: testId },
    data: {
      status: "CLEANED",
      createdRecords: testJson(records),
    },
  });
  await appendTestAudit(testId, {
    action: "DELETE_TEST_RUN",
    targetType: "test",
    targetId: testId,
    summary: result,
  });
  return result;
}

function addSummaries(left: DeletionSummary, right: DeletionSummary) {
  const result = emptySummary();
  for (const key of ["accounts", "applicantProfiles", "juryProfiles", "juryApplications", "nominations", "reviews", "tickets", "qrCredentials", "uploads", "payments", "emails", "other", "blobsDeleted", "total"] as const) {
    result[key] = left[key] + right[key];
  }
  result.blobErrors = [...left.blobErrors, ...right.blobErrors];
  return result;
}

export async function deleteAllTestData() {
  const tests = await unscopedPrisma.test.findMany({
    where: { status: { not: "CLEANED" } },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  let total = emptySummary();
  for (const test of tests) total = addSummaries(total, await deleteTestScenario(test.id));
  return total;
}

const entityRecordKey: Record<Exclude<TestEntityType, "email">, TestRecordKey> = {
  account: "accounts",
  nomination: "nominations",
  review: "reviews",
  ticket: "tickets",
};

export async function deleteOneTestEntity(type: TestEntityType, id: string) {
  if (type === "email") {
    const tests = await unscopedPrisma.test.findMany({ orderBy: { createdAt: "desc" } });
    const owner = tests.find((test) =>
      parseTestEmailDeliveries(test.emailDeliveries).deliveries.some((delivery) => delivery.id === id),
    );
    if (!owner) throw new Error("Test email delivery not found.");
    const deliveries = parseTestEmailDeliveries(owner.emailDeliveries);
    deliveries.deliveries = deliveries.deliveries.filter((delivery) => delivery.id !== id);
    await unscopedPrisma.test.update({
      where: { id: owner.id },
      data: { emailDeliveries: testJson(deliveries) },
    });
    await appendTestAudit(owner.id, { action: "DELETE_ENTITY", targetType: type, targetId: id });
    return { type, id, blobsDeleted: 0, blobErrors: [] as string[] };
  }

  const key = entityRecordKey[type];
  const owner = await findTestOwningRecord(key, id);
  if (!owner) throw new Error("The entity is not registered to an active Test run.");
  const records = parseTestCreatedRecords(owner.createdRecords);
  const scoped = { id, dataScope: "TEST" as const };
  if (type === "review") await unscopedPrisma.juryNominationReview.delete({ where: scoped });
  if (type === "ticket") await unscopedPrisma.ticket.delete({ where: scoped });
  if (type === "nomination") await unscopedPrisma.nomination.delete({ where: scoped });
  if (type === "account") {
    const account = await unscopedPrisma.account.findUnique({
      where: scoped,
      include: {
        applicantProfile: { include: { nominations: { select: { id: true, paymentId: true } }, tickets: { select: { id: true, paymentId: true } } } },
        juryProfile: { include: { reviews: { select: { id: true } } } },
        juryApplication: { include: { payments: { select: { id: true } } } },
        payments: { select: { id: true } },
        tickets: { select: { id: true, paymentId: true } },
      },
    });
    if (!account) throw new Error("Test account not found.");
    const nominationIds = account.applicantProfile?.nominations.map((item) => item.id) ?? [];
    const ticketIds = [
      ...(account.applicantProfile?.tickets.map((item) => item.id) ?? []),
      ...account.tickets.map((item) => item.id),
    ];
    const paymentIds = [...new Set([
      ...account.payments.map((item) => item.id),
      ...(account.juryApplication?.payments.map((item) => item.id) ?? []),
      ...(account.applicantProfile?.nominations.map((item) => item.paymentId) ?? []),
      ...(account.applicantProfile?.tickets.flatMap((item) => item.paymentId ? [item.paymentId] : []) ?? []),
      ...account.tickets.flatMap((item) => item.paymentId ? [item.paymentId] : []),
    ])];
    const reviewIds = account.juryProfile?.reviews.map((item) => item.id) ?? [];
    await unscopedPrisma.$transaction(async (tx) => {
      await tx.juryNominationReview.deleteMany({ where: idWhere(reviewIds) });
      await tx.ticket.deleteMany({ where: idWhere(ticketIds) });
      await tx.nomination.deleteMany({ where: idWhere(nominationIds) });
      await tx.payment.deleteMany({ where: idWhere(paymentIds) });
      if (account.juryProfile) await tx.juryProfile.delete({ where: { id: account.juryProfile.id, dataScope: "TEST" } });
      if (account.applicantProfile) await tx.applicantProfile.delete({ where: { id: account.applicantProfile.id, dataScope: "TEST" } });
      if (account.juryApplication) await tx.juryApplication.delete({ where: { id: account.juryApplication.id, dataScope: "TEST" } });
      await tx.account.delete({ where: scoped });
    });
    const removed: Partial<Record<TestRecordKey, string[]>> = {
      accounts: [id],
      nominations: nominationIds,
      tickets: ticketIds,
      payments: paymentIds,
      reviews: reviewIds,
      applicantProfiles: account.applicantProfile ? [account.applicantProfile.id] : [],
      juryProfiles: account.juryProfile ? [account.juryProfile.id] : [],
      juryApplications: account.juryApplication ? [account.juryApplication.id] : [],
    };
    for (const [recordKey, ids] of Object.entries(removed) as Array<[TestRecordKey, string[]]>) {
      records[recordKey] = records[recordKey].filter((recordId) => !ids.includes(recordId));
    }
  } else {
    records[key] = records[key].filter((recordId) => recordId !== id);
  }
  await unscopedPrisma.test.update({ where: { id: owner.id }, data: { createdRecords: testJson(records) } });
  await appendTestAudit(owner.id, { action: "DELETE_ENTITY", targetType: type, targetId: id });
  return { type, id, blobsDeleted: 0, blobErrors: [] as string[] };
}
