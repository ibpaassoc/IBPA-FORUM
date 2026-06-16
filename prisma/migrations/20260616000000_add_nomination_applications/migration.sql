-- CreateTable: NominationApplication
CREATE TABLE "NominationApplication" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "awardId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NominationApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable: NominationAnswer
CREATE TABLE "NominationAnswer" (
    "id" TEXT NOT NULL,
    "nominationApplicationId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "valueText" TEXT,
    "valueNumber" INTEGER,
    "valueBoolean" BOOLEAN,
    "valueJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NominationAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable: NominationFile
CREATE TABLE "NominationFile" (
    "id" TEXT NOT NULL,
    "nominationApplicationId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NominationFile_pkey" PRIMARY KEY ("id")
);

-- Add nominationApplicationId to JudgeScore
ALTER TABLE "JudgeScore" ADD COLUMN "nominationApplicationId" TEXT;

-- Indexes on NominationApplication
CREATE UNIQUE INDEX "NominationApplication_applicationId_awardId_key"
    ON "NominationApplication"("applicationId", "awardId");
CREATE INDEX "NominationApplication_applicationId_idx"
    ON "NominationApplication"("applicationId");
CREATE INDEX "NominationApplication_categoryId_idx"
    ON "NominationApplication"("categoryId");

-- Indexes on NominationAnswer
CREATE INDEX "NominationAnswer_nominationApplicationId_idx"
    ON "NominationAnswer"("nominationApplicationId");

-- Indexes on NominationFile
CREATE INDEX "NominationFile_nominationApplicationId_idx"
    ON "NominationFile"("nominationApplicationId");

-- Indexes on JudgeScore (nominationApplicationId)
CREATE INDEX "JudgeScore_nominationApplicationId_idx"
    ON "JudgeScore"("nominationApplicationId");
CREATE INDEX "JudgeScore_nominationApplicationId_judgeId_idx"
    ON "JudgeScore"("nominationApplicationId", "judgeId");
CREATE INDEX "JudgeScore_applicationId_judgeId_idx"
    ON "JudgeScore"("applicationId", "judgeId");

-- Foreign keys: NominationApplication
ALTER TABLE "NominationApplication"
    ADD CONSTRAINT "NominationApplication_applicationId_fkey"
    FOREIGN KEY ("applicationId") REFERENCES "Application"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NominationApplication"
    ADD CONSTRAINT "NominationApplication_awardId_fkey"
    FOREIGN KEY ("awardId") REFERENCES "Award"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "NominationApplication"
    ADD CONSTRAINT "NominationApplication_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign keys: NominationAnswer
ALTER TABLE "NominationAnswer"
    ADD CONSTRAINT "NominationAnswer_nominationApplicationId_fkey"
    FOREIGN KEY ("nominationApplicationId") REFERENCES "NominationApplication"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys: NominationFile
ALTER TABLE "NominationFile"
    ADD CONSTRAINT "NominationFile_nominationApplicationId_fkey"
    FOREIGN KEY ("nominationApplicationId") REFERENCES "NominationApplication"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign key: JudgeScore.nominationApplicationId
ALTER TABLE "JudgeScore"
    ADD CONSTRAINT "JudgeScore_nominationApplicationId_fkey"
    FOREIGN KEY ("nominationApplicationId") REFERENCES "NominationApplication"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop old unique constraint on JudgeScore (applicationId, judgeId)
-- New uniqueness: per (nominationApplicationId, judgeId) via partial index below
DROP INDEX "JudgeScore_applicationId_judgeId_key";

-- Partial unique for legacy scores (nominationApplicationId IS NULL)
CREATE UNIQUE INDEX "JudgeScore_applicationId_judgeId_legacy_key"
    ON "JudgeScore"("applicationId", "judgeId")
    WHERE "nominationApplicationId" IS NULL;

-- Partial unique for new nomination-level scores
CREATE UNIQUE INDEX "JudgeScore_nominationApplicationId_judgeId_key"
    ON "JudgeScore"("nominationApplicationId", "judgeId")
    WHERE "nominationApplicationId" IS NOT NULL;

-- ================== BACKFILL ==================

-- 1. Create NominationApplication records from selectedAwards JSON answers
INSERT INTO "NominationApplication" ("id", "applicationId", "awardId", "categoryId", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    a.id,
    (elem->>'awardId'),
    (elem->>'categoryId'),
    a."createdAt",
    CURRENT_TIMESTAMP
FROM "Application" a
JOIN "ApplicationAnswer" aa
    ON aa."applicationId" = a.id
    AND aa."fieldKey" = 'selectedAwards'
CROSS JOIN LATERAL jsonb_array_elements(aa."valueJson"::jsonb) AS elem
WHERE
    (elem->>'awardId') IS NOT NULL
    AND (elem->>'categoryId') IS NOT NULL
    -- Only insert if the award and category actually exist
    AND EXISTS (SELECT 1 FROM "Award" w WHERE w.id = (elem->>'awardId'))
    AND EXISTS (SELECT 1 FROM "Category" c WHERE c.id = (elem->>'categoryId'))
ON CONFLICT ("applicationId", "awardId") DO NOTHING;

-- 2. For applications without selectedAwards answer, create one NominationApplication from primary award
INSERT INTO "NominationApplication" ("id", "applicationId", "awardId", "categoryId", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    a.id,
    a."awardId",
    a."categoryId",
    a."createdAt",
    CURRENT_TIMESTAMP
FROM "Application" a
WHERE NOT EXISTS (
    SELECT 1 FROM "NominationApplication" na WHERE na."applicationId" = a.id
)
ON CONFLICT ("applicationId", "awardId") DO NOTHING;

-- 3. Link existing JudgeScores to the primary NominationApplication
UPDATE "JudgeScore" js
SET "nominationApplicationId" = na.id
FROM "Application" a
JOIN "NominationApplication" na
    ON na."applicationId" = a.id
    AND na."awardId" = a."awardId"
WHERE js."applicationId" = a.id
    AND js."nominationApplicationId" IS NULL;
