CREATE TYPE "DataScope" AS ENUM ('PRODUCTION', 'TEST');

ALTER TABLE "Account" ADD COLUMN "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN "testScenarioId" TEXT;
ALTER TABLE "ApplicantProfile" ADD COLUMN "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN "testScenarioId" TEXT;
ALTER TABLE "ApplicantCheckInCredential" ADD COLUMN "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN "testScenarioId" TEXT;
ALTER TABLE "JuryProfile" ADD COLUMN "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN "testScenarioId" TEXT;
ALTER TABLE "AccountSetupToken" ADD COLUMN "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN "testScenarioId" TEXT;
ALTER TABLE "JuryApplication" ADD COLUMN "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN "testScenarioId" TEXT;
ALTER TABLE "JuryApplicationFile" ADD COLUMN "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN "testScenarioId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN "testScenarioId" TEXT;
ALTER TABLE "StripeWebhookEvent" ADD COLUMN "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN "testScenarioId" TEXT;
ALTER TABLE "NominationApplication" ADD COLUMN "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN "testScenarioId" TEXT;
ALTER TABLE "JuryNominationReview" ADD COLUMN "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN "testScenarioId" TEXT;
ALTER TABLE "NominationAnswer" ADD COLUMN "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN "testScenarioId" TEXT;
ALTER TABLE "NominationFile" ADD COLUMN "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN "testScenarioId" TEXT;
ALTER TABLE "Ticket" ADD COLUMN "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN "testScenarioId" TEXT;
ALTER TABLE "TicketQrCredential" ADD COLUMN "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN "testScenarioId" TEXT;
ALTER TABLE "TicketActivity" ADD COLUMN "dataScope" "DataScope" NOT NULL DEFAULT 'PRODUCTION', ADD COLUMN "testScenarioId" TEXT;

CREATE TABLE "TestScenario" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "description" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TestScenario_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailDeliveryLog" (
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

CREATE INDEX "Account_dataScope_role_status_idx" ON "Account"("dataScope", "role", "status");
CREATE INDEX "Account_testScenarioId_idx" ON "Account"("testScenarioId");
CREATE INDEX "ApplicantProfile_dataScope_createdAt_idx" ON "ApplicantProfile"("dataScope", "createdAt");
CREATE INDEX "ApplicantProfile_testScenarioId_idx" ON "ApplicantProfile"("testScenarioId");
CREATE INDEX "ApplicantCheckInCredential_dataScope_idx" ON "ApplicantCheckInCredential"("dataScope");
CREATE INDEX "ApplicantCheckInCredential_testScenarioId_idx" ON "ApplicantCheckInCredential"("testScenarioId");
CREATE INDEX "JuryProfile_dataScope_approvalStatus_idx" ON "JuryProfile"("dataScope", "approvalStatus");
CREATE INDEX "JuryProfile_testScenarioId_idx" ON "JuryProfile"("testScenarioId");
CREATE INDEX "AccountSetupToken_dataScope_idx" ON "AccountSetupToken"("dataScope");
CREATE INDEX "AccountSetupToken_testScenarioId_idx" ON "AccountSetupToken"("testScenarioId");
CREATE INDEX "JuryApplication_dataScope_status_paymentStatus_idx" ON "JuryApplication"("dataScope", "status", "paymentStatus");
CREATE INDEX "JuryApplication_testScenarioId_idx" ON "JuryApplication"("testScenarioId");
CREATE INDEX "JuryApplicationFile_dataScope_idx" ON "JuryApplicationFile"("dataScope");
CREATE INDEX "JuryApplicationFile_testScenarioId_idx" ON "JuryApplicationFile"("testScenarioId");
CREATE INDEX "Payment_dataScope_source_status_idx" ON "Payment"("dataScope", "source", "status");
CREATE INDEX "Payment_testScenarioId_idx" ON "Payment"("testScenarioId");
CREATE INDEX "StripeWebhookEvent_dataScope_processedAt_idx" ON "StripeWebhookEvent"("dataScope", "processedAt");
CREATE INDEX "StripeWebhookEvent_testScenarioId_idx" ON "StripeWebhookEvent"("testScenarioId");
CREATE INDEX "NominationApplication_dataScope_status_paymentStatus_idx" ON "NominationApplication"("dataScope", "status", "paymentStatus");
CREATE INDEX "NominationApplication_testScenarioId_idx" ON "NominationApplication"("testScenarioId");
CREATE INDEX "JuryNominationReview_dataScope_status_idx" ON "JuryNominationReview"("dataScope", "status");
CREATE INDEX "JuryNominationReview_testScenarioId_idx" ON "JuryNominationReview"("testScenarioId");
CREATE INDEX "NominationAnswer_dataScope_idx" ON "NominationAnswer"("dataScope");
CREATE INDEX "NominationAnswer_testScenarioId_idx" ON "NominationAnswer"("testScenarioId");
CREATE INDEX "NominationFile_dataScope_idx" ON "NominationFile"("dataScope");
CREATE INDEX "NominationFile_testScenarioId_idx" ON "NominationFile"("testScenarioId");
CREATE INDEX "Ticket_dataScope_status_createdAt_idx" ON "Ticket"("dataScope", "status", "createdAt");
CREATE INDEX "Ticket_testScenarioId_idx" ON "Ticket"("testScenarioId");
CREATE INDEX "TicketQrCredential_dataScope_status_idx" ON "TicketQrCredential"("dataScope", "status");
CREATE INDEX "TicketQrCredential_testScenarioId_idx" ON "TicketQrCredential"("testScenarioId");
CREATE INDEX "TicketActivity_dataScope_createdAt_idx" ON "TicketActivity"("dataScope", "createdAt");
CREATE INDEX "TicketActivity_testScenarioId_idx" ON "TicketActivity"("testScenarioId");
CREATE INDEX "TestScenario_kind_createdAt_idx" ON "TestScenario"("kind", "createdAt");
CREATE INDEX "EmailDeliveryLog_dataScope_createdAt_idx" ON "EmailDeliveryLog"("dataScope", "createdAt");
CREATE INDEX "EmailDeliveryLog_testScenarioId_idx" ON "EmailDeliveryLog"("testScenarioId");
CREATE INDEX "EmailDeliveryLog_templateType_idx" ON "EmailDeliveryLog"("templateType");
CREATE INDEX "EmailDeliveryLog_relatedEntityType_relatedEntityId_idx" ON "EmailDeliveryLog"("relatedEntityType", "relatedEntityId");
