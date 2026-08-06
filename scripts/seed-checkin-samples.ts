/**
 * Seeds one PAID sample of every ticket-like record the unified scanner
 * supports, then prints each scannable QR payload and writes a QR PNG to the OS
 * temp dir so the scanner can be tested end-to-end (camera or manual entry).
 *
 *   npm run seed:checkin-samples
 *
 * Idempotent: re-running replaces the previous samples (matched by their
 * *.checkin.test email addresses).
 */
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

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const pool = new Pool({ connectionString: normalizeSslMode(connectionString) });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const FORUM_EMAIL = "sample.forum@checkin.test";
const PARTICIPANT_EMAIL = "sample.participant@checkin.test";
const JURY_EMAIL = "sample.jury@checkin.test";

function buildPayload(kind: "TICKET" | "PARTICIPANT" | "JURY", token: string) {
  return `IBPA:${kind}:${token}`;
}

async function main() {
  // ── Forum + Gala ticket ────────────────────────────────────────────────────
  await prisma.ticket.deleteMany({ where: { email: FORUM_EMAIL } });
  const ticket = await prisma.ticket.create({
    data: {
      secureToken: crypto.randomBytes(32).toString("hex"),
      fullName: "Sample Forum Attendee",
      email: FORUM_EMAIL,
      phone: "+1 555 0101",
      type: "TWO_DAYS",
      galaDinner: true,
      isIbpaMember: false,
      status: "PAID",
      paidAt: new Date(),
    },
  });

  // ── Participant nomination account ───────────────────────────────────────────
  const category = await prisma.category.findFirst({ include: { awards: true } });
  const award = category?.awards[0];
  if (!category || !award) {
    throw new Error("No category/award found — run `prisma db seed` first.");
  }
  await prisma.account.deleteMany({ where: { email: PARTICIPANT_EMAIL } });
  const participantAccount = await prisma.account.create({
    data: {
      email: PARTICIPANT_EMAIL,
      normalizedEmail: PARTICIPANT_EMAIL,
      role: "APPLICANT",
      status: "ACTIVE",
      applicantProfile: {
        create: {
          fullName: "Sample Participant",
          phone: "+1 555 0202",
          country: "Canada",
          city: "Toronto",
          professionalTitle: "Makeup Artist",
          yearsExperience: 6,
        },
      },
    },
    include: { applicantProfile: true },
  });
  const participantProfile = participantAccount.applicantProfile!;
  await prisma.nominationApplication.create({
    data: {
      applicantProfileId: participantProfile.id,
      categoryId: category.id,
      awardId: award.id,
      status: "SUBMITTED",
      scoringSchema: getCategoryScoringDefinition(category.slug) as Prisma.InputJsonValue,
      paymentStatus: "PAID",
      paidAt: new Date(),
      submittedAt: new Date(),
    },
  });
  const participantCredential = await prisma.applicantCheckInCredential.create({
    data: {
      token: crypto.randomUUID(),
      applicantProfileId: participantProfile.id,
    },
  });

  // ── Jury application ─────────────────────────────────────────────────────────
  await prisma.juryApplication.deleteMany({ where: { email: JURY_EMAIL } });
  const jury = await prisma.juryApplication.create({
    data: {
      fullName: "Sample Jury Member",
      email: JURY_EMAIL,
      phone: "+1 555 0303",
      country: "France",
      city: "Paris",
      professionalTitle: "Master Stylist",
      yearsExperience: 15,
      employerAffiliation: "Independent",
      previousJudgingExperience: true,
      expertiseAreas: [category.name],
      professionalBio: "Sample jury member for check-in testing.",
      conflictDisclosure: "None.",
      motivation: "Sample.",
      status: "PAID",
      paymentStatus: "PAID",
      paidAt: new Date(),
    },
  });

  const samples = [
    { label: "Forum + Gala ticket", payload: buildPayload("TICKET", ticket.secureToken) },
    { label: "Participant", payload: buildPayload("PARTICIPANT", participantCredential.token) },
    { label: "Jury", payload: buildPayload("JURY", jury.id) },
  ];

  const outDir = path.join(os.tmpdir(), "ibpa-checkin-samples");
  fs.mkdirSync(outDir, { recursive: true });

  console.log("\n✅ Seeded check-in samples (all PAID):\n");
  for (const [index, sample] of samples.entries()) {
    const file = path.join(outDir, `sample-${index + 1}-${sample.payload.split(":")[1].toLowerCase()}.png`);
    await QRCode.toFile(file, sample.payload, { width: 360, margin: 2 });
    console.log(`  ${sample.label}`);
    console.log(`    code: ${sample.payload}`);
    console.log(`    qr:   ${file}\n`);
  }
  console.log("Open /admin/scanner and scan a PNG, or paste a code via “Enter code manually”.\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
