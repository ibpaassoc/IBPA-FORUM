import "server-only";

import crypto from "node:crypto";
import { Prisma, type NominationStatus } from "@prisma/client";
import { getCategoryScoringDefinition } from "@/features/jury/scoring/category-scoring";
import { emptyStoredFiles } from "@/features/database/json-fields";
import { unscopedPrisma } from "@/shared/lib/prisma";
import { runWithDataScope } from "@/features/test/server/data-scope";
import {
  createTestRun,
  emptyTestCreatedRecords,
  parseTestCreatedRecords,
  testJson,
  type TestCreatedRecords,
} from "@/features/test/server/test-records";
import { deleteTestScenario } from "@/features/test/server/cleanup";

export type ApplicantScenarioKind =
  | "applicant-empty"
  | "applicant-draft"
  | "applicant-incomplete"
  | "applicant-submitted"
  | "applicant-multiple"
  | "applicant-scores"
  | "applicant-upload-failure";

export type JuryScenarioKind =
  | "jury-empty"
  | "jury-unreviewed"
  | "jury-partial"
  | "jury-submitted";

type CatalogChoice = {
  award: { id: string; name: string };
  category: { id: string; name: string; slug: string };
};

function uniqueEmail(kind: string) {
  return `test+${kind}.${Date.now()}.${crypto.randomBytes(4).toString("hex")}@example.invalid`;
}

async function catalogChoice(tx: Prisma.TransactionClient, index = 0): Promise<CatalogChoice> {
  const awards = await tx.award.findMany({
    include: { category: { select: { id: true, name: true, slug: true } } },
    orderBy: [{ categoryId: "asc" }, { name: "asc" }],
    skip: index,
    take: 1,
  });
  const award = awards[0];
  if (!award) throw new Error(`At least ${index + 1} Awards are required for this test scenario.`);
  return { award: { id: award.id, name: award.name }, category: award.category };
}

function answersDocument(kind: ApplicantScenarioKind) {
  const timestamp = new Date().toISOString();
  if (kind === "applicant-incomplete") {
    return {
      schemaVersion: 1,
      fields: [{ fieldId: "professionalBio", label: "Professional bio", type: "textarea", value: "Partial test answer", updatedAt: timestamp }],
    };
  }
  if (kind === "applicant-draft" || kind === "applicant-upload-failure") {
    return {
      schemaVersion: 1,
      fields: [{ fieldId: "professionalBio", label: "Professional bio", type: "textarea", value: "Draft test answer", updatedAt: timestamp }],
    };
  }
  return {
    schemaVersion: 1,
    fields: [
      { fieldId: "professionalBio", label: "Professional bio", type: "textarea", value: "Complete isolated test nomination.", updatedAt: timestamp },
      { fieldId: "yearsExperience", label: "Years of experience", type: "number", value: 8, updatedAt: timestamp },
    ],
  };
}

function nominationStatus(kind: ApplicantScenarioKind): NominationStatus {
  return kind === "applicant-submitted" || kind === "applicant-multiple" || kind === "applicant-scores" ? "SUBMITTED" : "DRAFT";
}

async function createApplicantRecords(
  tx: Prisma.TransactionClient,
  kind: ApplicantScenarioKind,
  records: TestCreatedRecords,
) {
  const email = uniqueEmail(kind);
  const account = await tx.account.create({
    data: {
      email,
      normalizedEmail: email.toLowerCase(),
      role: "APPLICANT",
      status: "ACTIVE",
      dataScope: "TEST",
    },
  });
  const profile = await tx.applicantProfile.create({
    data: {
      accountId: account.id,
      fullName: `Test Applicant ${email.slice(5, 17)}`,
      phone: "+1 555 010 1000",
      country: "United States",
      city: "Test City",
      professionalTitle: "Test Professional",
      yearsExperience: 8,
      preferredLocale: "en",
      dataScope: "TEST",
    },
  });
  records.accounts.push(account.id);
  records.applicantProfiles.push(profile.id);

  const nominationCount = kind === "applicant-empty" ? 0 : kind === "applicant-multiple" || kind === "applicant-scores" ? 3 : 1;
  const nominations = [];
  for (let index = 0; index < nominationCount; index += 1) {
    const catalog = await catalogChoice(tx, index);
    const payment = await tx.payment.create({
      data: {
        accountId: account.id,
        customerEmail: email,
        amount: 0,
        currency: "usd",
        status: "PAID",
        purchaseType: "NOMINATION",
        provider: "MANUAL",
        pricingSnapshot: testJson({ schemaVersion: 1, reason: "isolated-test-scenario" }),
        paidAt: new Date(),
        fulfilledAt: new Date(),
        dataScope: "TEST",
      },
    });
    const status = nominationStatus(kind);
    const nomination = await tx.nomination.create({
      data: {
        applicantProfileId: profile.id,
        paymentId: payment.id,
        awardId: catalog.award.id,
        categoryId: catalog.category.id,
        status,
        answers: testJson(answersDocument(kind)),
        files: testJson(emptyStoredFiles()),
        scoringSchema: testJson(getCategoryScoringDefinition(catalog.category.slug)),
        submittedAt: status === "SUBMITTED" ? new Date() : null,
        scoresReleasedAt: kind === "applicant-scores" ? new Date() : null,
        dataScope: "TEST",
      },
      include: { award: true, category: true },
    });
    records.payments.push(payment.id);
    records.nominations.push(nomination.id);
    nominations.push(nomination);
  }
  return { account, profile, nominations };
}

function sampleScores(maximums: Array<{ key: string; maxScore: number }>, desiredTotal: number) {
  const scores = Object.fromEntries(maximums.map((criterion) => [criterion.key, criterion.maxScore]));
  let deficit = maximums.reduce((sum, criterion) => sum + criterion.maxScore, 0) - desiredTotal;
  for (let cursor = 0; deficit > 0; cursor += 1) {
    const criterion = maximums[cursor % maximums.length];
    if (scores[criterion.key] > 0) {
      scores[criterion.key] -= 1;
      deficit -= 1;
    }
  }
  return scores;
}

async function addApplicantScoreSamples(
  tx: Prisma.TransactionClient,
  nominations: Awaited<ReturnType<typeof createApplicantRecords>>["nominations"],
  records: TestCreatedRecords,
) {
  const names = ["Maria Iurkivska", "Olena Sokolova", "Daria Koval", "Iryna Petrenko", "Nataliia Romanova", "Anastasiia Melnyk"];
  const totals = [
    [100, 93, 91, 88, 87, 84],
    [91, 89, 86, 84, 82, 79],
    [84, 82, 80, 78, 75, 73],
  ];
  const notes = [
    "A compelling nomination with strong technical mastery and a clear record of professional growth. The submitted work consistently meets a high standard.",
    "The portfolio is carefully presented and shows confident execution. I particularly appreciated the breadth of techniques and the thoughtful client outcomes.",
    "Strong evidence of both skill and sustained development. The nomination makes a persuasive case through its results and professional achievements.",
    "A polished submission with excellent attention to detail. Continued documentation of industry contributions would make this even stronger.",
    "The work demonstrates a distinctive point of view and sound professional standards. The supporting materials were clear and easy to evaluate.",
    "A very good overall result. The nomination communicates experience, care, and consistent quality across the submitted examples.",
  ];
  const first = nominations[0];
  if (!first) return;
  for (let judgeIndex = 0; judgeIndex < names.length; judgeIndex += 1) {
    const judge = await createJuryRecords(tx, "jury-submitted", records, first.id);
    await tx.juryProfile.update({ where: { id: judge.profile.id }, data: {
      fullName: names[judgeIndex],
      approvedCategories: [...new Set(nominations.map((nomination) => nomination.category.name))],
    } });
    await tx.juryApplication.update({ where: { id: judge.application.id }, data: { fullName: names[judgeIndex] } });
    for (let nominationIndex = 0; nominationIndex < nominations.length; nominationIndex += 1) {
      const nomination = nominations[nominationIndex];
      const definition = getCategoryScoringDefinition(nomination.category.slug);
      const total = totals[nominationIndex][judgeIndex];
      const reviewData = {
        status: "SUBMITTED" as const,
        scoreData: testJson({ version: 1, categorySlug: definition.categorySlug, scores: sampleScores(definition.criteria, total) }),
        totalScore: total,
        comments: notes[judgeIndex],
        startedAt: new Date(), submittedAt: new Date(),
      };
      if (nominationIndex === 0 && judge.review) {
        await tx.juryNominationReview.update({ where: { id: judge.review.id }, data: reviewData });
      } else {
        const review = await tx.juryNominationReview.create({
          data: { nominationId: nomination.id, juryProfileId: judge.profile.id, dataScope: "TEST", ...reviewData },
        });
        records.reviews.push(review.id);
      }
    }
  }
}

async function createJuryRecords(
  tx: Prisma.TransactionClient,
  kind: JuryScenarioKind,
  records: TestCreatedRecords,
  nominationId?: string,
) {
  const catalog = await catalogChoice(tx);
  const email = uniqueEmail(kind);
  const account = await tx.account.create({
    data: {
      email,
      normalizedEmail: email.toLowerCase(),
      role: "JURY",
      status: "ACTIVE",
      dataScope: "TEST",
    },
  });
  const application = await tx.juryApplication.create({
    data: {
      accountId: account.id,
      fullName: `Test Juror ${email.slice(5, 17)}`,
      email,
      phone: "+1 555 010 2000",
      country: "United States",
      city: "Test City",
      professionalTitle: "Test Jury Professional",
      yearsExperience: 12,
      employerAffiliation: "IBPA Test Suite",
      previousJudgingExperience: true,
      previousJudgingDetails: "Isolated test scenario",
      expertiseAreas: [catalog.category.name],
      professionalBio: "Isolated jury test profile.",
      conflictDisclosure: "None",
      motivation: "Automated workflow validation",
      status: "PAID",
      informationRequests: testJson({ schemaVersion: 1, requests: [] }),
      files: testJson(emptyStoredFiles()),
      submittedAt: new Date(),
      approvedAt: new Date(),
      dataScope: "TEST",
    },
  });
  const profile = await tx.juryProfile.create({
    data: {
      accountId: account.id,
      juryApplicationId: application.id,
      fullName: application.fullName,
      phone: application.phone,
      country: application.country,
      city: application.city,
      professionalTitle: application.professionalTitle,
      yearsExperience: application.yearsExperience,
      employerAffiliation: application.employerAffiliation,
      expertiseAreas: application.expertiseAreas,
      approvedCategories: kind === "jury-empty" ? ["__NO_TEST_MATCH__"] : [catalog.category.name],
      professionalBio: application.professionalBio,
      dataScope: "TEST",
    },
  });
  const payment = await tx.payment.create({
    data: {
      accountId: account.id,
      juryApplicationId: application.id,
      customerEmail: email,
      amount: 0,
      status: "PAID",
      currency: "usd",
      purchaseType: "JURY",
      provider: "MANUAL",
      pricingSnapshot: testJson({ schemaVersion: 1, reason: "isolated-test-scenario" }),
      paidAt: new Date(),
      fulfilledAt: new Date(),
      dataScope: "TEST",
    },
  });
  records.accounts.push(account.id);
  records.juryApplications.push(application.id);
  records.juryProfiles.push(profile.id);
  records.payments.push(payment.id);

  let review = null;
  if (nominationId && (kind === "jury-partial" || kind === "jury-submitted")) {
    const definition = getCategoryScoringDefinition(catalog.category.slug);
    const complete = kind === "jury-submitted";
    const scores = Object.fromEntries(
      definition.criteria.map((criterion, index) => [criterion.key, complete || index < 2 ? Math.min(criterion.maxScore, 8) : null]),
    );
    const present = Object.values(scores).filter((score): score is number => typeof score === "number");
    review = await tx.juryNominationReview.create({
      data: {
        nominationId,
        juryProfileId: profile.id,
        status: complete ? "SUBMITTED" : "IN_PROGRESS",
        scoreData: testJson({ version: 1, categorySlug: catalog.category.slug, scores }),
        totalScore: present.reduce((sum, score) => sum + score, 0),
        comments: complete ? "Completed isolated test review." : "Partial isolated test review.",
        startedAt: new Date(),
        submittedAt: complete ? new Date() : null,
        dataScope: "TEST",
      },
    });
    records.reviews.push(review.id);
  }
  return { account, application, profile, payment, review };
}

export async function createApplicantScenario(kind: ApplicantScenarioKind) {
  const scenario = await createTestRun({
    name: kind.replaceAll("-", " "),
    kind,
    description: "Applicant workflow data isolated through explicit Test record IDs.",
    configuration: { kind, simulateUploadFailure: kind === "applicant-upload-failure" },
  });
  try {
    const result = await runWithDataScope({ dataScope: "TEST", testId: scenario.id }, async () => {
      const records = emptyTestCreatedRecords();
      return unscopedPrisma.$transaction(async (tx) => {
        const created = await createApplicantRecords(tx, kind, records);
        if (kind === "applicant-scores") await addApplicantScoreSamples(tx, created.nominations, records);
        await tx.test.update({
          where: { id: scenario.id },
          data: { createdRecords: testJson(records), status: "COMPLETED" },
        });
        return created;
      }, { timeout: kind === "applicant-scores" ? 60_000 : 5_000 });
    });
    return { scenario: await unscopedPrisma.test.findUniqueOrThrow({ where: { id: scenario.id } }), ...result };
  } catch (error) {
    await unscopedPrisma.test.update({ where: { id: scenario.id }, data: { status: "FAILED" } }).catch(() => undefined);
    await deleteTestScenario(scenario.id).catch(() => undefined);
    throw error;
  }
}

export async function createJuryScenario(kind: JuryScenarioKind) {
  const scenario = await createTestRun({
    name: kind.replaceAll("-", " "),
    kind,
    description: "Jury workflow data isolated through explicit Test record IDs.",
    configuration: { kind },
  });
  try {
    const result = await runWithDataScope({ dataScope: "TEST", testId: scenario.id }, async () => {
      const records = emptyTestCreatedRecords();
      return unscopedPrisma.$transaction(async (tx) => {
        let nominationId: string | undefined;
        if (kind !== "jury-empty") {
          const applicant = await createApplicantRecords(tx, "applicant-submitted", records);
          nominationId = applicant.nominations[0]?.id;
        }
        const created = await createJuryRecords(tx, kind, records, nominationId);
        await tx.test.update({
          where: { id: scenario.id },
          data: { createdRecords: testJson(records), status: "COMPLETED" },
        });
        return created;
      });
    });
    return { scenario: await unscopedPrisma.test.findUniqueOrThrow({ where: { id: scenario.id } }), ...result };
  } catch (error) {
    await unscopedPrisma.test.update({ where: { id: scenario.id }, data: { status: "FAILED" } }).catch(() => undefined);
    await deleteTestScenario(scenario.id).catch(() => undefined);
    throw error;
  }
}

export async function createFullFlowScenario() {
  const scenario = await createTestRun({
    name: "Full applicant to jury flow",
    kind: "full-flow",
    description: "Applicant, paid nomination, jury account and completed review in one isolated run.",
  });
  try {
    const result = await runWithDataScope({ dataScope: "TEST", testId: scenario.id }, async () => {
      const records = emptyTestCreatedRecords();
      return unscopedPrisma.$transaction(async (tx) => {
        const applicant = await createApplicantRecords(tx, "applicant-submitted", records);
        const jury = await createJuryRecords(tx, "jury-submitted", records, applicant.nominations[0]?.id);
        await tx.test.update({
          where: { id: scenario.id },
          data: { createdRecords: testJson(records), status: "COMPLETED" },
        });
        return { applicant, jury };
      });
    });
    return { scenario: await unscopedPrisma.test.findUniqueOrThrow({ where: { id: scenario.id } }), ...result };
  } catch (error) {
    const existing = await unscopedPrisma.test.findUnique({ where: { id: scenario.id } });
    if (existing && parseTestCreatedRecords(existing.createdRecords)) {
      await unscopedPrisma.test.update({ where: { id: scenario.id }, data: { status: "FAILED" } }).catch(() => undefined);
      await deleteTestScenario(scenario.id).catch(() => undefined);
    }
    throw error;
  }
}
