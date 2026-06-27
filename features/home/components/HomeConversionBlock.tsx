"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import {
  Calendar,
  CreditCard,
  Globe2,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import { PRICING } from "@/data/pricing";
import { applyDiscountToPrice } from "@/features/tickets/types";
import type { EarlyBirdDiscount } from "@/features/tickets/types";
import { useEarlyBird } from "@/features/tickets/useEarlyBird";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  LandingSecondaryButton,
  Reveal,
  StaggerContainer,
} from "@/shared/components/public";
import TicketModal from "@/features/tickets/components/TicketModal";

export default function HomeRegistrationSection() {
  const { t } = useLanguage();
  const c = t.home.registrationSection;
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const { discount } = useEarlyBird();

  const topInfoCards = [
    {
      icon: Calendar,
      eyebrow: c.registrationInfo.eyebrow,
      value: c.registrationInfo.value,
    },
    {
      icon: Trophy,
      eyebrow: c.grandPrixInfo.eyebrow,
      value: c.grandPrixInfo.value,
      text: c.grandPrixInfo.text,
    },
  ];

  const bottomInfoCards = [
    {
      icon: CreditCard,
      eyebrow: c.feeInfo.eyebrow,
      value: c.feeInfo.value,
      text: c.feeInfo.text,
    },
    {
      icon: Users,
      eyebrow: c.juryInfo.eyebrow,
      value: c.juryInfo.value,
      text: c.juryInfo.text,
    },
    {
      icon: Globe2,
      eyebrow: c.participationInfo.eyebrow,
      value: c.participationInfo.value,
      text: c.participationInfo.text,
    },
  ];

  const forumRows = [
    {
      label: c.pricing.forum.oneDay,
      member: PRICING.forumTickets.ibpaMembers.oneDay,
      standard: PRICING.forumTickets.standard.oneDay,
      discountable: true,
    },
    {
      label: c.pricing.forum.twoDays,
      member: PRICING.forumTickets.ibpaMembers.twoDays,
      standard: PRICING.forumTickets.standard.twoDays,
      discountable: true,
    },
    {
      label: c.pricing.forum.galaDinner,
      member: PRICING.forumTickets.ibpaMembers.galaDinner,
      standard: PRICING.forumTickets.standard.galaDinner,
      discountable: false,
    },
  ];

  const awardRows = [
    {
      label: c.pricing.award.oneNomination,
      member: PRICING.awardParticipation.ibpaMembers.oneNomination,
      standard: PRICING.awardParticipation.nonMembers.oneNomination,
    },
    {
      label: c.pricing.award.threeNominations,
      member: PRICING.awardParticipation.ibpaMembers.threeNominations,
      standard: PRICING.awardParticipation.nonMembers.threeNominations,
    },
    {
      label: c.pricing.award.fiveNominations,
      member: PRICING.awardParticipation.ibpaMembers.fiveNominations,
      standard: PRICING.awardParticipation.nonMembers.fiveNominations,
    },
  ];

  const juryRows = [
    {
      label: c.pricing.jury.member,
      price: PRICING.judgeRegistration.ibpaMembers,
    },
    {
      label: c.pricing.jury.standard,
      price: PRICING.judgeRegistration.standard,
    },
  ];

  return (
    <>
      <section className="landing-section-strong relative overflow-hidden py-16 md:py-24">
        <div className="pointer-events-none absolute left-[-10%] top-0 h-80 w-80 rounded-full bg-[#b9d9eb]/18 blur-2xl" />

        <div className="page-section relative">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="page-eyebrow text-[#72a0c1]">{c.eyebrow}</p>

              <h2 className="mt-4 font-(--font-display) text-[clamp(2.5rem,5.7vw,5.7rem)] leading-[0.9] tracking-[-0.065em] text-[#10182a]">
                {c.title}
              </h2>
            </div>
          </Reveal>

          <div className="mx-auto mt-10 max-w-5xl">
            <StaggerContainer
              className="grid gap-3 md:grid-cols-2"
              stagger={0.08}
            >
              {topInfoCards.map((card) => (
                <InfoCard key={card.eyebrow} {...card} featured />
              ))}
            </StaggerContainer>

            <StaggerContainer
              className="mt-3 grid gap-3 md:grid-cols-3"
              stagger={0.06}
              delay={0.05}
            >
              {bottomInfoCards.map((card) => (
                <InfoCard key={card.eyebrow} {...card} />
              ))}
            </StaggerContainer>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <Reveal>
              <div className="mb-8 grid gap-4 md:grid-cols-[0.85fr_1fr] md:items-end">
                <div>
                  <p className="page-eyebrow text-[#72a0c1]">
                    {c.pricing.eyebrow}
                  </p>

                  <h3 className="mt-4 font-(--font-display) text-[clamp(2.25rem,4.6vw,4.7rem)] leading-[0.9] tracking-[-0.06em] text-[#10182a]">
                    {c.pricing.title}
                  </h3>
                </div>

                <p className="max-w-xl text-sm leading-6 text-[#10182a]/52 md:ml-auto">
                  {c.pricing.description}
                </p>
              </div>
            </Reveal>

            <StaggerContainer
              className="grid items-stretch gap-3 lg:grid-cols-3"
              stagger={0.08}
            >
              <PricingCard
                eyebrow={c.pricing.forum.eyebrow}
                title={c.pricing.forum.title}
                icon={<Sparkles size={16} />}
                badge={discount ? <EarlyBirdBadge discount={discount} /> : null}
                footer={
                  <LandingSecondaryButton
                    type="button"
                    onClick={() => setIsTicketModalOpen(true)}
                  >
                    {c.tickets.cta}
                  </LandingSecondaryButton>
                }
              >
                <ComparisonTable
                  rows={forumRows}
                  optionLabel={c.pricing.option}
                  memberLabel={c.pricing.members}
                  standardLabel={c.pricing.standard}
                  discount={discount}
                />
              </PricingCard>

              <PricingCard
                eyebrow={c.pricing.award.eyebrow}
                title={c.pricing.award.title}
                icon={<Trophy size={16} />}
                footer={
                  <LandingSecondaryButton href="/apply">
                    {c.awards.cta}
                  </LandingSecondaryButton>
                }
              >
                <ComparisonTable
                  rows={awardRows}
                  optionLabel={c.pricing.option}
                  memberLabel={c.pricing.members}
                  standardLabel={c.pricing.standard}
                />
              </PricingCard>

              <PricingCard
                eyebrow={c.pricing.jury.eyebrow}
                title={c.pricing.jury.title}
                icon={<Users size={16} />}
                footer={
                  <LandingSecondaryButton href="/jury">
                    {t.common.applyAsJury}
                  </LandingSecondaryButton>
                }
              >
                <div className="flex flex-1 flex-col justify-center gap-3">
                  {juryRows.map((row) => (
                    <PriceRow
                      key={row.label}
                      label={row.label}
                      price={row.price}
                    />
                  ))}
                </div>
              </PricingCard>
            </StaggerContainer>
          </div>
        </div>
      </section>

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />
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

      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#72a0c1]">
        {eyebrow}
      </p>

      <div className={featured ? "min-h-[6.4rem]" : "min-h-[6.6rem]"}>
        <h3
          className={[
            "mt-3 font-(--font-display) leading-[0.92] tracking-[-0.055em] text-[#10182a]",
            featured
              ? "max-w-[22rem] text-[clamp(2rem,3.6vw,3.4rem)]"
              : "max-w-[12rem] text-[clamp(1.75rem,2.55vw,2.45rem)]",
          ].join(" ")}
        >
          {value}
        </h3>
      </div>

      <p className="max-w-md text-xs leading-5 text-[#10182a]/52 md:text-sm">
        {text}
      </p>
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
    <article className="relative flex h-full min-h-[450px] flex-col overflow-hidden rounded-[1.9rem] border border-[#d8edf7] bg-white/72 p-5 shadow-[0_16px_46px_rgba(114,160,193,0.08)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:bg-white">
      <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#72a0c1]">
            {eyebrow}
          </p>

          <div className="mt-2 min-h-[5.35rem]">
            <h4 className="font-(--font-display) text-[2rem] leading-none tracking-[-0.055em] text-[#10182a]">
              {title}
            </h4>

            {badge ? <div className="mt-2">{badge}</div> : null}
          </div>
        </div>

        <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl border border-[#b9d9eb]/55 bg-white/80 text-[#72a0c1]">
          {icon}
        </div>
      </div>

      <div className="flex flex-1 flex-col">{children}</div>

      <div className="mt-6 flex min-h-11 items-end">{footer}</div>
    </article>
  );
}

function EarlyBirdBadge({ discount }: { discount: EarlyBirdDiscount }) {
  if (!discount) return null;

  const offLabel =
    discount.type === "percent"
      ? `${discount.value}% off`
      : `$${(discount.value / 100).toFixed(0)} off`;

  const shortLabel =
    discount.type === "percent"
      ? `${discount.value}%`
      : `$${(discount.value / 100).toFixed(0)}`;

  return (
    <span
      title={`Early Bird — ${offLabel}`}
      className="inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full border border-[#b9d9eb]/70 bg-white/80 px-2.5 py-1 text-[0.52rem] font-semibold uppercase tracking-[0.1em] text-[#5f91b4] shadow-[0_10px_28px_rgba(114,160,193,0.14)] backdrop-blur-xl"
    >
      <Zap size={10} strokeWidth={2} />
      Early Bird · {shortLabel}
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
  }[];
  optionLabel: string;
  memberLabel: string;
  standardLabel: string;
  discount?: EarlyBirdDiscount;
}) {
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-[#d8edf7] bg-white/62">
      <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr] border-b border-[#d8edf7] px-3 py-2.5 text-[0.56rem] font-semibold uppercase tracking-[0.16em] text-[#10182a]/38">
        <span>{optionLabel}</span>
        <span className="text-right">{memberLabel}</span>
        <span className="text-right">{standardLabel}</span>
      </div>

      {rows.map((row) => {
        const rowDiscount = row.discountable ? discount : null;

        return (
          <div
            key={row.label}
            className="grid grid-cols-[1.2fr_0.8fr_0.8fr] items-center border-b border-[#d8edf7]/70 px-3 py-3 last:border-b-0"
          >
            <span className="text-xs font-medium text-[#10182a]/62">
              {row.label}
            </span>

            <PriceCell price={row.member} discount={rowDiscount} />
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
}: {
  price: string;
  discount: EarlyBirdDiscount;
}) {
  const discounted = applyDiscountToPrice(price, discount);

  if (!discounted) {
    return (
      <span className="text-right font-(--font-display) text-xl tracking-[-0.04em] text-[#10182a]">
        {price}
      </span>
    );
  }

  return (
    <span className="flex flex-col items-end leading-none">
      <span className="text-[0.62rem] font-medium text-[#10182a]/38 line-through">
        {price}
      </span>

      <span className="font-(--font-display) text-xl tracking-[-0.04em] text-[#5f91b4]">
        {discounted}
      </span>
    </span>
  );
}

function PriceRow({ label, price }: { label: string; price: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-full border border-[#d8edf7] bg-white/62 px-3.5 py-2.5">
      <span className="text-xs font-medium text-[#10182a]/62">{label}</span>

      <span className="font-(--font-display) text-xl tracking-[-0.04em] text-[#10182a]">
        {price}
      </span>
    </div>
  );
}
