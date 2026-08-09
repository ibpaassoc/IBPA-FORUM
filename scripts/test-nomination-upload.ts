/**
 * Focused checks for the nomination direct-upload queue and idempotent
 * persistence safeguards.
 *
 *   npm run test:nomination-upload
 */
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runUploadQueue } from "@/features/applications/client/upload-queue";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import {
  getNewValidationErrors,
  validateNominationBlockB,
} from "@/features/applications/schemas/category-field-validation";
import type { ApplicationFileRef, ApplicationValues } from "@/features/applications/types/application.types";

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

async function testSingleUpload() {
  let attempts = 0;
  const progress: number[] = [];
  const result = await runUploadQueue(
    [
      {
        id: "one",
        upload: async (onProgress) => {
          attempts += 1;
          onProgress({ loaded: 5, total: 10, percentage: 50 });
          onProgress({ loaded: 10, total: 10, percentage: 100 });
          return "blob-one";
        },
      },
    ],
    {
      concurrency: 3,
      onProgress: (_id, value) => progress.push(value.percentage),
    },
  );

  assert.equal(attempts, 1);
  assert.deepEqual(progress, [50, 100]);
  assert.equal(result.completed.get("one"), "blob-one");
  assert.equal(result.failed.length, 0);
}

async function testLimitedConcurrency() {
  let active = 0;
  let maxActive = 0;
  const tasks = Array.from({ length: 7 }, (_, index) => ({
    id: `file-${index}`,
    upload: async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
      return index;
    },
  }));

  const result = await runUploadQueue(tasks, { concurrency: 3 });
  assert.equal(result.completed.size, 7);
  assert.equal(result.failed.length, 0);
  assert.equal(maxActive, 3);
}

async function testFailedUploadRetry() {
  const attempts = new Map<string, number>();
  const makeTask = (id: string) => ({
    id,
    upload: async () => {
      attempts.set(id, (attempts.get(id) ?? 0) + 1);
      if (id === "retry-me" && attempts.get(id) === 1) {
        throw new Error("Simulated connection loss");
      }
      return `blob-${id}`;
    },
  });

  const first = await runUploadQueue(
    ["kept-one", "retry-me", "kept-two"].map(makeTask),
    { concurrency: 2 },
  );
  assert.deepEqual(
    [...first.completed.keys()].sort(),
    ["kept-one", "kept-two"],
  );
  assert.deepEqual(first.failed.map((failure) => failure.id), ["retry-me"]);

  const retry = await runUploadQueue(first.failed.map(({ id }) => makeTask(id)), {
    concurrency: 2,
  });
  assert.equal(retry.completed.get("retry-me"), "blob-retry-me");
  assert.equal(attempts.get("kept-one"), 1);
  assert.equal(attempts.get("kept-two"), 1);
  assert.equal(attempts.get("retry-me"), 2);
}

function testServerSafeguards() {
  const tokenRoute = read("app/api/applications/upload/route.ts");
  assert.match(tokenRoute, /requireEditableNomination/);
  assert.match(tokenRoute, /field\.accept/);
  assert.doesNotMatch(tokenRoute, /maximumSizeInBytes|maxFileSizeMb/);
  assert.match(tokenRoute, /validUntil/);

  const nominationRoute = read(
    "app/api/applicant/nominations/[nominationId]/route.ts",
  );
  assert.match(nominationRoute, /await head\(ref\.fileUrl\)/);
  assert.match(nominationRoute, /parseStoredFiles\(nomination\.filesJson\)/);
  assert.match(nominationRoute, /parseNominationAnswers\(nomination\.answersJson\)/);
  assert.match(nominationRoute, /revision: nomination\.revision/);
  assert.match(nominationRoute, /revision: \{ increment: 1 \}/);
  assert.match(nominationRoute, /errorCode: "UPLOAD"/);
  assert.match(nominationRoute, /existingNominationValues\([\s\S]*nomination\.answers,[\s\S]*nomination\.files,[\s\S]*\)/);
  assert.match(nominationRoute, /const validationValues = \{ \.\.\.currentValues, \.\.\.values \}/);
  assert.match(nominationRoute, /validateNominationBlockB\([\s\S]*nomination\.category\.slug,[\s\S]*validationValues/);
  assert.match(nominationRoute, /getNewValidationErrors/);
  assert.match(nominationRoute, /requestId/);
  assert.doesNotMatch(nominationRoute, /nomination(File|Answer)\./);

  const schema = read("prisma/schema.prisma");
  assert.match(schema, /answers\s+Json/);
  assert.match(schema, /files\s+Json/);
  assert.match(schema, /revision\s+Int/);

  const editor = read("features/account/components/nomination-review/NominationReviewForm.tsx");
  assert.match(editor, /const AUTOSAVE_DELAY_MS = 650/);
  assert.match(editor, /void uploadFiles\(field, newFiles, false\)/);
  assert.match(editor, /void saveDraft\(\)/);
  assert.match(editor, /await saveDraft\(\{ allowDuringSubmit: true \}\)/);
  assert.match(editor, /activeSavePromise = useRef<Promise<boolean> \| null>\(null\)/);
  assert.match(editor, /async function waitForDraftSaves\(\)/);
  assert.match(
    editor,
    /if \(!\(await waitForDraftSaves\(\)\)\) return;\s+if \(!\(await saveDraft\(\{ allowDuringSubmit: true \}\)\)\) return;\s+if \(!\(await waitForDraftSaves\(\)\)\) return;/,
  );
  assert.match(editor, /hasActiveUploads \|\| hasFailedUploads \|\| hasPendingFiles/);
  assert.doesNotMatch(editor, /preparePayload/);

  const migration = read("prisma/migrations/20260807120000_forum_database_refactor/migration.sql");
  assert.match(migration, /Nomination_answers_shape/);
  assert.match(migration, /Nomination_files_shape/);
  assert.match(migration, /Nomination_active_owner_award_key/);

  const publicRoute = read("app/api/applications/route.ts");
  assert.match(publicRoute, /RAW_FILE_REJECTED/);
}

function testIncrementalSubmittedRepairs() {
  const current = {
    portfolioPhotos: "Upload at least five photos.",
    beforeAfterPhotos: "Before / After Photos is required.",
    statementOfAchievements: "Statement of Achievements is required.",
  };

  assert.deepEqual(
    getNewValidationErrors(current, current),
    {},
    "existing validation gaps do not block incremental submitted saves",
  );
  assert.deepEqual(
    getNewValidationErrors(current, {
      beforeAfterPhotos: current.beforeAfterPhotos,
      statementOfAchievements: current.statementOfAchievements,
    }),
    {},
    "repairing one field can be saved before the remaining fields are complete",
  );
  assert.deepEqual(
    getNewValidationErrors(current, {
      ...current,
      signatureTechnique: "Signature Technique is required.",
    }),
    { signatureTechnique: "Signature Technique is required." },
    "a submitted edit cannot invalidate a field that was previously valid",
  );
}

function testPartialUploadValidationUsesSavedFiles() {
  const fileRef = (fieldKey: string, index: number): ApplicationFileRef => ({
    fieldKey,
    fileName: `${fieldKey}-${index}.jpg`,
    fileUrl: `applications/nomination/${fieldKey}/${index}.jpg`,
    mimeType: "image/jpeg",
    fileSize: 1024,
  });
  const savedValues: ApplicationValues = {
    portfolioPhotos: Array.from({ length: 5 }, (_, index) =>
      fileRef("portfolioPhotos", index),
    ),
    beforeAfterPhotos: [
      fileRef("beforeAfterPhotos", 0),
      fileRef("beforeAfterPhotos", 1),
    ],
    statementOfAchievements: "Saved achievements",
    signatureTechnique: "Saved signature technique",
    sterilizationProtocol: "Saved sterilization protocol",
  };
  const partialUploadUpdate: ApplicationValues = {
    portfolioVideoLink: "https://example.com/portfolio",
  };

  assert.equal(
    validateNominationBlockB("hair", partialUploadUpdate).beforeAfterPhotos,
    "Before / After Photos is required.",
    "a partial upload payload is incomplete when validated in isolation",
  );
  assert.deepEqual(
    validateNominationBlockB("hair", {
      ...savedValues,
      ...partialUploadUpdate,
    }),
    {},
    "saved file fields remain valid while an in-flight field is omitted",
  );
}

function testUploadSizeBehavior() {
  const uploadValidation = read("features/applications/client/upload-files.ts");
  const fieldValidation = read("features/applications/schemas/category-field-validation.ts");
  const uploadField = read(
    "features/applications/components/application-form/fields/UploadField.tsx",
  );
  const categoryFields = read(
    "features/applications/config/category-field-configs/index.ts",
  );
  const nominationRoute = read(
    "app/api/applicant/nominations/[nominationId]/route.ts",
  );

  assert.doesNotMatch(uploadValidation, /MAX_UPLOAD_SIZE|too large|Maximum size/);
  assert.doesNotMatch(fieldValidation, /maxFileSize|oversizedFile/);
  assert.doesNotMatch(categoryFields, /maxFileSizeMb|100 MB each/);
  assert.doesNotMatch(nominationRoute, /maxFileSizeMb/);
  assert.match(uploadField, /AUTO_COMPRESS_THRESHOLD_BYTES = 5 \* 1024 \* 1024/);
  assert.match(uploadField, /file\.size > AUTO_COMPRESS_THRESHOLD_BYTES/);
}

function testCertificateLimits() {
  const practitionerCertificates = categoryFieldConfigs.hair.find(
    (field) => field.key === "professionalCertifications",
  );
  const educatorCertificates = categoryFieldConfigs.education.find(
    (field) => field.key === "educatorProfessionalCertifications",
  );

  assert.equal(practitionerCertificates?.maxFiles, 25);
  assert.equal(educatorCertificates?.maxFiles, 25);
}

async function main() {
  await testSingleUpload();
  await testLimitedConcurrency();
  await testFailedUploadRetry();
  testServerSafeguards();
  testIncrementalSubmittedRepairs();
  testPartialUploadValidationUsesSavedFiles();
  testUploadSizeBehavior();
  testCertificateLimits();
  console.log("nomination upload checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
