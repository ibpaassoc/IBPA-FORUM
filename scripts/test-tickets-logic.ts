/**
 * Pure-logic unit tests for the ticket payment flow.
 *
 * These exercise the framework-free helpers that back duplicate-replacement,
 * paid-detection, pricing, checkout metadata, and the localized refund notice —
 * no database, Stripe, or running server required.
 *
 *   npm run test:tickets
 */
import {
  isTicketPaymentConfirmed,
  TICKET_CONFIRMED_STATUSES,
} from "@/features/tickets/lib/ticket-status";
import { normalizeTicketEmail } from "@/features/tickets/lib/normalize-email";
import {
  computeTicketAmountCents,
  TICKET_AMOUNTS_CENTS,
  GALA_DINNER_CENTS,
} from "@/features/tickets/lib/pricing";
import { decideTicketReplacement } from "@/features/tickets/lib/replacement";
import {
  buildTicketCheckoutMetadata,
  TICKET_FLOW_TYPE,
} from "@/features/tickets/lib/checkout-metadata";
import { translations } from "@/lib/i18n/translations";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${label}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${label}`);
  }
}

function eq<T>(actual: T, expected: T, label: string) {
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${label} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`
  );
}

// ── Paid detection (scenarios 5, 6, 11) ──────────────────────────────────────
console.log("isTicketPaymentConfirmed");
eq(isTicketPaymentConfirmed("PAID"), true, "PAID is confirmed");
eq(isTicketPaymentConfirmed("CHECKED_ONE_DAY"), true, "CHECKED_ONE_DAY is confirmed");
eq(isTicketPaymentConfirmed("CHECKED_TWO_DAY"), true, "CHECKED_TWO_DAY is confirmed");
eq(isTicketPaymentConfirmed("CHECKED_GALA_DINNER"), true, "CHECKED_GALA_DINNER is confirmed");
eq(isTicketPaymentConfirmed("PENDING"), false, "PENDING is NOT confirmed");
eq(isTicketPaymentConfirmed("CANCELED"), false, "CANCELED is NOT confirmed");
eq(TICKET_CONFIRMED_STATUSES.includes("PENDING" as never), false, "PENDING not in confirmed set");

// ── Email normalization (scenarios 3, 4) ─────────────────────────────────────
console.log("normalizeTicketEmail");
eq(normalizeTicketEmail("  Jane@Example.COM "), "jane@example.com", "trims and lowercases");
eq(
  normalizeTicketEmail("Person@Mail.com"),
  normalizeTicketEmail("person@mail.com"),
  "case-insensitive equality"
);
eq(
  normalizeTicketEmail("  a@b.com"),
  normalizeTicketEmail("a@b.com  "),
  "whitespace-insensitive equality"
);

// ── Replacement decision (scenarios 1, 2, 5, 6, 17) ──────────────────────────
console.log("decideTicketReplacement");
eq(decideTicketReplacement([]), { kind: "create", deleteIds: [] }, "no existing → create");
eq(
  decideTicketReplacement([{ id: "t1", status: "PENDING" }]),
  { kind: "reuse", reuseId: "t1", deleteIds: [] },
  "single unpaid → reuse it"
);
eq(
  // Caller passes newest-first; newest is reused, older unpaid duplicates deleted.
  decideTicketReplacement([
    { id: "new", status: "PENDING" },
    { id: "old", status: "PENDING" },
  ]),
  { kind: "reuse", reuseId: "new", deleteIds: ["old"] },
  "multiple unpaid → reuse newest, delete rest"
);
eq(
  decideTicketReplacement([{ id: "paid1", status: "PAID" }]),
  { kind: "blocked-paid", paidTicketId: "paid1" },
  "paid → blocked"
);
eq(
  decideTicketReplacement([{ id: "checked", status: "CHECKED_TWO_DAY" }]),
  { kind: "blocked-paid", paidTicketId: "checked" },
  "checked-in → blocked (treated as paid)"
);
{
  // Paid + unpaid for same email → blocked, and the paid id is NEVER in deleteIds.
  const decision = decideTicketReplacement([
    { id: "pending", status: "PENDING" },
    { id: "paid", status: "PAID" },
  ]);
  eq(decision.kind, "blocked-paid", "mixed paid+unpaid → blocked");
  assert(
    decision.kind === "blocked-paid" && decision.paidTicketId === "paid",
    "mixed → identifies the paid ticket"
  );
  assert(
    !("deleteIds" in decision),
    "blocked decision deletes nothing (paid ticket protected)"
  );
}

// ── Pricing (canonical, discount on forum pass only) ─────────────────────────
console.log("computeTicketAmountCents");
eq(
  computeTicketAmountCents({
    type: "ONE_DAY",
    isIbpaMember: false,
    galaDinner: false,
    earlyBirdDiscount: null,
  }).totalCents,
  TICKET_AMOUNTS_CENTS.ONE_DAY.standard,
  "one-day standard, no gala"
);
eq(
  computeTicketAmountCents({
    type: "ONE_DAY",
    isIbpaMember: true,
    galaDinner: false,
    earlyBirdDiscount: null,
  }).totalCents,
  TICKET_AMOUNTS_CENTS.ONE_DAY.ibpa,
  "one-day member price"
);
eq(
  computeTicketAmountCents({
    type: "TWO_DAYS",
    isIbpaMember: false,
    galaDinner: true,
    earlyBirdDiscount: null,
  }).totalCents,
  TICKET_AMOUNTS_CENTS.TWO_DAYS.standard + GALA_DINNER_CENTS,
  "two-day + gala add-on"
);
{
  // 20% off applies to the forum pass only — gala is never discounted.
  const amounts = computeTicketAmountCents({
    type: "ONE_DAY",
    isIbpaMember: false,
    galaDinner: true,
    earlyBirdDiscount: { type: "percent", value: 20 },
  });
  eq(amounts.ticketCents, Math.round(39500 * 0.8), "forum pass discounted 20%");
  eq(amounts.galaCents, GALA_DINNER_CENTS, "gala not discounted");
  eq(amounts.totalCents, Math.round(39500 * 0.8) + GALA_DINNER_CENTS, "total = discounted pass + gala");
}

// ── Checkout metadata (scenario 10 + webhook-routing safety) ─────────────────
console.log("buildTicketCheckoutMetadata");
{
  const meta = buildTicketCheckoutMetadata({
    ticketId: "tk_123",
    email: "jane@example.com",
    type: "TWO_DAYS",
    galaDinner: true,
    locale: "ru",
  });
  eq(meta.flowType, TICKET_FLOW_TYPE, "flowType is the ticket discriminator");
  eq(meta.ticketId, "tk_123", "carries ticketId for the webhook");
  eq(meta.email, "jane@example.com", "carries email");
  eq(meta.ticketType, "TWO_DAYS", "carries ticket type");
  eq(meta.galaDinner, "true", "carries gala flag as string");
  eq(meta.quantity, "1", "carries quantity");
  eq(meta.locale, "ru", "carries locale");
  eq(meta.checkoutType, "ticket", "carries internal checkout type");
  assert(
    !("applicationId" in meta) && !("juryApplicationId" in meta),
    "never carries applicationId/juryApplicationId (won't misroute to award/jury)"
  );
  // Stripe metadata values must all be strings.
  assert(
    Object.values(meta).every((v) => typeof v === "string"),
    "all metadata values are strings"
  );
}

// ── Refund notice localization (scenarios 13, 14, 15, 16) ────────────────────
console.log("refund notice translations");
for (const lang of ["en", "ru", "ua"] as const) {
  const notice = translations[lang].ticketFlow.success.refundNotice;
  assert(typeof notice === "string" && notice.length > 40, `${lang}: refund notice present`);
}
assert(
  translations.en.ticketFlow.success.refundNotice.includes("refund in accordance"),
  "en refund notice has expected wording"
);
assert(
  translations.ru.ticketFlow.success.refundNotice.includes("возврат средств"),
  "ru refund notice has expected wording"
);
assert(
  translations.ua.ticketFlow.success.refundNotice.includes("повернення коштів"),
  "ua refund notice has expected wording"
);
{
  // Scenario 16: the notice lives ONLY under ticketFlow.success — it must not
  // leak into any other (jury/award/generic) translated string.
  const phrase = "refund in accordance";
  let occurrences = 0;
  const walk = (node: unknown) => {
    if (typeof node === "string") {
      if (node.includes(phrase)) occurrences += 1;
    } else if (node && typeof node === "object") {
      Object.values(node as Record<string, unknown>).forEach(walk);
    }
  };
  walk(translations.en);
  eq(occurrences, 1, "en refund phrase appears in exactly one place (ticket success only)");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exitCode = 1;
}
