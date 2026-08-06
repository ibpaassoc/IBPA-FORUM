import "server-only";

import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import { put } from "@vercel/blob";
import type Stripe from "stripe";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { validateNominationBlockB } from "@/features/applications/schemas/category-field-validation";
import type { ApplicationFileRef, ApplicationValues, ApplyFieldConfig } from "@/features/applications/types/application.types";
import {
  APPLICANT_NOMINATION_PURCHASE_FLOW,
  APPLICANT_PURCHASE_MANIFEST_VERSION,
  type ApplicantPurchaseManifest,
} from "@/features/applications/server/purchase-workflow";
import { handleCompetitorStripeEvent } from "@/features/applications/server/webhook.workflow";
import { upsertApplicantAccountForApplication } from "@/features/account/server/accounts";
import { approveJuryApplicationWithoutPayment } from "@/features/jury/server/commands";
import { getCategoryScoringDefinition } from "@/features/jury/scoring/category-scoring";
import { saveJuryReviewDraft, submitJuryReview } from "@/features/jury/server/reviews";
import { prisma } from "@/shared/lib/prisma";
import { accountIdentity } from "@/features/account/server/accounts";
import { runWithDataScope } from "@/features/test/server/data-scope";
import { deleteTestScenario } from "@/features/test/server/cleanup";
import { buildSampleAsset } from "@/features/test/lib/sample-assets";

export type ApplicantScenarioKind =
  | "applicant-empty"
  | "applicant-draft"
  | "applicant-incomplete"
  | "applicant-submitted"
  | "applicant-multiple"
  | "applicant-upload-failure";

export type JuryScenarioKind =
  | "jury-empty"
  | "jury-unreviewed"
  | "jury-partial"
  | "jury-submitted";

function uniqueEmail(role: "applicant" | "jury") {
  return `test+${role}.${Date.now()}.${crypto.randomBytes(4).toString("hex")}@example.invalid`;
}
function fakeStripeEvent({
  eventId,
  sessionId,
  paymentId,
  amount,
}: {
  eventId: string;
  sessionId: string;
  paymentId: string;
  amount: number;
}) {
  return {
    id: eventId,
    type: "checkout.session.completed",
    data: {
      object: {
        id: sessionId,
        amount_total: amount,
        currency: "usd",
        payment_intent: `pi_${eventId}`,
        metadata: {
          flowType: APPLICANT_NOMINATION_PURCHASE_FLOW,
          paymentId,
        },
      },
    },
  } as unknown as Stripe.Event;
}

function sampleValue(field: ApplyFieldConfig, index = 0): ApplicationValues[string] {
  if (field.type === "url") return "https://example.com/test-portfolio";
  if (field.type === "email") return "test@example.invalid";
  if (field.type === "number") return String(field.min ?? 1);
  if (field.type === "checkbox-group") return [field.options?.[0]?.value ?? "test"];
  if (field.type === "select" || field.type === "radio") {
    return field.options?.[0]?.value ?? "yes";
  }
  if (field.type === "file") {
    const count = Math.max(field.minFiles ?? (field.required ? 1 : 0), 1);
    return Array.from({ length: count }, (_, fileIndex) => {
      const asset = buildSampleAsset({
        accept: field.accept,
        label: `${field.label} ${fileIndex + 1}`,
        seed: index * 7 + fileIndex,
      });
      return {
        fieldKey: field.key,
        fileName: `${field.key}-${index}-${fileIndex + 1}.${asset.extension}`,
        // Replaced with the real Blob pathname once the nomination exists and
        // the bytes have been uploaded; see persistScenarioNominationValues.
        fileUrl: `test-uploads/${crypto.randomUUID()}/${field.key}-${fileIndex + 1}`,
        mimeType: asset.mimeType,
        fileSize: asset.bytes.length,
      } satisfies ApplicationFileRef;
    });
  }
  return `Test value for ${field.label}`;
}

function completeNominationValues(categorySlug: string) {
  const fields = categoryFieldConfigs[categorySlug] ?? [];
  const values: ApplicationValues = {};
  for (const [index, field] of fields.entries()) {
    if (field.required || field.visibleWhen) values[field.key] = sampleValue(field, index);
  }
  for (const field of fields) {
    if (field.visibleWhen && values[field.visibleWhen.fieldKey] === undefined) {
      values[field.visibleWhen.fieldKey] = field.visibleWhen.equals;
    }
  }
  const errors = validateNominationBlockB(categorySlug, values);
  if (Object.keys(errors).length > 0) {
    throw new Error(`Real nomination validation rejected the generated test scenario: ${JSON.stringify(errors)}`);
  }
  return values;
}

/**
 * One seeded file per nomination carries a Cyrillic display name. Uploaded
 * files routinely have them, and a raw non-ASCII filename in a
 * `Content-Disposition` header throws when the Response is constructed — the
 * exact failure that used to 500 the file routes. Keeping one in every
 * scenario means the preview path is tested against it.
 */
function displayNameForScenarioFile(fieldKey: string, fileIndex: number, fallback: string) {
  if (fileIndex !== 0) return fallback;
  const extension = fallback.slice(fallback.lastIndexOf(".") + 1);
  return `портфолио-${fieldKey}.${extension}`;
}

async function uploadScenarioFile({
  nominationId,
  fieldKey,
  accept,
  label,
  fileName,
  seed,
  upload,
}: {
  nominationId: string;
  fieldKey: string;
  accept?: string[];
  label: string;
  fileName: string;
  seed: number;
  upload: boolean;
}) {
  const asset = buildSampleAsset({ accept, label, seed });
  const fallback = {
    fileName,
    fileUrl: `test-uploads/${crypto.randomUUID()}/${fieldKey}-${seed + 1}`,
    mimeType: asset.mimeType,
    fileSize: asset.bytes.length,
  };

  if (!upload || !process.env.BLOB_READ_WRITE_TOKEN) return fallback;

  // Mirror the production layout: the cleanup routine only deletes blobs whose
  // key starts with `applications/`, so anything written elsewhere would leak
  // when the scenario is torn down.
  const pathname = `applications/${nominationId}/${fieldKey}/${fileName}`;
  try {
    const blob = await put(pathname, asset.bytes, {
      access: "private",
      addRandomSuffix: true,
      contentType: asset.mimeType,
    });
    return { ...fallback, fileUrl: blob.pathname };
  } catch (error) {
    console.error("Test scenario sample upload failed", {
      nominationId,
      fieldKey,
      error: error instanceof Error ? error.message : "Unknown Blob error",
    });
    return fallback;
  }
}

async function persistScenarioNominationValues(
  nomination: { id: string; category: { slug: string } },
  mode: "incomplete" | "complete" | "upload-failure",
) {
  const fields = categoryFieldConfigs[nomination.category.slug] ?? [];
  const values =
    mode === "complete"
      ? completeNominationValues(nomination.category.slug)
      : mode === "incomplete"
        ? Object.fromEntries(
            fields
              .filter((field) => field.required && field.type !== "file")
              .slice(0, 1)
              .map((field, index) => [field.key, sampleValue(field, index)]),
          )
        : {
            [fields.find((field) => field.type === "file")?.key ?? "portfolioPhotos"]: [
              {
                fieldKey: fields.find((field) => field.type === "file")?.key ?? "portfolioPhotos",
                fileName: "intentionally-invalid.exe",
                fileUrl: "test-uploads/missing/intentionally-invalid.exe",
                mimeType: "application/x-msdownload",
                fileSize: 99_000_000,
              } satisfies ApplicationFileRef,
            ],
          };

  for (const [fieldKey, value] of Object.entries(values)) {
    if (Array.isArray(value) && value.every((item) => typeof item === "object" && item !== null && "fileUrl" in item)) {
      const field = fields.find((candidate) => candidate.key === fieldKey);
      for (const [fileIndex, item] of (value as ApplicationFileRef[]).entries()) {
        const stored = await uploadScenarioFile({
          nominationId: nomination.id,
          fieldKey,
          accept: field?.accept,
          label: `${field?.label ?? fieldKey} ${fileIndex + 1}`,
          fileName: item.fileName,
          seed: fileIndex,
          // The upload-failure scenario deliberately points at a blob that was
          // never written, so leave its reference untouched.
          upload: mode !== "upload-failure",
        });
        await prisma.nominationFile.create({
          data: {
            nominationApplicationId: nomination.id,
            fieldKey,
            fileName: stored.fileName,
            fileUrl: stored.fileUrl,
            displayFileName: displayNameForScenarioFile(fieldKey, fileIndex, stored.fileName),
            originalFileName: stored.fileName,
            mimeType: stored.mimeType,
            fileSize: stored.fileSize,
            originalFileSize: stored.fileSize,
            compressedFileSize: stored.fileSize,
            storageKey: stored.fileUrl,
          },
        });
      }
      continue;
    }
    await prisma.nominationAnswer.create({
      data: {
        nominationApplicationId: nomination.id,
        fieldKey,
        valueText: typeof value === "string" ? value : null,
        valueJson: Array.isArray(value) ? (value as Prisma.InputJsonValue) : undefined,
      },
    });
  }
}

async function createApplicantInScenario({
  scenarioId,
  kind,
}: {
  scenarioId: string;
  kind: ApplicantScenarioKind;
}) {
  return runWithDataScope({ dataScope: "TEST", testScenarioId: scenarioId }, async () => {
    const email = uniqueEmail("applicant");
    const profileInput = {
      fullName: `Test Applicant ${new Date().toISOString().slice(11, 19)}`,
      email,
      phone: "+1 555 010 2000",
      country: "USA",
      stateProvince: "CA",
      city: "Los Angeles",
      professionalTitle: "Test Beauty Professional",
      yearsExperience: 8,
      websiteUrl: "https://example.com/test-applicant",
    };

    if (kind === "applicant-empty") {
      const result = await prisma.$transaction((tx) =>
        upsertApplicantAccountForApplication(tx, profileInput),
      );
      await prisma.account.update({ where: { id: result.account.id }, data: { status: "ACTIVE" } });
      return { accountId: result.account.id, profileId: result.profile.id, nominationIds: [] };
    }

    const nominationCount = kind === "applicant-multiple" ? 3 : 1;
    const categories = await prisma.category.findMany({
      where: { awards: { some: {} } },
      include: { awards: true },
      orderBy: { createdAt: "asc" },
    });
    const selectedAwards = categories
      .flatMap((category) => category.awards.map((award) => ({ category, award })))
      .slice(0, nominationCount);
    if (selectedAwards.length < nominationCount) {
      throw new Error("The production category catalog does not contain enough nominations for this scenario.");
    }

    const amount = nominationCount * 10_000;
    const manifest: ApplicantPurchaseManifest = {
      version: APPLICANT_PURCHASE_MANIFEST_VERSION,
      flowType: APPLICANT_NOMINATION_PURCHASE_FLOW,
      source: "admin_manual",
      locale: "en",
      createdAt: new Date().toISOString(),
      personalInfo: profileInput,
      membership: { isVerifiedMember: false },
      selectedAwards: selectedAwards.map(({ category, award }) => ({
        awardId: award.id,
        awardName: award.name,
        categoryId: category.id,
        categoryName: category.name,
        categorySlug: category.slug,
      })),
      pricing: {
        amountCents: amount,
        currency: "usd",
        nominationCount,
        billableCount: nominationCount,
        isIbpaMember: false,
      },
    };
    const payment = await prisma.payment.create({
      data: {
        source: "COMPETITOR",
        applicantEmail: email,
        provider: "test-stripe-simulator",
        purchaseManifest: manifest as unknown as Prisma.InputJsonValue,
        amount,
        currency: "usd",
        status: "PENDING",
      },
    });
    const sessionId = `cs_test_${crypto.randomUUID()}`;
    await prisma.payment.update({ where: { id: payment.id }, data: { stripeSessionId: sessionId } });
    await handleCompetitorStripeEvent(
      fakeStripeEvent({
        eventId: `evt_test_${crypto.randomUUID()}`,
        sessionId,
        paymentId: payment.id,
        amount,
      }),
    );

    const account = await prisma.account.findUniqueOrThrow({
      where: accountIdentity(email, "APPLICANT"),
      include: { applicantProfile: { include: { nominations: { include: { category: true } } } } },
    });
    await prisma.account.update({ where: { id: account.id }, data: { status: "ACTIVE" } });
    const nominations = account.applicantProfile?.nominations ?? [];
    for (const nomination of nominations) {
      if (kind === "applicant-draft") {
        await prisma.nominationApplication.update({ where: { id: nomination.id }, data: { status: "DRAFT" } });
      } else if (kind === "applicant-incomplete") {
        await persistScenarioNominationValues(nomination, "incomplete");
        await prisma.nominationApplication.update({ where: { id: nomination.id }, data: { status: "DRAFT" } });
      } else if (kind === "applicant-upload-failure") {
        await persistScenarioNominationValues(nomination, "upload-failure");
        await prisma.nominationApplication.update({ where: { id: nomination.id }, data: { status: "DRAFT" } });
      } else {
        await persistScenarioNominationValues(nomination, "complete");
        await prisma.nominationApplication.update({
          where: { id: nomination.id },
          data: { status: "SUBMITTED", submittedAt: new Date() },
        });
      }
    }
    return {
      accountId: account.id,
      profileId: account.applicantProfile?.id ?? "",
      nominationIds: nominations.map((nomination) => nomination.id),
    };
  });
}

export async function createApplicantScenario(kind: ApplicantScenarioKind) {
  const scenario = await prisma.testScenario.create({
    data: { name: kind.replaceAll("-", " "), kind, description: "Applicant test scenario" },
  });
  try {
    return { scenario, ...(await createApplicantInScenario({ scenarioId: scenario.id, kind })) };
  } catch (error) {
    await deleteTestScenario(scenario.id).catch(() => undefined);
    throw error;
  }
}
async function createJuryInScenario({
  scenarioId,
  kind,
  nominationId,
}: {
  scenarioId: string;
  kind: JuryScenarioKind;
  nominationId?: string;
}) {
  return runWithDataScope({ dataScope: "TEST", testScenarioId: scenarioId }, async () => {
    const nomination = nominationId
      ? await prisma.nominationApplication.findUnique({
          where: { id: nominationId },
          include: { category: true },
        })
      : null;
    const approvedCategory = nomination?.category.name ?? `No assignments ${crypto.randomUUID()}`;
    const email = uniqueEmail("jury");
    const juryApplication = await prisma.juryApplication.create({
      data: {
        fullName: `Test Jury ${new Date().toISOString().slice(11, 19)}`,
        email,
        phone: "+1 555 010 3000",
        country: "USA",
        city: "Los Angeles",
        professionalTitle: "Test Jury Professional",
        yearsExperience: 12,
        employerAffiliation: "IBPA Test Lab",
        previousJudgingExperience: true,
        previousJudgingDetails: "Isolated test judging",
        expertiseAreas: [approvedCategory],
        approvedCategories: [approvedCategory],
        professionalBio: "Internal test jury profile exercising the production jury account flow.",
        professionalWebsite: "https://example.com/test-jury",
        conflictDisclosure: "No conflicts in isolated test data.",
        confidentialityAgreementAccepted: true,
        motivation: "End-to-end validation",
        status: "SUBMITTED",
        paymentStatus: "PENDING",
        submittedAt: new Date(),
      },
    });
    await approveJuryApplicationWithoutPayment(juryApplication.id);
    const account = await prisma.account.findUniqueOrThrow({
      where: accountIdentity(email, "JURY"),
      include: { juryProfile: true },
    });
    await prisma.account.update({ where: { id: account.id }, data: { status: "ACTIVE" } });
    const juryProfile = account.juryProfile;
    if (!juryProfile) throw new Error("The production jury activation flow did not create a profile.");

    if (nomination && kind === "jury-partial") {
      const definition = getCategoryScoringDefinition(nomination.category.slug);
      const first = definition.criteria[0];
      await saveJuryReviewDraft({
        judge: {
          accountId: account.id,
          email: account.email,
          juryProfileId: juryProfile.id,
          juryApplicationId: juryApplication.id,
          fullName: juryProfile.fullName,
          professionalTitle: juryProfile.professionalTitle ?? "",
          approvedCategories: juryProfile.approvedCategories,
          dataScope: "TEST",
        },
        nominationId: nomination.id,
        input: { scores: { [first.key]: Math.min(5, first.maxScore) }, comment: "Partially completed test review" },
      });
    }
    if (nomination && kind === "jury-submitted") {
      const definition = getCategoryScoringDefinition(nomination.category.slug);
      await submitJuryReview({
        judge: {
          accountId: account.id,
          email: account.email,
          juryProfileId: juryProfile.id,
          juryApplicationId: juryApplication.id,
          fullName: juryProfile.fullName,
          professionalTitle: juryProfile.professionalTitle ?? "",
          approvedCategories: juryProfile.approvedCategories,
          dataScope: "TEST",
        },
        nominationId: nomination.id,
        input: {
          scores: Object.fromEntries(definition.criteria.map((criterion) => [criterion.key, Math.max(1, Math.floor(criterion.maxScore / 2))])),
          comment: "Completed through the production jury review service.",
        },
      });
    }
    return { accountId: account.id, juryProfileId: juryProfile.id, juryApplicationId: juryApplication.id };
  });
}

export async function createJuryScenario(kind: JuryScenarioKind) {
  const scenario = await prisma.testScenario.create({
    data: { name: kind.replaceAll("-", " "), kind, description: "Jury test scenario" },
  });
  try {
    let nominationId: string | undefined;
    if (kind !== "jury-empty") {
      const applicant = await createApplicantInScenario({ scenarioId: scenario.id, kind: "applicant-submitted" });
      nominationId = applicant.nominationIds[0];
    }
    return {
      scenario,
      nominationId,
      ...(await createJuryInScenario({ scenarioId: scenario.id, kind, nominationId })),
    };
  } catch (error) {
    await deleteTestScenario(scenario.id).catch(() => undefined);
    throw error;
  }
}

export async function createFullFlowScenario() {
  const scenario = await prisma.testScenario.create({
    data: { name: "Full applicant to jury flow", kind: "full-flow", description: "Paid applicant, submitted nomination, jury assignment, and review." },
  });
  try {
    const applicant = await createApplicantInScenario({ scenarioId: scenario.id, kind: "applicant-submitted" });
    const nominationId = applicant.nominationIds[0];
    const jury = await createJuryInScenario({ scenarioId: scenario.id, kind: "jury-unreviewed", nominationId });
    return { scenario, applicant, jury, nominationId };
  } catch (error) {
    await deleteTestScenario(scenario.id).catch(() => undefined);
    throw error;
  }
}
