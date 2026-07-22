/**
 * Creates one submitted nomination per regulated category plus a jury account
 * that can review all of them.
 *
 *   npm run seed:scoring-samples
 *
 * Idempotent: records are matched by their *.scoring.test email addresses.
 */
import "dotenv/config";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { categoryCatalog } from "@/features/applications/config/category-catalog";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { getCategoryScoringDefinition } from "@/features/jury/scoring/category-scoring";
import { normalizeSslMode } from "@/shared/lib/db-url";

const APPLICANT_EMAIL = "nomination-samples@ibpa.scoring.test";
const JURY_EMAIL = "reviewer@ibpa.scoring.test";
const JURY_PASSWORD = process.env.SCORING_SAMPLE_PASSWORD || "Review-IBPA-2026!";
const scrypt = promisify(scryptCallback);

async function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const pool = new Pool({ connectionString: normalizeSslMode(connectionString) });
const prisma = new PrismaClient({
  adapter: new PrismaPg(
    pool,
    process.env.DATABASE_SCHEMA ? { schema: process.env.DATABASE_SCHEMA } : undefined
  ),
});

function sampleAnswerData(categorySlug: string, nominationId: string) {
  return (categoryFieldConfigs[categorySlug] ?? [])
    .filter((field) => field.type !== "file" && !field.visibleWhen)
    .slice(0, 5)
    .map((field) => {
      const base = {
        nominationApplicationId: nominationId,
        fieldKey: field.key,
      };

      if (field.type === "number") {
        return { ...base, valueNumber: Math.max(field.min ?? 1, 12) };
      }
      if (field.type === "checkbox-group") {
        return {
          ...base,
          valueJson: [field.options?.[0]?.value ?? "sample"] as Prisma.InputJsonValue,
        };
      }
      if (field.type === "url") {
        return { ...base, valueText: `https://example.com/ibpa/${categorySlug}` };
      }

      return {
        ...base,
        valueText: `${field.label}: regulation scoring sample evidence for ${categorySlug}.`,
      };
    });
}

async function seedCategories() {
  const categories = [];
  for (const definition of categoryCatalog) {
    const category = await prisma.category.upsert({
      where: { slug: definition.slug },
      update: { name: definition.name },
      create: { slug: definition.slug, name: definition.name },
    });
    const awardName = definition.awards[0];
    const award = await prisma.award.upsert({
      where: { categoryId_name: { categoryId: category.id, name: awardName } },
      update: {},
      create: { categoryId: category.id, name: awardName },
    });
    categories.push({ ...category, award });
  }
  return categories;
}

async function main() {
  const categories = await seedCategories();
  const applicantAccount = await prisma.account.upsert({
    where: { email: APPLICANT_EMAIL },
    update: { role: "APPLICANT", status: "ACTIVE", deletedAt: null },
    create: { email: APPLICANT_EMAIL, role: "APPLICANT", status: "ACTIVE" },
  });
  const applicant = await prisma.applicantProfile.upsert({
    where: { accountId: applicantAccount.id },
    update: {
      fullName: "Regulation Scoring Samples",
      professionalTitle: "Cross-category test nominee",
      country: "United States",
      city: "Los Angeles",
      yearsExperience: 12,
      deletedAt: null,
    },
    create: {
      accountId: applicantAccount.id,
      fullName: "Regulation Scoring Samples",
      professionalTitle: "Cross-category test nominee",
      country: "United States",
      city: "Los Angeles",
      yearsExperience: 12,
    },
  });

  const nominationIds: string[] = [];
  for (const category of categories) {
    const scoringSchema = getCategoryScoringDefinition(category.slug) as Prisma.InputJsonValue;
    const existing = await prisma.nominationApplication.findFirst({
      where: {
        applicantProfileId: applicant.id,
        awardId: category.award.id,
        deletedAt: null,
      },
      select: { id: true },
    });
    const nomination = existing
      ? await prisma.nominationApplication.update({
          where: { id: existing.id },
          data: {
            categoryId: category.id,
            scoringSchema,
            status: "SUBMITTED",
            paymentStatus: "PAID",
            paidAt: new Date(),
            submittedAt: new Date(),
            closedIncompleteAt: null,
            deletedAt: null,
          },
        })
      : await prisma.nominationApplication.create({
          data: {
            applicantProfileId: applicant.id,
            categoryId: category.id,
            awardId: category.award.id,
            scoringSchema,
            status: "SUBMITTED",
            paymentStatus: "PAID",
            paidAt: new Date(),
            submittedAt: new Date(),
          },
        });

    await prisma.juryNominationReview.deleteMany({ where: { nominationId: nomination.id } });
    await prisma.nominationAnswer.deleteMany({
      where: { nominationApplicationId: nomination.id },
    });
    const answers = sampleAnswerData(category.slug, nomination.id);
    if (answers.length > 0) {
      await prisma.nominationAnswer.createMany({ data: answers });
    }
    nominationIds.push(nomination.id);
  }

  const expertiseAreas = categories.map((category) => category.name);
  const juryApplication = await prisma.juryApplication.upsert({
    where: { email: JURY_EMAIL },
    update: {
      expertiseAreas,
      status: "PAID",
      paymentStatus: "PAID",
      approvedAt: new Date(),
      paidAt: new Date(),
    },
    create: {
      fullName: "Regulation Scoring Reviewer",
      email: JURY_EMAIL,
      phone: "+1 555 0100",
      country: "United States",
      city: "Los Angeles",
      professionalTitle: "IBPA Scoring QA Judge",
      yearsExperience: 15,
      employerAffiliation: "IBPA QA",
      previousJudgingExperience: true,
      previousJudgingDetails: "Internal scoring workflow verification.",
      expertiseAreas,
      professionalBio: "Test reviewer for the 2026 category-specific scorecards.",
      conflictDisclosure: "Test data only.",
      confidentialityAgreementAccepted: true,
      motivation: "Verify every regulation scorecard end to end.",
      status: "PAID",
      paymentStatus: "PAID",
      submittedAt: new Date(),
      approvedAt: new Date(),
      paidAt: new Date(),
    },
  });
  const juryAccount = await prisma.account.upsert({
    where: { email: JURY_EMAIL },
    update: {
      passwordHash: await createPasswordHash(JURY_PASSWORD),
      role: "JURY",
      status: "ACTIVE",
      deletedAt: null,
    },
    create: {
      email: JURY_EMAIL,
      passwordHash: await createPasswordHash(JURY_PASSWORD),
      role: "JURY",
      status: "ACTIVE",
    },
  });
  await prisma.juryProfile.upsert({
    where: { accountId: juryAccount.id },
    update: {
      juryApplicationId: juryApplication.id,
      fullName: juryApplication.fullName,
      professionalTitle: juryApplication.professionalTitle,
      expertiseAreas,
      approvalStatus: "PAID",
    },
    create: {
      accountId: juryAccount.id,
      juryApplicationId: juryApplication.id,
      fullName: juryApplication.fullName,
      professionalTitle: juryApplication.professionalTitle,
      expertiseAreas,
      approvalStatus: "PAID",
    },
  });

  console.log(`Created ${nominationIds.length} submitted scoring nominations.`);
  console.log(`Jury login: ${JURY_EMAIL}`);
  console.log(`Jury password: ${JURY_PASSWORD}`);
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
