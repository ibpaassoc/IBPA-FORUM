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
        text: "Open the category grid and select nominations before uploading materials.",
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
        text: "Откройте сетку категорий и выберите номинации перед загрузкой материалов.",
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
        text: "Відкрийте сітку категорій та оберіть номінації перед завантаженням матеріалів.",
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
    <div className="space-y-10">
      <div className="max-w-3xl">
        <p className="page-eyebrow">{copy.eyebrow}</p>

        <h1 className="mt-4 font-[var(--font-title-family)] text-[clamp(2.45rem,5vw,4.65rem)] font-light leading-[0.95] tracking-[-0.065em] text-[var(--color-ink)]">
          {copy.title}
        </h1>
      </div>

      <StaggerContainer
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        stagger={0.08}
      >
        {copy.steps.map((step, index) => {
          const Icon = icons[index];

          return (
            <article
              key={step.title}
              className="group relative min-h-[230px] overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-[0_22px_70px_rgba(42,66,82,0.08)] backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:bg-white"
            >
              <p className="select-none font-[var(--font-title-family)] text-[4rem] font-light italic leading-none tracking-[-0.07em] text-[var(--color-ink)]/8">
                {stepNumbers[index]}
              </p>

              <div className="mt-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-blue)]/15 bg-[var(--color-blue-wash)] text-[var(--color-blue)] transition duration-500 group-hover:scale-105">
                <Icon size={18} strokeWidth={1.6} />
              </div>

              <h3 className="mt-5 font-[var(--font-title-family)] text-[1.45rem] font-light leading-[1] tracking-[-0.045em] text-[var(--color-ink)]">
                {step.title}
              </h3>

              <p className="mt-3 text-[0.9rem] leading-[1.7] text-[var(--color-ink-soft)]">
                {step.text}
              </p>
            </article>
          );
        })}
      </StaggerContainer>
    </div>
  );
}
