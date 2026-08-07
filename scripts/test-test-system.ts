import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { inflateSync } from "node:zlib";
import { validateNominationBlockB } from "../features/applications/schemas/category-field-validation";
import { getCategoryScoringDefinition, validateReviewScores } from "../features/jury/scoring/category-scoring";
import { buildSampleAsset, createSamplePdf, createSamplePng } from "../features/test/lib/sample-assets";

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
includes("features/test/server/auth.ts", 'redirect("/test/login")', "unauthenticated test pages return to the server-validated login flow");
includes("app/api/test/route.ts", "await getTestSession()", "the existing test API is session protected");

// Dashboard icons stay inside a client boundary instead of crossing the RSC payload as functions.
includes("app/test/(protected)/page.tsx", "<TestDashboardMetrics counts={counts} />", "the server dashboard passes only serializable metric data");
assert.ok(!read("app/test/(protected)/page.tsx").includes("lucide-react"), "the server dashboard does not pass Lucide component functions to a client component");
includes("features/test/components/TestDashboardMetrics.tsx", '"use client"', "dashboard icon rendering lives inside a client component");
includes("features/test/components/TestDashboardMetrics.tsx", "icon={Icon}", "the client metric grid renders the selected icon locally");

for (const actionFile of filesUnder("app/test").filter((path) => path.endsWith("actions.ts") && !path.endsWith("login/actions.ts"))) {
  includes(actionFile, "requireTestSession", `${actionFile} authorizes every mutation on the server`);
}

// Central production/test isolation and cross-scope access prevention.
includes("features/test/server/data-scope.ts", 'storage.getStore() ?? { dataScope: "PRODUCTION" }', "production is the default data scope");
includes("features/test/server/data-scope.ts", "globalForDataScope.ibpaDataScopeStorage = storage", "all Next.js server bundles share one data-scope store");
includes("features/test/server/data-scope.ts", "storage.run(context, async () => await work())", "lazy Prisma promises execute before the scoped callback exits");
includes("features/test/server/data-scope.ts", "{ ...getDataScopeContext(), ...context }", "late actor activation preserves scenario and delivery metadata");
includes("shared/lib/prisma.ts", 'name: "data-scope-isolation"', "all normal Prisma access passes through the central scope extension");
includes("shared/lib/prisma.ts", "args.where = scopedWhere(args.where)", "reads, updates, and deletes receive a scope predicate");
includes("shared/lib/prisma.ts", "scopeNestedWrite", "nested writes automatically inherit scope");
includes("shared/lib/prisma.ts", "scopeNestedSelection", "nested list reads automatically inherit scope");
includes("features/account/server/accounts.ts", 'activateRequestDataScope({ dataScope: "TEST" })', "signed test actors activate TEST before account data is loaded");
includes("features/jury/server/auth.ts", 'requireAccount("JURY")', "jury authentication reuses actor-aware account authorization");
includes("features/jury/server/reviews.ts", "requireJuryAuth()", "jury API mutations reuse actor-aware jury authorization");
includes("features/jury/server/reviews.ts", "activateRequestDataScope({ dataScope: judge.dataScope })", "jury review reads and writes preserve a signed test actor's scope");
includes("features/google-sheets/server/hooks.ts", 'getDataScopeContext().dataScope !== "PRODUCTION"', "non-production changes never schedule Google Sheets sync");
includes("app/test/(protected)/creations/page.tsx", "item.account?.email", "the registry renders orphaned test profiles without crashing");

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
  [
    "features/account/server/accounts.ts",
    "features/account/server/tokens.ts",
    "features/test/server/cleanup.ts",
    "features/test/server/dev-accounts.ts",
    "features/test/server/registry.ts",
  ],
  "the unscoped database escape hatch is limited to guarded scope discovery and isolated-data management",
);
includes("features/account/server/accounts.ts", 'account?.dataScope === "TEST" ? null : account', "public credentials never discover TEST actors");
includes("app/login/page.tsx", "findAccountForPublicSession", "stale or test-only sessions cannot trap the public login route in a redirect loop");
includes("features/account/server/accounts.ts", 'session.user.dataScope ?? "PRODUCTION"', "normal account sessions activate their authoritative data scope");
includes("features/account/server/tokens.ts", "activateRequestDataScope({ dataScope: account.dataScope })", "setup links restore the owning account scope");
includes("features/test/server/dev-accounts.ts", 'runWithDataScope({ dataScope: "DEV" }', "DEV account management is pinned to DEV scope");

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

// Seeded uploads must be real files. Scenarios used to record invented blob
// paths, so every preview in the applicant and jury accounts resolved to a
// missing blob and rendered broken.
includes(
  "features/test/server/scenarios.ts",
  "await put(pathname, asset.bytes",
  "test scenarios upload their sample files to Blob storage",
);
includes(
  "features/test/server/scenarios.ts",
  "`applications/${nominationId}/${fieldKey}/${fileName}`",
  "seeded blobs use the production path prefix that cleanup deletes",
);
assert.ok(
  read("features/test/server/cleanup.ts").includes('key.startsWith("applications/")'),
  "scenario cleanup deletes blobs written under the applications prefix",
);

const samplePng = createSamplePng({ width: 640, height: 480, seed: 3 });
assert.ok(
  samplePng.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  "the sample image is a real PNG",
);
assert.equal(samplePng.readUInt32BE(16), 640, "the sample PNG records its width");
assert.equal(samplePng.readUInt32BE(20), 480, "the sample PNG records its height");
const pngIdatStart = samplePng.indexOf(Buffer.from("IDAT", "ascii"));
const pngIdatLength = samplePng.readUInt32BE(pngIdatStart - 4);
assert.equal(
  inflateSync(samplePng.subarray(pngIdatStart + 4, pngIdatStart + 4 + pngIdatLength)).length,
  480 * (640 * 3 + 1),
  "the sample PNG's pixel data inflates to a full set of scanlines",
);

const samplePdf = createSamplePdf("Sample").toString("latin1");
assert.ok(samplePdf.startsWith("%PDF-1."), "the sample document is a real PDF");
const startxref = Number(samplePdf.slice(samplePdf.lastIndexOf("startxref") + 9).trim().split("\n")[0]);
assert.equal(samplePdf.slice(startxref, startxref + 4), "xref", "the sample PDF's startxref points at its xref table");

for (const accept of [["image/jpeg", "image/png"], ["image/jpeg", "image/png", "application/pdf"], ["application/pdf"]]) {
  const asset = buildSampleAsset({ accept, label: "sample", seed: 1 });
  assert.ok(
    accept.includes(asset.mimeType),
    `a seeded file for accept=[${accept.join(",")}] stays within the field's allowed types`,
  );
}

console.log("Test-system security, isolation, cleanup, and real-validation checks passed.");
