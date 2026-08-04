import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { validateNominationBlockB } from "../features/applications/schemas/category-field-validation";
import { getCategoryScoringDefinition, validateReviewScores } from "../features/jury/scoring/category-scoring";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

function filesUnder(path: string): string[] {
  const absolute = join(root, path);
  return readdirSync(absolute).flatMap((name) => {
    const entry = join(absolute, name);
    return statSync(entry).isDirectory()
      ? filesUnder(relative(root, entry))
      : [relative(root, entry).replaceAll("\\", "/")];
  });
}

function includes(path: string, value: string, message: string) {
  assert.ok(read(path).includes(value), message);
}

// Authentication and unavailable-by-default behavior.
includes("app/test/(protected)/layout.tsx", "await requireTestSession()", "all protected /test pages inherit server-side session enforcement");
includes("app/test/login/page.tsx", "if (!isTestSystemAvailable()) notFound()", "missing TEST_PASSWORD makes the login page unavailable");
includes("features/test/server/auth.ts", "httpOnly: true", "test sessions are HttpOnly");
includes("features/test/server/auth.ts", "secure: true", "test sessions are Secure");
includes("features/test/server/auth.ts", 'sameSite: "strict"', "test sessions use strict SameSite policy");
includes("features/test/server/auth.ts", "consumeLoginAttempt", "test login is rate limited");
includes("app/api/test/route.ts", "await getTestSession()", "the existing test API is session protected");

for (const actionFile of filesUnder("app/test").filter((path) => path.endsWith("actions.ts") && !path.endsWith("login/actions.ts"))) {
  includes(actionFile, "requireTestSession", `${actionFile} authorizes every mutation on the server`);
}

// Central production/test isolation and cross-scope access prevention.
includes("features/test/server/data-scope.ts", 'storage.getStore() ?? { dataScope: "PRODUCTION" }', "production is the default data scope");
includes("shared/lib/prisma.ts", 'name: "data-scope-isolation"', "all normal Prisma access passes through the central scope extension");
includes("shared/lib/prisma.ts", "args.where = scopedWhere(args.where)", "reads, updates, and deletes receive a scope predicate");
includes("shared/lib/prisma.ts", "scopeNestedWrite", "nested writes automatically inherit scope");
includes("shared/lib/prisma.ts", "scopeNestedSelection", "nested list reads automatically inherit scope");
includes("features/account/server/accounts.ts", 'activateRequestDataScope({ dataScope: "TEST" })', "signed test actors activate TEST before account data is loaded");
includes("features/jury/server/auth.ts", "requireAccount()", "jury authentication reuses actor-aware account authorization");
includes("features/jury/server/reviews.ts", "requireJuryAuth()", "jury API mutations reuse actor-aware jury authorization");
includes("features/google-sheets/server/hooks.ts", 'getDataScopeContext().dataScope === "TEST"', "test changes never schedule Google Sheets sync");

for (const productionQueryFile of [
  "features/admin/server/admin.ts",
  "features/admin/server/participant-queries.ts",
  "features/admin/server/jury-queries.ts",
  "features/jury/server/reviews.ts",
  "features/google-sheets/server/stats.ts",
  "features/google-sheets/server/rows.ts",
  "features/tickets/server/ticket-repository.ts",
  "features/check-in/server/check-in-service.ts",
]) {
  includes(productionQueryFile, 'from "@/shared/lib/prisma"', `${productionQueryFile} uses the centrally production-scoped client`);
}

// Cleanup refuses production targets even though it intentionally uses the raw client.
includes("features/test/server/cleanup.ts", 'record.dataScope !== "TEST"', "single-entity cleanup refuses production records");
includes("features/test/server/cleanup.ts", 'dataScope: "PRODUCTION"', "scenario cleanup audits for production references before deletion");
includes("features/test/server/cleanup.ts", 'dataScope: "TEST"', "cleanup delete predicates are pinned to TEST scope");
assert.ok(!read("features/test/server/cleanup.ts").includes("deleteMany({})"), "cleanup never performs an unscoped deleteMany on production entities");
const unscopedConsumers = filesUnder("features")
  .filter((path) => path.endsWith(".ts") || path.endsWith(".tsx"))
  .filter((path) => read(path).includes("unscopedPrisma"));
assert.deepEqual(
  unscopedConsumers.sort(),
  ["features/test/server/cleanup.ts", "features/test/server/registry.ts"],
  "the unscoped database escape hatch is limited to guarded cleanup and the test-only registry",
);

// The production applicant and jury validation/state-transition services are actually reused.
includes("features/test/server/scenarios.ts", "validateNominationBlockB", "scenario generation calls the production nomination validator");
includes("features/test/server/scenarios.ts", "handleCompetitorStripeEvent", "applicant scenarios call the production payment fulfillment handler");
includes("features/test/server/scenarios.ts", "approveJuryApplicationWithoutPayment", "jury scenarios call the production activation flow");
includes("features/test/server/scenarios.ts", "saveJuryReviewDraft", "partial review scenarios call the production draft service");
includes("features/test/server/scenarios.ts", "submitJuryReview", "completed review scenarios call the production submit service");
includes("features/test/server/ticket-scenarios.ts", "handleTicketStripeEvent", "paid ticket scenarios call the production post-payment handler");

const nominationErrors = validateNominationBlockB("hair", {});
assert.ok(Object.keys(nominationErrors).length > 0, "the real applicant validator rejects an incomplete hair nomination");

const scoring = getCategoryScoringDefinition("hair");
assert.throws(
  () => validateReviewScores({ scores: {}, definition: scoring, requireComplete: true }),
  /score is required/i,
  "the real jury validator rejects an incomplete final review",
);
const completeScores = Object.fromEntries(scoring.criteria.map((criterion) => [criterion.key, criterion.maxScore]));
const validatedScores = validateReviewScores({ scores: completeScores, definition: scoring, requireComplete: true });
assert.equal(Object.values(validatedScores).filter((value) => value !== null).length, scoring.criteria.length, "the real jury validator accepts a complete valid review");

console.log("Test-system security, isolation, cleanup, and real-validation checks passed.");
