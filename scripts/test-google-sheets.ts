import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const formatting = readFileSync(
  join(process.cwd(), "features/google-sheets/server/formatting.ts"),
  "utf8",
);

assert.match(formatting, /updateChartSpec: \{ chartId: existingId/);
assert.match(formatting, /updateEmbeddedObjectPosition:/);
assert.match(formatting, /existingChartIds\.slice\(specs\.length\)/);
assert.doesNotMatch(
  formatting,
  /for \(const id of existingChartIds\) \{\s*requests\.push\(\{ deleteEmbeddedObject/,
  "live refreshes must not delete every chart ID they observed",
);

console.log("Google Sheets chart refresh checks passed");
