-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "ScoreStatus" AS ENUM ('DRAFT', 'SUBMITTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "JudgeScore" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "nominationApplicationId" TEXT,
    "judgeId" TEXT NOT NULL,
    "technical" INTEGER,
    "aesthetic" INTEGER,
    "creativity" INTEGER,
    "impact" INTEGER,
    "presentation" INTEGER,
    "totalScore" INTEGER,
    "comment" TEXT,
    "status" "ScoreStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JudgeScore_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX IF NOT EXISTS "JudgeScore_applicationId_judgeId_idx" ON "JudgeScore"("applicationId", "judgeId");
CREATE INDEX IF NOT EXISTS "JudgeScore_applicationId_idx" ON "JudgeScore"("applicationId");
CREATE INDEX IF NOT EXISTS "JudgeScore_judgeId_idx" ON "JudgeScore"("judgeId");

-- Unique constraint referenced by nomination migration
CREATE UNIQUE INDEX IF NOT EXISTS "JudgeScore_applicationId_judgeId_key" ON "JudgeScore"("applicationId", "judgeId");

-- Foreign Keys
ALTER TABLE "JudgeScore"
    ADD CONSTRAINT "JudgeScore_applicationId_fkey"
    FOREIGN KEY ("applicationId") REFERENCES "Application"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "JudgeScore"
    ADD CONSTRAINT "JudgeScore_judgeId_fkey"
    FOREIGN KEY ("judgeId") REFERENCES "JuryApplication"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
