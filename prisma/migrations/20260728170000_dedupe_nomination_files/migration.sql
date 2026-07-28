-- Keep one canonical record for each uploaded Blob before enforcing
-- idempotency. Prefer the active/newest row when historical retries created
-- soft-deleted duplicates.
WITH ranked_files AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "nominationApplicationId", "fileUrl"
      ORDER BY ("deletedAt" IS NULL) DESC, "createdAt" DESC, "id" DESC
    ) AS duplicate_rank
  FROM "NominationFile"
)
DELETE FROM "NominationFile"
WHERE "id" IN (
  SELECT "id"
  FROM ranked_files
  WHERE duplicate_rank > 1
);

CREATE UNIQUE INDEX "NominationFile_nominationApplicationId_fileUrl_key"
  ON "NominationFile"("nominationApplicationId", "fileUrl");
