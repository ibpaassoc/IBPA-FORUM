ALTER TYPE "forum_next"."PaymentStatus" ADD VALUE IF NOT EXISTS 'PARTIALLY_PAID';
ALTER TYPE "forum_next"."PaymentStatus" ADD VALUE IF NOT EXISTS 'PAST_DUE';

CREATE TYPE "forum_next"."PaymentPlan" AS ENUM ('FULL', 'TWO_INSTALLMENTS');

ALTER TABLE "forum_next"."Payment"
ADD COLUMN "paymentPlan" "forum_next"."PaymentPlan" NOT NULL DEFAULT 'FULL',
ADD COLUMN "stripeSubscriptionId" TEXT,
ADD COLUMN "stripeSubscriptionScheduleId" TEXT;

CREATE UNIQUE INDEX "Payment_stripeSubscriptionId_key"
ON "forum_next"."Payment"("stripeSubscriptionId");

CREATE UNIQUE INDEX "Payment_stripeSubscriptionScheduleId_key"
ON "forum_next"."Payment"("stripeSubscriptionScheduleId");
