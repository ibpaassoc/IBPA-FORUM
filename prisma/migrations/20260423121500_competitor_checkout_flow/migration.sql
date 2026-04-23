ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'PAYMENT_PENDING';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'REFUNDED';

ALTER TABLE "Application"
ADD COLUMN "amount" INTEGER NOT NULL DEFAULT 5000,
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'usd',
ADD COLUMN "stripeCheckoutSessionId" TEXT,
ADD COLUMN "stripePaymentIntentId" TEXT,
ADD COLUMN "paidAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Application_stripeCheckoutSessionId_key" ON "Application"("stripeCheckoutSessionId");
CREATE UNIQUE INDEX "Application_stripePaymentIntentId_key" ON "Application"("stripePaymentIntentId");
