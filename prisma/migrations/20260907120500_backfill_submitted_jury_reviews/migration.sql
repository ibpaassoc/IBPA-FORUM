-- Legacy COMPLETED/LOCKED reviews represented a final submission only when a
-- submission timestamp was present. Preserve unfinished rows for audit.
UPDATE "forum_next"."JuryNominationReview"
SET "status" = 'SUBMITTED'::"forum_next"."JuryReviewStatus"
WHERE "status" IN (
  'COMPLETED'::"forum_next"."JuryReviewStatus",
  'LOCKED'::"forum_next"."JuryReviewStatus"
)
AND "submittedAt" IS NOT NULL;
