-- Publish scores for every production nomination that has at least one
-- submitted jury review. Draft and in-progress reviews remain private.
UPDATE "forum_next"."Nomination" AS nomination
SET "scoresReleasedAt" = CURRENT_TIMESTAMP
WHERE nomination."scoresReleasedAt" IS NULL
  AND nomination."status" <> 'ARCHIVED'::"forum_next"."NominationStatus"
  AND nomination."dataScope" = 'PRODUCTION'::"forum_next"."DataScope"
  AND EXISTS (
    SELECT 1
    FROM "forum_next"."JuryNominationReview" AS review
    WHERE review."nominationId" = nomination."id"
      AND review."dataScope" = nomination."dataScope"
      AND review."status" = 'SUBMITTED'::"forum_next"."JuryReviewStatus"
  );
