"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Crown,
  Scale,
  Sparkles,
  Ticket,
  Trophy,
} from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";
import TicketModal from "@/features/tickets/components/TicketModal";
import { ButtonLayers } from "@/shared/components/public";

type Tab = "tickets" | "awards" | "jury";

const tabs = [
  { id: "tickets", icon: Ticket },
  { id: "awards", icon: Trophy },
  { id: "jury", icon: Scale },
] as const;

const slideVariants = {
  enter: { opacity: 0, y: 14, filter: "blur(8px)" },
  center: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -14, filter: "blur(8px)" },
};

export default function HomeConversionBlock() {
  const { t } = useLanguage();
  const c = t.home.registrationSection;

  const [activeTab, setActiveTab] = useState<Tab>("tickets");
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-32">
      <div
        aria-hidden
        className="absolute left-1/2 top-0 h-[560px] w-[min(1180px,100%)] -translate-x-1/2 rounded-full bg-[#b9d9eb]/24 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute bottom-[-220px] right-[-160px] h-[520px] w-[520px] rounded-full bg-[#72a0c1]/10 blur-3xl"
      />

      <div className="page-section relative z-10">
        <Reveal>
          <div className="mx-auto max-w-4xl text-center">
            <p className="page-eyebrow">{c.eyebrow}</p>

            <h2 className="mt-4 font-(--font-display) text-[clamp(2.8rem,6vw,6rem)] leading-[0.92] tracking-[-0.06em] text-[#111827]">
              {c.title}
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mx-auto mt-10 max-w-5xl">
            <div className="relative overflow-hidden rounded-[34px] border border-white/75 bg-white/58 p-6 shadow-[0_24px_80px_rgba(114,160,193,0.12)] backdrop-blur-2xl sm:p-8">
              <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.68)_52%,rgba(185,217,235,0.26)_100%)]" />
              <div className="absolute right-[-70px] top-[-90px] h-56 w-56 rounded-full bg-[#b9d9eb]/35 blur-3xl" />

              <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <CalendarDays size={18} className="text-[#7a98af]" />
                    <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7a98af]">
                      {c.registration.title}
                    </span>
                  </div>

                  <h3 className="mt-3 font-(--font-display) text-[clamp(2rem,4vw,3.4rem)] leading-none text-[#111827]">
                    {c.registration.date}
                  </h3>

                  <p className="mt-3 max-w-2xl text-[#5f6f7c]">
                    {c.registration.description}
                  </p>
                </div>

                <div className="w-fit rounded-full border border-[#b9d9eb]/60 bg-white/72 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#7a98af] shadow-[0_12px_32px_rgba(114,160,193,0.1)] backdrop-blur-xl">
                  IBPA 2026
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Slider */}
        <Reveal delay={0.1}>
          <div className="mt-10 flex justify-center">
            <div className="relative mx-auto flex w-full max-w-2xl rounded-full border border-[#b9d9eb]/60 bg-white/60 p-1.5 shadow-[0_10px_40px_rgba(122,152,175,0.10)] backdrop-blur-2xl">
              <motion.div
                layout
                aria-hidden
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
                className="pointer-events-none absolute inset-y-1.5 rounded-full border border-[#8eb6d3]/55 bg-gradient-to-b from-white/95 via-[#fafdff] to-[#eef7fc] shadow-[0_0_0_1px_rgba(255,255,255,0.65),0_8px_24px_rgba(122,152,175,0.15),0_0_36px_rgba(122,152,175,0.18)] backdrop-blur-xl"
                style={{
                  left: `calc(${
                    activeTab === "tickets" ? 0 : activeTab === "awards" ? 1 : 2
                  } * 33.333% + 6px)`,
                  width: "calc(33.333% - 8px)",
                }}
              >
                <span className="absolute inset-x-5 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-[#72a0c1]/90 to-transparent" />
                <span className="absolute inset-0 rounded-full bg-[#72a0c1]/5" />
                <span className="absolute inset-x-6 top-[2px] h-[40%] rounded-full bg-gradient-to-b from-white/70 to-transparent" />
              </motion.div>

              {(
                [
                  ["tickets", c.tabs.tickets],
                  ["awards", c.tabs.awards],
                  ["jury", c.tabs.jury],
                ] as const
              ).map(([tab, label]) => {
                const isActive = activeTab === tab;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    aria-pressed={isActive}
                    className={`relative z-10 min-w-0 flex-1 rounded-full px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-all duration-500 ${
                      isActive
                        ? "text-[#24394b]"
                        : "text-[var(--color-ink-soft)] hover:text-[#24394b]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        <div className="mt-10">
          <AnimatePresence mode="wait">
            {activeTab === "tickets" && (
              <motion.div
                key="tickets"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.32 }}
                className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]"
              >
                <InfoCard
                  icon={<Ticket size={21} />}
                  title={c.tickets.title}
                  price={c.tickets.price}
                  suffix={c.tickets.suffix}
                  description={c.tickets.description}
                  button={c.tickets.cta}
                  onButtonClick={() => setIsTicketModalOpen(true)}
                />

                <PricingCard title={c.tabs.tickets} rows={c.tickets.items} />
              </motion.div>
            )}

            {activeTab === "awards" && (
              <motion.div
                key="awards"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.32 }}
                className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]"
              >
                <InfoCard
                  icon={<Trophy size={21} />}
                  title={c.awards.title}
                  price={c.awards.price}
                  suffix={c.awards.suffix}
                  description={c.awards.description}
                  button={c.awards.cta}
                  href="/apply"
                />

                <div className="space-y-4">
                  <PricingCard
                    title={c.tabs.awards}
                    header={["", c.awards.member, c.awards.standard]}
                    rows={c.awards.rows}
                    featured
                  />

                  <AccentCard
                    icon={<Crown size={17} />}
                    title={c.awards.grandPrixTitle}
                    description={c.awards.grandPrixDescription}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "jury" && (
              <motion.div
                key="jury"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.32 }}
                className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]"
              >
                <InfoCard
                  icon={<Scale size={21} />}
                  title={c.jury.title}
                  price={c.jury.price}
                  description={c.jury.description}
                  button={c.jury.cta}
                  href="/jury"
                />

                <RequirementsCard
                  title="Requirements"
                  points={c.jury.points}
                  note={c.jury.note}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />
    </section>
  );
}

function InfoCard({
  icon,
  title,
  price,
  suffix,
  description,
  button,
  href,
  onButtonClick,
}: {
  icon: React.ReactNode;
  title: string;
  price: string;
  suffix?: string;
  description: string;
  button: string;
  href?: string;
  onButtonClick?: () => void;
}) {
  const buttonClass =
  "group/btn relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-full border border-[#72a0c1]/35 bg-white/70 px-6 py-3 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[#243845] shadow-[0_16px_40px_rgba(114,160,193,0.16)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[#72a0c1]/55 hover:bg-white/85";
  
  const buttonContent = (
    <>
      <ButtonLayers />

      <span className="relative z-10">{button}</span>

      <ArrowRight
        size={15}
        className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1"
      />
    </>
  );

  return (
    <div className="relative overflow-hidden rounded-[34px] border border-white/75 bg-white/62 p-7 shadow-[0_24px_80px_rgba(114,160,193,0.13)] backdrop-blur-2xl sm:p-8">
      <div className="absolute right-[-90px] top-[-110px] h-72 w-72 rounded-full bg-[#b9d9eb]/35 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.68)_58%,rgba(185,217,235,0.16)_100%)]" />

      <div className="relative z-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#b9d9eb]/45 bg-white/78 text-[#7a98af] shadow-[0_12px_28px_rgba(114,160,193,0.12)]">
          {icon}
        </div>

        <h3 className="mt-6 max-w-2xl font-(--font-display) text-[clamp(2.2rem,4vw,4.4rem)] leading-[0.9] tracking-[-0.045em] text-[#111827]">
          {title}
        </h3>

        <div className="mt-7 flex flex-wrap items-end gap-3">
          <div className="font-(--font-display) text-[clamp(3.4rem,7vw,5.8rem)] leading-[0.8] tracking-[-0.06em] text-[#111827]">
            {price}
          </div>

          {suffix && (
            <div className="pb-1 text-sm font-semibold uppercase tracking-[0.14em] text-[#7a98af]">
              {suffix}
            </div>
          )}
        </div>

        <p className="mt-6 max-w-xl text-base leading-7 text-[#5f6f7c]">
          {description}
        </p>

        <div className="mt-8">
          {onButtonClick ? (
            <button type="button" onClick={onButtonClick} className={buttonClass}>
              {buttonContent}
            </button>
          ) : (
            <Link href={href ?? "#"} className={buttonClass}>
              {buttonContent}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  title,
  rows,
  header,
  featured = false,
}: {
  title: string;
  rows: string[][];
  header?: string[];
  featured?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-[34px] border border-white/75 bg-white/60 p-5 shadow-[0_22px_70px_rgba(114,160,193,0.12)] backdrop-blur-2xl sm:p-6">
      <div className="absolute inset-0 bg-[linear-gradient(150deg,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.66)_52%,rgba(185,217,235,0.18)_100%)]" />
      <div className="absolute right-[-80px] top-[-100px] h-56 w-56 rounded-full bg-[#72a0c1]/14 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-4">
          <h4 className="font-(--font-display) text-3xl leading-none tracking-[-0.04em] text-[#111827]">
            {title}
          </h4>

          <div className="rounded-full border border-[#b9d9eb]/50 bg-white/70 px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.15em] text-[#7a98af]">
            Pricing
          </div>
        </div>

        {header && (
          <div className="mt-6 grid grid-cols-3 gap-2 border-b border-[#b9d9eb]/40 pb-3 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#7a98af]">
            {header.map((cell, index) => (
              <div
                key={`${cell}-${index}`}
                className={index > 0 ? "text-right" : ""}
              >
                {cell}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 space-y-2.5">
          {rows.map((row, rowIndex) => (
            <div
              key={`${row.join("-")}-${rowIndex}`}
              className={`group grid ${
                header ? "grid-cols-3" : "grid-cols-[1fr_auto]"
              } items-center gap-3 rounded-[22px] border border-[#b9d9eb]/28 bg-white/58 p-3.5 shadow-[0_10px_28px_rgba(114,160,193,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-[#72a0c1]/45 hover:bg-white/76 ${
                featured && rowIndex === rows.length - 1
                  ? "bg-[#f7fbfd]/82"
                  : ""
              }`}
            >
              {row.map((cell, cellIndex) => (
                <div
                  key={`${cell}-${cellIndex}`}
                  className={`text-sm text-[#27323a] ${
                    cellIndex === 0
                      ? "font-medium"
                      : "text-right font-semibold text-[#111827]"
                  }`}
                >
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RequirementsCard({
  title,
  points,
  note,
}: {
  title: string;
  points: string[];
  note: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[34px] border border-white/75 bg-white/60 p-6 shadow-[0_22px_70px_rgba(114,160,193,0.12)] backdrop-blur-2xl">
      <div className="absolute inset-0 bg-[linear-gradient(150deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.67)_56%,rgba(185,217,235,0.18)_100%)]" />
      <div className="absolute right-[-90px] top-[-100px] h-60 w-60 rounded-full bg-[#b9d9eb]/30 blur-3xl" />

      <div className="relative z-10">
        <h4 className="font-(--font-display) text-3xl leading-none tracking-[-0.04em] text-[#111827]">
          {title}
        </h4>

        <div className="mt-6 space-y-3">
          {points.map((point) => (
            <div
              key={point}
              className="flex gap-3 rounded-[22px] border border-[#b9d9eb]/28 bg-white/58 p-3.5 text-sm leading-6 text-[#27323a] shadow-[0_10px_28px_rgba(114,160,193,0.07)]"
            >
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7a98af] text-white">
                <Check size={12} strokeWidth={2.2} />
              </span>
              <span>{point}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[24px] border border-[#b9d9eb]/35 bg-[#f7fbfd]/78 p-4 text-sm leading-6 text-[#5f6f7c]">
          {note}
        </div>
      </div>
    </div>
  );
}

function AccentCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-[#b9d9eb]/38 bg-[#f7fbfd]/76 p-5 shadow-[0_18px_58px_rgba(114,160,193,0.1)] backdrop-blur-xl">
      <div className="absolute right-[-60px] top-[-70px] h-40 w-40 rounded-full bg-[#b9d9eb]/38 blur-3xl" />

      <div className="relative z-10 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/78 text-[#7a98af] shadow-[0_10px_24px_rgba(114,160,193,0.11)]">
          {icon}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#7a98af]" />
            <h4 className="font-semibold text-[#111827]">{title}</h4>
          </div>

          <p className="mt-2 text-sm leading-6 text-[#5f6f7c]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
