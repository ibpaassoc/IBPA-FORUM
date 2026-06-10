-- Add IBPA association member fields to JuryApplication
ALTER TABLE "JuryApplication" ADD COLUMN IF NOT EXISTS "ibpaAssociationMember" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "JuryApplication" ADD COLUMN IF NOT EXISTS "ibpaNumber" TEXT;
