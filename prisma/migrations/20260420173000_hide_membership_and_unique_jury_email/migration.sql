ALTER TABLE "Application"
ALTER COLUMN "membershipNumber" DROP NOT NULL;

ALTER TABLE "JuryApplication"
ALTER COLUMN "membershipStatus" DROP NOT NULL;

UPDATE "JuryApplication"
SET "email" = LOWER("email")
WHERE "email" <> LOWER("email");

WITH ranked AS (
    SELECT
        "id",
        "email",
        ROW_NUMBER() OVER (
            PARTITION BY "email"
            ORDER BY "createdAt" ASC, "id" ASC
        ) AS row_number
    FROM "JuryApplication"
)
UPDATE "JuryApplication" AS application
SET "email" = REGEXP_REPLACE(
    ranked."email",
    '@',
    '+duplicate-' || ranked.row_number || '@'
)
FROM ranked
WHERE application."id" = ranked."id"
  AND ranked.row_number > 1;

CREATE UNIQUE INDEX "JuryApplication_email_key" ON "JuryApplication"("email");
