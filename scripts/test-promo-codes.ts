/**
 * Framework-free checks for ticket/application promo-code behavior.
 *
 *   npm run test:promo-codes
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  calculatePromoDiscount,
  evaluatePromoRecordForFlow,
  normalizePromoKeyword,
  PROMO_DEFINITIONS,
  type PromoRecordForValidation,
} from "@/features/promos/lib/promo-codes";
import {
  computeTicketAmountCents,
  GALA_DINNER_CENTS,
} from "@/features/tickets/lib/pricing";

const ROOT = process.cwd();
let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed += 1;
    console.log(`  PASS ${label}`);
  } else {
    failed += 1;
    console.error(`  FAIL ${label}`);
  }
}

function eq<T>(actual: T, expected: T, label: string) {
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${label} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`
  );
}

function read(rel: string) {
  return readFileSync(join(ROOT, rel), "utf8");
}

const applicationPromo: PromoRecordForValidation = {
  key: "APPLICATION20",
  keyword: "APPLICATION20",
  paymentFlow: "APPLICATIONS",
  discountPercent: 20,
  enabled: true,
};

const ticketPromo: PromoRecordForValidation = {
  key: "TICKETS30",
  keyword: "TICKETS30",
  paymentFlow: "TICKETS",
  discountPercent: 30,
  enabled: true,
};

const ticket40Promo: PromoRecordForValidation = {
  key: "TICKETS40",
  keyword: "TICKETS40",
  paymentFlow: "TICKETS",
  discountPercent: 40,
  enabled: true,
};

console.log("promo definitions");
eq(PROMO_DEFINITIONS.APPLICATION20.discountPercent, 20, "APPLICATION20 is fixed at 20%");
eq(PROMO_DEFINITIONS.TICKETS30.discountPercent, 30, "TICKETS30 is fixed at 30%");
eq(PROMO_DEFINITIONS.TICKETS40.discountPercent, 40, "TICKETS40 is fixed at 40%");
eq(PROMO_DEFINITIONS.APPLICATION20.envName, "STRIPE_APPLICATION20_DISCOUNT_ID", "application env name");
eq(PROMO_DEFINITIONS.TICKETS30.envName, "STRIPE_TICKETS30_DISCOUNT_ID", "ticket env name");
eq(PROMO_DEFINITIONS.TICKETS40.envName, "STRIPE_PERM_TICKETS40_DISCOUNT_ID", "40% ticket env name");

console.log("normalization");
eq(normalizePromoKeyword(" application20 "), "APPLICATION20", "trims and uppercases application code");
eq(normalizePromoKeyword(" tickets30 "), "TICKETS30", "trims and uppercases ticket code");
eq(normalizePromoKeyword(" tickets40 "), "TICKETS40", "trims and uppercases 40% ticket code");

console.log("validation");
{
  const result = evaluatePromoRecordForFlow({
    inputKeyword: " application20 ",
    promo: applicationPromo,
    paymentFlow: "APPLICATIONS",
    amountCents: 10000,
  });
  assert(result.ok, "valid APPLICATION20 is accepted for applications");
  if (result.ok) {
    eq(result.promo.discountPercent, 20, "APPLICATION20 returns 20%");
    eq(result.promo.discountAmountCents, 2000, "APPLICATION20 discounts $100 by $20");
    eq(result.promo.finalAmountCents, 8000, "APPLICATION20 final total is $80");
  }
}
{
  const result = evaluatePromoRecordForFlow({
    inputKeyword: "tickets30",
    promo: ticketPromo,
    paymentFlow: "TICKETS",
    amountCents: 39500,
  });
  assert(result.ok, "valid TICKETS30 is accepted for tickets");
  if (result.ok) {
    eq(result.promo.discountPercent, 30, "TICKETS30 returns 30%");
    eq(result.promo.discountAmountCents, 11850, "TICKETS30 discounts the ticket price only");
    eq(result.promo.finalAmountCents, 27650, "TICKETS30 discounted ticket subtotal is correct");
  }
}
{
  const result = evaluatePromoRecordForFlow({
    inputKeyword: "tickets40",
    promo: ticket40Promo,
    paymentFlow: "TICKETS",
    amountCents: 39500,
  });
  assert(result.ok, "valid TICKETS40 is accepted for tickets");
  if (result.ok) {
    eq(result.promo.discountPercent, 40, "TICKETS40 returns 40%");
    eq(result.promo.discountAmountCents, 15800, "TICKETS40 discounts the ticket price only");
    eq(result.promo.finalAmountCents, 23700, "TICKETS40 discounted ticket subtotal is correct");
  }
}
eq(
  evaluatePromoRecordForFlow({
    inputKeyword: "NOPE",
    promo: null,
    paymentFlow: "APPLICATIONS",
    amountCents: 10000,
  }),
  { ok: false, code: "INVALID" },
  "invalid code is rejected"
);
eq(
  evaluatePromoRecordForFlow({
    inputKeyword: "APPLICATION20",
    promo: { ...applicationPromo, enabled: false },
    paymentFlow: "APPLICATIONS",
    amountCents: 10000,
  }),
  { ok: false, code: "DISABLED" },
  "disabled code is rejected"
);
eq(
  evaluatePromoRecordForFlow({
    inputKeyword: "APPLICATION20",
    promo: applicationPromo,
    paymentFlow: "TICKETS",
    amountCents: 10000,
  }),
  { ok: false, code: "WRONG_FLOW" },
  "application code cannot be used for tickets"
);
eq(
  evaluatePromoRecordForFlow({
    inputKeyword: "TICKETS40",
    promo: ticket40Promo,
    paymentFlow: "APPLICATIONS",
    amountCents: 10000,
  }),
  { ok: false, code: "WRONG_FLOW" },
  "40% ticket code cannot be used for applications"
);

console.log("calculation and protections");
eq(calculatePromoDiscount(9999, 20).discountAmountCents, 2000, "20% rounds to cents");
eq(calculatePromoDiscount(10000, 30).finalAmountCents, 7000, "30% final total is enforced");
eq(calculatePromoDiscount(10000, 40).finalAmountCents, 6000, "40% final total is enforced");

console.log("ticket promo state and price matrix");
const ticketScenarios = [
  { label: "one-day", type: "ONE_DAY" as const, galaDinner: false },
  { label: "one-day with Gala Dinner", type: "ONE_DAY" as const, galaDinner: true },
  { label: "two-day", type: "TWO_DAYS" as const, galaDinner: false },
  { label: "two-day with Gala Dinner", type: "TWO_DAYS" as const, galaDinner: true },
];

for (const scenario of ticketScenarios) {
  const amounts = computeTicketAmountCents({
    type: scenario.type,
    isIbpaMember: false,
    galaDinner: scenario.galaDinner,
    ticketDiscount: null,
  });
  const expectedDiscount = Math.round(amounts.ticketCents * 0.3);
  const expectedTicketSubtotal = amounts.ticketCents - expectedDiscount;
  const expectedTotal = expectedTicketSubtotal + amounts.galaCents;
  const expected40Discount = Math.round(amounts.ticketCents * 0.4);
  const expected40TicketSubtotal = amounts.ticketCents - expected40Discount;
  const expected40Total = expected40TicketSubtotal + amounts.galaCents;

  const enabled = evaluatePromoRecordForFlow({
    inputKeyword: "TICKETS30",
    promo: ticketPromo,
    paymentFlow: "TICKETS",
    amountCents: amounts.ticketCents,
  });
  assert(enabled.ok, `${scenario.label}: enabled code is accepted`);
  if (enabled.ok) {
    eq(enabled.promo.originalAmountCents, amounts.ticketCents, `${scenario.label}: original ticket price`);
    eq(enabled.promo.discountAmountCents, expectedDiscount, `${scenario.label}: ticket-only discount`);
    eq(enabled.promo.finalAmountCents, expectedTicketSubtotal, `${scenario.label}: discounted ticket subtotal`);
    eq(enabled.promo.finalAmountCents + amounts.galaCents, expectedTotal, `${scenario.label}: final total`);
  }

  const enabled40 = evaluatePromoRecordForFlow({
    inputKeyword: "TICKETS40",
    promo: ticket40Promo,
    paymentFlow: "TICKETS",
    amountCents: amounts.ticketCents,
  });
  assert(enabled40.ok, `${scenario.label}: 40% code is accepted`);
  if (enabled40.ok) {
    eq(enabled40.promo.originalAmountCents, amounts.ticketCents, `${scenario.label}: 40% original ticket price`);
    eq(enabled40.promo.discountAmountCents, expected40Discount, `${scenario.label}: 40% ticket-only discount`);
    eq(enabled40.promo.finalAmountCents, expected40TicketSubtotal, `${scenario.label}: 40% discounted ticket subtotal`);
    eq(enabled40.promo.finalAmountCents + amounts.galaCents, expected40Total, `${scenario.label}: 40% final total`);
  }

  eq(
    evaluatePromoRecordForFlow({
      inputKeyword: "TICKETS30",
      promo: { ...ticketPromo, enabled: false },
      paymentFlow: "TICKETS",
      amountCents: amounts.ticketCents,
    }),
    { ok: false, code: "DISABLED" },
    `${scenario.label}: disabled code is rejected`
  );
  eq(
    evaluatePromoRecordForFlow({
      inputKeyword: "NOT-A-PROMO",
      promo: null,
      paymentFlow: "TICKETS",
      amountCents: amounts.ticketCents,
    }),
    { ok: false, code: "INVALID" },
    `${scenario.label}: invalid code is rejected`
  );

  const reEnabled = evaluatePromoRecordForFlow({
    inputKeyword: "TICKETS30",
    promo: { ...ticketPromo, enabled: true },
    paymentFlow: "TICKETS",
    amountCents: amounts.ticketCents,
  });
  assert(reEnabled.ok, `${scenario.label}: re-enabled code is accepted again`);
  if (reEnabled.ok) {
    eq(reEnabled.promo.finalAmountCents + amounts.galaCents, expectedTotal, `${scenario.label}: re-enabled total`);
  }

  eq(
    amounts.galaCents,
    scenario.galaDinner ? GALA_DINNER_CENTS : 0,
    `${scenario.label}: Gala Dinner remains undiscounted`
  );
}

const checkoutSessions = read("features/payments/server/checkout-sessions.ts");
assert(checkoutSessions.includes("unit_amount: finalAmountCents"), "application Stripe line item uses the server-calculated discounted total");
assert(!checkoutSessions.includes("discounts: [{ coupon:"), "application checkout does not depend on Stripe coupon product eligibility");

const ticketService = read("features/tickets/server/ticket-service.ts");
assert(ticketService.includes("getActiveTicketDiscount"), "ticket checkout resolves the active automatic discount server-side");
assert(!ticketService.includes("frontendTotal"), "ticket checkout does not accept frontend totals");
assert(ticketService.includes("amountCents: promoBaseAmounts.ticketCents"), "ticket promo validates the server-calculated eligible forum pass only");
assert(ticketService.includes("appliedPromo.finalAmountCents + amounts.galaCents"), "ticket payment adds full Gala price after stacked discounts");
assert(ticketService.includes("ticketAmountCents"), "ticket checkout uses the final server-calculated ticket amount");
assert(ticketService.includes("session.amountTotalCents !== paymentAmountCents"), "server rejects a Stripe total that differs from the modal quote");

const purchaseWorkflow = read("features/applications/server/purchase-workflow.ts");
assert(purchaseWorkflow.includes("resolveApplicationPromo"), "application promo validation is server-side");
assert(purchaseWorkflow.includes("finalAmountCents = appliedPromo?.finalAmountCents"), "application payment stores server-calculated final total");
assert(!purchaseWorkflow.includes("frontendTotal"), "application checkout does not accept frontend totals");

const promoService = read("features/promos/server/promo-service.ts");
assert(promoService.includes("EnvConfigError"), "missing Stripe discount env is reported as configuration error");
assert(promoService.includes("readEnv([definition.envName])"), "Stripe discount IDs are read only on the server");
assert(promoService.includes("prisma.promoCode.findUnique"), "every validation reads current promo state from the database");

const ticketForm = read("features/tickets/components/TicketForm.tsx");
assert(ticketForm.includes('paymentFlow: "TICKETS"'), "ticket UI validates ticket flow");
assert(ticketForm.includes('cache: "no-store"'), "ticket UI bypasses cached promo validation");
assert(ticketForm.includes("PROMO_REVALIDATION_INTERVAL_MS"), "applied ticket promos are revalidated while the modal stays open");

const promoValidationRoute = read("app/api/promo-codes/validate/route.ts");
assert(promoValidationRoute.includes("computeTicketAmountCents"), "ticket preview uses canonical server pricing");
assert(promoValidationRoute.includes("ticketAmounts.ticketCents"), "ticket preview excludes Gala from promo eligibility");

const applicationForm = read("features/applications/components/application-form/PurchaseApplicationForm.tsx");
assert(applicationForm.includes('paymentFlow: "APPLICATIONS"'), "public application UI validates application flow");

if (failed > 0) {
  console.error(`\n${failed} promo-code checks failed; ${passed} passed.`);
  process.exit(1);
}

console.log(`\nAll ${passed} promo-code checks passed.`);
