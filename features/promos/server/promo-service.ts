import "server-only";

import type { PromoPaymentFlow } from "@prisma/client";
import { EnvConfigError, readEnv } from "@/lib/env";
import { prisma } from "@/shared/lib/prisma";
import {
  evaluatePromoRecordForFlow,
  getPromoDefinition,
  normalizePromoKeyword,
  type AppliedPromo,
  type PromoValidationCode,
} from "@/features/promos/lib/promo-codes";

export class PromoCodeError extends Error {
  code: PromoValidationCode;

  constructor(code: PromoValidationCode, message: string) {
    super(message);
    this.name = "PromoCodeError";
    this.code = code;
  }
}

function promoError(code: PromoValidationCode): PromoCodeError {
  switch (code) {
    case "EMPTY":
      return new PromoCodeError(code, "Promo code is required.");
    case "DISABLED":
      return new PromoCodeError(code, "Promo code is disabled.");
    case "WRONG_FLOW":
      return new PromoCodeError(code, "Promo code cannot be used for this purchase.");
    case "ENV_MISSING":
      return new PromoCodeError(code, "Promo code is not configured for Stripe checkout.");
    case "INVALID":
    default:
      return new PromoCodeError("INVALID", "Invalid promo code.");
  }
}

async function findPromoByKeyword(keyword: string) {
  const normalized = normalizePromoKeyword(keyword);
  if (!normalized) return null;

  const promos = await prisma.promoCode.findMany({
    select: {
      key: true,
      keyword: true,
      paymentFlow: true,
      discountPercent: true,
      enabled: true,
    },
  });

  return promos.find((promo) => normalizePromoKeyword(promo.keyword) === normalized) ?? null;
}

export async function getPromoCodesForAdmin() {
  await ensureDefaultPromoCodes();
  return prisma.promoCode.findMany({
    orderBy: [{ paymentFlow: "asc" }, { key: "asc" }],
  });
}

export async function ensureDefaultPromoCodes() {
  for (const definition of Object.values({
    APPLICATION20: getPromoDefinition("APPLICATION20"),
    TICKETS30: getPromoDefinition("TICKETS30"),
  })) {
    if (!definition) continue;
    await prisma.promoCode.upsert({
      where: { key: definition.key },
      update: {
        paymentFlow: definition.paymentFlow,
        discountPercent: definition.discountPercent,
      },
      create: {
        key: definition.key,
        keyword: definition.defaultKeyword,
        paymentFlow: definition.paymentFlow,
        discountPercent: definition.discountPercent,
        enabled: true,
      },
    });
  }
}

export async function validatePromoCodeForFlow({
  keyword,
  paymentFlow,
  amountCents,
}: {
  keyword: string | null | undefined;
  paymentFlow: PromoPaymentFlow;
  amountCents: number;
}): Promise<AppliedPromo | null> {
  const normalized = normalizePromoKeyword(keyword);
  if (!normalized) return null;

  const promo = await findPromoByKeyword(normalized);
  if (!promo) throw promoError("INVALID");

  const definition = getPromoDefinition(promo.key);
  const result = evaluatePromoRecordForFlow({
    inputKeyword: normalized,
    promo: definition ? promo : null,
    paymentFlow,
    amountCents,
  });
  if (!result.ok) throw promoError(result.code);
  return result.promo;
}

export function getStripePromoDiscountId(key: string) {
  const definition = getPromoDefinition(key);
  if (!definition) throw promoError("INVALID");

  const value = readEnv([definition.envName]);
  if (!value) {
    throw new EnvConfigError(`${definition.envName} must be configured to use ${definition.key}.`);
  }
  return value;
}
