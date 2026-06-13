"use client";

import { ClipboardCheck, CreditCard, FileText, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { StaggerContainer } from "@/shared/components/public";

const icons = [FileText, Search, ClipboardCheck, CreditCard];
const stepNumbers = ["01", "02", "03", "04"];

const introCopy = {
  en: {
    eyebrow: "How it works",
    title: "Four steps to your award entry",
    steps: [
      {
        title: "Choose nominations",
        text: "Open the category grid and select up to five nominations before uploading materials.",
      },
      {
        title: "Prepare portfolio",
        text: "Upload category-relevant media and supporting documents.",
      },
      {
        title: "Review details",
        text: "Confirm all fields and files before final submission.",
      },
      {
        title: "Complete fee",
        text: "Finalize participation through secure Stripe checkout.",
      },
    ],
  },
  ru: {
    eyebrow: "Как это работает",
    title: "Четыре шага к вашей заявке",
    steps: [
      {
        title: "Выберите номинации",
        text: "Откройте сетку категорий и выберите до пяти номинаций перед загрузкой материалов.",
      },
      {
        title: "Подготовьте портфолио",
        text: "Загрузите релевантные медиафайлы и подтверждающие документы.",
      },
      {
        title: "Проверьте детали",
        text: "Проверьте все поля и файлы перед финальной отправкой.",
      },
      {
        title: "Оплатите взнос",
        text: "Завершите участие через защищённый Stripe checkout.",
      },
    ],
  },
  ua: {
    eyebrow: "Як це працює",
    title: "Чотири кроки до вашої заявки",
    steps: [
      {
        title: "Оберіть номінації",
        text: "Відкрийте сітку категорій та оберіть до п'яти номінацій перед завантаженням матеріалів.",
      },
      {
        title: "Підготуйте портфоліо",
        text: "Завантажте релевантні медіафайли та підтвердні документи.",
      },
      {
        title: "Перевірте деталі",
        text: "Перевірте всі поля й файли перед фінальним надсиланням.",
      },
      {
        title: "Сплатіть внесок",
        text: "Завершіть участь через захищений Stripe checkout.",
      },
    ],
  },
} as const;

export default function ApplyPageIntro() {
  const { language } = useLanguage();
  const copy = introCopy[language] ?? introCopy.en;

  return (
    <div className="space-y-[var(--space-xl)]">
      <div className="max-w-2xl">
        <p className="page-eyebrow">{copy.eyebrow}</p>
        <h1 className="mt-[var(--space-sm)] font-[var(--font-title-family)] text-[clamp(2.2rem,4.5vw,3.6rem)] font-light leading-[1.06] text-[var(--color-ink)]">
          {copy.title}
        </h1>
      </div>

      <StaggerContainer
        className="grid gap-px overflow-hidden rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--border-default)] sm:grid-cols-2 xl:grid-cols-4"
        stagger={0.08}
      >
        {copy.steps.map((step, index) => {
          const Icon = icons[index];

          return (
            <article
              key={step.title}
              className="group flex h-full flex-col bg-[var(--surface)] p-[var(--space-lg)] transition-colors duration-300 hover:bg-[var(--surface-muted)]"
            >
              <p className="mb-[var(--space-md)] select-none font-[var(--font-ui-family)] text-[3rem] font-black leading-[1] tracking-[-0.06em] text-[var(--color-ink)]/6">
                {stepNumbers[index]}
              </p>
              <div className="mb-[var(--space-sm)] inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-muted)]">
                <Icon
                  size={18}
                  strokeWidth={1.5}
                  className="text-[var(--color-hover-accent)]"
                />
              </div>
              <h3 className="font-[var(--font-ui-family)] text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink)]">
                {step.title}
              </h3>
              <p className="mt-2 text-[0.88rem] leading-[1.72] text-[var(--color-ink-soft)]">
                {step.text}
              </p>
            </article>
          );
        })}
      </StaggerContainer>
    </div>
  );
}
