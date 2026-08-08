import "server-only";

import crypto from "crypto";
import { EnvConfigError, readEnv } from "@/lib/env";
import { promoCodesSettingSchema } from "@/features/database/json-fields";
import {
  evaluatePromoRecordForFlow,
  getPromoDefinition,
  normalizePromoKeyword,
  PROMO_DEFINITIONS,
  type AppliedPromo,
  type PromoPaymentFlow,
  type PromoValidationCode,
} from "@/features/promos/lib/promo-codes";
import { prisma } from "@/shared/lib/prisma";

export class PromoCodeError extends Error {
  constructor(public code: PromoValidationCode, message: string) {
    super(message);
    this.name = "PromoCodeError";
  }
}

export class PromoCodeSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromoCodeSetupError";
  }
}

function promoError(code: PromoValidationCode): PromoCodeError {
  const messages: Record<PromoValidationCode, string> = {
    EMPTY: "Promo code is required.",
    DISABLED: "Promo code is disabled.",
    WRONG_FLOW: "Promo code cannot be used for this purchase.",
    ENV_MISSING: "Promo code is not configured for Stripe checkout.",
    INVALID: "Invalid promo code.",
  };
  return new PromoCodeError(code, messages[code]);
}

async function readPromoCodes() {
  const setting = await prisma.siteSetting.findUnique({ where: { key: "promocodes" } });
  if (!setting) return null;
  const parsed = promoCodesSettingSchema.safeParse(setting.value);
  if (!parsed.success) throw new PromoCodeSetupError("The promocodes SiteSetting has an invalid JSON shape.");
  return parsed.data;
}

export async function ensureDefaultPromoCodes() {
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('forum:site-setting:promocodes'))`;
    const setting = await tx.siteSetting.findUnique({ where: { key: "promocodes" } });
    const parsed = setting ? promoCodesSettingSchema.safeParse(setting.value) : null;
    if (parsed && !parsed.success) {
      throw new PromoCodeSetupError("The promocodes SiteSetting has an invalid JSON shape.");
    }
    const now = new Date().toISOString();
    const codes = parsed?.success ? [...parsed.data.codes] : [];
    for (const definition of Object.values(PROMO_DEFINITIONS)) {
      const existing = codes.find((code) => code.key === definition.key);
      if (existing) {
        existing.paymentFlow = definition.paymentFlow;
        existing.discountPercent = definition.discountPercent;
        existing.updatedAt = now;
      } else {
        codes.push({
          id: crypto.randomUUID(),
          key: definition.key,
          keyword: definition.defaultKeyword,
          paymentFlow: definition.paymentFlow,
          discountPercent: definition.discountPercent,
          enabled: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
    await tx.siteSetting.upsert({
      where: { key: "promocodes" },
      create: { key: "promocodes", value: { schemaVersion: 1, updatedAt: now, codes } },
      update: { value: { schemaVersion: 1, updatedAt: now, codes } },
    });
  });
}

export async function getPromoCodesForAdmin() {
  await ensureDefaultPromoCodes();
  const setting = await readPromoCodes();
  return (setting?.codes ?? [])
    .slice()
    .sort((a, b) => a.paymentFlow.localeCompare(b.paymentFlow) || a.key.localeCompare(b.key))
    .map((code) => ({
      ...code,
      createdAt: new Date(code.createdAt),
      updatedAt: new Date(code.updatedAt),
    }));
}

export async function updatePromoCode(key: string, keyword: string, enabled: boolean) {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('forum:site-setting:promocodes'))`;
    const setting = await tx.siteSetting.findUnique({ where: { key: "promocodes" } });
    const parsed = setting ? promoCodesSettingSchema.safeParse(setting.value) : null;
    if (!parsed?.success) return { ok: false as const, reason: "not_found" as const };
    if (parsed.data.codes.some((code) => code.keyword === keyword && code.key !== key)) {
      return { ok: false as const, reason: "duplicate" as const };
    }
    const now = new Date().toISOString();
    let found = false;
    const codes = parsed.data.codes.map((code) => {
      if (code.key !== key) return code;
      found = true;
      return { ...code, keyword, enabled, updatedAt: now };
    });
    if (!found) return { ok: false as const, reason: "not_found" as const };
    await tx.siteSetting.update({
      where: { key: "promocodes" },
      data: { value: { schemaVersion: 1, updatedAt: now, codes } },
    });
    return { ok: true as const };
  });
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
  const setting = await readPromoCodes();
  const promo = setting?.codes.find((code) => normalizePromoKeyword(code.keyword) === normalized) ?? null;
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
  if (!value) throw new EnvConfigError(`${definition.envName} must be configured to use ${definition.key}.`);
  return value;
}
