"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageCard } from "@/shared/components/layout/PageShell";

const cardsCopy = {
  en: {
    eligibility: "Eligibility & Important Notes",
    feeHtml: "Participation fee: <strong>$50 per nomination</strong>.",
    separate:
      "You can select up to five nominations in one flow. The active nomination controls the category-specific requirements shown in the form.",
    juryNote: "Jury fee rules do not apply to this participant application page.",
    before: "Before You Start",
    items: [
      "Prepare your license or certification file.",
      "Choose up to five nominations from the category grid.",
      "Gather all portfolio and supporting files for the active nomination.",
      "Review your portfolio files before uploading.",
    ],
  },
  ru: {
    eligibility: "Право на участие и важные примечания",
    feeHtml: "Взнос за участие: <strong>$50 за номинацию</strong>.",
    separate:
      "Вы можете выбрать до пяти номинаций в одном потоке. Активная номинация управляет требованиями категории в форме.",
    juryNote: "Правила оплаты для жюри не относятся к этой странице заявки участника.",
    before: "Перед началом",
    items: [
      "Подготовьте файл лицензии или сертификата.",
      "Выберите до пяти номинаций в сетке категорий.",
      "Соберите портфолио и дополнительные файлы для активной номинации.",
      "Проверьте файлы портфолио перед загрузкой.",
    ],
  },
  ua: {
    eligibility: "Право на участь і важливі примітки",
    feeHtml: "Внесок за участь: <strong>$50 за номінацію</strong>.",
    separate:
      "Ви можете обрати до п'яти номінацій в одному потоці. Активна номінація керує вимогами категорії у формі.",
    juryNote: "Правила оплати для журі не застосовуються до цієї сторінки заявки учасника.",
    before: "Перед початком",
    items: [
      "Підготуйте файл ліцензії або сертифіката.",
      "Оберіть до п'яти номінацій у сітці категорій.",
      "Зберіть портфоліо та додаткові файли для активної номінації.",
      "Перевірте файли портфоліо перед завантаженням.",
    ],
  },
} as const;

export default function ApplyIntroCards() {
  const { language } = useLanguage();
  const copy = cardsCopy[language] ?? cardsCopy.en;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <PageCard className="rounded-[1.8rem] p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-hover-accent)]">
          {copy.eligibility}
        </p>
        <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--color-ink-soft)]">
          <p dangerouslySetInnerHTML={{ __html: copy.feeHtml }} />
          <p>{copy.separate}</p>
          <p>{copy.juryNote}</p>
        </div>
      </PageCard>

      <PageCard className="rounded-[1.8rem] p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-hover-accent)]">
          {copy.before}
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {copy.items.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-[var(--border-default)] bg-[var(--color-off-white)] p-4 text-sm leading-6 text-[var(--color-ink)]"
            >
              {item}
            </div>
          ))}
        </div>
      </PageCard>
    </div>
  );
}
