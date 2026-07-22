import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { categoryCatalog } from "@/features/applications/config/category-catalog";
import {
  SCORING_CRITERION_KEYS,
  buildReviewScoreData,
  calculateReviewTotal,
  categoryScoringDefinitions,
  getCategoryScoringDefinition,
  readReviewScores,
  validateReviewScores,
} from "@/features/jury/scoring/category-scoring";

const ROOT = process.cwd();
const expectedWeights = [20, 10, 10, 15, 20, 10, 15];
const catalogSlugs = categoryCatalog.map((category) => category.slug).sort();
const definitionSlugs = Object.keys(categoryScoringDefinitions).sort();

assert.deepEqual(definitionSlugs, catalogSlugs, "every nomination category has one scoring definition");
assert.equal(definitionSlugs.length, 11, "all 11 regulation categories are represented");

const serializedDefinitions = new Set<string>();
for (const slug of definitionSlugs) {
  const definition = getCategoryScoringDefinition(slug);
  assert.equal(definition.categorySlug, slug);
  assert.equal(definition.maximumTotal, 100);
  assert.equal(definition.criteria.length, 7);
  assert.deepEqual(definition.criteria.map((criterion) => criterion.key), SCORING_CRITERION_KEYS);
  assert.deepEqual(definition.criteria.map((criterion) => criterion.maxScore), expectedWeights);
  assert.match(definition.sourceDocument, /^IBPA_Rules_\d{2}_.+\.pdf$/);
  serializedDefinitions.add(JSON.stringify(definition));

  const maximumScores = Object.fromEntries(
    definition.criteria.map((criterion) => [criterion.key, criterion.maxScore])
  );
  const validated = validateReviewScores({
    scores: maximumScores,
    definition,
    requireComplete: true,
  });
  assert.equal(calculateReviewTotal(validated), 100);
  assert.deepEqual(
    readReviewScores(buildReviewScoreData(definition, validated), definition),
    validated
  );
  assert.throws(
    () => validateReviewScores({
      scores: { ...maximumScores, [definition.criteria[0].key]: 21 },
      definition,
      requireComplete: true,
    }),
    /0 to 20/
  );
}

assert.equal(serializedDefinitions.size, definitionSlugs.length, "each category JSONB snapshot is distinct");

const migration = readFileSync(
  join(ROOT, "prisma/migrations/20260722100000_add_category_scoring/migration.sql"),
  "utf8"
);
for (const slug of definitionSlugs) {
  assert.match(migration, new RegExp(`'${slug.replaceAll("-", "\\-")}'`));
}
assert.match(migration, /ADD COLUMN "scoringSchema" JSONB/);
assert.match(migration, /ALTER COLUMN "scoringSchema" SET NOT NULL/);

console.log("Category scoring checks passed for 11 distinct 100-point regulation scorecards.");
