CREATE TYPE "forum_next"."NotificationType" AS ENUM ('JURY', 'APPLICANT');
CREATE TYPE "forum_next"."TicketOrigin" AS ENUM ('STANDARD', 'SPECIAL_PACKET', 'JURY_GALA', 'SPECIAL_OFFER');

ALTER TABLE "forum_next"."Ticket"
ADD COLUMN "origin" "forum_next"."TicketOrigin" NOT NULL DEFAULT 'STANDARD';

UPDATE "forum_next"."Ticket"
SET "origin" = 'SPECIAL_PACKET'
WHERE "specialPacketId" IS NOT NULL;

CREATE TABLE "forum_next"."Notification" (
  "id" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "type" "forum_next"."NotificationType" NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "content" JSONB NOT NULL,
  "isViewed" BOOLEAN NOT NULL DEFAULT false,
  "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dateViewed" TIMESTAMP(3),
  "dataScope" "forum_next"."DataScope" NOT NULL DEFAULT 'PRODUCTION',

  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Notification_accountId_isViewed_dateCreated_idx"
ON "forum_next"."Notification"("accountId", "isViewed", "dateCreated");

CREATE INDEX "Notification_dataScope_type_dateCreated_idx"
ON "forum_next"."Notification"("dataScope", "type", "dateCreated");

ALTER TABLE "forum_next"."Notification"
ADD CONSTRAINT "Notification_accountId_fkey"
FOREIGN KEY ("accountId") REFERENCES "forum_next"."Account"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
