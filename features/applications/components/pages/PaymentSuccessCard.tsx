"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Users, Trophy } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const copy = {
  en: {
    eyebrow: "Application Confirmed",
    headline: "You're in.",
    sub: "Your entry has been received and registered with the IBPA Beauty Award 2026. Payment confirmed.",
    nextLabel: "What happens next",
    steps: [
      {
        icon: Mail,
        title: "Check your inbox",
        body: "A confirmation email is on its way with your application reference and full details.",
      },
      {
        icon: Users,
        title: "Jury evaluation",
        body: "Your submission enters the official review stage. The international IBPA jury evaluates every entry between August 5–20.",
      },
      {
        icon: Trophy,
        title: "Award ceremony",
        body: "Finalists and winners are announced at the IBPA Ceremony on September 4–5, 2026.",
      },
    ],
    cta: "Back to Home",
    ctaSub: "Explore categories →",
  },
  ru: {
    eyebrow: "Заявка подтверждена",
    headline: "Вы участвуете.",
    sub: "Ваша заявка получена и зарегистрирована на IBPA Beauty Award 2026. Оплата подтверждена.",
    nextLabel: "Что будет дальше",
    steps: [
      {
        icon: Mail,
        title: "Проверьте почту",
        body: "На ваш email отправлено письмо с номером заявки и всеми подробностями.",
      },
      {
        icon: Users,
        title: "Оценка жюри",
        body: "Ваша работа поступает на официальный этап проверки. Международное жюри IBPA оценивает все заявки с 5 по 20 августа.",
      },
      {
        icon: Trophy,
        title: "Церемония награждения",
        body: "Финалисты и победители объявляются на церемонии IBPA 4–5 сентября 2026 года.",
      },
    ],
    cta: "На главную",
    ctaSub: "Смотреть категории →",
  },
  ua: {
    eyebrow: "Заявку підтверджено",
    headline: "Ви берете участь.",
    sub: "Вашу заявку отримано та зареєстровано на IBPA Beauty Award 2026. Оплату підтверджено.",
    nextLabel: "Що буде далі",
    steps: [
      {
        icon: Mail,
        title: "Перевірте пошту",
        body: "На вашу електронну адресу надіслано лист із номером заявки та всіма деталями.",
      },
      {
        icon: Users,
        title: "Оцінювання журі",
        body: "Ваша робота переходить до офіційного етапу розгляду. Міжнародне журі IBPA оцінює всі заявки з 5 по 20 серпня.",
      },
      {
        icon: Trophy,
        title: "Церемонія нагородження",
        body: "Фіналістів і переможців оголошують на церемонії IBPA 4–5 вересня 2026 року.",
      },
    ],
    cta: "На головну",
    ctaSub: "Переглянути категорії →",
  },
};

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.54, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function PaymentSuccessCard({ sessionId: _sessionId }: { sessionId?: string }) {
  const { language } = useLanguage();
  const t = copy[language] ?? copy.en;

  return (
    <main className="page-shell">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-[var(--color-blue-light)] bg-[var(--color-blue-wash)] px-[var(--page-gutter)] pb-20 pt-[calc(var(--site-header-height)+4rem)]">
        {/* Subtle grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-blue) 1px, transparent 1px), linear-gradient(90deg, var(--color-blue) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto max-w-[--content-width]">
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 flex h-16 w-16 items-center justify-center rounded-[22px] border border-[var(--color-blue)]/30 bg-white shadow-[var(--shadow-sm)]"
          >
            {/* Animated check */}
            <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
              <motion.path
                d="M6 16.5L13 23.5L26 9"
                stroke="var(--color-blue)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
              />
            </svg>
          </motion.div>

          <motion.p
            custom={0}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mb-4 text-[0.65rem] font-bold uppercase tracking-[0.32em] text-[var(--color-blue)]"
          >
            {t.eyebrow}
          </motion.p>

          <motion.h1
            custom={1}
            variants={fade}
            initial="hidden"
            animate="show"
            className="font-[var(--font-title-family)] text-[clamp(3rem,8vw,6rem)] font-light leading-[0.96] tracking-[-0.03em] text-[var(--color-ink)]"
          >
            {t.headline}
          </motion.h1>

          <motion.p
            custom={2}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-xl text-[1.05rem] leading-[1.75] text-[var(--color-ink-soft)]"
          >
            {t.sub}
          </motion.p>
        </div>
      </section>

      {/* ── What happens next ── */}
      <section className="px-[var(--page-gutter)] py-20">
        <div className="mx-auto max-w-[--content-width]">
          <motion.p
            custom={3}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mb-12 text-[0.65rem] font-bold uppercase tracking-[0.32em] text-[var(--color-ink-soft)]"
          >
            {t.nextLabel}
          </motion.p>

          <div className="grid gap-px overflow-hidden rounded-[28px] border border-black/8 bg-black/6 sm:grid-cols-3">
            {t.steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  custom={i + 4}
                  variants={fade}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col gap-5 bg-[var(--color-off-white)] p-8"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-black/8 bg-white shadow-[0_8px_20px_rgba(3,2,19,0.05)]">
                    <Icon size={18} strokeWidth={1.6} className="text-[var(--color-ink)]" />
                  </div>

                  <div>
                    <p className="mb-1 text-[0.6rem] font-bold uppercase tracking-[0.26em] text-[var(--color-ink-soft)]">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h2 className="font-[var(--font-title-family)] text-[clamp(1.1rem,1.6vw,1.35rem)] font-light leading-[1.1] text-[var(--color-ink)]">
                      {step.title}
                    </h2>
                    <p className="mt-3 text-[0.9rem] leading-[1.75] text-[var(--color-ink-soft)]">
                      {step.body}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA row */}
          <motion.div
            custom={7}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-14 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-ink)] bg-[var(--color-ink)] px-8 py-3.5 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-white shadow-[0_18px_36px_rgba(3,2,19,0.14)] transition-all duration-300 hover:bg-white hover:text-[var(--color-ink)]"
            >
              {t.cta}
            </Link>
            <Link
              href="/categories"
              className="text-[0.78rem] font-semibold tracking-[0.06em] text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]"
            >
              {t.ctaSub}
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
