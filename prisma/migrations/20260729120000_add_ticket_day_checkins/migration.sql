-- General scanner check-ins are recorded independently for each forum day.
-- Keep forumCheckInAt as a legacy compatibility field while existing readers
-- are migrated to the two explicit timestamps.
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "dayOneCheckInAt" TIMESTAMP(3);
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "dayTwoCheckInAt" TIMESTAMP(3);

-- Historical forum check-ins predate day-specific scanning. Treat them as
-- Day 1 so an already-used ticket is not accidentally admitted again.
UPDATE "Ticket"
  SET "dayOneCheckInAt" = "forumCheckInAt"
  WHERE "forumCheckInAt" IS NOT NULL AND "dayOneCheckInAt" IS NULL;
