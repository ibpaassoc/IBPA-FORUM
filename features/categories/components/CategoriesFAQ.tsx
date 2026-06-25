"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { FaqAccordion } from "@/shared/components/public";

export default function CategoriesFAQ() {
  const { t } = useLanguage();
  const c = t.categoriesPage.faq;

  return <FaqAccordion eyebrow={c.eyebrow} title={c.title} items={c.items} />;
}
