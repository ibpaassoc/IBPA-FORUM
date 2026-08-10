import assert from "node:assert/strict";
import {
  averageCompletion,
  buildAdminMailingEmail,
  deduplicateRecipientsByEmail,
  getRegistrationState,
  mailingFormSchema,
} from "@/features/admin/lib/mailing";
import { reserveRateLimitSlot } from "@/features/admin/lib/rate-limit";
import { readFileSync } from "node:fs";
import { join } from "node:path";

assert.equal(averageCompletion([]), 0);
assert.equal(averageCompletion([25, 50, 100]), 58);

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
assert.deepEqual(parsed.recipientIds, ["account-1", "account-2"]);
assert.equal(parsed.subject, "Напоминание");

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
assert.match(mailingServer, /runWithConcurrency\(uniqueAccounts, 4, 8,/);

console.log("Admin mailing validation passed.");
