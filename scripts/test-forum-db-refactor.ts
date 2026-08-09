import "dotenv/config";

import assert from "node:assert/strict";
import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { nominationAnswersSchema, nominationFileViewRows, storedFilesSchema, ticketActivitySchema, ticketCredentialSchema, regulationsSettingSchema, promoCodesSettingSchema } from "@/features/database/json-fields";
import { assertNominationStatusTransition, canTransitionNominationStatus, editableNominationStatus } from "@/features/database/nomination-status";
import { emptyTestAuditEvents, emptyTestCreatedRecords, emptyTestEmailDeliveries, testCreatedRecordsSchema } from "@/features/test/lib/test-records";
import { normalizeSslMode } from "@/shared/lib/db-url";

const TARGET_TABLES = ["Account", "ApplicantProfile", "JuryApplication", "JuryProfile", "JuryNominationReview", "Nomination", "Award", "Category", "Ticket", "Payment", "StripeWebhook", "SiteSetting", "Test"].sort();
const PROTECTED_BRANCHES = new Set(["br-ancient-night-aknk0wql", "br-nameless-block-akc62q54"]);
const PROTECTED_EMAILS = ["annakrainik86@gmail.com", "elenamutalieva@gmail.com", "farangizkarimava15@gmail.com", "9868851@gmail.com"];
const json = (value: unknown) => value as Prisma.InputJsonValue;

function staticChecks() {
  const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");
  const models = [...schema.matchAll(/^model\s+(\w+)\s+\{/gm)].map((match) => match[1]).sort();
  assert.deepEqual(models, TARGET_TABLES, "the Prisma schema contains only the approved 13 business models");
  nominationAnswersSchema.parse({ schemaVersion: 1, fields: [{ fieldId: "bio", label: "Bio", type: "text", value: "ok", updatedAt: new Date().toISOString() }] });
  storedFilesSchema.parse({ schemaVersion: 1, items: [{ id: "file-1", fieldId: "portfolio", blobKey: "applications/test/file", url: null, filename: "file.pdf", mimeType: "application/pdf", size: 1, uploadedAt: new Date().toISOString() }] });
  assert.equal(
    nominationFileViewRows({ schemaVersion: 1, items: [{ id: "file-1", fieldId: "portfolio", blobKey: "applications/test/file", url: null, filename: "file.pdf", mimeType: "application/pdf", size: 1, uploadedAt: new Date().toISOString() }] })[0]?.fileUrl,
    "applications/test/file",
  );
  ticketCredentialSchema.parse({ schemaVersion: 1, active: null, history: [] });
  ticketActivitySchema.parse({ schemaVersion: 1, events: [] });
  testCreatedRecordsSchema.parse(emptyTestCreatedRecords());
  assert.equal(canTransitionNominationStatus("DRAFT", "SUBMITTED"), true);
  assert.equal(canTransitionNominationStatus("LOCKED", "DRAFT"), false);
  assert.equal(editableNominationStatus("SUBMITTED"), true);
  assert.equal(editableNominationStatus("UNDER_REVIEW"), false);
  assert.throws(() => assertNominationStatusTransition("ARCHIVED", "DRAFT"));
  const migration = readFileSync(join(process.cwd(), "prisma/migrations/20260807120000_forum_database_refactor/migration.sql"), "utf8");
  assert.doesNotMatch(migration, /DROP TABLE/);
  assert.match(migration, /StripeWebhook_eventId_key/);
  assert.match(migration, /Ticket_secureToken_key/);
  assert.match(migration, /JuryNominationReview_nominationId_juryProfileId_key/);
  console.log("Static target-schema, JSONB, transition, and safety checks passed.");
}

function expectedBranchId() {
  const index = process.argv.indexOf("--expected-branch");
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function integrationChecks() {
  const expected = expectedBranchId();
  if (!expected) throw new Error("Integration mode requires --expected-branch <Neon branch id>.");
  if (process.env.DATABASE_SCHEMA !== "forum_next") throw new Error("Integration mode requires DATABASE_SCHEMA=forum_next.");
  const pool = new Pool({ connectionString: normalizeSslMode(process.env.DATABASE_URL) });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool, { schema: "forum_next" }) });
  const ids = emptyTestCreatedRecords();
  let testId: string | null = null;
  try {
    const identity = await prisma.$queryRaw<Array<{ branchId: string | null }>>`SELECT current_setting('neon.branch_id', true) AS "branchId"`;
    const actual = identity[0]?.branchId;
    if (actual !== expected || !actual || PROTECTED_BRANCHES.has(actual)) throw new Error(`Refusing integration writes on Neon branch ${actual ?? "unknown"}.`);
    const tables = await prisma.$queryRaw<Array<{ name: string }>>`SELECT table_name AS name FROM information_schema.tables WHERE table_schema='forum_next' AND table_type='BASE TABLE' ORDER BY table_name`;
    assert.deepEqual(tables.map((row) => row.name).sort(), TARGET_TABLES);

    const protectedReport = await prisma.$queryRaw<Array<{ normalizedEmail: string; sourceCount: number; targetCount: number; sourceHashes: string[]; targetHashes: string[] }>>(Prisma.sql`
      WITH requested(email) AS (SELECT unnest(${PROTECTED_EMAILS}::text[]))
      SELECT requested.email AS "normalizedEmail",
        (SELECT count(*)::int FROM public."Account" a WHERE lower(trim(a.email))=requested.email AND a.role::text='APPLICANT') AS "sourceCount",
        (SELECT count(*)::int FROM forum_next."Account" a WHERE a."normalizedEmail"=requested.email AND a.role::text='APPLICANT') AS "targetCount",
        COALESCE((SELECT array_agg(encode(sha256(convert_to(a."passwordHash", 'UTF8')), 'hex')) FROM public."Account" a WHERE lower(trim(a.email))=requested.email AND a.role::text='APPLICANT' AND a."passwordHash" IS NOT NULL), ARRAY[]::text[]) AS "sourceHashes",
        COALESCE((SELECT array_agg(encode(sha256(convert_to(a."passwordHash", 'UTF8')), 'hex')) FROM forum_next."Account" a WHERE a."normalizedEmail"=requested.email AND a.role::text='APPLICANT' AND a."passwordHash" IS NOT NULL), ARRAY[]::text[]) AS "targetHashes"
      FROM requested ORDER BY requested.email
    `);
    for (const row of protectedReport) {
      assert.equal(row.sourceCount, 1);
      assert.equal(row.targetCount, 1);
      assert.deepEqual(row.targetHashes, row.sourceHashes, `${row.normalizedEmail} password hash changed`);
    }

    const catalog = await prisma.award.findFirst({ include: { category: true } });
    assert.ok(catalog);
    const now = new Date();
    const test = await prisma.test.create({ data: { name: "Forum refactor integration", kind: "automated-integration", configuration: json({ schemaVersion: 1 }), createdRecords: json(ids), auditEvents: json(emptyTestAuditEvents()), emailDeliveries: json(emptyTestEmailDeliveries()) } });
    testId = test.id;
    const suffix = crypto.randomUUID();
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const account = await prisma.account.create({ data: { email: `refactor-${suffix}@example.invalid`, normalizedEmail: `refactor-${suffix}@example.invalid`, role: "APPLICANT", status: "INVITED", setupTokenHash: tokenHash, setupTokenPurpose: "SETUP", setupTokenIssuedAt: now, setupTokenExpiresAt: new Date(now.getTime() + 60_000), dataScope: "TEST" } });
    ids.accounts.push(account.id);
    assert.notEqual(account.setupTokenHash, token);
    assert.equal(account.passwordHash, null);
    const profile = await prisma.applicantProfile.create({ data: { accountId: account.id, fullName: "Refactor Integration Applicant", dataScope: "TEST" } });
    ids.applicantProfiles.push(profile.id);
    const payment = await prisma.payment.create({ data: { accountId: account.id, customerEmail: account.email, amount: 0, status: "PAID", purchaseType: "NOMINATION", provider: "MANUAL", paidAt: now, fulfilledAt: now, dataScope: "TEST" } });
    ids.payments.push(payment.id);
    const answers = { schemaVersion: 1 as const, fields: [{ fieldId: "bio", label: "Bio", type: "text", value: "integration", updatedAt: now.toISOString() }] };
    const files = { schemaVersion: 1 as const, items: [{ id: crypto.randomUUID(), fieldId: "portfolio", blobKey: "applications/integration/file.pdf", url: null, filename: "file.pdf", mimeType: "application/pdf", size: 1, uploadedAt: now.toISOString() }] };
    const nomination = await prisma.nomination.create({ data: { applicantProfileId: profile.id, paymentId: payment.id, awardId: catalog.id, categoryId: catalog.categoryId, status: "DRAFT", answers: json(answers), files: json(files), scoringSchema: json({ version: 1, categorySlug: catalog.category.slug, categoryName: catalog.category.name, sourceDocument: "integration", maximumTotal: 0, criteria: [] }), dataScope: "TEST" } });
    ids.nominations.push(nomination.id);

    const juryAccount = await prisma.account.create({ data: { email: `jury-${suffix}@example.invalid`, normalizedEmail: `jury-${suffix}@example.invalid`, role: "JURY", status: "ACTIVE", dataScope: "TEST" } });
    ids.accounts.push(juryAccount.id);
    const juryApplication = await prisma.juryApplication.create({ data: { accountId: juryAccount.id, fullName: "Integration Jury", email: juryAccount.email, phone: "test", country: "test", city: "test", professionalTitle: "test", yearsExperience: 1, employerAffiliation: "test", previousJudgingExperience: false, expertiseAreas: [catalog.category.name], professionalBio: "test", conflictDisclosure: "none", motivation: "test", status: "PAID", informationRequests: json({ schemaVersion: 1, requests: [] }), files: json({ schemaVersion: 1, items: [] }), submittedAt: now, approvedAt: now, dataScope: "TEST" } });
    ids.juryApplications.push(juryApplication.id);
    const juryProfile = await prisma.juryProfile.create({ data: { accountId: juryAccount.id, juryApplicationId: juryApplication.id, fullName: juryApplication.fullName, expertiseAreas: [catalog.category.name], approvedCategories: [catalog.category.name], dataScope: "TEST" } });
    ids.juryProfiles.push(juryProfile.id);
    const juryPayment = await prisma.payment.create({ data: { accountId: juryAccount.id, juryApplicationId: juryApplication.id, customerEmail: juryAccount.email, amount: 0, status: "PAID", purchaseType: "JURY", provider: "MANUAL", paidAt: now, fulfilledAt: now, dataScope: "TEST" } });
    ids.payments.push(juryPayment.id);
    const review = await prisma.juryNominationReview.create({ data: { nominationId: nomination.id, juryProfileId: juryProfile.id, status: "COMPLETED", scoreData: json({ version: 1, scores: {} }), totalScore: 0, comments: "integration", startedAt: now, submittedAt: now, dataScope: "TEST" } });
    ids.reviews.push(review.id);
    await assert.rejects(() => prisma.juryNominationReview.create({ data: { nominationId: nomination.id, juryProfileId: juryProfile.id, dataScope: "TEST" } }));

    const ticketToken = crypto.randomBytes(32).toString("hex");
    const ticketPayment = await prisma.payment.create({ data: { accountId: account.id, customerEmail: account.email, amount: 0, status: "PAID", purchaseType: "TICKET", provider: "MANUAL", paidAt: now, fulfilledAt: now, dataScope: "TEST" } });
    ids.payments.push(ticketPayment.id);
    const ticket = await prisma.ticket.create({ data: { accountId: account.id, paymentId: ticketPayment.id, kind: "FORUM", secureToken: ticketToken, credential: json({ schemaVersion: 1, active: { token: ticketToken, status: "ACTIVE", generatedAt: now.toISOString(), lastSentAt: null }, history: [{ id: crypto.randomUUID(), token: ticketToken, status: "ACTIVE", generatedAt: now.toISOString(), lastSentAt: null }] }), activity: json({ schemaVersion: 1, events: [] }), fullName: profile.fullName, email: account.email, phone: "test", type: "TWO_DAYS", status: "PAID", paidAt: now, dataScope: "TEST" } });
    ids.tickets.push(ticket.id);
    assert.equal((await prisma.ticket.findUnique({ where: { secureToken: ticketToken } }))?.id, ticket.id);

    const eventId = `evt_integration_${suffix}`;
    const webhook = await prisma.stripeWebhook.create({ data: { eventId, eventType: "integration.test", payload: json({ id: eventId }), state: "PROCESSED", attempts: 1, paymentId: ticketPayment.id, lastAttemptAt: now, processedAt: now } });
    ids.webhookEvents.push(webhook.id);
    await assert.rejects(() => prisma.stripeWebhook.create({ data: { eventId, eventType: "integration.duplicate", payload: json({ id: eventId }) } }));

    const [regulations, promos] = await Promise.all([prisma.siteSetting.findUnique({ where: { key: "regulations" } }), prisma.siteSetting.findUnique({ where: { key: "promocodes" } })]);
    assert.ok(regulations && regulationsSettingSchema.safeParse(regulations.value).success);
    assert.ok(promos && promoCodesSettingSchema.safeParse(promos.value).success);

    await prisma.test.update({ where: { id: test.id }, data: { status: "COMPLETED", createdRecords: json(ids) } });
    assert.equal((await prisma.nomination.findUnique({ where: { id: nomination.id } }))?.paymentId, payment.id);
    assert.deepEqual(nominationAnswersSchema.parse(nomination.answers), answers);
    assert.deepEqual(storedFilesSchema.parse(nomination.files), files);
    console.log(`Clone integration checks passed on ${actual}; cleanup will now remove Test ${test.id}.`);
  } finally {
    if (testId) {
      const completedTestId = testId;
      await prisma.$transaction(async (tx) => {
        await tx.stripeWebhook.deleteMany({ where: { id: { in: ids.webhookEvents } } });
        await tx.juryNominationReview.deleteMany({ where: { id: { in: ids.reviews }, dataScope: "TEST" } });
        await tx.ticket.deleteMany({ where: { id: { in: ids.tickets }, dataScope: "TEST" } });
        await tx.nomination.deleteMany({ where: { id: { in: ids.nominations }, dataScope: "TEST" } });
        await tx.payment.deleteMany({ where: { id: { in: ids.payments }, dataScope: "TEST" } });
        await tx.juryProfile.deleteMany({ where: { id: { in: ids.juryProfiles }, dataScope: "TEST" } });
        await tx.applicantProfile.deleteMany({ where: { id: { in: ids.applicantProfiles }, dataScope: "TEST" } });
        await tx.juryApplication.deleteMany({ where: { id: { in: ids.juryApplications }, dataScope: "TEST" } });
        await tx.account.deleteMany({ where: { id: { in: ids.accounts }, dataScope: "TEST" } });
        await tx.test.update({ where: { id: completedTestId }, data: { status: "CLEANED", createdRecords: json(ids) } });
      });
    }
    await prisma.$disconnect();
    await pool.end();
  }
}

async function main() {
  staticChecks();
  if (process.argv.includes("--integration")) await integrationChecks();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
