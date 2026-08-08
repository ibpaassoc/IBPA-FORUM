/** Creates one submitted TEST nomination per regulated category and one jury account. */
import "dotenv/config";

import crypto from "node:crypto";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { categoryCatalog } from "@/features/applications/config/category-catalog";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { getCategoryScoringDefinition } from "@/features/jury/scoring/category-scoring";
import { emptyStoredFiles, emptyJuryInformationRequests } from "@/features/database/json-fields";
import { emptyTestAuditEvents, emptyTestCreatedRecords, emptyTestEmailDeliveries, parseTestCreatedRecords } from "@/features/test/lib/test-records";
import { normalizeSslMode } from "@/shared/lib/db-url";

const pool = new Pool({ connectionString: normalizeSslMode(process.env.DATABASE_URL) });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool, process.env.DATABASE_SCHEMA ? { schema: process.env.DATABASE_SCHEMA } : undefined) });
const json = (value: unknown) => value as Prisma.InputJsonValue;

async function cleanupPrevious() {
  const previous = await prisma.test.findFirst({ where: { kind: "seed-scoring-samples", status: { not: "CLEANED" } }, orderBy: { createdAt: "desc" } });
  if (!previous) return;
  const records = parseTestCreatedRecords(previous.createdRecords);
  await prisma.$transaction(async (tx) => {
    await tx.juryNominationReview.deleteMany({ where: { id: { in: records.reviews }, dataScope: "TEST" } });
    await tx.nomination.deleteMany({ where: { id: { in: records.nominations }, dataScope: "TEST" } });
    await tx.payment.deleteMany({ where: { id: { in: records.payments }, dataScope: "TEST" } });
    await tx.juryProfile.deleteMany({ where: { id: { in: records.juryProfiles }, dataScope: "TEST" } });
    await tx.applicantProfile.deleteMany({ where: { id: { in: records.applicantProfiles }, dataScope: "TEST" } });
    await tx.juryApplication.deleteMany({ where: { id: { in: records.juryApplications }, dataScope: "TEST" } });
    await tx.account.deleteMany({ where: { id: { in: records.accounts }, dataScope: "TEST" } });
    await tx.test.update({ where: { id: previous.id }, data: { status: "CLEANED" } });
  });
}

function sampleAnswers(categorySlug: string) {
  const updatedAt = new Date().toISOString();
  return {
    schemaVersion: 1,
    fields: (categoryFieldConfigs[categorySlug] ?? [])
      .filter((field) => field.type !== "file" && !field.visibleWhen)
      .slice(0, 5)
      .map((field) => ({
        fieldId: field.key,
        label: field.label,
        type: field.type,
        value: field.type === "number" ? Math.max(field.min ?? 1, 12) : field.type === "checkbox-group" ? [field.options?.[0]?.value ?? "sample"] : field.type === "url" ? `https://example.com/ibpa/${categorySlug}` : `${field.label}: isolated scoring fixture`,
        updatedAt,
      })),
  };
}

async function seedCatalog() {
  const categories = [];
  for (const definition of categoryCatalog) {
    const category = await prisma.category.upsert({ where: { slug: definition.slug }, update: { name: definition.name }, create: { slug: definition.slug, name: definition.name } });
    const award = await prisma.award.upsert({ where: { categoryId_name: { categoryId: category.id, name: definition.awards[0] } }, update: {}, create: { categoryId: category.id, name: definition.awards[0] } });
    categories.push({ ...category, award });
  }
  return categories;
}

async function main() {
  await cleanupPrevious();
  const categories = await seedCatalog();
  const test = await prisma.test.create({
    data: {
      name: "Regulation scoring samples",
      kind: "seed-scoring-samples",
      configuration: json({ schemaVersion: 1, categoryCount: categories.length }),
      createdRecords: json(emptyTestCreatedRecords()),
      auditEvents: json(emptyTestAuditEvents()),
      emailDeliveries: json(emptyTestEmailDeliveries()),
    },
  });
  const records = emptyTestCreatedRecords();
  await prisma.$transaction(async (tx) => {
    const now = new Date();
    const applicantEmail = `scoring-applicant-${test.id}@example.invalid`;
    const applicantAccount = await tx.account.create({ data: { email: applicantEmail, normalizedEmail: applicantEmail, role: "APPLICANT", status: "ACTIVE", dataScope: "TEST" } });
    const applicant = await tx.applicantProfile.create({ data: { accountId: applicantAccount.id, fullName: "Regulation Scoring Samples", professionalTitle: "Cross-category test nominee", country: "United States", city: "Los Angeles", yearsExperience: 12, dataScope: "TEST" } });
    records.accounts.push(applicantAccount.id);
    records.applicantProfiles.push(applicant.id);
    for (const category of categories) {
      const payment = await tx.payment.create({ data: { accountId: applicantAccount.id, customerEmail: applicantEmail, amount: 0, status: "PAID", purchaseType: "NOMINATION", provider: "MANUAL", paidAt: now, fulfilledAt: now, dataScope: "TEST" } });
      const nomination = await tx.nomination.create({ data: { applicantProfileId: applicant.id, paymentId: payment.id, categoryId: category.id, awardId: category.award.id, status: "SUBMITTED", answers: json(sampleAnswers(category.slug)), files: json(emptyStoredFiles()), scoringSchema: json(getCategoryScoringDefinition(category.slug)), submittedAt: now, dataScope: "TEST" } });
      records.payments.push(payment.id);
      records.nominations.push(nomination.id);
    }
    const juryEmail = `scoring-jury-${test.id}@example.invalid`;
    const juryAccount = await tx.account.create({ data: { email: juryEmail, normalizedEmail: juryEmail, role: "JURY", status: "ACTIVE", dataScope: "TEST" } });
    const expertiseAreas = categories.map((category) => category.name);
    const application = await tx.juryApplication.create({ data: { accountId: juryAccount.id, fullName: "Regulation Scoring Reviewer", email: juryEmail, phone: "+1 555 0100", country: "United States", city: "Los Angeles", professionalTitle: "IBPA Scoring QA Judge", yearsExperience: 15, employerAffiliation: "IBPA QA", previousJudgingExperience: true, previousJudgingDetails: "Internal scoring workflow verification.", expertiseAreas, professionalBio: "Test reviewer for category-specific scorecards.", conflictDisclosure: "Test data only.", motivation: "Verify every scorecard.", status: "PAID", informationRequests: json(emptyJuryInformationRequests()), files: json(emptyStoredFiles()), submittedAt: now, approvedAt: now, dataScope: "TEST" } });
    const profile = await tx.juryProfile.create({ data: { accountId: juryAccount.id, juryApplicationId: application.id, fullName: application.fullName, professionalTitle: application.professionalTitle, expertiseAreas, approvedCategories: expertiseAreas, dataScope: "TEST" } });
    const juryPayment = await tx.payment.create({ data: { accountId: juryAccount.id, juryApplicationId: application.id, customerEmail: juryEmail, amount: 0, status: "PAID", purchaseType: "JURY", provider: "MANUAL", paidAt: now, fulfilledAt: now, dataScope: "TEST" } });
    records.accounts.push(juryAccount.id);
    records.juryApplications.push(application.id);
    records.juryProfiles.push(profile.id);
    records.payments.push(juryPayment.id);
    await tx.test.update({ where: { id: test.id }, data: { status: "COMPLETED", createdRecords: json(records), auditEvents: json({ schemaVersion: 1, events: [{ id: crypto.randomUUID(), action: "SEED", targetType: "test", targetId: test.id, createdAt: now.toISOString(), summary: { nominationCount: records.nominations.length } }] }) } });
  });
  console.log(`Created Test ${test.id} with ${records.nominations.length} scoring nominations.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); await pool.end(); });
