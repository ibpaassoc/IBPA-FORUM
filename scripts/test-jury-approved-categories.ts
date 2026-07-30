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
    error.message === "Выберите хотя бы одну одобренную категорию.",
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
assert.match(adminPicker, /Выберите хотя бы одну одобренную категорию/);
assert.match(adminPicker, /checked=\{checked\}/);
assert.match(adminPicker, /createPortal/);
assert.match(adminPicker, /z-\[250\]/);

const juryApplicationList = readFileSync(
  join(
    process.cwd(),
    "features/admin/components/jury-applications/JuryApplicationListPage.tsx",
  ),
  "utf8",
);
assert.match(juryApplicationList, /role="link"/);
assert.match(juryApplicationList, /router\.push\(`\/admin\/jury-applications\/\$\{app\.id\}`\)/);

const juryReviews = readFileSync(
  join(process.cwd(), "features/jury/server/reviews.ts"),
  "utf8",
);
assert.doesNotMatch(
  juryReviews,
  /judge\.expertiseAreas/,
  "review authorization must not use the applicant's original expertise answer",
);
assert.match(
  juryReviews,
  /category: \{ name: \{ in: judge\.approvedCategories \} \}/,
  "review queries are scoped to approved categories",
);

const scoringShared = readFileSync(
  join(process.cwd(), "features/jury/server/scoring-shared.ts"),
  "utf8",
);
assert.doesNotMatch(
  scoringShared,
  /juryProfile\.approvedCategories\.length === 0/,
  "a signed-in judge with no category assignments sees an empty workspace instead of a login loop",
);
assert.doesNotMatch(
  scoringShared,
  /redirect\("\/account\/login"\)/,
  "authenticated jury authorization failures do not redirect back to the login page",
);

const nominationFilesRoute = readFileSync(
  join(
    process.cwd(),
    "app/api/account/jury/nomination-files/[fileId]/route.ts",
  ),
  "utf8",
);
assert.match(
  nominationFilesRoute,
  /juryUser\.approvedCategories\.includes/,
  "nomination file downloads use the same approved-category authorization",
);

const juryOverview = readFileSync(
  join(process.cwd(), "features/account/components/jury/JuryOverview.tsx"),
  "utf8",
);
assert.match(juryOverview, /Jury profile/);
assert.match(juryOverview, /Approved categories/);

const adminScoring = readFileSync(
  join(process.cwd(), "features/admin/server/admin.ts"),
  "utf8",
);
assert.doesNotMatch(adminScoring, /judge\.expertiseAreas/);
assert.match(adminScoring, /judge\.approvedCategories/);

const jurySheetRows = readFileSync(
  join(process.cwd(), "features/google-sheets/server/rows.ts"),
  "utf8",
);
assert.match(
  jurySheetRows,
  /orderCategories\(jury\.approvedCategories\)/,
  "approved category changes flow into the paid-jury sheet",
);

console.log("Jury approved-category checks passed.");
