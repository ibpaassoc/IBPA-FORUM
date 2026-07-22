-- Finalize the applicant-account / nomination rollout.
-- Every legacy competitor record is migrated before the old aggregate is removed.

ALTER TABLE "ApplicantProfile" ADD COLUMN "checkedInAt" TIMESTAMP(3);

CREATE TABLE "ApplicantCheckInCredential" (
  "token" TEXT NOT NULL,
  "applicantProfileId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApplicantCheckInCredential_pkey" PRIMARY KEY ("token")
);

CREATE INDEX "ApplicantCheckInCredential_applicantProfileId_idx"
  ON "ApplicantCheckInCredential"("applicantProfileId");

ALTER TABLE "ApplicantCheckInCredential"
  ADD CONSTRAINT "ApplicantCheckInCredential_applicantProfileId_fkey"
  FOREIGN KEY ("applicantProfileId") REFERENCES "ApplicantProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- A profile can retain duplicate historical entries, but only one active entry
-- for an award. This replaces the rollout's all-row unique constraint.
DROP INDEX IF EXISTS "NominationApplication_applicantProfileId_awardId_key";

-- Ensure the original migration's fallback nomination exists for every record.
INSERT INTO "NominationApplication" (
  "id", "applicationId", "awardId", "categoryId", "status", "paymentStatus",
  "amount", "currency", "paidAt", "submittedAt", "stripeCheckoutSessionId",
  "stripePaymentIntentId", "createdAt", "updatedAt"
)
SELECT
  'legacy_nom_' || md5(a."id"),
  a."id",
  a."awardId",
  a."categoryId",
  CASE a."status"
    WHEN 'DRAFT' THEN 'DRAFT'::"NominationStatus"
    WHEN 'PAYMENT_PENDING' THEN 'PAYMENT_PENDING'::"NominationStatus"
    WHEN 'SUBMITTED' THEN 'SUBMITTED'::"NominationStatus"
    WHEN 'UNDER_REVIEW' THEN 'UNDER_REVIEW'::"NominationStatus"
    WHEN 'REJECTED' THEN 'REJECTED'::"NominationStatus"
    ELSE 'SCORED'::"NominationStatus"
  END,
  a."paymentStatus",
  a."amount",
  a."currency",
  a."paidAt",
  a."submittedAt",
  a."stripeCheckoutSessionId",
  a."stripePaymentIntentId",
  a."createdAt",
  a."updatedAt"
FROM "Application" a
WHERE NOT EXISTS (
  SELECT 1 FROM "NominationApplication" n WHERE n."applicationId" = a."id"
);

-- The current authentication model has one role per account. Refuse to merge an
-- applicant into a jury/admin account (or an ambiguous normalized duplicate),
-- because that would make one of the dashboards inaccessible after migration.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Application" application
    JOIN "Account" account
      ON lower(trim(account."email")) = lower(trim(application."email"))
    WHERE account."role" <> 'APPLICANT'
  ) THEN
    RAISE EXCEPTION 'Legacy cleanup aborted: applicant emails conflict with non-applicant accounts';
  END IF;

  IF EXISTS (
    SELECT lower(trim(application."email"))
    FROM "Application" application
    JOIN "Account" account
      ON lower(trim(account."email")) = lower(trim(application."email"))
    GROUP BY lower(trim(application."email"))
    HAVING count(DISTINCT account."id") > 1
  ) THEN
    RAISE EXCEPTION 'Legacy cleanup aborted: duplicate normalized accounts require resolution';
  END IF;
END $$;

-- Create an applicant account for every normalized legacy email that does not
-- already have one. Existing applicant accounts are reused.
WITH legacy_emails AS (
  SELECT
    lower(trim(a."email")) AS email,
    min(a."createdAt") AS "createdAt",
    max(a."updatedAt") AS "updatedAt"
  FROM "Application" a
  WHERE trim(a."email") <> ''
  GROUP BY lower(trim(a."email"))
)
INSERT INTO "Account" (
  "id", "email", "role", "status", "createdAt", "updatedAt"
)
SELECT
  'acct_legacy_' || md5(le.email),
  le.email,
  'APPLICANT'::"AccountRole",
  'INVITED'::"AccountStatus",
  le."createdAt",
  le."updatedAt"
FROM legacy_emails le
WHERE NOT EXISTS (
  SELECT 1 FROM "Account" account
  WHERE lower(trim(account."email")) = le.email
)
ON CONFLICT ("email") DO NOTHING;

-- Create a profile from the most recently updated record for each email.
WITH ranked_applications AS (
  SELECT
    a.*,
    lower(trim(a."email")) AS normalized_email,
    row_number() OVER (
      PARTITION BY lower(trim(a."email"))
      ORDER BY a."updatedAt" DESC, a."createdAt" DESC, a."id" DESC
    ) AS row_number
  FROM "Application" a
), account_matches AS (
  SELECT
    ra.*,
    (
      SELECT account."id"
      FROM "Account" account
      WHERE lower(trim(account."email")) = ra.normalized_email
        AND account."role" = 'APPLICANT'
      ORDER BY account."createdAt" ASC
      LIMIT 1
    ) AS account_id
  FROM ranked_applications ra
  WHERE ra.row_number = 1
)
INSERT INTO "ApplicantProfile" (
  "id", "accountId", "fullName", "phone", "country", "stateProvince", "city",
  "professionalTitle", "yearsExperience", "membershipNumber", "membershipLevel",
  "websiteUrl", "socialUrl", "reviewsUrl", "checkedInAt", "createdAt", "updatedAt"
)
SELECT
  'ap_legacy_' || md5(am.normalized_email),
  am.account_id,
  am."fullName",
  nullif(am."phone", ''),
  nullif(am."country", ''),
  am."stateProvince",
  nullif(am."city", ''),
  nullif(am."professionalTitle", ''),
  am."yearsExperience",
  am."membershipNumber",
  am."membershipLevel",
  am."websiteUrl",
  am."socialUrl",
  am."reviewsUrl",
  am."checkedInAt",
  am."createdAt",
  am."updatedAt"
FROM account_matches am
WHERE am.account_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "ApplicantProfile" profile WHERE profile."accountId" = am.account_id
  );

-- Preserve the latest check-in timestamp when several legacy rows share a profile.
UPDATE "ApplicantProfile" profile
SET "checkedInAt" = source."checkedInAt"
FROM (
  SELECT
    profile_inner."id" AS profile_id,
    max(a."checkedInAt") AS "checkedInAt"
  FROM "Application" a
  JOIN "Account" account
    ON lower(trim(account."email")) = lower(trim(a."email"))
   AND account."role" = 'APPLICANT'
  JOIN "ApplicantProfile" profile_inner ON profile_inner."accountId" = account."id"
  GROUP BY profile_inner."id"
) source
WHERE profile."id" = source.profile_id
  AND source."checkedInAt" IS NOT NULL;

-- Link every nomination to its account-owned profile and carry authoritative
-- application lifecycle/payment fields onto the nomination.
WITH application_profiles AS (
  SELECT
    a."id" AS application_id,
    profile."id" AS profile_id
  FROM "Application" a
  JOIN "Account" account
    ON lower(trim(account."email")) = lower(trim(a."email"))
   AND account."role" = 'APPLICANT'
  JOIN "ApplicantProfile" profile ON profile."accountId" = account."id"
)
UPDATE "NominationApplication" nomination
SET "applicantProfileId" = ap.profile_id
FROM application_profiles ap
WHERE nomination."applicationId" = ap.application_id;

WITH nomination_counts AS (
  SELECT "applicationId", count(*)::integer AS count
  FROM "NominationApplication"
  GROUP BY "applicationId"
), ranked_nominations AS (
  SELECT
    n."id",
    n."applicationId",
    row_number() OVER (PARTITION BY n."applicationId" ORDER BY n."createdAt", n."id") AS row_number
  FROM "NominationApplication" n
  WHERE n."applicationId" IS NOT NULL
)
UPDATE "NominationApplication" nomination
SET
  "status" = CASE application."status"
    WHEN 'DRAFT' THEN 'DRAFT'::"NominationStatus"
    WHEN 'PAYMENT_PENDING' THEN 'PAYMENT_PENDING'::"NominationStatus"
    WHEN 'SUBMITTED' THEN 'SUBMITTED'::"NominationStatus"
    WHEN 'UNDER_REVIEW' THEN 'UNDER_REVIEW'::"NominationStatus"
    WHEN 'REJECTED' THEN 'REJECTED'::"NominationStatus"
    ELSE 'SCORED'::"NominationStatus"
  END,
  "paymentStatus" = application."paymentStatus",
  "amount" = (application."amount" / counts.count)
    + CASE WHEN ranked.row_number <= (application."amount" % counts.count) THEN 1 ELSE 0 END,
  "currency" = application."currency",
  "paidAt" = application."paidAt",
  "submittedAt" = application."submittedAt",
  "stripeCheckoutSessionId" = application."stripeCheckoutSessionId",
  "stripePaymentIntentId" = application."stripePaymentIntentId"
FROM "Application" application
JOIN nomination_counts counts ON counts."applicationId" = application."id"
JOIN ranked_nominations ranked ON ranked."applicationId" = application."id"
WHERE nomination."id" = ranked."id";

-- Retain every old participant QR token while check-in ownership moves to the profile.
INSERT INTO "ApplicantCheckInCredential" ("token", "applicantProfileId", "createdAt")
SELECT a."id", profile."id", a."createdAt"
FROM "Application" a
JOIN "Account" account
  ON lower(trim(account."email")) = lower(trim(a."email"))
 AND account."role" = 'APPLICANT'
JOIN "ApplicantProfile" profile ON profile."accountId" = account."id"
ON CONFLICT ("token") DO NOTHING;

-- Preserve common legacy answers and files on the primary nomination for the
-- corresponding application. Existing nomination-level data wins.
WITH primary_nominations AS (
  SELECT DISTINCT ON (n."applicationId") n."applicationId", n."id" AS nomination_id
  FROM "NominationApplication" n
  JOIN "Application" a ON a."id" = n."applicationId"
  ORDER BY n."applicationId", (n."awardId" = a."awardId") DESC, n."createdAt", n."id"
)
INSERT INTO "NominationAnswer" (
  "id", "nominationApplicationId", "fieldKey", "valueText", "valueNumber",
  "valueBoolean", "valueJson", "createdAt"
)
SELECT
  'legacy_answer_' || md5(answer."id" || primary_nomination.nomination_id),
  primary_nomination.nomination_id,
  answer."fieldKey",
  answer."valueText",
  answer."valueNumber",
  answer."valueBoolean",
  answer."valueJson",
  answer."createdAt"
FROM "ApplicationAnswer" answer
JOIN primary_nominations primary_nomination
  ON primary_nomination."applicationId" = answer."applicationId"
WHERE answer."fieldKey" <> 'selectedAwards'
  AND NOT EXISTS (
    SELECT 1 FROM "NominationAnswer" existing
    WHERE existing."nominationApplicationId" = primary_nomination.nomination_id
      AND existing."fieldKey" = answer."fieldKey"
  );

WITH primary_nominations AS (
  SELECT DISTINCT ON (n."applicationId") n."applicationId", n."id" AS nomination_id
  FROM "NominationApplication" n
  JOIN "Application" a ON a."id" = n."applicationId"
  ORDER BY n."applicationId", (n."awardId" = a."awardId") DESC, n."createdAt", n."id"
)
INSERT INTO "NominationFile" (
  "id", "nominationApplicationId", "fieldKey", "fileName", "fileUrl",
  "originalFileName", "displayFileName", "mimeType", "fileSize",
  "originalFileSize", "compressedFileSize", "storageKey", "createdAt"
)
SELECT
  'legacy_file_' || md5(file."id" || primary_nomination.nomination_id),
  primary_nomination.nomination_id,
  file."fieldKey",
  file."fileName",
  file."fileUrl",
  file."fileName",
  file."fileName",
  file."mimeType",
  file."fileSize",
  file."fileSize",
  file."fileSize",
  file."fileUrl",
  file."createdAt"
FROM "ApplicationFile" file
JOIN primary_nominations primary_nomination
  ON primary_nomination."applicationId" = file."applicationId"
WHERE NOT EXISTS (
  SELECT 1 FROM "NominationFile" existing
  WHERE existing."nominationApplicationId" = primary_nomination.nomination_id
    AND existing."fieldKey" = file."fieldKey"
    AND existing."fileUrl" = file."fileUrl"
);

-- The application-level heard-about value had no answer row in older releases.
WITH primary_nominations AS (
  SELECT DISTINCT ON (n."applicationId") n."applicationId", n."id" AS nomination_id
  FROM "NominationApplication" n
  ORDER BY n."applicationId", n."createdAt", n."id"
)
INSERT INTO "NominationAnswer" (
  "id", "nominationApplicationId", "fieldKey", "valueText", "createdAt"
)
SELECT
  'legacy_heard_' || md5(a."id"),
  primary_nomination.nomination_id,
  'heardAbout',
  a."heardAbout",
  a."createdAt"
FROM "Application" a
JOIN primary_nominations primary_nomination ON primary_nomination."applicationId" = a."id"
WHERE a."heardAbout" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "NominationAnswer" existing
    WHERE existing."nominationApplicationId" = primary_nomination.nomination_id
      AND existing."fieldKey" = 'heardAbout'
  );

-- Ensure every legacy application has a Payment owner and a valid purchase
-- manifest. Old Stripe sessions remain fulfillable by their session ID.
INSERT INTO "Payment" (
  "id", "source", "applicationId", "applicantProfileId", "provider",
  "applicantEmail", "amount", "currency", "status", "paidAt", "fulfilledAt",
  "stripeSessionId", "stripePaymentIntentId", "createdAt"
)
SELECT
  'pay_legacy_' || md5(a."id"),
  'COMPETITOR'::"PaymentSource",
  a."id",
  profile."id",
  'legacy_migration',
  lower(trim(a."email")),
  a."amount",
  a."currency",
  a."paymentStatus",
  a."paidAt",
  CASE WHEN a."paymentStatus" = 'PAID' THEN coalesce(a."paidAt", a."updatedAt") ELSE NULL END,
  a."stripeCheckoutSessionId",
  a."stripePaymentIntentId",
  a."createdAt"
FROM "Application" a
JOIN "Account" account
  ON lower(trim(account."email")) = lower(trim(a."email"))
 AND account."role" = 'APPLICANT'
JOIN "ApplicantProfile" profile ON profile."accountId" = account."id"
WHERE NOT EXISTS (
  SELECT 1 FROM "Payment" payment WHERE payment."applicationId" = a."id"
);

UPDATE "Payment" payment
SET
  "applicantProfileId" = profile."id",
  "applicantEmail" = coalesce(payment."applicantEmail", lower(trim(a."email")))
FROM "Application" a
JOIN "Account" account
  ON lower(trim(account."email")) = lower(trim(a."email"))
 AND account."role" = 'APPLICANT'
JOIN "ApplicantProfile" profile ON profile."accountId" = account."id"
WHERE payment."applicationId" = a."id";

UPDATE "Payment" payment
SET "purchaseManifest" = jsonb_build_object(
  'version', 1,
  'flowType', 'applicant_nomination_purchase',
  'source', 'public_apply',
  'locale', 'en',
  'createdAt', a."createdAt",
  'legacyApplicationId', a."id",
  'applicantProfileId', profile."id",
  'personalInfo', jsonb_build_object(
    'fullName', a."fullName",
    'email', lower(trim(a."email")),
    'phone', a."phone",
    'country', a."country",
    'stateProvince', a."stateProvince",
    'city', a."city",
    'professionalTitle', a."professionalTitle",
    'yearsExperience', a."yearsExperience",
    'websiteUrl', a."websiteUrl",
    'socialUrl', a."socialUrl",
    'reviewsUrl', a."reviewsUrl"
  ),
  'membership', jsonb_build_object(
    'isVerifiedMember', (a."membershipNumber" IS NOT NULL),
    'membershipNumber', a."membershipNumber",
    'membershipLevel', a."membershipLevel",
    'verificationSource', 'legacy_migration',
    'verifiedAt', NULL
  ),
  'selectedAwards', (
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'awardId', n."awardId",
      'awardName', award."name",
      'categoryId', n."categoryId",
      'categoryName', category."name",
      'categorySlug', category."slug"
    ) ORDER BY n."createdAt", n."id"), '[]'::jsonb)
    FROM "NominationApplication" n
    JOIN "Award" award ON award."id" = n."awardId"
    JOIN "Category" category ON category."id" = n."categoryId"
    WHERE n."applicationId" = a."id"
  ),
  'pricing', jsonb_build_object(
    'amountCents', payment."amount",
    'currency', payment."currency",
    'nominationCount', (SELECT count(*) FROM "NominationApplication" n WHERE n."applicationId" = a."id"),
    'billableCount', (SELECT count(*) FROM "NominationApplication" n WHERE n."applicationId" = a."id"),
    'isIbpaMember', (a."membershipNumber" IS NOT NULL)
  )
)
FROM "Application" a
JOIN "Account" account
  ON lower(trim(account."email")) = lower(trim(a."email"))
 AND account."role" = 'APPLICANT'
JOIN "ApplicantProfile" profile ON profile."accountId" = account."id"
WHERE payment."applicationId" = a."id"
  AND payment."purchaseManifest" IS NULL;

-- Preserve direct nomination payment links before removing the redundant FK.
UPDATE "NominationApplication" nomination
SET "purchasePaymentId" = payment."id"
FROM "Payment" payment
WHERE payment."nominationApplicationId" = nomination."id"
  AND nomination."purchasePaymentId" IS NULL;

UPDATE "NominationApplication" nomination
SET "purchasePaymentId" = (
  SELECT p."id"
  FROM "Payment" p
  WHERE p."applicationId" = nomination."applicationId"
  ORDER BY (p."status" = 'PAID') DESC, p."createdAt" DESC, p."id" DESC
  LIMIT 1
)
WHERE nomination."purchasePaymentId" IS NULL
  AND nomination."applicationId" IS NOT NULL
  AND EXISTS (SELECT 1 FROM "Payment" p WHERE p."applicationId" = nomination."applicationId");

-- Copy the live JudgeScore state into the account-owned jury review model.
INSERT INTO "JuryNominationReview" (
  "id", "nominationId", "juryProfileId", "status", "scoreData", "totalScore",
  "notes", "startedAt", "completedAt", "createdAt", "updatedAt"
)
SELECT
  'jrev_' || md5(score."id"),
  score."nominationApplicationId",
  coalesce(score."juryProfileId", profile."id"),
  CASE score."status"
    WHEN 'SUBMITTED' THEN 'COMPLETED'::"JuryReviewStatus"
    ELSE 'IN_PROGRESS'::"JuryReviewStatus"
  END,
  jsonb_build_object(
    'technical', score."technical",
    'aesthetic', score."aesthetic",
    'creativity', score."creativity",
    'impact', score."impact",
    'presentation', score."presentation"
  ),
  score."totalScore",
  score."comment",
  score."createdAt",
  score."submittedAt",
  score."createdAt",
  score."updatedAt"
FROM "JudgeScore" score
LEFT JOIN "JuryProfile" profile ON profile."juryApplicationId" = score."judgeId"
WHERE score."nominationApplicationId" IS NOT NULL
  AND coalesce(score."juryProfileId", profile."id") IS NOT NULL
ON CONFLICT ("nominationId", "juryProfileId") DO UPDATE SET
  "status" = excluded."status",
  "scoreData" = excluded."scoreData",
  "totalScore" = excluded."totalScore",
  "notes" = excluded."notes",
  "startedAt" = coalesce("JuryNominationReview"."startedAt", excluded."startedAt"),
  "completedAt" = excluded."completedAt",
  "updatedAt" = greatest("JuryNominationReview"."updatedAt", excluded."updatedAt");

-- Preserve duplicate applicant/award history as soft-deleted rows, then enforce
-- uniqueness only for active nominations.
WITH ranked_duplicates AS (
  SELECT
    n."id",
    row_number() OVER (
      PARTITION BY n."applicantProfileId", n."awardId"
      ORDER BY (n."paymentStatus" = 'PAID') DESC, n."updatedAt" DESC, n."createdAt" DESC, n."id" DESC
    ) AS row_number
  FROM "NominationApplication" n
)
UPDATE "NominationApplication" nomination
SET "deletedAt" = coalesce(nomination."deletedAt", CURRENT_TIMESTAMP)
FROM ranked_duplicates ranked
WHERE nomination."id" = ranked."id" AND ranked.row_number > 1;

CREATE UNIQUE INDEX "NominationApplication_active_applicantProfileId_awardId_key"
  ON "NominationApplication"("applicantProfileId", "awardId")
  WHERE "deletedAt" IS NULL;

-- Refuse destructive cleanup if any record could not be assigned to its new owner.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "NominationApplication" WHERE "applicantProfileId" IS NULL) THEN
    RAISE EXCEPTION 'Legacy cleanup aborted: nominations without applicant profiles remain';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "JudgeScore" score
    LEFT JOIN "JuryNominationReview" review
      ON review."nominationId" = score."nominationApplicationId"
     AND review."juryProfileId" = coalesce(
       score."juryProfileId",
       (SELECT profile."id" FROM "JuryProfile" profile WHERE profile."juryApplicationId" = score."judgeId")
     )
    WHERE review."id" IS NULL
  ) THEN
    RAISE EXCEPTION 'Legacy cleanup aborted: jury scores without nomination reviews remain';
  END IF;
END $$;

ALTER TABLE "NominationApplication" ALTER COLUMN "applicantProfileId" SET NOT NULL;

ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_applicationId_fkey";
ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_nominationApplicationId_fkey";
ALTER TABLE "NominationApplication" DROP CONSTRAINT IF EXISTS "NominationApplication_applicationId_fkey";

DROP INDEX IF EXISTS "Payment_nominationApplicationId_idx";
DROP INDEX IF EXISTS "NominationApplication_applicationId_awardId_key";
DROP INDEX IF EXISTS "NominationApplication_applicationId_idx";

ALTER TABLE "Payment" DROP COLUMN "applicationId";
ALTER TABLE "Payment" DROP COLUMN "nominationApplicationId";
ALTER TABLE "NominationApplication" DROP COLUMN "applicationId";

DROP TABLE "JudgeScore";
DROP TABLE "ApplicationAnswer";
DROP TABLE "ApplicationFile";
DROP TABLE "Application";

DROP TYPE "ScoreStatus";
DROP TYPE "ApplicationStatus";
