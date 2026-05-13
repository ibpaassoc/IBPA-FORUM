"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  FullBleedPhotoBreak,
} from "@/shared/components/public";


export default function GrandPrixPagePremium() {
  const { t } = useLanguage();
  
  return (
    <FullBleedPhotoBreak
      src="/images/events/DSC09821.jpg"
      alt="Grand Prix full-width event moment"
      eyebrow={t.grandPrixPage.copy.breakEyebrow}
      title={t.grandPrixPage.copy.breakTitle}
      objectPosition="center 30%"
      mobileObjectPosition="center 24%"
    />
  );
}
