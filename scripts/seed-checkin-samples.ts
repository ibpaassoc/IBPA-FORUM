/** Seeds explicit TEST-scoped scanner fixtures and records every created ID in one Test row. */
import "dotenv/config";

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import QRCode from "qrcode";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { normalizeSslMode } from "@/shared/lib/db-url";
import { getCategoryScoringDefinition } from "@/features/jury/scoring/category-scoring";
import { emptyNominationAnswers, emptyStoredFiles, emptyJuryInformationRequests, emptyTicketActivity, emptyTicketCredential } from "@/features/database/json-fields";
import { emptyTestAuditEvents, emptyTestCreatedRecords, emptyTestEmailDeliveries, parseTestCreatedRecords } from "@/features/test/lib/test-records";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is missing");
const pool = new Pool({ connectionString: normalizeSslMode(connectionString) });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool, process.env.DATABASE_SCHEMA ? { schema: process.env.DATABASE_SCHEMA } : undefined) });
const json = (value: unknown) => value as Prisma.InputJsonValue;

function credential(token: string) {
  const now = new Date().toISOString();
  return { ...emptyTicketCredential(), active: { token, status: "ACTIVE" as const, generatedAt: now, lastSentAt: null }, history: [{ id: crypto.randomUUID(), token, status: "ACTIVE" as const, generatedAt: now, lastSentAt: null }] };
}

async function removePreviousRun() {
  const previous = await prisma.test.findFirst({ where: { kind: "seed-checkin-samples", status: { not: "CLEANED" } }, orderBy: { createdAt: "desc" } });
  if (!previous) return;
  const records = parseTestCreatedRecords(previous.createdRecords);
  await prisma.$transaction(async (tx) => {
    await tx.ticket.deleteMany({ where: { id: { in: records.tickets }, dataScope: "TEST" } });
    await tx.nomination.deleteMany({ where: { id: { in: records.nominations }, dataScope: "TEST" } });
    await tx.payment.deleteMany({ where: { id: { in: records.payments }, dataScope: "TEST" } });
    await tx.juryProfile.deleteMany({ where: { id: { in: records.juryProfiles }, dataScope: "TEST" } });
    await tx.applicantProfile.deleteMany({ where: { id: { in: records.applicantProfiles }, dataScope: "TEST" } });
    await tx.juryApplication.deleteMany({ where: { id: { in: records.juryApplications }, dataScope: "TEST" } });
    await tx.account.deleteMany({ where: { id: { in: records.accounts }, dataScope: "TEST" } });
    await tx.test.update({ where: { id: previous.id }, data: { status: "CLEANED" } });
  });
}

async function main() {
  await removePreviousRun();
  const category = await prisma.category.findFirst({ include: { awards: true } });
  const award = category?.awards[0];
  if (!category || !award) throw new Error("No category/award found; run the seed first.");
  const test = await prisma.test.create({
    data: {
      name: "Scanner samples",
      kind: "seed-checkin-samples",
      configuration: json({ schemaVersion: 1 }),
      createdRecords: json(emptyTestCreatedRecords()),
      auditEvents: json(emptyTestAuditEvents()),
      emailDeliveries: json(emptyTestEmailDeliveries()),
    },
  });
  const records = emptyTestCreatedRecords();
  const samples = await prisma.$transaction(async (tx) => {
    const now = new Date();
    const forumToken = crypto.randomBytes(32).toString("hex");
    const forumPayment = await tx.payment.create({ data: { customerEmail: "scanner-forum@example.invalid", amount: 0, status: "PAID", purchaseType: "TICKET", provider: "MANUAL", paidAt: now, fulfilledAt: now, dataScope: "TEST" } });
    const forumTicket = await tx.ticket.create({ data: { paymentId: forumPayment.id, kind: "FORUM", secureToken: forumToken, credential: json(credential(forumToken)), activity: json(emptyTicketActivity()), fullName: "Sample Forum Attendee", email: "scanner-forum@example.invalid", phone: "+1 555 0101", type: "TWO_DAYS", galaDinner: true, status: "PAID", paidAt: now, dataScope: "TEST" } });

    const applicantEmail = `scanner-applicant-${test.id}@example.invalid`;
    const applicantAccount = await tx.account.create({ data: { email: applicantEmail, normalizedEmail: applicantEmail, role: "APPLICANT", status: "ACTIVE", dataScope: "TEST" } });
    const applicantProfile = await tx.applicantProfile.create({ data: { accountId: applicantAccount.id, fullName: "Sample Participant", phone: "+1 555 0202", dataScope: "TEST" } });
    const nominationPayment = await tx.payment.create({ data: { accountId: applicantAccount.id, customerEmail: applicantEmail, amount: 0, status: "PAID", purchaseType: "NOMINATION", provider: "MANUAL", paidAt: now, fulfilledAt: now, dataScope: "TEST" } });
    const nomination = await tx.nomination.create({ data: { applicantProfileId: applicantProfile.id, paymentId: nominationPayment.id, categoryId: category.id, awardId: award.id, status: "SUBMITTED", answers: json(emptyNominationAnswers()), files: json(emptyStoredFiles()), scoringSchema: json(getCategoryScoringDefinition(category.slug)), submittedAt: now, dataScope: "TEST" } });
    const applicantToken = crypto.randomBytes(32).toString("hex");
    const applicantTicket = await tx.ticket.create({ data: { accountId: applicantAccount.id, applicantProfileId: applicantProfile.id, kind: "APPLICANT", secureToken: applicantToken, credential: json(credential(applicantToken)), activity: json(emptyTicketActivity()), fullName: applicantProfile.fullName, email: applicantEmail, phone: applicantProfile.phone ?? "", status: "PAID", paidAt: now, dataScope: "TEST" } });

    const juryEmail = `scanner-jury-${test.id}@example.invalid`;
    const juryAccount = await tx.account.create({ data: { email: juryEmail, normalizedEmail: juryEmail, role: "JURY", status: "ACTIVE", dataScope: "TEST" } });
    const juryApplication = await tx.juryApplication.create({ data: { accountId: juryAccount.id, fullName: "Sample Jury Member", email: juryEmail, phone: "+1 555 0303", country: "France", city: "Paris", professionalTitle: "Master Stylist", yearsExperience: 15, employerAffiliation: "Independent", previousJudgingExperience: true, expertiseAreas: [category.name], professionalBio: "Scanner test jury member.", conflictDisclosure: "None", motivation: "Scanner validation", status: "PAID", informationRequests: json(emptyJuryInformationRequests()), files: json(emptyStoredFiles()), submittedAt: now, approvedAt: now, dataScope: "TEST" } });
    const juryProfile = await tx.juryProfile.create({ data: { accountId: juryAccount.id, juryApplicationId: juryApplication.id, fullName: juryApplication.fullName, expertiseAreas: [category.name], approvedCategories: [category.name], dataScope: "TEST" } });
    const juryToken = crypto.randomBytes(32).toString("hex");
    const juryTicket = await tx.ticket.create({ data: { accountId: juryAccount.id, kind: "JURY", secureToken: juryToken, credential: json(credential(juryToken)), activity: json(emptyTicketActivity()), fullName: juryApplication.fullName, email: juryEmail, phone: juryApplication.phone, status: "PAID", paidAt: now, dataScope: "TEST" } });

    records.accounts.push(applicantAccount.id, juryAccount.id);
    records.applicantProfiles.push(applicantProfile.id);
    records.juryApplications.push(juryApplication.id);
    records.juryProfiles.push(juryProfile.id);
    records.nominations.push(nomination.id);
    records.payments.push(forumPayment.id, nominationPayment.id);
    records.tickets.push(forumTicket.id, applicantTicket.id, juryTicket.id);
    await tx.test.update({ where: { id: test.id }, data: { status: "COMPLETED", createdRecords: json(records) } });
    return [
      { label: "Forum + Gala ticket", payload: `IBPA:TICKET:${forumToken}` },
      { label: "Participant", payload: `IBPA:PARTICIPANT:${applicantToken}` },
      { label: "Jury", payload: `IBPA:JURY:${juryToken}` },
    ];
  });
  const outDir = path.join(os.tmpdir(), "ibpa-checkin-samples");
  fs.mkdirSync(outDir, { recursive: true });
  for (const [index, sample] of samples.entries()) {
    const file = path.join(outDir, `sample-${index + 1}.png`);
    await QRCode.toFile(file, sample.payload, { width: 360, margin: 2 });
    console.log(`${sample.label}: ${sample.payload}\nQR: ${file}`);
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); await pool.end(); });
