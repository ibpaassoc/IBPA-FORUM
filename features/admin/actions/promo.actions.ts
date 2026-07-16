"use server";

import { revalidatePath } from "next/cache";
import { adminT } from "@/lib/i18n/admin";
import { normalizePromoKeyword } from "@/features/promos/lib/promo-codes";
import { requireAdmin } from "@/shared/lib/admin-auth";
import { prisma } from "@/shared/lib/prisma";

export type PromoActionState = {
  ok: boolean;
  message: string;
};

export async function updatePromoCodeAction(
  _state: PromoActionState,
  formData: FormData
): Promise<PromoActionState> {
  await requireAdmin();

  const key = normalizePromoKeyword(String(formData.get("key") ?? ""));
  const keyword = normalizePromoKeyword(String(formData.get("keyword") ?? ""));
  const enabled = String(formData.get("enabled") ?? "") === "on";

  if (!key || !keyword) {
    return { ok: false, message: adminT.discounts.keywordRequired };
  }

  const existing = await prisma.promoCode.findUnique({ where: { key } });
  if (!existing) {
    return { ok: false, message: adminT.discounts.notFound };
  }

  const duplicate = await prisma.promoCode.findFirst({
    where: {
      keyword,
      key: { not: key },
    },
    select: { key: true },
  });

  if (duplicate) {
    return { ok: false, message: adminT.discounts.keywordDuplicate };
  }

  await prisma.promoCode.update({
    where: { key },
    data: {
      keyword,
      enabled,
    },
  });

  revalidatePath("/admin/discounts");

  return { ok: true, message: adminT.discounts.saved };
}
