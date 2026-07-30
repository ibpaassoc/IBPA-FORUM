import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ApprovedCategoriesError,
  getInitialApprovedCategories,
  normalizeApprovedCategories,
  requireApprovedCategories,
} from "@/features/jury/lib/approved-categories";

const expertiseAreas = ["Hair", "Nail", "Makeup Artistry"];

assert.deepEqual(
  getInitialApprovedCategories(expertiseAreas),
  expertiseAreas,
  "new applications start with every declared expertise area approved",
);

assert.deepEqual(
  normalizeApprovedCategories(
    [" Nail ", "Hair", "Nail", "Unknown category", ""],
    expertiseAreas,
  ),
  ["Nail", "Hair"],
  "approved categories are unique, trimmed, and limited to declared expertise",
);

assert.throws(
  () => requireApprovedCategories([], expertiseAreas),
  (error) =>
    error instanceof ApprovedCategoriesError &&
    error.message === "Select at least one approved category.",
  "a judge must always retain at least one approved category",
);

assert.throws(
  () => requireApprovedCategories(["Brand"], expertiseAreas),
  ApprovedCategoriesError,
  "categories outside the application expertise cannot be approved",
);

const migration = readFileSync(
  join(
    process.cwd(),
    "prisma/migrations/20260729150000_add_jury_approved_categories/migration.sql",
  ),
  "utf8",
);

assert.match(migration, /ALTER TABLE "JuryApplication"/);
assert.match(migration, /ALTER TABLE "JuryProfile"/);
assert.match(migration, /SET "approvedCategories" = "expertiseAreas"/);

console.log("Jury approved-category checks passed.");
