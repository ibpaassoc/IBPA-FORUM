-- Unified ticket check-in: per-record check-in timestamps so a single scanner
-- can mark attendance across forum/gala tickets, participant applications, and
-- jury applications. All columns are additive and nullable so existing flows
-- are unaffected.

ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "checkedInAt" TIMESTAMP(3);

ALTER TABLE "JuryApplication" ADD COLUMN IF NOT EXISTS "checkedInAt" TIMESTAMP(3);

-- Tickets support two independent check-in scopes (forum entry + gala dinner).
-- The legacy "status"/"lastCheckIn" columns are kept in sync for backward
-- compatibility, but these timestamps are the source of truth for duplicate
-- detection.
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "forumCheckInAt" TIMESTAMP(3);
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "galaCheckInAt" TIMESTAMP(3);

-- Backfill the new ticket timestamps from the existing single-status field so
-- already-checked-in tickets are recognised by the unified scanner.
UPDATE "Ticket"
  SET "forumCheckInAt" = COALESCE("lastCheckIn", "updatedAt")
  WHERE "status" IN ('CHECKED_ONE_DAY', 'CHECKED_TWO_DAY') AND "forumCheckInAt" IS NULL;

UPDATE "Ticket"
  SET "galaCheckInAt" = COALESCE("lastCheckIn", "updatedAt")
  WHERE "status" = 'CHECKED_GALA_DINNER' AND "galaCheckInAt" IS NULL;
