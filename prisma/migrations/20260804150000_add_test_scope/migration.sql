DO $$
BEGIN
  CREATE TYPE "DataScope" AS ENUM ('PRODUCTION', 'TEST');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "AccountSetupTokenPurpose" AS ENUM ('SETUP', 'PASSWORD_RESET');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- These two tables belong to earlier account migrations. Creating them when
-- absent makes this migration safe for databases whose migration ledger drifted
-- while their application schema was advanced manually.
CREATE TABLE IF NOT EXISTS "ApplicantCheckInCredential" (
  "token" TEXT NOT NULL,
  "applicantProfileId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION',
  "testScenarioId" TEXT,
  CONSTRAINT "ApplicantCheckInCredential_pkey" PRIMARY KEY ("token"),
  CONSTRAINT "ApplicantCheckInCredential_applicantProfileId_fkey"
    FOREIGN KEY ("applicantProfileId") REFERENCES "ApplicantProfile"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "AccountSetupToken" (
  "id" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "purpose" "AccountSetupTokenPurpose" NOT NULL DEFAULT 'SETUP',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION',
  "testScenarioId" TEXT,
  CONSTRAINT "AccountSetupToken_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AccountSetupToken_accountId_fkey"
    FOREIGN KEY ("accountId") REFERENCES "Account"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE IF EXISTS "Account" ADD COLUMN IF NOT EXISTS "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN IF NOT EXISTS "testScenarioId" TEXT;
ALTER TABLE IF EXISTS "ApplicantProfile" ADD COLUMN IF NOT EXISTS "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN IF NOT EXISTS "testScenarioId" TEXT;
ALTER TABLE IF EXISTS "ApplicantCheckInCredential" ADD COLUMN IF NOT EXISTS "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN IF NOT EXISTS "testScenarioId" TEXT;
ALTER TABLE IF EXISTS "JuryProfile" ADD COLUMN IF NOT EXISTS "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN IF NOT EXISTS "testScenarioId" TEXT;
ALTER TABLE IF EXISTS "AccountSetupToken" ADD COLUMN IF NOT EXISTS "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN IF NOT EXISTS "testScenarioId" TEXT;
ALTER TABLE IF EXISTS "JuryApplication" ADD COLUMN IF NOT EXISTS "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN IF NOT EXISTS "testScenarioId" TEXT;
ALTER TABLE IF EXISTS "JuryApplicationFile" ADD COLUMN IF NOT EXISTS "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN IF NOT EXISTS "testScenarioId" TEXT;
ALTER TABLE IF EXISTS "Payment" ADD COLUMN IF NOT EXISTS "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN IF NOT EXISTS "testScenarioId" TEXT;
ALTER TABLE IF EXISTS "StripeWebhookEvent" ADD COLUMN IF NOT EXISTS "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN IF NOT EXISTS "testScenarioId" TEXT;
ALTER TABLE IF EXISTS "NominationApplication" ADD COLUMN IF NOT EXISTS "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN IF NOT EXISTS "testScenarioId" TEXT;
ALTER TABLE IF EXISTS "JuryNominationReview" ADD COLUMN IF NOT EXISTS "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN IF NOT EXISTS "testScenarioId" TEXT;
ALTER TABLE IF EXISTS "NominationAnswer" ADD COLUMN IF NOT EXISTS "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN IF NOT EXISTS "testScenarioId" TEXT;
ALTER TABLE IF EXISTS "NominationFile" ADD COLUMN IF NOT EXISTS "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN IF NOT EXISTS "testScenarioId" TEXT;
ALTER TABLE IF EXISTS "Ticket" ADD COLUMN IF NOT EXISTS "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN IF NOT EXISTS "testScenarioId" TEXT;
ALTER TABLE IF EXISTS "TicketQrCredential" ADD COLUMN IF NOT EXISTS "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN IF NOT EXISTS "testScenarioId" TEXT;
ALTER TABLE IF EXISTS "TicketActivity" ADD COLUMN IF NOT EXISTS "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN IF NOT EXISTS "testScenarioId" TEXT;

CREATE TABLE IF NOT EXISTS "TestScenario" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "description" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TestScenario_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "EmailDeliveryLog" (
  "id" TEXT NOT NULL,
  "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION',
  "testScenarioId" TEXT,
  "templateType" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "recipient" TEXT NOT NULL,
  "intendedRecipient" TEXT NOT NULL,
  "providerId" TEXT,
  "delivered" BOOLEAN NOT NULL DEFAULT false,
  "errorCode" TEXT,
  "errorMessage" TEXT,
  "providerResponse" JSONB,
  "relatedEntityType" TEXT,
  "relatedEntityId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailDeliveryLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Account_dataScope_role_status_idx" ON "Account"("dataScope", "role", "status");
CREATE INDEX IF NOT EXISTS "Account_testScenarioId_idx" ON "Account"("testScenarioId");
CREATE INDEX IF NOT EXISTS "ApplicantProfile_dataScope_createdAt_idx" ON "ApplicantProfile"("dataScope", "createdAt");
CREATE INDEX IF NOT EXISTS "ApplicantProfile_testScenarioId_idx" ON "ApplicantProfile"("testScenarioId");
CREATE INDEX IF NOT EXISTS "ApplicantCheckInCredential_applicantProfileId_idx" ON "ApplicantCheckInCredential"("applicantProfileId");
CREATE INDEX IF NOT EXISTS "ApplicantCheckInCredential_dataScope_idx" ON "ApplicantCheckInCredential"("dataScope");
CREATE INDEX IF NOT EXISTS "ApplicantCheckInCredential_testScenarioId_idx" ON "ApplicantCheckInCredential"("testScenarioId");
CREATE INDEX IF NOT EXISTS "JuryProfile_dataScope_approvalStatus_idx" ON "JuryProfile"("dataScope", "approvalStatus");
CREATE INDEX IF NOT EXISTS "JuryProfile_testScenarioId_idx" ON "JuryProfile"("testScenarioId");
CREATE UNIQUE INDEX IF NOT EXISTS "AccountSetupToken_tokenHash_key" ON "AccountSetupToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "AccountSetupToken_accountId_purpose_usedAt_idx" ON "AccountSetupToken"("accountId", "purpose", "usedAt");
CREATE INDEX IF NOT EXISTS "AccountSetupToken_expiresAt_idx" ON "AccountSetupToken"("expiresAt");
CREATE INDEX IF NOT EXISTS "AccountSetupToken_dataScope_idx" ON "AccountSetupToken"("dataScope");
CREATE INDEX IF NOT EXISTS "AccountSetupToken_testScenarioId_idx" ON "AccountSetupToken"("testScenarioId");
CREATE INDEX IF NOT EXISTS "JuryApplication_dataScope_status_paymentStatus_idx" ON "JuryApplication"("dataScope", "status", "paymentStatus");
CREATE INDEX IF NOT EXISTS "JuryApplication_testScenarioId_idx" ON "JuryApplication"("testScenarioId");
CREATE INDEX IF NOT EXISTS "JuryApplicationFile_dataScope_idx" ON "JuryApplicationFile"("dataScope");
CREATE INDEX IF NOT EXISTS "JuryApplicationFile_testScenarioId_idx" ON "JuryApplicationFile"("testScenarioId");
CREATE INDEX IF NOT EXISTS "Payment_dataScope_source_status_idx" ON "Payment"("dataScope", "source", "status");
CREATE INDEX IF NOT EXISTS "Payment_testScenarioId_idx" ON "Payment"("testScenarioId");
CREATE INDEX IF NOT EXISTS "StripeWebhookEvent_dataScope_processedAt_idx" ON "StripeWebhookEvent"("dataScope", "processedAt");
CREATE INDEX IF NOT EXISTS "StripeWebhookEvent_testScenarioId_idx" ON "StripeWebhookEvent"("testScenarioId");
CREATE INDEX IF NOT EXISTS "NominationApplication_dataScope_status_paymentStatus_idx" ON "NominationApplication"("dataScope", "status", "paymentStatus");
CREATE INDEX IF NOT EXISTS "NominationApplication_testScenarioId_idx" ON "NominationApplication"("testScenarioId");
CREATE INDEX IF NOT EXISTS "JuryNominationReview_dataScope_status_idx" ON "JuryNominationReview"("dataScope", "status");
CREATE INDEX IF NOT EXISTS "JuryNominationReview_testScenarioId_idx" ON "JuryNominationReview"("testScenarioId");
CREATE INDEX IF NOT EXISTS "NominationAnswer_dataScope_idx" ON "NominationAnswer"("dataScope");
CREATE INDEX IF NOT EXISTS "NominationAnswer_testScenarioId_idx" ON "NominationAnswer"("testScenarioId");
CREATE INDEX IF NOT EXISTS "NominationFile_dataScope_idx" ON "NominationFile"("dataScope");
CREATE INDEX IF NOT EXISTS "NominationFile_testScenarioId_idx" ON "NominationFile"("testScenarioId");
CREATE INDEX IF NOT EXISTS "Ticket_dataScope_status_createdAt_idx" ON "Ticket"("dataScope", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "Ticket_testScenarioId_idx" ON "Ticket"("testScenarioId");
CREATE INDEX IF NOT EXISTS "TicketQrCredential_dataScope_status_idx" ON "TicketQrCredential"("dataScope", "status");
CREATE INDEX IF NOT EXISTS "TicketQrCredential_testScenarioId_idx" ON "TicketQrCredential"("testScenarioId");
CREATE INDEX IF NOT EXISTS "TicketActivity_dataScope_createdAt_idx" ON "TicketActivity"("dataScope", "createdAt");
CREATE INDEX IF NOT EXISTS "TicketActivity_testScenarioId_idx" ON "TicketActivity"("testScenarioId");
CREATE INDEX IF NOT EXISTS "TestScenario_kind_createdAt_idx" ON "TestScenario"("kind", "createdAt");
CREATE INDEX IF NOT EXISTS "EmailDeliveryLog_dataScope_createdAt_idx" ON "EmailDeliveryLog"("dataScope", "createdAt");
CREATE INDEX IF NOT EXISTS "EmailDeliveryLog_testScenarioId_idx" ON "EmailDeliveryLog"("testScenarioId");
CREATE INDEX IF NOT EXISTS "EmailDeliveryLog_templateType_idx" ON "EmailDeliveryLog"("templateType");
CREATE INDEX IF NOT EXISTS "EmailDeliveryLog_relatedEntityType_relatedEntityId_idx" ON "EmailDeliveryLog"("relatedEntityType", "relatedEntityId");
