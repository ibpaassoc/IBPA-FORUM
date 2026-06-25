"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { FaqAccordion } from "@/shared/components/public";

export default function JuryFaq() {
  const { t } = useLanguage();
  const faq = t.juryPage.faq;

  return (
    <FaqAccordion
      eyebrow={faq.label}
      title={faq.title}
      items={faq.items}
      surface="blue-tint"
    />
  );
}
