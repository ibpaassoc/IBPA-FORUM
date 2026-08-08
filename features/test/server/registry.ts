import "server-only";

import { parseStoredFiles, parseTicketActivity, parseTicketCredential } from "@/features/database/json-fields";
import { prisma, unscopedPrisma } from "@/shared/lib/prisma";
import { runWithDataScope } from "@/features/test/server/data-scope";
import { getScenarioDeletionPreview } from "@/features/test/server/cleanup";
import {
  parseTestAuditEvents,
  parseTestCreatedRecords,
  parseTestEmailDeliveries,
  type TestRecordKey,
} from "@/features/test/server/test-records";

export async function getTestCreationRegistry() {
  const tests = await unscopedPrisma.test.findMany({ orderBy: { createdAt: "desc" } });
  const ownerMaps = new Map<TestRecordKey, Map<string, string>>();
  for (const test of tests) {
    const records = parseTestCreatedRecords(test.createdRecords);
    for (const key of Object.keys(records).filter((key) => key !== "schemaVersion") as TestRecordKey[]) {
      const map = ownerMaps.get(key) ?? new Map<string, string>();
      for (const id of records[key]) map.set(id, test.id);
      ownerMaps.set(key, map);
    }
  }
  const testId = (key: TestRecordKey, id: string) => ownerMaps.get(key)?.get(id) ?? null;

  const records = await runWithDataScope({ dataScope: "TEST" }, async () => {
    const [accounts, profiles, juryApplications, nominations, reviews, tickets, payments] = await Promise.all([
      prisma.account.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          applicantProfile: { select: { id: true, fullName: true, _count: { select: { nominations: true } } } },
          juryProfile: { select: { id: true, fullName: true, _count: { select: { reviews: true } } } },
        },
      }),
      prisma.applicantProfile.findMany({
        orderBy: { createdAt: "desc" },
        include: { account: { select: { email: true, _count: { select: { payments: true } } } }, _count: { select: { nominations: true, tickets: true } } },
      }),
      prisma.juryApplication.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { payments: true } } },
      }),
      prisma.nomination.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          applicantProfile: { select: { fullName: true } },
          category: { select: { name: true } },
          award: { select: { name: true } },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.juryNominationReview.findMany({
        orderBy: { createdAt: "desc" },
        include: { juryProfile: { select: { fullName: true } }, nomination: { include: { award: { select: { name: true } } } } },
      }),
      prisma.ticket.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.payment.findMany({ orderBy: { createdAt: "desc" } }),
    ]);
    return {
      accounts: accounts.map((item) => ({ ...item, testId: testId("accounts", item.id) })),
      profiles: profiles.map((item) => ({
        ...item,
        testId: testId("applicantProfiles", item.id),
        _count: { ...item._count, payments: item.account._count.payments },
      })),
      juryApplications: juryApplications.map((item) => ({
        ...item,
        testId: testId("juryApplications", item.id),
        _count: { ...item._count, files: parseStoredFiles(item.files).items.length },
      })),
      nominations: nominations.map((item) => ({
        ...item,
        testId: testId("nominations", item.id),
        _count: {
          ...item._count,
          answers: (item.answers as { fields?: unknown[] }).fields?.length ?? 0,
          files: parseStoredFiles(item.files).items.length,
        },
      })),
      reviews: reviews.map((item) => ({ ...item, testId: testId("reviews", item.id) })),
      tickets: tickets.map((item) => ({
        ...item,
        testId: testId("tickets", item.id),
        _count: {
          payments: item.paymentId ? 1 : 0,
          qrCredentials: parseTicketCredential(item.credential).history.length,
          activities: parseTicketActivity(item.activity).events.length,
        },
      })),
      qrCredentials: tickets.flatMap((ticket) =>
        parseTicketCredential(ticket.credential).history.map((credential) => ({
          ...credential,
          generatedAt: new Date(credential.generatedAt),
          ticket: { fullName: ticket.fullName },
          testId: testId("tickets", ticket.id),
        })),
      ),
      uploads: [
        ...nominations.flatMap((nomination) =>
          parseStoredFiles(nomination.files).items.map((file) => ({
            id: file.id,
            fileName: file.filename,
            mimeType: file.mimeType,
            fileSize: file.size,
            owner: nomination.applicantProfile.fullName,
            uploadType: "nomination" as const,
            testId: testId("nominations", nomination.id),
          })),
        ),
        ...juryApplications.flatMap((application) =>
          parseStoredFiles(application.files).items.map((file) => ({
            id: file.id,
            fileName: file.filename,
            mimeType: file.mimeType,
            fileSize: file.size,
            owner: application.fullName,
            uploadType: "jury" as const,
            testId: testId("juryApplications", application.id),
          })),
        ),
      ],
      payments: payments.map((item) => ({
        ...item,
        source: item.purchaseType,
        stripeSessionId: item.stripeCheckoutSessionId,
        testId: testId("payments", item.id),
      })),
    };
  });

  const emails = tests.flatMap((test) =>
    parseTestEmailDeliveries(test.emailDeliveries).deliveries.map((item) => ({
      ...item,
      testId: test.id,
      createdAt: new Date(item.createdAt),
    })),
  ).sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  const audits = tests.flatMap((test) =>
    parseTestAuditEvents(test.auditEvents).events.map((item) => ({
      ...item,
      testId: test.id,
      createdAt: new Date(item.createdAt),
    })),
  ).sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime()).slice(0, 25);
  const activeTests = tests.filter((test) => test.status !== "CLEANED");
  const scenarioPreviews = await Promise.all(
    activeTests.map(async (scenario) => ({ scenario, preview: await getScenarioDeletionPreview(scenario.id) })),
  );
  return { ...records, emails, scenarios: scenarioPreviews, audits };
}
