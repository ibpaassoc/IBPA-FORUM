"use client";

import { ArrowRight, BadgeCheck, Loader2, ShoppingCart, X } from "lucide-react";
import { computeApplicantNominationPrice } from "@/features/applications/lib/pricing";
import type { CategoryOption } from "@/features/applications/types/application.types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type PromoPreview = {
  keyword: string;
  discountPercent: number;
  originalAmountCents: number;
  discountAmountCents: number;
  finalAmountCents: number;
};

function money(amountCents: number) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

type SelectedGroup = {
  category: CategoryOption;
  awards: CategoryOption["awards"];
};

function groupSelection(categories: CategoryOption[], selectedAwardIds: string[]): SelectedGroup[] {
  const selected = new Set(selectedAwardIds);
  return categories
    .map((category) => ({
      category,
      awards: category.awards.filter((award) => selected.has(award.id)),
    }))
    .filter((group) => group.awards.length > 0);
}

/**
 * Step 3 of the Add Nomination flow: review the selection with pricing from
 * the same helper the checkout backend uses, then continue to Stripe.
 */
export default function NominationPurchaseSummary({
  categories,
  selectedAwardIds,
  isVerifiedMember,
  submitting,
  error,
  promoInput,
  promoPreview,
  promoError,
  promoPending,
  onPromoInputChange,
  onApplyPromo,
  onRemoveAward,
  onCheckout,
}: {
  categories: CategoryOption[];
  selectedAwardIds: string[];
  isVerifiedMember: boolean;
  submitting: boolean;
  error: string;
  promoInput: string;
  promoPreview: PromoPreview | null;
  promoError: string;
  promoPending: boolean;
  onPromoInputChange: (value: string) => void;
  onApplyPromo: () => void;
  onRemoveAward: (awardId: string) => void;
  onCheckout: () => void;
}) {
  const { t } = useLanguage();
  const flow = t.account.addFlow;
  const groups = groupSelection(categories, selectedAwardIds);
  const count = selectedAwardIds.length;
  // Same pricing source of truth as createAccountApplicantNominationCheckout.
  const pricing = computeApplicantNominationPrice({
    nominationCount: Math.max(1, count),
    isIbpaMember: isVerifiedMember,
  });
  const finalAmountCents = promoPreview?.finalAmountCents ?? pricing.amountCents;

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="flex min-w-0 flex-col gap-3.5">
        {groups.length === 0 ? (
          <p className="rounded-[24px] border border-dashed border-[rgba(114,160,193,0.3)] bg-white/62 px-5 py-8 text-center text-sm leading-relaxed text-[var(--color-ink-soft)] backdrop-blur-xl">
            {flow.emptySelection}
          </p>
        ) : null}
        {groups.map(({ category, awards }) => (
          <div
            key={category.id}
            className="rounded-[24px] border border-[rgba(114,160,193,0.2)] bg-white/74 p-4 shadow-[0_16px_48px_rgba(37,42,45,0.055),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-2xl"
          >
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-blue)]">
              {category.name}
            </p>
            <ul className="mt-2.5 grid gap-2">
              {awards.map((award) => (
                <li
                  key={award.id}
                  className="flex items-center justify-between gap-3 rounded-[18px] border border-[rgba(114,160,193,0.16)] bg-white/78 px-3.5 py-2.5 text-sm text-[var(--color-ink)]"
                >
                  <span className="min-w-0 break-words leading-snug">{award.name}</span>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => onRemoveAward(award.id)}
                    aria-label={`${flow.removeAward} ${award.name}`}
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--color-ink-soft)] transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.25)] disabled:opacity-50"
                  >
                    <X aria-hidden size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <aside className="relative overflow-hidden rounded-[28px] border border-[rgba(114,160,193,0.24)] bg-white/80 p-5 shadow-[0_22px_70px_rgba(37,42,45,0.09),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl lg:sticky lg:top-6">
        <div className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-[rgba(185,217,235,0.4)] blur-3xl" />

        <div className="relative">
          <p className="flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">
            <ShoppingCart aria-hidden size={14} /> {flow.orderSummary}
          </p>

          <dl className="mt-4 space-y-2.5 text-[0.84rem]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[var(--color-ink-soft)]">{flow.nominationsRow}</dt>
              <dd className="font-semibold text-[var(--color-ink)]">{count}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[var(--color-ink-soft)]">{flow.rateRow}</dt>
              <dd className="font-semibold text-[var(--color-ink)]">
                {isVerifiedMember ? flow.memberRate : flow.standardRate}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[var(--color-ink-soft)]">{flow.packageRow}</dt>
              <dd className="font-semibold text-[var(--color-ink)]">
                {count > 0 ? pricing.unitLabel : "—"}
              </dd>
            </div>
          </dl>

          <div className="mt-4 border-t border-[rgba(114,160,193,0.18)] pt-4">
            <label className="block">
              <span className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
                {t.promo.promoCode}
              </span>
              <span className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(event) => onPromoInputChange(event.target.value)}
                  className="h-11 min-w-0 flex-1 rounded-[18px] border border-[rgba(114,160,193,0.22)] bg-white/74 px-4 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-blue)] focus:ring-4 focus:ring-[rgba(114,160,193,0.16)]"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  disabled={promoPending || !promoInput.trim() || count === 0}
                  onClick={onApplyPromo}
                  className="inline-flex min-h-11 items-center justify-center rounded-[18px] border border-[rgba(114,160,193,0.24)] bg-white/78 px-4 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-blue)] transition hover:bg-[var(--color-blue-wash)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {promoPending ? t.promo.applying : t.promo.apply}
                </button>
              </span>
            </label>
            {promoPreview ? (
              <p className="mt-2 text-[0.74rem] text-emerald-700">
                {t.promo.promoCodeApplied}
              </p>
            ) : promoError ? (
              <p className="mt-2 text-[0.74rem] text-red-700">{promoError}</p>
            ) : null}
          </div>

          <div className="mt-4 border-t border-[rgba(114,160,193,0.18)] pt-4">
            {promoPreview ? (
              <dl className="mb-3 space-y-2 text-[0.82rem]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--color-ink-soft)]">{t.promo.originalPrice}</dt>
                  <dd className="font-semibold text-[var(--color-ink)]">
                    {money(promoPreview.originalAmountCents)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 text-emerald-700">
                  <dt>{t.promo.discount} {promoPreview.discountPercent}%</dt>
                  <dd className="font-semibold">-{money(promoPreview.discountAmountCents)}</dd>
                </div>
              </dl>
            ) : null}
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
              {promoPreview ? t.promo.finalTotal : flow.totalDue}
            </p>
            <p className="mt-1 font-[var(--font-title-family)] text-[2.6rem] font-light leading-none tracking-[-0.03em] text-[var(--color-ink)]">
              {count > 0 ? money(finalAmountCents) : "$0"}
            </p>
            {isVerifiedMember ? (
              <p className="mt-2 flex items-center gap-1.5 text-[0.74rem] text-emerald-700">
                <BadgeCheck aria-hidden size={13} /> {flow.memberApplied}
              </p>
            ) : null}
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          ) : null}

          <button
            type="button"
            disabled={submitting || count === 0}
            onClick={onCheckout}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[rgba(255,255,255,0.35)] bg-[var(--color-blue)]/92 px-5 py-3 text-[0.72rem] font-semibold uppercase leading-none tracking-[0.12em] text-white shadow-[0_16px_38px_rgba(114,160,193,0.34)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-[#4d86ad] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 aria-hidden size={15} className="animate-spin" /> {flow.creatingCheckout}
              </>
            ) : (
              <>
                {flow.continuePayment} <ArrowRight aria-hidden size={15} />
              </>
            )}
          </button>
          <p className="mt-3 text-center text-[0.72rem] leading-relaxed text-[var(--color-ink-muted)]">
            {flow.stripeNote}
          </p>
        </div>
      </aside>
    </div>
  );
}
