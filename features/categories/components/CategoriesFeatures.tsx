"use client";

import { useMemo, useState } from "react";

import NominationCategoryAccordion from "@/features/applications/components/nomination-selection/NominationCategoryAccordion";
import { presentNominationCategories } from "@/features/applications/components/nomination-selection/nomination-presentation";
import type { CategoryOption } from "@/features/applications/types/application.types";
import RegulationButton from "@/features/regulations/components/RegulationButton";
import type { RegulationButtonCopy } from "@/features/regulations/components/RegulationButton";
import type { PublicRegulations } from "@/features/regulations/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { translations } from "@/lib/i18n/translations";

const continueCopy = {
  en: "Continue to application",
  ru: "Перейти к заявке",
  ua: "Перейти до заявки",
} as const;

const generalRegulationsCopy = {
  en: "General regulations",
  ru: "Общий регламент",
  ua: "Загальний регламент",
} as const;

const regulationCopy: Record<"en" | "ru" | "ua", RegulationButtonCopy> = {
  en: {
    regulations: "Regulations",
    view: "View",
    download: "Download",
    noAvailable: "No regulations available yet.",
    loading: "Loading PDF…",
    error: "The PDF could not be loaded. Please try again.",
    close: "Close",
    russianFallback: "The Russian version is shown because this language is not available yet.",
  },
  ru: {
    regulations: "Регламент",
    view: "Просмотреть",
    download: "Скачать",
    noAvailable: "Регламент пока недоступен.",
    loading: "Загрузка PDF…",
    error: "Не удалось загрузить PDF. Попробуйте ещё раз.",
    close: "Закрыть",
    russianFallback: "Показана русская версия, потому что документ на выбранном языке пока недоступен.",
  },
  ua: {
    regulations: "Регламент",
    view: "Переглянути",
    download: "Завантажити",
    noAvailable: "Регламент поки недоступний.",
    loading: "Завантаження PDF…",
    error: "Не вдалося завантажити PDF. Спробуйте ще раз.",
    close: "Закрити",
    russianFallback: "Показано російську версію, оскільки документ обраною мовою поки недоступний.",
  },
};

export default function CategoriesFeatures({
  categories,
  regulations,
}: {
  categories: CategoryOption[];
  regulations: PublicRegulations;
}) {
  const { language, t } = useLanguage();
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const presentedCategories = useMemo(
    () =>
      presentNominationCategories(
        categories,
        translations.en.categoriesPage.directions,
        t.categoriesPage.directions,
      ),
    [categories, t.categoriesPage.directions],
  );

  return (
    <section
      id="categories"
      className="relative mt-[clamp(3rem,7vw,7rem)] overflow-hidden px-[var(--page-gutter)] pb-10 pt-3 sm:pb-14 sm:pt-4"
    >
      <div className="pointer-events-none absolute left-1/2 top-20 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[rgba(185,217,235,0.16)] blur-3xl" />
      <div className="relative mx-auto flex max-w-[1180px] flex-col gap-3 sm:gap-4">
        <RegulationButton
          regulationKey="general"
          availability={regulations.general}
          language={language}
          title={generalRegulationsCopy[language]}
          variant="general"
          copy={{
            ...regulationCopy[language],
            regulations: generalRegulationsCopy[language],
          }}
        />
        <NominationCategoryAccordion
          categories={presentedCategories}
          openCategoryId={openCategoryId}
          onOpenCategoryChange={setOpenCategoryId}
          regulationsByCategory={regulations.categories}
          regulationLanguage={language}
          regulationCopy={regulationCopy[language]}
          getAwardHref={() => "/account/login"}
          copy={{
            nominationSingular: t.categoriesPage.copy.nominationSingular,
            nominationPlural: t.categoriesPage.copy.nominationPlural,
            selected: "",
            continueToApplication: continueCopy[language],
          }}
        />
      </div>
    </section>
  );
}
