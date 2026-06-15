-- CreateEnum
CREATE TYPE "PaymentSource" AS ENUM ('COMPETITOR', 'JURY', 'TICKET');

-- AlterTable: make applicationId nullable, add source + new FK columns
ALTER TABLE "Payment"
  ALTER COLUMN "applicationId" DROP NOT NULL,
  ADD COLUMN "source" "PaymentSource" NOT NULL DEFAULT 'COMPETITOR',
  ADD COLUMN "juryApplicationId" TEXT,
  ADD COLUMN "ticketId" TEXT;

-- AddForeignKey
ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_juryApplicationId_fkey"
  FOREIGN KEY ("juryApplicationId") REFERENCES "JuryApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_ticketId_fkey"
  FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
