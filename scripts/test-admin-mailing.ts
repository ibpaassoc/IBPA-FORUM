import assert from "node:assert/strict";
import {
  averageCompletion,
  buildAdminMailingEmail,
  chunkItems,
  deduplicateRecipientsByEmail,
  getRegistrationState,
  MAILING_ELIGIBLE_JURY_STATUSES,
  mailingFormSchema,
  parseRecipientRef,
  planMailingBatches,
  splitRecipientRefs,
  toRecipientRef,
} from "@/features/admin/lib/mailing";
import { reserveRateLimitSlot } from "@/features/admin/lib/rate-limit";
import { readFileSync } from "node:fs";
import { join } from "node:path";

assert.equal(averageCompletion([]), 0);
assert.equal(averageCompletion([25, 50, 100]), 58);

assert.deepEqual(MAILING_ELIGIBLE_JURY_STATUSES, ["APPROVED", "PAID"]);

assert.deepEqual(
  deduplicateRecipientsByEmail([
    { id: "applicant", email: "User@Example.com" },
    { id: "jury", email: " user@example.com " },
    { id: "another", email: "another@example.com" },
  ]).map((recipient) => recipient.id),
  ["applicant", "another"],
);

assert.deepEqual(
  getRegistrationState({ passwordHash: "hash", status: "ACTIVE" }),
  { key: "registered", label: "Зарегистрирован" },
);
assert.deepEqual(
  getRegistrationState({ passwordHash: null, status: "INVITED" }),
  { key: "not-registered", label: "Не зарегистрирован" },
);
assert.deepEqual(
  getRegistrationState({ passwordHash: "hash", status: "DISABLED" }),
  { key: "disabled", label: "Отключён" },
);

const parsed = mailingFormSchema.parse({
  subject: " Напоминание ",
  body: "Первая строка\nВторая строка\n\nНовый абзац",
  recipientIds: ["account-1", "account-1", "account-2"],
  confirmation: "yes",
});
assert.deepEqual(parsed.recipientIds, ["account:account-1", "account:account-2"]);
assert.equal(parsed.subject, "Напоминание");

const mixed = mailingFormSchema.parse({
  subject: "s",
  body: "b",
  recipientIds: ["account:a1", "ticket:t1", "ticket:t1", "legacyid"],
  runId: "run_12345678",
  confirmation: "yes",
});
assert.deepEqual(mixed.recipientIds, ["account:a1", "ticket:t1", "account:legacyid"]);
assert.equal(mixed.runId, "run_12345678");
assert.equal(
  mailingFormSchema.safeParse({ ...mixed, recipientIds: ["ticket:bad id!"] }).success,
  false,
  "refs with unsafe characters are rejected",
);
assert.equal(
  mailingFormSchema.safeParse({
    ...mixed,
    recipientIds: Array.from({ length: 51 }, (_, index) => `ticket:t${index}`),
  }).success,
  false,
  "a single request is capped",
);
assert.equal(mailingFormSchema.safeParse({ ...mixed, runId: "x" }).success, false);

assert.equal(toRecipientRef("ticket", "t1"), "ticket:t1");
assert.deepEqual(parseRecipientRef("ticket:t1"), { kind: "ticket", id: "t1" });
assert.equal(parseRecipientRef("nope"), null);
assert.deepEqual(splitRecipientRefs(["account:a", "ticket:t", "ticket:u", "junk"]), {
  accountIds: ["a"],
  ticketIds: ["t", "u"],
});

assert.deepEqual(chunkItems([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
assert.deepEqual(chunkItems([], 20), []);
const plan = planMailingBatches(
  [
    { ref: "account:a", email: "Same@Example.com" },
    { ref: "ticket:t", email: "same@example.com " },
    ...Array.from({ length: 44 }, (_, index) => ({
      ref: `ticket:t${index}`,
      email: `p${index}@example.com`,
    })),
  ],
  20,
);
assert.equal(plan.uniqueCount, 45);
assert.equal(plan.duplicateCount, 1);
assert.deepEqual(plan.batches.map((batch) => batch.length), [20, 20, 5]);
assert.equal(plan.batches[0][0], "account:a", "first occurrence wins");

const email = buildAdminMailingEmail({
  subject: "IBPA <script>",
  body: "Hello <img src=x onerror=alert(1)>\nNext line",
});
assert.equal(email.subject, "IBPA <script>");
assert.match(email.html, /IBPA &lt;script&gt;/);
assert.match(email.html, /Hello &lt;img src=x onerror=alert\(1\)&gt;<br \/>Next line/);
assert.doesNotMatch(email.html, /<script>/);
assert.doesNotMatch(email.html, /<img src=x/);
assert.equal(email.text, "Hello <img src=x onerror=alert(1)>\nNext line");

assert.equal(
  mailingFormSchema.safeParse({
    subject: "",
    body: "",
    recipientIds: [],
    confirmation: undefined,
  }).success,
  false,
);

const firstSlot = reserveRateLimitSlot({
  now: 1_000,
  nextStartAt: 0,
  maxStartsPerSecond: 8,
});
assert.deepEqual(firstSlot, { delayMs: 0, nextStartAt: 1_125 });
const secondSlot = reserveRateLimitSlot({
  now: 1_000,
  nextStartAt: firstSlot.nextStartAt,
  maxStartsPerSecond: 8,
});
assert.deepEqual(secondSlot, { delayMs: 125, nextStartAt: 1_250 });

const mailingServer = readFileSync(
  join(process.cwd(), "features/admin/server/mailing.ts"),
  "utf8",
);
function occurrences(source: string, needle: string) {
  return source.split(needle).length - 1;
}

assert.ok(
  mailingServer.includes("SEND_CONCURRENCY,") &&
    mailingServer.includes("SEND_STARTS_PER_SECOND,"),
  "sends are throttled and bounded",
);
assert.equal(
  occurrences(mailingServer, "status: { in: [...MAILING_ELIGIBLE_JURY_STATUSES] }"),
  1,
  "jury approval lives in one shared where-builder",
);
assert.equal(
  occurrences(mailingServer, "mailingAccountWhere("),
  3,
  "the account where-builder is used for listing and for resolving send targets",
);
assert.equal(
  occurrences(mailingServer, "status: { in: [...TICKET_CONFIRMED_STATUSES] }"),
  1,
  "ticket recipients are limited to paid/admin-issued tickets via one shared where-builder",
);
assert.equal(
  occurrences(mailingServer, "mailingTicketWhere("),
  3,
  "the ticket where-builder is used for listing and for resolving send targets",
);
assert.ok(mailingServer.includes("CREATED_MANUALLY"), "admin-issued tickets are identified");

console.log("Admin mailing validation passed.");
