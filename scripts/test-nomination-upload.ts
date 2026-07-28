/**
 * Focused checks for the nomination direct-upload queue and idempotent
 * persistence safeguards.
 *
 *   npm run test:nomination-upload
 */
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runUploadQueue } from "@/features/applications/client/upload-queue";

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

async function testSingleUpload() {
  let attempts = 0;
  const progress: number[] = [];
  const result = await runUploadQueue(
    [
      {
        id: "one",
        upload: async (onProgress) => {
          attempts += 1;
          onProgress({ loaded: 5, total: 10, percentage: 50 });
          onProgress({ loaded: 10, total: 10, percentage: 100 });
          return "blob-one";
        },
      },
    ],
    {
      concurrency: 3,
      onProgress: (_id, value) => progress.push(value.percentage),
    },
  );

  assert.equal(attempts, 1);
  assert.deepEqual(progress, [50, 100]);
  assert.equal(result.completed.get("one"), "blob-one");
  assert.equal(result.failed.length, 0);
}

async function testLimitedConcurrency() {
  let active = 0;
  let maxActive = 0;
  const tasks = Array.from({ length: 7 }, (_, index) => ({
    id: `file-${index}`,
    upload: async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
      return index;
    },
  }));

  const result = await runUploadQueue(tasks, { concurrency: 3 });
  assert.equal(result.completed.size, 7);
  assert.equal(result.failed.length, 0);
  assert.equal(maxActive, 3);
}

async function testFailedUploadRetry() {
  const attempts = new Map<string, number>();
  const makeTask = (id: string) => ({
    id,
    upload: async () => {
      attempts.set(id, (attempts.get(id) ?? 0) + 1);
      if (id === "retry-me" && attempts.get(id) === 1) {
        throw new Error("Simulated connection loss");
      }
      return `blob-${id}`;
    },
  });

  const first = await runUploadQueue(
    ["kept-one", "retry-me", "kept-two"].map(makeTask),
    { concurrency: 2 },
  );
  assert.deepEqual(
    [...first.completed.keys()].sort(),
    ["kept-one", "kept-two"],
  );
  assert.deepEqual(first.failed.map((failure) => failure.id), ["retry-me"]);

  const retry = await runUploadQueue(first.failed.map(({ id }) => makeTask(id)), {
    concurrency: 2,
  });
  assert.equal(retry.completed.get("retry-me"), "blob-retry-me");
  assert.equal(attempts.get("kept-one"), 1);
  assert.equal(attempts.get("kept-two"), 1);
  assert.equal(attempts.get("retry-me"), 2);
}

function testServerSafeguards() {
  const tokenRoute = read("app/api/applications/upload/route.ts");
  assert.match(tokenRoute, /requireEditableNomination/);
  assert.match(tokenRoute, /field\.accept/);
  assert.match(tokenRoute, /field\.maxFileSizeMb/);
  assert.match(tokenRoute, /validUntil/);

  const nominationRoute = read(
    "app/api/applicant/nominations/[nominationId]/route.ts",
  );
  assert.match(nominationRoute, /await head\(ref\.fileUrl\)/);
  assert.match(nominationRoute, /nominationFile\.findFirst/);
  assert.match(nominationRoute, /nominationFile\.update/);
  assert.match(nominationRoute, /nominationFile\.create/);
  assert.doesNotMatch(nominationRoute, /nominationFile\.createMany/);

  const schema = read("prisma/schema.prisma");
  assert.match(
    schema,
    /@@unique\(\[nominationApplicationId, fileUrl\]\)/,
  );

  const publicRoute = read("app/api/applications/route.ts");
  assert.match(publicRoute, /RAW_FILE_REJECTED/);
}

async function main() {
  await testSingleUpload();
  await testLimitedConcurrency();
  await testFailedUploadRetry();
  testServerSafeguards();
  console.log("nomination upload checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
