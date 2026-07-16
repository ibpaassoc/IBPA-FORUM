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

console.log("promo definitions");
eq(PROMO_DEFINITIONS.APPLICATION20.discountPercent, 20, "APPLICATION20 is fixed at 20%");
eq(PROMO_DEFINITIONS.TICKETS30.discountPercent, 30, "TICKETS30 is fixed at 30%");
eq(PROMO_DEFINITIONS.APPLICATION20.envName, "STRIPE_APPLICATION20_DISCOUNT_ID", "application env name");
eq(PROMO_DEFINITIONS.TICKETS30.envName, "STRIPE_TICKETS30_DISCOUNT_ID", "ticket env name");

console.log("normalization");
eq(normalizePromoKeyword(" application20 "), "APPLICATION20", "trims and uppercases application code");
eq(normalizePromoKeyword(" tickets30 "), "TICKETS30", "trims and uppercases ticket code");

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
    amountCents: 54500,
  });
  assert(result.ok, "valid TICKETS30 is accepted for tickets");
  if (result.ok) {
    eq(result.promo.discountPercent, 30, "TICKETS30 returns 30%");
    eq(result.promo.discountAmountCents, 16350, "TICKETS30 discounts the whole ticket total");
    eq(result.promo.finalAmountCents, 38150, "TICKETS30 final total is correct");
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
    inputKeyword: "TICKETS30",
    promo: ticketPromo,
    paymentFlow: "APPLICATIONS",
    amountCents: 10000,
  }),
  { ok: false, code: "WRONG_FLOW" },
  "ticket code cannot be used for applications"
);

console.log("calculation and protections");
eq(calculatePromoDiscount(9999, 20).discountAmountCents, 2000, "20% rounds to cents");
eq(calculatePromoDiscount(10000, 30).finalAmountCents, 7000, "30% final total is enforced");

const checkoutSessions = read("features/payments/server/checkout-sessions.ts");
assert(checkoutSessions.includes("discounts: [{ coupon: promoDiscountId }]"), "application Stripe discount is server-side only");
assert(checkoutSessions.includes("originalAmountCents"), "application line item uses original amount");

const ticketService = read("features/tickets/server/ticket-service.ts");
assert(ticketService.includes("earlyBirdDiscount = appliedPromo ? null"), "ticket promo prevents early-bird stacking");
assert(!ticketService.includes("frontendTotal"), "ticket checkout does not accept frontend totals");
assert(ticketService.includes("paymentAmountCents = appliedPromo?.finalAmountCents"), "ticket payment stores server-calculated final total");

const purchaseWorkflow = read("features/applications/server/purchase-workflow.ts");
assert(purchaseWorkflow.includes("resolveApplicationPromo"), "application promo validation is server-side");
assert(purchaseWorkflow.includes("finalAmountCents = appliedPromo?.finalAmountCents"), "application payment stores server-calculated final total");
assert(!purchaseWorkflow.includes("frontendTotal"), "application checkout does not accept frontend totals");

const promoService = read("features/promos/server/promo-service.ts");
assert(promoService.includes("EnvConfigError"), "missing Stripe discount env is reported as configuration error");
assert(promoService.includes("readEnv([definition.envName])"), "Stripe discount IDs are read only on the server");

const ticketForm = read("features/tickets/components/TicketForm.tsx");
assert(ticketForm.includes('paymentFlow: "TICKETS"'), "ticket UI validates ticket flow");

const applicationForm = read("features/applications/components/application-form/PurchaseApplicationForm.tsx");
assert(applicationForm.includes('paymentFlow: "APPLICATIONS"'), "public application UI validates application flow");

if (failed > 0) {
  console.error(`\n${failed} promo-code checks failed; ${passed} passed.`);
  process.exit(1);
}

console.log(`\nAll ${passed} promo-code checks passed.`);
