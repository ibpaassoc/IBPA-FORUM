CREATE TYPE "TicketQrStatus" AS ENUM ('ACTIVE', 'REPLACED', 'REVOKED');

CREATE TYPE "TicketActivityType" AS ENUM ('UPDATED', 'QR_GENERATED', 'QR_REGENERATED', 'QR_RESENT', 'QR_EMAIL_FAILED');

CREATE TABLE "TicketQrCredential" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "TicketQrStatus" NOT NULL DEFAULT 'ACTIVE',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "replacedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "lastSentAt" TIMESTAMP(3),
    "lastDeliveryStatus" TEXT,
    "lastDeliveryProviderId" TEXT,
    "lastDeliveryError" TEXT,

    CONSTRAINT "TicketQrCredential_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TicketActivity" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "adminId" TEXT,
    "type" "TicketActivityType" NOT NULL,
    "changedFields" JSONB,
    "previousValues" JSONB,
    "newValues" JSONB,
    "emailDelivery" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketActivity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TicketQrCredential_token_key" ON "TicketQrCredential"("token");
CREATE INDEX "TicketQrCredential_ticketId_status_idx" ON "TicketQrCredential"("ticketId", "status");
CREATE INDEX "TicketQrCredential_generatedAt_idx" ON "TicketQrCredential"("generatedAt");
CREATE UNIQUE INDEX "TicketQrCredential_one_active_per_ticket_idx"
  ON "TicketQrCredential"("ticketId")
  WHERE "status" = 'ACTIVE';

CREATE INDEX "TicketActivity_ticketId_createdAt_idx" ON "TicketActivity"("ticketId", "createdAt");
CREATE INDEX "TicketActivity_type_idx" ON "TicketActivity"("type");

ALTER TABLE "TicketQrCredential"
  ADD CONSTRAINT "TicketQrCredential_ticketId_fkey"
  FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TicketActivity"
  ADD CONSTRAINT "TicketActivity_ticketId_fkey"
  FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "TicketQrCredential" ("id", "ticketId", "token", "status", "generatedAt")
SELECT 'c' || md5("id" || ':' || "secureToken"), "id", "secureToken", 'ACTIVE', COALESCE("paidAt", "createdAt")
FROM "Ticket"
WHERE "secureToken" IS NOT NULL
ON CONFLICT ("token") DO NOTHING;
