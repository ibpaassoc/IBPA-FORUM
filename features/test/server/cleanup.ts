import "server-only";

import { del } from "@vercel/blob";
import { unscopedPrisma } from "@/shared/lib/prisma";

export type TestEntityType = "account" | "nomination" | "review" | "ticket" | "email";

const scopedDelegates = [
  "account",
  "applicantProfile",
  "applicantCheckInCredential",
  "juryProfile",
  "accountSetupToken",
  "juryApplication",
  "juryApplicationFile",
  "payment",
  "stripeWebhookEvent",
  "nominationApplication",
  "juryNominationReview",
  "nominationAnswer",
  "nominationFile",
  "ticket",
  "ticketQrCredential",
  "ticketActivity",
  "emailDeliveryLog",
] as const;

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
  return { accounts: 0, applicantProfiles: 0, juryProfiles: 0, juryApplications: 0, nominations: 0, reviews: 0, tickets: 0, qrCredentials: 0, uploads: 0, payments: 0, emails: 0, other: 0, blobsDeleted: 0, blobErrors: [], total: 0 };
}

async function assertScenarioContainsNoProductionData(scenarioId: string) {
  const productionCounts = await Promise.all(
    scopedDelegates.map((delegate) =>
      // The delegate list is fixed above and every model has these two columns.
      (unscopedPrisma[delegate] as { count(args: unknown): Promise<number> }).count({
        where: { testScenarioId: scenarioId, dataScope: "PRODUCTION" },
      }),
    ),
  );
  if (productionCounts.some((count) => count > 0)) {
    throw new Error("Cleanup refused: the scenario references production-scoped data.");
  }
}

async function testBlobKeys(where: { testScenarioId?: string; dataScope?: "TEST" }) {
  const [nominationFiles, juryFiles] = await Promise.all([
    unscopedPrisma.nominationFile.findMany({
      where: { ...where, dataScope: "TEST" },
      select: { storageKey: true },
    }),
    unscopedPrisma.juryApplicationFile.findMany({
      where: { ...where, dataScope: "TEST" },
      select: { storageKey: true },
    }),
  ]);
  return [...nominationFiles, ...juryFiles]
    .map((file) => file.storageKey)
    .filter((key): key is string => Boolean(key && (key.startsWith("applications/") || key.startsWith("jury/"))));
}

async function deleteBlobs(keys: string[]) {
  if (!keys.length || !process.env.BLOB_READ_WRITE_TOKEN) return { deleted: 0, errors: [] as string[] };
  try {
    await del(keys);
    return { deleted: keys.length, errors: [] as string[] };
  } catch (error) {
    return { deleted: 0, errors: [error instanceof Error ? error.message : "Unknown Blob deletion error"] };
  }
}

async function scopedCounts(where: { testScenarioId?: string; dataScope: "TEST" }): Promise<DeletionSummary> {
  const [accounts, applicantProfiles, juryProfiles, juryApplications, nominations, reviews, tickets, qrCredentials, nominationFiles, juryFiles, payments, emails, setupTokens, credentials, activities, webhooks] = await Promise.all([
    unscopedPrisma.account.count({ where }),
    unscopedPrisma.applicantProfile.count({ where }),
    unscopedPrisma.juryProfile.count({ where }),
    unscopedPrisma.juryApplication.count({ where }),
    unscopedPrisma.nominationApplication.count({ where }),
    unscopedPrisma.juryNominationReview.count({ where }),
    unscopedPrisma.ticket.count({ where }),
    unscopedPrisma.ticketQrCredential.count({ where }),
    unscopedPrisma.nominationFile.count({ where }),
    unscopedPrisma.juryApplicationFile.count({ where }),
    unscopedPrisma.payment.count({ where }),
    unscopedPrisma.emailDeliveryLog.count({ where }),
    unscopedPrisma.accountSetupToken.count({ where }),
    unscopedPrisma.applicantCheckInCredential.count({ where }),
    unscopedPrisma.ticketActivity.count({ where }),
    unscopedPrisma.stripeWebhookEvent.count({ where }),
  ]);
  const summary = { ...emptySummary(), accounts, applicantProfiles, juryProfiles, juryApplications, nominations, reviews, tickets, qrCredentials, uploads: nominationFiles + juryFiles, payments, emails, other: setupTokens + credentials + activities + webhooks };
  summary.total = accounts + applicantProfiles + juryProfiles + juryApplications + nominations + reviews + tickets + qrCredentials + summary.uploads + payments + emails + summary.other;
  return summary;
}

function scenarioCounts(scenarioId: string) {
  return scopedCounts({ testScenarioId: scenarioId, dataScope: "TEST" });
}

export async function getScenarioDeletionPreview(scenarioId: string) {
  await assertScenarioContainsNoProductionData(scenarioId);
  return scenarioCounts(scenarioId);
}

async function deleteByWhere(where: { testScenarioId?: string; dataScope: "TEST" }) {
  await unscopedPrisma.$transaction(async (tx) => {
    await tx.emailDeliveryLog.deleteMany({ where });
    await tx.ticketActivity.deleteMany({ where });
    await tx.ticketQrCredential.deleteMany({ where });
    await tx.juryNominationReview.deleteMany({ where });
    await tx.nominationAnswer.deleteMany({ where });
    await tx.nominationFile.deleteMany({ where });
    await tx.payment.deleteMany({ where });
    await tx.ticket.deleteMany({ where });
    await tx.nominationApplication.deleteMany({ where });
    await tx.applicantCheckInCredential.deleteMany({ where });
    await tx.accountSetupToken.deleteMany({ where });
    await tx.juryApplicationFile.deleteMany({ where });
    await tx.juryProfile.deleteMany({ where });
    await tx.applicantProfile.deleteMany({ where });
    await tx.juryApplication.deleteMany({ where });
    await tx.account.deleteMany({ where });
    await tx.stripeWebhookEvent.deleteMany({ where });
  });
}

export async function deleteTestScenario(scenarioId: string) {
  const scenario = await unscopedPrisma.testScenario.findUnique({ where: { id: scenarioId } });
  if (!scenario) throw new Error("Test scenario not found.");
  await assertScenarioContainsNoProductionData(scenario.id);
  const [summary, blobKeys] = await Promise.all([scenarioCounts(scenario.id), testBlobKeys({ testScenarioId: scenario.id })]);
  await deleteByWhere({ testScenarioId: scenario.id, dataScope: "TEST" });
  await unscopedPrisma.testScenario.delete({ where: { id: scenario.id } });
  const blobs = await deleteBlobs(blobKeys);
  const result = { ...summary, blobsDeleted: blobs.deleted, blobErrors: blobs.errors };
  await unscopedPrisma.testAuditLog.create({ data: { action: "DELETE_SCENARIO", targetType: "scenario", targetId: scenario.id, summary: JSON.parse(JSON.stringify(result)) } });
  return result;
}

export async function deleteAllTestData() {
  const productionWithScenario = await Promise.all(
    scopedDelegates.map((delegate) =>
      (unscopedPrisma[delegate] as { count(args: unknown): Promise<number> }).count({
        where: { dataScope: "PRODUCTION", testScenarioId: { not: null } },
      }),
    ),
  );
  if (productionWithScenario.some((count) => count > 0)) {
    throw new Error("Delete all refused: production data contains a test scenario reference.");
  }
  const summary = await scopedCounts({ dataScope: "TEST" });
  const blobKeys = await testBlobKeys({ dataScope: "TEST" });
  await deleteByWhere({ dataScope: "TEST" });
  await unscopedPrisma.testScenario.deleteMany();
  const blobs = await deleteBlobs(blobKeys);
  const result = { ...summary, blobsDeleted: blobs.deleted, blobErrors: blobs.errors };
  await unscopedPrisma.testAuditLog.create({ data: { action: "DELETE_ALL", targetType: "all_test_data", summary: JSON.parse(JSON.stringify(result)) } });
  return result;
}

export async function deleteOneTestEntity(type: TestEntityType, id: string) {
  const delegate = type === "account" ? unscopedPrisma.account : type === "nomination" ? unscopedPrisma.nominationApplication : type === "review" ? unscopedPrisma.juryNominationReview : type === "ticket" ? unscopedPrisma.ticket : unscopedPrisma.emailDeliveryLog;
  const record = await (delegate as { findUnique(args: unknown): Promise<{ dataScope: string } | null> }).findUnique({ where: { id }, select: { dataScope: true } });
  if (!record) throw new Error("Entity not found.");
  if (record.dataScope !== "TEST") throw new Error("Cleanup refused: production data cannot be deleted by the test system.");
  let blobKeys: string[] = [];
  if (type === "nomination") {
    const files = await unscopedPrisma.nominationFile.findMany({ where: { nominationApplicationId: id, dataScope: "TEST" }, select: { storageKey: true } });
    blobKeys = files.map((file) => file.storageKey).filter((key): key is string => Boolean(key && key.startsWith("applications/")));
  } else if (type === "account") {
    const account = await unscopedPrisma.account.findUnique({
      where: { id, dataScope: "TEST" },
      select: {
        applicantProfile: { select: { nominations: { select: { files: { where: { dataScope: "TEST" }, select: { storageKey: true } } } } } },
        juryProfile: { select: { juryApplication: { select: { files: { where: { dataScope: "TEST" }, select: { storageKey: true } } } } } },
      },
    });
    blobKeys = [
      ...(account?.applicantProfile?.nominations.flatMap((nomination) => nomination.files.map((file) => file.storageKey)) ?? []),
      ...(account?.juryProfile?.juryApplication?.files.map((file) => file.storageKey) ?? []),
    ].filter((key): key is string => Boolean(key && (key.startsWith("applications/") || key.startsWith("jury/"))));
  }
  if (type === "account") await unscopedPrisma.account.delete({ where: { id, dataScope: "TEST" } });
  else if (type === "nomination") await unscopedPrisma.nominationApplication.delete({ where: { id, dataScope: "TEST" } });
  else if (type === "review") await unscopedPrisma.juryNominationReview.delete({ where: { id, dataScope: "TEST" } });
  else if (type === "ticket") await unscopedPrisma.ticket.delete({ where: { id, dataScope: "TEST" } });
  else await unscopedPrisma.emailDeliveryLog.delete({ where: { id, dataScope: "TEST" } });
  const blobs = await deleteBlobs(blobKeys);
  const summary = { type, id, blobsDeleted: blobs.deleted, blobErrors: blobs.errors };
  await unscopedPrisma.testAuditLog.create({ data: { action: "DELETE_ENTITY", targetType: type, targetId: id, summary } });
  return summary;
}
