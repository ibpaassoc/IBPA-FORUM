"use client";

import { useActionState } from "react";
import { BadgePercent, Save } from "lucide-react";
import type { PromoCode } from "@prisma/client";
import {
  DashboardBadge,
  DashboardCard,
  DashboardPageHeader,
  DashboardPrimaryBtn,
  dashboardInputClass,
} from "@/shared/components/admin/DashboardUI";
import { updatePromoCodeAction, type PromoActionState } from "@/features/admin/actions/promo.actions";
import { adminT } from "@/lib/i18n/admin";

const initialState: PromoActionState = { ok: false, message: "" };

function flowLabel(flow: PromoCode["paymentFlow"]) {
  return flow === "APPLICATIONS"
    ? adminT.discounts.flows.applications
    : adminT.discounts.flows.tickets;
}

function PromoCard({ promo }: { promo: PromoCode }) {
  const [state, action, pending] = useActionState(updatePromoCodeAction, initialState);
  const t = adminT.discounts;

  return (
    <DashboardCard className="p-5">
      <form action={action} className="space-y-5">
        <input type="hidden" name="key" value={promo.key} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-blue)]">
              <BadgePercent aria-hidden size={14} /> {promo.key}
            </p>
            <h2 className="mt-2 font-[var(--font-title-family)] text-[1.7rem] font-light leading-tight text-[var(--color-ink)]">
              {flowLabel(promo.paymentFlow)}
            </h2>
          </div>
          <DashboardBadge tone={promo.enabled ? "green" : "neutral"}>
            {promo.enabled ? t.active : t.inactive}
          </DashboardBadge>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-[var(--color-ink-soft)]">
              {t.keyword}
            </span>
            <input
              name="keyword"
              defaultValue={promo.keyword}
              className={dashboardInputClass}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
            />
          </label>

          <div className="rounded-[18px] border border-[rgba(114,160,193,0.18)] bg-white/62 px-4 py-3">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-[var(--color-ink-soft)]">
              {t.discount}
            </p>
            <p className="mt-1 font-[var(--font-title-family)] text-[2rem] font-light leading-none text-[var(--color-ink)]">
              {promo.discountPercent}%
            </p>
          </div>
        </div>

        <label className="flex items-center justify-between gap-4 rounded-[18px] border border-[rgba(114,160,193,0.18)] bg-white/62 px-4 py-3">
          <span>
            <span className="block text-[0.86rem] font-semibold text-[var(--color-ink)]">
              {promo.enabled ? t.disable : t.enable}
            </span>
            <span className="mt-0.5 block text-[0.78rem] text-[var(--color-ink-soft)]">
              {promo.enabled ? t.disableHint : t.enableHint}
            </span>
          </span>
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={promo.enabled}
            className="size-5 accent-[var(--color-blue)]"
          />
        </label>

        {state.message ? (
          <p className={`rounded-[16px] border px-4 py-3 text-sm ${
            state.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}>
            {state.message}
          </p>
        ) : null}

        <DashboardPrimaryBtn type="submit" disabled={pending}>
          <Save aria-hidden size={15} /> {pending ? adminT.common.loading : t.saveChanges}
        </DashboardPrimaryBtn>
      </form>
    </DashboardCard>
  );
}

export default function DiscountManagementPage({ promos }: { promos: PromoCode[] }) {
  const t = adminT.discounts;

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        label={t.label}
        title={t.title}
        description={t.description}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {promos.map((promo) => (
          <PromoCard key={promo.id} promo={promo} />
        ))}
      </div>
    </div>
  );
}
