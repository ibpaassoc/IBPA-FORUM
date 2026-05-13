"use client";

import Link from "next/link";
import {
  Award,
  Calendar,
  Medal,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  EditorialHero,
  EditorialPhotoCard,
  FullBleedPhotoBreak,
  IconBadge,
  PremiumCTA,
  ProcessTimeline,
  SectionHeading,
  StaggerContainer,
} from "@/shared/components/public";

export default function GrandPrixPagePremium() {
  const { language, t } = useLanguage();
  const copy = {
    en: {
      apply: "Apply to Compete",
      reviewDirections: "Review Directions",
      mediaTitle: "Compete Across Directions",
      mediaDescription: "Nomination begins when your footprint expands across directions.",
      rule: "Grand Prix Rule",
      selectionTitle: "Nomination, judging, and final award decision",
      timelineEyebrow: "Timeline Highlights",
      timelineTitle: "Designed for clarity at each award stage",
      timelineDescription: "Visual emphasis across nomination, review, and award presentation.",
      appWindow: "Application window",
      appWindowText: "Participants submit direction entries within official campaign dates.",
      scorePeriod: "Panel scoring period",
      scorePeriodText: "Judges evaluate entries and finalize direction-level scores.",
      reveal: "Grand reveal",
      revealText: "Finalists and the Grand Prix winner are announced at the ceremony.",
      breakEyebrow: "Grand Prix Atmosphere",
      breakTitle: "A final stage built for standout multi-direction performance.",
      breakText: "A premium award environment where cumulative excellence is visibly recognized.",
      ctaEyebrow: "Grand Prix Entry",
      ctaTitle: "Build your path to the highest distinction.",
      ctaText: "Enter multiple directions, elevate your profile, and compete for IBPA's top honor.",
      startEntry: "Start Entry",
      viewDirections: "View Directions",
      strategy: "Multi-direction strategy matters.",
      fiveDirections: "5+ Directions",
      qualificationRule: "Qualification is based on participation in 5 or more directions.",
      decision: "Award Decision",
    },
    ru: {
      apply: "Подать заявку на участие",
      reviewDirections: "Смотреть направления",
      mediaTitle: "Соревнуйтесь по нескольким направлениям",
      mediaDescription: "Номинация начинается, когда вы выступаете в нескольких направлениях.",
      rule: "Правило Гран-при",
      selectionTitle: "Номинация, судейство и итоговое решение премии",
      timelineEyebrow: "Ключевые этапы",
      timelineTitle: "Понятная логика на каждом этапе премии",
      timelineDescription: "Акцент на номинации, оценивании и финальной презентации премии.",
      appWindow: "Период подачи заявок",
      appWindowText: "Участники подают заявки по направлениям в официальные сроки кампании.",
      scorePeriod: "Период оценивания",
      scorePeriodText: "Жюри оценивает заявки и фиксирует баллы по каждому направлению.",
      reveal: "Финальное объявление",
      revealText: "Финалисты и победитель Гран-при объявляются на церемонии.",
      breakEyebrow: "Атмосфера Гран-при",
      breakTitle: "Финальная сцена для сильного результата в нескольких направлениях.",
      breakText: "Премиальная среда, где суммарное мастерство получает заметное признание.",
      ctaEyebrow: "Участие в Гран-при",
      ctaTitle: "Постройте путь к высшей награде.",
      ctaText: "Выступайте в нескольких направлениях, усиливайте профиль и боритесь за главный титул IBPA.",
      startEntry: "Начать подачу",
      viewDirections: "Смотреть направления",
      strategy: "Стратегия нескольких направлений имеет значение.",
      fiveDirections: "5+ направлений",
      qualificationRule: "Квалификация основана на участии в 5 и более направлениях.",
      decision: "Решение премии",
    },
    ua: {
      apply: "Подати заявку на участь",
      reviewDirections: "Переглянути напрямки",
      mediaTitle: "Змагайтеся у кількох напрямках",
      mediaDescription: "Номінація починається, коли ви виступаєте в кількох напрямках.",
      rule: "Правило Гран-прі",
      selectionTitle: "Номінація, суддівство та фінальне рішення премії",
      timelineEyebrow: "Ключові етапи",
      timelineTitle: "Зрозуміла логіка на кожному етапі премії",
      timelineDescription: "Акцент на номінації, оцінюванні та фінальній презентації премії.",
      appWindow: "Період подання заявок",
      appWindowText: "Учасники подають заявки за напрямками в офіційні строки кампанії.",
      scorePeriod: "Період оцінювання",
      scorePeriodText: "Журі оцінює заявки та фіксує бали за кожним напрямком.",
      reveal: "Фінальне оголошення",
      revealText: "Фіналісти та переможець Гран-прі оголошуються на церемонії.",
      breakEyebrow: "Атмосфера Гран-прі",
      breakTitle: "Фінальна сцена для сильного результату в кількох напрямках.",
      breakText: "Преміальне середовище, де сумарна майстерність отримує помітне визнання.",
      ctaEyebrow: "Участь у Гран-прі",
      ctaTitle: "Побудуйте шлях до найвищої відзнаки.",
      ctaText: "Виступайте у кількох напрямках, посилюйте профіль і змагайтеся за головний титул IBPA.",
      startEntry: "Почати подання",
      viewDirections: "Переглянути напрямки",
      strategy: "Стратегія кількох напрямків має значення.",
      fiveDirections: "5+ напрямків",
      qualificationRule: "Кваліфікація базується на участі у 5 і більше напрямках.",
      decision: "Рішення премії",
    },
  }[language];

  return (
    <main className="page-shell">
      <EditorialHero
        eyebrow={t.grandPrixPage.hero.eyebrow}
        title={t.grandPrixPage.hero.title}
        description={t.grandPrixPage.hero.description}
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/apply" className="ibpa-button ibpa-button-primary">
              {copy.apply}
            </Link>
            <Link href="/directions" className="ibpa-button ibpa-button-ghost">
              {copy.reviewDirections}
            </Link>
          </div>
        }
        media={
          <div className="grid gap-[var(--space-md)]">
            <EditorialPhotoCard
              src="/images/curated/grandprix_editorial.jpg"
              alt="Grand Prix cinematic hero image"
              aspect="landscape"
              overlay="soft"
              title={copy.mediaTitle}
              description={copy.mediaDescription}
              priority
            />
            <div className="grid gap-[var(--space-md)] md:grid-cols-2">
              <EditorialPhotoCard
                src="/images/events/DSC00551.jpg"
                alt="Grand Prix nominee backstage moment"
                aspect="square"
                overlay="soft"
              />
              <EditorialPhotoCard
                src="/images/events/DSC09818.jpg"
                alt="Grand Prix finalist portrait"
                aspect="square"
                overlay="soft"
              />
            </div>
          </div>
        }
        floatingCard={
          <article className="page-card rounded-[var(--radius)] p-[var(--space-md)]">
            <p className="text-[0.66rem] uppercase tracking-[0.2em] text-[var(--color-hover)]">{copy.rule}</p>
            <p className="mt-1 font-[var(--font-title-family)] text-[clamp(1.55rem,2vw,2.1rem)] leading-[1.1] text-[var(--color-ink)]">
              {copy.fiveDirections}
            </p>
            <p className="mt-2 text-sm leading-[1.7] text-[var(--color-ink-soft)]">{copy.qualificationRule}</p>
          </article>
        }
      />

      <ProcessTimeline
        eyebrow={t.grandPrixPage.flow.label}
        title={copy.selectionTitle}
        description={t.grandPrixPage.hero.body}
        steps={t.grandPrixPage.flow.steps.map((step, index) => ({
          id: step.number,
          title: step.title,
          text: step.text,
          icon: <IconBadge icon={[Medal, Users, Trophy, Award][index % 4]} />,
        }))}
      />

      <section className="section-rhythm-tight">
        <div className="page-section">
          <SectionHeading
            eyebrow={copy.timelineEyebrow}
            title={copy.timelineTitle}
            description={copy.timelineDescription}
          />
          <StaggerContainer className="mt-[var(--space-lg)] grid gap-[var(--space-md)] md:grid-cols-3">
            {[
              {
                icon: Calendar,
                title: copy.appWindow,
                text: copy.appWindowText,
              },
              {
                icon: Star,
                title: copy.scorePeriod,
                text: copy.scorePeriodText,
              },
              {
                icon: Sparkles,
                title: copy.reveal,
                text: copy.revealText,
              },
            ].map((item) => (
              <article key={item.title} className="page-card rounded-[var(--radius)] p-[var(--space-lg)]">
                <IconBadge icon={item.icon} />
                <h3 className="mt-[var(--space-sm)] text-[clamp(1.2rem,2vw,1.6rem)] leading-[1.2] text-[var(--color-ink)]">
                  {item.title}
                </h3>
                <p className="mt-[var(--space-xs)] text-sm leading-[1.75] text-[var(--color-ink-soft)]">{item.text}</p>
              </article>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <FullBleedPhotoBreak
        src="/images/events/DSC09821.jpg"
        alt="Grand Prix full-width event moment"
        eyebrow={copy.breakEyebrow}
        title={copy.breakTitle}
        description={copy.breakText}
      />

      <PremiumCTA
        eyebrow={copy.ctaEyebrow}
        title={copy.ctaTitle}
        description={copy.ctaText}
        primary={{ href: "/apply", label: copy.startEntry }}
        secondary={{ href: "/directions", label: copy.viewDirections }}
        aside={
          <div className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
            <IconBadge icon={Award} size={20} />
            {copy.strategy}
          </div>
        }
      />
    </main>
  );
}
