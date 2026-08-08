"use server";

import { revalidatePath } from "next/cache";
import { adminT } from "@/lib/i18n/admin";
import { normalizePromoKeyword } from "@/features/promos/lib/promo-codes";
import { updatePromoCode } from "@/features/promos/server/promo-service";
import { requireAdmin } from "@/shared/lib/admin-auth";

export type PromoActionState = { ok: boolean; message: string };

export async function updatePromoCodeAction(
  _state: PromoActionState,
  formData: FormData
): Promise<PromoActionState> {
  await requireAdmin();
  const key = normalizePromoKeyword(String(formData.get("key") ?? ""));
  const keyword = normalizePromoKeyword(String(formData.get("keyword") ?? ""));
  const enabled = String(formData.get("enabled") ?? "") === "on";
  if (!key || !keyword) return { ok: false, message: adminT.discounts.keywordRequired };
  const result = await updatePromoCode(key, keyword, enabled);
  if (!result.ok) {
    return {
      ok: false,
      message: result.reason === "duplicate" ? adminT.discounts.keywordDuplicate : adminT.discounts.notFound,
    };
  }
  revalidatePath("/admin/discounts");
  return { ok: true, message: adminT.discounts.saved };
}
