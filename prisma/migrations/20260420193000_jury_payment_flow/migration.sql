CREATE TYPE "JuryApplicationStatus" AS ENUM (
    'PENDING_REVIEW',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'ACTIVE_JUDGE'
);

ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'NOT_REQUIRED';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';

COMMIT;

ALTER TABLE "JuryApplication"
ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
ADD COLUMN "approvedAt" TIMESTAMP(3),
ADD COLUMN "rejectedAt" TIMESTAMP(3),
ADD COLUMN "paidAt" TIMESTAMP(3),
ADD COLUMN "stripeCheckoutSessionId" TEXT,
ADD COLUMN "stripePaymentIntentId" TEXT,
ADD COLUMN "registrationTokenHash" TEXT,
ADD COLUMN "registrationTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN "registrationEmailSentAt" TIMESTAMP(3);

ALTER TABLE "JuryApplication"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "JuryApplication"
ALTER COLUMN "status" TYPE "JuryApplicationStatus"
USING (
    CASE "status"::text
        WHEN 'SUBMITTED' THEN 'PENDING_REVIEW'::"JuryApplicationStatus"
        WHEN 'UNDER_REVIEW' THEN 'UNDER_REVIEW'::"JuryApplicationStatus"
        WHEN 'APPROVED' THEN 'APPROVED'::"JuryApplicationStatus"
        WHEN 'REJECTED' THEN 'REJECTED'::"JuryApplicationStatus"
        ELSE 'PENDING_REVIEW'::"JuryApplicationStatus"
    END
);

ALTER TABLE "JuryApplication"
ALTER COLUMN "status" SET DEFAULT 'PENDING_REVIEW';

CREATE TABLE "StripeWebhookEvent" (
    "id" TEXT NOT NULL,
    "stripeEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payloadJson" JSONB,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JuryApplication_stripeCheckoutSessionId_key" ON "JuryApplication"("stripeCheckoutSessionId");
CREATE UNIQUE INDEX "JuryApplication_stripePaymentIntentId_key" ON "JuryApplication"("stripePaymentIntentId");
CREATE UNIQUE INDEX "StripeWebhookEvent_stripeEventId_key" ON "StripeWebhookEvent"("stripeEventId");
