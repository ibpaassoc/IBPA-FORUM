"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import {
  Calendar,
  CreditCard,
  Crown,
  Globe2,
  Gift,
  Info,
  Sparkles,
  Tag,
  Trophy,
  UserRound,
  Users,
  Zap,
} from "lucide-react";

import { formatStripeAmount } from "@/features/pricing/types";
import { useStripePricing } from "@/features/pricing/useStripePricing";
import { ticketTranslations, type TicketTranslation } from "@/features/tickets/copy";
import { applyDiscountToPrice } from "@/features/tickets/types";
import type { TicketDiscount } from "@/features/tickets/types";
import { useTicketDiscount } from "@/features/tickets/useEarlyBird";
import { useSpecialPacket } from "@/features/tickets/useSpecialPacket";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  LandingSecondaryButton,
  Reveal,
  StaggerContainer,
} from "@/shared/components/public";
import TicketModal from "@/features/tickets/components/TicketModal";

export default function HomeRegistrationSection() {
  const { language, t } = useLanguage();
  const c = t.home.registrationSection;
  const ticketCopy = ticketTranslations[language];
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const { ticketDiscount, discount } = useTicketDiscount();
  const specialPacket = useSpecialPacket();
  const { pricing, loading: pricingLoading } = useStripePricing();
  const displayPrice = (amount: Parameters<typeof formatStripeAmount>[0]) =>
    pricingLoading ? "…" : formatStripeAmount(amount, language);

  const topInfoCards = [
    { icon: Calendar, eyebrow: c.registrationInfo.eyebrow, value: c.registrationInfo.value },
    { icon: Trophy, eyebrow: c.grandPrixInfo.eyebrow, value: c.grandPrixInfo.value, text: c.grandPrixInfo.text },
  ];

  const bottomInfoCards = [
    { icon: CreditCard, eyebrow: c.feeInfo.eyebrow, value: c.feeInfo.value, text: c.feeInfo.text },
    { icon: Users, eyebrow: c.juryInfo.eyebrow, value: c.juryInfo.value, text: c.juryInfo.text },
    { icon: Globe2, eyebrow: c.participationInfo.eyebrow, value: c.participationInfo.value, text: c.participationInfo.text },
  ];

  const forumRows = [
    { label: c.pricing.forum.oneDay, member: displayPrice(pricing?.forumTickets.ibpaMembers.oneDay ?? null), standard: displayPrice(pricing?.forumTickets.standard.oneDay ?? null), discountable: true },
    { label: c.pricing.forum.twoDays, member: displayPrice(pricing?.forumTickets.ibpaMembers.twoDays ?? null), standard: displayPrice(pricing?.forumTickets.standard.twoDays ?? null), discountable: true },
    { label: c.pricing.forum.galaDinner, member: displayPrice(pricing?.forumTickets.galaDinner ?? null), standard: displayPrice(pricing?.forumTickets.galaDinner ?? null), discountable: false },
  ];

  const awardRows = [
    { label: c.pricing.award.oneNomination, member: displayPrice(pricing?.awardParticipation.ibpaMembers.oneNomination ?? null), standard: displayPrice(pricing?.awardParticipation.nonMembers.oneNomination ?? null) },
    { label: c.pricing.award.threeNominations, member: displayPrice(pricing?.awardParticipation.ibpaMembers.threeNominations ?? null), standard: displayPrice(pricing?.awardParticipation.nonMembers.threeNominations ?? null) },
    { label: c.pricing.award.fiveNominations, member: displayPrice(pricing?.awardParticipation.ibpaMembers.fiveNominations ?? null), standard: displayPrice(pricing?.awardParticipation.nonMembers.fiveNominations ?? null), badge: c.pricing.mostPopular },
  ];

  const juryRows = [
    { label: c.pricing.jury.member, price: displayPrice(pricing?.judgeRegistration.ibpaMembers ?? null), icon: Crown, featured: true },
    { label: c.pricing.jury.standard, price: displayPrice(pricing?.judgeRegistration.standard ?? null), icon: UserRound, featured: false },
  ];

  return (
    <>
      <section id="pricing" className="landing-section-strong relative overflow-hidden py-12 md:py-16 lg:py-20">
        <div className="pointer-events-none absolute left-[-10%] top-0 h-80 w-80 rounded-full bg-[#b9d9eb]/18 blur-2xl" />

        <div className="page-section relative">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="page-eyebrow text-[#72a0c1]">{c.eyebrow}</p>

              <h2 className="mt-4 font-[var(--font-display)] text-[clamp(2.5rem,5.7vw,5.7rem)] leading-[0.9] tracking-[-0.065em] text-[#10182a]">
                {c.title}
              </h2>
            </div>
          </Reveal>

          <div className="mx-auto mt-10 max-w-5xl">
            <StaggerContainer className="grid gap-3 md:grid-cols-2" stagger={0.08}>
              {topInfoCards.map((card) => (
                <InfoCard key={card.eyebrow} {...card} featured />
              ))}
            </StaggerContainer>

            <StaggerContainer className="mt-3 grid gap-3 md:grid-cols-3" stagger={0.06} delay={0.05}>
              {bottomInfoCards.map((card) => (
                <InfoCard key={card.eyebrow} {...card} />
              ))}
            </StaggerContainer>
          </div>

          <div className="mx-auto mt-12 max-w-7xl lg:mt-14">
            <Reveal>
              <div className="mb-7 grid gap-6 md:grid-cols-[0.85fr_1fr] md:items-end">
                <div>
                  <p className="page-eyebrow text-[#72a0c1]">{c.pricing.eyebrow}</p>

                  <h3 className="mt-4 font-[var(--font-display)] text-[clamp(2.25rem,4.6vw,4.7rem)] leading-[0.9] tracking-[-0.06em] text-[#10182a]">
                    {c.pricing.title}
                  </h3>
                </div>

                <p className="max-w-2xl text-sm leading-6 text-[#10182a]/52 md:ml-auto">
                  {c.pricing.description}
                </p>
              </div>
            </Reveal>

            <StaggerContainer className="grid items-stretch gap-4 lg:grid-cols-3" stagger={0.08}>
              <PricingCard
                eyebrow={c.pricing.forum.eyebrow}
                title={c.pricing.forum.title}
                icon={<Sparkles size={16} />}
                badge={discount ? <TicketDiscountBadge discount={discount} kind={ticketDiscount.kind} copy={ticketCopy.pricing} /> : null}
                footer={
                  <LandingSecondaryButton type="button" onClick={() => setIsTicketModalOpen(true)}>
                    {c.tickets.cta}
                  </LandingSecondaryButton>
                }
              >
                <ComparisonTable rows={forumRows} optionLabel={c.pricing.option} memberLabel={c.pricing.members} standardLabel={c.pricing.standard} discount={discount} />

                <PricingNote icon={<Users size={16} />}>{c.pricing.memberPricingNote}</PricingNote>
              </PricingCard>

              <PricingCard
                eyebrow={c.pricing.award.eyebrow}
                title={c.pricing.award.title}
                icon={<Trophy size={16} />}
                footer={<LandingSecondaryButton href="/apply">{c.awards.cta}</LandingSecondaryButton>}
              >
                <ComparisonTable rows={awardRows} optionLabel={c.pricing.option} memberLabel={c.pricing.members} standardLabel={c.pricing.standard} />

                <PricingNote icon={<Tag size={16} />}>{c.pricing.awardPricingNote}</PricingNote>
              </PricingCard>

              <PricingCard
                eyebrow={c.pricing.jury.eyebrow}
                title={c.pricing.jury.title}
                icon={<Users size={16} />}
                footer={<LandingSecondaryButton href="/jury">{t.common.applyAsJury}</LandingSecondaryButton>}
              >
                <div className="flex flex-1 flex-col">
                  <div className="space-y-3">
                    {juryRows.map((row) => (
                      <JuryPriceRow key={row.label} {...row} />
                    ))}
                  </div>

                  <PricingNote icon={<Info size={16} />}>{c.pricing.memberDiscountNote}</PricingNote>
                </div>
              </PricingCard>
            </StaggerContainer>

            <Reveal delay={0.12}>
              <SpecialPacketCard
                enabled={specialPacket.enabled && Boolean(pricing?.forumTickets.specialPacket.ibpaMembers && pricing?.forumTickets.specialPacket.standard)}
                memberPrice={displayPrice(pricing?.forumTickets.specialPacket.ibpaMembers ?? null)}
                standardPrice={displayPrice(pricing?.forumTickets.specialPacket.standard ?? null)}
                onBuy={() => setIsTicketModalOpen(true)}
                copy={ticketCopy.pricing}
              />
            </Reveal>
          </div>
        </div>
      </section>

      <TicketModal isOpen={isTicketModalOpen} onClose={() => setIsTicketModalOpen(false)} />
    </>
  );
}

function InfoCard({
  icon: Icon,
  eyebrow,
  value,
  text,
  featured = false,
}: {
  icon: typeof Calendar;
  eyebrow: string;
  value: string;
  text?: string;
  featured?: boolean;
}) {
  return (
    <article
      className={[
        "relative flex flex-col overflow-hidden rounded-[1.8rem] border border-[#d8edf7] bg-white/72 p-5 shadow-[0_16px_46px_rgba(114,160,193,0.08)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-[#b9d9eb] hover:bg-white",
        featured ? "min-h-[220px] md:p-6" : "min-h-[210px]",
      ].join(" ")}
    >
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

      <div className="mb-5 flex size-9 items-center justify-center rounded-2xl border border-[#b9d9eb]/55 bg-white/80 text-[#72a0c1]">
        <Icon size={15} />
      </div>

      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#72a0c1]">{eyebrow}</p>

      <div className={featured ? "min-h-[6.4rem]" : "min-h-[6.6rem]"}>
        <h3
          className={[
            "mt-3 font-[var(--font-display)] leading-[0.92] tracking-[-0.055em] text-[#10182a]",
            featured
              ? "max-w-[22rem] text-[clamp(2rem,3.6vw,3.4rem)]"
              : "max-w-[12rem] text-[clamp(1.75rem,2.55vw,2.45rem)]",
          ].join(" ")}
        >
          {value}
        </h3>
      </div>

      <p className="max-w-md text-xs leading-5 text-[#10182a]/52 md:text-sm">{text}</p>
    </article>
  );
}

function PricingCard({
  eyebrow,
  title,
  icon,
  children,
  footer,
  badge = null,
}: {
  eyebrow: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#cfe8f6] bg-white/72 p-5 shadow-[0_22px_60px_rgba(114,160,193,0.1)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-[#b9d9eb] hover:bg-white md:p-6 lg:min-h-[540px]">
      <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

      <div className="mb-5 flex min-h-[118px] items-start justify-between gap-4 lg:mb-6 lg:min-h-[130px]">
        <div className="min-w-0">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#72a0c1]">{eyebrow}</p>

          <h4 className="mt-3 font-[var(--font-display)] text-[clamp(2.05rem,3vw,2.4rem)] leading-[0.96] tracking-[-0.06em] text-[#10182a]">
            {title}
          </h4>

          {badge ? <div className="mt-3">{badge}</div> : null}
        </div>

        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-[#b9d9eb]/75 bg-white/80 text-[#72a0c1]">
          {icon}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4">{children}</div>

      <div className="mt-6 flex min-h-11 items-end justify-center">{footer}</div>
    </article>
  );
}

function SpecialPacketCard({
  enabled,
  memberPrice,
  standardPrice,
  onBuy,
  copy,
}: {
  enabled: boolean;
  memberPrice: string;
  standardPrice: string;
  onBuy: () => void;
  copy: TicketTranslation["pricing"];
}) {
  return (
    <article
      className={[
        "relative mt-4 overflow-hidden rounded-[2rem] border p-5 shadow-[0_20px_55px_rgba(114,160,193,0.09)] backdrop-blur-xl md:p-6",
        enabled
          ? "border-[#b9d9eb] bg-[linear-gradient(135deg,rgba(239,248,253,0.92),rgba(255,255,255,0.78))]"
          : "border-[#d7dee4] bg-[#f2f4f5]/88 text-[#10182a]/55",
      ].join(" ")}
    >
      <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center lg:gap-8">
        <div className="flex min-w-0 items-start gap-4">
          <span
            className={[
              "flex size-11 shrink-0 items-center justify-center rounded-2xl border bg-white/80",
              enabled ? "border-[#b9d9eb] text-[#72a0c1]" : "border-[#cfd5da] text-[#10182a]/35",
            ].join(" ")}
          >
            <Gift size={19} />
          </span>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#72a0c1]">{copy.specialEyebrow}</p>
              <span
                className={[
                  "rounded-full px-2.5 py-1 text-[0.5rem] font-semibold uppercase tracking-[0.1em]",
                  enabled ? "bg-[#72a0c1] text-white" : "bg-[#d3d7da] text-[#10182a]/55",
                ].join(" ")}
              >
                {enabled ? copy.new : copy.comingSoon}
              </span>
            </div>

            <h4 className="mt-2 font-[var(--font-title-family)] text-[clamp(1.9rem,3vw,2.7rem)] font-light leading-none tracking-[-0.05em] text-[#10182a]">
              {copy.specialTitle}
            </h4>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#10182a]/58">
              {copy.specialDescription}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:min-w-[300px]">
          <SpecialPacketPrice label={copy.members} price={memberPrice} featured enabled={enabled} />
          <SpecialPacketPrice label={copy.guests} price={standardPrice} enabled={enabled} />
        </div>

        <LandingSecondaryButton type="button" onClick={onBuy} disabled={!enabled} className="w-full lg:w-auto">
          {enabled ? copy.buySpecial : copy.comingSoon}
        </LandingSecondaryButton>
      </div>
    </article>
  );
}

function SpecialPacketPrice({
  label,
  price,
  featured = false,
  enabled,
}: {
  label: string;
  price: string;
  featured?: boolean;
  enabled: boolean;
}) {
  return (
    <div className={[
      "rounded-[1.25rem] border bg-white/62 px-3 py-3",
      enabled ? "border-[#cfe8f6]" : "border-[#d7dde1] grayscale",
    ].join(" ")}>
      <p className="text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-[#10182a]/42">{label}</p>
      <p className={[
        "mt-1 font-[var(--font-title-family)] text-[1.65rem] font-light leading-none tracking-[-0.045em]",
        enabled && featured ? "text-[#72a0c1]" : "text-[#10182a]/65",
      ].join(" ")}>
        {price}
      </p>
    </div>
  );
}

function TicketDiscountBadge({
  discount,
  kind,
  copy,
}: {
  discount: TicketDiscount;
  kind: "earlyBird" | "permanent30" | null;
  copy: TicketTranslation["pricing"];
}) {
  if (!discount) return null;

  const offLabel = discount.type === "percent" ? `${discount.value}% ${copy.off}` : `$${(discount.value / 100).toFixed(0)} ${copy.off}`;
  const shortLabel = discount.type === "percent" ? `${discount.value}%` : `$${(discount.value / 100).toFixed(0)}`;
  const discountName = kind === "permanent30" ? copy.permanent : copy.earlyBird;

  return (
    <span
      title={`${discountName} — ${offLabel}`}
      className="inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full border border-[#b9d9eb]/80 bg-white/85 px-3 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#72a0c1] shadow-[0_10px_28px_rgba(114,160,193,0.14)] backdrop-blur-xl"
    >
      <Zap size={11} strokeWidth={2} />
      {discountName} · {shortLabel}
    </span>
  );
}

function ComparisonTable({
  rows,
  optionLabel,
  memberLabel,
  standardLabel,
  discount = null,
}: {
  rows: {
    label: string;
    member: string;
    standard: string;
    discountable?: boolean;
    badge?: string;
  }[];
  optionLabel: string;
  memberLabel: string;
  standardLabel: string;
  discount?: TicketDiscount | null;
}) {
  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-[#cfe8f6] bg-white/64">
      <div className="grid grid-cols-[1.05fr_0.9fr_0.9fr] items-center gap-x-2 border-b border-[#cfe8f6] px-3 py-2.5 text-[0.48rem] font-semibold uppercase tracking-[0.1em] text-[#10182a]/38">
        <span>{optionLabel}</span>
        <span className="text-center text-[#72a0c1]">{memberLabel}</span>
        <span className="text-right text-[#10182a]/52">{standardLabel}</span>
      </div>

      {rows.map((row) => {
        const rowDiscount = row.discountable ? discount : null;

        return (
          <div
            key={row.label}
            className="grid min-h-[62px] grid-cols-[1.05fr_0.9fr_0.9fr] items-center gap-x-2 border-b border-[#cfe8f6]/80 px-3 py-2.5 last:border-b-0"
          >
            <span className="flex min-w-0 flex-col gap-1 text-xs font-medium leading-snug text-[#10182a]/62">
              <span className="break-words">{row.label}</span>

              {row.badge ? (
                <span className="w-fit rounded-full bg-[#72a0c1] px-2 py-1 text-[0.46rem] font-semibold uppercase leading-none tracking-[0.05em] text-white">
                  {row.badge}
                </span>
              ) : null}
            </span>

            <PriceCell price={row.member} discount={rowDiscount} featured={row.discountable !== false} />
            <PriceCell price={row.standard} discount={rowDiscount} />
          </div>
        );
      })}
    </div>
  );
}

function PriceCell({
  price,
  discount,
  featured = false,
}: {
  price: string;
  discount?: TicketDiscount | null;
  featured?: boolean;
}) {
  const discounted = applyDiscountToPrice(price, discount ?? null);

  if (!discounted) {
    return (
      <span 
        className={[
          "whitespace-nowrap text-right font-[var(--font-display)] text-[clamp(1.22rem,1.75vw,1.5rem)] tracking-[-0.045em]",
          featured ? "text-[#72a0c1]" : "text-[#10182a]/80",
        ].join(" ")}
      >
        {price}
      </span>
    );
  }

  return (
    <span className="flex min-w-0 flex-col items-end leading-none">
      <span className="text-[0.54rem] font-medium text-[#10182a]/38 line-through">{price}</span>

      <span
        className={[
          "whitespace-nowrap font-[var(--font-display)] text-[clamp(1.22rem,1.75vw,1.5rem)] tracking-[-0.045em]",
          featured ? "text-[#72a0c1]" : "text-[#10182a]/80",
        ].join(" ")}
      >
        {discounted}
      </span>
    </span>
  );
}

function JuryPriceRow({
  label,
  price,
  icon: Icon,
  featured,
}: {
  label: string;
  price: string;
  icon: typeof Crown;
  featured: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center justify-between gap-4 rounded-[1.35rem] border px-4 py-3.5",
        featured
          ? "border-[#b9d9eb] bg-[#edf7fc]/80 shadow-[0_14px_34px_rgba(114,160,193,0.1)]"
          : "border-[#d8edf7] bg-white/62",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={[
            "flex size-9 shrink-0 items-center justify-center rounded-full border",
            featured ? "border-[#72a0c1] bg-[#72a0c1] text-white" : "border-[#b9d9eb] bg-white text-[#10182a]/70",
          ].join(" ")}
        >
          <Icon size={16} />
        </div>

        <p className={["truncate text-sm font-semibold", featured ? "text-[#72a0c1]" : "text-[#10182a]/70"].join(" ")}>
          {label}
        </p>
      </div>

      <span className={["shrink-0 font-[var(--font-display)] text-[1.75rem] leading-none tracking-[-0.045em]", featured ? "text-[#72a0c1]" : "text-[#10182a]/80"].join(" ")}>
        {price}
      </span>
    </div>
  );
}

function PricingNote({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="mt-auto flex min-h-[78px] items-center gap-3 rounded-[1.25rem] border border-[#d8edf7] bg-white/62 px-4 py-3 text-sm leading-5 text-[#10182a]/62">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#72a0c1]">{icon}</div>

      <p>{children}</p>
    </div>
  );
}
