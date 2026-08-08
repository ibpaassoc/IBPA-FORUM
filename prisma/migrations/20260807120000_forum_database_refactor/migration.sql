-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "forum_next";

-- CreateEnum
CREATE TYPE "forum_next"."DataScope" AS ENUM ('PRODUCTION', 'TEST', 'DEV');

-- CreateEnum
CREATE TYPE "forum_next"."AccountRole" AS ENUM ('APPLICANT', 'JURY');

-- CreateEnum
CREATE TYPE "forum_next"."AccountStatus" AS ENUM ('INVITED', 'ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "forum_next"."AccountSetupTokenPurpose" AS ENUM ('SETUP', 'PASSWORD_RESET');

-- CreateEnum
CREATE TYPE "forum_next"."NominationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'RETURNED_FOR_CHANGES', 'UNDER_REVIEW', 'SCORED', 'WITHDRAWN', 'REJECTED', 'LOCKED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "forum_next"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "forum_next"."PaymentPurchaseType" AS ENUM ('NOMINATION', 'JURY', 'TICKET');

-- CreateEnum
CREATE TYPE "forum_next"."PaymentProvider" AS ENUM ('STRIPE', 'MANUAL');

-- CreateEnum
CREATE TYPE "forum_next"."JuryApplicationStatus" AS ENUM ('SUBMITTED', 'ADDITIONAL_INFO_REQUIRED', 'APPROVED', 'REJECTED', 'PAID');

-- CreateEnum
CREATE TYPE "forum_next"."JuryReviewStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'LOCKED');

-- CreateEnum
CREATE TYPE "forum_next"."TicketKind" AS ENUM ('FORUM', 'APPLICANT', 'JURY');

-- CreateEnum
CREATE TYPE "forum_next"."TicketType" AS ENUM ('ONE_DAY', 'TWO_DAYS');

-- CreateEnum
CREATE TYPE "forum_next"."TicketStatus" AS ENUM ('PENDING', 'PAID', 'CANCELED', 'CHECKED_ONE_DAY', 'CHECKED_TWO_DAY', 'CHECKED_GALA_DINNER');

-- CreateEnum
CREATE TYPE "forum_next"."StripeWebhookState" AS ENUM ('RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "forum_next"."TestStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CLEANED', 'FAILED');

-- CreateTable
CREATE TABLE "forum_next"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_next"."Award" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_next"."Account" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "normalizedEmail" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "forum_next"."AccountRole" NOT NULL,
    "status" "forum_next"."AccountStatus" NOT NULL DEFAULT 'INVITED',
    "setupTokenHash" TEXT,
    "setupTokenPurpose" "forum_next"."AccountSetupTokenPurpose",
    "setupTokenExpiresAt" TIMESTAMP(3),
    "setupTokenIssuedAt" TIMESTAMP(3),
    "setupTokenUsedAt" TIMESTAMP(3),
    "lastSetupEmailSentAt" TIMESTAMP(3),
    "lastSetupEmailDeliveryStatus" TEXT,
    "lastSetupEmailDeliveryError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dataScope" "forum_next"."DataScope" NOT NULL DEFAULT 'PRODUCTION',

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_next"."ApplicantProfile" (
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
    "preferredLocale" TEXT NOT NULL DEFAULT 'en',
    "websiteUrl" TEXT,
    "socialUrl" TEXT,
    "reviewsUrl" TEXT,
    "deadlineOverrideAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dataScope" "forum_next"."DataScope" NOT NULL DEFAULT 'PRODUCTION',

    CONSTRAINT "ApplicantProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_next"."JuryApplication" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "professionalTitle" TEXT NOT NULL,
    "yearsExperience" INTEGER NOT NULL,
    "employerAffiliation" TEXT NOT NULL,
    "membershipStatus" TEXT,
    "membershipLevel" TEXT,
    "previousJudgingExperience" BOOLEAN NOT NULL,
    "previousJudgingDetails" TEXT,
    "pastWinner" BOOLEAN NOT NULL DEFAULT false,
    "pastWinnerYear" INTEGER,
    "expertiseAreas" TEXT[],
    "professionalBio" TEXT NOT NULL,
    "professionalWebsite" TEXT,
    "conflictDisclosure" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "ibpaAssociationMember" BOOLEAN NOT NULL DEFAULT false,
    "ibpaNumber" TEXT,
    "status" "forum_next"."JuryApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "informationRequestTokenHash" TEXT,
    "informationRequestTokenExpiresAt" TIMESTAMP(3),
    "informationRequests" JSONB NOT NULL,
    "files" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dataScope" "forum_next"."DataScope" NOT NULL DEFAULT 'PRODUCTION',

    CONSTRAINT "JuryApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_next"."JuryProfile" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "juryApplicationId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT,
    "city" TEXT,
    "professionalTitle" TEXT,
    "yearsExperience" INTEGER,
    "employerAffiliation" TEXT,
    "expertiseAreas" TEXT[],
    "approvedCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "professionalBio" TEXT,
    "professionalWebsite" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dataScope" "forum_next"."DataScope" NOT NULL DEFAULT 'PRODUCTION',

    CONSTRAINT "JuryProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_next"."Nomination" (
    "id" TEXT NOT NULL,
    "applicantProfileId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "awardId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "status" "forum_next"."NominationStatus" NOT NULL DEFAULT 'DRAFT',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "answers" JSONB NOT NULL,
    "files" JSONB NOT NULL,
    "scoringSchema" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "scoresReleasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dataScope" "forum_next"."DataScope" NOT NULL DEFAULT 'PRODUCTION',

    CONSTRAINT "Nomination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_next"."JuryNominationReview" (
    "id" TEXT NOT NULL,
    "nominationId" TEXT NOT NULL,
    "juryProfileId" TEXT NOT NULL,
    "status" "forum_next"."JuryReviewStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "scoreData" JSONB,
    "totalScore" DECIMAL(65,30),
    "comments" TEXT,
    "startedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dataScope" "forum_next"."DataScope" NOT NULL DEFAULT 'PRODUCTION',

    CONSTRAINT "JuryNominationReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_next"."Payment" (
    "id" TEXT NOT NULL,
    "accountId" TEXT,
    "juryApplicationId" TEXT,
    "customerEmail" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "forum_next"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "purchaseType" "forum_next"."PaymentPurchaseType" NOT NULL,
    "provider" "forum_next"."PaymentProvider" NOT NULL,
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeCustomerId" TEXT,
    "pricingSnapshot" JSONB,
    "promotionSnapshot" JSONB,
    "refundSnapshot" JSONB,
    "paidAt" TIMESTAMP(3),
    "fulfilledAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dataScope" "forum_next"."DataScope" NOT NULL DEFAULT 'PRODUCTION',

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_next"."Ticket" (
    "id" TEXT NOT NULL,
    "accountId" TEXT,
    "applicantProfileId" TEXT,
    "paymentId" TEXT,
    "kind" "forum_next"."TicketKind" NOT NULL DEFAULT 'FORUM',
    "secureToken" TEXT NOT NULL,
    "credential" JSONB NOT NULL,
    "activity" JSONB NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "instagram" TEXT,
    "type" "forum_next"."TicketType",
    "galaDinner" BOOLEAN NOT NULL DEFAULT false,
    "isIbpaMember" BOOLEAN NOT NULL DEFAULT false,
    "ibpaCertNumber" TEXT,
    "specialPacketId" TEXT,
    "specialPacketPosition" INTEGER,
    "status" "forum_next"."TicketStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "lastCheckIn" TIMESTAMP(3),
    "forumCheckInAt" TIMESTAMP(3),
    "dayOneCheckInAt" TIMESTAMP(3),
    "dayTwoCheckInAt" TIMESTAMP(3),
    "galaCheckInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dataScope" "forum_next"."DataScope" NOT NULL DEFAULT 'PRODUCTION',

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_next"."StripeWebhook" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "state" "forum_next"."StripeWebhookState" NOT NULL DEFAULT 'RECEIVED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAttemptAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "StripeWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_next"."SiteSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "forum_next"."Test" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "description" TEXT,
    "status" "forum_next"."TestStatus" NOT NULL DEFAULT 'ACTIVE',
    "configuration" JSONB NOT NULL,
    "createdRecords" JSONB NOT NULL,
    "auditEvents" JSONB NOT NULL,
    "emailDeliveries" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "forum_next"."Category"("slug");

-- CreateIndex
CREATE INDEX "Award_categoryId_idx" ON "forum_next"."Award"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Award_categoryId_name_key" ON "forum_next"."Award"("categoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Account_setupTokenHash_key" ON "forum_next"."Account"("setupTokenHash");

-- CreateIndex
CREATE INDEX "Account_role_status_idx" ON "forum_next"."Account"("role", "status");

-- CreateIndex
CREATE INDEX "Account_normalizedEmail_idx" ON "forum_next"."Account"("normalizedEmail");

-- CreateIndex
CREATE INDEX "Account_dataScope_role_status_idx" ON "forum_next"."Account"("dataScope", "role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Account_normalizedEmail_role_key" ON "forum_next"."Account"("normalizedEmail", "role");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantProfile_accountId_key" ON "forum_next"."ApplicantProfile"("accountId");

-- CreateIndex
CREATE INDEX "ApplicantProfile_fullName_idx" ON "forum_next"."ApplicantProfile"("fullName");

-- CreateIndex
CREATE INDEX "ApplicantProfile_deadlineOverrideAt_idx" ON "forum_next"."ApplicantProfile"("deadlineOverrideAt");

-- CreateIndex
CREATE INDEX "ApplicantProfile_dataScope_createdAt_idx" ON "forum_next"."ApplicantProfile"("dataScope", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "JuryApplication_accountId_key" ON "forum_next"."JuryApplication"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "JuryApplication_informationRequestTokenHash_key" ON "forum_next"."JuryApplication"("informationRequestTokenHash");

-- CreateIndex
CREATE INDEX "JuryApplication_dataScope_status_idx" ON "forum_next"."JuryApplication"("dataScope", "status");

-- CreateIndex
CREATE INDEX "JuryApplication_email_idx" ON "forum_next"."JuryApplication"("email");

-- CreateIndex
CREATE UNIQUE INDEX "JuryProfile_accountId_key" ON "forum_next"."JuryProfile"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "JuryProfile_juryApplicationId_key" ON "forum_next"."JuryProfile"("juryApplicationId");

-- CreateIndex
CREATE INDEX "JuryProfile_dataScope_createdAt_idx" ON "forum_next"."JuryProfile"("dataScope", "createdAt");

-- CreateIndex
CREATE INDEX "Nomination_applicantProfileId_createdAt_idx" ON "forum_next"."Nomination"("applicantProfileId", "createdAt");

-- CreateIndex
CREATE INDEX "Nomination_paymentId_idx" ON "forum_next"."Nomination"("paymentId");

-- CreateIndex
CREATE INDEX "Nomination_awardId_idx" ON "forum_next"."Nomination"("awardId");

-- CreateIndex
CREATE INDEX "Nomination_categoryId_idx" ON "forum_next"."Nomination"("categoryId");

-- CreateIndex
CREATE INDEX "Nomination_status_idx" ON "forum_next"."Nomination"("status");

-- CreateIndex
CREATE INDEX "Nomination_submittedAt_idx" ON "forum_next"."Nomination"("submittedAt");

-- CreateIndex
CREATE INDEX "Nomination_dataScope_status_idx" ON "forum_next"."Nomination"("dataScope", "status");

-- CreateIndex
CREATE INDEX "JuryNominationReview_juryProfileId_status_idx" ON "forum_next"."JuryNominationReview"("juryProfileId", "status");

-- CreateIndex
CREATE INDEX "JuryNominationReview_nominationId_idx" ON "forum_next"."JuryNominationReview"("nominationId");

-- CreateIndex
CREATE INDEX "JuryNominationReview_dataScope_status_idx" ON "forum_next"."JuryNominationReview"("dataScope", "status");

-- CreateIndex
CREATE UNIQUE INDEX "JuryNominationReview_nominationId_juryProfileId_key" ON "forum_next"."JuryNominationReview"("nominationId", "juryProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripeCheckoutSessionId_key" ON "forum_next"."Payment"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "forum_next"."Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Payment_accountId_status_idx" ON "forum_next"."Payment"("accountId", "status");

-- CreateIndex
CREATE INDEX "Payment_customerEmail_idx" ON "forum_next"."Payment"("customerEmail");

-- CreateIndex
CREATE INDEX "Payment_purchaseType_status_idx" ON "forum_next"."Payment"("purchaseType", "status");

-- CreateIndex
CREATE INDEX "Payment_juryApplicationId_idx" ON "forum_next"."Payment"("juryApplicationId");

-- CreateIndex
CREATE INDEX "Payment_dataScope_purchaseType_status_idx" ON "forum_next"."Payment"("dataScope", "purchaseType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_secureToken_key" ON "forum_next"."Ticket"("secureToken");

-- CreateIndex
CREATE INDEX "Ticket_accountId_idx" ON "forum_next"."Ticket"("accountId");

-- CreateIndex
CREATE INDEX "Ticket_applicantProfileId_idx" ON "forum_next"."Ticket"("applicantProfileId");

-- CreateIndex
CREATE INDEX "Ticket_paymentId_idx" ON "forum_next"."Ticket"("paymentId");

-- CreateIndex
CREATE INDEX "Ticket_email_idx" ON "forum_next"."Ticket"("email");

-- CreateIndex
CREATE INDEX "Ticket_specialPacketId_idx" ON "forum_next"."Ticket"("specialPacketId");

-- CreateIndex
CREATE INDEX "Ticket_kind_status_idx" ON "forum_next"."Ticket"("kind", "status");

-- CreateIndex
CREATE INDEX "Ticket_dataScope_status_createdAt_idx" ON "forum_next"."Ticket"("dataScope", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StripeWebhook_eventId_key" ON "forum_next"."StripeWebhook"("eventId");

-- CreateIndex
CREATE INDEX "StripeWebhook_state_createdAt_idx" ON "forum_next"."StripeWebhook"("state", "createdAt");

-- CreateIndex
CREATE INDEX "StripeWebhook_paymentId_idx" ON "forum_next"."StripeWebhook"("paymentId");

-- CreateIndex
CREATE INDEX "Test_kind_createdAt_idx" ON "forum_next"."Test"("kind", "createdAt");

-- CreateIndex
CREATE INDEX "Test_status_createdAt_idx" ON "forum_next"."Test"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "forum_next"."Award" ADD CONSTRAINT "Award_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "forum_next"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_next"."ApplicantProfile" ADD CONSTRAINT "ApplicantProfile_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "forum_next"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_next"."JuryApplication" ADD CONSTRAINT "JuryApplication_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "forum_next"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_next"."JuryProfile" ADD CONSTRAINT "JuryProfile_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "forum_next"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_next"."JuryProfile" ADD CONSTRAINT "JuryProfile_juryApplicationId_fkey" FOREIGN KEY ("juryApplicationId") REFERENCES "forum_next"."JuryApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_next"."Nomination" ADD CONSTRAINT "Nomination_applicantProfileId_fkey" FOREIGN KEY ("applicantProfileId") REFERENCES "forum_next"."ApplicantProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_next"."Nomination" ADD CONSTRAINT "Nomination_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "forum_next"."Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_next"."Nomination" ADD CONSTRAINT "Nomination_awardId_fkey" FOREIGN KEY ("awardId") REFERENCES "forum_next"."Award"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_next"."Nomination" ADD CONSTRAINT "Nomination_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "forum_next"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_next"."JuryNominationReview" ADD CONSTRAINT "JuryNominationReview_nominationId_fkey" FOREIGN KEY ("nominationId") REFERENCES "forum_next"."Nomination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_next"."JuryNominationReview" ADD CONSTRAINT "JuryNominationReview_juryProfileId_fkey" FOREIGN KEY ("juryProfileId") REFERENCES "forum_next"."JuryProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_next"."Payment" ADD CONSTRAINT "Payment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "forum_next"."Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_next"."Payment" ADD CONSTRAINT "Payment_juryApplicationId_fkey" FOREIGN KEY ("juryApplicationId") REFERENCES "forum_next"."JuryApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_next"."Ticket" ADD CONSTRAINT "Ticket_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "forum_next"."Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_next"."Ticket" ADD CONSTRAINT "Ticket_applicantProfileId_fkey" FOREIGN KEY ("applicantProfileId") REFERENCES "forum_next"."ApplicantProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_next"."Ticket" ADD CONSTRAINT "Ticket_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "forum_next"."Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_next"."StripeWebhook" ADD CONSTRAINT "StripeWebhook_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "forum_next"."Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Domain constraints Prisma cannot express. Keep these schema-qualified so the
-- migration is safe to run beside the untouched legacy public schema.
ALTER TABLE "forum_next"."Nomination"
  ADD CONSTRAINT "Nomination_revision_positive" CHECK ("revision" > 0),
  ADD CONSTRAINT "Nomination_answers_shape" CHECK (
    jsonb_typeof("answers") = 'object'
    AND "answers"->>'schemaVersion' = '1'
    AND jsonb_typeof("answers"->'fields') = 'array'
  ),
  ADD CONSTRAINT "Nomination_files_shape" CHECK (
    jsonb_typeof("files") = 'object'
    AND "files"->>'schemaVersion' = '1'
    AND jsonb_typeof("files"->'items') = 'array'
  );

CREATE UNIQUE INDEX "Nomination_active_owner_award_key"
  ON "forum_next"."Nomination" ("applicantProfileId", "awardId")
  WHERE "status" <> 'ARCHIVED';

ALTER TABLE "forum_next"."JuryApplication"
  ADD CONSTRAINT "JuryApplication_information_requests_shape" CHECK (
    jsonb_typeof("informationRequests") = 'object'
    AND "informationRequests"->>'schemaVersion' = '1'
    AND jsonb_typeof("informationRequests"->'requests') = 'array'
  ),
  ADD CONSTRAINT "JuryApplication_files_shape" CHECK (
    jsonb_typeof("files") = 'object'
    AND "files"->>'schemaVersion' = '1'
    AND jsonb_typeof("files"->'items') = 'array'
  );

ALTER TABLE "forum_next"."Payment"
  ADD CONSTRAINT "Payment_amount_nonnegative" CHECK ("amount" >= 0),
  ADD CONSTRAINT "Payment_currency_iso_length" CHECK (char_length("currency") = 3),
  ADD CONSTRAINT "Payment_purchase_owner_shape" CHECK (
    ("purchaseType" = 'JURY' AND "juryApplicationId" IS NOT NULL)
    OR ("purchaseType" IN ('NOMINATION', 'TICKET') AND "juryApplicationId" IS NULL)
  ),
  ADD CONSTRAINT "Payment_manual_has_no_stripe_ids" CHECK (
    "provider" = 'STRIPE'
    OR (
      "stripeCheckoutSessionId" IS NULL
      AND "stripePaymentIntentId" IS NULL
      AND "stripeCustomerId" IS NULL
    )
  );

ALTER TABLE "forum_next"."Ticket"
  ADD CONSTRAINT "Ticket_revision_positive" CHECK ("revision" > 0),
  ADD CONSTRAINT "Ticket_forum_type_required" CHECK ("kind" <> 'FORUM' OR "type" IS NOT NULL),
  ADD CONSTRAINT "Ticket_credential_shape" CHECK (
    jsonb_typeof("credential") = 'object'
    AND "credential"->>'schemaVersion' = '1'
    AND jsonb_typeof("credential"->'history') = 'array'
  ),
  ADD CONSTRAINT "Ticket_activity_shape" CHECK (
    jsonb_typeof("activity") = 'object'
    AND "activity"->>'schemaVersion' = '1'
    AND jsonb_typeof("activity"->'events') = 'array'
  );

CREATE UNIQUE INDEX "Ticket_applicant_profile_key"
  ON "forum_next"."Ticket" ("applicantProfileId")
  WHERE "kind" = 'APPLICANT' AND "applicantProfileId" IS NOT NULL;

CREATE INDEX "Ticket_normalized_email_idx"
  ON "forum_next"."Ticket" (lower(trim("email")));

ALTER TABLE "forum_next"."StripeWebhook"
  ADD CONSTRAINT "StripeWebhook_attempts_nonnegative" CHECK ("attempts" >= 0),
  ADD CONSTRAINT "StripeWebhook_processed_state_shape" CHECK (
    ("state" = 'PROCESSED' AND "processedAt" IS NOT NULL AND "error" IS NULL)
    OR "state" <> 'PROCESSED'
  );

ALTER TABLE "forum_next"."Test"
  ADD CONSTRAINT "Test_configuration_shape" CHECK (jsonb_typeof("configuration") = 'object'),
  ADD CONSTRAINT "Test_created_records_shape" CHECK (
    jsonb_typeof("createdRecords") = 'object'
    AND "createdRecords"->>'schemaVersion' = '1'
    AND jsonb_typeof("createdRecords"->'accounts') = 'array'
    AND jsonb_typeof("createdRecords"->'applicantProfiles') = 'array'
    AND jsonb_typeof("createdRecords"->'juryApplications') = 'array'
    AND jsonb_typeof("createdRecords"->'juryProfiles') = 'array'
    AND jsonb_typeof("createdRecords"->'nominations') = 'array'
    AND jsonb_typeof("createdRecords"->'reviews') = 'array'
    AND jsonb_typeof("createdRecords"->'tickets') = 'array'
    AND jsonb_typeof("createdRecords"->'payments') = 'array'
    AND jsonb_typeof("createdRecords"->'webhookEvents') = 'array'
    AND jsonb_typeof("createdRecords"->'blobKeys') = 'array'
  ),
  ADD CONSTRAINT "Test_audit_events_shape" CHECK (
    jsonb_typeof("auditEvents") = 'object'
    AND "auditEvents"->>'schemaVersion' = '1'
    AND jsonb_typeof("auditEvents"->'events') = 'array'
  ),
  ADD CONSTRAINT "Test_email_deliveries_shape" CHECK (
    jsonb_typeof("emailDeliveries") = 'object'
    AND "emailDeliveries"->>'schemaVersion' = '1'
    AND jsonb_typeof("emailDeliveries"->'deliveries') = 'array'
  );
