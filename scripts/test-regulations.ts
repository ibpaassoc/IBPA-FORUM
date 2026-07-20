import assert from "node:assert/strict";
import {
  regulationAvailability,
  resolveRegulationLanguage,
  type RegulationAvailability,
} from "@/features/regulations/types";

const none: RegulationAvailability = { en: false, ru: false, ua: false };
const russianOnly: RegulationAvailability = { en: false, ru: true, ua: false };

assert.equal(resolveRegulationLanguage(none, "en"), null);
assert.equal(resolveRegulationLanguage(none, "ru"), null);
assert.equal(resolveRegulationLanguage(none, "ua"), null);

assert.equal(resolveRegulationLanguage(russianOnly, "en"), "ru");
assert.equal(resolveRegulationLanguage(russianOnly, "ru"), "ru");
assert.equal(resolveRegulationLanguage(russianOnly, "ua"), "ru");

assert.equal(
  resolveRegulationLanguage({ en: true, ru: true, ua: false }, "en"),
  "en",
);
assert.equal(
  resolveRegulationLanguage({ en: false, ru: true, ua: true }, "ua"),
  "ua",
);
assert.equal(
  resolveRegulationLanguage({ en: true, ru: false, ua: false }, "ua"),
  null,
  "English must not be used as a fallback for Ukrainian",
);
assert.equal(
  resolveRegulationLanguage({ en: true, ru: false, ua: true }, "ru"),
  null,
  "Russian requests must not fall forward to another language",
);

assert.deepEqual(
  regulationAvailability({
    en: "https://blob.example/regulations/general/en.pdf",
    ru: null,
    ua: "https://blob.example/regulations/general/ua.pdf",
  }),
  { en: true, ru: false, ua: true },
);

console.log("Regulation language fallback checks passed.");
