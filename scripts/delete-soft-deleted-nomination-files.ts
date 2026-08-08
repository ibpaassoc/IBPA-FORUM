import "dotenv/config";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { del } from "@vercel/blob";
import { Client } from "pg";
import { z } from "zod";

const TARGET_SCHEMA = "forum_next";
const PROTECTED_BRANCH_IDS = new Set([
  "br-ancient-night-aknk0wql",
  "br-nameless-block-akc62q54",
]);

const manifestSchema = z.object({
  schemaVersion: z.literal(1),
  generatedAt: z.string().datetime({ offset: true }),
  objects: z.array(z.object({
    id: z.string().min(1),
    legacyNominationId: z.string().min(1),
    blobKey: z.string().min(1).nullable(),
    url: z.string().min(1),
    deletedAt: z.coerce.date(),
    referencedByActiveNomination: z.boolean(),
    decision: z.enum(["ELIGIBLE", "MISSING_EXPLICIT_BLOB_KEY", "AMBIGUOUS_ACTIVE_REFERENCE"]),
  })),
});

const priorResultsSchema = z.object({
  results: z.array(z.object({
    id: z.string(),
    blobKey: z.string().nullable(),
    status: z.string(),
    checkedAt: z.string(),
    error: z.string().optional(),
  })),
});

type ResultStatus =
  | "DRY_RUN_ELIGIBLE"
  | "SKIPPED_MANIFEST"
  | "SKIPPED_ACTIVE_REFERENCE"
  | "SKIPPED_SOURCE_MISMATCH"
  | "BLOB_DELETED_METADATA_DELETED"
  | "FAILED";

type CleanupResult = {
  id: string;
  blobKey: string | null;
  status: ResultStatus;
  checkedAt: string;
  error?: string;
};

function argument(name: string) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function targetConnectionString() {
  if (process.env.FORUM_MIGRATION_DATABASE_URL) return process.env.FORUM_MIGRATION_DATABASE_URL;
  const source = process.env.DATABASE_URL;
  const branchHost = process.env.FORUM_MIGRATION_BRANCH_HOST;
  if (!source || !branchHost || !/^[a-z0-9.-]+\.neon\.tech$/i.test(branchHost)) {
    throw new Error("Set FORUM_MIGRATION_DATABASE_URL, or DATABASE_URL plus a valid FORUM_MIGRATION_BRANCH_HOST.");
  }
  const target = new URL(source);
  target.hostname = branchHost;
  return target.toString();
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 500) : "Unknown cleanup failure";
}

async function main() {
  const mode = process.argv[2];
  const manifestPath = argument("--manifest");
  const expectedBranchId = argument("--expected-branch");
  const resumePath = argument("--resume");
  const outputDirectory = path.resolve(argument("--output") ?? path.join(".local-audit", "forum-db-refactor"));
  const applyConfirmed = process.argv.includes("--confirm-post-cutover");

  if ((mode !== "dry-run" && mode !== "apply") || !manifestPath || !expectedBranchId) {
    throw new Error(
      "Usage: tsx scripts/delete-soft-deleted-nomination-files.ts <dry-run|apply> " +
      "--manifest <file> --expected-branch <branch-id> [--resume <results-file>] " +
      "[--output <directory>] [--confirm-post-cutover]",
    );
  }
  if (mode === "apply" && !applyConfirmed) {
    throw new Error("Apply requires --confirm-post-cutover after application cutover and active-file validation.");
  }

  const manifest = manifestSchema.parse(JSON.parse(await readFile(path.resolve(manifestPath), "utf8")));
  const completed = new Map<string, CleanupResult>();
  if (resumePath) {
    const prior = priorResultsSchema.parse(JSON.parse(await readFile(path.resolve(resumePath), "utf8")));
    for (const result of prior.results) {
      if (result.status === "BLOB_DELETED_METADATA_DELETED") {
        completed.set(result.id, result as CleanupResult);
      }
    }
  }
  const client = new Client({ connectionString: targetConnectionString() });
  await client.connect();
  const identity = (await client.query<{ branchId: string | null }>(
    `SELECT current_setting('neon.branch_id', true) AS "branchId"`,
  )).rows[0];
  if (identity?.branchId !== expectedBranchId) {
    throw new Error(`Connected branch ${identity?.branchId ?? "unknown"} does not match ${expectedBranchId}.`);
  }
  if (mode === "apply" && PROTECTED_BRANCH_IDS.has(expectedBranchId)) {
    throw new Error(`Refusing Blob and metadata deletion while connected to protected branch ${expectedBranchId}.`);
  }

  const results: CleanupResult[] = [];
  try {
    for (const object of manifest.objects) {
      const prior = completed.get(object.id);
      if (prior) {
        results.push(prior);
        continue;
      }
      const checkedAt = new Date().toISOString();
      if (object.decision !== "ELIGIBLE" || !object.blobKey || object.referencedByActiveNomination) {
        results.push({ id: object.id, blobKey: object.blobKey, status: "SKIPPED_MANIFEST", checkedAt });
        continue;
      }
      const activeReference = await client.query<{ exists: boolean }>(`
        SELECT EXISTS (
          SELECT 1 FROM "${TARGET_SCHEMA}"."Nomination" n,
          LATERAL jsonb_array_elements(n.files->'items') item
          WHERE item->>'blobKey' = $1 OR item->>'url' = $2
        ) AS exists
      `, [object.blobKey, object.url]);
      if (activeReference.rows[0]?.exists) {
        results.push({ id: object.id, blobKey: object.blobKey, status: "SKIPPED_ACTIVE_REFERENCE", checkedAt });
        continue;
      }
      const sourceMatch = await client.query<{ exists: boolean }>(`
        SELECT EXISTS (
          SELECT 1 FROM public."NominationFile"
          WHERE id = $1 AND "storageKey" = $2 AND "deletedAt" IS NOT NULL
        ) AS exists
      `, [object.id, object.blobKey]);
      if (!sourceMatch.rows[0]?.exists) {
        results.push({ id: object.id, blobKey: object.blobKey, status: "SKIPPED_SOURCE_MISMATCH", checkedAt });
        continue;
      }
      if (mode === "dry-run") {
        results.push({ id: object.id, blobKey: object.blobKey, status: "DRY_RUN_ELIGIBLE", checkedAt });
        continue;
      }
      try {
        await del(object.blobKey);
        const deleted = await client.query(`
          DELETE FROM public."NominationFile"
          WHERE id = $1 AND "storageKey" = $2 AND "deletedAt" IS NOT NULL
        `, [object.id, object.blobKey]);
        if (deleted.rowCount !== 1) throw new Error("Blob deleted, but the exact legacy metadata row was not deleted.");
        results.push({ id: object.id, blobKey: object.blobKey, status: "BLOB_DELETED_METADATA_DELETED", checkedAt });
      } catch (error) {
        results.push({ id: object.id, blobKey: object.blobKey, status: "FAILED", checkedAt, error: errorMessage(error) });
      }
    }
  } finally {
    await client.end();
  }

  await mkdir(outputDirectory, { recursive: true });
  const output = path.join(outputDirectory, `file-cleanup-${mode}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  await writeFile(output, `${JSON.stringify({ schemaVersion: 1, mode, expectedBranchId, results }, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600,
  });
  const counts = results.reduce<Record<string, number>>((all, result) => {
    all[result.status] = (all[result.status] ?? 0) + 1;
    return all;
  }, {});
  console.log(JSON.stringify({ mode, branchId: expectedBranchId, counts, output }, null, 2));
  if (results.some((result) => result.status === "FAILED")) process.exitCode = 1;
}

void main();
