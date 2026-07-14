"use client";

import { useMemo, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { computeApplicantNominationPrice } from "@/features/applications/lib/pricing";
import type { CategoryOption } from "@/features/applications/types/application.types";

function money(amount: number) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export default function AddNominationsForm({
  categories,
  ownedAwardIds,
  isVerifiedMember,
}: {
  categories: CategoryOption[];
  ownedAwardIds: string[];
  isVerifiedMember: boolean;
}) {
  const owned = useMemo(() => new Set(ownedAwardIds), [ownedAwardIds]);
  const [selectedAwardIds, setSelectedAwardIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const pricing = computeApplicantNominationPrice({
    nominationCount: Math.max(1, selectedAwardIds.length),
    isIbpaMember: isVerifiedMember,
  });

  function toggle(awardId: string) {
    if (owned.has(awardId)) return;
    setSelectedAwardIds((current) =>
      current.includes(awardId)
        ? current.filter((id) => id !== awardId)
        : [...current, awardId]
    );
    setError("");
  }

  async function checkout() {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/applicant/nominations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ awardIds: selectedAwardIds }),
      });
      const payload = (await response.json()) as {
        checkoutUrl?: string;
        message?: string;
      };
      if (!response.ok || !payload.checkoutUrl) {
        setError(payload.message ?? "Could not create checkout.");
        return;
      }
      window.location.assign(payload.checkoutUrl);
    } catch {
      setError("Could not create checkout.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="flex flex-col gap-4">
        {categories.map((category) => (
          <div key={category.id} className="rounded-[26px] border border-[var(--border-default)] bg-white/78 p-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-blue)]">
              {category.name}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {category.awards.map((award) => {
                const alreadyOwned = owned.has(award.id);
                const selected = selectedAwardIds.includes(award.id);
                return (
                  <button
                    key={award.id}
                    type="button"
                    disabled={alreadyOwned}
                    onClick={() => toggle(award.id)}
                    className={`flex min-h-12 items-center justify-between gap-3 rounded-[18px] border px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-55 ${
                      selected
                        ? "border-[var(--color-blue)] bg-[var(--color-blue-wash)] text-[var(--color-ink)]"
                        : "border-[rgba(37,42,45,0.08)] bg-white text-[var(--color-ink-soft)] hover:border-[var(--color-blue)]/40"
                    }`}
                  >
                    <span>
                      {award.name}
                      {alreadyOwned ? (
                        <span className="mt-1 block text-xs text-[var(--color-blue)]">
                          You already have this nomination.
                        </span>
                      ) : null}
                    </span>
                    {selected ? <Check size={16} className="shrink-0 text-[var(--color-blue)]" /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[26px] border border-[var(--border-default)] bg-white/86 p-5 shadow-[0_20px_50px_rgba(114,160,193,0.12)]">
          <div className="flex items-center gap-2 text-[var(--color-blue)]">
            <ShoppingCart size={18} />
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em]">Order summary</p>
          </div>
          <p className="mt-4 text-sm text-[var(--color-ink-soft)]">
            Selected for this checkout: {selectedAwardIds.length}
          </p>
          <p className="mt-3 font-[var(--font-title-family)] text-4xl font-light text-[var(--color-ink)]">
            {selectedAwardIds.length ? money(pricing.amountCents) : "$0"}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
            {isVerifiedMember ? "Member rate" : "Standard rate"}
          </p>
          {error ? (
            <p className="mt-4 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            disabled={submitting || selectedAwardIds.length === 0}
            onClick={() => void checkout()}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating checkout..." : "Continue to checkout"}
          </button>
        </div>
      </aside>
    </div>
  );
}
