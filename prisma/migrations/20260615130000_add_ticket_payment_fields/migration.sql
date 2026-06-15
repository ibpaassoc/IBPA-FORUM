-- AlterTable: add payment tracking fields to Ticket
ALTER TABLE "Ticket"
  ADD COLUMN "stripePaymentIntentId" TEXT,
  ADD COLUMN "paidAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_stripePaymentIntentId_key" ON "Ticket"("stripePaymentIntentId");
