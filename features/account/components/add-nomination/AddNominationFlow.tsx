"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  CreditCard,
  LayoutGrid,
  ListChecks,
  Loader2,
  Tags,
} from "lucide-react";
import StepBar from "@/features/applications/components/application-form/StepBar";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { computeApplicantNominationPrice } from "@/features/applications/lib/pricing";
import type { CategoryOption } from "@/features/applications/types/application.types";
import { EmptyState, SecondaryButton } from "@/shared/components/admin/DashboardUI";
import { PUBLIC_MOTION_EASE } from "@/shared/components/public/motion-tokens";
import CategorySelectionGrid from "./CategorySelectionGrid";
import NominationPurchaseSummary from "./NominationPurchaseSummary";
import NominationSelectionList from "./NominationSelectionList";

const STEP_CATEGORY = 0;
const STEP_NOMINATIONS = 1;
const STEP_REVIEW = 2;
const STEP_PAYMENT = 3;

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

/**
 * Controlled multi-step Add Nomination flow: pick a category, pick
 * nominations (across categories), review pricing, continue to Stripe.
 * Selection state survives moving backward between steps.
 */
export default function AddNominationFlow({
  categories,
  ownedAwardIds,
  isVerifiedMember,
}: {
  categories: CategoryOption[];
  ownedAwardIds: string[];
  isVerifiedMember: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  const { t } = useLanguage();
  const flow = t.account.addFlow;
  const steps = [
    { id: "category", label: flow.steps.category, icon: LayoutGrid },
    { id: "nominations", label: flow.steps.nominations, icon: ListChecks },
    { id: "review", label: flow.steps.review, icon: ClipboardCheck },
    { id: "payment", label: flow.steps.payment, icon: CreditCard },
  ];
  const owned = useMemo(() => new Set(ownedAwardIds), [ownedAwardIds]);
  const [step, setStep] = useState(STEP_CATEGORY);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [selectedAwardIds, setSelectedAwardIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promoPreview, setPromoPreview] = useState<PromoPreview | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoPending, setPromoPending] = useState(false);

  const activeCategory = categories.find((category) => category.id === activeCategoryId) ?? null;
  const count = selectedAwardIds.length;
  const pricing = computeApplicantNominationPrice({
    nominationCount: Math.max(1, count),
    isIbpaMember: isVerifiedMember,
  });
  const finalAmountCents = promoPreview?.finalAmountCents ?? pricing.amountCents;

  const maxUnlockedStep =
    count > 0 ? STEP_REVIEW : activeCategory ? STEP_NOMINATIONS : STEP_CATEGORY;

  function goTo(nextStep: number) {
    if (submitting) return;
    setStep(nextStep);
    setError("");
  }

  function selectCategory(categoryId: string) {
    setActiveCategoryId(categoryId);
    goTo(STEP_NOMINATIONS);
  }

  function toggleAward(awardId: string) {
    if (owned.has(awardId)) return;
    setSelectedAwardIds((current) =>
      current.includes(awardId)
        ? current.filter((id) => id !== awardId)
        : [...current, awardId],
    );
    setError("");
    setPromoPreview(null);
    setPromoError("");
  }

  function promoMessage(errorCode?: string) {
    if (errorCode === "DISABLED") return t.promo.promoCodeDisabled;
    if (errorCode === "WRONG_FLOW") return t.promo.wrongFlow;
    return t.promo.invalidPromoCode;
  }

  async function applyPromoCode() {
    const code = promoInput.trim();
    setPromoPreview(null);
    setPromoError("");
    if (!code || count === 0) {
      setPromoError(t.promo.invalidPromoCode);
      return;
    }
    setPromoPending(true);
    try {
      const response = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promoCode: code,
          paymentFlow: "APPLICATIONS",
          amountCents: pricing.amountCents,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        errorCode?: string;
        promo?: PromoPreview;
      };
      if (!response.ok || !payload.ok || !payload.promo) {
        setPromoError(promoMessage(payload.errorCode));
        return;
      }
      setPromoPreview(payload.promo);
    } catch {
      setPromoError(t.promo.invalidPromoCode);
    } finally {
      setPromoPending(false);
    }
  }

  async function checkout() {
    if (submitting || count === 0) return;
    if (promoInput.trim() && !promoPreview) {
      setPromoError(t.promo.invalidPromoCode);
      return;
    }
    setSubmitting(true);
    setError("");
    setStep(STEP_PAYMENT);
    try {
      const response = await fetch("/api/applicant/nominations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          awardIds: selectedAwardIds,
          promoCode: promoPreview ? promoInput : "",
        }),
      });
      const payload = (await response.json()) as {
        checkoutUrl?: string;
        message?: string;
      };
      if (!response.ok || !payload.checkoutUrl) {
        setError(payload.message ?? flow.checkoutError);
        setStep(STEP_REVIEW);
        return;
      }
      window.location.assign(payload.checkoutUrl);
    } catch {
      setError(flow.checkoutError);
      setStep(STEP_REVIEW);
    } finally {
      setSubmitting(false);
    }
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={<Tags size={20} />}
        title={flow.noCategoriesTitle}
        description={flow.noCategoriesText}
        action={<SecondaryButton href="/account/applicant">{flow.backToDashboard}</SecondaryButton>}
      />
    );
  }

  const stepMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
        transition: { duration: 0.28, ease: PUBLIC_MOTION_EASE },
      };

  return (
    <div className="flex flex-col gap-5">
      <StepBar
        steps={steps}
        current={step}
        maxUnlockedStep={Math.max(maxUnlockedStep, Math.min(step, STEP_REVIEW))}
        onStepChange={goTo}
      />

      <AnimatePresence mode="wait" initial={false}>
        {step === STEP_CATEGORY ? (
          <motion.div key="category" {...stepMotion}>
            <CategorySelectionGrid
              categories={categories}
              ownedAwardIds={owned}
              selectedAwardIds={selectedAwardIds}
              onSelectCategory={selectCategory}
            />
          </motion.div>
        ) : null}

        {step === STEP_NOMINATIONS && activeCategory ? (
          <motion.div key={`nominations-${activeCategory.id}`} {...stepMotion}>
            <div className="rounded-[28px] border border-[rgba(114,160,193,0.2)] bg-white/74 p-4 shadow-[0_22px_70px_rgba(37,42,45,0.07),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-2xl md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(114,160,193,0.16)] pb-4">
                <div className="min-w-0">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">
                    {flow.selectedCategory}
                  </p>
                  <h2 className="mt-1 font-[var(--font-title-family)] text-[1.5rem] font-light leading-tight text-[var(--color-ink)]">
                    {activeCategory.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => goTo(STEP_CATEGORY)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[rgba(114,160,193,0.24)] bg-white/78 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-soft)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.25)]"
                >
                  <ArrowLeft aria-hidden size={13} /> {flow.changeCategory}
                </button>
              </div>

              <div className="mt-5">
                <NominationSelectionList
                  category={activeCategory}
                  ownedAwardIds={owned}
                  selectedAwardIds={selectedAwardIds}
                  onToggleAward={toggleAward}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-[24px] border border-[rgba(114,160,193,0.2)] bg-white/78 p-4 shadow-[0_16px_48px_rgba(37,42,45,0.055)] backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--color-ink-soft)]" aria-live="polite">
                {count === 0 ? (
                  flow.noneSelected
                ) : (
                  <>
                    <span className="font-semibold text-[var(--color-ink)]">
                      {count} {count === 1 ? flow.nominationLabel : flow.nominationsLabel}
                    </span>{" "}
                    · {money(pricing.amountCents)} {flow.totalLabel}
                  </>
                )}
              </p>
              <button
                type="button"
                disabled={count === 0}
                onClick={() => goTo(STEP_REVIEW)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[rgba(255,255,255,0.35)] bg-[var(--color-blue)]/92 px-5 py-2.5 text-[0.72rem] font-semibold uppercase leading-none tracking-[0.12em] text-white shadow-[0_14px_34px_rgba(114,160,193,0.32)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-[#4d86ad] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {flow.reviewSelection} <ArrowRight aria-hidden size={14} />
              </button>
            </div>
          </motion.div>
        ) : null}

        {step === STEP_REVIEW ? (
          <motion.div key="review" {...stepMotion}>
            <NominationPurchaseSummary
              categories={categories}
              selectedAwardIds={selectedAwardIds}
              isVerifiedMember={isVerifiedMember}
              submitting={submitting}
              error={error}
              promoInput={promoInput}
              promoPreview={promoPreview}
              promoError={promoError}
              promoPending={promoPending}
              onPromoInputChange={(value) => {
                setPromoInput(value);
                setPromoPreview(null);
                setPromoError("");
              }}
              onApplyPromo={() => void applyPromoCode()}
              onRemoveAward={toggleAward}
              onCheckout={() => void checkout()}
            />
            <div className="mt-4">
              <button
                type="button"
                onClick={() => goTo(STEP_NOMINATIONS)}
                className="inline-flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.25)]"
              >
                <ArrowLeft aria-hidden size={13} /> {flow.backToNominations}
              </button>
            </div>
          </motion.div>
        ) : null}

        {step === STEP_PAYMENT ? (
          <motion.div key="payment" {...stepMotion}>
            <div className="relative overflow-hidden rounded-[30px] border border-[rgba(114,160,193,0.22)] bg-white/78 p-8 text-center shadow-[0_22px_70px_rgba(37,42,45,0.08),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-2xl">
              <div className="pointer-events-none absolute -left-20 -top-24 size-52 rounded-full bg-[rgba(185,217,235,0.35)] blur-3xl" />
              <div className="relative flex flex-col items-center gap-3">
                <Loader2 aria-hidden size={26} className="animate-spin text-[var(--color-blue)]" />
                <p className="font-[var(--font-title-family)] text-[1.4rem] font-light text-[var(--color-ink)]">
                  {flow.redirectTitle}
                </p>
                <p className="max-w-sm text-sm leading-relaxed text-[var(--color-ink-soft)]">
                  {flow.redirectText} {count}{" "}
                  {count === 1 ? flow.nominationLabel : flow.nominationsLabel} ·{" "}
                  {money(finalAmountCents)}
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
