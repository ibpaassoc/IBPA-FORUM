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
} from "@/features/tickets/lib/pricing";
import {
  getSecondInstallmentDate,
  splitTicketTotalIntoTwoPayments,
} from "@/features/tickets/lib/payment-plan";
import { TEST_TICKET_PRICING } from "@/features/test/fixtures/ticket-pricing";
import { calculatePromoDiscount } from "@/features/promos/lib/promo-codes";
import { decideTicketReplacement } from "@/features/tickets/lib/replacement";
import {
  buildTicketCheckoutMetadata,
  buildSpecialPacketCheckoutMetadata,
  TICKET_FLOW_TYPE,
} from "@/features/tickets/lib/checkout-metadata";
import { ticketApiSchema } from "@/features/tickets/schemas/ticket-form-schema";
import {
  adminTicketUpdateSchema,
  adminManualTicketSchema,
  ADMIN_GENERATED_VALUE,
  compareEditableTicketChanges,
  hasQrRelevantChanges,
  ticketCanBeDeleted,
  ticketCanReceiveQr,
} from "@/features/tickets/lib/admin-ticket-rules";
import { translations } from "@/lib/i18n/translations";
import { ticketConfirmationTemplate } from "@/features/tickets/templates/ticket-confirmation";

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

{
  const meta = buildSpecialPacketCheckoutMetadata({
    ticketIds: ["tk_first", "tk_second"],
    paymentId: "pay_special",
    paymentPlan: "TWO_INSTALLMENTS",
    email: "buyer@example.com",
    locale: "en",
  });
  eq(meta.ticketId, "tk_first", "Special Packet metadata carries the primary ticket");
  eq(meta.ticketIds, "tk_first,tk_second", "Special Packet metadata carries both ticket ids");
  eq(meta.paymentId, "pay_special", "Special Packet metadata carries the payment id");
  eq(meta.paymentPlan, "TWO_INSTALLMENTS", "Special Packet metadata carries the payment plan");
  eq(meta.specialPacket, "true", "Special Packet metadata is explicitly marked");
  eq(meta.quantity, "2", "Special Packet metadata records two tickets");
}

// ── Special Packet request validation ────────────────────────────────────────
console.log("special packet validation");
{
  const attendee = {
    firstName: "Jane",
    lastName: "Client",
    email: "jane@example.com",
    phone: "+1 555 000 0000",
    instagram: "@jane",
  };
  const valid = ticketApiSchema.safeParse({
    ...attendee,
    type: "SPECIAL_PACKET",
    galaDinner: true,
    isIbpaMember: false,
    secondAttendee: { ...attendee, firstName: "Joan", email: "joan@example.com" },
  });
  assert(valid.success, "Special Packet requires and accepts two complete attendees");
  assert(
    !ticketApiSchema.safeParse({
      ...attendee,
      type: "SPECIAL_PACKET",
      galaDinner: true,
      isIbpaMember: false,
    }).success,
    "Special Packet rejects a missing second attendee"
  );
  assert(
    !ticketApiSchema.safeParse({
      ...attendee,
      type: "SPECIAL_PACKET",
      galaDinner: false,
      isIbpaMember: false,
      secondAttendee: attendee,
    }).success,
    "Special Packet always includes Gala Dinner"
  );
}

function eq<T>(actual: T, expected: T, label: string) {
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${label} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`
  );
}

// ── Two-payment plan (exact cent split and fixed 14-day delay) ──────────────
console.log("two-payment plan");
eq(
  splitTicketTotalIntoTwoPayments(69_500),
  { firstAmountCents: 34_750, secondAmountCents: 34_750 },
  "$695.00 splits evenly"
);
eq(
  splitTicketTotalIntoTwoPayments(59_501),
  { firstAmountCents: 29_750, secondAmountCents: 29_751 },
  "odd cent is collected with payment #2"
);
{
  const firstPaidAt = new Date("2026-08-19T19:30:00.000Z");
  eq(
    getSecondInstallmentDate(firstPaidAt).toISOString(),
    "2026-09-02T19:30:00.000Z",
    "payment #2 is exactly 14 days after payment #1"
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
  { kind: "create", deleteIds: [] },
  "paid does not block another ticket purchase"
);
eq(
  decideTicketReplacement([{ id: "checked", status: "CHECKED_TWO_DAY" }]),
  { kind: "create", deleteIds: [] },
  "checked-in ticket does not block another ticket purchase"
);
{
  // Paid + unpaid for same email -> reuse the unpaid row and never touch the paid one.
  const decision = decideTicketReplacement([
    { id: "pending", status: "PENDING" },
    { id: "paid", status: "PAID" },
  ]);
  eq(
    decision,
    { kind: "reuse", reuseId: "pending", deleteIds: [] },
    "mixed paid+unpaid reuses unpaid checkout"
  );
}

// ── Pricing (canonical, discount on forum pass only) ─────────────────────────
console.log("computeTicketAmountCents");
eq(
  computeTicketAmountCents({
    type: "ONE_DAY",
    isIbpaMember: false,
    galaDinner: false,
    ticketDiscount: null,
    pricing: TEST_TICKET_PRICING,
  }).totalCents,
  TEST_TICKET_PRICING.ticketAmountsCents.ONE_DAY.standard,
  "one-day standard, no gala"
);
eq(
  computeTicketAmountCents({
    type: "ONE_DAY",
    isIbpaMember: true,
    galaDinner: false,
    ticketDiscount: null,
    pricing: TEST_TICKET_PRICING,
  }).totalCents,
  TEST_TICKET_PRICING.ticketAmountsCents.ONE_DAY.ibpa,
  "one-day member price"
);
eq(
  computeTicketAmountCents({
    type: "TWO_DAYS",
    isIbpaMember: false,
    galaDinner: true,
    ticketDiscount: null,
    pricing: TEST_TICKET_PRICING,
  }).totalCents,
  TEST_TICKET_PRICING.ticketAmountsCents.TWO_DAYS.standard + TEST_TICKET_PRICING.galaDinnerCents,
  "two-day + gala add-on"
);
{
  // 20% off applies to the forum pass only — gala is never discounted.
  const amounts = computeTicketAmountCents({
    type: "ONE_DAY",
    isIbpaMember: false,
    galaDinner: true,
    ticketDiscount: { type: "percent", value: 20 },
    pricing: TEST_TICKET_PRICING,
  });
  eq(amounts.ticketCents, Math.round(39500 * 0.8), "forum pass discounted 20%");
  eq(amounts.galaCents, TEST_TICKET_PRICING.galaDinnerCents, "gala not discounted");
eq(amounts.totalCents, Math.round(39500 * 0.8) + TEST_TICKET_PRICING.galaDinnerCents, "total = discounted pass + gala");
}
{
  // Automatic ticket discounts and promo codes stack on the forum pass only.
  const amounts = computeTicketAmountCents({
    type: "ONE_DAY",
    isIbpaMember: false,
    galaDinner: true,
    ticketDiscount: { type: "percent", value: 30 },
    pricing: TEST_TICKET_PRICING,
  });
  const promo = calculatePromoDiscount(amounts.ticketCents, 30);
  eq(amounts.ticketCents, 27650, "automatic 30% applies before the ticket promo");
  eq(promo.finalAmountCents + amounts.galaCents, 34355, "stacked promo never discounts Gala Dinner");
}

// ── Checkout metadata (scenario 10 + webhook-routing safety) ─────────────────
console.log("buildTicketCheckoutMetadata");
{
  const meta = buildTicketCheckoutMetadata({
    ticketId: "tk_123",
    paymentId: "pay_123",
    paymentPlan: "FULL",
    email: "jane@example.com",
    type: "TWO_DAYS",
    galaDinner: true,
    locale: "ru",
  });
  eq(meta.flowType, TICKET_FLOW_TYPE, "flowType is the ticket discriminator");
  eq(meta.ticketId, "tk_123", "carries ticketId for the webhook");
  eq(meta.paymentId, "pay_123", "carries paymentId for the webhook");
  eq(meta.paymentPlan, "FULL", "carries the selected payment plan");
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

// ── Admin ticket edit validation and QR relevance ───────────────────────────
console.log("admin ticket updates");
{
  const base = {
    ticketId: "tk_123",
    updatedAt: "2026-07-13T12:00:00.000Z",
    fullName: "Jane Client",
    email: "Jane@Example.COM",
    phone: "+1 555 000 0000",
    instagram: "jane",
    type: "ONE_DAY" as const,
    galaDinner: false,
  };

  const parsed = adminTicketUpdateSchema.safeParse(base);
  assert(parsed.success, "valid admin edit payload parses");
  if (parsed.success) {
    eq(parsed.data.email, "jane@example.com", "admin edit normalizes email");
  }

  assert(
    !adminTicketUpdateSchema.safeParse({ ...base, email: "not-an-email" }).success,
    "admin edit rejects invalid email"
  );
  assert(
    !adminTicketUpdateSchema.safeParse({ ...base, fullName: "" }).success,
    "admin edit requires customer name"
  );
  assert(
    !adminTicketUpdateSchema.safeParse({ ...base, type: "VIP" }).success,
    "admin edit rejects unsupported ticket type"
  );

  const contactOnly = compareEditableTicketChanges(
    {
      fullName: "Jane Client",
      email: "jane@example.com",
      phone: "+1",
      instagram: null,
      type: "ONE_DAY",
      galaDinner: false,
    },
    {
      fullName: "Jane Corrected",
      email: "jane.corrected@example.com",
      phone: "+2",
      instagram: null,
      type: "ONE_DAY",
      galaDinner: false,
    }
  );
  eq(hasQrRelevantChanges(contactOnly), false, "contact-only edits do not require QR regeneration");

  const access = compareEditableTicketChanges(
    {
      fullName: "Jane Client",
      email: "jane@example.com",
      phone: "+1",
      instagram: null,
      type: "ONE_DAY",
      galaDinner: false,
    },
    {
      fullName: "Jane Client",
      email: "jane@example.com",
      phone: "+1",
      instagram: null,
      type: "TWO_DAYS",
      galaDinner: true,
    }
  );
  eq(hasQrRelevantChanges(access), true, "ticket type and gala edits require QR regeneration");
  eq(ticketCanReceiveQr("PAID"), true, "paid ticket can receive QR");
  eq(ticketCanReceiveQr("CHECKED_ONE_DAY"), true, "checked-in ticket can receive refreshed QR");
  eq(ticketCanReceiveQr("PENDING"), false, "pending ticket cannot receive QR");
  eq(ticketCanReceiveQr("CANCELED"), false, "canceled ticket cannot receive QR");
  eq(ticketCanBeDeleted("PENDING", "PENDING"), true, "pending unpaid ticket can be deleted");
  eq(ticketCanBeDeleted("PENDING", "FAILED"), true, "failed unpaid ticket can be deleted");
  eq(ticketCanBeDeleted("PAID", "PAID"), false, "paid ticket cannot be deleted");
  eq(
    ticketCanBeDeleted("PENDING", "PARTIALLY_PAID"),
    false,
    "partially paid ticket cannot be deleted"
  );
}

// ── Manual admin-issued tickets ─────────────────────────────────────────────
console.log("manual admin ticket issuance");
{
  const parsed = adminManualTicketSchema.safeParse({
    recipientSource: "EXISTING",
    recipientType: "APPLICANT",
    accountId: "account_anna",
    type: "TWO_DAYS",
    galaDinner: true,
  });
  assert(parsed.success, "valid manual ticket payload parses");
  if (parsed.success && parsed.data.recipientSource === "EXISTING") {
    eq(parsed.data.recipientType, "APPLICANT", "manual ticket keeps the recipient role");
    eq(parsed.data.accountId, "account_anna", "manual ticket keeps the selected account");
    assert(!("phone" in parsed.data), "manual ticket input does not accept a phone field");
  }
  assert(
    !adminManualTicketSchema.safeParse({
      recipientSource: "EXISTING",
      recipientType: "JURY",
      accountId: "",
      type: "ONE_DAY",
      galaDinner: false,
    }).success,
    "manual ticket requires a selected account"
  );
  const manualRecipient = adminManualTicketSchema.safeParse({
    recipientSource: "MANUAL",
    fullName: "  Анна Иванова  ",
    email: " Anna@Example.COM ",
    type: "ONE_DAY",
    galaDinner: false,
  });
  assert(manualRecipient.success, "manual ticket accepts a manually entered recipient");
  if (manualRecipient.success && manualRecipient.data.recipientSource === "MANUAL") {
    eq(manualRecipient.data.fullName, "Анна Иванова", "manual recipient name is trimmed");
    eq(manualRecipient.data.email, "anna@example.com", "manual recipient email is normalized");
  }
  assert(
    !adminManualTicketSchema.safeParse({
      recipientSource: "MANUAL",
      fullName: "",
      email: "not-an-email",
      type: "ONE_DAY",
      galaDinner: false,
    }).success,
    "manual recipient requires a name and valid email"
  );
  eq(ADMIN_GENERATED_VALUE, "ADMIN-GENERATED", "hidden required values use the admin marker");

  const email = ticketConfirmationTemplate({
    fullName: "Анна Иванова",
    type: "TWO_DAYS",
    galaDinner: true,
    paymentUrl: "https://example.com/tickets/token",
    manualIssue: true,
  });
  assert(email.subject.includes("Ваш билет подтверждён"), "manual ticket email subject is Russian");
  assert(email.html.includes("Билет оформлен без оплаты"), "manual ticket email states no payment is required");
  assert(!email.html.includes("Payment received"), "manual ticket email never claims payment was received");
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
