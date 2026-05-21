"use client";

import {
  CTASection,
  PageHero,
  PageSection,
} from "@/shared/components/public";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function UnderDevelopmentPage() {
  const { language } = useLanguage();
  const copy = {
    en: {
      eyebrow: "In Progress",
      title: "This section is under development",
      description: "We are still refining this part of the IBPA Beauty Award website.",
      body: "Check back soon for updated details and finalized content.",
      ctaTitle: "Explore active award pages",
      ctaDescription: "You can continue with categories, jury, applications, and Grand Prix sections.",
      backHome: "Back Home",
      viewCategories: "View Categories",
    },
    ru: {
      eyebrow: "В процессе",
      title: "Этот раздел находится в разработке",
      description: "Мы продолжаем дорабатывать эту часть сайта IBPA Beauty Award.",
      body: "Скоро здесь появятся обновленные детали и финальный контент.",
      ctaTitle: "Перейти к активным страницам премии",
      ctaDescription: "Вы можете продолжить с разделами категорий, жюри, заявок и Гран-при.",
      backHome: "На главную",
      viewCategories: "Смотреть категории",
    },
    ua: {
      eyebrow: "У процесі",
      title: "Цей розділ у розробці",
      description: "Ми продовжуємо вдосконалювати цю частину сайту IBPA Beauty Award.",
      body: "Незабаром тут з’являться оновлені деталі та фінальний контент.",
      ctaTitle: "Перейти до активних сторінок премії",
      ctaDescription: "Ви можете продовжити з розділами категорій, журі, заявок і Гран-прі.",
      backHome: "На головну",
      viewCategories: "Переглянути категорії",
    },
  }[language];

  return (
    <main className="page-shell">
      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />
      <PageSection>
        <div className="page-card rounded-(--radius-lg) p-8">
          <p className="text-sm leading-7 text-[var(--color-ink-soft)]">
            {copy.body}
          </p>
        </div>
      </PageSection>
      <CTASection
        title={copy.ctaTitle}
        description={copy.ctaDescription}
        primary={{ href: "/", label: copy.backHome }}
        secondary={{ href: "/categories", label: copy.viewCategories }}
      />
    </main>
  );
}
