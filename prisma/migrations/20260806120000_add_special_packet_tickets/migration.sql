ALTER TABLE "Ticket"
ADD COLUMN "specialPacketId" TEXT,
ADD COLUMN "specialPacketPosition" INTEGER;

CREATE INDEX "Ticket_specialPacketId_idx" ON "Ticket"("specialPacketId");
