-- The applicant editor autosaves and may retry a request after a connection
-- interruption. Keep one durable value per nomination field so retries cannot
-- create duplicate answer rows.
WITH ranked_answers AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "nominationApplicationId", "fieldKey"
      ORDER BY "createdAt" DESC, id DESC
    ) AS row_number
  FROM "NominationAnswer"
)
DELETE FROM "NominationAnswer"
WHERE id IN (
  SELECT id FROM ranked_answers WHERE row_number > 1
);

CREATE UNIQUE INDEX "NominationAnswer_nominationApplicationId_fieldKey_key"
ON "NominationAnswer"("nominationApplicationId", "fieldKey");
