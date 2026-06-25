"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { HeroPrimaryButton, LandingSecondaryButton } from "@/shared/components/public";

export default function ApplyHero({
  heroStats,
}: {
  heroStats: Array<{ label: string; value: string }>;
}) {
  const { language } = useLanguage();

  const copy = {
    en: {
      eyebrow: "Participant Applications",
      title: "Submit your award entry.",
      description:
        "Official IBPA Beauty Award 2026 participant applications. Submit your portfolio, select your nominations, and be evaluated by the international jury.",
      cta: "Start application",
      juryLink: "Apply as a judge instead",
    },
    ru: {
      eyebrow: "Заявки участников",
      title: "Подайте заявку на премию.",
      description:
        "Официальные заявки на IBPA Beauty Award 2026. Отправьте портфолио, выберите номинации и пройдите оценку международного жюри.",
      cta: "Начать заявку",
      juryLink: "Подать заявку как судья",
    },
    ua: {
      eyebrow: "Заявки учасників",
      title: "Подайте заявку на премію.",
      description:
        "Офіційні заявки на IBPA Beauty Award 2026. Надішліть портфоліо, оберіть номінації та пройдіть оцінювання міжнародного журі.",
      cta: "Розпочати заявку",
      juryLink: "Подати заявку як суддя",
    },
  }[language];

  return (
    <section className="landing-photo-section relative flex min-h-[clamp(640px,78vh,860px)] items-end overflow-hidden bg-white">
      <Image
        src="/images/winners.png"
        alt=""
        fill
        priority
        className="object-cover object-[58%_18%]"
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.92)_34%,rgba(255,255,255,0.48)_62%,rgba(255,255,255,0.18)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_28%,rgba(185,217,235,0.46),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.92)_100%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[var(--content-width)] px-[var(--page-gutter)] pb-[clamp(56px,8vw,96px)] pt-[clamp(120px,16vh,160px)]">
        <div className="max-w-2xl">
          <p className="page-eyebrow">{copy.eyebrow}</p>

          <h1 className="mt-5 max-w-[11ch] font-[var(--font-title-family)] text-[clamp(3rem,7vw,6.65rem)] font-light leading-[0.9] tracking-[-0.075em] text-[var(--color-ink)]">
            {copy.title}
          </h1>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-[var(--color-ink-soft)] shadow-[0_14px_40px_rgba(42,66,82,0.08)] backdrop-blur-xl"
              >
                {item.label}
                <span className="ml-2 font-semibold text-[var(--color-ink)]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <HeroPrimaryButton href="#apply-form" >{ copy.cta }</HeroPrimaryButton>
            
            <LandingSecondaryButton href="/apply/jury">{ copy.juryLink }</LandingSecondaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}
