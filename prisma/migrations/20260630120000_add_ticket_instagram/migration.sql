-- Optional Instagram handle for ticket buyers. Additive and nullable so all
-- existing tickets (which have no Instagram) remain valid and unaffected.
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "instagram" TEXT;
