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

const publicJuryQuery = readFileSync(
  join(process.cwd(), "features/jury/server/queries.ts"),
  "utf8",
);
assert.match(
  publicJuryQuery,
  /expertise: member\.approvedCategories/,
  "the approved-judges section publishes only admin-approved categories",
);

const adminPicker = readFileSync(
  join(
    process.cwd(),
    "features/admin/components/jury-applications/ApprovedCategoriesPicker.tsx",
  ),
  "utf8",
);
assert.match(adminPicker, /updateJuryApprovedCategoriesAction/);
assert.match(adminPicker, /Select at least one approved category/);
assert.match(adminPicker, /checked=\{checked\}/);

console.log("Jury approved-category checks passed.");
