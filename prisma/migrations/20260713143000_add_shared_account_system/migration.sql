-- Shared account and nomination ownership model.

-- CreateEnum
CREATE TYPE "AccountRole" AS ENUM ('APPLICANT', 'JURY');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('INVITED', 'ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "AccountSetupTokenPurpose" AS ENUM ('SETUP', 'PASSWORD_RESET');

-- CreateEnum
CREATE TYPE "NominationStatus" AS ENUM ('PAYMENT_PENDING', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'SCORED', 'WITHDRAWN', 'REJECTED', 'LOCKED');

-- CreateEnum
CREATE TYPE "JuryReviewStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'LOCKED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "AccountRole" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'INVITED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantProfile" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT,
    "stateProvince" TEXT,
    "city" TEXT,
    "professionalTitle" TEXT,
    "yearsExperience" INTEGER,
    "membershipNumber" TEXT,
    "membershipLevel" TEXT,
    "websiteUrl" TEXT,
    "socialUrl" TEXT,
    "reviewsUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JuryProfile" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "juryApplicationId" TEXT,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT,
    "city" TEXT,
    "professionalTitle" TEXT,
    "yearsExperience" INTEGER,
    "employerAffiliation" TEXT,
    "expertiseAreas" TEXT[],
    "professionalBio" TEXT,
    "professionalWebsite" TEXT,
    "approvalStatus" "JuryApplicationStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JuryProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountSetupToken" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "purpose" "AccountSetupTokenPurpose" NOT NULL DEFAULT 'SETUP',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountSetupToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JuryNominationReview" (
    "id" TEXT NOT NULL,
    "nominationId" TEXT NOT NULL,
    "juryProfileId" TEXT NOT NULL,
    "status" "JuryReviewStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "scoreData" JSONB,
    "totalScore" DECIMAL(65,30),
    "notes" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JuryNominationReview_pkey" PRIMARY KEY ("id")
);

-- Create uniqueness needed by the backfill ON CONFLICT clauses.
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
CREATE UNIQUE INDEX "ApplicantProfile_accountId_key" ON "ApplicantProfile"("accountId");
CREATE UNIQUE INDEX "JuryProfile_accountId_key" ON "JuryProfile"("accountId");
CREATE UNIQUE INDEX "JuryProfile_juryApplicationId_key" ON "JuryProfile"("juryApplicationId");
CREATE UNIQUE INDEX "JuryNominationReview_nominationId_juryProfileId_key" ON "JuryNominationReview"("nominationId", "juryProfileId");

-- AlterTable
ALTER TABLE "NominationApplication"
ADD COLUMN "applicantProfileId" TEXT,
ADD COLUMN "status" "NominationStatus" NOT NULL DEFAULT 'PAYMENT_PENDING',
ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "amount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'usd',
ADD COLUMN "paidAt" TIMESTAMP(3),
ADD COLUMN "submittedAt" TIMESTAMP(3),
ADD COLUMN "lockedAt" TIMESTAMP(3),
ADD COLUMN "scoresReleasedAt" TIMESTAMP(3),
ADD COLUMN "stripeCheckoutSessionId" TEXT,
ADD COLUMN "stripePaymentIntentId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "nominationApplicationId" TEXT;

-- AlterTable
ALTER TABLE "JudgeScore" ADD COLUMN "juryProfileId" TEXT;

-- AlterTable
ALTER TABLE "Ticket"
ADD COLUMN "accountId" TEXT,
ADD COLUMN "applicantProfileId" TEXT;

-- Backfill jury accounts first so applicant conflicts are explicit.
INSERT INTO "Account" ("id", "email", "passwordHash", "role", "status", "createdAt", "updatedAt")
SELECT
  'acct_' || md5(lower(trim(ja."email")) || ':jury'),
  lower(trim(ja."email")),
  ja."passwordHash",
  'JURY',
  'ACTIVE',
  ja."createdAt",
  ja."updatedAt"
FROM "JuryAccount" ja
ON CONFLICT ("email") DO NOTHING;

-- Create invited accounts for paid jury applications that never completed old registration.
INSERT INTO "Account" ("id", "email", "role", "status", "createdAt", "updatedAt")
SELECT
  'acct_' || md5(lower(trim(j."email")) || ':jury'),
  lower(trim(j."email")),
  'JURY',
  'INVITED',
  j."createdAt",
  j."updatedAt"
FROM "JuryApplication" j
WHERE j."paymentStatus" = 'PAID'
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "JuryProfile" (
  "id", "accountId", "juryApplicationId", "fullName", "phone", "country", "city",
  "professionalTitle", "yearsExperience", "employerAffiliation", "expertiseAreas",
  "professionalBio", "professionalWebsite", "approvalStatus", "createdAt", "updatedAt"
)
SELECT
  'jprof_' || md5(j."id"),
  a."id",
  j."id",
  j."fullName",
  j."phone",
  j."country",
  j."city",
  j."professionalTitle",
  j."yearsExperience",
  j."employerAffiliation",
  j."expertiseAreas",
  j."professionalBio",
  j."professionalWebsite",
  j."status",
  j."createdAt",
  j."updatedAt"
FROM "JuryApplication" j
JOIN "Account" a ON a."email" = lower(trim(j."email")) AND a."role" = 'JURY'
ON CONFLICT ("juryApplicationId") DO NOTHING;

-- Applicant accounts are only created when the normalized email is not already a jury account.
WITH applicant_emails AS (
  SELECT lower(trim("email")) AS email, min("createdAt") AS first_created, max("updatedAt") AS last_updated
  FROM "Application"
  WHERE trim("email") <> ''
  GROUP BY lower(trim("email"))
)
INSERT INTO "Account" ("id", "email", "role", "status", "createdAt", "updatedAt")
SELECT
  'acct_' || md5(ae.email || ':applicant'),
  ae.email,
  'APPLICANT',
  'INVITED',
  ae.first_created,
  ae.last_updated
FROM applicant_emails ae
WHERE NOT EXISTS (SELECT 1 FROM "Account" existing WHERE existing."email" = ae.email)
ON CONFLICT ("email") DO NOTHING;

WITH latest_application AS (
  SELECT DISTINCT ON (lower(trim("email")))
    lower(trim("email")) AS email,
    "fullName",
    "phone",
    "country",
    "stateProvince",
    "city",
    "professionalTitle",
    "yearsExperience",
    "membershipNumber",
    "membershipLevel",
    "websiteUrl",
    "socialUrl",
    "reviewsUrl",
    "createdAt",
    "updatedAt"
  FROM "Application"
  WHERE trim("email") <> ''
  ORDER BY lower(trim("email")), "updatedAt" DESC, "createdAt" DESC
)
INSERT INTO "ApplicantProfile" (
  "id", "accountId", "fullName", "phone", "country", "stateProvince", "city",
  "professionalTitle", "yearsExperience", "membershipNumber", "membershipLevel",
  "websiteUrl", "socialUrl", "reviewsUrl", "createdAt", "updatedAt"
)
SELECT
  'aprof_' || md5(la.email),
  a."id",
  la."fullName",
  la."phone",
  la."country",
  la."stateProvince",
  la."city",
  la."professionalTitle",
  la."yearsExperience",
  la."membershipNumber",
  la."membershipLevel",
  la."websiteUrl",
  la."socialUrl",
  la."reviewsUrl",
  la."createdAt",
  la."updatedAt"
FROM latest_application la
JOIN "Account" a ON a."email" = la.email AND a."role" = 'APPLICANT'
ON CONFLICT ("accountId") DO NOTHING;

UPDATE "NominationApplication" n
SET
  "applicantProfileId" = ap."id",
  "status" = CASE
    WHEN app."paymentStatus" <> 'PAID' THEN 'PAYMENT_PENDING'::"NominationStatus"
    WHEN app."status" = 'UNDER_REVIEW' THEN 'UNDER_REVIEW'::"NominationStatus"
    WHEN app."status" = 'REJECTED' THEN 'REJECTED'::"NominationStatus"
    WHEN app."status" = 'SUBMITTED' THEN 'SUBMITTED'::"NominationStatus"
    ELSE 'DRAFT'::"NominationStatus"
  END,
  "paymentStatus" = app."paymentStatus",
  "amount" = CASE
    WHEN counts.nomination_count > 0 THEN floor(app."amount"::numeric / counts.nomination_count)::integer
    ELSE app."amount"
  END,
  "currency" = app."currency",
  "paidAt" = app."paidAt",
  "submittedAt" = app."submittedAt",
  "stripeCheckoutSessionId" = app."stripeCheckoutSessionId",
  "stripePaymentIntentId" = app."stripePaymentIntentId"
FROM "Application" app
JOIN (
  SELECT "applicationId", count(*)::integer AS nomination_count
  FROM "NominationApplication"
  GROUP BY "applicationId"
) counts ON counts."applicationId" = app."id"
LEFT JOIN "ApplicantProfile" ap ON ap."accountId" = (
  SELECT a."id"
  FROM "Account" a
  WHERE a."email" = lower(trim(app."email")) AND a."role" = 'APPLICANT'
  LIMIT 1
)
WHERE n."applicationId" = app."id";

UPDATE "Payment" p
SET "nominationApplicationId" = one_nom."id"
FROM (
  SELECT "applicationId", min("id") AS id
  FROM "NominationApplication"
  GROUP BY "applicationId"
  HAVING count(*) = 1
) one_nom
WHERE p."applicationId" = one_nom."applicationId";

UPDATE "JudgeScore" js
SET "juryProfileId" = jp."id"
FROM "JuryProfile" jp
WHERE js."judgeId" = jp."juryApplicationId";

INSERT INTO "JuryNominationReview" (
  "id", "nominationId", "juryProfileId", "status", "scoreData", "totalScore",
  "notes", "startedAt", "completedAt", "createdAt", "updatedAt"
)
SELECT
  'jrev_' || md5(js."id"),
  js."nominationApplicationId",
  js."juryProfileId",
  CASE
    WHEN js."status" = 'SUBMITTED' THEN 'COMPLETED'::"JuryReviewStatus"
    ELSE 'IN_PROGRESS'::"JuryReviewStatus"
  END,
  jsonb_build_object(
    'technical', js."technical",
    'aesthetic', js."aesthetic",
    'creativity', js."creativity",
    'impact', js."impact",
    'presentation', js."presentation"
  ),
  js."totalScore",
  js."comment",
  js."createdAt",
  js."submittedAt",
  js."createdAt",
  js."updatedAt"
FROM "JudgeScore" js
WHERE js."nominationApplicationId" IS NOT NULL
  AND js."juryProfileId" IS NOT NULL
ON CONFLICT ("nominationId", "juryProfileId") DO NOTHING;

UPDATE "Ticket" t
SET
  "accountId" = ap."accountId",
  "applicantProfileId" = ap."id"
FROM "ApplicantProfile" ap
JOIN "Account" a ON a."id" = ap."accountId"
WHERE lower(trim(t."email")) = a."email";

-- CreateIndex
CREATE INDEX "ApplicantProfile_fullName_idx" ON "ApplicantProfile"("fullName");
CREATE INDEX "JuryProfile_approvalStatus_idx" ON "JuryProfile"("approvalStatus");
CREATE UNIQUE INDEX "AccountSetupToken_tokenHash_key" ON "AccountSetupToken"("tokenHash");
CREATE INDEX "AccountSetupToken_accountId_purpose_usedAt_idx" ON "AccountSetupToken"("accountId", "purpose", "usedAt");
CREATE INDEX "AccountSetupToken_expiresAt_idx" ON "AccountSetupToken"("expiresAt");
CREATE INDEX "Payment_nominationApplicationId_idx" ON "Payment"("nominationApplicationId");
CREATE INDEX "JudgeScore_nominationApplicationId_juryProfileId_idx" ON "JudgeScore"("nominationApplicationId", "juryProfileId");
CREATE INDEX "JudgeScore_juryProfileId_idx" ON "JudgeScore"("juryProfileId");
CREATE INDEX "NominationApplication_applicantProfileId_createdAt_idx" ON "NominationApplication"("applicantProfileId", "createdAt");
CREATE INDEX "NominationApplication_categoryId_status_paymentStatus_idx" ON "NominationApplication"("categoryId", "status", "paymentStatus");
CREATE INDEX "JuryNominationReview_juryProfileId_status_idx" ON "JuryNominationReview"("juryProfileId", "status");
CREATE INDEX "JuryNominationReview_nominationId_idx" ON "JuryNominationReview"("nominationId");
CREATE INDEX "Ticket_accountId_idx" ON "Ticket"("accountId");
CREATE INDEX "Ticket_applicantProfileId_idx" ON "Ticket"("applicantProfileId");
CREATE INDEX "Ticket_email_idx" ON "Ticket"("email");

-- AddForeignKey
ALTER TABLE "ApplicantProfile" ADD CONSTRAINT "ApplicantProfile_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JuryProfile" ADD CONSTRAINT "JuryProfile_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JuryProfile" ADD CONSTRAINT "JuryProfile_juryApplicationId_fkey" FOREIGN KEY ("juryApplicationId") REFERENCES "JuryApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AccountSetupToken" ADD CONSTRAINT "AccountSetupToken_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NominationApplication" ADD CONSTRAINT "NominationApplication_applicantProfileId_fkey" FOREIGN KEY ("applicantProfileId") REFERENCES "ApplicantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_nominationApplicationId_fkey" FOREIGN KEY ("nominationApplicationId") REFERENCES "NominationApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JudgeScore" ADD CONSTRAINT "JudgeScore_juryProfileId_fkey" FOREIGN KEY ("juryProfileId") REFERENCES "JuryProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JuryNominationReview" ADD CONSTRAINT "JuryNominationReview_nominationId_fkey" FOREIGN KEY ("nominationId") REFERENCES "NominationApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JuryNominationReview" ADD CONSTRAINT "JuryNominationReview_juryProfileId_fkey" FOREIGN KEY ("juryProfileId") REFERENCES "JuryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_applicantProfileId_fkey" FOREIGN KEY ("applicantProfileId") REFERENCES "ApplicantProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- The shared Account table is now the authentication source.
DROP TABLE "JuryPasswordReset";
DROP TABLE "JuryAccount";
