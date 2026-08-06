-- Preserve every existing Account while allowing one normalized email per role.
-- Existing application/profile/payment foreign keys continue to point at the
-- same account ids; this migration only changes the identity constraint.
ALTER TABLE "Account" ADD COLUMN "normalizedEmail" TEXT;

UPDATE "Account"
SET "normalizedEmail" = lower(trim("email"))
WHERE "normalizedEmail" IS NULL;

ALTER TABLE "Account" ALTER COLUMN "normalizedEmail" SET NOT NULL;

DROP INDEX IF EXISTS "Account_email_key";
CREATE UNIQUE INDEX "Account_normalizedEmail_role_key"
  ON "Account"("normalizedEmail", "role");
CREATE INDEX "Account_normalizedEmail_idx" ON "Account"("normalizedEmail");
