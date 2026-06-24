-- Add ADDITIONAL_INFO_REQUIRED to JuryApplicationStatus enum
-- Enum value additions must be committed before they can be used in ALTER TABLE
ALTER TYPE "JuryApplicationStatus" ADD VALUE IF NOT EXISTS 'ADDITIONAL_INFO_REQUIRED';

COMMIT;

-- Add missing columns to JuryApplication
ALTER TABLE "JuryApplication"
ADD COLUMN IF NOT EXISTS "ibpaAssociationMember" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "ibpaNumber" TEXT,
ADD COLUMN IF NOT EXISTS "infoRequestToken" TEXT,
ADD COLUMN IF NOT EXISTS "infoRequestDetails" TEXT,
ADD COLUMN IF NOT EXISTS "infoRequestedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "infoResubmittedAt" TIMESTAMP(3);

-- Unique index for infoRequestToken
CREATE UNIQUE INDEX IF NOT EXISTS "JuryApplication_infoRequestToken_key" ON "JuryApplication"("infoRequestToken");
