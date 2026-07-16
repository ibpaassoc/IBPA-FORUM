"use client";

import { useActionState, useState } from "react";
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
  const [enabled, setEnabled] = useState(promo.enabled);
  const t = adminT.discounts;

  return (
    <DashboardCard className="p-5">
      <form action={action} className="space-y-5">
        <input type="hidden" name="key" value={promo.key} />
        <input type="hidden" name="enabled" value={enabled ? "on" : ""} />

        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-[18px] ${enabled ? "bg-[rgba(114,160,193,0.1)] text-[var(--color-blue)]" : "bg-white/62 text-[var(--color-ink-muted)]"}`}>
              <BadgePercent aria-hidden size={18} strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-blue)]">
                {promo.key}
              </p>
              <p className="mt-0.5 text-sm font-medium text-[var(--color-ink)]">
                {enabled ? t.active : t.inactive}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEnabled((current) => !current)}
            disabled={pending}
            aria-label={enabled ? t.disable : t.enable}
            aria-pressed={enabled}
            className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50"
            style={{ backgroundColor: enabled ? "var(--color-blue)" : "rgba(37,42,45,0.16)" }}
          >
            <span
              className="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
              style={{ transform: enabled ? "translateX(20px)" : "translateX(2px)" }}
            />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[rgba(37,42,45,0.07)] pt-4">
          <h2 className="font-[var(--font-title-family)] text-[1.7rem] font-light leading-tight text-[var(--color-ink)]">
            {flowLabel(promo.paymentFlow)}
          </h2>
          <DashboardBadge tone={enabled ? "green" : "neutral"}>
            {enabled ? t.active : t.inactive}
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

        <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[rgba(114,160,193,0.18)] bg-white/62 px-4 py-3">
          <span>
            <span className="block text-[0.86rem] font-semibold text-[var(--color-ink)]">
              {enabled ? t.disable : t.enable}
            </span>
            <span className="mt-0.5 block text-[0.78rem] text-[var(--color-ink-soft)]">
              {enabled ? t.disableHint : t.enableHint}
            </span>
          </span>
        </div>

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
