import type { PromoPaymentFlow } from "@prisma/client";

export const PROMO_DEFINITIONS = {
  APPLICATION20: {
    key: "APPLICATION20",
    defaultKeyword: "APPLICATION20",
    paymentFlow: "APPLICATIONS" as const,
    discountPercent: 20,
    envName: "STRIPE_APPLICATION20_DISCOUNT_ID",
  },
  TICKETS30: {
    key: "TICKETS30",
    defaultKeyword: "TICKETS30",
    paymentFlow: "TICKETS" as const,
    discountPercent: 30,
    envName: "STRIPE_TICKETS30_DISCOUNT_ID",
  },
  TICKETS40: {
    key: "TICKETS40",
    defaultKeyword: "TICKETS40",
    paymentFlow: "TICKETS" as const,
    discountPercent: 40,
    envName: "STRIPE_PERM_TICKETS40_DISCOUNT_ID",
  },
} as const;

export type PromoCodeKey = keyof typeof PROMO_DEFINITIONS;

export type PromoValidationCode =
  | "EMPTY"
  | "INVALID"
  | "DISABLED"
  | "WRONG_FLOW"
  | "ENV_MISSING";

export type AppliedPromo = {
  key: PromoCodeKey;
  keyword: string;
  paymentFlow: PromoPaymentFlow;
  discountPercent: number;
  originalAmountCents: number;
  discountAmountCents: number;
  finalAmountCents: number;
};

export type PromoRecordForValidation = {
  key: string;
  keyword: string;
  paymentFlow: PromoPaymentFlow;
  discountPercent: number;
  enabled: boolean;
};

export function normalizePromoKeyword(value: string | null | undefined) {
  return String(value ?? "").trim().toUpperCase();
}

export function calculatePromoDiscount(amountCents: number, discountPercent: number) {
  const safeAmount = Math.max(0, Math.round(amountCents));
  const safePercent = Math.max(0, Math.min(100, Math.round(discountPercent)));
  const discountAmountCents = Math.round((safeAmount * safePercent) / 100);

  return {
    originalAmountCents: safeAmount,
    discountAmountCents,
    finalAmountCents: Math.max(0, safeAmount - discountAmountCents),
  };
}

export function isPromoCodeKey(value: string): value is PromoCodeKey {
  return Object.prototype.hasOwnProperty.call(PROMO_DEFINITIONS, value);
}

export function getPromoDefinition(key: string) {
  if (!isPromoCodeKey(key)) return null;
  return PROMO_DEFINITIONS[key];
}

export function evaluatePromoRecordForFlow({
  inputKeyword,
  promo,
  paymentFlow,
  amountCents,
}: {
  inputKeyword: string | null | undefined;
  promo: PromoRecordForValidation | null;
  paymentFlow: PromoPaymentFlow;
  amountCents: number;
}):
  | { ok: true; promo: AppliedPromo }
  | { ok: false; code: PromoValidationCode } {
  const normalized = normalizePromoKeyword(inputKeyword);
  if (!normalized) return { ok: false, code: "EMPTY" };
  if (!promo || normalizePromoKeyword(promo.keyword) !== normalized) {
    return { ok: false, code: "INVALID" };
  }

  const definition = getPromoDefinition(promo.key);
  if (!definition) return { ok: false, code: "INVALID" };
  if (!promo.enabled) return { ok: false, code: "DISABLED" };
  if (promo.paymentFlow !== paymentFlow || definition.paymentFlow !== paymentFlow) {
    return { ok: false, code: "WRONG_FLOW" };
  }

  return {
    ok: true,
    promo: {
      key: definition.key,
      keyword: promo.keyword,
      paymentFlow: promo.paymentFlow,
      discountPercent: definition.discountPercent,
      ...calculatePromoDiscount(amountCents, definition.discountPercent),
    },
  };
}
