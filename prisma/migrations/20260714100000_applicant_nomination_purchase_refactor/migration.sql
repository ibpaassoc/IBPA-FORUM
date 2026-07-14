-- Additive foundation for applicant-account nomination purchases.
-- Legacy Application, ApplicationAnswer, and ApplicationFile tables are kept intact.

ALTER TYPE "NominationStatus" ADD VALUE IF NOT EXISTS 'PURCHASED';
ALTER TYPE "NominationStatus" ADD VALUE IF NOT EXISTS 'RETURNED_FOR_CHANGES';

ALTER TABLE "Account"
  ADD COLUMN IF NOT EXISTS "setupTokenHash" TEXT,
  ADD COLUMN IF NOT EXISTS "setupTokenExpiresAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "setupTokenIssuedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "setupTokenUsedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastSetupEmailSentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastSetupEmailDeliveryStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "lastSetupEmailDeliveryError" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "ApplicantProfile"
  ADD COLUMN IF NOT EXISTS "membershipVerifiedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "membershipVerificationSource" TEXT,
  ADD COLUMN IF NOT EXISTS "preferredLocale" TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS "deadlineOverrideAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "Payment"
  ADD COLUMN IF NOT EXISTS "applicantProfileId" TEXT,
  ADD COLUMN IF NOT EXISTS "provider" TEXT NOT NULL DEFAULT 'stripe',
  ADD COLUMN IF NOT EXISTS "applicantEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "purchaseManifest" JSONB,
  ADD COLUMN IF NOT EXISTS "fulfilledAt" TIMESTAMP(3);

ALTER TABLE "NominationApplication"
  ALTER COLUMN "applicationId" DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS "purchasePaymentId" TEXT,
  ADD COLUMN IF NOT EXISTS "closedIncompleteAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "JudgeScore"
  ALTER COLUMN "applicationId" DROP NOT NULL;

ALTER TABLE "NominationFile"
  ADD COLUMN IF NOT EXISTS "originalFileName" TEXT,
  ADD COLUMN IF NOT EXISTS "displayFileName" TEXT,
  ADD COLUMN IF NOT EXISTS "originalFileSize" INTEGER,
  ADD COLUMN IF NOT EXISTS "compressedFileSize" INTEGER,
  ADD COLUMN IF NOT EXISTS "storageKey" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

UPDATE "NominationFile"
SET
  "originalFileName" = COALESCE("originalFileName", "fileName"),
  "displayFileName" = COALESCE("displayFileName", "fileName"),
  "originalFileSize" = COALESCE("originalFileSize", "fileSize"),
  "storageKey" = COALESCE("storageKey", "fileUrl")
WHERE "originalFileName" IS NULL
   OR "displayFileName" IS NULL
   OR "originalFileSize" IS NULL
   OR "storageKey" IS NULL;

INSERT INTO "SiteSetting" ("key", "value", "updatedAt")
VALUES ('applicant_submission_deadline', '2026-08-05T23:59:59.000-07:00', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

CREATE UNIQUE INDEX IF NOT EXISTS "Account_setupTokenHash_key" ON "Account"("setupTokenHash");
CREATE INDEX IF NOT EXISTS "Account_role_status_idx" ON "Account"("role", "status");
CREATE INDEX IF NOT EXISTS "Account_deletedAt_idx" ON "Account"("deletedAt");

CREATE INDEX IF NOT EXISTS "ApplicantProfile_deadlineOverrideAt_idx" ON "ApplicantProfile"("deadlineOverrideAt");
CREATE INDEX IF NOT EXISTS "ApplicantProfile_deletedAt_idx" ON "ApplicantProfile"("deletedAt");

CREATE INDEX IF NOT EXISTS "Payment_applicantProfileId_status_idx" ON "Payment"("applicantProfileId", "status");
CREATE INDEX IF NOT EXISTS "Payment_applicantEmail_idx" ON "Payment"("applicantEmail");
CREATE INDEX IF NOT EXISTS "Payment_source_status_idx" ON "Payment"("source", "status");

CREATE UNIQUE INDEX IF NOT EXISTS "NominationApplication_applicantProfileId_awardId_key"
  ON "NominationApplication"("applicantProfileId", "awardId");
CREATE INDEX IF NOT EXISTS "NominationApplication_purchasePaymentId_idx" ON "NominationApplication"("purchasePaymentId");
CREATE INDEX IF NOT EXISTS "NominationApplication_awardId_idx" ON "NominationApplication"("awardId");
CREATE INDEX IF NOT EXISTS "NominationApplication_status_idx" ON "NominationApplication"("status");
CREATE INDEX IF NOT EXISTS "NominationApplication_submittedAt_idx" ON "NominationApplication"("submittedAt");
CREATE INDEX IF NOT EXISTS "NominationApplication_deletedAt_idx" ON "NominationApplication"("deletedAt");

CREATE INDEX IF NOT EXISTS "NominationFile_fieldKey_idx" ON "NominationFile"("fieldKey");
CREATE INDEX IF NOT EXISTS "NominationFile_deletedAt_idx" ON "NominationFile"("deletedAt");

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_applicantProfileId_fkey"
  FOREIGN KEY ("applicantProfileId") REFERENCES "ApplicantProfile"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "NominationApplication"
  ADD CONSTRAINT "NominationApplication_purchasePaymentId_fkey"
  FOREIGN KEY ("purchasePaymentId") REFERENCES "Payment"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
