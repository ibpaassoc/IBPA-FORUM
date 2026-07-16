"use client";

import { useMemo, useState } from "react";

import NominationCategoryAccordion from "@/features/applications/components/nomination-selection/NominationCategoryAccordion";
import { presentNominationCategories } from "@/features/applications/components/nomination-selection/nomination-presentation";
import type { CategoryOption } from "@/features/applications/types/application.types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { translations } from "@/lib/i18n/translations";

const continueCopy = {
  en: "Continue to application",
  ru: "Перейти к заявке",
  ua: "Перейти до заявки",
} as const;

export default function CategoriesFeatures({ categories }: { categories: CategoryOption[] }) {
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
      <div className="relative mx-auto max-w-[1180px]">
        <NominationCategoryAccordion
          categories={presentedCategories}
          openCategoryId={openCategoryId}
          onOpenCategoryChange={setOpenCategoryId}
          getAwardHref={(awardId) => `/apply?nomination=${encodeURIComponent(awardId)}`}
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
