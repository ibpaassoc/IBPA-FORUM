ALTER TABLE "JuryApplication"
ADD COLUMN IF NOT EXISTS "approvedCategories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "JuryProfile"
ADD COLUMN IF NOT EXISTS "approvedCategories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "JuryApplication"
SET "approvedCategories" = "expertiseAreas";

UPDATE "JuryProfile" AS profile
SET "approvedCategories" = application."approvedCategories"
FROM "JuryApplication" AS application
WHERE profile."juryApplicationId" = application."id";
