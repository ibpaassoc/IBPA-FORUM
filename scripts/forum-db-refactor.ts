import "dotenv/config";

import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client, type ClientBase } from "pg";
import {
  juryInformationRequestsSchema,
  nominationAnswersSchema,
  promoCodesSettingSchema,
  regulationsSettingSchema,
  storedFilesSchema,
  ticketActivitySchema,
  ticketCredentialSchema,
} from "@/features/database/json-fields";

const TARGET_SCHEMA = "forum_next";
const TARGET_TABLES = [
  "Account",
  "ApplicantProfile",
  "JuryApplication",
  "JuryProfile",
  "JuryNominationReview",
  "Nomination",
  "Award",
  "Category",
  "Ticket",
  "Payment",
  "StripeWebhook",
  "SiteSetting",
  "Test",
] as const;

const PROTECTED_BRANCH_IDS = new Set([
  // Neon console production branch and the separately connected audited source.
  "br-ancient-night-aknk0wql",
  "br-nameless-block-akc62q54",
]);

const PROTECTED_APPLICANTS = [
  "annakrainik86@gmail.com",
  "elenamutalieva@gmail.com",
  "farangizkarimava15@gmail.com",
  "9868851@gmail.com",
] as const;

type Mode = "manifest" | "dry-run" | "apply" | "validate" | "file-manifest";

type CliOptions = {
  mode: Mode;
  expectedBranchId?: string;
  outputDirectory: string;
};

function parseOptions(): CliOptions {
  const mode = process.argv[2] as Mode | undefined;
  if (!mode || !["manifest", "dry-run", "apply", "validate", "file-manifest"].includes(mode)) {
    throw new Error(
      "Usage: tsx scripts/forum-db-refactor.ts <manifest|dry-run|apply|validate|file-manifest> " +
        "[--expected-branch <branch-id>] [--output <directory>]",
    );
  }

  let expectedBranchId: string | undefined;
  let outputDirectory = path.resolve(process.cwd(), ".local-audit", "forum-db-refactor");
  for (let index = 3; index < process.argv.length; index += 1) {
    const value = process.argv[index];
    if (value === "--expected-branch") expectedBranchId = process.argv[++index];
    else if (value === "--output") outputDirectory = path.resolve(process.argv[++index]);
    else throw new Error(`Unknown argument: ${value}`);
  }
  return { mode, expectedBranchId, outputDirectory };
}

function targetConnectionString() {
  const value = process.env.FORUM_MIGRATION_DATABASE_URL;
  if (value) return value;
  const branchHost = process.env.FORUM_MIGRATION_BRANCH_HOST;
  const source = process.env.DATABASE_URL;
  if (branchHost && source) {
    if (!/^[a-z0-9.-]+\.neon\.tech$/i.test(branchHost)) {
      throw new Error("FORUM_MIGRATION_BRANCH_HOST must be a Neon hostname.");
    }
    const target = new URL(source);
    target.hostname = branchHost;
    return target.toString();
  }
  throw new Error(
    "Set FORUM_MIGRATION_DATABASE_URL, or set FORUM_MIGRATION_BRANCH_HOST to reuse the existing Neon role securely.",
  );
}

async function neonIdentity(client: ClientBase) {
  const result = await client.query<{
    branch_id: string | null;
    project_id: string | null;
    database_name: string;
  }>(`
    SELECT
      current_setting('neon.branch_id', true) AS branch_id,
      current_setting('neon.project_id', true) AS project_id,
      current_database() AS database_name
  `);
  return result.rows[0];
}

async function assertSafeTarget(client: ClientBase, expectedBranchId: string | undefined, write: boolean) {
  const identity = await neonIdentity(client);
  if (write && !expectedBranchId) {
    throw new Error("Apply requires --expected-branch so a copied production URL cannot be used accidentally.");
  }
  if (expectedBranchId && identity.branch_id !== expectedBranchId) {
    throw new Error(`Connected Neon branch ${identity.branch_id ?? "unknown"} does not match ${expectedBranchId}.`);
  }
  if (write && (!identity.branch_id || PROTECTED_BRANCH_IDS.has(identity.branch_id))) {
    throw new Error(`Refusing to write to protected Neon branch ${identity.branch_id ?? "unknown"}.`);
  }
  return identity;
}

async function tableExists(client: ClientBase, schema: string, table: string) {
  const result = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = $1 AND table_name = $2 AND table_type = 'BASE TABLE'
    ) AS exists`,
    [schema, table],
  );
  return result.rows[0]?.exists ?? false;
}

async function columnExists(client: ClientBase, table: string, column: string) {
  const result = await client.query<{ exists: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
      ) AS exists
    `,
    [table, column],
  );
  return result.rows[0]?.exists ?? false;
}

function jsonValue(value: unknown) {
  return JSON.stringify(value);
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function counts(client: ClientBase, schema: string) {
  const tables = await client.query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_type = 'BASE TABLE' ORDER BY table_name`,
    [schema],
  );
  const result: Record<string, number> = {};
  for (const { table_name: table } of tables.rows) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(table)) continue;
    const count = await client.query<{ count: number }>(
      `SELECT count(*)::int AS count FROM "${schema}"."${table}"`,
    );
    result[table] = count.rows[0]?.count ?? 0;
  }
  return result;
}

async function protectedApplicantReport(client: ClientBase, schema: "public" | typeof TARGET_SCHEMA) {
  const target = schema === TARGET_SCHEMA;
  const nominationTable = target ? `"${TARGET_SCHEMA}"."Nomination"` : `public."NominationApplication"`;
  const answerExpression = target
    ? `COALESCE((SELECT sum(jsonb_array_length(n2."answers"->'fields')) FROM "${TARGET_SCHEMA}"."Nomination" n2 JOIN "${TARGET_SCHEMA}"."ApplicantProfile" p2 ON p2.id=n2."applicantProfileId" JOIN "${TARGET_SCHEMA}"."Account" a2 ON a2.id=p2."accountId" WHERE lower(trim(a2.email))=requested.email AND a2.role::text='APPLICANT'), 0)::int`
    : `COALESCE((SELECT count(*) FROM public."NominationAnswer" answer JOIN public."NominationApplication" n2 ON n2.id=answer."nominationApplicationId" JOIN public."ApplicantProfile" p2 ON p2.id=n2."applicantProfileId" JOIN public."Account" a2 ON a2.id=p2."accountId" WHERE lower(trim(a2.email))=requested.email AND a2.role::text='APPLICANT'), 0)::int`;
  const fileExpression = target
    ? `COALESCE((SELECT sum(jsonb_array_length(n2."files"->'items')) FROM "${TARGET_SCHEMA}"."Nomination" n2 JOIN "${TARGET_SCHEMA}"."ApplicantProfile" p2 ON p2.id=n2."applicantProfileId" JOIN "${TARGET_SCHEMA}"."Account" a2 ON a2.id=p2."accountId" WHERE lower(trim(a2.email))=requested.email AND a2.role::text='APPLICANT'), 0)::int`
    : `COALESCE((SELECT count(*) FROM public."NominationFile" file JOIN public."NominationApplication" n2 ON n2.id=file."nominationApplicationId" JOIN public."ApplicantProfile" p2 ON p2.id=n2."applicantProfileId" JOIN public."Account" a2 ON a2.id=p2."accountId" WHERE file."deletedAt" IS NULL AND lower(trim(a2.email))=requested.email AND a2.role::text='APPLICANT'), 0)::int`;

  const result = await client.query(
    `
      SELECT
        requested.email,
        COALESCE((SELECT array_agg(a.id ORDER BY a.id) FROM "${schema}"."Account" a WHERE lower(trim(a.email))=requested.email AND a.role::text='APPLICANT'), ARRAY[]::text[]) AS "accountIds",
        (SELECT count(*)::int FROM "${schema}"."Account" a WHERE lower(trim(a.email))=requested.email AND a.role::text='APPLICANT') AS "accountCount",
        COALESCE((SELECT array_agg(p.id ORDER BY p.id) FROM "${schema}"."ApplicantProfile" p JOIN "${schema}"."Account" a ON a.id=p."accountId" WHERE lower(trim(a.email))=requested.email AND a.role::text='APPLICANT'), ARRAY[]::text[]) AS "profileIds",
        (SELECT count(*)::int FROM "${schema}"."ApplicantProfile" p JOIN "${schema}"."Account" a ON a.id=p."accountId" WHERE lower(trim(a.email))=requested.email AND a.role::text='APPLICANT') AS "profileCount",
        COALESCE((SELECT array_agg(n.id ORDER BY n.id) FROM ${nominationTable} n JOIN "${schema}"."ApplicantProfile" p ON p.id=n."applicantProfileId" JOIN "${schema}"."Account" a ON a.id=p."accountId" WHERE lower(trim(a.email))=requested.email AND a.role::text='APPLICANT'), ARRAY[]::text[]) AS "nominationIds",
        (SELECT count(*)::int FROM ${nominationTable} n JOIN "${schema}"."ApplicantProfile" p ON p.id=n."applicantProfileId" JOIN "${schema}"."Account" a ON a.id=p."accountId" WHERE lower(trim(a.email))=requested.email AND a.role::text='APPLICANT') AS "nominationCount",
        ${answerExpression} AS "answerCount",
        ${fileExpression} AS "fileCount",
        COALESCE((SELECT max(CASE WHEN a."passwordHash" IS NOT NULL AND a."passwordHash" <> '' THEN 1 ELSE 0 END)::int FROM "${schema}"."Account" a WHERE lower(trim(a.email))=requested.email AND a.role::text='APPLICANT'),0) AS "hasPasswordHash",
        COALESCE((SELECT max(CASE WHEN a."setupTokenHash" IS NOT NULL AND a."setupTokenUsedAt" IS NULL AND a."setupTokenExpiresAt">now() THEN 1 ELSE 0 END)::int FROM "${schema}"."Account" a WHERE lower(trim(a.email))=requested.email AND a.role::text='APPLICANT'),0) AS "hasActiveSetupToken",
        COALESCE((SELECT array_agg(DISTINCT encode(sha256(convert_to(a."passwordHash", 'UTF8')), 'hex')) FROM "${schema}"."Account" a WHERE lower(trim(a.email))=requested.email AND a.role::text='APPLICANT' AND a."passwordHash" IS NOT NULL), ARRAY[]::text[]) AS "passwordHashFingerprints"
      FROM unnest($1::text[]) AS requested(email)
      ORDER BY requested.email
    `,
    [PROTECTED_APPLICANTS],
  );
  return result.rows;
}

async function buildManifest(client: ClientBase, outputDirectory: string, label: string) {
  const identity = await neonIdentity(client);
  const sourceCounts = await counts(client, "public");
  const targetCounts = (await tableExists(client, TARGET_SCHEMA, "Account"))
    ? await counts(client, TARGET_SCHEMA)
    : {};
  const protectedBefore = await protectedApplicantReport(client, "public");
  const protectedAfter = targetCounts.Account
    ? await protectedApplicantReport(client, TARGET_SCHEMA)
    : [];
  const relationCounts = await client.query(`
    SELECT jsonb_build_object(
      'activeNominationFiles', (SELECT count(*) FROM public."NominationFile" WHERE "deletedAt" IS NULL),
      'softDeletedNominationFiles', (SELECT count(*) FROM public."NominationFile" WHERE "deletedAt" IS NOT NULL),
      'nominationAnswers', (SELECT count(*) FROM public."NominationAnswer"),
      'juryApplicationFiles', (SELECT count(*) FROM public."JuryApplicationFile"),
      'nominationsWithoutPurchasePayment', (SELECT count(*) FROM public."NominationApplication" WHERE "purchasePaymentId" IS NULL),
      'applicantCheckInCredentials', (SELECT count(*) FROM public."ApplicantCheckInCredential"),
      'ticketQrCredentials', (SELECT count(*) FROM public."TicketQrCredential"),
      'ticketActivities', (SELECT count(*) FROM public."TicketActivity")
    ) AS value
  `);
  const fileObjects = await client.query(`
    SELECT 'nomination' AS kind, id, "nominationApplicationId" AS "ownerId", "fieldKey",
           "storageKey" AS "blobKey", "fileUrl" AS url, "fileName" AS filename,
           "mimeType", "fileSize" AS size, "deletedAt", "createdAt"
    FROM public."NominationFile"
    UNION ALL
    SELECT 'jury' AS kind, id, "juryApplicationId" AS "ownerId", "fieldKey",
           "storageKey" AS "blobKey", NULL AS url, "fileName" AS filename,
           "mimeType", "fileSize" AS size, NULL AS "deletedAt", "createdAt"
    FROM public."JuryApplicationFile"
    ORDER BY kind, "ownerId", id
  `);
  const manifest = {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    label,
    neon: identity,
    sourceCounts,
    targetCounts,
    relations: relationCounts.rows[0]?.value ?? {},
    protectedApplicants: { before: protectedBefore, after: protectedAfter },
    fileObjects: fileObjects.rows,
  };
  await mkdir(outputDirectory, { recursive: true });
  const file = path.join(outputDirectory, `${label}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  await writeFile(file, `${JSON.stringify(manifest, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  return { file, manifest };
}

async function dryRunChecks(client: ClientBase) {
  const ambiguousPayments = await client.query(`
    WITH candidates AS (
      SELECT n.id AS nomination_id, p.id AS payment_id,
        CASE
          WHEN p.id = n."purchasePaymentId" THEN 1
          WHEN p.id = n."paymentId" THEN 2
          WHEN p."nominationApplicationId" = n.id THEN 3
          WHEN p."applicationId" = n."applicationId" THEN 4
          ELSE 99
        END AS priority,
        p.status::text AS status
      FROM public."NominationApplication" n
      JOIN public."Payment" p ON
        p.id = n."purchasePaymentId"
        OR p.id = n."paymentId"
        OR p."nominationApplicationId" = n.id
        OR (n."applicationId" IS NOT NULL AND p."applicationId" = n."applicationId")
      WHERE n."dataScope"::text <> 'TEST'
    ), best_priority AS (
      SELECT nomination_id, min(priority) AS priority FROM candidates GROUP BY nomination_id
    )
    SELECT count(*)::int AS count
    FROM (
      SELECT c.nomination_id
      FROM candidates c
      JOIN best_priority b USING (nomination_id, priority)
      GROUP BY c.nomination_id
      HAVING count(*) FILTER (WHERE c.status = 'PAID') > 1
        OR (count(*) FILTER (WHERE c.status = 'PAID') = 0 AND count(*) > 1)
    ) ambiguous
  `);
  const duplicateActiveNominations = await client.query(`
    SELECT count(*)::int AS count FROM (
      SELECT "applicantProfileId", "awardId"
      FROM public."NominationApplication"
      WHERE "dataScope"::text <> 'TEST' AND "deletedAt" IS NULL
      GROUP BY 1, 2 HAVING count(*) > 1
    ) duplicates
  `);
  const missingPaymentEmails = await client.query(`
    SELECT count(*)::int AS count
    FROM public."Payment" p
    LEFT JOIN public."ApplicantProfile" ap ON ap.id = p."applicantProfileId"
    LEFT JOIN public."Account" aa ON aa.id = ap."accountId"
    LEFT JOIN public."JuryApplication" ja ON ja.id = p."juryApplicationId"
    LEFT JOIN public."Ticket" t ON t.id = p."ticketId"
    LEFT JOIN public."Account" legacy_account ON legacy_account.id = p."applicantAccountId"
    LEFT JOIN public."Application" legacy_application ON legacy_application.id = p."applicationId"
    WHERE p."dataScope"::text <> 'TEST'
      AND COALESCE(NULLIF(p."applicantEmail", ''), NULLIF(p."applicantEmailSnapshot", ''), NULLIF(t.email, ''),
        NULLIF(ja.email, ''), NULLIF(aa.email, ''), NULLIF(legacy_account.email, ''), NULLIF(legacy_application.email, '')) IS NULL
  `);
  return {
    ambiguousPaymentMappings: ambiguousPayments.rows[0]?.count ?? 0,
    duplicateActiveOwnerAwards: duplicateActiveNominations.rows[0]?.count ?? 0,
    paymentsWithoutCustomerEmail: missingPaymentEmails.rows[0]?.count ?? 0,
  };
}

async function createTargetSchema(client: ClientBase) {
  const exists = await tableExists(client, TARGET_SCHEMA, "Account");
  if (exists) {
    const tables = await client.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_type = 'BASE TABLE'`,
      [TARGET_SCHEMA],
    );
    const actual = new Set(tables.rows.map((row) => row.table_name));
    const missing = TARGET_TABLES.filter((table) => !actual.has(table));
    if (missing.length) throw new Error(`Target schema is partial; missing tables: ${missing.join(", ")}`);
    const targetColumns = await client.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name='Ticket'`,
      [TARGET_SCHEMA],
    );
    const columns = new Set(targetColumns.rows.map((row) => row.column_name));
    if (columns.has("qrToken") && !columns.has("secureToken")) {
      await client.query(`ALTER TABLE "${TARGET_SCHEMA}"."Ticket" RENAME COLUMN "qrToken" TO "secureToken"`);
    }
    if (columns.has("lastCheckInAt") && !columns.has("lastCheckIn")) {
      await client.query(`ALTER TABLE "${TARGET_SCHEMA}"."Ticket" RENAME COLUMN "lastCheckInAt" TO "lastCheckIn"`);
    }
    await client.query(`UPDATE "${TARGET_SCHEMA}"."Ticket" SET phone='' WHERE phone IS NULL`);
    await client.query(`ALTER TABLE "${TARGET_SCHEMA}"."Ticket" ALTER COLUMN phone SET NOT NULL`);
    await client.query(`
      ALTER TABLE "${TARGET_SCHEMA}"."Test"
        DROP CONSTRAINT IF EXISTS "Test_created_records_shape",
        DROP CONSTRAINT IF EXISTS "Test_email_deliveries_shape";
      ALTER TABLE "${TARGET_SCHEMA}"."Test"
        ADD CONSTRAINT "Test_created_records_shape" CHECK (
          jsonb_typeof("createdRecords") = 'object'
          AND "createdRecords"->>'schemaVersion' = '1'
          AND jsonb_typeof("createdRecords"->'accounts') = 'array'
          AND jsonb_typeof("createdRecords"->'applicantProfiles') = 'array'
          AND jsonb_typeof("createdRecords"->'juryApplications') = 'array'
          AND jsonb_typeof("createdRecords"->'juryProfiles') = 'array'
          AND jsonb_typeof("createdRecords"->'nominations') = 'array'
          AND jsonb_typeof("createdRecords"->'reviews') = 'array'
          AND jsonb_typeof("createdRecords"->'tickets') = 'array'
          AND jsonb_typeof("createdRecords"->'payments') = 'array'
          AND jsonb_typeof("createdRecords"->'webhookEvents') = 'array'
          AND jsonb_typeof("createdRecords"->'blobKeys') = 'array'
        ),
        ADD CONSTRAINT "Test_email_deliveries_shape" CHECK (
          jsonb_typeof("emailDeliveries") = 'object'
          AND "emailDeliveries"->>'schemaVersion' = '1'
          AND jsonb_typeof("emailDeliveries"->'deliveries') = 'array'
        );
    `);
    return false;
  }
  const schemaExists = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = $1) AS exists`,
    [TARGET_SCHEMA],
  );
  if (schemaExists.rows[0]?.exists) {
    throw new Error(`Schema ${TARGET_SCHEMA} exists without the Account table; refusing to repair a partial apply.`);
  }
  const migrationFile = path.resolve(
    process.cwd(),
    "prisma",
    "migrations",
    "20260807120000_forum_database_refactor",
    "migration.sql",
  );
  await client.query(await readFile(migrationFile, "utf8"));
  return true;
}

async function migrateCatalogAndAccounts(client: ClientBase) {
  await client.query(`
    INSERT INTO "${TARGET_SCHEMA}"."Category" (id, name, slug, "createdAt", "updatedAt")
    SELECT id, name, slug, "createdAt", "createdAt" FROM public."Category"
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug;

    INSERT INTO "${TARGET_SCHEMA}"."Award" (id, name, "categoryId", "createdAt", "updatedAt")
    SELECT a.id, a.name, a."categoryId", a."createdAt", a."createdAt"
    FROM public."Award" a JOIN "${TARGET_SCHEMA}"."Category" c ON c.id = a."categoryId"
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, "categoryId" = EXCLUDED."categoryId";

    INSERT INTO "${TARGET_SCHEMA}"."Account" (
      id, email, "normalizedEmail", "passwordHash", role, status,
      "setupTokenHash", "setupTokenPurpose", "setupTokenExpiresAt", "setupTokenIssuedAt", "setupTokenUsedAt",
      "lastSetupEmailSentAt", "lastSetupEmailDeliveryStatus", "lastSetupEmailDeliveryError",
      "createdAt", "updatedAt", "dataScope"
    )
    SELECT id, email, "normalizedEmail", "passwordHash", role::text::"${TARGET_SCHEMA}"."AccountRole",
      CASE WHEN "deletedAt" IS NOT NULL THEN 'DISABLED' ELSE status::text END::"${TARGET_SCHEMA}"."AccountStatus",
      "setupTokenHash",
      CASE WHEN "setupTokenHash" IS NOT NULL THEN 'SETUP'::"${TARGET_SCHEMA}"."AccountSetupTokenPurpose" END,
      "setupTokenExpiresAt", "setupTokenIssuedAt", "setupTokenUsedAt",
      "lastSetupEmailSentAt", "lastSetupEmailDeliveryStatus", "lastSetupEmailDeliveryError",
      "createdAt", "updatedAt", "dataScope"::text::"${TARGET_SCHEMA}"."DataScope"
    FROM public."Account" WHERE "dataScope"::text <> 'TEST'
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      "normalizedEmail" = EXCLUDED."normalizedEmail",
      "passwordHash" = EXCLUDED."passwordHash",
      role = EXCLUDED.role,
      status = EXCLUDED.status,
      "updatedAt" = EXCLUDED."updatedAt";

    INSERT INTO "${TARGET_SCHEMA}"."Account" (
      id, email, "normalizedEmail", "passwordHash", role, status, "createdAt", "updatedAt", "dataScope"
    )
    SELECT 'jury-account-' || md5(j.id), j.email, lower(trim(j.email)), NULL,
      'JURY'::"${TARGET_SCHEMA}"."AccountRole", 'INVITED'::"${TARGET_SCHEMA}"."AccountStatus",
      j."createdAt", j."updatedAt", j."dataScope"::text::"${TARGET_SCHEMA}"."DataScope"
    FROM public."JuryApplication" j
    WHERE j."dataScope"::text <> 'TEST'
      AND NOT EXISTS (
        SELECT 1 FROM "${TARGET_SCHEMA}"."Account" a
        WHERE a."normalizedEmail" = lower(trim(j.email)) AND a.role = 'JURY'
      )
    ON CONFLICT ("normalizedEmail", role) DO NOTHING;

    UPDATE "${TARGET_SCHEMA}"."Account" target
    SET "setupTokenHash" = token."tokenHash",
        "setupTokenPurpose" = token.purpose::text::"${TARGET_SCHEMA}"."AccountSetupTokenPurpose",
        "setupTokenExpiresAt" = token."expiresAt",
        "setupTokenIssuedAt" = token."createdAt",
        "setupTokenUsedAt" = token."usedAt"
    FROM (
      SELECT DISTINCT ON ("accountId") "accountId", "tokenHash", purpose, "expiresAt", "usedAt", "createdAt"
      FROM public."AccountSetupToken"
      WHERE "dataScope"::text <> 'TEST'
      ORDER BY "accountId", "createdAt" DESC, id DESC
    ) token
    WHERE target.id = token."accountId"
      AND (target."setupTokenIssuedAt" IS NULL OR token."createdAt" >= target."setupTokenIssuedAt");

    INSERT INTO "${TARGET_SCHEMA}"."ApplicantProfile" (
      id, "accountId", "fullName", phone, country, "stateProvince", city, "professionalTitle",
      "yearsExperience", "membershipNumber", "membershipLevel", "preferredLocale", "websiteUrl",
      "socialUrl", "reviewsUrl", "deadlineOverrideAt", "createdAt", "updatedAt", "dataScope"
    )
    SELECT p.id, p."accountId", p."fullName", p.phone, p.country, p."stateProvince", p.city,
      p."professionalTitle", p."yearsExperience", p."membershipNumber", p."membershipLevel",
      p."preferredLocale", p."websiteUrl", p."socialUrl", p."reviewsUrl", p."deadlineOverrideAt",
      p."createdAt", p."updatedAt", p."dataScope"::text::"${TARGET_SCHEMA}"."DataScope"
    FROM public."ApplicantProfile" p
    JOIN "${TARGET_SCHEMA}"."Account" a ON a.id = p."accountId"
    WHERE p."dataScope"::text <> 'TEST'
    ON CONFLICT (id) DO UPDATE SET
      "accountId" = EXCLUDED."accountId", "fullName" = EXCLUDED."fullName", phone = EXCLUDED.phone,
      country = EXCLUDED.country, "stateProvince" = EXCLUDED."stateProvince", city = EXCLUDED.city,
      "professionalTitle" = EXCLUDED."professionalTitle", "yearsExperience" = EXCLUDED."yearsExperience",
      "membershipNumber" = EXCLUDED."membershipNumber", "membershipLevel" = EXCLUDED."membershipLevel",
      "preferredLocale" = EXCLUDED."preferredLocale", "websiteUrl" = EXCLUDED."websiteUrl",
      "socialUrl" = EXCLUDED."socialUrl", "reviewsUrl" = EXCLUDED."reviewsUrl",
      "deadlineOverrideAt" = EXCLUDED."deadlineOverrideAt", "updatedAt" = EXCLUDED."updatedAt";
  `);
}

async function migrateJuryApplications(client: ClientBase) {
  const applications = await client.query<Record<string, unknown> & { files: unknown[] }>(`
    SELECT j.*,
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', f.id, 'fieldId', f."fieldKey", 'blobKey', f."storageKey",
          'url', NULL, 'filename', f."fileName", 'mimeType', f."mimeType",
          'size', f."fileSize", 'uploadedAt', to_char(f."createdAt" AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
        ) ORDER BY f."createdAt", f.id)
        FROM public."JuryApplicationFile" f WHERE f."juryApplicationId" = j.id
      ), '[]'::jsonb) AS files
    FROM public."JuryApplication" j
    WHERE j."dataScope"::text <> 'TEST'
    ORDER BY j."createdAt", j.id
  `);
  const sql = `
    INSERT INTO "${TARGET_SCHEMA}"."JuryApplication" (
      id, "accountId", "fullName", email, phone, country, city, "professionalTitle", "yearsExperience",
      "employerAffiliation", "membershipStatus", "membershipLevel", "previousJudgingExperience",
      "previousJudgingDetails", "pastWinner", "pastWinnerYear", "expertiseAreas", "professionalBio",
      "professionalWebsite", "conflictDisclosure", motivation, "ibpaAssociationMember", "ibpaNumber",
      status, "informationRequestTokenHash", "informationRequests", files, "submittedAt", "approvedAt",
      "rejectedAt", "adminNotes", "createdAt", "updatedAt", "dataScope"
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,
      $24::"${TARGET_SCHEMA}"."JuryApplicationStatus",$25,$26::jsonb,$27::jsonb,$28,$29,$30,$31,$32,$33,
      $34::"${TARGET_SCHEMA}"."DataScope"
    )
    ON CONFLICT (id) DO UPDATE SET
      "accountId"=EXCLUDED."accountId", "fullName"=EXCLUDED."fullName", email=EXCLUDED.email,
      phone=EXCLUDED.phone, country=EXCLUDED.country, city=EXCLUDED.city,
      "professionalTitle"=EXCLUDED."professionalTitle", "yearsExperience"=EXCLUDED."yearsExperience",
      "employerAffiliation"=EXCLUDED."employerAffiliation", "membershipStatus"=EXCLUDED."membershipStatus",
      "membershipLevel"=EXCLUDED."membershipLevel", "previousJudgingExperience"=EXCLUDED."previousJudgingExperience",
      "previousJudgingDetails"=EXCLUDED."previousJudgingDetails", "pastWinner"=EXCLUDED."pastWinner",
      "pastWinnerYear"=EXCLUDED."pastWinnerYear", "expertiseAreas"=EXCLUDED."expertiseAreas",
      "professionalBio"=EXCLUDED."professionalBio", "professionalWebsite"=EXCLUDED."professionalWebsite",
      "conflictDisclosure"=EXCLUDED."conflictDisclosure", motivation=EXCLUDED.motivation,
      "ibpaAssociationMember"=EXCLUDED."ibpaAssociationMember", "ibpaNumber"=EXCLUDED."ibpaNumber",
      status=EXCLUDED.status, "informationRequestTokenHash"=EXCLUDED."informationRequestTokenHash",
      "informationRequests"=EXCLUDED."informationRequests", files=EXCLUDED.files,
      "submittedAt"=EXCLUDED."submittedAt", "approvedAt"=EXCLUDED."approvedAt",
      "rejectedAt"=EXCLUDED."rejectedAt", "adminNotes"=EXCLUDED."adminNotes", "updatedAt"=EXCLUDED."updatedAt";
  `;
  for (const row of applications.rows) {
    const account = await client.query<{ id: string }>(
      `SELECT id FROM "${TARGET_SCHEMA}"."Account" WHERE "normalizedEmail" = lower(trim($1)) AND role = 'JURY' LIMIT 1`,
      [row.email],
    );
    if (!account.rows[0]) throw new Error(`No target jury account for application ${String(row.id)}`);
    const requests = row.infoRequestDetails
      ? {
          schemaVersion: 1,
          requests: [
            {
              message: row.infoRequestDetails,
              requestedAt: row.infoRequestedAt,
              resolvedAt: row.infoResubmittedAt ?? null,
              response: null,
            },
          ],
        }
      : { schemaVersion: 1, requests: [] };
    await client.query(sql, [
      row.id, account.rows[0].id, row.fullName, row.email, row.phone, row.country, row.city,
      row.professionalTitle, row.yearsExperience, row.employerAffiliation, row.membershipStatus,
      row.membershipLevel, row.previousJudgingExperience, row.previousJudgingDetails, row.pastWinner,
      row.pastWinnerYear, row.expertiseAreas, row.professionalBio, row.professionalWebsite,
      row.conflictDisclosure, row.motivation, row.ibpaAssociationMember, row.ibpaNumber, row.status,
      typeof row.infoRequestToken === "string" && row.infoRequestToken ? sha256(row.infoRequestToken) : null,
      jsonValue(requests), jsonValue({ schemaVersion: 1, items: row.files }), row.submittedAt, row.approvedAt,
      row.rejectedAt, row.adminNotes, row.createdAt, row.updatedAt, row.dataScope,
    ]);
  }

  await client.query(`
    INSERT INTO "${TARGET_SCHEMA}"."JuryProfile" (
      id, "accountId", "juryApplicationId", "fullName", phone, country, city, "professionalTitle",
      "yearsExperience", "employerAffiliation", "expertiseAreas", "approvedCategories", "professionalBio",
      "professionalWebsite", "createdAt", "updatedAt", "dataScope"
    )
    SELECT p.id, p."accountId", p."juryApplicationId", p."fullName", p.phone, p.country, p.city,
      p."professionalTitle", p."yearsExperience", p."employerAffiliation", p."expertiseAreas",
      p."approvedCategories", p."professionalBio", p."professionalWebsite", p."createdAt", p."updatedAt",
      p."dataScope"::text::"${TARGET_SCHEMA}"."DataScope"
    FROM public."JuryProfile" p
    JOIN "${TARGET_SCHEMA}"."Account" a ON a.id = p."accountId"
    JOIN "${TARGET_SCHEMA}"."JuryApplication" j ON j.id = p."juryApplicationId"
    WHERE p."dataScope"::text <> 'TEST'
    ON CONFLICT (id) DO UPDATE SET
      "accountId"=EXCLUDED."accountId", "juryApplicationId"=EXCLUDED."juryApplicationId",
      "fullName"=EXCLUDED."fullName", phone=EXCLUDED.phone, country=EXCLUDED.country, city=EXCLUDED.city,
      "professionalTitle"=EXCLUDED."professionalTitle", "yearsExperience"=EXCLUDED."yearsExperience",
      "employerAffiliation"=EXCLUDED."employerAffiliation", "expertiseAreas"=EXCLUDED."expertiseAreas",
      "approvedCategories"=EXCLUDED."approvedCategories", "professionalBio"=EXCLUDED."professionalBio",
      "professionalWebsite"=EXCLUDED."professionalWebsite", "updatedAt"=EXCLUDED."updatedAt";
  `);
}

async function migratePaymentsAndNominations(client: ClientBase) {
  await client.query(`
    INSERT INTO "${TARGET_SCHEMA}"."Payment" (
      id, "accountId", "juryApplicationId", "customerEmail", amount, currency, status, "purchaseType",
      provider, "stripeCheckoutSessionId", "stripePaymentIntentId", "pricingSnapshot", "promotionSnapshot",
      "refundSnapshot", "paidAt", "fulfilledAt", "refundedAt", "createdAt", "updatedAt", "dataScope"
    )
    SELECT p.id,
      COALESCE(ap."accountId", ja."accountId", legacy_target.id),
      CASE WHEN p.source::text = 'JURY' THEN p."juryApplicationId" END,
      COALESCE(NULLIF(p."applicantEmail", ''), NULLIF(p."applicantEmailSnapshot", ''), NULLIF(t.email, ''),
               NULLIF(j.email, ''), NULLIF(a.email, ''), NULLIF(legacy_account.email, ''),
               NULLIF(legacy_application.email, ''), 'unknown+migrated@invalid.local'),
      p.amount, lower(p.currency), p.status::text::"${TARGET_SCHEMA}"."PaymentStatus",
      CASE p.source::text WHEN 'COMPETITOR' THEN 'NOMINATION' ELSE p.source::text END::"${TARGET_SCHEMA}"."PaymentPurchaseType",
      CASE WHEN lower(COALESCE(p.provider, 'stripe')) = 'manual' THEN 'MANUAL' ELSE 'STRIPE' END::"${TARGET_SCHEMA}"."PaymentProvider",
      p."stripeSessionId", p."stripePaymentIntentId",
      jsonb_strip_nulls(jsonb_build_object(
        'schemaVersion', 1, 'legacyManifest', p."purchaseManifest", 'legacyNominationSelections', p."nominationSelectionsJson",
        'membership', jsonb_strip_nulls(jsonb_build_object('isMember', p."isIbpaMemberSnapshot", 'number', p."membershipNumberSnapshot"))
      )),
      CASE WHEN p."promoCodeKey" IS NULL AND p."promoCodeKeyword" IS NULL THEN NULL ELSE
        jsonb_strip_nulls(jsonb_build_object('schemaVersion',1,'key',p."promoCodeKey",'keyword',p."promoCodeKeyword",
          'discountPercent',p."promoDiscountPercent",'discountAmount',p."promoDiscountAmount")) END,
      CASE WHEN p.status::text = 'REFUNDED' THEN jsonb_build_object('schemaVersion',1,'migratedStatus','REFUNDED') END,
      p."paidAt", p."fulfilledAt", CASE WHEN p.status::text = 'REFUNDED' THEN COALESCE(p."fulfilledAt", p."paidAt") END,
      p."createdAt", COALESCE(p."fulfilledAt", p."paidAt", p."createdAt"), p."dataScope"::text::"${TARGET_SCHEMA}"."DataScope"
    FROM public."Payment" p
    LEFT JOIN public."ApplicantProfile" source_ap ON source_ap.id = p."applicantProfileId"
    LEFT JOIN "${TARGET_SCHEMA}"."ApplicantProfile" ap ON ap.id = source_ap.id
    LEFT JOIN "${TARGET_SCHEMA}"."JuryApplication" ja ON ja.id = p."juryApplicationId"
    LEFT JOIN public."JuryApplication" j ON j.id = p."juryApplicationId"
    LEFT JOIN public."Ticket" t ON t.id = p."ticketId"
    LEFT JOIN "${TARGET_SCHEMA}"."Account" a ON a.id = COALESCE(ap."accountId", ja."accountId")
    LEFT JOIN public."Account" legacy_account ON legacy_account.id = p."applicantAccountId"
    LEFT JOIN "${TARGET_SCHEMA}"."Account" legacy_target ON legacy_target.id = legacy_account.id
    LEFT JOIN public."Application" legacy_application ON legacy_application.id = p."applicationId"
    WHERE p."dataScope"::text <> 'TEST'
      AND NOT (p.source::text = 'JURY' AND ja.id IS NULL)
    ON CONFLICT (id) DO UPDATE SET
      "accountId"=EXCLUDED."accountId", "juryApplicationId"=EXCLUDED."juryApplicationId",
      "customerEmail"=EXCLUDED."customerEmail", amount=EXCLUDED.amount, currency=EXCLUDED.currency,
      status=EXCLUDED.status, "purchaseType"=EXCLUDED."purchaseType", provider=EXCLUDED.provider,
      "stripeCheckoutSessionId"=EXCLUDED."stripeCheckoutSessionId",
      "stripePaymentIntentId"=EXCLUDED."stripePaymentIntentId", "pricingSnapshot"=EXCLUDED."pricingSnapshot",
      "promotionSnapshot"=EXCLUDED."promotionSnapshot", "refundSnapshot"=EXCLUDED."refundSnapshot",
      "paidAt"=EXCLUDED."paidAt", "fulfilledAt"=EXCLUDED."fulfilledAt", "refundedAt"=EXCLUDED."refundedAt",
      "updatedAt"=EXCLUDED."updatedAt";
  `);

  await client.query(`
    WITH ranked AS (
      SELECT n.id AS nomination_id, p.id AS payment_id,
        row_number() OVER (
          PARTITION BY n.id ORDER BY
            CASE WHEN p.id = n."purchasePaymentId" THEN 1 WHEN p.id = n."paymentId" THEN 2
                 WHEN p."nominationApplicationId" = n.id THEN 3 ELSE 4 END,
            CASE p.status::text WHEN 'PAID' THEN 1 WHEN 'PENDING' THEN 2 ELSE 3 END,
            p."createdAt" DESC, p.id
        ) AS rank
      FROM public."NominationApplication" n
      JOIN public."Payment" p ON p.id = n."purchasePaymentId" OR p.id = n."paymentId"
        OR p."nominationApplicationId" = n.id
        OR (n."applicationId" IS NOT NULL AND p."applicationId" = n."applicationId")
      JOIN "${TARGET_SCHEMA}"."Payment" target_payment ON target_payment.id = p.id
      WHERE n."dataScope"::text <> 'TEST'
    ), missing AS (
      SELECT n.* FROM public."NominationApplication" n
      WHERE n."dataScope"::text <> 'TEST'
        AND NOT EXISTS (SELECT 1 FROM ranked r WHERE r.nomination_id = n.id AND r.rank = 1)
    )
    INSERT INTO "${TARGET_SCHEMA}"."Payment" (
      id, "accountId", "customerEmail", amount, currency, status, "purchaseType", provider,
      "pricingSnapshot", "paidAt", "fulfilledAt", "createdAt", "updatedAt", "dataScope"
    )
    SELECT 'manual-nomination-' || md5(n.id), p."accountId", a.email, 0, 'usd',
      'PAID'::"${TARGET_SCHEMA}"."PaymentStatus", 'NOMINATION'::"${TARGET_SCHEMA}"."PaymentPurchaseType",
      'MANUAL'::"${TARGET_SCHEMA}"."PaymentProvider",
      jsonb_build_object('schemaVersion',1,'reason','MIGRATED_WITHOUT_VERIFIED_STRIPE_PAYMENT','legacyNominationId',n.id),
      COALESCE(n."paidAt", n."createdAt"), COALESCE(n."paidAt", n."createdAt"), n."createdAt", n."updatedAt",
      n."dataScope"::text::"${TARGET_SCHEMA}"."DataScope"
    FROM missing n
    JOIN "${TARGET_SCHEMA}"."ApplicantProfile" p ON p.id = n."applicantProfileId"
    JOIN "${TARGET_SCHEMA}"."Account" a ON a.id = p."accountId"
    ON CONFLICT (id) DO UPDATE SET "accountId"=EXCLUDED."accountId", "customerEmail"=EXCLUDED."customerEmail";

    WITH ranked AS (
      SELECT n.id AS nomination_id, p.id AS payment_id,
        row_number() OVER (
          PARTITION BY n.id ORDER BY
            CASE WHEN p.id = n."purchasePaymentId" THEN 1 WHEN p.id = n."paymentId" THEN 2
                 WHEN p."nominationApplicationId" = n.id THEN 3 ELSE 4 END,
            CASE p.status::text WHEN 'PAID' THEN 1 WHEN 'PENDING' THEN 2 ELSE 3 END,
            p."createdAt" DESC, p.id
        ) AS rank
      FROM public."NominationApplication" n
      JOIN public."Payment" p ON p.id = n."purchasePaymentId" OR p.id = n."paymentId"
        OR p."nominationApplicationId" = n.id
        OR (n."applicationId" IS NOT NULL AND p."applicationId" = n."applicationId")
      JOIN "${TARGET_SCHEMA}"."Payment" target_payment ON target_payment.id = p.id
      WHERE n."dataScope"::text <> 'TEST'
    ), application_counts AS (
      SELECT "applicationId", count(*) AS count FROM public."NominationApplication"
      WHERE "applicationId" IS NOT NULL GROUP BY "applicationId"
    )
    INSERT INTO "${TARGET_SCHEMA}"."Nomination" (
      id, "applicantProfileId", "paymentId", "awardId", "categoryId", status, revision,
      answers, files, "scoringSchema", "submittedAt", "scoresReleasedAt", "createdAt", "updatedAt", "dataScope"
    )
    SELECT n.id, n."applicantProfileId",
      COALESCE((SELECT r.payment_id FROM ranked r WHERE r.nomination_id = n.id AND r.rank = 1), 'manual-nomination-' || md5(n.id)),
      n."awardId", n."categoryId",
      CASE n.status::text
        WHEN 'PAYMENT_PENDING' THEN 'DRAFT' WHEN 'PURCHASED' THEN 'DRAFT'
        ELSE n.status::text
      END::"${TARGET_SCHEMA}"."NominationStatus",
      1,
      jsonb_build_object('schemaVersion',1,'fields',COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'fieldId', answer."fieldKey", 'label', answer."fieldKey",
          'type', CASE WHEN answer."valueText" IS NOT NULL THEN 'text' WHEN answer."valueNumber" IS NOT NULL THEN 'number'
                       WHEN answer."valueBoolean" IS NOT NULL THEN 'boolean' ELSE 'json' END,
          'value', CASE WHEN answer."valueText" IS NOT NULL THEN to_jsonb(answer."valueText")
                        WHEN answer."valueNumber" IS NOT NULL THEN to_jsonb(answer."valueNumber")
                        WHEN answer."valueBoolean" IS NOT NULL THEN to_jsonb(answer."valueBoolean") ELSE answer."valueJson" END,
          'updatedAt', to_char(answer."createdAt" AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
        ) ORDER BY answer."createdAt", answer.id)
        FROM public."NominationAnswer" answer WHERE answer."nominationApplicationId" = n.id
      ), '[]'::jsonb)),
      jsonb_build_object('schemaVersion',1,'items',COALESCE((
        SELECT jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
          'id', file.id, 'fieldId', file."fieldKey", 'blobKey', file."storageKey", 'url', file."fileUrl",
          'filename', COALESCE(file."displayFileName", file."originalFileName", file."fileName"),
          'mimeType', file."mimeType", 'size', COALESCE(file."compressedFileSize", file."fileSize"),
          'originalSize', file."originalFileSize", 'uploadedAt', to_char(file."createdAt" AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
        )) ORDER BY file."createdAt", file.id)
        FROM public."NominationFile" file
        WHERE file."nominationApplicationId" = n.id AND file."deletedAt" IS NULL
      ), '[]'::jsonb)),
      n."scoringSchema", n."submittedAt", n."scoresReleasedAt", n."createdAt", n."updatedAt",
      n."dataScope"::text::"${TARGET_SCHEMA}"."DataScope"
    FROM public."NominationApplication" n
    JOIN "${TARGET_SCHEMA}"."ApplicantProfile" p ON p.id = n."applicantProfileId"
    JOIN "${TARGET_SCHEMA}"."Award" a ON a.id = n."awardId"
    JOIN "${TARGET_SCHEMA}"."Category" c ON c.id = n."categoryId"
    WHERE n."dataScope"::text <> 'TEST'
    ON CONFLICT (id) DO UPDATE SET
      "applicantProfileId"=EXCLUDED."applicantProfileId", "paymentId"=EXCLUDED."paymentId",
      "awardId"=EXCLUDED."awardId", "categoryId"=EXCLUDED."categoryId", status=EXCLUDED.status,
      answers=EXCLUDED.answers, files=EXCLUDED.files, "scoringSchema"=EXCLUDED."scoringSchema",
      "submittedAt"=EXCLUDED."submittedAt", "scoresReleasedAt"=EXCLUDED."scoresReleasedAt",
      "updatedAt"=EXCLUDED."updatedAt";

    INSERT INTO "${TARGET_SCHEMA}"."JuryNominationReview" (
      id, "nominationId", "juryProfileId", status, "scoreData", "totalScore", comments,
      "startedAt", "submittedAt", "createdAt", "updatedAt", "dataScope"
    )
    SELECT r.id, r."nominationId", r."juryProfileId", r.status::text::"${TARGET_SCHEMA}"."JuryReviewStatus",
      r."scoreData", r."totalScore", r.notes, r."startedAt", r."completedAt", r."createdAt", r."updatedAt",
      r."dataScope"::text::"${TARGET_SCHEMA}"."DataScope"
    FROM public."JuryNominationReview" r
    JOIN "${TARGET_SCHEMA}"."Nomination" n ON n.id = r."nominationId"
    JOIN "${TARGET_SCHEMA}"."JuryProfile" p ON p.id = r."juryProfileId"
    WHERE r."dataScope"::text <> 'TEST'
    ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status, "scoreData"=EXCLUDED."scoreData",
      "totalScore"=EXCLUDED."totalScore", comments=EXCLUDED.comments, "startedAt"=EXCLUDED."startedAt",
      "submittedAt"=EXCLUDED."submittedAt", "updatedAt"=EXCLUDED."updatedAt";
  `);
}

async function migrateTickets(client: ClientBase) {
  const hasSpecialPacketId = await columnExists(client, "Ticket", "specialPacketId");
  const hasSpecialPacketPosition = await columnExists(client, "Ticket", "specialPacketPosition");
  const specialPacketId = hasSpecialPacketId ? `t."specialPacketId"` : `NULL::text`;
  const specialPacketPosition = hasSpecialPacketPosition ? `t."specialPacketPosition"` : `NULL::integer`;
  await client.query(`
    INSERT INTO "${TARGET_SCHEMA}"."Ticket" (
      id, "accountId", "applicantProfileId", "paymentId", kind, "secureToken", credential, activity, revision,
      "fullName", email, phone, instagram, type, "galaDinner", "isIbpaMember", "ibpaCertNumber",
      "specialPacketId", "specialPacketPosition", status, "paidAt", "lastCheckIn", "forumCheckInAt",
      "dayOneCheckInAt", "dayTwoCheckInAt", "galaCheckInAt", "createdAt", "updatedAt", "dataScope"
    )
    SELECT t.id, t."accountId", t."applicantProfileId",
      (SELECT p.id FROM "${TARGET_SCHEMA}"."Payment" p
       JOIN public."Payment" source_payment ON source_payment.id = p.id
       WHERE source_payment."ticketId" = t.id ORDER BY CASE p.status WHEN 'PAID' THEN 1 ELSE 2 END, p."createdAt" DESC LIMIT 1),
      'FORUM'::"${TARGET_SCHEMA}"."TicketKind",
      COALESCE((SELECT q.token FROM public."TicketQrCredential" q WHERE q."ticketId"=t.id AND q.status::text='ACTIVE' ORDER BY q."generatedAt" DESC, q.id DESC LIMIT 1), t."secureToken"),
      jsonb_build_object('schemaVersion',1,
        'active', (SELECT jsonb_strip_nulls(jsonb_build_object('token',q.token,'status',q.status::text,'generatedAt',to_char(q."generatedAt" AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'lastSentAt',to_char(q."lastSentAt" AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'lastDeliveryStatus',q."lastDeliveryStatus",'lastDeliveryProviderId',q."lastDeliveryProviderId",
          'lastDeliveryError',q."lastDeliveryError")) FROM public."TicketQrCredential" q
          WHERE q."ticketId"=t.id AND q.status::text='ACTIVE' ORDER BY q."generatedAt" DESC, q.id DESC LIMIT 1),
        'history', COALESCE((SELECT jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id',q.id,'token',q.token,
          'status',q.status::text,'generatedAt',to_char(q."generatedAt" AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'replacedAt',to_char(q."replacedAt" AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'revokedAt',to_char(q."revokedAt" AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'lastSentAt',to_char(q."lastSentAt" AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'lastDeliveryStatus',q."lastDeliveryStatus",
          'lastDeliveryProviderId',q."lastDeliveryProviderId",'lastDeliveryError',q."lastDeliveryError"))
          ORDER BY q."generatedAt",q.id) FROM public."TicketQrCredential" q WHERE q."ticketId"=t.id), '[]'::jsonb)),
      jsonb_build_object('schemaVersion',1,'events',COALESCE((SELECT jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
        'id',a.id,'type',a.type::text,'adminId',a."adminId",'changedFields',a."changedFields",
        'previousValues',a."previousValues",'newValues',a."newValues",'emailDelivery',a."emailDelivery",'createdAt',to_char(a."createdAt" AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
      )) ORDER BY a."createdAt",a.id) FROM public."TicketActivity" a WHERE a."ticketId"=t.id), '[]'::jsonb)),
      1, t."fullName", t.email, t.phone, t.instagram, t.type::text::"${TARGET_SCHEMA}"."TicketType",
      t."galaDinner", t."isIbpaMember", t."ibpaCertNumber", ${specialPacketId}, ${specialPacketPosition},
      t.status::text::"${TARGET_SCHEMA}"."TicketStatus", t."paidAt", t."lastCheckIn", t."forumCheckInAt",
      t."dayOneCheckInAt", t."dayTwoCheckInAt", t."galaCheckInAt", t."createdAt", t."updatedAt",
      t."dataScope"::text::"${TARGET_SCHEMA}"."DataScope"
    FROM public."Ticket" t WHERE t."dataScope"::text <> 'TEST'
    ON CONFLICT (id) DO UPDATE SET
      "accountId"=EXCLUDED."accountId", "applicantProfileId"=EXCLUDED."applicantProfileId",
      "paymentId"=EXCLUDED."paymentId", "secureToken"=EXCLUDED."secureToken", credential=EXCLUDED.credential,
      activity=EXCLUDED.activity, "fullName"=EXCLUDED."fullName", email=EXCLUDED.email, phone=EXCLUDED.phone,
      instagram=EXCLUDED.instagram, type=EXCLUDED.type, "galaDinner"=EXCLUDED."galaDinner",
      "isIbpaMember"=EXCLUDED."isIbpaMember", "ibpaCertNumber"=EXCLUDED."ibpaCertNumber",
      status=EXCLUDED.status, "paidAt"=EXCLUDED."paidAt", "lastCheckIn"=EXCLUDED."lastCheckIn",
      "forumCheckInAt"=EXCLUDED."forumCheckInAt", "dayOneCheckInAt"=EXCLUDED."dayOneCheckInAt",
      "dayTwoCheckInAt"=EXCLUDED."dayTwoCheckInAt", "galaCheckInAt"=EXCLUDED."galaCheckInAt",
      "updatedAt"=EXCLUDED."updatedAt";

    WITH ranked_credentials AS (
      SELECT c.*, first_value(c.token) OVER (
        PARTITION BY c."applicantProfileId" ORDER BY c."createdAt" DESC, c.token DESC
      ) AS active_token
      FROM public."ApplicantCheckInCredential" c
      WHERE c."dataScope"::text <> 'TEST'
    ), credentials AS (
      SELECT c."applicantProfileId", max(c.active_token) AS active_token, min(c."createdAt") AS created_at,
        jsonb_agg(jsonb_build_object('id',c.token,'token',c.token,'status',
          CASE WHEN c.token=c.active_token THEN 'ACTIVE' ELSE 'REPLACED' END,
          'generatedAt',to_char(c."createdAt" AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')) ORDER BY c."createdAt",c.token) AS history
      FROM ranked_credentials c GROUP BY c."applicantProfileId"
    )
    INSERT INTO "${TARGET_SCHEMA}"."Ticket" (
      id, "accountId", "applicantProfileId", kind, "secureToken", credential, activity, revision,
      "fullName", email, phone, status, "lastCheckIn", "createdAt", "updatedAt", "dataScope"
    )
    SELECT 'applicant-ticket-'||md5(p.id), p."accountId", p.id, 'APPLICANT'::"${TARGET_SCHEMA}"."TicketKind",
      c.active_token, jsonb_build_object('schemaVersion',1,'active',jsonb_build_object('token',c.active_token,'status','ACTIVE',
        'generatedAt',to_char(c.created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
        'history',c.history),
      jsonb_build_object('schemaVersion',1,'events',CASE WHEN source."checkedInAt" IS NULL THEN '[]'::jsonb ELSE
        jsonb_build_array(jsonb_build_object('id','migrated-checkin','type','CHECKED_IN','createdAt',to_char(source."checkedInAt" AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))) END),
      1, p."fullName", a.email, COALESCE(p.phone, ''),
      CASE WHEN EXISTS (SELECT 1 FROM "${TARGET_SCHEMA}"."Nomination" n JOIN "${TARGET_SCHEMA}"."Payment" pay ON pay.id=n."paymentId"
                        WHERE n."applicantProfileId"=p.id AND pay.status='PAID') THEN 'PAID' ELSE 'PENDING' END::"${TARGET_SCHEMA}"."TicketStatus",
      source."checkedInAt", c.created_at, GREATEST(c.created_at, COALESCE(source."checkedInAt", c.created_at)), p."dataScope"
    FROM credentials c
    JOIN "${TARGET_SCHEMA}"."ApplicantProfile" p ON p.id=c."applicantProfileId"
    JOIN public."ApplicantProfile" source ON source.id=p.id
    JOIN "${TARGET_SCHEMA}"."Account" a ON a.id=p."accountId"
    ON CONFLICT (id) DO UPDATE SET "secureToken"=EXCLUDED."secureToken", credential=EXCLUDED.credential,
      activity=EXCLUDED.activity, status=EXCLUDED.status, "lastCheckIn"=EXCLUDED."lastCheckIn";

    INSERT INTO "${TARGET_SCHEMA}"."Ticket" (
      id, "accountId", kind, "secureToken", credential, activity, revision, "fullName", email, phone,
      status, "lastCheckIn", "createdAt", "updatedAt", "dataScope"
    )
    SELECT 'jury-ticket-'||md5(j.id), j."accountId", 'JURY'::"${TARGET_SCHEMA}"."TicketKind", j.id,
      jsonb_build_object('schemaVersion',1,'active',jsonb_build_object('token',j.id,'status','ACTIVE','generatedAt',to_char(j."createdAt" AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
        'history',jsonb_build_array(jsonb_build_object('id',j.id,'token',j.id,'status','ACTIVE','generatedAt',to_char(j."createdAt" AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')))),
      jsonb_build_object('schemaVersion',1,'events',CASE WHEN source."checkedInAt" IS NULL THEN '[]'::jsonb ELSE
        jsonb_build_array(jsonb_build_object('id','migrated-checkin','type','CHECKED_IN','createdAt',to_char(source."checkedInAt" AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))) END),
      1, j."fullName", j.email, j.phone,
      CASE WHEN EXISTS (SELECT 1 FROM "${TARGET_SCHEMA}"."Payment" p WHERE p."juryApplicationId"=j.id AND p.status='PAID')
        OR j.status='PAID' THEN 'PAID' ELSE 'PENDING' END::"${TARGET_SCHEMA}"."TicketStatus",
      source."checkedInAt", j."createdAt", j."updatedAt", j."dataScope"
    FROM "${TARGET_SCHEMA}"."JuryApplication" j
    JOIN public."JuryApplication" source ON source.id=j.id
    WHERE j.status IN ('APPROVED','PAID') OR source."checkedInAt" IS NOT NULL
    ON CONFLICT (id) DO UPDATE SET "secureToken"=EXCLUDED."secureToken", credential=EXCLUDED.credential,
      status=EXCLUDED.status, "lastCheckIn"=EXCLUDED."lastCheckIn", activity=EXCLUDED.activity,
      "updatedAt"=EXCLUDED."updatedAt";
  `);
}

async function migrateSettingsAndWebhooks(client: ClientBase) {
  await client.query(`
    INSERT INTO "${TARGET_SCHEMA}"."SiteSetting" (key, value, "updatedAt")
    SELECT key,
      CASE WHEN value = 'true' THEN 'true'::jsonb WHEN value = 'false' THEN 'false'::jsonb
           WHEN value ~ '^-?[0-9]+(\\.[0-9]+)?$' THEN to_jsonb(value::numeric)
           ELSE to_jsonb(value) END,
      "updatedAt"
    FROM public."SiteSetting"
    ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, "updatedAt"=EXCLUDED."updatedAt";

    INSERT INTO "${TARGET_SCHEMA}"."SiteSetting" (key, value, "updatedAt")
    SELECT 'promocodes', jsonb_build_object('schemaVersion',1,'updatedAt',to_char(COALESCE(max("updatedAt"),now()) AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
      'codes',COALESCE(jsonb_agg(jsonb_build_object('id',id,'key',key,'keyword',keyword,
        'paymentFlow',"paymentFlow"::text,'discountPercent',"discountPercent",'enabled',enabled,
        'createdAt',to_char("createdAt" AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'updatedAt',to_char("updatedAt" AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')) ORDER BY key),'[]'::jsonb)), COALESCE(max("updatedAt"),now())
    FROM public."PromoCode"
    ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, "updatedAt"=EXCLUDED."updatedAt";

    INSERT INTO "${TARGET_SCHEMA}"."SiteSetting" (key, value, "updatedAt")
    SELECT 'regulations', jsonb_build_object(
      'schemaVersion',1,'updatedAt',to_char(COALESCE(max("updatedAt"),now()) AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
      'general',COALESCE((SELECT jsonb_build_object(
        'en',jsonb_strip_nulls(jsonb_build_object('url',r."enUrl")),
        'ru',jsonb_strip_nulls(jsonb_build_object('url',r."ruUrl")),
        'ua',jsonb_strip_nulls(jsonb_build_object('url',r."uaUrl")),
        'technicalRequirements',r."technicalRequirements") FROM public."Regulation" r WHERE r."categoryId" IS NULL ORDER BY r."updatedAt" DESC LIMIT 1),
        jsonb_build_object('en',jsonb_build_object(),'ru',jsonb_build_object(),'ua',jsonb_build_object())),
      'categories',COALESCE((SELECT jsonb_object_agg(r."categoryId",jsonb_build_object(
        'en',jsonb_strip_nulls(jsonb_build_object('url',r."enUrl")),
        'ru',jsonb_strip_nulls(jsonb_build_object('url',r."ruUrl")),
        'ua',jsonb_strip_nulls(jsonb_build_object('url',r."uaUrl")),
        'technicalRequirements',r."technicalRequirements")) FROM public."Regulation" r WHERE r."categoryId" IS NOT NULL), '{}'::jsonb)
    ), COALESCE(max("updatedAt"),now()) FROM public."Regulation"
    ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, "updatedAt"=EXCLUDED."updatedAt";

    INSERT INTO "${TARGET_SCHEMA}"."StripeWebhook" (
      id, "eventId", "eventType", payload, state, attempts, "createdAt", "lastAttemptAt", "processedAt"
    )
    SELECT id, "stripeEventId", "eventType", COALESCE("payloadJson", '{}'::jsonb),
      'PROCESSED'::"${TARGET_SCHEMA}"."StripeWebhookState", 1, "createdAt", "processedAt", "processedAt"
    FROM public."StripeWebhookEvent" WHERE "dataScope"::text <> 'TEST'
    ON CONFLICT ("eventId") DO UPDATE SET "eventType"=EXCLUDED."eventType", payload=EXCLUDED.payload,
      state=EXCLUDED.state, attempts=GREATEST("${TARGET_SCHEMA}"."StripeWebhook".attempts, EXCLUDED.attempts),
      "processedAt"=EXCLUDED."processedAt";
  `);
}

async function ensureProtectedApplicantSetupTokens(client: ClientBase) {
  const result: Array<{ email: string; accountId: string; token: string; expiresAt: string }> = [];
  for (const email of PROTECTED_APPLICANTS) {
    const account = await client.query<{
      id: string;
      passwordHash: string | null;
      hasActiveToken: boolean;
    }>(`
      SELECT id, "passwordHash",
        ("setupTokenHash" IS NOT NULL AND "setupTokenUsedAt" IS NULL AND "setupTokenExpiresAt">now()) AS "hasActiveToken"
      FROM "${TARGET_SCHEMA}"."Account"
      WHERE "normalizedEmail"=$1 AND role='APPLICANT'
    `, [email]);
    const row = account.rows[0];
    if (!row) throw new Error(`Protected applicant account is missing: ${email}`);
    if (row.passwordHash || row.hasActiveToken) continue;
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await client.query(`
      UPDATE "${TARGET_SCHEMA}"."Account"
      SET "setupTokenHash"=$1, "setupTokenPurpose"='SETUP', "setupTokenExpiresAt"=$2,
          "setupTokenIssuedAt"=now(), "setupTokenUsedAt"=NULL, status='INVITED', "updatedAt"=now()
      WHERE id=$3
    `, [sha256(token), expiresAt, row.id]);
    result.push({ email, accountId: row.id, token, expiresAt: expiresAt.toISOString() });
  }
  return result;
}

async function applyMigration(client: ClientBase) {
  const checks = await dryRunChecks(client);
  if (checks.ambiguousPaymentMappings > 0 || checks.duplicateActiveOwnerAwards > 0 || checks.paymentsWithoutCustomerEmail > 0) {
    throw new Error(`Preconditions failed: ${JSON.stringify(checks)}`);
  }
  await client.query("BEGIN");
  try {
    await createTargetSchema(client);
    await migrateCatalogAndAccounts(client);
    await migrateJuryApplications(client);
    await migratePaymentsAndNominations(client);
    await migrateTickets(client);
    await migrateSettingsAndWebhooks(client);
    const setupTokens = await ensureProtectedApplicantSetupTokens(client);
    await client.query("COMMIT");
    return setupTokens;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

async function validation(client: ClientBase) {
  if (!(await tableExists(client, TARGET_SCHEMA, "Account"))) {
    throw new Error(`Target schema ${TARGET_SCHEMA} has not been created.`);
  }
  const queries: Array<[string, string]> = [
    ["brokenApplicantAccounts", `SELECT count(*)::int count FROM "${TARGET_SCHEMA}"."ApplicantProfile" p LEFT JOIN "${TARGET_SCHEMA}"."Account" a ON a.id=p."accountId" WHERE a.id IS NULL`],
    ["brokenNominationOwners", `SELECT count(*)::int count FROM "${TARGET_SCHEMA}"."Nomination" n LEFT JOIN "${TARGET_SCHEMA}"."ApplicantProfile" p ON p.id=n."applicantProfileId" WHERE p.id IS NULL`],
    ["brokenNominationPayments", `SELECT count(*)::int count FROM "${TARGET_SCHEMA}"."Nomination" n LEFT JOIN "${TARGET_SCHEMA}"."Payment" p ON p.id=n."paymentId" WHERE p.id IS NULL`],
    ["brokenNominationCatalog", `SELECT count(*)::int count FROM "${TARGET_SCHEMA}"."Nomination" n LEFT JOIN "${TARGET_SCHEMA}"."Award" a ON a.id=n."awardId" LEFT JOIN "${TARGET_SCHEMA}"."Category" c ON c.id=n."categoryId" WHERE a.id IS NULL OR c.id IS NULL OR a."categoryId"<>c.id`],
    ["brokenJuryProfiles", `SELECT count(*)::int count FROM "${TARGET_SCHEMA}"."JuryProfile" p LEFT JOIN "${TARGET_SCHEMA}"."Account" a ON a.id=p."accountId" LEFT JOIN "${TARGET_SCHEMA}"."JuryApplication" j ON j.id=p."juryApplicationId" WHERE a.id IS NULL OR j.id IS NULL`],
    ["brokenReviews", `SELECT count(*)::int count FROM "${TARGET_SCHEMA}"."JuryNominationReview" r LEFT JOIN "${TARGET_SCHEMA}"."Nomination" n ON n.id=r."nominationId" LEFT JOIN "${TARGET_SCHEMA}"."JuryProfile" p ON p.id=r."juryProfileId" WHERE n.id IS NULL OR p.id IS NULL`],
    ["duplicateReviews", `SELECT count(*)::int count FROM (SELECT "nominationId","juryProfileId" FROM "${TARGET_SCHEMA}"."JuryNominationReview" GROUP BY 1,2 HAVING count(*)>1) d`],
    ["invalidNominationJson", `SELECT count(*)::int count FROM "${TARGET_SCHEMA}"."Nomination" WHERE "answers"->>'schemaVersion'<>'1' OR jsonb_typeof("answers"->'fields')<>'array' OR "files"->>'schemaVersion'<>'1' OR jsonb_typeof("files"->'items')<>'array'`],
    ["invalidTicketJson", `SELECT count(*)::int count FROM "${TARGET_SCHEMA}"."Ticket" WHERE "credential"->>'schemaVersion'<>'1' OR jsonb_typeof("credential"->'history')<>'array' OR "activity"->>'schemaVersion'<>'1' OR jsonb_typeof("activity"->'events')<>'array'`],
    ["testRowsMigrated", `SELECT (SELECT count(*) FROM "${TARGET_SCHEMA}"."Account" WHERE "dataScope"='TEST')::int + (SELECT count(*) FROM "${TARGET_SCHEMA}"."Payment" WHERE "dataScope"='TEST')::int + (SELECT count(*) FROM "${TARGET_SCHEMA}"."Nomination" WHERE "dataScope"='TEST')::int + (SELECT count(*) FROM "${TARGET_SCHEMA}"."Ticket" WHERE "dataScope"='TEST')::int AS count`],
  ];
  const checks: Record<string, number> = {};
  for (const [name, sql] of queries) checks[name] = (await client.query<{ count: number }>(sql)).rows[0]?.count ?? 0;
  const nominationJson = await client.query<{ answers: unknown; files: unknown }>(
    `SELECT answers, files FROM "${TARGET_SCHEMA}"."Nomination"`,
  );
  const juryJson = await client.query<{ informationRequests: unknown; files: unknown }>(
    `SELECT "informationRequests", files FROM "${TARGET_SCHEMA}"."JuryApplication"`,
  );
  const ticketJson = await client.query<{ credential: unknown; activity: unknown }>(
    `SELECT credential, activity FROM "${TARGET_SCHEMA}"."Ticket"`,
  );
  const settingJson = await client.query<{ key: string; value: unknown }>(
    `SELECT key, value FROM "${TARGET_SCHEMA}"."SiteSetting" WHERE key IN ('regulations','promocodes')`,
  );
  checks.invalidNominationJson = nominationJson.rows.filter((row) =>
    !nominationAnswersSchema.safeParse(row.answers).success || !storedFilesSchema.safeParse(row.files).success
  ).length;
  checks.invalidJuryJson = juryJson.rows.filter((row) =>
    !juryInformationRequestsSchema.safeParse(row.informationRequests).success || !storedFilesSchema.safeParse(row.files).success
  ).length;
  checks.invalidTicketJson = ticketJson.rows.filter((row) =>
    !ticketCredentialSchema.safeParse(row.credential).success || !ticketActivitySchema.safeParse(row.activity).success
  ).length;
  checks.invalidSettingJson = settingJson.rows.filter((row) =>
    row.key === "regulations"
      ? !regulationsSettingSchema.safeParse(row.value).success
      : !promoCodesSettingSchema.safeParse(row.value).success
  ).length;
  const sourceEligible = await client.query<{ accounts: number; nominations: number; files: number }>(`
    SELECT
      (SELECT count(*) FROM public."Account" WHERE "dataScope"::text <> 'TEST')::int accounts,
      (SELECT count(*) FROM public."NominationApplication" WHERE "dataScope"::text <> 'TEST')::int nominations,
      (SELECT count(*) FROM public."NominationFile" f JOIN public."NominationApplication" n ON n.id=f."nominationApplicationId" WHERE f."deletedAt" IS NULL AND n."dataScope"::text <> 'TEST')::int files
  `);
  const target = await client.query<{ accounts: number; nominations: number; files: number }>(`
    SELECT
      (SELECT count(*) FROM "${TARGET_SCHEMA}"."Account")::int accounts,
      (SELECT count(*) FROM "${TARGET_SCHEMA}"."Nomination")::int nominations,
      (SELECT COALESCE(sum(jsonb_array_length(files->'items')),0) FROM "${TARGET_SCHEMA}"."Nomination")::int files
  `);
  const protectedBefore = await protectedApplicantReport(client, "public");
  const protectedAfter = await protectedApplicantReport(client, TARGET_SCHEMA);
  const protectedByEmail = new Map(protectedAfter.map((row: Record<string, unknown>) => [row.email, row]));
  const protectedChecks = PROTECTED_APPLICANTS.map((email) => {
    const before = protectedBefore.find((row: Record<string, unknown>) => row.email === email) as Record<string, unknown> | undefined;
    const after = protectedByEmail.get(email) as Record<string, unknown> | undefined;
    return {
      email,
      before,
      after,
      valid:
        Boolean(before && after) &&
        after?.accountCount === 1 && after?.profileCount === 1 &&
        after?.nominationCount === before?.nominationCount && after?.answerCount === before?.answerCount &&
        after?.fileCount === before?.fileCount &&
        (after?.hasPasswordHash === 1 || after?.hasActiveSetupToken === 1) &&
        JSON.stringify(after?.passwordHashFingerprints) === JSON.stringify(before?.passwordHashFingerprints),
    };
  });
  const result = { checks, sourceEligible: sourceEligible.rows[0], target: target.rows[0], protectedApplicants: protectedChecks };
  const failures = Object.entries(checks).filter(([, count]) => count !== 0);
  if (failures.length || protectedChecks.some((item) => !item.valid)) {
    throw new Error(`Validation failed: ${JSON.stringify(result)}`);
  }
  return result;
}

async function fileDeletionManifest(client: ClientBase, outputDirectory: string) {
  const result = await client.query(`
    SELECT f.id, f."nominationApplicationId" AS "legacyNominationId", f."storageKey" AS "blobKey",
      f."fileUrl" AS url, f."deletedAt",
      EXISTS (
        SELECT 1 FROM "${TARGET_SCHEMA}"."Nomination" n
        WHERE EXISTS (
          SELECT 1 FROM jsonb_array_elements(n.files->'items') item
          WHERE (f."storageKey" IS NOT NULL AND item->>'blobKey'=f."storageKey") OR item->>'url'=f."fileUrl"
        )
      ) AS "referencedByActiveNomination",
      CASE WHEN f."storageKey" IS NULL THEN 'MISSING_EXPLICIT_BLOB_KEY'
           WHEN EXISTS (
             SELECT 1 FROM "${TARGET_SCHEMA}"."Nomination" n,
             LATERAL jsonb_array_elements(n.files->'items') item
             WHERE item->>'blobKey'=f."storageKey" OR item->>'url'=f."fileUrl"
           ) THEN 'AMBIGUOUS_ACTIVE_REFERENCE'
           ELSE 'ELIGIBLE' END AS decision
    FROM public."NominationFile" f
    WHERE f."deletedAt" IS NOT NULL
    ORDER BY f."deletedAt", f.id
  `);
  const manifest = { schemaVersion: 1, generatedAt: new Date().toISOString(), objects: result.rows };
  await mkdir(outputDirectory, { recursive: true });
  const file = path.join(outputDirectory, `soft-deleted-file-manifest-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  await writeFile(file, `${JSON.stringify(manifest, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  return { file, counts: result.rows.reduce<Record<string, number>>((acc, row) => {
    const key = String(row.decision); acc[key] = (acc[key] ?? 0) + 1; return acc;
  }, {}) };
}

async function main() {
  const options = parseOptions();
  const client = new Client({ connectionString: targetConnectionString() });
  await client.connect();
  try {
    const write = options.mode === "apply";
    const identity = await assertSafeTarget(client, options.expectedBranchId, write);
    if (options.mode === "manifest") {
      const result = await buildManifest(client, options.outputDirectory, "pre-migration-manifest");
      console.log(JSON.stringify({ mode: options.mode, branchId: identity.branch_id, file: result.file, counts: result.manifest.sourceCounts }, null, 2));
    } else if (options.mode === "dry-run") {
      const result = await dryRunChecks(client);
      console.log(JSON.stringify({ mode: options.mode, branchId: identity.branch_id, ...result }, null, 2));
    } else if (options.mode === "apply") {
      const setupTokens = await applyMigration(client);
      let setupTokenFile: string | null = null;
      if (setupTokens.length > 0) {
        await mkdir(options.outputDirectory, { recursive: true });
        setupTokenFile = path.join(options.outputDirectory, `protected-setup-tokens-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
        await writeFile(setupTokenFile, `${JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), tokens: setupTokens }, null, 2)}\n`, { encoding: "utf8", flag: "wx", mode: 0o600 });
      }
      const result = await validation(client);
      const manifest = await buildManifest(client, options.outputDirectory, "post-migration-manifest");
      console.log(JSON.stringify({ mode: options.mode, branchId: identity.branch_id, validation: result, manifest: manifest.file, setupTokenFile, setupTokensGenerated: setupTokens.length }, null, 2));
    } else if (options.mode === "validate") {
      const result = await validation(client);
      console.log(JSON.stringify({ mode: options.mode, branchId: identity.branch_id, ...result }, null, 2));
    } else {
      const result = await fileDeletionManifest(client, options.outputDirectory);
      console.log(JSON.stringify({ mode: options.mode, branchId: identity.branch_id, ...result }, null, 2));
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
