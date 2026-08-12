/**
 * Source-level application checkout contract checks. This test deliberately
 * never creates a real Stripe Checkout Session or sends email.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");
const route = read("app/api/applications/route.ts");
const purchase = read("features/applications/server/purchase-workflow.ts");
const webhook = read("features/applications/server/webhook.workflow.ts");
const applyPage = read("app/(public)/apply/page.tsx");
const access = read("lib/apply/access.ts");
const form = read("features/applications/components/application-form/PurchaseApplicationForm.tsx");
const closure = read("features/applications/server/closure.ts");

assert.match(route, /createPublicApplicantNominationCheckout/);
assert.match(applyPage, /isValidApplicationAccessToken/);
assert.match(applyPage, /notFound\(\)/);
assert.match(access, /APPLICATION_ACCESS_TOKEN/);
assert.match(access, /timingSafeEqual/);
assert.match(route, /isValidApplicationAccessToken/);
assert.match(route, /status: 403/);
assert.match(form, /formData\.set\("accessToken", accessToken\)/);
assert.match(purchase, /submissionOverrideOpen: true/);
assert.match(webhook, /submissionOverrideOpen:/);
assert.match(closure, /submissionOverrideOpen: \{ not: true \}/);
assert.match(route, /RAW_FILE_REJECTED/);
assert.match(purchase, /purchaseType: "NOMINATION"/);
assert.match(purchase, /provider: "STRIPE"/);
assert.match(purchase, /pricingSnapshot/);
assert.match(purchase, /promotionSnapshot/);
assert.match(webhook, /stripeWebhook\.create/);
assert.match(webhook, /eventId: event\.id/);
assert.match(webhook, /existingNomination/);
assert.match(webhook, /paymentId: payment\.id/);
assert.match(webhook, /fulfilledAt: paidAt/);
assert.doesNotMatch(read("scripts/forum-db-refactor.ts"), /send[A-Z][A-Za-z]+Email|stripe\.checkout/);

console.log("Application checkout and webhook contract checks passed without external side effects.");
