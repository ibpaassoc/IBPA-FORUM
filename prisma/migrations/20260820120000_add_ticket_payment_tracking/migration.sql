ALTER TABLE "forum_next"."Payment"
ADD COLUMN "nextPaymentAt" TIMESTAMP(3),
ADD COLUMN "lastPaymentError" TEXT,
ADD COLUMN "lastPaymentFailedAt" TIMESTAMP(3);
