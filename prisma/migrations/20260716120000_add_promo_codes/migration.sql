CREATE TYPE "PromoPaymentFlow" AS ENUM ('APPLICATIONS', 'TICKETS');

CREATE TABLE "PromoCode" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "keyword" TEXT NOT NULL,
  "paymentFlow" "PromoPaymentFlow" NOT NULL,
  "discountPercent" INTEGER NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PromoCode_key_key" ON "PromoCode"("key");
CREATE UNIQUE INDEX "PromoCode_keyword_key" ON "PromoCode"("keyword");
CREATE INDEX "PromoCode_paymentFlow_enabled_idx" ON "PromoCode"("paymentFlow", "enabled");

ALTER TABLE "Payment"
  ADD COLUMN "promoCodeKey" TEXT,
  ADD COLUMN "promoCodeKeyword" TEXT,
  ADD COLUMN "promoDiscountPercent" INTEGER,
  ADD COLUMN "promoDiscountAmount" INTEGER;

CREATE INDEX "Payment_promoCodeKey_idx" ON "Payment"("promoCodeKey");

ALTER TABLE "Ticket"
  ADD COLUMN "promoCodeKey" TEXT,
  ADD COLUMN "promoCodeKeyword" TEXT,
  ADD COLUMN "promoDiscountPercent" INTEGER,
  ADD COLUMN "promoDiscountAmount" INTEGER;

CREATE INDEX "Ticket_promoCodeKey_idx" ON "Ticket"("promoCodeKey");

INSERT INTO "PromoCode" ("id", "key", "keyword", "paymentFlow", "discountPercent", "enabled", "createdAt", "updatedAt")
VALUES
  ('promo_application20', 'APPLICATION20', 'APPLICATION20', 'APPLICATIONS', 20, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('promo_tickets30', 'TICKETS30', 'TICKETS30', 'TICKETS', 30, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
