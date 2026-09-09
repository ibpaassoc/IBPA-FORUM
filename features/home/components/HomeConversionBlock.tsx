"use client";

import { useState } from "react";
import { Sparkles, Ticket, Users, Zap } from "lucide-react";

import { formatStripeAmount } from "@/features/pricing/types";
import { useStripePricing } from "@/features/pricing/useStripePricing";
import { ticketTranslations, type TicketTranslation } from "@/features/tickets/copy";
import { applyDiscountToPrice } from "@/features/tickets/types";
import type { TicketDiscount } from "@/features/tickets/types";
import { useTicketDiscount } from "@/features/tickets/useEarlyBird";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LandingSecondaryButton, Reveal } from "@/shared/components/public";
import TicketModal from "@/features/tickets/components/TicketModal";

export default function HomeRegistrationSection() {
  const { language, t } = useLanguage();
  const c = t.home.registrationSection;
  const ticketCopy = ticketTranslations[language];
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const { ticketDiscount, discount } = useTicketDiscount();
  const { pricing, loading: pricingLoading } = useStripePricing();
  const displayPrice = (amount: Parameters<typeof formatStripeAmount>[0]) =>
    pricingLoading ? "…" : formatStripeAmount(amount);

  const forumRows = [
    { label: c.pricing.forum.oneDay, member: displayPrice(pricing?.forumTickets.ibpaMembers.oneDay ?? null), standard: displayPrice(pricing?.forumTickets.standard.oneDay ?? null), discountable: true },
    { label: c.pricing.forum.twoDays, member: displayPrice(pricing?.forumTickets.ibpaMembers.twoDays ?? null), standard: displayPrice(pricing?.forumTickets.standard.twoDays ?? null), discountable: true },
    { label: c.pricing.forum.galaDinner, member: displayPrice(pricing?.forumTickets.galaDinner ?? null), standard: displayPrice(pricing?.forumTickets.galaDinner ?? null), discountable: false },
  ];

  return (
    <>
      <section id="pricing" className="landing-section-strong relative overflow-hidden py-12 md:py-16 lg:py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-1/3 size-[28rem] rounded-full bg-[#b9d9eb]/20 blur-3xl" />
          <div className="absolute -right-48 bottom-0 size-[32rem] rounded-full bg-[#72a0c1]/10 blur-3xl" />
        </div>

        <div className="page-section relative">
          <div className="mx-auto max-w-6xl lg:mt-10">
            <Reveal>
              <div className="mb-8 grid gap-5 md:grid-cols-[minmax(0,0.85fr)_minmax(18rem,0.7fr)] md:items-end md:gap-10">
                <div>
                  <p className="page-eyebrow text-[#72a0c1]">{c.pricing.forum.eyebrow}</p>
                  <h3 className="mt-4 max-w-[10ch] font-[var(--font-display)] text-[clamp(2.7rem,5.8vw,5.4rem)] leading-[0.86] tracking-[-0.065em] text-[#10182a]">
                    {c.pricing.forum.title}
                  </h3>
                </div>

                <p className="max-w-md text-sm leading-6 text-[#10182a]/58 md:justify-self-end md:text-base md:leading-7">
                  {c.pricing.description}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <article className="relative overflow-hidden rounded-[2.25rem] border border-[#b9d9eb]/60 bg-white/78 shadow-[0_28px_80px_rgba(20,49,71,0.1)] backdrop-blur-2xl md:rounded-[2.75rem]">
                <div aria-hidden className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                <div aria-hidden className="absolute -right-24 -top-32 size-80 rounded-full bg-[#b9d9eb]/20 blur-3xl" />

                <div className="relative grid gap-8 p-5 sm:p-7 md:p-9 lg:grid-cols-[minmax(14rem,0.72fr)_minmax(0,1.28fr)] lg:gap-12 lg:p-11">
                  <div className="flex flex-col items-start">
                    <span className="flex size-12 items-center justify-center rounded-2xl border border-[#b9d9eb]/70 bg-white/80 text-[#72a0c1] shadow-[0_12px_30px_rgba(114,160,193,0.12)]">
                      <Ticket size={21} strokeWidth={1.7} />
                    </span>

                    <p className="mt-7 text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-[#72a0c1]">{c.pricing.forum.eyebrow}</p>
                    <h4 className="mt-3 max-w-[9ch] font-[var(--font-display)] text-[clamp(2.4rem,4.4vw,4.2rem)] leading-[0.88] tracking-[-0.06em] text-[#10182a]">
                      {c.pricing.forum.title}
                    </h4>

                    {discount ? <div className="mt-6"><TicketDiscountBadge discount={discount} kind={ticketDiscount.kind} copy={ticketCopy.pricing} /></div> : null}

                    <div className="mt-7 flex items-start gap-3 rounded-[1.35rem] border border-[#d8edf7] bg-white/58 p-4 text-sm leading-6 text-[#10182a]/62">
                      <Users className="mt-0.5 size-4 shrink-0 text-[#72a0c1]" />
                      <p>{c.pricing.memberPricingNote}</p>
                    </div>

                    <LandingSecondaryButton type="button" onClick={() => setIsTicketModalOpen(true)} className="mt-7 w-full sm:w-auto">
                      {c.tickets.cta}
                    </LandingSecondaryButton>
                  </div>

                  <div className="flex min-w-0 flex-col justify-center">
                    <ComparisonTable rows={forumRows} optionLabel={c.pricing.option} memberLabel={c.pricing.members} standardLabel={c.pricing.standard} discount={discount} />
                    <p className="mt-4 flex items-center gap-2 text-xs leading-5 text-[#10182a]/48">
                      <Sparkles className="size-3.5 shrink-0 text-[#72a0c1]" />
                      {c.pricing.memberDiscountNote}
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <TicketModal isOpen={isTicketModalOpen} onClose={() => setIsTicketModalOpen(false)} />
    </>
  );
}

function TicketDiscountBadge({ discount, kind, copy }: { discount: NonNullable<TicketDiscount>; kind: "earlyBird" | "permanent30" | null; copy: TicketTranslation["pricing"] }) {
  const offLabel = discount.type === "percent" ? `${discount.value}% ${copy.off}` : `$${(discount.value / 100).toFixed(0)} ${copy.off}`;
  const discountName = kind === "permanent30" ? copy.permanent : copy.earlyBird;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#b9d9eb]/80 bg-white/85 px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#72a0c1] shadow-[0_10px_28px_rgba(114,160,193,0.14)] backdrop-blur-xl">
      <Zap size={12} strokeWidth={2} />
      {discountName} · {offLabel}
    </span>
  );
}

function ComparisonTable({ rows, optionLabel, memberLabel, standardLabel, discount = null }: { rows: { label: string; member: string; standard: string; discountable?: boolean }[]; optionLabel: string; memberLabel: string; standardLabel: string; discount?: TicketDiscount | null }) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[#cfe8f6] bg-white/64">
      <div className="grid grid-cols-[1.05fr_0.9fr_0.9fr] items-center gap-x-2 border-b border-[#cfe8f6] px-4 py-3 text-[0.5rem] font-semibold uppercase tracking-[0.11em] text-[#10182a]/38 sm:px-5">
        <span>{optionLabel}</span>
        <span className="text-center text-[#72a0c1]">{memberLabel}</span>
        <span className="text-right text-[#10182a]/52">{standardLabel}</span>
      </div>

      {rows.map((row) => (
        <div key={row.label} className="grid min-h-[78px] grid-cols-[1.05fr_0.9fr_0.9fr] items-center gap-x-2 border-b border-[#cfe8f6]/80 px-4 py-3 last:border-b-0 sm:px-5">
          <span className="text-xs font-medium leading-snug text-[#10182a]/64 sm:text-sm">{row.label}</span>
          <PriceCell price={row.member} discount={row.discountable ? discount : null} featured={row.discountable !== false} />
          <PriceCell price={row.standard} discount={row.discountable ? discount : null} />
        </div>
      ))}
    </div>
  );
}

function PriceCell({ price, discount, featured = false }: { price: string; discount?: TicketDiscount | null; featured?: boolean }) {
  const discounted = applyDiscountToPrice(price, discount ?? null);

  return (
    <span className="flex min-w-0 flex-col items-end leading-none">
      {discounted ? <span className="mb-1 text-[0.56rem] font-medium text-[#10182a]/38 line-through">{price}</span> : null}
      <span className={`whitespace-nowrap font-[var(--font-display)] text-[clamp(1.35rem,2.3vw,2rem)] tracking-[-0.05em] ${featured ? "text-[#72a0c1]" : "text-[#10182a]/80"}`}>
        {discounted ?? price}
      </span>
    </span>
  );
}
